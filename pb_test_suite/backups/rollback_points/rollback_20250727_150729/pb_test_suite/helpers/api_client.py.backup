"""
API Client Helper Module
Provides a comprehensive interface for interacting with backend APIs during testing.
"""

import requests
import json
import time
from typing import Dict, Any, Optional, List, Union
from urllib.parse import urljoin
import logging

class APIClient:
    """
    Comprehensive API client for testing backend endpoints.
    Handles authentication, request/response logging, and error handling.
    """
    
    def __init__(self, base_url: str, timeout: int = 30):
        """
        Initialize API client.
        
        Args:
            base_url: Base URL for the API
            timeout: Request timeout in seconds
        """
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout
        self.session = requests.Session()
        self.auth_token = None
        self.auth_header = None
        self.logger = logging.getLogger(__name__)
        
        # Default headers
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'PB-TestSuite/1.0'
        })
    
    def _make_request(self, method: str, endpoint: str, **kwargs) -> requests.Response:
        """
        Make HTTP request with proper error handling and logging.
        
        Args:
            method: HTTP method (GET, POST, PUT, DELETE, etc.)
            endpoint: API endpoint
            **kwargs: Additional request parameters
            
        Returns:
            requests.Response object
        """
        url = urljoin(self.base_url + '/', endpoint.lstrip('/'))
        
        # Add authentication if available
        if self.auth_token and self.auth_header:
            self.session.headers.update({self.auth_header: self.auth_token})
        
        start_time = time.time()
        
        try:
            response = self.session.request(
                method=method,
                url=url,
                timeout=self.timeout,
                **kwargs
            )
            
            response_time = time.time() - start_time
            
            # Log request details
            self.logger.debug(f"{method} {url} - Status: {response.status_code} - Time: {response_time:.2f}s")
            
            return response
            
        except requests.exceptions.RequestException as e:
            self.logger.error(f"Request failed: {method} {url} - Error: {str(e)}")
            raise
    
    def get(self, endpoint: str, params: Optional[Dict] = None) -> requests.Response:
        """Make GET request."""
        return self._make_request('GET', endpoint, params=params)
    
    def post(self, endpoint: str, data: Optional[Dict] = None, json_data: Optional[Dict] = None) -> requests.Response:
        """Make POST request."""
        kwargs = {}
        if data:
            kwargs['data'] = data
        if json_data:
            kwargs['json'] = json_data
        return self._make_request('POST', endpoint, **kwargs)
    
    def put(self, endpoint: str, data: Optional[Dict] = None, json_data: Optional[Dict] = None) -> requests.Response:
        """Make PUT request."""
        kwargs = {}
        if data:
            kwargs['data'] = data
        if json_data:
            kwargs['json'] = json_data
        return self._make_request('PUT', endpoint, **kwargs)
    
    def delete(self, endpoint: str, params: Optional[Dict] = None) -> requests.Response:
        """Make DELETE request."""
        return self._make_request('DELETE', endpoint, params=params)
    
    def make_request(self, method: str, endpoint: str, headers: Optional[Dict] = None, **kwargs) -> Optional[Dict]:
        """
        Make HTTP request and return JSON response (test-compatible method).
        
        Args:
            method: HTTP method
            endpoint: API endpoint
            headers: Additional headers
            **kwargs: Request parameters
            
        Returns:
            JSON response data or None if error
        """
        try:
            # Merge additional headers
            if headers:
                original_headers = dict(self.session.headers)
                self.session.headers.update(headers)
            
            response = self._make_request(method, endpoint, **kwargs)
            
            # Restore original headers if modified
            if headers:
                self.session.headers = original_headers
            
            if response.status_code in [200, 201]:
                return response.json()
            else:
                return {'error': f'Request failed: {response.status_code}', 'status_code': response.status_code}
                
        except Exception as e:
            return {'error': str(e)}
    
    def patch(self, endpoint: str, data: Optional[Dict] = None, json_data: Optional[Dict] = None) -> requests.Response:
        """Make PATCH request."""
        kwargs = {}
        if data:
            kwargs['data'] = data
        if json_data:
            kwargs['json'] = json_data
        return self._make_request('PATCH', endpoint, **kwargs)
    
    def upload_file(self, endpoint: str, file_path: str, field_name: str = 'file', additional_data: Optional[Dict] = None) -> requests.Response:
        """
        Upload file to endpoint.
        
        Args:
            endpoint: API endpoint
            file_path: Path to file to upload
            field_name: Form field name for file
            additional_data: Additional form data
            
        Returns:
            requests.Response object
        """
        files = {field_name: open(file_path, 'rb')}
        data = additional_data or {}
        
        # Remove Content-Type header for file uploads
        original_content_type = self.session.headers.get('Content-Type')
        if 'Content-Type' in self.session.headers:
            del self.session.headers['Content-Type']
        
        try:
            response = self._make_request('POST', endpoint, files=files, data=data)
            return response
        finally:
            # Restore Content-Type header
            if original_content_type:
                self.session.headers['Content-Type'] = original_content_type
            files[field_name].close()
    
    def authenticate(self, username: str, password: str, login_endpoint: str = '/auth/login') -> bool:
        """
        Authenticate with the API.
        
        Args:
            username: Username
            password: Password
            login_endpoint: Login endpoint
            
        Returns:
            bool: True if authentication successful
        """
        try:
            response = self.post(login_endpoint, json_data={
                'username': username,
                'password': password
            })
            
            if response.status_code == 200:
                data = response.json()
                
                # Handle different token response formats
                if 'access_token' in data:
                    self.auth_token = f"Bearer {data['access_token']}"
                    self.auth_header = 'Authorization'
                elif 'token' in data:
                    self.auth_token = f"Bearer {data['token']}"
                    self.auth_header = 'Authorization'
                elif 'jwt' in data:
                    self.auth_token = f"Bearer {data['jwt']}"
                    self.auth_header = 'Authorization'
                else:
                    # Try to find token in response
                    for key, value in data.items():
                        if 'token' in key.lower():
                            self.auth_token = f"Bearer {value}"
                            self.auth_header = 'Authorization'
                            break
                
                self.logger.info(f"Authentication successful for user: {username}")
                return True
            else:
                self.logger.error(f"Authentication failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.logger.error(f"Authentication error: {str(e)}")
            return False
    
    def login(self, email: str, password: str, login_endpoint: str = '/api/auth/login') -> Optional[Dict]:
        """
        Login to the API and return response data.
        
        Args:
            email: User email 
            password: User password
            login_endpoint: Login endpoint
            
        Returns:
            Dict with response data or None if failed
        """
        try:
            response = self.post(login_endpoint, json_data={
                'email': email,
                'password': password
            })
            
            if response.status_code == 200:
                data = response.json()
                
                # Handle different token response formats
                token = None
                if 'access_token' in data:
                    token = data['access_token']
                elif 'token' in data:
                    token = data['token']
                elif 'data' in data and 'token' in data['data']:
                    token = data['data']['token']
                elif 'jwt' in data:
                    token = data['jwt']
                else:
                    # Try to find token in response
                    for key, value in data.items():
                        if 'token' in key.lower():
                            token = value
                            break
                
                if token:
                    self.auth_token = f"Bearer {token}"
                    self.auth_header = 'Authorization'
                    
                    # Return unified response format for tests
                    return {
                        'token': token,
                        'user': data.get('user', data.get('data', {}).get('user', {})),
                        'success': True
                    }
                
                self.logger.info(f"Authentication successful for user: {email}")
                return data  # Return original data if no standard format
            else:
                self.logger.error(f"Authentication failed: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            self.logger.error(f"Authentication error: {str(e)}")
            return None
    
    def logout(self, logout_endpoint: str = '/auth/logout') -> bool:
        """
        Logout from the API.
        
        Args:
            logout_endpoint: Logout endpoint
            
        Returns:
            bool: True if logout successful
        """
        try:
            response = self.post(logout_endpoint)
            
            if response.status_code in [200, 204]:
                self.auth_token = None
                self.auth_header = None
                self.logger.info("Logout successful")
                return True
            else:
                self.logger.error(f"Logout failed: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            self.logger.error(f"Logout error: {str(e)}")
            return False
    
    def is_authenticated(self) -> bool:
        """Check if client is authenticated."""
        return self.auth_token is not None
    
    def get_json(self, endpoint: str, params: Optional[Dict] = None) -> Optional[Dict]:
        """
        Make GET request and return JSON response.
        
        Args:
            endpoint: API endpoint
            params: Query parameters
            
        Returns:
            JSON response data or None if error
        """
        try:
            response = self.get(endpoint, params=params)
            if response.status_code == 200:
                return response.json()
            else:
                self.logger.error(f"GET {endpoint} failed: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            self.logger.error(f"GET {endpoint} error: {str(e)}")
            return None
    
    def post_json(self, endpoint: str, data: Dict) -> Optional[Dict]:
        """
        Make POST request with JSON data and return JSON response.
        
        Args:
            endpoint: API endpoint
            data: JSON data to send
            
        Returns:
            JSON response data or None if error
        """
        try:
            response = self.post(endpoint, json_data=data)
            if response.status_code in [200, 201]:
                return response.json()
            else:
                self.logger.error(f"POST {endpoint} failed: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            self.logger.error(f"POST {endpoint} error: {str(e)}")
            return None
    
    def put_json(self, endpoint: str, data: Dict) -> Optional[Dict]:
        """
        Make PUT request with JSON data and return JSON response.
        
        Args:
            endpoint: API endpoint
            data: JSON data to send
            
        Returns:
            JSON response data or None if error
        """
        try:
            response = self.put(endpoint, json_data=data)
            if response.status_code in [200, 201]:
                return response.json()
            else:
                self.logger.error(f"PUT {endpoint} failed: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            self.logger.error(f"PUT {endpoint} error: {str(e)}")
            return None
    
    def delete_json(self, endpoint: str) -> bool:
        """
        Make DELETE request and return success status.
        
        Args:
            endpoint: API endpoint
            
        Returns:
            bool: True if deletion successful
        """
        try:
            response = self.delete(endpoint)
            if response.status_code in [200, 204]:
                return True
            else:
                self.logger.error(f"DELETE {endpoint} failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            self.logger.error(f"DELETE {endpoint} error: {str(e)}")
            return False
    
    def health_check(self, health_endpoint: str = '/health') -> bool:
        """
        Check API health status.
        
        Args:
            health_endpoint: Health check endpoint
            
        Returns:
            bool: True if API is healthy
        """
        try:
            response = self.get(health_endpoint)
            return response.status_code == 200
        except Exception as e:
            self.logger.error(f"Health check failed: {str(e)}")
            return False
    
    def wait_for_api(self, max_wait_time: int = 60, check_interval: int = 5) -> bool:
        """
        Wait for API to become available.
        
        Args:
            max_wait_time: Maximum time to wait in seconds
            check_interval: Time between checks in seconds
            
        Returns:
            bool: True if API becomes available
        """
        start_time = time.time()
        
        while time.time() - start_time < max_wait_time:
            if self.health_check():
                return True
            
            self.logger.info(f"API not available, waiting {check_interval} seconds...")
            time.sleep(check_interval)
        
        self.logger.error(f"API not available after {max_wait_time} seconds")
        return False
    
    def get_response_time(self, endpoint: str, method: str = 'GET', data: Optional[Dict] = None) -> float:
        """
        Measure response time for an endpoint.
        
        Args:
            endpoint: API endpoint
            method: HTTP method
            data: Request data (for POST/PUT)
            
        Returns:
            Response time in seconds
        """
        start_time = time.time()
        
        try:
            if method.upper() == 'GET':
                response = self.get(endpoint)
            elif method.upper() == 'POST':
                response = self.post(endpoint, json_data=data)
            elif method.upper() == 'PUT':
                response = self.put(endpoint, json_data=data)
            elif method.upper() == 'DELETE':
                response = self.delete(endpoint)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return time.time() - start_time
            
        except Exception as e:
            self.logger.error(f"Response time measurement failed: {str(e)}")
            return -1
    
    def batch_request(self, requests_data: List[Dict[str, Any]]) -> List[requests.Response]:
        """
        Execute multiple requests in sequence.
        
        Args:
            requests_data: List of request dictionaries with 'method', 'endpoint', and optional 'data'
            
        Returns:
            List of response objects
        """
        responses = []
        
        for req_data in requests_data:
            method = req_data.get('method', 'GET').upper()
            endpoint = req_data.get('endpoint')
            data = req_data.get('data')
            
            if not endpoint:
                continue
            
            try:
                if method == 'GET':
                    response = self.get(endpoint, params=data)
                elif method == 'POST':
                    response = self.post(endpoint, json_data=data)
                elif method == 'PUT':
                    response = self.put(endpoint, json_data=data)
                elif method == 'DELETE':
                    response = self.delete(endpoint)
                else:
                    continue
                
                responses.append(response)
                
            except Exception as e:
                self.logger.error(f"Batch request failed: {method} {endpoint} - {str(e)}")
                continue
        
        return responses
    
    def close(self):
        """Close the session."""
        self.session.close()
    
    def __enter__(self):
        """Context manager entry."""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.close()


class AdminAPIClient(APIClient):
    """Extended API client with admin-specific methods."""
    
    def __init__(self, base_url: str, timeout: int = 30):
        super().__init__(base_url, timeout)
        self.admin_prefix = '/admin'
    
    def _admin_endpoint(self, endpoint: str) -> str:
        """Add admin prefix to endpoint."""
        return f"{self.admin_prefix}/{endpoint.lstrip('/')}"
    
    def get_site_settings(self) -> Optional[Dict]:
        """Get site settings."""
        return self.get_json(self._admin_endpoint('site-settings'))
    
    def update_site_settings(self, settings: Dict) -> Optional[Dict]:
        """Update site settings."""
        return self.put_json(self._admin_endpoint('site-settings'), settings)
    
    def get_theme_settings(self) -> Optional[Dict]:
        """Get theme settings."""
        return self.get_json(self._admin_endpoint('theme-settings'))
    
    def update_theme_settings(self, settings: Dict) -> Optional[Dict]:
        """Update theme settings."""
        return self.put_json(self._admin_endpoint('theme-settings'), settings)
    
    def get_users(self, params: Optional[Dict] = None) -> Optional[Dict]:
        """Get users list."""
        return self.get_json(self._admin_endpoint('users'), params)
    
    def create_user(self, user_data: Dict) -> Optional[Dict]:
        """Create new user."""
        return self.post_json(self._admin_endpoint('users'), user_data)
    
    def get_orders(self, params: Optional[Dict] = None) -> Optional[Dict]:
        """Get orders list."""
        return self.get_json(self._admin_endpoint('orders'), params)
    
    def get_products(self, params: Optional[Dict] = None) -> Optional[Dict]:
        """Get products list."""
        return self.get_json(self._admin_endpoint('products'), params)
    
    def create_product(self, product_data: Dict) -> Optional[Dict]:
        """Create new product."""
        return self.post_json(self._admin_endpoint('products'), product_data)
    
    def get_categories(self, params: Optional[Dict] = None) -> Optional[Dict]:
        """Get categories list."""
        return self.get_json(self._admin_endpoint('categories'), params)
    
    def create_category(self, category_data: Dict) -> Optional[Dict]:
        """Create new category."""
        return self.post_json(self._admin_endpoint('categories'), category_data)
    
    def generate_invoice(self, order_id: int) -> Optional[Dict]:
        """Generate invoice for order."""
        return self.post_json(self._admin_endpoint(f'orders/{order_id}/invoice'), {}) 