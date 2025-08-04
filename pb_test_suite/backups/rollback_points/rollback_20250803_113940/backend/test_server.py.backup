#!/usr/bin/env python3
"""
Backend Server Test Script
Tests if the Flask backend is running and responding correctly
"""

import requests
import json
import sys

def test_server():
    """Test if the backend server is responding correctly"""
    base_url = "http://localhost:5005"
    
    print("🔍 Testing Backend Server...")
    print(f"Base URL: {base_url}")
    print("-" * 50)
    
    # Test 1: Basic connectivity
    try:
        response = requests.get(f"{base_url}/api/health", timeout=5)
        print(f"✅ Health check: {response.status_code}")
    except requests.exceptions.ConnectionError:
        print("❌ Connection refused - Backend server is not running!")
        print("💡 Start the backend server with: python backend/run.py")
        return False
    except requests.exceptions.Timeout:
        print("❌ Connection timeout - Server is not responding!")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    # Test 2: Auth endpoint
    try:
        test_data = {"email": "test@test.com", "password": "invalid"}
        response = requests.post(
            f"{base_url}/api/auth/login", 
            json=test_data,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        content_type = response.headers.get('content-type', '')
        
        if 'application/json' in content_type:
            print(f"✅ Auth endpoint: {response.status_code} (JSON response)")
            data = response.json()
            print(f"📝 Response: {data.get('error', 'OK')}")
        else:
            print(f"❌ Auth endpoint returned HTML instead of JSON!")
            print(f"📝 Content-Type: {content_type}")
            print(f"📝 Response: {response.text[:200]}...")
            return False
            
    except Exception as e:
        print(f"❌ Auth endpoint error: {e}")
        return False
    
    # Test 3: CORS headers
    try:
        response = requests.options(f"{base_url}/api/auth/login", timeout=5)
        cors_headers = {
            'Access-Control-Allow-Origin': response.headers.get('Access-Control-Allow-Origin'),
            'Access-Control-Allow-Methods': response.headers.get('Access-Control-Allow-Methods'),
            'Access-Control-Allow-Headers': response.headers.get('Access-Control-Allow-Headers')
        }
        
        if any(cors_headers.values()):
            print("✅ CORS headers present")
        else:
            print("⚠️ No CORS headers found - may cause frontend issues")
            
    except Exception as e:
        print(f"⚠️ CORS test failed: {e}")
    
    print("-" * 50)
    print("🎉 Backend server is running correctly!")
    return True

def test_frontend_config():
    """Test if frontend config is correct"""
    print("\n🔍 Testing Frontend Configuration...")
    print("-" * 50)
    
    try:
        # Check if config.js exists and is readable
        with open('frontend/src/config.js', 'r') as f:
            content = f.read()
            
        if 'localhost:5005' in content:
            print("✅ Frontend configured for localhost:5005")
        else:
            print("❌ Frontend not configured for localhost:5005")
            return False
            
    except FileNotFoundError:
        print("❌ Frontend config.js not found!")
        return False
    except Exception as e:
        print(f"❌ Config error: {e}")
        return False
    
    print("✅ Frontend configuration looks good")
    return True

if __name__ == "__main__":
    print("🚀 PEBDEQ Backend Server Test")
    print("=" * 50)
    
    backend_ok = test_server()
    frontend_ok = test_frontend_config()
    
    if backend_ok and frontend_ok:
        print("\n🎉 All tests passed! System should work correctly.")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed. Check the issues above.")
        sys.exit(1) 