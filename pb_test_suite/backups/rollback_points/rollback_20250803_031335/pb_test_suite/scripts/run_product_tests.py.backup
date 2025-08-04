#!/usr/bin/env python3
"""
Product Management Tests Runner
Runs comprehensive product management tests including CRUD, category management, and variations.
"""

import sys
import os
import json
import time
from datetime import datetime

# Add parent directory to path  
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

try:
    from tests.backend.test_product_api import run_product_api_tests
except ImportError:
    # Fallback to absolute import
    import importlib.util
    test_file_path = os.path.join(parent_dir, 'tests', 'backend', 'test_product_api.py')
    spec = importlib.util.spec_from_file_location("test_product_api", test_file_path)
    if spec is not None and spec.loader is not None:
        test_module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(test_module)
        run_product_api_tests = test_module.run_product_api_tests
    else:
        raise ImportError(f"Could not load test module from {test_file_path}")

def run_product_tests():
    """Run all product-related tests"""
    print("[PRODUCT] Running Product Tests...")
    
    all_results = []
    
    # Product API tests
    print("\n[TEST] Running Product API Tests...")
    try:
        product_api_results = run_product_api_tests()
        all_results.extend(product_api_results)
        print(f"   [PASS] Product API tests completed: {len(product_api_results)} tests")
    except Exception as e:
        print(f"   [ERROR] Product API tests failed: {str(e)}")
        all_results.append({
            'test': 'Product API Tests',
            'status': 'ERROR',
            'message': f'Failed to run product API tests: {str(e)}'
        })
    
    return all_results

def generate_product_test_report(results):
    """Generate detailed product test report"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Ensure reports directory exists with proper permissions
    reports_dir = 'reports/product_tests'
    try:
        os.makedirs(reports_dir, exist_ok=True)
        # Try to set proper permissions for server deployment
        import stat
        os.chmod(reports_dir, stat.S_IRWXU | stat.S_IRWXG | stat.S_IROTH | stat.S_IXOTH)
    except PermissionError:
        # Fallback to current directory if reports dir not writable
        reports_dir = f"product_tests_report_{timestamp}"
        print(f"[WARNING] Cannot write to reports/product_tests/, using current directory")
    except Exception as e:
        print(f"[WARNING] Directory creation issue: {e}")
        reports_dir = f"product_tests_report_{timestamp}"
    
    # Calculate statistics
    total_tests = len(results)
    passed_tests = len([r for r in results if r['status'] == 'PASS'])
    failed_tests = len([r for r in results if r['status'] == 'FAIL'])
    error_tests = len([r for r in results if r['status'] == 'ERROR'])
    
    report = {
        'timestamp': timestamp,
        'test_type': 'Product Management Tests',
        'summary': {
            'total_tests': total_tests,
            'passed_tests': passed_tests,
            'failed_tests': failed_tests,
            'error_tests': error_tests,
            'success_rate': (passed_tests / total_tests * 100) if total_tests > 0 else 0
        },
        'results': results
    }
    
    # Save JSON report with error handling
    json_report_path = f"{reports_dir}/product_test_results_{timestamp}.json" if '/' in reports_dir else f"{reports_dir}.json"
    try:
        with open(json_report_path, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        print(f"[SUCCESS] Report saved: {json_report_path}")
    except PermissionError as e:
        # Ultimate fallback - try to save in /tmp or current directory
        fallback_path = f"/tmp/product_test_results_{timestamp}.json"
        try:
            with open(fallback_path, 'w') as f:
                json.dump(report, f, indent=2, default=str)
            print(f"[FALLBACK] Report saved to: {fallback_path}")
            json_report_path = fallback_path
        except:
            print(f"[ERROR] Could not save report anywhere: {e}")
            json_report_path = None
    except Exception as e:
        print(f"[ERROR] Report save error: {e}")
        json_report_path = None
    
    return json_report_path

def print_product_test_summary(results):
    """Print product test summary to console"""
    print("\n" + "=" * 80)
    print("PRODUCT MANAGEMENT TEST SUMMARY")
    print("=" * 80)
    
    total = len(results)
    passed = len([r for r in results if r['status'] == 'PASS'])
    failed = len([r for r in results if r['status'] == 'FAIL'])
    errors = len([r for r in results if r['status'] == 'ERROR'])
    
    print(f"Total Tests: {total}")
    print(f"[PASS] Passed: {passed}")
    print(f"[FAIL] Failed: {failed}")
    print(f"[ERROR] Errors: {errors}")
    
    if total > 0:
        success_rate = (passed / total) * 100
        print(f"Success Rate: {success_rate:.1f}%")
    
    print(f"\n[TEST] Test Details:")
    print("-" * 80)
    
    for result in results:
        status_icon = {
            'PASS': '[PASS]',
            'FAIL': '[FAIL]', 
            'ERROR': '[ERROR]'
        }.get(result['status'], '[UNKNOWN]')
        
        print(f"{status_icon} {result['test']}: {result['message']}")
    
    print("=" * 80)

def main():
    """Main function to run product tests"""
    print("[START] Starting Product Test Suite...")
    start_time = time.time()
    
    # Run all product tests
    results = run_product_tests()
    
    # Generate report
    report_path = generate_product_test_report(results)
    if report_path:
        print(f"\n[REPORT] Report saved: {report_path}")
    else:
        print("\n[REPORT] Report could not be saved.")
    
    # Print summary
    print_product_test_summary(results)
    
    # Calculate execution time
    execution_time = time.time() - start_time
    print(f"\n[TIME] Total execution time: {execution_time:.2f} seconds")
    
    # Determine exit status
    failed_count = len([r for r in results if r['status'] in ['FAIL', 'ERROR']])
    
    if failed_count == 0:
        print("\n[SUCCESS] All product tests passed!")
        sys.exit(0)
    else:
        print(f"\n[FAILED] {failed_count} product tests failed!")
        sys.exit(1)

if __name__ == '__main__':
    main() 