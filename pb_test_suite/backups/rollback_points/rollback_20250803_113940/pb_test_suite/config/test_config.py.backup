# [TEST] TEST SUITE CONFIGURATION

import os
import sys
from pathlib import Path

# Add the project root to Python path
PROJECT_ROOT = Path(__file__).parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

class TestConfig:
    """Test Suite Configuration"""
    
    # 📁 PROJECT PATHS
    PROJECT_ROOT = PROJECT_ROOT
    BACKEND_PATH = PROJECT_ROOT / "backend"
    FRONTEND_PATH = PROJECT_ROOT / "frontend"
    TEST_SUITE_PATH = PROJECT_ROOT / "pb_test_suite"
    
    # 📁 TEST SUITE PATHS
    # Detect correct backup directory case (Backups vs backups)
    _backup_base = "Backups" if (TEST_SUITE_PATH / "Backups").exists() else "backups"
    BACKUPS_PATH = TEST_SUITE_PATH / _backup_base
    REPORTS_PATH = TEST_SUITE_PATH / "reports"
    SCRIPTS_PATH = TEST_SUITE_PATH / "scripts"
    CONFIG_PATH = TEST_SUITE_PATH / "config"
    
    # 📁 BACKUP PATHS
    SUCCESSFUL_STATES_PATH = BACKUPS_PATH / "successful_states"
    SNAPSHOTS_PATH = BACKUPS_PATH / "snapshots"
    ROLLBACK_POINTS_PATH = BACKUPS_PATH / "rollback_points"
    
    # [URL] BACKEND API CONFIGURATION
    BACKEND_API_BASE_URL = "http://localhost:5005"
    BASE_URL = "http://localhost:5005"  # For backward compatibility
    BACKEND_API_ENDPOINTS = {
        'auth': '/api/auth',
        'admin': '/api/admin',
        'site_settings': '/api/site-settings',
        'admin_site_settings': '/api/admin/site-settings',
        'products': '/api/products',
        'categories': '/api/categories',
        'orders': '/api/orders',
        'invoices': '/api/invoices',
        'cart': '/api/cart',
        'users': '/api/users',
        'themes': '/api/themes',
        'uploads': '/api/uploads'
    }
    
    # [URL] FRONTEND CONFIGURATION
    FRONTEND_BASE_URL = "http://localhost:3000"
    FRONTEND_PAGES = {
        'home': '/',
        'login': '/login',
        'register': '/register',
        'admin': '/admin',
        'products': '/products',
        'cart': '/cart',
        'checkout': '/checkout',
        'profile': '/profile',
        'orders': '/orders'
    }
    
    # [TEST] TEST CONFIGURATION
    TEST_SETTINGS = {
        'timeout': 30,  # seconds
        'retry_count': 3,
        'parallel_tests': True,
        'generate_reports': True,
        'create_backups': True,
        'backup_on_success': True,
        'success_threshold': 100,  # % for backup creation
        'duplicate_threshold': 0.85,  # similarity threshold for duplicate detection
        'complexity_threshold': 10,  # max complexity score
        'max_backup_count': 50,  # max backups to keep
        'cleanup_old_backups': True
    }
    
    # 🛡️ CODE INTEGRITY SETTINGS
    CODE_INTEGRITY = {
        'check_duplicates': True,
        'check_complexity': True,
        'check_dead_code': True,
        'check_unused_functions': True,
        'check_security_issues': True,
        'exclude_patterns': [
            '*.pyc',
            '__pycache__',
            '.git',
            'node_modules',
            'uploads',
            'migrations'
        ]
    }
    
    # 📊 REPORTING CONFIGURATION
    REPORTING = {
        'html_reports': True,
        'json_reports': True,
        'coverage_reports': True,
        'performance_reports': True,
        'backup_reports': True,
        'email_reports': False,  # Future feature
        'slack_notifications': False  # Future feature
    }
    
    # 🔐 TEST USER CREDENTIALS
    TEST_USERS = {
        'admin': {
            'username': 'admin',
            'password': 'adminx999',  # REAL ADMIN PASSWORD
            'email': 'admin@pebdeq.com',  # REAL ADMIN EMAIL
            'role': 'admin'
        },
        'user': {
            'username': 'test_user_new',
            'password': 'TestUser123!',  # KNOWN TEST USER PASSWORD
            'email': 'test_user_new@pebdeq.com',  # NEW TEST USER EMAIL
            'role': 'user'
        }
    }
    
    # Direct access properties for backward compatibility
    ADMIN_EMAIL = 'admin@pebdeq.com'  # REAL ADMIN EMAIL
    ADMIN_PASSWORD = 'adminx999'  # REAL ADMIN PASSWORD
    USER_EMAIL = 'test_user_new@pebdeq.com'  # NEW TEST USER EMAIL
    USER_PASSWORD = 'TestUser123!'  # KNOWN TEST USER PASSWORD
    
    # 📄 TEST DATA
    TEST_DATA = {
        'products': {
            'sample_product': {
                'name': 'Test Product',
                'description': 'Test product description',
                'price': 99.99,
                'category_id': 1,
                'stock': 100
            }
        },
        'categories': {
            'sample_category': {
                'name': 'Test Category',
                'description': 'Test category description',
                'slug': 'test-category'
            }
        },
        'orders': {
            'sample_order': {
                'total_amount': 99.99,
                'status': 'pending',
                'items': [
                    {
                        'product_id': 1,
                        'quantity': 1,
                        'price': 99.99
                    }
                ]
            }
        }
    }
    
    # 🎨 THEME TEST DATA
    THEME_DATA = {
        'themes': ['default', 'dark', 'blue', 'green'],
        'test_theme_settings': {
            'theme_name': 'default',
            'primary_color': '#007bff',
            'secondary_color': '#6c757d',
            'background_color': '#ffffff',
            'text_color': '#212529'
        }
    }
    
    # 📧 SELENIUM CONFIGURATION
    SELENIUM_CONFIG = {
        'driver': 'chrome',
        'headless': True,
        'window_size': (1920, 1080),
        'implicit_wait': 10,
        'page_load_timeout': 30,
        'script_timeout': 30
    }
    
    # 📈 PERFORMANCE THRESHOLDS
    PERFORMANCE_THRESHOLDS = {
        'api_response_time': 2.0,  # seconds
        'page_load_time': 5.0,  # seconds
        'theme_switch_time': 0.5,  # seconds
        'database_query_time': 1.0,  # seconds
        'file_upload_time': 10.0  # seconds
    }
    
    @classmethod
    def get_db_path(cls):
        """Get test database path"""
        return cls.BACKEND_PATH / "instance" / "test_app.db"
    
    @classmethod
    def to_dict(cls):
        """Convert configuration to dictionary"""
        return {
            'project_root': str(cls.PROJECT_ROOT),
            'backend_path': str(cls.BACKEND_PATH),
            'frontend_path': str(cls.FRONTEND_PATH),
            'test_suite_path': str(cls.TEST_SUITE_PATH),
            'backups_path': str(cls.BACKUPS_PATH),
            'reports_path': str(cls.REPORTS_PATH),
            'backend_url': cls.BACKEND_API_BASE_URL,
            'frontend_url': cls.FRONTEND_BASE_URL,
            'api_endpoints': cls.BACKEND_API_ENDPOINTS,
            'test_users': cls.TEST_USERS,
            'test_data': cls.TEST_DATA,
            'theme_data': cls.THEME_DATA,
            'selenium_config': cls.SELENIUM_CONFIG,
            'performance_thresholds': cls.PERFORMANCE_THRESHOLDS,
            'backup_directory': str(cls.BACKUPS_PATH),
            'test_db_path': str(cls.get_db_path()),
            'main_db_path': str(cls.BACKEND_PATH / "instance" / "site.db")
        }
    
    @classmethod
    def get_uploads_path(cls):
        """Get uploads directory path"""
        return cls.BACKEND_PATH / "uploads"
    
    @classmethod
    def get_backup_name(cls, timestamp=None):
        """Generate backup name"""
        import datetime
        if not timestamp:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        return f"backup_{timestamp}"
    
    @classmethod
    def validate_config(cls):
        """Validate configuration settings"""
        errors = []
        
        # Check if project paths exist
        if not cls.PROJECT_ROOT.exists():
            errors.append(f"Project root not found: {cls.PROJECT_ROOT}")
        
        if not cls.BACKEND_PATH.exists():
            errors.append(f"Backend path not found: {cls.BACKEND_PATH}")
        
        # Frontend path - make it optional for server deployments
        if not cls.FRONTEND_PATH.exists():
            import os
            if os.path.exists('/opt/pebdeq') or 'SERVER' in os.environ:
                # Server deployment - frontend might be separate, just warn
                print(f"[WARNING] Frontend path not found: {cls.FRONTEND_PATH}")
                print(f"[INFO] This is normal for server-only deployments")
            else:
                # Local development - frontend should exist
                errors.append(f"Frontend path not found: {cls.FRONTEND_PATH}")
        
        # Create required directories
        for path in [cls.BACKUPS_PATH, cls.REPORTS_PATH, cls.SUCCESSFUL_STATES_PATH, 
                     cls.SNAPSHOTS_PATH, cls.ROLLBACK_POINTS_PATH]:
            path.mkdir(parents=True, exist_ok=True)
        
        return errors

# Global config instance
config = TestConfig()

# Validate configuration on import
config_errors = config.validate_config()
if config_errors:
    print("⚠️  Configuration errors found:")
    for error in config_errors:
        print(f"   - {error}")
    print("Please fix these errors before running tests.") 