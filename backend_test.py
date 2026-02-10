#!/usr/bin/env python3
"""
VirtualHEMS Backend API Testing
Tests all backend endpoints for functionality
"""

import requests
import json
import sys
from datetime import datetime
import uuid

class VirtualHEMSAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name}")
        else:
            print(f"❌ {name} - {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if headers:
            test_headers.update(headers)
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                try:
                    error_data = response.json()
                    details += f", Error: {error_data.get('detail', 'Unknown error')}"
                except:
                    details += f", Response: {response.text[:100]}"

            self.log_test(name, success, details)
            
            if success:
                try:
                    return response.json()
                except:
                    return {"status": "success"}
            return None

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return None

    def test_health_endpoints(self):
        """Test health and config endpoints"""
        print("\n🔍 Testing Health & Config Endpoints...")
        
        # Health check
        health_data = self.run_test(
            "Health Check", 
            "GET", 
            "api/health", 
            200
        )
        
        if health_data:
            print(f"   Service: {health_data.get('service', 'Unknown')}")
            print(f"   Version: {health_data.get('version', 'Unknown')}")
            print(f"   AWS Configured: {health_data.get('aws_configured', False)}")

        # Config endpoint
        config_data = self.run_test(
            "Config Endpoint", 
            "GET", 
            "api/config", 
            200
        )
        
        if config_data:
            print(f"   AWS Region: {config_data.get('aws_region', 'Unknown')}")
            print(f"   User Pool ID: {config_data.get('user_pool_id', 'Not set')}")

    def test_auth_endpoints(self):
        """Test authentication endpoints"""
        print("\n🔍 Testing Authentication Endpoints...")
        
        # Test registration
        test_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        test_password = "TestPass123!"
        
        register_data = self.run_test(
            "User Registration",
            "POST",
            "api/auth/register",
            200,
            data={
                "email": test_email,
                "password": test_password,
                "first_name": "Test",
                "last_name": "Pilot"
            }
        )
        
        if register_data:
            self.user_id = register_data.get('user_id')
            print(f"   Registered User ID: {self.user_id}")

        # Test login (this might fail if email verification is required)
        login_data = self.run_test(
            "User Login",
            "POST", 
            "api/auth/login",
            200,
            data={
                "email": test_email,
                "password": test_password
            }
        )
        
        if login_data:
            self.token = login_data.get('access_token')
            print(f"   Login successful, token received")
        else:
            print("   Login failed (likely needs email verification)")

    def test_protected_endpoints(self):
        """Test endpoints that require authentication"""
        if not self.token:
            print("\n⚠️  Skipping protected endpoint tests (no auth token)")
            return
            
        print("\n🔍 Testing Protected Endpoints...")
        
        # Test get current user
        self.run_test(
            "Get Current User",
            "GET",
            "api/auth/me",
            200
        )
        
        # Test get profiles
        self.run_test(
            "Get All Profiles", 
            "GET",
            "api/profiles",
            200
        )
        
        # Test get HEMS bases
        self.run_test(
            "Get HEMS Bases",
            "GET", 
            "api/hems-bases",
            200
        )
        
        # Test get hospitals
        self.run_test(
            "Get Hospitals",
            "GET",
            "api/hospitals", 
            200
        )
        
        # Test get helicopters
        self.run_test(
            "Get Helicopters",
            "GET",
            "api/helicopters",
            200
        )

    def test_mission_endpoints(self):
        """Test mission-related endpoints"""
        if not self.token:
            print("\n⚠️  Skipping mission endpoint tests (no auth token)")
            return
            
        print("\n🔍 Testing Mission Endpoints...")
        
        # Test get missions
        self.run_test(
            "Get User Missions",
            "GET",
            "api/missions",
            200
        )
        
        # Test get active missions
        self.run_test(
            "Get Active Missions", 
            "GET",
            "api/missions/active",
            200
        )

    def test_unauthorized_access(self):
        """Test that protected endpoints reject unauthorized access"""
        print("\n🔍 Testing Unauthorized Access Protection...")
        
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        self.run_test(
            "Unauthorized Profile Access",
            "GET",
            "api/profiles",
            401
        )
        
        self.run_test(
            "Unauthorized Mission Access", 
            "GET",
            "api/missions",
            401
        )
        
        # Restore token
        self.token = original_token

    def run_all_tests(self):
        """Run all test suites"""
        print("🚁 VirtualHEMS Backend API Testing")
        print("=" * 50)
        
        self.test_health_endpoints()
        self.test_auth_endpoints()
        self.test_protected_endpoints()
        self.test_mission_endpoints()
        self.test_unauthorized_access()
        
        # Print summary
        print("\n" + "=" * 50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return 0
        else:
            print("⚠️  Some tests failed")
            return 1

def main():
    # Test with localhost (internal)
    print("Testing Backend API (localhost:8001)")
    tester = VirtualHEMSAPITester("http://localhost:8001")
    result = tester.run_all_tests()
    
    # Save test results
    with open('/app/test_reports/backend_test_results.json', 'w') as f:
        json.dump({
            'timestamp': datetime.now().isoformat(),
            'total_tests': tester.tests_run,
            'passed_tests': tester.tests_passed,
            'success_rate': tester.tests_passed / tester.tests_run if tester.tests_run > 0 else 0,
            'results': tester.test_results
        }, f, indent=2)
    
    return result

if __name__ == "__main__":
    sys.exit(main())