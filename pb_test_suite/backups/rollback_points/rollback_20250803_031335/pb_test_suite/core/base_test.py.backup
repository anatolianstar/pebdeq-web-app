# [TEST] BASE TEST CLASS

import unittest
import requests
import time
import json
import os
from datetime import datetime
from pathlib import Path
import logging

# Import test configuration
import sys
sys.path.append(str(Path(__file__).parent.parent))
from config.test_config import config

class BaseTest(unittest.TestCase):
    """Base test class with common functionality"""
    
    @classmethod
    def setUpClass(cls):
        """Set up test class - run once before all tests"""
        cls.config = config
        cls.setup_logging()
        cls.setup_test_environment()
        cls.test_results = []
        cls.start_time = datetime.now()
        
        print(f"[TEST] Starting test class: {cls.__name__}")
        print(f"[URL] Backend URL: {cls.config.BACKEND_API_BASE_URL}")
        print(f"[URL] Frontend URL: {cls.config.FRONTEND_BASE_URL}")
    
    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests"""
        cls.end_time = datetime.now()
        cls.duration = cls.end_time - cls.start_time
        
        # Calculate test results
        total_tests = len(cls.test_results)
        passed_tests = sum(1 for result in cls.test_results if result['status'] == 'PASSED')
        failed_tests = total_tests - passed_tests
        success_rate = (passed_tests / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n[RESULTS] Test Results for {cls.__name__}:")
        print(f"   [PASS] Passed: {passed_tests}")
        print(f"   [FAIL] Failed: {failed_tests}")
        print(f"   [RATE] Success Rate: {success_rate:.1f}%")
        print(f"   [TIME] Duration: {cls.duration}")
        
        # Save test results
        cls.save_test_results({
            'class_name': cls.__name__,
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'failed_tests': failed_tests,
            'success_rate': success_rate,
            'duration': str(cls.duration),
            'start_time': cls.start_time.isoformat(),
            'end_time': cls.end_time.isoformat(),
            'test_details': cls.test_results
        })
    
    def setUp(self):
        """Set up before each test"""
        self.test_start_time = datetime.now()
        self.test_name = self._testMethodName
        print(f"\n[TEST] Running test: {self.test_name}")
    
    def tearDown(self):
        """Clean up after each test"""
        self.test_end_time = datetime.now()
        self.test_duration = self.test_end_time - self.test_start_time
        
        # Determine test status
        status = 'PASSED'  # Default to passed
        
        # Check if there were any exceptions during the test
        if hasattr(self, '_outcome') and self._outcome:
            # Check for errors and failures
            if hasattr(self._outcome, 'errors') and self._outcome.errors:
                status = 'ERROR'
            elif hasattr(self._outcome, 'failures') and self._outcome.failures:
                status = 'FAILED'
            else:
                # In newer versions of unittest, check result attribute
                if hasattr(self._outcome, 'result'):
                    result = self._outcome.result
                    if result and hasattr(result, 'errors') and result.errors:
                        status = 'ERROR'
                    elif result and hasattr(result, 'failures') and result.failures:
                        status = 'FAILED'
        
        # Record test result
        test_result = {
            'test_name': self.test_name,
            'status': status,
            'duration': str(self.test_duration),
            'start_time': self.test_start_time.isoformat(),
            'end_time': self.test_end_time.isoformat()
        }
        
        self.__class__.test_results.append(test_result)
        
        # Print test result
        status_icon = '[PASS]' if status == 'PASSED' else '[FAIL]'
        print(f"   {status_icon} {self.test_name}: {status} ({self.test_duration.total_seconds():.2f}s)")
    
    @classmethod
    def setup_logging(cls):
        """Set up logging for tests"""
        log_dir = cls.config.REPORTS_PATH / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)
        
        log_file = log_dir / f"{cls.__name__}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler()
            ]
        )
        
        cls.logger = logging.getLogger(cls.__name__)
    
    @classmethod
    def setup_test_environment(cls):
        """Set up test environment"""
        # Create necessary directories
        for path in [cls.config.REPORTS_PATH, cls.config.BACKUPS_PATH]:
            path.mkdir(parents=True, exist_ok=True)
        
        # Initialize session for HTTP requests
        cls.session = requests.Session()
        cls.session.timeout = cls.config.TEST_SETTINGS['timeout']
    
            # [URL] HTTP REQUEST HELPERS
    
    def make_request(self, method, endpoint, **kwargs):
        """Make HTTP request with error handling"""
        url = f"{self.config.BACKEND_API_BASE_URL}{endpoint}"
        
        try:
            response = self.session.request(method, url, **kwargs)
            
            # Log request details
            self.logger.info(f"{method} {url} -> {response.status_code}")
            
            return response
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Request failed: {method} {url} -> {e}")
            raise
    
    def get(self, endpoint, **kwargs):
        """Make GET request"""
        return self.make_request('GET', endpoint, **kwargs)
    
    def post(self, endpoint, **kwargs):
        """Make POST request"""
        return self.make_request('POST', endpoint, **kwargs)
    
    def put(self, endpoint, **kwargs):
        """Make PUT request"""
        return self.make_request('PUT', endpoint, **kwargs)
    
    def delete(self, endpoint, **kwargs):
        """Make DELETE request"""
        return self.make_request('DELETE', endpoint, **kwargs)
    
    # [AUTH] AUTHENTICATION HELPERS
    
    def login_as_admin(self):
        """Login as admin user"""
        admin_user = self.config.TEST_USERS['admin']
        return self.login(admin_user['username'], admin_user['password'])
    
    def login_as_user(self):
        """Login as regular user"""
        user = self.config.TEST_USERS['user']
        return self.login(user['username'], user['password'])
    
    def login(self, username, password):
        """Login and return auth token"""
        login_data = {
            'username': username,
            'password': password
        }
        
        response = self.post(self.config.BACKEND_API_ENDPOINTS['auth'] + '/login', 
                           json=login_data)
        
        if response.status_code == 200:
            token = response.json().get('token')
            self.session.headers.update({'Authorization': f'Bearer {token}'})
            return token
        else:
            raise Exception(f"Login failed: {response.status_code} - {response.text}")
    
    def logout(self):
        """Logout and clear auth token"""
        try:
            self.post(self.config.BACKEND_API_ENDPOINTS['auth'] + '/logout')
        except:
            pass  # Ignore logout errors
        
        # Clear authorization header
        if 'Authorization' in self.session.headers:
            del self.session.headers['Authorization']
    
    # [ASSERT] TEST ASSERTION HELPERS
    
    def assert_response_ok(self, response, message=None):
        """Assert response is successful (200-299)"""
        if not (200 <= response.status_code < 300):
            error_msg = f"Expected successful response, got {response.status_code}: {response.text}"
            if message:
                error_msg = f"{message} - {error_msg}"
            self.fail(error_msg)
    
    def assert_response_status(self, response, expected_status, message=None):
        """Assert specific response status"""
        if response.status_code != expected_status:
            error_msg = f"Expected status {expected_status}, got {response.status_code}: {response.text}"
            if message:
                error_msg = f"{message} - {error_msg}"
            self.fail(error_msg)
    
    def assert_json_response(self, response, message=None):
        """Assert response contains valid JSON"""
        try:
            response.json()
        except json.JSONDecodeError:
            error_msg = f"Response is not valid JSON: {response.text}"
            if message:
                error_msg = f"{message} - {error_msg}"
            self.fail(error_msg)
    
    def assert_json_contains(self, response, expected_keys, message=None):
        """Assert JSON response contains expected keys"""
        try:
            data = response.json()
            for key in expected_keys:
                if key not in data:
                    error_msg = f"Expected key '{key}' not found in response: {data}"
                    if message:
                        error_msg = f"{message} - {error_msg}"
                    self.fail(error_msg)
        except json.JSONDecodeError:
            self.fail("Response is not valid JSON")
    
    # [TIME] TIMING HELPERS
    
    def measure_time(self, func, *args, **kwargs):
        """Measure execution time of a function"""
        start_time = time.time()
        result = func(*args, **kwargs)
        end_time = time.time()
        
        execution_time = end_time - start_time
        return result, execution_time
    
    def assert_performance(self, func, max_time, message=None, *args, **kwargs):
        """Assert function executes within time limit"""
        result, execution_time = self.measure_time(func, *args, **kwargs)
        
        if execution_time > max_time:
            error_msg = f"Function took {execution_time:.2f}s, expected <= {max_time}s"
            if message:
                error_msg = f"{message} - {error_msg}"
            self.fail(error_msg)
        
        return result
    
    # [DATA] TEST DATA HELPERS
    
    def get_test_data(self, data_type, data_key):
        """Get test data from configuration"""
        return self.config.TEST_DATA.get(data_type, {}).get(data_key, {})
    
    def create_test_user(self, user_type='user'):
        """Create test user"""
        user_data = self.config.TEST_USERS[user_type].copy()
        
        # Add timestamp to make unique
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        user_data['username'] = f"{user_data['username']}_{timestamp}"
        user_data['email'] = f"{timestamp}_{user_data['email']}"
        
        return user_data
    
    # [SAVE] RESULT SAVING HELPERS
    
    @classmethod
    def save_test_results(cls, results):
        """Save test results to file"""
        results_dir = cls.config.REPORTS_PATH / "test_results"
        results_dir.mkdir(parents=True, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        results_file = results_dir / f"{cls.__name__}_{timestamp}.json"
        
        with open(results_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        print(f"[SAVE] Test results saved to: {results_file}")
    
    # [TEST] CUSTOM ASSERTIONS
    
    def assert_theme_applied(self, theme_name):
        """Assert theme is properly applied"""
        # This would check if theme CSS is loaded
        # Implementation depends on frontend testing setup
        pass
    
    def assert_database_state(self, expected_state):
        """Assert database is in expected state"""
        # Implementation depends on database testing setup
        pass
    
    def assert_file_exists(self, file_path):
        """Assert file exists"""
        path = Path(file_path)
        self.assertTrue(path.exists(), f"File not found: {file_path}")
    
    def assert_file_not_exists(self, file_path):
        """Assert file does not exist"""
        path = Path(file_path)
        self.assertFalse(path.exists(), f"File should not exist: {file_path}")
    
    # [UTIL] UTILITY METHODS
    
    def wait_for_condition(self, condition_func, timeout=30, interval=1):
        """Wait for condition to be true"""
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            if condition_func():
                return True
            time.sleep(interval)
        
        return False
    
    def cleanup_test_data(self):
        """Clean up test data"""
        # Override in subclasses for specific cleanup
        pass 