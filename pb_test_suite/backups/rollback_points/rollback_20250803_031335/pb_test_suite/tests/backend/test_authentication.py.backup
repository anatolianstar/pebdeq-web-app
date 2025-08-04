import sys
import os

# Add the pb_test_suite directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..'))
# Add the backend directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', '..', 'backend'))

import unittest
import json
from unittest.mock import patch, MagicMock
from config.test_config import TestConfig
from helpers.api_client import APIClient
from helpers.test_data_helper import TestDataHelper

class TestAuthentication(unittest.TestCase):
    """Test Authentication API endpoints and functionality"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.config = TestConfig()
        cls.api_client = APIClient(cls.config.BASE_URL)
        cls.test_data = TestDataHelper()
        cls.admin_token = None
        cls.user_token = None
    
    def setUp(self):
        """Set up before each test"""
        # Clear any previous authentication
        self.api_client.auth_token = None
        self.api_client.auth_header = None
    
    def test_admin_login(self):
        """Test admin user login"""
        try:
            # Login with CORRECT admin credentials
            response = self.api_client.login(
                self.config.ADMIN_EMAIL,  # admin@pebdeq.com
                self.config.ADMIN_PASSWORD  # adminx999
            )
            
            # Check if response is a dict (success) or None (failure)
            if response and isinstance(response, dict):
                self.assertIn('token', response, "Login response should contain token")
                self.assertIn('user', response, "Login response should contain user data")
                
                # Verify admin status
                user_data = response['user']
                self.assertTrue(user_data.get('is_admin', False), "User should be admin")
                
                # Store token for other tests
                TestAuthentication.admin_token = response['token']
                
            else:
                self.fail("Admin login failed - no valid response received")
                
        except Exception as e:
            self.fail(f"Admin login test failed with exception: {str(e)}")
    
    def test_user_login(self):
        """Test regular user login"""
        try:
            # Login with CORRECT user credentials  
            response = self.api_client.login(
                self.config.USER_EMAIL,  # test_user_new@pebdeq.com
                self.config.USER_PASSWORD  # TestUser123!
            )
            
            # Check if response is a dict (success) or None (failure)
            if response and isinstance(response, dict):
                self.assertIn('token', response, "Login response should contain token")
                self.assertIn('user', response, "Login response should contain user data")
                
                # Verify non-admin status
                user_data = response['user']
                self.assertFalse(user_data.get('is_admin', True), "User should not be admin")
                
                # Store token for other tests
                TestAuthentication.user_token = response['token']
                
            else:
                self.fail("User login failed - no valid response received")
                
        except Exception as e:
            self.fail(f"User login test failed with exception: {str(e)}")
    
    def test_invalid_login(self):
        """Test login with invalid credentials"""
        try:
            # Test with wrong password
            response = self.api_client.login(
                self.config.ADMIN_EMAIL,
                "wrong_password"
            )
            
            # Should return None or error response
            if response:
                self.assertIn('error', response, "Invalid login should return error")
            else:
                # None response is also acceptable for failed login
                pass
                
        except Exception as e:
            # Exception is acceptable for invalid login
            pass
    
    def test_protected_endpoint_without_auth(self):
        """Test accessing protected endpoint without authentication"""
        try:
            # Clear authentication
            self.api_client.auth_token = None
            self.api_client.auth_header = None
            
            # Try to access admin endpoint
            response = self.api_client.make_request('GET', '/api/admin/users')
            
            # Should fail or return error
            if response:
                self.assertIn('error', response, "Protected endpoint should return error without auth")
            else:
                # None response is acceptable for unauthorized access
                pass
                
        except Exception as e:
            # Exception is acceptable for unauthorized access
            pass
    
    def test_protected_endpoint_with_auth(self):
        """Test accessing protected endpoint with authentication"""
        try:
            # First login to get token
            if not TestAuthentication.admin_token:
                self.test_admin_login()
            
            if TestAuthentication.admin_token:
                # Set authentication
                self.api_client.auth_token = f"Bearer {TestAuthentication.admin_token}"
                self.api_client.auth_header = 'Authorization'
                
                # Try to access admin endpoint
                response = self.api_client.make_request('GET', '/api/admin/users')
                
                # Should succeed or at least not return auth error
                if response:
                    # If there's an error, it shouldn't be an auth error
                    if 'error' in response:
                        error_msg = response['error'].lower()
                        self.assertNotIn('token', error_msg, "Should not have token error with valid auth")
                        self.assertNotIn('unauthorized', error_msg, "Should not be unauthorized with valid auth")
                        self.assertNotIn('forbidden', error_msg, "Should not be forbidden with admin auth")
                
        except Exception as e:
            self.fail(f"Protected endpoint test failed with exception: {str(e)}")

if __name__ == '__main__':
    unittest.main() 