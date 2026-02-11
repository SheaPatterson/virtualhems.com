"""VirtualHEMS Professional Backend - FastAPI + AWS Integration"""
import os
import json
import uuid
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

import boto3
from boto3.dynamodb.conditions import Key, Attr
from botocore.exceptions import ClientError
from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, EmailStr
import jwt
from jwt import PyJWKClient

# AWS Configuration
AWS_REGION = os.environ.get('AWS_REGION', 'us-east-1')

# Load AWS config if available
config_path = os.path.join(os.path.dirname(__file__), 'aws_config.json')
if os.path.exists(config_path):
    with open(config_path) as f:
        AWS_CONFIG = json.load(f)
else:
    AWS_CONFIG = {
        'user_pool_id': os.environ.get('COGNITO_USER_POOL_ID', ''),
        'user_pool_client_id': os.environ.get('COGNITO_CLIENT_ID', ''),
        's3_bucket': os.environ.get('S3_BUCKET', ''),
    }

# AWS Clients
cognito = boto3.client('cognito-idp', region_name=AWS_REGION)
dynamodb = boto3.resource('dynamodb', region_name=AWS_REGION)
s3 = boto3.client('s3', region_name=AWS_REGION)
bedrock = boto3.client('bedrock-runtime', region_name=AWS_REGION)
polly = boto3.client('polly', region_name=AWS_REGION)

# DynamoDB Tables
def get_table(name: str):
    return dynamodb.Table(f'VirtualHEMS_{name}')

# Pydantic Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserProfile(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    simulators: Optional[str] = None
    experience: Optional[str] = None
    social_links: Optional[Dict[str, str]] = None
    email_public: Optional[str] = None

class AdminUserUpdate(BaseModel):
    user_id: str
    profile_updates: UserProfile
    role_changes: Optional[Dict[str, bool]] = None  # {'admin': True/False}

class MissionCreate(BaseModel):
    callsign: str
    mission_type: str = "Scene Call"
    hems_base: Dict[str, Any]
    helicopter: Dict[str, Any]
    crew: List[Dict[str, Any]] = []
    origin: Dict[str, Any]
    pickup: Dict[str, Any]
    destination: Dict[str, Any]
    patient_age: Optional[int] = None
    patient_gender: Optional[str] = None
    patient_weight_lbs: Optional[int] = None
    patient_details: Optional[str] = None
    waypoints: List[Dict[str, Any]] = []

class TelemetryUpdate(BaseModel):
    mission_id: str
    latitude: float
    longitude: float
    altitude_ft: Optional[float] = 0
    ground_speed_kts: Optional[float] = 0
    heading_deg: Optional[float] = 0
    vertical_speed_ftmin: Optional[float] = 0
    fuel_remaining_lbs: Optional[float] = 0
    time_enroute_minutes: Optional[float] = 0
    phase: Optional[str] = 'Dispatch'
    engine_status: Optional[str] = 'Running'

class AIDispatchRequest(BaseModel):
    mission_id: str
    message: str

class ATCRequest(BaseModel):
    mission_id: str
    message: str
    controller_type: str  # tower, approach, departure, center, ground
    airport_code: Optional[str] = None
    frequency: Optional[str] = None

# JWT Verification
async def verify_token(authorization: str = Header(None)) -> Dict:
    """Verify Cognito JWT token"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    try:
        token = authorization.replace('Bearer ', '')
        
        # Get JWKS URL for Cognito
        user_pool_id = AWS_CONFIG.get('user_pool_id', '')
        if not user_pool_id:
            # Fallback: decode without verification for development
            payload = jwt.decode(token, options={"verify_signature": False})
            return payload
        
        jwks_url = f"https://cognito-idp.{AWS_REGION}.amazonaws.com/{user_pool_id}/.well-known/jwks.json"
        jwks_client = PyJWKClient(jwks_url)
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            audience=AWS_CONFIG.get('user_pool_client_id'),
            issuer=f"https://cognito-idp.{AWS_REGION}.amazonaws.com/{user_pool_id}"
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

# Lifespan for startup/shutdown
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("VirtualHEMS Backend Starting...")
    print(f"AWS Region: {AWS_REGION}")
    print(f"Config loaded: {bool(AWS_CONFIG.get('user_pool_id'))}")
    yield
    print("VirtualHEMS Backend Shutting Down...")

# FastAPI App
app = FastAPI(
    title="VirtualHEMS Professional API",
    description="Professional HEMS Flight Simulation Platform",
    version="6.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============ AUTH ENDPOINTS ============

@app.post("/api/auth/register")
async def register_user(user: UserRegister):
    """Register a new user with Cognito"""
    try:
        user_pool_id = AWS_CONFIG.get('user_pool_id')
        client_id = AWS_CONFIG.get('user_pool_client_id')
        
        if not user_pool_id or not client_id:
            raise HTTPException(status_code=500, detail="AWS Cognito not configured")
        
        # Create user in Cognito
        response = cognito.sign_up(
            ClientId=client_id,
            Username=user.email,
            Password=user.password,
            UserAttributes=[
                {'Name': 'email', 'Value': user.email},
                {'Name': 'name', 'Value': f"{user.first_name} {user.last_name}"}
            ]
        )
        
        user_sub = response['UserSub']
        
        # Create profile in DynamoDB
        users_table = get_table('Users')
        api_key = str(uuid.uuid4())
        
        users_table.put_item(Item={
            'user_id': user_sub,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'avatar_url': None,
            'api_key': api_key,
            'is_admin': False,
            'is_subscribed': True,  # Free access for all
            'created_at': datetime.now(timezone.utc).isoformat(),
            'updated_at': datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "success": True,
            "message": "Registration successful. Please check your email to verify your account.",
            "user_id": user_sub
        }
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'UsernameExistsException':
            raise HTTPException(status_code=400, detail="Email already registered")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/login")
async def login_user(credentials: UserLogin):
    """Authenticate user with Cognito"""
    try:
        client_id = AWS_CONFIG.get('user_pool_client_id')
        
        if not client_id:
            raise HTTPException(status_code=500, detail="AWS Cognito not configured")
        
        response = cognito.initiate_auth(
            ClientId=client_id,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': credentials.email,
                'PASSWORD': credentials.password
            }
        )
        
        auth_result = response['AuthenticationResult']
        
        return {
            "success": True,
            "access_token": auth_result['AccessToken'],
            "id_token": auth_result['IdToken'],
            "refresh_token": auth_result['RefreshToken'],
            "expires_in": auth_result['ExpiresIn']
        }
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == 'NotAuthorizedException':
            raise HTTPException(status_code=401, detail="Invalid credentials")
        if error_code == 'UserNotConfirmedException':
            raise HTTPException(status_code=401, detail="Please verify your email first")
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/auth/refresh")
async def refresh_token(refresh_token: str):
    """Refresh access token"""
    try:
        client_id = AWS_CONFIG.get('user_pool_client_id')
        
        response = cognito.initiate_auth(
            ClientId=client_id,
            AuthFlow='REFRESH_TOKEN_AUTH',
            AuthParameters={'REFRESH_TOKEN': refresh_token}
        )
        
        auth_result = response['AuthenticationResult']
        
        return {
            "access_token": auth_result['AccessToken'],
            "id_token": auth_result['IdToken'],
            "expires_in": auth_result['ExpiresIn']
        }
    except ClientError as e:
        raise HTTPException(status_code=401, detail="Token refresh failed")

@app.get("/api/auth/me")
async def get_current_user(token_data: Dict = Depends(verify_token)):
    """Get current user profile"""
    user_id = token_data.get('sub')
    
    users_table = get_table('Users')
    response = users_table.get_item(Key={'user_id': user_id})
    
    if 'Item' not in response:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    user = response['Item']
    # Don't expose sensitive fields
    user.pop('api_key', None)
    
    return {"user": user}

# ============ PROFILE ENDPOINTS ============

@app.get("/api/profiles")
async def get_all_profiles(token_data: Dict = Depends(verify_token)):
    """Get all user profiles (for pilot directory)"""
    users_table = get_table('Users')
    response = users_table.scan(
        ProjectionExpression='user_id, first_name, last_name, avatar_url, #loc, bio, simulators, experience, social_links, email_public, updated_at',
        ExpressionAttributeNames={'#loc': 'location'}
    )
    
    return {"profiles": response.get('Items', [])}

@app.get("/api/profiles/{user_id}")
async def get_user_profile(user_id: str, token_data: Dict = Depends(verify_token)):
    """Get specific user profile (admin only)"""
    # Check if requester is admin (simplified check)
    requester_id = token_data.get('sub')
    if requester_id != user_id:
        # In production, check admin role here
        pass
    
    users_table = get_table('Users')
    response = users_table.get_item(Key={'user_id': user_id})
    
    if 'Item' not in response:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    return {"profile": response['Item']}

@app.put("/api/profiles/me")
async def update_profile(profile: UserProfile, token_data: Dict = Depends(verify_token)):
    """Update current user's profile"""
    user_id = token_data.get('sub')
    users_table = get_table('Users')
    
    update_expr = "SET updated_at = :updated_at"
    expr_values = {':updated_at': datetime.now(timezone.utc).isoformat()}
    expr_names = {}
    
    profile_dict = profile.dict(exclude_none=True)
    for key, value in profile_dict.items():
        if key == 'location':
            update_expr += f", #loc = :loc"
            expr_names['#loc'] = 'location'
            expr_values[':loc'] = value
        else:
            update_expr += f", {key} = :{key}"
            expr_values[f':{key}'] = value
    
    users_table.update_item(
        Key={'user_id': user_id},
        UpdateExpression=update_expr,
        ExpressionAttributeValues=expr_values,
        ExpressionAttributeNames=expr_names if expr_names else None
    )
    
    return {"success": True, "message": "Profile updated"}

@app.post("/api/profiles/rotate-key")
async def rotate_api_key(token_data: Dict = Depends(verify_token)):
    """Rotate user's API key"""
    user_id = token_data.get('sub')
    users_table = get_table('Users')
    
    new_key = str(uuid.uuid4())
    
    users_table.update_item(
        Key={'user_id': user_id},
        UpdateExpression='SET api_key = :key, updated_at = :updated',
        ExpressionAttributeValues={
            ':key': new_key,
            ':updated': datetime.now(timezone.utc).isoformat()
        }
    )
    
    return {"api_key": new_key}

@app.put("/api/admin/users/{user_id}")
async def admin_update_user(user_id: str, updates: AdminUserUpdate, token_data: Dict = Depends(verify_token)):
    """Admin endpoint to update any user's profile"""
    # In production, verify admin role here
    requester_id = token_data.get('sub')
    
    users_table = get_table('Users')
    
    # Update profile
    if updates.profile_updates:
        update_expr = "SET updated_at = :updated_at"
        expr_values = {':updated_at': datetime.now(timezone.utc).isoformat()}
        expr_names = {}
        
        profile_dict = updates.profile_updates.dict(exclude_none=True)
        for key, value in profile_dict.items():
            if key == 'location':
                update_expr += f", #loc = :loc"
                expr_names['#loc'] = 'location'
                expr_values[':loc'] = value
            else:
                update_expr += f", {key} = :{key}"
                expr_values[f':{key}'] = value
        
        users_table.update_item(
            Key={'user_id': user_id},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_values,
            ExpressionAttributeNames=expr_names if expr_names else None
        )
    
    return {"success": True, "message": f"User {user_id} updated by admin"}

@app.get("/api/admin/analytics")
async def get_admin_analytics(token_data: Dict = Depends(verify_token)):
    """Get admin analytics data"""
    # In production, verify admin role here
    
    users_table = get_table('Users')
    missions_table = get_table('Missions')
    
    # Get user counts
    users_response = users_table.scan(Select='COUNT')
    total_users = users_response.get('Count', 0)
    
    # Get users with complete profiles
    complete_profiles_response = users_table.scan(
        FilterExpression='attribute_exists(first_name) AND attribute_exists(last_name) AND attribute_exists(bio)',
        Select='COUNT'
    )
    complete_profiles = complete_profiles_response.get('Count', 0)
    
    # Get recent missions (last 30 days)
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
    recent_missions_response = missions_table.scan(
        FilterExpression='created_at > :date',
        ExpressionAttributeValues={':date': thirty_days_ago},
        Select='COUNT'
    )
    recent_missions = recent_missions_response.get('Count', 0)
    
    return {
        "total_users": total_users,
        "complete_profiles": complete_profiles,
        "recent_missions": recent_missions,
        "completion_rate": round((complete_profiles / total_users * 100) if total_users > 0 else 0, 1)
    }

# ============ MISSION ENDPOINTS ============

@app.post("/api/missions")
async def create_mission(mission: MissionCreate, token_data: Dict = Depends(verify_token)):
    """Create a new mission"""
    user_id = token_data.get('sub')
    missions_table = get_table('Missions')
    
    mission_id = f"HEMS-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.now(timezone.utc).isoformat()
    
    mission_item = {
        'mission_id': mission_id,
        'user_id': user_id,
        'callsign': mission.callsign,
        'mission_type': mission.mission_type,
        'hems_base': mission.hems_base,
        'helicopter': mission.helicopter,
        'crew': mission.crew,
        'origin': mission.origin,
        'pickup': mission.pickup,
        'destination': mission.destination,
        'patient_age': mission.patient_age,
        'patient_gender': mission.patient_gender,
        'patient_weight_lbs': mission.patient_weight_lbs,
        'patient_details': mission.patient_details,
        'waypoints': mission.waypoints,
        'tracking': {
            'latitude': mission.origin.get('latitude', 0),
            'longitude': mission.origin.get('longitude', 0),
            'altitude': 0,
            'heading': 0,
            'speedKnots': 0,
            'phase': 'Dispatch',
            'fuelRemainingLbs': mission.helicopter.get('fuelCapacityLbs', 1500),
            'timeEnrouteMinutes': 0,
            'lastUpdate': int(datetime.now(timezone.utc).timestamp() * 1000)
        },
        'status': 'active',
        'created_at': now,
        'updated_at': now
    }
    
    missions_table.put_item(Item=mission_item)
    
    return {"success": True, "mission_id": mission_id, "mission": mission_item}

@app.get("/api/missions")
async def get_missions(status: Optional[str] = None, token_data: Dict = Depends(verify_token)):
    """Get missions (optionally filtered by status)"""
    user_id = token_data.get('sub')
    missions_table = get_table('Missions')
    
    if status:
        response = missions_table.query(
            IndexName='status-index',
            KeyConditionExpression=Key('status').eq(status)
        )
    else:
        response = missions_table.query(
            IndexName='user_id-index',
            KeyConditionExpression=Key('user_id').eq(user_id)
        )
    
    return {"missions": response.get('Items', [])}

@app.get("/api/missions/active")
async def get_active_missions(token_data: Dict = Depends(verify_token)):
    """Get all active missions (for global map)"""
    missions_table = get_table('Missions')
    
    response = missions_table.query(
        IndexName='status-index',
        KeyConditionExpression=Key('status').eq('active')
    )
    
    return {"missions": response.get('Items', [])}

@app.get("/api/missions/{mission_id}")
async def get_mission(mission_id: str, token_data: Dict = Depends(verify_token)):
    """Get specific mission details"""
    missions_table = get_table('Missions')
    
    response = missions_table.get_item(Key={'mission_id': mission_id})
    
    if 'Item' not in response:
        raise HTTPException(status_code=404, detail="Mission not found")
    
    return {"mission": response['Item']}

@app.put("/api/missions/{mission_id}/telemetry")
async def update_telemetry(mission_id: str, telemetry: TelemetryUpdate, token_data: Dict = Depends(verify_token)):
    """Update mission telemetry"""
    missions_table = get_table('Missions')
    telemetry_table = get_table('Telemetry')
    
    now = datetime.now(timezone.utc)
    
    # Update mission tracking
    tracking_data = {
        'latitude': telemetry.latitude,
        'longitude': telemetry.longitude,
        'altitudeFt': telemetry.altitude_ft,
        'groundSpeedKts': telemetry.ground_speed_kts,
        'headingDeg': telemetry.heading_deg,
        'verticalSpeedFtMin': telemetry.vertical_speed_ftmin,
        'fuelRemainingLbs': telemetry.fuel_remaining_lbs,
        'timeEnrouteMinutes': telemetry.time_enroute_minutes,
        'phase': telemetry.phase,
        'lastUpdate': int(now.timestamp() * 1000)
    }
    
    missions_table.update_item(
        Key={'mission_id': mission_id},
        UpdateExpression='SET tracking = :tracking, updated_at = :updated',
        ExpressionAttributeValues={
            ':tracking': tracking_data,
            ':updated': now.isoformat()
        }
    )
    
    # Store telemetry history
    user_id = token_data.get('sub')
    telemetry_table.put_item(Item={
        'device_id': f"{user_id}:{mission_id}",
        'timestamp': int(now.timestamp()),
        'mission_id': mission_id,
        **tracking_data
    })
    
    return {"success": True}

@app.put("/api/missions/{mission_id}/complete")
async def complete_mission(mission_id: str, token_data: Dict = Depends(verify_token)):
    """Mark mission as complete"""
    missions_table = get_table('Missions')
    
    missions_table.update_item(
        Key={'mission_id': mission_id},
        UpdateExpression='SET #s = :status, updated_at = :updated',
        ExpressionAttributeNames={'#s': 'status'},
        ExpressionAttributeValues={
            ':status': 'completed',
            ':updated': datetime.now(timezone.utc).isoformat()
        }
    )
    
    return {"success": True}

# ============ DATA ENDPOINTS (PUBLIC) ============

@app.get("/api/hems-bases")
async def get_hems_bases():
    """Get all HEMS bases (public)"""
    bases_table = get_table('HemsBases')
    response = bases_table.scan()
    return {"bases": response.get('Items', [])}

@app.get("/api/hospitals")
async def get_hospitals():
    """Get all hospitals (public)"""
    hospitals_table = get_table('Hospitals')
    response = hospitals_table.scan()
    return {"hospitals": response.get('Items', [])}

@app.get("/api/helicopters")
async def get_helicopters():
    """Get all helicopters (public)"""
    helicopters_table = get_table('Helicopters')
    response = helicopters_table.scan()
    return {"helicopters": response.get('Items', [])}

# ============ AI DISPATCH ENDPOINTS ============

@app.post("/api/dispatch/ai")
async def ai_dispatch(request: AIDispatchRequest, token_data: Dict = Depends(verify_token)):
    """AI-powered dispatch assistant using AWS Bedrock"""
    try:
        # Get mission context
        missions_table = get_table('Missions')
        response = missions_table.get_item(Key={'mission_id': request.mission_id})
        
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Mission not found")
        
        mission = response['Item']
        
        # Build context for AI
        context = f"""
You are a professional HEMS (Helicopter Emergency Medical Services) dispatch coordinator.
You are assisting the flight crew during an active mission.

Mission Details:
- Mission ID: {mission['mission_id']}
- Callsign: {mission['callsign']}
- Type: {mission['mission_type']}
- Aircraft: {mission['helicopter'].get('model', 'Unknown')} ({mission['helicopter'].get('registration', 'N/A')})
- Current Phase: {mission['tracking'].get('phase', 'Unknown')}
- Current Position: {mission['tracking'].get('latitude', 0):.4f}, {mission['tracking'].get('longitude', 0):.4f}
- Altitude: {mission['tracking'].get('altitudeFt', 0)} ft
- Ground Speed: {mission['tracking'].get('groundSpeedKts', 0)} kts
- Fuel Remaining: {mission['tracking'].get('fuelRemainingLbs', 0)} lbs

Patient Information:
- Age: {mission.get('patient_age', 'Unknown')}
- Gender: {mission.get('patient_gender', 'Unknown')}
- Chief Complaint: {mission.get('patient_details', 'Not specified')}

Crew Message: {request.message}

Respond professionally and concisely as a dispatch coordinator would over radio.
Keep responses brief and actionable. Use standard aviation/medical terminology.
"""
        
        # Call Bedrock Claude
        bedrock_response = bedrock.invoke_model(
            modelId='anthropic.claude-3-sonnet-20240229-v1:0',
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                'anthropic_version': 'bedrock-2023-05-31',
                'max_tokens': 500,
                'messages': [{
                    'role': 'user',
                    'content': context
                }]
            })
        )
        
        response_body = json.loads(bedrock_response['body'].read())
        ai_response = response_body['content'][0]['text']
        
        return {
            "success": True,
            "response_text": ai_response,
            "mission_id": request.mission_id
        }
        
    except ClientError as e:
        print(f"Bedrock error: {e}")
        raise HTTPException(status_code=500, detail="AI service unavailable")

@app.post("/api/atc/contact")
async def atc_contact(request: ATCRequest, token_data: Dict = Depends(verify_token)):
    """AI-powered ATC communications using AWS Bedrock"""
    try:
        # Get mission context
        missions_table = get_table('Missions')
        response = missions_table.get_item(Key={'mission_id': request.mission_id})
        
        if 'Item' not in response:
            raise HTTPException(status_code=404, detail="Mission not found")
        
        mission = response['Item']
        
        # Determine controller personality and context based on type
        controller_contexts = {
            'ground': {
                'role': 'Ground Control',
                'focus': 'taxi instructions, parking, and ground movement',
                'style': 'Clear and directive for ground operations'
            },
            'tower': {
                'role': 'Tower Control',
                'focus': 'takeoff and landing clearances, runway operations',
                'style': 'Authoritative and safety-focused'
            },
            'departure': {
                'role': 'Departure Control',
                'focus': 'initial climb instructions, traffic advisories, handoffs',
                'style': 'Efficient and traffic-aware'
            },
            'approach': {
                'role': 'Approach Control',
                'focus': 'descent instructions, approach clearances, sequencing',
                'style': 'Calm and methodical'
            },
            'center': {
                'role': 'Center Control',
                'focus': 'enroute flight following, altitude changes, weather advisories',
                'style': 'Professional and informative'
            }
        }
        
        controller_info = controller_contexts.get(request.controller_type, controller_contexts['tower'])
        airport_info = f" at {request.airport_code}" if request.airport_code else ""
        frequency_info = f" on {request.frequency}" if request.frequency else ""
        
        # Build context for AI
        context = f"""
You are an AI-powered {controller_info['role']} controller{airport_info}{frequency_info}.
You are communicating with a HEMS helicopter during an emergency medical mission.

Your role focuses on: {controller_info['focus']}
Communication style: {controller_info['style']}

Aircraft Information:
- Callsign: {mission['callsign']}
- Type: {mission['helicopter'].get('model', 'Unknown')} helicopter
- Registration: {mission['helicopter'].get('registration', 'N/A')}
- Current Position: {mission['tracking'].get('latitude', 0):.4f}, {mission['tracking'].get('longitude', 0):.4f}
- Altitude: {mission['tracking'].get('altitudeFt', 0)} ft MSL
- Ground Speed: {mission['tracking'].get('groundSpeedKts', 0)} kts
- Heading: {mission['tracking'].get('headingDeg', 0)}°
- Phase: {mission['tracking'].get('phase', 'Unknown')}

Mission Context:
- Type: Emergency Medical (HEMS)
- Patient: {mission.get('patient_details', 'Medical emergency')}
- Origin: {mission['origin'].get('name', 'Unknown')}
- Destination: {mission['destination'].get('name', 'Unknown')}

Pilot Transmission: {request.message}

Respond as an ATC controller would over radio:
- Use proper phraseology (readback, roger, wilco, etc.)
- Include relevant traffic information if applicable
- Provide clear, concise instructions
- Acknowledge emergency priority if appropriate
- Use standard ATC format: [Callsign], [Controller], [Instruction/Information]
- Keep response under 50 words
- Be professional and safety-focused
"""
        
        # Call Bedrock Claude
        bedrock_response = bedrock.invoke_model(
            modelId='anthropic.claude-3-sonnet-20240229-v1:0',
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                'anthropic_version': 'bedrock-2023-05-31',
                'max_tokens': 300,
                'messages': [{
                    'role': 'user',
                    'content': context
                }]
            })
        )
        
        response_body = json.loads(bedrock_response['body'].read())
        ai_response = response_body['content'][0]['text']
        
        return {
            "success": True,
            "response_text": ai_response,
            "controller_type": request.controller_type,
            "airport_code": request.airport_code,
            "frequency": request.frequency,
            "mission_id": request.mission_id
        }
        
    except ClientError as e:
        print(f"Bedrock error: {e}")
        raise HTTPException(status_code=500, detail="AI service unavailable")

@app.post("/api/dispatch/tts")
async def generate_tts(text: str, token_data: Dict = Depends(verify_token)):
    """Generate TTS audio using AWS Polly"""
    try:
        response = polly.synthesize_speech(
            Text=text,
            OutputFormat='mp3',
            VoiceId='Joanna',
            Engine='neural'
        )
        
        # Save to S3
        audio_key = f"tts/{uuid.uuid4()}.mp3"
        bucket = AWS_CONFIG.get('s3_bucket', '')
        
        if bucket:
            s3.put_object(
                Bucket=bucket,
                Key=audio_key,
                Body=response['AudioStream'].read(),
                ContentType='audio/mpeg'
            )
            
            audio_url = f"https://{bucket}.s3.amazonaws.com/{audio_key}"
        else:
            audio_url = None
        
        return {"audio_url": audio_url}
        
    except ClientError as e:
        raise HTTPException(status_code=500, detail="TTS service unavailable")

# ============ HEALTH CHECK ============

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": "6.0.0",
        "service": "VirtualHEMS Professional API",
        "aws_configured": bool(AWS_CONFIG.get('user_pool_id'))
    }

@app.get("/api/config")
async def get_client_config():
    """Get frontend configuration (safe to expose)"""
    return {
        "aws_region": AWS_REGION,
        "user_pool_id": AWS_CONFIG.get('user_pool_id', ''),
        "user_pool_client_id": AWS_CONFIG.get('user_pool_client_id', ''),
        "identity_pool_id": AWS_CONFIG.get('identity_pool_id', '')
    }
