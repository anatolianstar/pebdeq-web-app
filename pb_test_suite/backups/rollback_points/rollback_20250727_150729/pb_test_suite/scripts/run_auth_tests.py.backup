#!/usr/bin/env python3
"""
Authentication Tests Runner
Executes authentication API tests and provides detailed reporting.
"""

import sys
import os
import unittest
import json
import time
from datetime import datetime
from pathlib import Path

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from config.test_config import TestConfig
from backend_tests.api.test_auth import AuthenticationAPITests
from core.code_integrity import CodeIntegrityChecker
from helpers.environment_manager import EnvironmentManager

class AuthTestRunner:
    """Authentication test runner with detailed reporting."""
    
    def __init__(self):
        """Initialize test runner."""
        self.config = TestConfig()
        self.results = {
            'start_time': None,
            'end_time': None,
            'total_tests': 0,
            'passed_tests': 0,
            'failed_tests': 0,
            'error_tests': 0,
            'skipped_tests': 0,
            'test_results': [],
            'performance_metrics': {},
            'environment_status': {}
        }
        
        # Ensure reports directory exists with proper permissions
        try:
            os.makedirs('reports/auth_tests', exist_ok=True)
            # Try to set proper permissions for server deployment
            import stat
            os.chmod('reports/auth_tests', stat.S_IRWXU | stat.S_IRWXG | stat.S_IROTH | stat.S_IXOTH)
        except PermissionError:
            # Fallback - script will handle directory creation later
            print(f"[WARNING] Cannot create reports/auth_tests/, will use fallback during report generation")
        except Exception as e:
            print(f"[WARNING] Directory creation issue during init: {e}")
    
    def run_tests(self):
        """Run all authentication tests."""
        print("=" * 80)
        print("AUTHENTICATION API TESTS")
        print("=" * 80)
        
        # Setup environment
        env_manager = EnvironmentManager(self.config.to_dict())
        
        try:
            # Check environment status
            env_status = env_manager.get_environment_status()
            self.results['environment_status'] = env_status
            
            print(f"Environment Status:")
            print(f"  Database exists: {env_status.get('database_exists', 'Unknown')}")
            print(f"  Backend accessible: {env_status.get('backend_accessible', 'Unknown')}")
            print(f"  Backup count: {env_status.get('backup_count', 0)}")
            print()
            
            # Run tests
            self.results['start_time'] = datetime.now()
            
            # Create test suite
            suite = unittest.TestLoader().loadTestsFromTestCase(AuthenticationAPITests)
            
            # Run tests with custom result handler
            runner = unittest.TextTestRunner(
                verbosity=2,
                stream=sys.stdout,
                resultclass=self._create_result_class()
            )
            
            result = runner.run(suite)
            
            self.results['end_time'] = datetime.now()
            
            # Process results
            self._process_results(result)
            
            # Generate reports
            self._generate_reports()
            
            # Print summary
            self._print_summary()
            
            return result.wasSuccessful()
            
        except Exception as e:
            print(f"Error running tests: {str(e)}")
            return False
    
    def _create_result_class(self):
        """Create custom test result class for detailed reporting."""
        results = self.results
        
        class DetailedTestResult(unittest.TextTestResult):
            def __init__(self, stream, descriptions, verbosity):
                super().__init__(stream, descriptions, verbosity)
                self.test_start_time = time.time()
                
            def startTest(self, test):
                super().startTest(test)
                self.test_start_time = time.time()
            
            def addSuccess(self, test):
                super().addSuccess(test)
                duration = time.time() - getattr(self, 'test_start_time', time.time())
                results['test_results'].append({
                    'test_name': str(test),
                    'status': 'PASSED',
                    'duration': duration,
                    'error': None
                })
                results['passed_tests'] += 1
            
            def addError(self, test, err):
                super().addError(test, err)
                duration = time.time() - getattr(self, 'test_start_time', time.time())
                results['test_results'].append({
                    'test_name': str(test),
                    'status': 'ERROR',
                    'duration': duration,
                    'error': self._exc_info_to_string(err, test)
                })
                results['error_tests'] += 1
            
            def addFailure(self, test, err):
                super().addFailure(test, err)
                duration = time.time() - getattr(self, 'test_start_time', time.time())
                results['test_results'].append({
                    'test_name': str(test),
                    'status': 'FAILED',
                    'duration': duration,
                    'error': str(err[1]) if err else None
                })
                results['failed_tests'] += 1
            
            def addSkip(self, test, reason):
                super().addSkip(test, reason)
                results['test_results'].append({
                    'test_name': str(test),
                    'status': 'SKIPPED',
                    'duration': 0,
                    'error': reason
                })
                results['skipped_tests'] += 1
        
        return DetailedTestResult
    
    def _process_results(self, result):
        """Process test results and calculate metrics."""
        self.results['total_tests'] = result.testsRun
        
        # Calculate performance metrics
        durations = [test['duration'] for test in self.results['test_results'] if test['duration'] > 0]
        
        if durations:
            self.results['performance_metrics'] = {
                'total_duration': sum(durations),
                'average_duration': sum(durations) / len(durations),
                'min_duration': min(durations),
                'max_duration': max(durations),
                'slowest_tests': sorted(
                    [test for test in self.results['test_results'] if test['duration'] > 0],
                    key=lambda x: x['duration'],
                    reverse=True
                )[:5]
            }
    
    def _generate_reports(self):
        """Generate detailed test reports."""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Ensure reports directory exists with fallback
        reports_dir = 'reports/auth_tests'
        try:
            import os
            os.makedirs(reports_dir, exist_ok=True)
            # Try to set proper permissions for server deployment
            import stat
            os.chmod(reports_dir, stat.S_IRWXU | stat.S_IRWXG | stat.S_IROTH | stat.S_IXOTH)
        except PermissionError:
            # Fallback to current directory if reports dir not writable
            reports_dir = f"auth_tests_report_{timestamp}"
            print(f"[WARNING] Cannot write to reports/auth_tests/, using current directory")
        except Exception as e:
            print(f"[WARNING] Directory creation issue: {e}")
            reports_dir = f"auth_tests_report_{timestamp}"
        
        # JSON report with error handling
        json_report_path = f"{reports_dir}/auth_test_results_{timestamp}.json" if '/' in reports_dir else f"{reports_dir}.json"
        try:
            with open(json_report_path, 'w') as f:
                json.dump(self.results, f, indent=2, default=str)
            print(f"[SUCCESS] JSON report saved: {json_report_path}")
        except PermissionError:
            # Fallback to /tmp or current directory
            fallback_path = f"/tmp/auth_test_results_{timestamp}.json"
            try:
                with open(fallback_path, 'w') as f:
                    json.dump(self.results, f, indent=2, default=str)
                print(f"[FALLBACK] JSON report saved to: {fallback_path}")
                json_report_path = fallback_path
            except:
                print(f"[ERROR] Could not save JSON report")
                json_report_path = None
        
        # HTML report with error handling
        html_report_path = f"{reports_dir}/auth_test_report_{timestamp}.html" if '/' in reports_dir else f"{reports_dir}.html"
        try:
            self._generate_html_report(html_report_path)
            print(f"[SUCCESS] HTML report saved: {html_report_path}")
        except Exception as e:
            print(f"[WARNING] Could not generate HTML report: {e}")
            html_report_path = None
        
        # Text summary with error handling
        text_report_path = f"{reports_dir}/auth_test_summary_{timestamp}.txt" if '/' in reports_dir else f"{reports_dir}.txt"
        try:
            self._generate_text_report(text_report_path)
            print(f"[SUCCESS] Text report saved: {text_report_path}")
        except Exception as e:
            print(f"[WARNING] Could not generate text report: {e}")
            text_report_path = None
        
        print(f"\nReports generated:")
        if json_report_path:
            print(f"  JSON: {json_report_path}")
        if html_report_path:
            print(f"  HTML: {html_report_path}")
        if text_report_path:
            print(f"  Text: {text_report_path}")
    
    def _generate_html_report(self, file_path):
        """Generate HTML test report."""
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <title>Authentication API Test Report</title>
    <style>
        body {{ font-family: Arial, sans-serif; margin: 20px; }}
        .header {{ background: #f0f0f0; padding: 10px; border-radius: 5px; }}
        .summary {{ margin: 20px 0; }}
        .test-result {{ margin: 10px 0; padding: 10px; border-radius: 5px; }}
        .passed {{ background: #d4edda; border: 1px solid #c3e6cb; }}
        .failed {{ background: #f8d7da; border: 1px solid #f5c6cb; }}
        .error {{ background: #fff3cd; border: 1px solid #ffeaa7; }}
        .skipped {{ background: #e2e3e5; border: 1px solid #d6d8db; }}
        .performance {{ margin: 20px 0; }}
        table {{ border-collapse: collapse; width: 100%; }}
        th, td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        th {{ background-color: #f2f2f2; }}
    </style>
</head>
<body>
    <div class="header">
        <h1>Authentication API Test Report</h1>
        <p>Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</p>
    </div>
    
    <div class="summary">
        <h2>Test Summary</h2>
        <p><strong>Total Tests:</strong> {self.results['total_tests']}</p>
        <p><strong>Passed:</strong> {self.results['passed_tests']}</p>
        <p><strong>Failed:</strong> {self.results['failed_tests']}</p>
        <p><strong>Errors:</strong> {self.results['error_tests']}</p>
        <p><strong>Skipped:</strong> {self.results['skipped_tests']}</p>
        <p><strong>Success Rate:</strong> {(self.results['passed_tests'] / self.results['total_tests'] * 100):.1f}%</p>
    </div>
    
    <div class="performance">
        <h2>Performance Metrics</h2>
        <table>
            <tr>
                <th>Metric</th>
                <th>Value</th>
            </tr>
            <tr>
                <td>Total Duration</td>
                <td>{self.results['performance_metrics'].get('total_duration', 0):.2f}s</td>
            </tr>
            <tr>
                <td>Average Duration</td>
                <td>{self.results['performance_metrics'].get('average_duration', 0):.2f}s</td>
            </tr>
            <tr>
                <td>Min Duration</td>
                <td>{self.results['performance_metrics'].get('min_duration', 0):.2f}s</td>
            </tr>
            <tr>
                <td>Max Duration</td>
                <td>{self.results['performance_metrics'].get('max_duration', 0):.2f}s</td>
            </tr>
        </table>
    </div>
    
    <div class="test-results">
        <h2>Test Results</h2>
        {''.join(self._generate_test_result_html(test) for test in self.results['test_results'])}
    </div>
</body>
</html>
        """
        
        with open(file_path, 'w') as f:
            f.write(html_content)
    
    def _generate_test_result_html(self, test):
        """Generate HTML for individual test result."""
        status_class = test['status'].lower()
        return f"""
        <div class="test-result {status_class}">
            <h3>{test['test_name']}</h3>
            <p><strong>Status:</strong> {test['status']}</p>
            <p><strong>Duration:</strong> {test['duration']:.2f}s</p>
            {f'<p><strong>Error:</strong> <pre>{test["error"]}</pre></p>' if test['error'] else ''}
        </div>
        """
    
    def _generate_text_report(self, file_path):
        """Generate text summary report."""
        with open(file_path, 'w') as f:
            f.write("AUTHENTICATION API TEST SUMMARY\n")
            f.write("=" * 50 + "\n\n")
            
            f.write(f"Test Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"Total Tests: {self.results['total_tests']}\n")
            f.write(f"Passed: {self.results['passed_tests']}\n")
            f.write(f"Failed: {self.results['failed_tests']}\n")
            f.write(f"Errors: {self.results['error_tests']}\n")
            f.write(f"Skipped: {self.results['skipped_tests']}\n")
            f.write(f"Success Rate: {(self.results['passed_tests'] / self.results['total_tests'] * 100):.1f}%\n\n")
            
            f.write("PERFORMANCE METRICS\n")
            f.write("-" * 30 + "\n")
            perf = self.results['performance_metrics']
            f.write(f"Total Duration: {perf.get('total_duration', 0):.2f}s\n")
            f.write(f"Average Duration: {perf.get('average_duration', 0):.2f}s\n")
            f.write(f"Min Duration: {perf.get('min_duration', 0):.2f}s\n")
            f.write(f"Max Duration: {perf.get('max_duration', 0):.2f}s\n\n")
            
            f.write("FAILED/ERROR TESTS\n")
            f.write("-" * 30 + "\n")
            for test in self.results['test_results']:
                if test['status'] in ['FAILED', 'ERROR']:
                    f.write(f"Test: {test['test_name']}\n")
                    f.write(f"Status: {test['status']}\n")
                    f.write(f"Error: {test['error']}\n")
                    f.write("-" * 30 + "\n")
    
    def _print_summary(self):
        """Print test summary to console."""
        print("\n" + "=" * 80)
        print("AUTHENTICATION TEST SUMMARY")
        print("=" * 80)
        
        print(f"Total Tests: {self.results['total_tests']}")
        print(f"Passed: {self.results['passed_tests']}")
        print(f"Failed: {self.results['failed_tests']}")
        print(f"Errors: {self.results['error_tests']}")
        print(f"Skipped: {self.results['skipped_tests']}")
        
        if self.results['total_tests'] > 0:
            success_rate = (self.results['passed_tests'] / self.results['total_tests']) * 100
            print(f"Success Rate: {success_rate:.1f}%")
        
        if self.results['performance_metrics']:
            perf = self.results['performance_metrics']
            print(f"Total Duration: {perf.get('total_duration', 0):.2f}s")
            print(f"Average Duration: {perf.get('average_duration', 0):.2f}s")
        
        # Show failed tests
        failed_tests = [test for test in self.results['test_results'] 
                       if test['status'] in ['FAILED', 'ERROR']]
        
        if failed_tests:
            print(f"\nFailed/Error Tests ({len(failed_tests)}):")
            for test in failed_tests:
                print(f"  - {test['test_name']} ({test['status']})")
        
        print("=" * 80)


def main():
    """Main function to run authentication tests."""
    runner = AuthTestRunner()
    success = runner.run_tests()
    
    if success:
        print("\n[SUCCESS] All authentication tests passed!")
        sys.exit(0)
    else:
        print("\n[FAILED] Some authentication tests failed!")
        sys.exit(1)


if __name__ == '__main__':
    main() 