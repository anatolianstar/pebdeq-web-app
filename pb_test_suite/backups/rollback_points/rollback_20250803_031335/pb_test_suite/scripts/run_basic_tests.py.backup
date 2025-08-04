#!/usr/bin/env python3
# [TEST] RUN BASIC TESTS

import os
import sys
import unittest
import subprocess
from pathlib import Path
from datetime import datetime

# Add the test suite to Python path
sys.path.insert(0, str(Path(__file__).parent.parent))

from config.test_config import config

def main():
    """Run basic tests to validate setup"""
    print("[TEST] Running basic test suite...")
    print(f"📁 Test suite path: {config.TEST_SUITE_PATH}")
    print(f"⏰ Start time: {datetime.now()}")
    
    # Change to test suite directory
    os.chdir(config.TEST_SUITE_PATH)
    
    # Run basic setup test
    print("\n🔍 Running basic setup validation...")
    
    try:
        # Import and run the basic setup test
        from backend_tests.api.test_basic_setup import TestBasicSetup
        
        # Create test suite
        suite = unittest.TestSuite()
        
        # Add all tests from TestBasicSetup
        test_loader = unittest.TestLoader()
        suite.addTests(test_loader.loadTestsFromTestCase(TestBasicSetup))
        
        # Run tests
        runner = unittest.TextTestRunner(verbosity=2)
        result = runner.run(suite)
        
        # Print results
        print(f"\n📊 Test Results:")
        print(f"   Tests run: {result.testsRun}")
        print(f"   Failures: {len(result.failures)}")
        print(f"   Errors: {len(result.errors)}")
        
        if result.failures:
            print("\n❌ Test Failures:")
            for test, traceback in result.failures:
                print(f"   - {test}: {traceback}")
        
        if result.errors:
            print("\n❌ Test Errors:")
            for test, traceback in result.errors:
                print(f"   - {test}: {traceback}")
        
        # Calculate success rate
        total_tests = result.testsRun
        failed_tests = len(result.failures) + len(result.errors)
        success_rate = ((total_tests - failed_tests) / total_tests * 100) if total_tests > 0 else 0
        
        print(f"\n📈 Success Rate: {success_rate:.1f}%")
        
        if success_rate == 100:
            print("🎉 All tests passed! Test setup is working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Please check the setup.")
            return False
            
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return False

def check_dependencies():
    """Check if required dependencies are installed"""
    print("📋 Checking dependencies...")
    
    required_packages = [
        'pytest',
        'requests',
        'unittest'  # Built-in, should always be available
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
            print(f"   ✅ {package}")
        except ImportError:
            print(f"   ❌ {package} - Missing")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n📦 Missing packages: {missing_packages}")
        print("Install with: pip install -r requirements.txt")
        return False
    
    return True

def check_project_structure():
    """Check if project structure is correct"""
    print("📁 Checking project structure...")
    
    required_paths = [
        config.PROJECT_ROOT,
        config.BACKEND_PATH,
        config.FRONTEND_PATH,
        config.TEST_SUITE_PATH
    ]
    
    missing_paths = []
    
    for path in required_paths:
        if path.exists():
            print(f"   ✅ {path}")
        else:
            print(f"   ❌ {path} - Missing")
            missing_paths.append(path)
    
    if missing_paths:
        print(f"\n📁 Missing paths: {missing_paths}")
        return False
    
    return True

def run_with_pytest():
    """Run tests using pytest"""
    print("[TEST] Running tests with pytest...")
    
    try:
        # Run pytest on the basic setup test
        cmd = [
            sys.executable, '-m', 'pytest', 
            'backend_tests/api/test_basic_setup.py',
            '-v', '--tb=short'
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        print("📄 Pytest output:")
        print(result.stdout)
        
        if result.stderr:
            print("⚠️  Pytest errors:")
            print(result.stderr)
        
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ Error running pytest: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Starting basic test validation...")
    
    # Check dependencies
    if not check_dependencies():
        print("❌ Dependency check failed!")
        sys.exit(1)
    
    # Check project structure
    if not check_project_structure():
        print("❌ Project structure check failed!")
        sys.exit(1)
    
    # Run basic tests
    success = main()
    
    if success:
        print("\n🎉 Basic test suite completed successfully!")
        print("\n🚀 Next steps:")
        print("1. Review test reports in reports/ directory")
        print("2. Run specific test categories:")
        print("   python scripts/run_backend_tests.py")
        print("   python scripts/run_frontend_tests.py")
        print("3. Check code integrity:")
        print("   python scripts/check_code_integrity.py")
        sys.exit(0)
    else:
        print("\n❌ Basic test suite failed!")
        print("\n🔧 Troubleshooting:")
        print("1. Check configuration: python scripts/validate_config.py")
        print("2. Install dependencies: pip install -r requirements.txt")
        print("3. Run setup again: python scripts/setup_test_environment.py")
        sys.exit(1) 