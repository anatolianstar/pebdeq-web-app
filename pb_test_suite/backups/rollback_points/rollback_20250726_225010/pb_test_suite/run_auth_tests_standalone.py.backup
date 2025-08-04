#!/usr/bin/env python3
"""
Standalone Authentication Test Runner
Can be run from any directory - automatically changes to correct path
"""

import os
import sys
from pathlib import Path

def main():
    """Main function to run auth tests from any directory"""
    
    # Find the correct directory
    current_dir = Path(__file__).parent
    pb_test_suite_dir = current_dir
    
    # If we're not in pb_test_suite, try to find it
    if not (current_dir / "backend_tests").exists():
        # Look for pb_test_suite in common locations
        possible_locations = [
            Path.cwd() / "pb_test_suite",
            Path.cwd().parent / "pb_test_suite", 
            Path(__file__).parent.parent / "pb_test_suite"
        ]
        
        for location in possible_locations:
            if location.exists() and (location / "backend_tests").exists():
                pb_test_suite_dir = location
                break
        else:
            print("❌ Error: Cannot find pb_test_suite directory with backend_tests folder")
            print("📍 Current directory:", Path.cwd())
            print("📍 Script location:", Path(__file__).parent)
            return 1
    
    print(f"📁 Using pb_test_suite directory: {pb_test_suite_dir}")
    
    # Change to pb_test_suite directory
    os.chdir(pb_test_suite_dir)
    
    # Add to Python path
    if str(pb_test_suite_dir) not in sys.path:
        sys.path.insert(0, str(pb_test_suite_dir))
    
    try:
        # Now import and run the tests
        print("🔍 Testing JWT import...")
        import jwt
        print(f"✅ JWT version: {jwt.__version__}")
        
        print("🔍 Testing auth test import...")
        from backend_tests.api.test_auth import AuthenticationAPITests
        print("✅ AuthenticationAPITests imported successfully")
        
        print("🚀 Running authentication tests...")
        
        # Import and run the test runner
        from scripts.run_auth_tests import AuthTestRunner
        
        runner = AuthTestRunner()
        result = runner.run_tests()
        
        if result.get('success', False):
            print("🎉 All authentication tests passed!")
            return 0
        else:
            print("❌ Some authentication tests failed!")
            return 1
            
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("🔧 Try installing dependencies:")
        print("   cd pb_test_suite")
        print("   pip install -r requirements.txt")
        return 1
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code) 