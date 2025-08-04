#!/usr/bin/env python3
"""
Admin Test Suite Runner
Runs comprehensive admin tests including authentication, API operations, and site settings.
"""

import sys
import os
import json
import time
from datetime import datetime

# Add parent directory to path to import test modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Add parent directory to path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, parent_dir)

# Import test functions using direct file loading
import importlib.util

# Initialize function variables
run_all_tests = None

test_files = [
    ('tests/backend/test_admin_api.py', 'run_all_tests'),
]

for test_file, func_name in test_files:
    test_file_path = os.path.join(parent_dir, test_file)
    if os.path.exists(test_file_path):
        spec = importlib.util.spec_from_file_location(f"test_module_{func_name}", test_file_path)
        if spec is not None and spec.loader is not None:
            test_module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(test_module)
            globals()[func_name] = getattr(test_module, func_name)
        else:
            print(f"[ERROR] Could not load {test_file}")
            sys.exit(1)
    else:
        print(f"[ERROR] Test file not found: {test_file_path}")
        sys.exit(1)

def run_admin_tests():
    """Run all admin-related tests"""
    print("[ADMIN] Running Admin Tests...")
    
    all_results = []
    
    # Test categories to run
    test_categories = [
        {
            'name': 'Admin API Tests', 
            'description': 'Admin panel CRUD operations',
            'function': run_all_tests,
            'category': 'admin_api'
        }
    ]
    
    for category in test_categories:
        print(f"\n[TEST] Running {category['name']}...")
        print(f"   {category['description']}")
        
        try:
            results = category['function']()
            all_results.extend(results if isinstance(results, list) else [results])
            
            # Parse and display results
            if isinstance(results, dict) and 'tests_run' in results:
                success_count = results.get('tests_run', 0) - results.get('failures', 0) - results.get('errors', 0)
                total_count = results.get('tests_run', 0)
                print(f"   [PASS] {success_count}/{total_count} tests passed")
            elif isinstance(results, list):
                passed = len([r for r in results if r.get('status') == 'PASS'])
                total = len(results)
                print(f"   [PASS] {passed}/{total} tests passed")
            
        except Exception as e:
            print(f"   [ERROR] Error running {category['name']}: {str(e)}")
            all_results.append({
                'category': category['name'],
                'error': str(e),
                'status': 'ERROR'
            })
    
    return all_results

def generate_admin_test_report(results):
    """Generate detailed admin test report"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Calculate statistics
    auth_results = [r for r in results if 'auth' in str(r).lower()]
    admin_results = [r for r in results if 'admin' in str(r).lower() and 'auth' not in str(r).lower()]
    settings_results = [r for r in results if 'settings' in str(r).lower() or 'site' in str(r).lower()]
    
    report = {
        'timestamp': timestamp,
        'test_type': 'Admin Tests',
        'categories': {
            'authentication': {
                'results': auth_results,
                'count': len(auth_results)
            },
            'admin_api': {
                'results': admin_results,
                'count': len(admin_results)
            },
            'site_settings': {
                'results': settings_results,
                'count': len(settings_results)
            }
        },
        'all_results': results
    }
    
    # Ensure reports directory exists with proper permissions
    reports_dir = 'reports/admin_tests'
    try:
        os.makedirs(reports_dir, exist_ok=True)
        # Try to set proper permissions for server deployment
        import stat
        os.chmod(reports_dir, stat.S_IRWXU | stat.S_IRWXG | stat.S_IROTH | stat.S_IXOTH)
    except PermissionError:
        # Fallback to current directory if reports dir not writable
        reports_dir = f"admin_tests_report_{timestamp}"
        print(f"[WARNING] Cannot write to reports/admin_tests/, using current directory")
    except Exception as e:
        print(f"[WARNING] Directory creation issue: {e}")
        reports_dir = f"admin_tests_report_{timestamp}"
    
    # Save JSON report with error handling
    json_report_path = f"{reports_dir}/admin_tests_report_{timestamp}.json" if '/' in reports_dir else f"{reports_dir}.json"
    try:
        with open(json_report_path, 'w') as f:
            json.dump(report, f, indent=2, default=str)
        print(f"[SUCCESS] Report saved: {json_report_path}")
    except PermissionError as e:
        # Ultimate fallback - try to save in /tmp or current directory
        fallback_path = f"/tmp/admin_tests_report_{timestamp}.json"
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

def print_admin_test_summary(results):
    """Print admin test summary to console"""
    print("\n" + "=" * 80)
    print("ADMIN TEST SUMMARY")
    print("=" * 80)
    
    # Calculate per-category results
    categories = {
        'Authentication Tests': [],
        'Admin API Tests': [],
        'Site Settings Tests': []
    }
    
    for result in results:
        if isinstance(result, dict):
            test_name = result.get('test', '')
            category_key = result.get('category', '')
            
            if 'auth' in test_name.lower() or 'login' in test_name.lower() or 'token' in test_name.lower():
                categories['Authentication Tests'].append(result)
            elif 'admin' in test_name.lower() and 'auth' not in test_name.lower():
                categories['Admin API Tests'].append(result)
            elif 'settings' in test_name.lower() or 'site' in test_name.lower():
                categories['Site Settings Tests'].append(result)
    
    passed_tests = 0
    failed_tests = 0
    error_tests = 0
    
    for category_name, category_results in categories.items():
        if category_results:
            print(f"\n[TEST] {category_name}:")
            
            # Handle different result formats
            if isinstance(category_results[0], dict) and 'tests_run' in category_results[0]:
                # unittest format
                result = category_results[0]
                tests_run = result.get('tests_run', 0)
                failures = result.get('failures', 0)
                errors = result.get('errors', 0)
                passed = tests_run - failures - errors
                
                passed_tests += passed
                failed_tests += failures
                error_tests += errors
                
                print(f"   [PASS] Passed: {passed}/{tests_run}")
                if failures > 0:
                    print(f"   [FAIL] Failed: {failures}")
                if errors > 0:
                    print(f"   [ERROR] Errors: {errors}")
            else:
                # Custom test format
                tests_count = len(category_results)
                passed = len([r for r in category_results if r.get('status') == 'PASS'])
                failed = len([r for r in category_results if r.get('status') == 'FAIL'])
                errors = len([r for r in category_results if r.get('status') == 'ERROR'])
                
                passed_tests += passed
                failed_tests += failed
                error_tests += errors
                
                print(f"   [PASS] Passed: {passed}/{tests_count}")
                if failed > 0:
                    print(f"   [FAIL] Failed: {failed}")
                if errors > 0:
                    print(f"   [ERROR] Errors: {errors}")
    
    print(f"\n[OVERALL] OVERALL RESULTS:")
    total_tests = passed_tests + failed_tests + error_tests
    print(f"   Total Tests: {total_tests}")
    print(f"   [PASS] Passed: {passed_tests}")
    print(f"   [FAIL] Failed: {failed_tests}")
    print(f"   [ERROR] Errors: {error_tests}")
    
    if total_tests > 0:
        success_rate = (passed_tests / total_tests) * 100
        print(f"   [RATE] Success Rate: {success_rate:.1f}%")
        
        if success_rate >= 95:
            print(f"   [EXCELLENT] Excellent! All systems operational.")
        elif success_rate >= 80:
            print(f"   [GOOD] Good performance with minor issues.")
        elif success_rate >= 60:
            print(f"   [WARNING] Warning! Multiple issues detected.")
        else:
            print(f"   [CRITICAL] Critical! Major issues require attention.")
    
    print("=" * 80)

def main():
    """Main function to run admin tests"""
    print("[START] Starting Admin Test Suite...")
    start_time = time.time()
    
    # Run all admin tests
    results = run_admin_tests()
    
    # Generate report
    report_path = generate_admin_test_report(results)
    if report_path:
        print(f"\n[REPORT] Report saved: {report_path}")
    else:
        print("\n[REPORT] Report could not be saved.")
    
    # Print summary
    print_admin_test_summary(results)
    
    # Calculate execution time
    execution_time = time.time() - start_time
    print(f"\n[TIME] Total execution time: {execution_time:.2f} seconds")
    
    # Determine exit status
    if isinstance(results, list):
        failed_count = len([r for r in results if r.get('status') in ['FAIL', 'ERROR']])
    else:
        failed_count = results.get('failures', 0) + results.get('errors', 0)
    
    if failed_count == 0:
        print("\n[SUCCESS] All admin tests passed!")
        sys.exit(0)
    else:
        print(f"\n[FAILED] {failed_count} admin tests failed!")
        sys.exit(1)

if __name__ == '__main__':
    main() 