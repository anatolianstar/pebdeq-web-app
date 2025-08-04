"""
Test Data Helper Module
Provides sample data for testing various components of the system.
"""

import json
import random
import string
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional

class TestDataHelper:
    """Helper class for generating test data."""
    
    def __init__(self):
        self.fake_users = []
        self.fake_products = []
        self.fake_categories = []
        self.fake_orders = []
        self.fake_invoices = []
        
    def generate_random_string(self, length: int = 10) -> str:
        """Generate random string of specified length."""
        return ''.join(random.choices(string.ascii_letters + string.digits, k=length))
    
    def generate_random_email(self) -> str:
        """Generate random email address."""
        username = self.generate_random_string(8)
        domain = random.choice(['test.com', 'example.org', 'dummy.net'])
        return f"{username}@{domain}"
    
    def generate_test_user(self, role: str = "user") -> Dict[str, Any]:
        """Generate test user data."""
        return {
            'username': f"testuser_{self.generate_random_string(6)}",
            'email': self.generate_random_email(),
            'password': 'TestPassword123!',
            'first_name': f"TestFirst_{self.generate_random_string(4)}",
            'last_name': f"TestLast_{self.generate_random_string(4)}",
            'role': role,
            'phone': f"+1{random.randint(1000000000, 9999999999)}",
            'address': f"{random.randint(1, 999)} Test Street, Test City, TC {random.randint(10000, 99999)}"
        }
    
    def generate_test_product(self, category_id: Optional[int] = None) -> Dict[str, Any]:
        """Generate test product data."""
        return {
            'name': f"Test Product {self.generate_random_string(6)}",
            'description': f"Test product description {self.generate_random_string(20)}",
            'price': round(random.uniform(10.0, 1000.0), 2),
            'category_id': category_id or random.randint(1, 5),
            'stock_quantity': random.randint(0, 100),
            'sku': f"TEST-{self.generate_random_string(8)}",
            'is_active': random.choice([True, False]),
            'weight': round(random.uniform(0.1, 10.0), 2),
            'dimensions': f"{random.randint(10, 100)}x{random.randint(10, 100)}x{random.randint(10, 100)}",
            'meta_title': f"Test Product Meta {self.generate_random_string(10)}",
            'meta_description': f"Test meta description {self.generate_random_string(30)}"
        }
    
    def generate_test_category(self) -> Dict[str, Any]:
        """Generate test category data."""
        return {
            'name': f"Test Category {self.generate_random_string(6)}",
            'description': f"Test category description {self.generate_random_string(20)}",
            'slug': f"test-category-{self.generate_random_string(8)}",
            'is_active': random.choice([True, False]),
            'sort_order': random.randint(1, 100),
            'meta_title': f"Test Category Meta {self.generate_random_string(10)}",
            'meta_description': f"Test category meta description {self.generate_random_string(30)}"
        }
    
    def generate_test_order(self, user_id: int, products: List[Dict]) -> Dict[str, Any]:
        """Generate test order data."""
        order_items = []
        total_amount = 0
        
        for product in products:
            quantity = random.randint(1, 5)
            price = product.get('price', 0)
            subtotal = price * quantity
            total_amount += subtotal
            
            order_items.append({
                'product_id': product.get('id', 1),
                'quantity': quantity,
                'price': price,
                'subtotal': subtotal
            })
        
        return {
            'user_id': user_id,
            'order_items': order_items,
            'total_amount': total_amount,
            'status': random.choice(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
            'shipping_address': f"{random.randint(1, 999)} Test Shipping St, Test City, TC {random.randint(10000, 99999)}",
            'billing_address': f"{random.randint(1, 999)} Test Billing St, Test City, TC {random.randint(10000, 99999)}",
            'payment_method': random.choice(['credit_card', 'paypal', 'bank_transfer']),
            'notes': f"Test order notes {self.generate_random_string(15)}"
        }
    
    def generate_test_invoice(self, order_id: int, user_id: int) -> Dict[str, Any]:
        """Generate test invoice data."""
        return {
            'order_id': order_id,
            'user_id': user_id,
            'invoice_number': f"TEST-{datetime.now().strftime('%Y%m%d')}-{random.randint(1000, 9999)}",
            'amount': round(random.uniform(50.0, 1000.0), 2),
            'tax_amount': round(random.uniform(5.0, 100.0), 2),
            'discount_amount': round(random.uniform(0.0, 50.0), 2),
            'status': random.choice(['pending', 'paid', 'overdue', 'cancelled']),
            'due_date': (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d'),
            'issued_date': datetime.now().strftime('%Y-%m-%d')
        }
    
    def generate_test_site_settings(self) -> Dict[str, Any]:
        """Generate test site settings data."""
        return {
            'site_name': f"Test Site {self.generate_random_string(6)}",
            'site_description': f"Test site description {self.generate_random_string(20)}",
            'site_url': f"https://test-{self.generate_random_string(8)}.com",
            'admin_email': self.generate_random_email(),
            'contact_email': self.generate_random_email(),
            'phone': f"+1{random.randint(1000000000, 9999999999)}",
            'address': f"{random.randint(1, 999)} Test Address, Test City, TC {random.randint(10000, 99999)}",
            'currency': random.choice(['USD', 'EUR', 'GBP']),
            'timezone': random.choice(['UTC', 'EST', 'PST']),
            'language': random.choice(['en', 'tr', 'es']),
            'maintenance_mode': random.choice([True, False])
        }
    
    def generate_test_theme_settings(self) -> Dict[str, Any]:
        """Generate test theme settings data."""
        return {
            'theme_name': f"test-theme-{self.generate_random_string(6)}",
            'primary_color': f"#{random.randint(0, 16777215):06x}",
            'secondary_color': f"#{random.randint(0, 16777215):06x}",
            'accent_color': f"#{random.randint(0, 16777215):06x}",
            'background_color': f"#{random.randint(0, 16777215):06x}",
            'text_color': f"#{random.randint(0, 16777215):06x}",
            'font_family': random.choice(['Arial', 'Helvetica', 'Georgia', 'Times New Roman']),
            'font_size': random.randint(12, 18),
            'border_radius': random.randint(0, 20),
            'shadow_intensity': random.uniform(0.0, 1.0),
            'animation_speed': random.uniform(0.1, 2.0)
        }
    
    def generate_bulk_test_data(self, count: int, data_type: str) -> List[Dict[str, Any]]:
        """Generate bulk test data for specified type."""
        generators = {
            'users': self.generate_test_user,
            'products': self.generate_test_product,
            'categories': self.generate_test_category,
            'site_settings': self.generate_test_site_settings,
            'theme_settings': self.generate_test_theme_settings
        }
        
        if data_type not in generators:
            raise ValueError(f"Unsupported data type: {data_type}")
        
        return [generators[data_type]() for _ in range(count)]
    
    def get_invalid_data_samples(self, data_type: str) -> List[Dict[str, Any]]:
        """Get invalid data samples for negative testing."""
        invalid_samples = {
            'user': [
                {'email': 'invalid-email'},  # Invalid email format
                {'password': '123'},  # Too short password
                {'username': ''},  # Empty username
                {'role': 'invalid_role'},  # Invalid role
            ],
            'product': [
                {'price': -10},  # Negative price
                {'name': ''},  # Empty name
                {'stock_quantity': -5},  # Negative stock
                {'category_id': 'invalid'},  # Invalid category ID
            ],
            'category': [
                {'name': ''},  # Empty name
                {'sort_order': -1},  # Negative sort order
                {'slug': 'invalid slug with spaces'},  # Invalid slug
            ],
            'order': [
                {'total_amount': -100},  # Negative total
                {'status': 'invalid_status'},  # Invalid status
                {'user_id': 'invalid'},  # Invalid user ID
            ]
        }
        
        return invalid_samples.get(data_type, [])
    
    def save_test_data_to_file(self, data: Any, filename: str) -> None:
        """Save test data to JSON file."""
        with open(filename, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    def load_test_data_from_file(self, filename: str) -> Any:
        """Load test data from JSON file."""
        try:
            with open(filename, 'r') as f:
                return json.load(f)
        except FileNotFoundError:
            return None
    
    def cleanup_test_data(self) -> None:
        """Clean up generated test data."""
        self.fake_users.clear()
        self.fake_products.clear()
        self.fake_categories.clear()
        self.fake_orders.clear()
        self.fake_invoices.clear()

# Global instance for easy access
test_data_helper = TestDataHelper() 