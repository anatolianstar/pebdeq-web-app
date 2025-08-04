#!/usr/bin/env python3
# 🚀 TEST ENVIRONMENT SETUP

import os
import sys
import subprocess
from pathlib import Path
import json
from datetime import datetime

# Add the project root to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.test_config import config

def main():
    """Set up the test environment"""
    print("🚀 Setting up test environment...")
    
    # Validate configuration
    print("\n🔍 Validating configuration...")
    errors = config.validate_config()
    
    if errors:
        print("❌ Configuration errors found:")
        for error in errors:
            print(f"   - {error}")
        return False
    
    print("✅ Configuration validation passed!")
    
    # Check Python version
    print(f"\n🐍 Python version: {sys.version}")
    
    # Check required directories
    print("\n📁 Checking directories...")
    required_dirs = [
        config.BACKUPS_PATH,
        config.REPORTS_PATH,
        config.SUCCESSFUL_STATES_PATH,
        config.SNAPSHOTS_PATH,
        config.ROLLBACK_POINTS_PATH
    ]
    
    for directory in required_dirs:
        if directory.exists():
            print(f"   ✅ {directory}")
        else:
            print(f"   📁 Creating {directory}")
            directory.mkdir(parents=True, exist_ok=True)
    
    # Check backend and frontend paths
    print("\n📦 Checking project paths...")
    if config.BACKEND_PATH.exists():
        print(f"   ✅ Backend: {config.BACKEND_PATH}")
    else:
        print(f"   ❌ Backend not found: {config.BACKEND_PATH}")
    
    if config.FRONTEND_PATH.exists():
        print(f"   ✅ Frontend: {config.FRONTEND_PATH}")
    else:
        print(f"   ❌ Frontend not found: {config.FRONTEND_PATH}")
    
    # Check if requirements are installed
    print("\n📋 Checking dependencies...")
    try:
        import pytest
        print("   ✅ pytest")
    except ImportError:
        print("   ❌ pytest not installed")
    
    try:
        import requests
        print("   ✅ requests")
    except ImportError:
        print("   ❌ requests not installed")
    
    # Create initial configuration file
    print("\n⚙️  Creating initial configuration...")
    create_initial_config()
    
    # Create test data
    print("\n📄 Creating test data...")
    create_test_data()
    
    print("\n🎉 Test environment setup complete!")
    print(f"📁 Test suite location: {config.TEST_SUITE_PATH}")
    print(f"📁 Reports location: {config.REPORTS_PATH}")
    print(f"📁 Backups location: {config.BACKUPS_PATH}")
    
    return True

def create_initial_config():
    """Create initial configuration files"""
    
    # Create pytest.ini
    pytest_ini = config.TEST_SUITE_PATH / "pytest.ini"
    pytest_content = """[tool:pytest]
testpaths = backend_tests frontend_tests integration_tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
addopts = 
    -v
    --tb=short
    --strict-markers
    --disable-warnings
    --html=reports/test_report.html
    --self-contained-html
    --junitxml=reports/junit.xml
    --cov=.
    --cov-report=html:reports/coverage_html
    --cov-report=term-missing
markers =
    slow: marks tests as slow (deselect with '-m "not slow"')
    integration: marks tests as integration tests
    unit: marks tests as unit tests
    api: marks tests as API tests
    ui: marks tests as UI tests
    security: marks tests as security tests
    performance: marks tests as performance tests
"""
    
    with open(pytest_ini, 'w') as f:
        f.write(pytest_content)
    
    print(f"   ✅ Created pytest.ini")
    
    # Create .gitignore
    gitignore = config.TEST_SUITE_PATH / ".gitignore"
    gitignore_content = """# Test reports
reports/
*.log

# Python cache
__pycache__/
*.pyc
*.pyo
*.pyd

# Coverage
.coverage
htmlcov/

# Test databases
*.db
test_*.db

# Backup files
backups/snapshots/
backups/rollback_points/

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db
"""
    
    with open(gitignore, 'w') as f:
        f.write(gitignore_content)
    
    print(f"   ✅ Created .gitignore")

def create_test_data():
    """Create test data files"""
    
    # Create test data directory
    test_data_dir = config.CONFIG_PATH / "test_data"
    test_data_dir.mkdir(exist_ok=True)
    
    # Create sample API responses
    api_responses = {
        "auth_login_success": {
            "token": "sample_jwt_token",
            "user": {
                "id": 1,
                "username": "test_user",
                "role": "user"
            }
        },
        "auth_login_admin": {
            "token": "sample_admin_jwt_token", 
            "user": {
                "id": 2,
                "username": "test_admin",
                "role": "admin"
            }
        },
        "site_settings_response": {
            "site_title": "Test Site",
            "theme": "default",
            "google_client_id": "test_google_client_id"
        }
    }
    
    with open(test_data_dir / "api_responses.json", 'w') as f:
        json.dump(api_responses, f, indent=2)
    
    print(f"   ✅ Created test data files")

def check_backend_running():
    """Check if backend is running"""
    try:
        import requests
        response = requests.get(f"{config.BACKEND_API_BASE_URL}/api/health", timeout=5)
        return response.status_code == 200
    except:
        return False

def check_frontend_running():
    """Check if frontend is running"""
    try:
        import requests
        response = requests.get(config.FRONTEND_BASE_URL, timeout=5)
        return response.status_code == 200
    except:
        return False

def install_dependencies():
    """Install required dependencies"""
    print("\n📦 Installing dependencies...")
    
    requirements_file = config.TEST_SUITE_PATH / "requirements.txt"
    
    if requirements_file.exists():
        try:
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", str(requirements_file)])
            print("   ✅ Dependencies installed")
            return True
        except subprocess.CalledProcessError:
            print("   ❌ Failed to install dependencies")
            return False
    else:
        print("   ❌ requirements.txt not found")
        return False

if __name__ == "__main__":
    success = main()
    
    if success:
        print("\n🎉 Setup completed successfully!")
        print("\n🚀 Next steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Start backend server: cd backend && python run.py")
        print("3. Start frontend server: cd frontend && npm start")
        print("4. Run tests: python scripts/run_basic_tests.py")
        sys.exit(0)
    else:
        print("\n❌ Setup failed!")
        sys.exit(1) 