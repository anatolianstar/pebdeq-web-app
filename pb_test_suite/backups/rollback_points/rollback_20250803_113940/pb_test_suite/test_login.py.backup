#!/usr/bin/env python3
"""
AUTHENTICATION TEST SCRIPT - UPDATED WITH CORRECT CREDENTIALS
This script tests login functionality with the correct database users.
Do NOT run this script continuously as it may cause authentication spam.
"""

import requests
import json

# Test login endpoint
login_url = "http://localhost:5005/api/auth/login"

# Test different credentials (CORRECTED TO MATCH DATABASE)
test_credentials = [
    {"email": "admin@pebdeq.com", "password": "adminx999"},  # REAL ADMIN USER
    {"email": "test_user_new@pebdeq.com", "password": "TestUser123!"},  # NEW TEST USER
]

print("🔐 AUTHENTICATION TEST - UPDATED CREDENTIALS")
print("=" * 60)
print("Testing login with CORRECT credentials:")
print("=" * 50)

for cred in test_credentials:
    try:
        response = requests.post(login_url, json=cred)
        print(f"Testing {cred['email']} with password '{cred['password']}':")
        print(f"  Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            user = data.get('user', {})
            print(f"  ✅ SUCCESS - User: {user.get('username', 'N/A')} (Admin: {user.get('is_admin', False)})")
        else:
            print(f"  ❌ FAILED - {response.json()}")
        print()
    except Exception as e:
        print(f"Error testing {cred['email']}: {e}")
        print()

print("Testing with INVALID credentials (expected to fail):")
print("=" * 50)

# Test some invalid credentials to verify error handling works
invalid_credentials = [
    {"email": "admin@pebdeq.com", "password": "wrong_password"},
    {"email": "nonexistent@example.com", "password": "any_password"},
]

for cred in invalid_credentials:
    try:
        response = requests.post(login_url, json=cred)
        print(f"Testing {cred['email']} with password '{cred['password']}':")
        print(f"  Status: {response.status_code}")
        print(f"  Response: {response.json()}")
        print()
    except Exception as e:
        print(f"Error testing {cred['email']}: {e}")
        print()

print("🎯 TEST COMPLETED - All credentials now use CORRECT database users!")
print("⚠️  WARNING: Do not run this script continuously!") 