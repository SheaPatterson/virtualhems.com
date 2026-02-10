"""AWS Infrastructure Setup Script for VirtualHEMS"""
import boto3
import json
import os
from botocore.exceptions import ClientError

# AWS Clients
cognito = boto3.client('cognito-idp', region_name='us-east-1')
cognito_identity = boto3.client('cognito-identity', region_name='us-east-1')
dynamodb = boto3.client('dynamodb', region_name='us-east-1')
s3 = boto3.client('s3', region_name='us-east-1')
iam = boto3.client('iam', region_name='us-east-1')

ACCOUNT_ID = '223759445135'
REGION = 'us-east-1'

def create_cognito_user_pool():
    """Create Cognito User Pool for authentication"""
    print("Creating Cognito User Pool...")
    try:
        response = cognito.create_user_pool(
            PoolName='VirtualHEMS-UserPool',
            Policies={
                'PasswordPolicy': {
                    'MinimumLength': 8,
                    'RequireUppercase': True,
                    'RequireLowercase': True,
                    'RequireNumbers': True,
                    'RequireSymbols': False
                }
            },
            AutoVerifiedAttributes=['email'],
            UsernameAttributes=['email'],
            MfaConfiguration='OFF',
            Schema=[
                {'Name': 'email', 'AttributeDataType': 'String', 'Required': True, 'Mutable': True},
                {'Name': 'name', 'AttributeDataType': 'String', 'Required': False, 'Mutable': True},
            ],
            AdminCreateUserConfig={'AllowAdminCreateUserOnly': False}
        )
        user_pool_id = response['UserPool']['Id']
        print(f"User Pool created: {user_pool_id}")
        return user_pool_id
    except ClientError as e:
        if 'ResourceConflictException' in str(e) or 'already exists' in str(e).lower():
            # Get existing pool
            pools = cognito.list_user_pools(MaxResults=60)['UserPools']
            for pool in pools:
                if pool['Name'] == 'VirtualHEMS-UserPool':
                    print(f"User Pool exists: {pool['Id']}")
                    return pool['Id']
        raise e

def create_user_pool_client(user_pool_id):
    """Create App Client for the User Pool"""
    print("Creating User Pool Client...")
    try:
        response = cognito.create_user_pool_client(
            UserPoolId=user_pool_id,
            ClientName='VirtualHEMS-WebApp',
            GenerateSecret=False,
            ExplicitAuthFlows=[
                'ALLOW_USER_PASSWORD_AUTH',
                'ALLOW_REFRESH_TOKEN_AUTH',
                'ALLOW_USER_SRP_AUTH'
            ],
            SupportedIdentityProviders=['COGNITO'],
            AllowedOAuthFlows=['code', 'implicit'],
            AllowedOAuthScopes=['email', 'openid', 'profile'],
            AllowedOAuthFlowsUserPoolClient=True,
            CallbackURLs=['http://localhost:5173', 'http://localhost:3000'],
            LogoutURLs=['http://localhost:5173', 'http://localhost:3000']
        )
        client_id = response['UserPoolClient']['ClientId']
        print(f"User Pool Client created: {client_id}")
        return client_id
    except ClientError as e:
        if 'ResourceConflictException' in str(e):
            clients = cognito.list_user_pool_clients(UserPoolId=user_pool_id, MaxResults=60)['UserPoolClients']
            for client in clients:
                if client['ClientName'] == 'VirtualHEMS-WebApp':
                    print(f"Client exists: {client['ClientId']}")
                    return client['ClientId']
        raise e

def create_identity_pool(user_pool_id, client_id):
    """Create Identity Pool for AWS credentials"""
    print("Creating Identity Pool...")
    try:
        response = cognito_identity.create_identity_pool(
            IdentityPoolName='VirtualHEMS_Identity_Pool',
            AllowUnauthenticatedIdentities=False,
            CognitoIdentityProviders=[{
                'ProviderName': f'cognito-idp.{REGION}.amazonaws.com/{user_pool_id}',
                'ClientId': client_id,
                'ServerSideTokenCheck': True
            }]
        )
        identity_pool_id = response['IdentityPoolId']
        print(f"Identity Pool created: {identity_pool_id}")
        return identity_pool_id
    except ClientError as e:
        if 'ResourceConflictException' in str(e):
            pools = cognito_identity.list_identity_pools(MaxResults=60)['IdentityPools']
            for pool in pools:
                if pool['IdentityPoolName'] == 'VirtualHEMS_Identity_Pool':
                    print(f"Identity Pool exists: {pool['IdentityPoolId']}")
                    return pool['IdentityPoolId']
        raise e

def create_dynamodb_tables():
    """Create DynamoDB tables for missions and telemetry"""
    tables = [
        {
            'TableName': 'VirtualHEMS_Missions',
            'KeySchema': [
                {'AttributeName': 'mission_id', 'KeyType': 'HASH'},
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'mission_id', 'AttributeType': 'S'},
                {'AttributeName': 'user_id', 'AttributeType': 'S'},
                {'AttributeName': 'status', 'AttributeType': 'S'},
            ],
            'GlobalSecondaryIndexes': [
                {
                    'IndexName': 'user_id-index',
                    'KeySchema': [{'AttributeName': 'user_id', 'KeyType': 'HASH'}],
                    'Projection': {'ProjectionType': 'ALL'}
                },
                {
                    'IndexName': 'status-index',
                    'KeySchema': [{'AttributeName': 'status', 'KeyType': 'HASH'}],
                    'Projection': {'ProjectionType': 'ALL'}
                }
            ],
            'BillingMode': 'PAY_PER_REQUEST'
        },
        {
            'TableName': 'VirtualHEMS_Telemetry',
            'KeySchema': [
                {'AttributeName': 'device_id', 'KeyType': 'HASH'},
                {'AttributeName': 'timestamp', 'KeyType': 'RANGE'},
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'device_id', 'AttributeType': 'S'},
                {'AttributeName': 'timestamp', 'AttributeType': 'N'},
            ],
            'BillingMode': 'PAY_PER_REQUEST'
        },
        {
            'TableName': 'VirtualHEMS_Users',
            'KeySchema': [
                {'AttributeName': 'user_id', 'KeyType': 'HASH'},
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'user_id', 'AttributeType': 'S'},
                {'AttributeName': 'email', 'AttributeType': 'S'},
            ],
            'GlobalSecondaryIndexes': [
                {
                    'IndexName': 'email-index',
                    'KeySchema': [{'AttributeName': 'email', 'KeyType': 'HASH'}],
                    'Projection': {'ProjectionType': 'ALL'}
                }
            ],
            'BillingMode': 'PAY_PER_REQUEST'
        },
        {
            'TableName': 'VirtualHEMS_HemsBases',
            'KeySchema': [
                {'AttributeName': 'id', 'KeyType': 'HASH'},
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'id', 'AttributeType': 'S'},
            ],
            'BillingMode': 'PAY_PER_REQUEST'
        },
        {
            'TableName': 'VirtualHEMS_Hospitals',
            'KeySchema': [
                {'AttributeName': 'id', 'KeyType': 'HASH'},
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'id', 'AttributeType': 'S'},
            ],
            'BillingMode': 'PAY_PER_REQUEST'
        },
        {
            'TableName': 'VirtualHEMS_Helicopters',
            'KeySchema': [
                {'AttributeName': 'id', 'KeyType': 'HASH'},
            ],
            'AttributeDefinitions': [
                {'AttributeName': 'id', 'AttributeType': 'S'},
            ],
            'BillingMode': 'PAY_PER_REQUEST'
        }
    ]
    
    for table_config in tables:
        table_name = table_config['TableName']
        try:
            # Check if table exists
            dynamodb.describe_table(TableName=table_name)
            print(f"Table {table_name} already exists")
        except ClientError as e:
            if e.response['Error']['Code'] == 'ResourceNotFoundException':
                print(f"Creating table {table_name}...")
                create_params = {
                    'TableName': table_name,
                    'KeySchema': table_config['KeySchema'],
                    'AttributeDefinitions': table_config['AttributeDefinitions'],
                    'BillingMode': table_config['BillingMode']
                }
                if 'GlobalSecondaryIndexes' in table_config:
                    create_params['GlobalSecondaryIndexes'] = table_config['GlobalSecondaryIndexes']
                dynamodb.create_table(**create_params)
                print(f"Table {table_name} created")
            else:
                raise e

def create_s3_bucket():
    """Create S3 bucket for assets"""
    bucket_name = f'virtualhems-assets-{ACCOUNT_ID}'
    print(f"Creating S3 bucket: {bucket_name}...")
    try:
        s3.create_bucket(Bucket=bucket_name)
        print(f"Bucket created: {bucket_name}")
    except ClientError as e:
        if 'BucketAlreadyOwnedByYou' in str(e) or 'BucketAlreadyExists' in str(e):
            print(f"Bucket already exists: {bucket_name}")
        else:
            raise e
    
    # Enable CORS
    cors_config = {
        'CORSRules': [{
            'AllowedHeaders': ['*'],
            'AllowedMethods': ['GET', 'PUT', 'POST', 'DELETE'],
            'AllowedOrigins': ['*'],
            'ExposeHeaders': ['ETag']
        }]
    }
    try:
        s3.put_bucket_cors(Bucket=bucket_name, CORSConfiguration=cors_config)
        print("CORS configured")
    except Exception as e:
        print(f"CORS config warning: {e}")
    
    return bucket_name

def main():
    """Main setup function"""
    print("="*60)
    print("VirtualHEMS AWS Infrastructure Setup")
    print("="*60)
    
    # Create Cognito resources
    user_pool_id = create_cognito_user_pool()
    client_id = create_user_pool_client(user_pool_id)
    identity_pool_id = create_identity_pool(user_pool_id, client_id)
    
    # Create DynamoDB tables
    create_dynamodb_tables()
    
    # Create S3 bucket
    bucket_name = create_s3_bucket()
    
    # Output configuration
    config = {
        'aws_region': REGION,
        'user_pool_id': user_pool_id,
        'user_pool_client_id': client_id,
        'identity_pool_id': identity_pool_id,
        's3_bucket': bucket_name,
        'dynamodb_tables': {
            'missions': 'VirtualHEMS_Missions',
            'telemetry': 'VirtualHEMS_Telemetry',
            'users': 'VirtualHEMS_Users',
            'hems_bases': 'VirtualHEMS_HemsBases',
            'hospitals': 'VirtualHEMS_Hospitals',
            'helicopters': 'VirtualHEMS_Helicopters'
        }
    }
    
    print("\n" + "="*60)
    print("AWS Configuration:")
    print(json.dumps(config, indent=2))
    print("="*60)
    
    # Save config
    with open('/app/backend/aws_config.json', 'w') as f:
        json.dump(config, f, indent=2)
    
    print("\nConfiguration saved to /app/backend/aws_config.json")
    return config

if __name__ == '__main__':
    main()
