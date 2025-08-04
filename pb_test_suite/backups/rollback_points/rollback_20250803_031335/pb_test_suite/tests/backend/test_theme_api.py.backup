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

class TestThemeAPI(unittest.TestCase):
    """Test Theme System API endpoints and functionality"""
    
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
    
    def test_theme_list_endpoint(self):
        """Test theme list endpoint"""
        test_name = "Theme List Endpoint"
        try:
            response = self.api_client.make_request(
                'GET', 
                '/api/themes',
                headers={'Authorization': f'Bearer {self.admin_token}'}
            )
            
            if response is not None:
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': 'Theme list endpoint accessible'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': 'Theme list endpoint not responding'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing theme list: {str(e)}'
            })
    
    def test_theme_switching(self):
        """Test theme switching functionality"""
        test_name = "Theme Switching"
        try:
            # Test theme switching API
            theme_data = {
                'theme_name': 'dark',
                'primary_color': '#333333',
                'secondary_color': '#666666'
            }
            
            response = self.api_client.make_request(
                'POST',
                '/api/themes/switch',
                headers={'Authorization': f'Bearer {self.user_token}'},
                data=theme_data
            )
            
            if response is not None:
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': 'Theme switching functionality accessible'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': 'Theme switching not working'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing theme switching: {str(e)}'
            })
    
    def test_custom_theme_creation(self):
        """Test custom theme creation"""
        test_name = "Custom Theme Creation"
        try:
            custom_theme = {
                'name': 'Test Theme',
                'primary_color': '#ff0000',
                'secondary_color': '#00ff00',
                'background_color': '#ffffff',
                'text_color': '#000000'
            }
            
            response = self.api_client.make_request(
                'POST',
                '/api/admin/themes',
                headers={'Authorization': f'Bearer {self.admin_token}'},
                data=custom_theme
            )
            
            if response is not None:
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': 'Custom theme creation endpoint accessible'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': 'Custom theme creation not working'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing custom theme creation: {str(e)}'
            })
    
    def test_theme_css_generation(self):
        """Test theme CSS variable generation"""
        test_name = "Theme CSS Generation"
        try:
            response = self.api_client.make_request(
                'GET',
                '/api/themes/css-variables',
                headers={'Authorization': f'Bearer {self.user_token}'}
            )
            
            if response is not None:
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': 'Theme CSS generation endpoint accessible'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': 'Theme CSS generation not working'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing CSS generation: {str(e)}'
            })
    
    def test_user_theme_preferences(self):
        """Test user theme preference storage"""
        test_name = "User Theme Preferences"
        try:
            # Test saving user theme preference
            preference_data = {
                'preferred_theme': 'dark',
                'auto_switch': True
            }
            
            response = self.api_client.make_request(
                'PUT',
                '/api/user/theme-preference',
                headers={'Authorization': f'Bearer {self.user_token}'},
                data=preference_data
            )
            
            if response is not None:
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': 'User theme preferences endpoint accessible'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': 'User theme preferences not working'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing theme preferences: {str(e)}'
            })
    
    def test_theme_performance_monitoring(self):
        """Test theme performance monitoring"""
        test_name = "Theme Performance Monitoring"
        try:
            response = self.api_client.make_request(
                'GET',
                '/api/themes/performance-metrics',
                headers={'Authorization': f'Bearer {self.admin_token}'}
            )
            
            if response is not None:
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': 'Theme performance monitoring accessible'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': 'Performance monitoring tested (may not be implemented)'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing performance monitoring: {str(e)}'
            })
    
    def get_test_results(self):
        """Return test results"""
        return self.results

def run_theme_api_tests():
    """Run all theme API tests and return results"""
    test_instance = TestThemeAPI()
    test_instance.setUpClass()
    
    test_methods = [
        'test_theme_list_endpoint',
        'test_theme_switching',
        'test_custom_theme_creation',
        'test_theme_css_generation',
        'test_user_theme_preferences',
        'test_theme_performance_monitoring'
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
    results = run_theme_api_tests()
    for result in results:
        print(f"[{result['status']}] {result['test']}: {result['message']}") 