"""
Export data from Supabase to prepare for DynamoDB migration
Requires: pip install supabase python-dotenv
"""
import os
import json
from datetime import datetime
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

# Supabase credentials - SET THESE
SUPABASE_URL = os.getenv('SUPABASE_URL', 'https://orhfcrrydmgxradibbqb.supabase.co')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_KEY', '')  # Service role key needed

if not SUPABASE_KEY:
    print("ERROR: SUPABASE_SERVICE_KEY not set!")
    print("Get it from: Supabase Dashboard → Settings → API → service_role key")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Tables to export
TABLES = [
    'profiles',
    'missions',
    'hems_bases',
    'hospitals',
    'helicopters',
    'user_roles',
    'community_posts',
    'hospital_scenery',
    'base_scenery',
    'incident_reports',
    'achievements',
    'mission_radio_logs',
    'global_dispatch_logs',
    'content',
]

def export_table(table_name: str) -> list:
    """Export all data from a Supabase table"""
    print(f"Exporting {table_name}...", end=' ')
    try:
        response = supabase.table(table_name).select('*').execute()
        count = len(response.data)
        print(f"✓ {count} rows")
        return response.data
    except Exception as e:
        print(f"✗ Error: {e}")
        return []

def save_export(data: dict, filename: str = 'supabase_export.json'):
    """Save exported data to JSON file"""
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2, default=str)
    print(f"\n✓ Data saved to {filename}")

def main():
    print("="*60)
    print("Supabase Data Export Tool")
    print("="*60)
    print(f"Source: {SUPABASE_URL}")
    print()
    
    export_data = {
        'exported_at': datetime.utcnow().isoformat(),
        'source_url': SUPABASE_URL,
        'tables': {}
    }
    
    for table in TABLES:
        data = export_table(table)
        export_data['tables'][table] = data
    
    # Save to file
    filename = f"supabase_export_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    save_export(export_data, filename)
    
    # Print summary
    print("\n" + "="*60)
    print("Export Summary:")
    print("="*60)
    total_rows = 0
    for table, data in export_data['tables'].items():
        count = len(data)
        total_rows += count
        print(f"  {table:30} {count:6} rows")
    print("="*60)
    print(f"  Total: {total_rows} rows")
    print("="*60)

if __name__ == '__main__':
    main()
