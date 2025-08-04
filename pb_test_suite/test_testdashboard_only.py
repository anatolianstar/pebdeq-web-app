import sys
import os
from pathlib import Path

# Add the test directory to path
sys.path.append('tests/code_quality')
from test_all_project_files import AllProjectCodeQualityTest

def test_testdashboard_only():
    # Create test instance
    test = AllProjectCodeQualityTest()
    
    # Find TestDashboard.js
    testdashboard_file = None
    for file_info in test.all_files['javascript']:
        if 'TestDashboard.js' in str(file_info['path']) and 'clean' not in str(file_info['path']):
            testdashboard_file = file_info
            break
    
    if testdashboard_file:
        test.selected_files = [testdashboard_file]
        print(f'Testing file: {testdashboard_file["path"]}')
        print(f'File size: {testdashboard_file["size"]} bytes')
        print('=' * 60)
        
        # Run syntax test
        result = test.test_syntax_errors()
        print(f'Test passed: {result["passed"]}')
        print(f'Total issues: {len(result["issues"])}')
        
        if not result['passed']:
            print('\nSYNTAX ERRORS FOUND:')
            for i, issue in enumerate(result['issues'][:50], 1):  # Show first 50 errors
                print(f'{i:2d}. {issue}')
        else:
            print('\n✅ No syntax errors found!')
    else:
        print('❌ TestDashboard.js not found')

if __name__ == '__main__':
    test_testdashboard_only() 