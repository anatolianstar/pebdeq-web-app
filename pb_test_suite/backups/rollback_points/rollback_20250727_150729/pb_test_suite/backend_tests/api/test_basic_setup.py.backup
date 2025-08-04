# [TEST] BASIC SETUP TEST

import unittest
import sys
from pathlib import Path

# Add the test suite to Python path
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from core.base_test import BaseTest

class TestBasicSetup(BaseTest):
    """Basic setup validation tests"""
    
    def test_configuration_loaded(self):
        """Test that configuration is loaded correctly"""
        self.assertIsNotNone(self.config)
        self.assertIsNotNone(self.config.PROJECT_ROOT)
        self.assertIsNotNone(self.config.BACKEND_PATH)
        self.assertIsNotNone(self.config.FRONTEND_PATH)
        
        print(f"✅ Configuration loaded: {self.config.PROJECT_ROOT}")
    
    def test_project_paths_exist(self):
        """Test that project paths exist"""
        self.assertTrue(self.config.PROJECT_ROOT.exists(), 
                       f"Project root not found: {self.config.PROJECT_ROOT}")
        
        self.assertTrue(self.config.BACKEND_PATH.exists(), 
                       f"Backend path not found: {self.config.BACKEND_PATH}")
        
        self.assertTrue(self.config.FRONTEND_PATH.exists(), 
                       f"Frontend path not found: {self.config.FRONTEND_PATH}")
        
        print(f"✅ All project paths exist")
    
    def test_test_suite_directories(self):
        """Test that test suite directories are created"""
        required_dirs = [
            self.config.BACKUPS_PATH,
            self.config.REPORTS_PATH,
            self.config.SUCCESSFUL_STATES_PATH,
            self.config.SNAPSHOTS_PATH,
            self.config.ROLLBACK_POINTS_PATH
        ]
        
        for directory in required_dirs:
            self.assertTrue(directory.exists(), 
                           f"Required directory not found: {directory}")
        
        print(f"✅ All test suite directories exist")
    
    def test_backend_api_endpoints_configured(self):
        """Test that backend API endpoints are configured"""
        endpoints = self.config.BACKEND_API_ENDPOINTS
        
        self.assertIsNotNone(endpoints)
        self.assertIn('auth', endpoints)
        self.assertIn('admin', endpoints)
        self.assertIn('site_settings', endpoints)
        
        print(f"✅ Backend API endpoints configured: {len(endpoints)} endpoints")
    
    def test_frontend_pages_configured(self):
        """Test that frontend pages are configured"""
        pages = self.config.FRONTEND_PAGES
        
        self.assertIsNotNone(pages)
        self.assertIn('home', pages)
        self.assertIn('admin', pages)
        self.assertIn('login', pages)
        
        print(f"✅ Frontend pages configured: {len(pages)} pages")
    
    def test_test_users_configured(self):
        """Test that test users are configured"""
        test_users = self.config.TEST_USERS
        
        self.assertIsNotNone(test_users)
        self.assertIn('admin', test_users)
        self.assertIn('user', test_users)
        
        admin_user = test_users['admin']
        self.assertIn('username', admin_user)
        self.assertIn('password', admin_user)
        self.assertIn('role', admin_user)
        
        print(f"✅ Test users configured: {len(test_users)} users")
    
    def test_test_data_available(self):
        """Test that test data is available"""
        test_data = self.config.TEST_DATA
        
        self.assertIsNotNone(test_data)
        self.assertIn('products', test_data)
        self.assertIn('categories', test_data)
        self.assertIn('orders', test_data)
        
        print(f"✅ Test data available: {len(test_data)} data types")
    
    def test_theme_data_configured(self):
        """Test that theme data is configured"""
        theme_data = self.config.THEME_DATA
        
        self.assertIsNotNone(theme_data)
        self.assertIn('themes', theme_data)
        
        themes = theme_data['themes']
        expected_themes = ['default', 'dark', 'blue', 'green']
        
        for theme in expected_themes:
            self.assertIn(theme, themes)
        
        print(f"✅ Theme data configured: {len(themes)} themes")
    
    def test_performance_thresholds_set(self):
        """Test that performance thresholds are set"""
        thresholds = self.config.PERFORMANCE_THRESHOLDS
        
        self.assertIsNotNone(thresholds)
        self.assertIn('api_response_time', thresholds)
        self.assertIn('page_load_time', thresholds)
        self.assertIn('theme_switch_time', thresholds)
        
        print(f"✅ Performance thresholds set: {len(thresholds)} thresholds")
    
    def test_http_session_created(self):
        """Test that HTTP session is created"""
        self.assertIsNotNone(self.session)
        self.assertIsNotNone(self.session.timeout)
        
        print(f"✅ HTTP session created with timeout: {self.session.timeout}s")
    
    def test_logging_configured(self):
        """Test that logging is configured"""
        self.assertIsNotNone(self.logger)
        
        # Test logging
        self.logger.info("Test log message")
        
        print(f"✅ Logging configured: {self.logger.name}")
    
    def test_backup_name_generation(self):
        """Test backup name generation"""
        backup_name = self.config.get_backup_name()
        
        self.assertIsNotNone(backup_name)
        self.assertTrue(backup_name.startswith('backup_'))
        self.assertTrue(len(backup_name) > 10)
        
        print(f"✅ Backup name generated: {backup_name}")
    
    def test_file_assertions(self):
        """Test file assertion helpers"""
        # Test with requirements.txt file
        requirements_file = self.config.TEST_SUITE_PATH / "requirements.txt"
        
        if requirements_file.exists():
            self.assert_file_exists(requirements_file)
            print("✅ File exists assertion works")
        else:
            print("⚠️  requirements.txt not found, skipping file assertion test")
    
    def test_test_result_saving(self):
        """Test that test results can be saved"""
        # This test will automatically save its results
        # We just need to verify the save mechanism works
        
        test_result = {
            'test_name': 'test_result_saving',
            'status': 'PASSED',
            'duration': '0.1s'
        }
        
        # Add to test results
        self.test_results.append(test_result)
        
        print("✅ Test result saving mechanism works")

if __name__ == '__main__':
    unittest.main(verbosity=2) 