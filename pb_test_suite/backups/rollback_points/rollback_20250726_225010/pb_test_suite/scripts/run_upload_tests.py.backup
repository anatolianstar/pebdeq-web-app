#!/usr/bin/env python3
"""
File Upload Tests Runner
Runs comprehensive file upload tests including validation, processing, and storage.
"""

import sys
import os
import json
import time
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from tests.backend.test_upload_api import run_upload_api_tests
except ImportError:
    # Fallback: Try direct import
    try:
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'tests', 'backend'))
        from test_upload_api import run_upload_api_tests
    except ImportError:
        # Final fallback: Skip if test module not found
        def run_upload_api_tests():
            return {
                'success': False,
                'message': 'Upload test module not found',
                'results': []
            }

def run_upload_tests():
    """Run all upload-related tests"""
    print("[UPLOAD] Running Upload Tests...")
    
    all_results = []
    
    # Upload API tests
    print("\n[TEST] Running Upload API Tests...")
    try:
        upload_api_results = run_upload_api_tests()
        all_results.extend(upload_api_results)
        print(f"   [PASS] Upload API tests completed: {len(upload_api_results)} tests")
    except Exception as e:
        print(f"   [ERROR] Upload API tests failed: {str(e)}")
        all_results.append({
            'test': 'Upload API Tests',
            'status': 'ERROR',
            'message': f'Failed to run upload API tests: {str(e)}'
        })
    
    return all_results

def main():
    """Main function to run upload tests"""
    print("[START] Starting Upload Test Suite...")
    start_time = time.time()
    
    # Run all upload tests
    results = run_upload_tests()
    
    # Calculate execution time
    execution_time = time.time() - start_time
    print(f"\n[TIME] Total execution time: {execution_time:.2f} seconds")
    
    # Determine exit status
    failed_count = len([r for r in results if r['status'] in ['FAIL', 'ERROR']])
    
    if failed_count == 0:
        print("\n[SUCCESS] All upload tests passed!")
        sys.exit(0)
    else:
        print(f"\n[FAILED] {failed_count} upload tests failed!")
        sys.exit(1)

if __name__ == '__main__':
    main() 