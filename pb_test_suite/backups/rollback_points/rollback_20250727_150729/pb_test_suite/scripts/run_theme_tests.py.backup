#!/usr/bin/env python3
"""
Theme System Tests Runner
Runs comprehensive theme system tests including switching, CSS generation, and performance.
"""

import sys
import os
import json
import time
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from tests.backend.test_theme_api import run_theme_api_tests
except ImportError:
    # Fallback: Try direct import
    try:
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'tests', 'backend'))
        from test_theme_api import run_theme_api_tests
    except ImportError:
        # Final fallback: Skip if test module not found
        def run_theme_api_tests():
            return {
                'success': False,
                'message': 'Theme test module not found',
                'results': []
            }

def run_theme_tests():
    """Run all theme-related tests"""
    print("[THEME] Running Theme Tests...")
    
    all_results = []
    
    # Theme API tests
    print("\n[TEST] Running Theme API Tests...")
    try:
        theme_api_results = run_theme_api_tests()
        all_results.extend(theme_api_results)
        print(f"   [PASS] Theme API tests completed: {len(theme_api_results)} tests")
    except Exception as e:
        print(f"   [ERROR] Theme API tests failed: {str(e)}")
        all_results.append({
            'test': 'Theme API Tests',
            'status': 'ERROR',
            'message': f'Failed to run theme API tests: {str(e)}'
        })
    
    return all_results

def main():
    """Main function to run theme tests"""
    print("[START] Starting Theme Test Suite...")
    start_time = time.time()
    
    # Run all theme tests
    results = run_theme_tests()
    
    # Calculate execution time
    execution_time = time.time() - start_time
    print(f"\n[TIME] Total execution time: {execution_time:.2f} seconds")
    
    # Determine exit status
    failed_count = len([r for r in results if r['status'] in ['FAIL', 'ERROR']])
    
    if failed_count == 0:
        print("\n[SUCCESS] All theme tests passed!")
        sys.exit(0)
    else:
        print(f"\n[FAILED] {failed_count} theme tests failed!")
        sys.exit(1)

if __name__ == '__main__':
    main() 