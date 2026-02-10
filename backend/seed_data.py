"""Seed initial data into DynamoDB tables"""
import boto3
import json
import uuid
from datetime import datetime, timezone
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

# Sample HEMS Bases
HEMS_BASES = [
    {"id": str(uuid.uuid4()), "name": "STAT MedEvac Base 1", "location": "Pittsburgh, PA", "faaIdentifier": "KAGC", "latitude": 40.3544, "longitude": -79.9302, "contact": "412-555-0101"},
    {"id": str(uuid.uuid4()), "name": "STAT MedEvac Base 2", "location": "Latrobe, PA", "faaIdentifier": "KLBE", "latitude": 40.2759, "longitude": -79.4057, "contact": "724-555-0102"},
    {"id": str(uuid.uuid4()), "name": "STAT MedEvac Base 3", "location": "Johnstown, PA", "faaIdentifier": "KJST", "latitude": 40.3161, "longitude": -78.8339, "contact": "814-555-0103"},
    {"id": str(uuid.uuid4()), "name": "PHI Air Medical Base", "location": "Morgantown, WV", "faaIdentifier": "KMGW", "latitude": 39.6429, "longitude": -79.9163, "contact": "304-555-0104"},
    {"id": str(uuid.uuid4()), "name": "LifeFlight Base", "location": "Cleveland, OH", "faaIdentifier": "KCGF", "latitude": 41.5651, "longitude": -81.4864, "contact": "216-555-0105"},
]

# Sample Hospitals
HOSPITALS = [
    {"id": str(uuid.uuid4()), "name": "UPMC Presbyterian", "city": "Pittsburgh, PA", "faaIdentifier": None, "latitude": 40.4417, "longitude": -79.9576, "isTraumaCenter": True, "traumaLevel": 1},
    {"id": str(uuid.uuid4()), "name": "Allegheny General Hospital", "city": "Pittsburgh, PA", "faaIdentifier": None, "latitude": 40.4574, "longitude": -79.9934, "isTraumaCenter": True, "traumaLevel": 1},
    {"id": str(uuid.uuid4()), "name": "WVU Medicine Ruby Memorial", "city": "Morgantown, WV", "faaIdentifier": None, "latitude": 39.6532, "longitude": -79.9561, "isTraumaCenter": True, "traumaLevel": 1},
    {"id": str(uuid.uuid4()), "name": "Cleveland Clinic", "city": "Cleveland, OH", "faaIdentifier": None, "latitude": 41.5018, "longitude": -81.6219, "isTraumaCenter": True, "traumaLevel": 1},
    {"id": str(uuid.uuid4()), "name": "Conemaugh Memorial", "city": "Johnstown, PA", "faaIdentifier": None, "latitude": 40.3267, "longitude": -78.9145, "isTraumaCenter": True, "traumaLevel": 2},
    {"id": str(uuid.uuid4()), "name": "Excela Westmoreland", "city": "Greensburg, PA", "faaIdentifier": None, "latitude": 40.3015, "longitude": -79.5389, "isTraumaCenter": False, "traumaLevel": None},
]

# Sample Helicopters
HELICOPTERS = [
    {"id": str(uuid.uuid4()), "model": "EC135 P2+", "registration": "N135SM", "fuelCapacityLbs": 1565, "cruiseSpeedKts": 137, "fuelBurnRateLbHr": 450, "maintenanceStatus": "FMC", "imageUrl": None},
    {"id": str(uuid.uuid4()), "model": "Bell 407", "registration": "N407HE", "fuelCapacityLbs": 1500, "cruiseSpeedKts": 140, "fuelBurnRateLbHr": 420, "maintenanceStatus": "FMC", "imageUrl": None},
    {"id": str(uuid.uuid4()), "model": "Leonardo AW119Kx", "registration": "N119LF", "fuelCapacityLbs": 1716, "cruiseSpeedKts": 152, "fuelBurnRateLbHr": 480, "maintenanceStatus": "FMC", "imageUrl": None},
    {"id": str(uuid.uuid4()), "model": "Airbus H145", "registration": "N145PH", "fuelCapacityLbs": 1808, "cruiseSpeedKts": 145, "fuelBurnRateLbHr": 520, "maintenanceStatus": "AOG", "imageUrl": None},
    {"id": str(uuid.uuid4()), "model": "Bell 429", "registration": "N429CL", "fuelCapacityLbs": 1940, "cruiseSpeedKts": 155, "fuelBurnRateLbHr": 500, "maintenanceStatus": "FMC", "imageUrl": None},
]

def seed_table(table_name, items):
    table = dynamodb.Table(f'VirtualHEMS_{table_name}')
    print(f"Seeding {table_name}...")
    for item in items:
        item['createdAt'] = datetime.now(timezone.utc).isoformat()
        converted_item = convert_floats(item)
        table.put_item(Item=converted_item)
    print(f"  Added {len(items)} items")

if __name__ == '__main__':
    seed_table('HemsBases', HEMS_BASES)
    seed_table('Hospitals', HOSPITALS)
    seed_table('Helicopters', HELICOPTERS)
    print("Database seeded successfully!")
