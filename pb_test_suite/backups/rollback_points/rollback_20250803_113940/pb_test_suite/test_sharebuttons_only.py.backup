import sys
import os
from pathlib import Path

# Add the test directory to path
sys.path.append('tests/code_quality')
from test_all_project_files import AllProjectCodeQualityTest

def test_sharebuttons_only():
    # Create test instance
    test = AllProjectCodeQualityTest()
    
    # Find ShareButtons.js
    sharebuttons_file = None
    for file_info in test.all_files['javascript']:
        if 'ShareButtons.js' in str(file_info['path']):
            sharebuttons_file = file_info
            break
    
    if sharebuttons_file:
        test.selected_files = [sharebuttons_file]
        print(f'Testing file: {sharebuttons_file["path"]}')
        print(f'File size: {sharebuttons_file["size"]} bytes')
        print('=' * 60)
        
        # Run syntax test
        result = test.test_syntax_errors()
        print(f'Test passed: {result["passed"]}')
        print(f'Total issues: {len(result["issues"])}')
        
        if not result['passed']:
            print('\nSYNTAX ERRORS FOUND:')
            for i, issue in enumerate(result['issues'], 1):
                print(f'{i:2d}. {issue}')
        else:
            print('\n✅ No syntax errors found!')
    else:
        print('❌ ShareButtons.js not found')

if __name__ == '__main__':
    test_sharebuttons_only() 