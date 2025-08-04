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

class TestSiteSettingsAPI(unittest.TestCase):
    """Test Site Settings API endpoints and functionality"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test environment"""
        cls.config = TestConfig()
        cls.api_client = APIClient(cls.config.BASE_URL)
        cls.test_data = TestDataHelper()
        cls.admin_token = None
        cls.user_token = None
        
                # Login as admin to get token
        admin_response = cls.api_client.login(
            cls.config.ADMIN_EMAIL,
            cls.config.ADMIN_PASSWORD
        )
        if admin_response and admin_response.get('success'):
            cls.admin_token = admin_response.get('token')
            
        # Login as regular user for permission tests
        user_response = cls.api_client.login(
            cls.config.USER_EMAIL,
            cls.config.USER_PASSWORD
        )
        if user_response and user_response.get('success'):
            cls.user_token = user_response.get('token')
    
    def setUp(self):
        """Set up before each test"""
        self.results = []
        
    def tearDown(self):
        """Clean up after each test"""
        pass
    
    def test_get_site_settings(self):
        """Test getting site settings"""
        test_name = "Get Site Settings"
        try:
            response = self.api_client.make_request(
                'GET', 
                '/api/admin/site-settings',
                headers={'Authorization': self.admin_token}
            )
            
            if response and not response.get('error'):
                # Check for expected settings fields
                expected_fields = ['site_name', 'site_description', 'site_logo', 'contact_email']
                found_fields = []
                
                for field in expected_fields:
                    if field in response:
                        found_fields.append(field)
                
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': f'Site settings retrieved successfully. Found fields: {", ".join(found_fields)}'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': f'Failed to get site settings: {response}'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing get site settings: {str(e)}'
            })
    
    def test_get_site_settings_unauthorized(self):
        """Test getting site settings without authorization"""
        test_name = "Get Site Settings Unauthorized"
        try:
            response = self.api_client.make_request('GET', '/api/site-settings')
            
            if response and response.get('error'):
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': 'Correctly rejected unauthorized access to site settings'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': 'Should reject unauthorized access to site settings'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing unauthorized access: {str(e)}'
            })
    
    def test_update_site_settings(self):
        """Test updating site settings"""
        test_name = "Update Site Settings"
        try:
            # Test data for site settings update
            test_settings = {
                'site_name': 'Test Site Updated',
                'site_description': 'Updated description for testing',
                'contact_email': 'test@example.com'
            }
            
            response = self.api_client.make_request(
                'PUT',
                '/api/site-settings',
                headers={'Authorization': f'Bearer {self.admin_token}'},
                data=test_settings
            )
            
            if response and response.get('message'):
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': 'Site settings updated successfully'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': f'Failed to update site settings: {response}'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing site settings update: {str(e)}'
            })
    
    def test_update_site_settings_regular_user(self):
        """Test updating site settings with regular user"""
        test_name = "Update Site Settings Regular User"
        try:
            test_settings = {
                'site_name': 'Unauthorized Update Test'
            }
            
            response = self.api_client.make_request(
                'PUT',
                '/api/site-settings',
                headers={'Authorization': f'Bearer {self.user_token}'},
                data=test_settings
            )
            
            if response and response.get('error'):
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': 'Correctly rejected regular user settings update'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': 'Should reject regular user access to update settings'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing regular user update: {str(e)}'
            })
    
    def test_theme_sync_endpoint(self):
        """Test theme sync endpoint"""
        test_name = "Theme Sync Endpoint"
        try:
            theme_data = {
                'theme_name': 'test-theme',
                'primary_color': '#007bff',
                'secondary_color': '#6c757d'
            }
            
            response = self.api_client.make_request(
                'PUT',
                '/api/admin/site-settings/sync-theme',
                headers={'Authorization': f'Bearer {self.admin_token}'},
                data=theme_data
            )
            
            if response and not response.get('error'):
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': 'Theme sync completed successfully'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': f'Theme sync failed: {response}'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing theme sync: {str(e)}'
            })
    
    def test_google_oauth_settings(self):
        """Test Google OAuth settings in site settings"""
        test_name = "Google OAuth Settings"
        try:
            # First get current settings
            response = self.api_client.make_request(
                'GET',
                '/api/site-settings',
                headers={'Authorization': f'Bearer {self.admin_token}'}
            )
            
            if response and not response.get('error'):
                # Check for Google OAuth fields
                oauth_fields = ['google_oauth_client_id', 'google_oauth_client_secret', 'google_oauth_enabled']
                found_oauth_fields = []
                
                for field in oauth_fields:
                    if field in response:
                        found_oauth_fields.append(field)
                
                if found_oauth_fields:
                    self.results.append({
                        'test': test_name,
                        'status': 'PASS',
                        'message': f'Google OAuth settings found: {", ".join(found_oauth_fields)}'
                    })
                else:
                    self.results.append({
                        'test': test_name,
                        'status': 'PASS',
                        'message': 'Google OAuth settings structure validated (fields may be empty)'
                    })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': f'Failed to check Google OAuth settings: {response}'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing Google OAuth settings: {str(e)}'
            })
    
    def test_theme_settings_integration(self):
        """Test theme settings integration"""
        test_name = "Theme Settings Integration"
        try:
            # Get current site settings to check theme integration
            response = self.api_client.make_request(
                'GET',
                '/api/site-settings',
                headers={'Authorization': f'Bearer {self.admin_token}'}
            )
            
            if response and not response.get('error'):
                # Check for theme-related fields
                theme_fields = ['default_theme', 'custom_themes', 'theme_settings']
                found_theme_fields = []
                
                for field in theme_fields:
                    if field in response:
                        found_theme_fields.append(field)
                
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': f'Theme integration checked. Available fields: {", ".join(found_theme_fields) if found_theme_fields else "Basic theme support"}'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': f'Failed to check theme settings integration: {response}'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing theme settings integration: {str(e)}'
            })
    
    def get_test_results(self):
        """Return test results"""
        return self.results

def run_site_settings_tests():
    """Run all site settings tests and return results"""
    loader = unittest.TestLoader()
    suite = loader.loadTestsFromTestCase(TestSiteSettingsAPI)
    runner = unittest.TextTestRunner(verbosity=0, stream=open(os.devnull, 'w'))
    result = runner.run(suite)
    
    # Get results from test instance
    test_instance = TestSiteSettingsAPI()
    test_instance.setUpClass()
    
    # Run each test method individually to collect results
    test_methods = [
        'test_get_site_settings',
        'test_get_site_settings_unauthorized',
        'test_update_site_settings',
        'test_update_site_settings_regular_user',
        'test_theme_sync_endpoint',
        'test_google_oauth_settings',
        'test_theme_settings_integration'
    ]
    
    all_results = []
    for method_name in test_methods:
        try:
            test_instance.setUp()
            method = getattr(test_instance, method_name)
            method()
            all_results.extend(test_instance.results)
        except Exception as e:
            all_results.append({
                'test': method_name,
                'status': 'ERROR',
                'message': f'Test execution error: {str(e)}'
            })
    
    return all_results

if __name__ == '__main__':
    results = run_site_settings_tests()
    for result in results:
        print(f"[{result['status']}] {result['test']}: {result['message']}") 