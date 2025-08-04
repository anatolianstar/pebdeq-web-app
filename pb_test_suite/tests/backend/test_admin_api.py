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

class TestAdminAPI(unittest.TestCase):
    """Test Admin API endpoints and functionality"""
    
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
            
        # Create separate APIClient for user login to avoid token override
        user_api_client = APIClient(cls.config.BASE_URL)
        user_response = user_api_client.login(
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
    
    def test_admin_stats_endpoint(self):
        """Test admin statistics endpoint"""
        test_name = "Admin Stats Endpoint"
        try:
            response = self.api_client.make_request(
                'GET', 
                '/api/admin/stats',
                headers={'Authorization': self.admin_token}
            )
            
            if response is not None and not response.get('error'):
                expected_stats = ['totalProducts', 'totalCategories', 'totalOrders', 'totalUsers']
                found_stats = []
                
                for stat in expected_stats:
                    if stat in response:
                        found_stats.append(stat)
                
                if len(found_stats) > 0:
                    self.results.append({
                        'test': test_name,
                        'status': 'PASS',
                        'message': f'Admin stats retrieved successfully. Found: {", ".join(found_stats)}'
                    })
                else:
                    self.results.append({
                        'test': test_name,
                        'status': 'FAIL',
                        'message': 'Admin stats endpoint accessible but no expected fields found'
                    })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': f'Failed to get admin stats: {response}'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing admin stats: {str(e)}'
            })
    
    def test_admin_stats_unauthorized(self):
        """Test admin stats endpoint without authentication"""
        test_name = "Admin Stats Unauthorized"
        try:
            # Temporarily clear auth token to test unauthorized access
            original_token = self.api_client.auth_token
            original_header = self.api_client.auth_header
            
            self.api_client.auth_token = None
            self.api_client.auth_header = None
            
            # Also clear session headers
            if 'Authorization' in self.api_client.session.headers:
                del self.api_client.session.headers['Authorization']
            
            response = self.api_client.make_request('GET', '/api/admin/stats')
            
            # Restore auth token
            self.api_client.auth_token = original_token
            self.api_client.auth_header = original_header
            
            if response and response.get('error'):
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': 'Correctly rejected unauthorized access'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': 'Should reject unauthorized access but did not'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing unauthorized access: {str(e)}'
            })
    
    def test_admin_stats_regular_user(self):
        """Test admin stats endpoint with regular user token"""
        test_name = "Admin Stats Regular User"
        try:
            # Temporarily replace admin token with user token
            original_token = self.api_client.auth_token
            original_header = self.api_client.auth_header
            
            self.api_client.auth_token = self.user_token
            self.api_client.auth_header = 'Authorization'
            
            response = self.api_client.make_request('GET', '/api/admin/stats')
            
            # Restore admin token
            self.api_client.auth_token = original_token
            self.api_client.auth_header = original_header
            
            if response and response.get('error'):
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': 'Correctly rejected regular user access'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': 'Should reject regular user access but did not'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing regular user access: {str(e)}'
            })
    
    def test_admin_dashboard_endpoint(self):
        """Test admin dashboard endpoint"""
        test_name = "Admin Dashboard Endpoint"
        try:
            response = self.api_client.make_request(
                'GET', 
                '/api/admin/dashboard',
                headers={'Authorization': self.admin_token}
            )
            
            if response and not response.get('error'):
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': 'Admin dashboard data retrieved successfully'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': f'Failed to get dashboard data: {response}'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing admin dashboard: {str(e)}'
            })
    
    def test_admin_health_check(self):
        """Test admin health check endpoint"""
        test_name = "Admin Health Check"
        try:
            response = self.api_client.make_request(
                'GET', 
                '/api/admin/health',
                headers={'Authorization': self.admin_token}
            )
            
            if response and response.get('status') == 'healthy':
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': 'System health check passed'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': f'Health check failed: {response}'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing health check: {str(e)}'
            })
    
    def test_admin_users_list(self):
        """Test admin users list endpoint"""
        test_name = "Admin Users List"
        try:
            response = self.api_client.make_request(
                'GET', 
                '/api/admin/users',
                headers={'Authorization': self.admin_token}
            )
            
            if response and isinstance(response, list):
                user_count = len(response)
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': f'Retrieved {user_count} users successfully'
                })
            elif response and response.get('users'):
                user_count = len(response['users'])
                self.results.append({
                    'test': test_name,
                    'status': 'PASS', 
                    'message': f'Retrieved {user_count} users successfully'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': f'Failed to get users list: {response}'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing users list: {str(e)}'
            })
    
    def test_admin_products_list(self):
        """Test admin products list endpoint"""
        test_name = "Admin Products List"
        try:
            response = self.api_client.make_request(
                'GET', 
                '/api/admin/products',
                headers={'Authorization': self.admin_token}
            )
            
            if response and isinstance(response, list):
                product_count = len(response)
                self.results.append({
                    'test': test_name,
                    'status': 'PASS',
                    'message': f'Retrieved {product_count} products successfully'
                })
            elif response and response.get('products'):
                product_count = len(response['products'])
                self.results.append({
                    'test': test_name,
                    'status': 'PASS', 
                    'message': f'Retrieved {product_count} products successfully'
                })
            else:
                self.results.append({
                    'test': test_name,
                    'status': 'FAIL',
                    'message': f'Failed to get products list: {response}'
                })
                
        except Exception as e:
            self.results.append({
                'test': test_name,
                'status': 'ERROR',
                'message': f'Error testing products list: {str(e)}'
            })
    
    def run_all_tests(self):
        """Run all admin API tests and return results"""
        print("[TEST] Running Admin API Tests...")
        
        # List of all test methods to run
        test_methods = [
            self.test_admin_stats_endpoint,
            self.test_admin_stats_unauthorized,
            self.test_admin_stats_regular_user,
            self.test_admin_dashboard_endpoint,
            self.test_admin_health_check,
            self.test_admin_users_list,
            self.test_admin_products_list
        ]
        
        all_results = []
        
        for test_method in test_methods:
            self.setUp()  # Reset results for each test
            try:
                test_method()
                all_results.extend(self.results)
            except Exception as e:
                all_results.append({
                    'test': test_method.__name__,
                    'status': 'ERROR',
                    'message': f'Test execution error: {str(e)}'
                })
            self.tearDown()
        
        return all_results

if __name__ == '__main__':
    # For standalone testing
    unittest.main()

def run_all_tests():
    """Standalone function to run all admin API tests for scripts"""
    test_instance = TestAdminAPI()
    test_instance.setUpClass()
    return test_instance.run_all_tests() 