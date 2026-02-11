"""
Import Supabase data into DynamoDB with schema transformation
Run after export_supabase_data.py
"""
import json
import boto3
import sys
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')

def convert_floats(obj):
    """Convert floats to Decimal for DynamoDB"""
    if isinstance(obj, float):
        return Decimal(str(obj))
    elif isinstance(obj, dict):
        return {k: convert_floats(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_floats(i) for i in obj]
    return obj

def transform_profile(profile: dict) -> dict:
    """Transform Supabase profile to DynamoDB Users format"""
    return {
        'user_id': profile['id'],
        'email': profile.get('email', ''),
        'first_name': profile.get('first_name'),
        'last_name': profile.get('last_name'),
        'avatar_url': profile.get('avatar_url'),
        'location': profile.get('location'),
        'bio': profile.get('bio'),
        'simulators': profile.get('simulators'),
        'experience': profile.get('experience'),
        'social_links': profile.get('social_links'),
        'api_key': profile.get('api_key'),
        'is_admin': profile.get('is_admin', False),
        'is_subscribed': profile.get('is_subscribed', True),
        'created_at': profile.get('created_at', datetime.utcnow().isoformat()),
        'updated_at': profile.get('updated_at', datetime.utcnow().isoformat())
    }

def transform_mission(mission: dict) -> dict:
    """Transform Supabase mission to DynamoDB format"""
    return {
        'mission_id': mission['mission_id'],
        'user_id': mission['user_id'],
        'callsign': mission['callsign'],
        'mission_type': mission.get('mission_type', 'Scene Call'),
        'hems_base': mission.get('hems_base', {}),
        'helicopter': mission.get('helicopter', {}),
        'crew': mission.get('crew', []),
        'origin': mission.get('origin', {}),
        'pickup': mission.get('pickup', {}),
        'destination': mission.get('destination', {}),
        'patient_age': mission.get('patient_age'),
        'patient_gender': mission.get('patient_gender'),
        'patient_weight_lbs': mission.get('patient_weight_lbs'),
        'patient_details': mission.get('patient_details'),
        'medical_response': mission.get('medical_response'),
        'waypoints': mission.get('waypoints', []),
        'live_data': mission.get('live_data'),
        'tracking': mission.get('tracking', {
            'latitude': 0,
            'longitude': 0,
            'altitude': 0,
            'heading': 0,
            'speedKnots': 0,
            'phase': 'Dispatch',
            'fuelRemainingLbs': 0,
            'timeEnrouteMinutes': 0,
            'lastUpdate': int(datetime.utcnow().timestamp() * 1000)
        }),
        'status': mission.get('status', 'active'),
        'performance_score': mission.get('performance_score'),
        'created_at': mission.get('created_at', datetime.utcnow().isoformat()),
        'updated_at': mission.get('updated_at', datetime.utcnow().isoformat())
    }

def transform_hems_base(base: dict) -> dict:
    """Transform Supabase hems_base to DynamoDB format"""
    return {
        'id': base['id'],
        'name': base['name'],
        'location': base['location'],
        'faaIdentifier': base.get('faa_identifier'),
        'latitude': base['latitude'],
        'longitude': base['longitude'],
        'contact': base.get('contact'),
        'helicopterId': base.get('helicopter_id'),
        'createdAt': base.get('created_at', datetime.utcnow().isoformat())
    }

def transform_hospital(hospital: dict) -> dict:
    """Transform Supabase hospital to DynamoDB format"""
    return {
        'id': hospital['id'],
        'name': hospital['name'],
        'city': hospital['city'],
        'faaIdentifier': hospital.get('faa_identifier'),
        'latitude': hospital['latitude'],
        'longitude': hospital['longitude'],
        'isTraumaCenter': hospital.get('is_trauma_center', False),
        'traumaLevel': hospital.get('trauma_level'),
        'createdAt': hospital.get('created_at', datetime.utcnow().isoformat())
    }

def transform_helicopter(heli: dict) -> dict:
    """Transform Supabase helicopter to DynamoDB format"""
    return {
        'id': heli['id'],
        'model': heli['model'],
        'registration': heli['registration'],
        'fuelCapacityLbs': heli['fuel_capacity_lbs'],
        'cruiseSpeedKts': heli['cruise_speed_kts'],
        'fuelBurnRateLbHr': heli['fuel_burn_rate_lb_hr'],
        'maintenanceStatus': heli.get('maintenance_status', 'FMC'),
        'imageUrl': heli.get('image_url'),
        'createdAt': heli.get('created_at', datetime.utcnow().isoformat())
    }

def import_table(table_name: str, items: list, transform_fn=None):
    """Import items into DynamoDB table"""
    if not items:
        print(f"  {table_name}: No data to import")
        return
    
    table = dynamodb.Table(f'VirtualHEMS_{table_name}')
    print(f"  {table_name}: Importing {len(items)} items...", end=' ')
    
    success_count = 0
    error_count = 0
    
    for item in items:
        try:
            # Transform if function provided
            if transform_fn:
                item = transform_fn(item)
            
            # Convert floats to Decimal
            item = convert_floats(item)
            
            # Remove None values
            item = {k: v for k, v in item.items() if v is not None}
            
            table.put_item(Item=item)
            success_count += 1
        except Exception as e:
            error_count += 1
            if error_count <= 3:  # Show first 3 errors
                print(f"\n    Error: {e}")
    
    print(f"✓ {success_count} imported, {error_count} errors")

def main():
    if len(sys.argv) < 2:
        print("Usage: python import_to_dynamodb.py <export_file.json>")
        print("Example: python import_to_dynamodb.py supabase_export_20260210_120000.json")
        sys.exit(1)
    
    export_file = sys.argv[1]
    
    print("="*60)
    print("DynamoDB Import Tool")
    print("="*60)
    print(f"Source: {export_file}")
    print()
    
    # Load export data
    with open(export_file, 'r') as f:
        export_data = json.load(f)
    
    tables = export_data['tables']
    
    print("Importing data...")
    print()
    
    # Import core tables with transformations
    import_table('Users', tables.get('profiles', []), transform_profile)
    import_table('Missions', tables.get('missions', []), transform_mission)
    import_table('HemsBases', tables.get('hems_bases', []), transform_hems_base)
    import_table('Hospitals', tables.get('hospitals', []), transform_hospital)
    import_table('Helicopters', tables.get('helicopters', []), transform_helicopter)
    
    # TODO: Import additional tables (need to create them first)
    # - user_roles
    # - community_posts
    # - hospital_scenery
    # - base_scenery
    # - incident_reports
    # - achievements
    # - mission_radio_logs
    # - global_dispatch_logs
    # - content
    
    print()
    print("="*60)
    print("Import Complete!")
    print("="*60)
    print()
    print("NOTE: Additional tables not yet created in DynamoDB:")
    print("  - user_roles, community_posts, hospital_scenery, base_scenery")
    print("  - incident_reports, achievements, radio logs, content")
    print()
    print("Run aws_setup.py with updated schema to create these tables.")

if __name__ == '__main__':
    main()
