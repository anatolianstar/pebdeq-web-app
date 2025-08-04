# 🛡️ CODE INTEGRITY CHECKER

import os
import ast
import hashlib
import json
from pathlib import Path
from datetime import datetime
from collections import defaultdict
import difflib
import re

# Import configuration
import sys
sys.path.append(str(Path(__file__).parent.parent))
from config.test_config import config

class CodeIntegrityChecker:
    """Code integrity and quality checker"""
    
    def __init__(self, project_path=None):
        self.project_path = Path(project_path) if project_path else config.PROJECT_ROOT
        self.config = config
        self.baseline_metrics = {}
        self.current_metrics = {}
        self.issues = []
        
    def analyze_code_structure(self):
        """Analyze complete code structure"""
        print("🔍 Analyzing code structure...")
        
        structure = {
            'timestamp': datetime.now().isoformat(),
            'project_path': str(self.project_path),
            'backend_analysis': self.analyze_backend(),
            'frontend_analysis': self.analyze_frontend(),
            'overall_metrics': self.calculate_overall_metrics(),
            'issues': self.issues
        }
        
        self.current_metrics = structure
        return structure
    
    def analyze_backend(self):
        """Analyze backend Python code"""
        backend_path = self.project_path / "backend"
        
        if not backend_path.exists():
            return {'error': 'Backend directory not found'}
        
        python_files = self.get_python_files(backend_path)
        
        analysis = {
            'file_count': len(python_files),
            'total_lines': 0,
            'total_functions': 0,
            'total_classes': 0,
            'complexity_scores': {},
            'file_details': {},
            'duplicates': [],
            'dead_code': [],
            'unused_imports': [],
            'security_issues': []
        }
        
        for file_path in python_files:
            try:
                file_analysis = self.analyze_python_file(file_path)
                analysis['file_details'][str(file_path)] = file_analysis
                analysis['total_lines'] += file_analysis['line_count']
                analysis['total_functions'] += file_analysis['function_count']
                analysis['total_classes'] += file_analysis['class_count']
                analysis['complexity_scores'][str(file_path)] = file_analysis['complexity']
                
            except Exception as e:
                self.issues.append({
                    'type': 'analysis_error',
                    'file': str(file_path),
                    'error': str(e)
                })
        
        # Find duplicates
        analysis['duplicates'] = self.find_duplicate_code(python_files)
        
        # Find dead code
        analysis['dead_code'] = self.find_dead_code(python_files)
        
        # Find unused imports
        analysis['unused_imports'] = self.find_unused_imports(python_files)
        
        return analysis
    
    def analyze_frontend(self):
        """Analyze frontend JavaScript/React code"""
        frontend_path = self.project_path / "frontend" / "src"
        
        if not frontend_path.exists():
            return {'error': 'Frontend src directory not found'}
        
        js_files = self.get_js_files(frontend_path)
        
        analysis = {
            'file_count': len(js_files),
            'total_lines': 0,
            'total_functions': 0,
            'total_components': 0,
            'file_details': {},
            'duplicates': [],
            'unused_components': [],
            'large_files': []
        }
        
        for file_path in js_files:
            try:
                file_analysis = self.analyze_js_file(file_path)
                analysis['file_details'][str(file_path)] = file_analysis
                analysis['total_lines'] += file_analysis['line_count']
                analysis['total_functions'] += file_analysis['function_count']
                analysis['total_components'] += file_analysis['component_count']
                
                # Check for large files
                if file_analysis['line_count'] > 500:
                    analysis['large_files'].append({
                        'file': str(file_path),
                        'lines': file_analysis['line_count']
                    })
                    
            except Exception as e:
                self.issues.append({
                    'type': 'analysis_error',
                    'file': str(file_path),
                    'error': str(e)
                })
        
        # Find duplicates in JS/React files
        analysis['duplicates'] = self.find_duplicate_js_code(js_files)
        
        return analysis
    
    def analyze_python_file(self, file_path):
        """Analyze individual Python file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        try:
            tree = ast.parse(content)
        except SyntaxError as e:
            return {
                'error': f'Syntax error: {e}',
                'line_count': len(content.splitlines()),
                'function_count': 0,
                'class_count': 0,
                'complexity': 0
            }
        
        visitor = PythonASTVisitor()
        visitor.visit(tree)
        
        return {
            'line_count': len(content.splitlines()),
            'function_count': len(visitor.functions),
            'class_count': len(visitor.classes),
            'complexity': visitor.complexity,
            'functions': visitor.functions,
            'classes': visitor.classes,
            'imports': visitor.imports,
            'file_size': len(content),
            'checksum': hashlib.md5(content.encode()).hexdigest()
        }
    
    def analyze_js_file(self, file_path):
        """Analyze individual JavaScript/React file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.splitlines()
        
        # Simple analysis for JS/React files
        functions = self.extract_js_functions(content)
        components = self.extract_react_components(content)
        imports = self.extract_js_imports(content)
        
        return {
            'line_count': len(lines),
            'function_count': len(functions),
            'component_count': len(components),
            'functions': functions,
            'components': components,
            'imports': imports,
            'file_size': len(content),
            'checksum': hashlib.md5(content.encode()).hexdigest()
        }
    
    def find_duplicate_code(self, python_files):
        """Find duplicate code blocks in Python files"""
        duplicates = []
        
        for i, file1 in enumerate(python_files):
            for file2 in python_files[i+1:]:
                try:
                    similarity = self.calculate_file_similarity(file1, file2)
                    if similarity > self.config.CODE_INTEGRITY['duplicate_threshold']:
                        duplicates.append({
                            'file1': str(file1),
                            'file2': str(file2),
                            'similarity': similarity,
                            'duplicate_lines': self.find_duplicate_lines(file1, file2)
                        })
                except Exception as e:
                    continue
        
        return duplicates
    
    def find_duplicate_js_code(self, js_files):
        """Find duplicate code blocks in JavaScript files"""
        duplicates = []
        
        for i, file1 in enumerate(js_files):
            for file2 in js_files[i+1:]:
                try:
                    similarity = self.calculate_file_similarity(file1, file2)
                    if similarity > self.config.CODE_INTEGRITY['duplicate_threshold']:
                        duplicates.append({
                            'file1': str(file1),
                            'file2': str(file2),
                            'similarity': similarity,
                            'duplicate_lines': self.find_duplicate_lines(file1, file2)
                        })
                except Exception as e:
                    continue
        
        return duplicates
    
    def calculate_file_similarity(self, file1, file2):
        """Calculate similarity between two files"""
        with open(file1, 'r', encoding='utf-8') as f1:
            content1 = f1.read()
        
        with open(file2, 'r', encoding='utf-8') as f2:
            content2 = f2.read()
        
        # Remove whitespace and comments for comparison
        content1_clean = self.clean_code_for_comparison(content1)
        content2_clean = self.clean_code_for_comparison(content2)
        
        # Calculate similarity using difflib
        similarity = difflib.SequenceMatcher(None, content1_clean, content2_clean).ratio()
        
        return similarity
    
    def find_duplicate_lines(self, file1, file2):
        """Find specific duplicate lines between two files"""
        with open(file1, 'r', encoding='utf-8') as f1:
            lines1 = f1.readlines()
        
        with open(file2, 'r', encoding='utf-8') as f2:
            lines2 = f2.readlines()
        
        # Find matching lines
        matcher = difflib.SequenceMatcher(None, lines1, lines2)
        matches = []
        
        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'equal' and i2 - i1 > 2:  # More than 2 consecutive lines
                matches.append({
                    'file1_lines': (i1 + 1, i2),
                    'file2_lines': (j1 + 1, j2),
                    'content': ''.join(lines1[i1:i2])
                })
        
        return matches
    
    def find_dead_code(self, python_files):
        """Find potentially dead code"""
        dead_code = []
        
        # This is a simplified implementation
        # In a real-world scenario, you'd use tools like vulture
        
        all_functions = set()
        all_calls = set()
        
        for file_path in python_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                tree = ast.parse(content)
                visitor = PythonASTVisitor()
                visitor.visit(tree)
                
                # Add functions to set
                for func in visitor.functions:
                    all_functions.add(func['name'])
                
                # Add function calls to set
                for call in visitor.function_calls:
                    all_calls.add(call)
                    
            except Exception as e:
                continue
        
        # Find functions that are defined but never called
        unused_functions = all_functions - all_calls
        
        for func in unused_functions:
            dead_code.append({
                'type': 'unused_function',
                'name': func,
                'suggestion': f'Function "{func}" appears to be unused'
            })
        
        return dead_code
    
    def find_unused_imports(self, python_files):
        """Find unused imports"""
        unused_imports = []
        
        for file_path in python_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                tree = ast.parse(content)
                visitor = PythonASTVisitor()
                visitor.visit(tree)
                
                # Check which imports are actually used
                for imp in visitor.imports:
                    if not self.is_import_used(imp, content):
                        unused_imports.append({
                            'file': str(file_path),
                            'import': imp,
                            'suggestion': f'Import "{imp}" appears to be unused'
                        })
                        
            except Exception as e:
                continue
        
        return unused_imports
    
    def is_import_used(self, import_name, content):
        """Check if import is used in the code"""
        # Simple check - look for the import name in the content
        # This is simplified and may have false positives/negatives
        return import_name in content
    
    def clean_code_for_comparison(self, content):
        """Clean code for comparison by removing whitespace and comments"""
        # Remove comments
        content = re.sub(r'#.*$', '', content, flags=re.MULTILINE)
        content = re.sub(r'//.*$', '', content, flags=re.MULTILINE)
        content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
        
        # Remove extra whitespace
        content = re.sub(r'\s+', ' ', content)
        
        return content.strip()
    
    def extract_js_functions(self, content):
        """Extract JavaScript functions"""
        functions = []
        
        # Simple regex patterns for function extraction
        patterns = [
            r'function\s+(\w+)\s*\(',
            r'const\s+(\w+)\s*=\s*\(',
            r'let\s+(\w+)\s*=\s*\(',
            r'var\s+(\w+)\s*=\s*\(',
            r'(\w+)\s*:\s*function\s*\(',
            r'(\w+)\s*=>\s*\{'
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                functions.append({
                    'name': match.group(1),
                    'line': content[:match.start()].count('\n') + 1
                })
        
        return functions
    
    def extract_react_components(self, content):
        """Extract React components"""
        components = []
        
        # Look for React component patterns
        patterns = [
            r'class\s+(\w+)\s+extends\s+React\.Component',
            r'class\s+(\w+)\s+extends\s+Component',
            r'function\s+(\w+)\s*\([^)]*\)\s*\{[^}]*return\s*\(',
            r'const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\{[^}]*return\s*\(',
            r'const\s+(\w+)\s*=\s*\([^)]*\)\s*=>\s*\('
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, content, re.MULTILINE | re.DOTALL)
            for match in matches:
                components.append({
                    'name': match.group(1),
                    'line': content[:match.start()].count('\n') + 1
                })
        
        return components
    
    def extract_js_imports(self, content):
        """Extract JavaScript imports"""
        imports = []
        
        # Look for import patterns
        patterns = [
            r'import\s+(\w+)\s+from',
            r'import\s*\{\s*([^}]+)\s*\}\s*from',
            r'import\s*\*\s*as\s*(\w+)\s*from',
            r'const\s+(\w+)\s*=\s*require\('
        ]
        
        for pattern in patterns:
            matches = re.finditer(pattern, content)
            for match in matches:
                imports.append(match.group(1))
        
        return imports
    
    def get_python_files(self, directory):
        """Get all Python files in directory"""
        python_files = []
        
        for root, dirs, files in os.walk(directory):
            # Skip excluded directories
            dirs[:] = [d for d in dirs if not any(
                d.startswith(pattern.replace('*', '')) 
                for pattern in self.config.CODE_INTEGRITY['exclude_patterns']
            )]
            
            for file in files:
                if file.endswith('.py'):
                    python_files.append(Path(root) / file)
        
        return python_files
    
    def get_js_files(self, directory):
        """Get all JavaScript/React files in directory"""
        js_files = []
        
        for root, dirs, files in os.walk(directory):
            # Skip excluded directories
            dirs[:] = [d for d in dirs if not any(
                d.startswith(pattern.replace('*', '')) 
                for pattern in self.config.CODE_INTEGRITY['exclude_patterns']
            )]
            
            for file in files:
                if file.endswith(('.js', '.jsx', '.ts', '.tsx')):
                    js_files.append(Path(root) / file)
        
        return js_files
    
    def calculate_overall_metrics(self):
        """Calculate overall project metrics"""
        backend = self.current_metrics.get('backend_analysis', {})
        frontend = self.current_metrics.get('frontend_analysis', {})
        
        return {
            'total_files': backend.get('file_count', 0) + frontend.get('file_count', 0),
            'total_lines': backend.get('total_lines', 0) + frontend.get('total_lines', 0),
            'total_functions': backend.get('total_functions', 0) + frontend.get('total_functions', 0),
            'total_duplicates': len(backend.get('duplicates', [])) + len(frontend.get('duplicates', [])),
            'code_quality_score': self.calculate_quality_score(),
            'complexity_score': self.calculate_complexity_score()
        }
    
    def calculate_quality_score(self):
        """Calculate overall code quality score (0-100)"""
        score = 100
        
        # Deduct points for issues
        backend = self.current_metrics.get('backend_analysis', {})
        frontend = self.current_metrics.get('frontend_analysis', {})
        
        # Deduct for duplicates
        total_duplicates = len(backend.get('duplicates', [])) + len(frontend.get('duplicates', []))
        score -= total_duplicates * 5
        
        # Deduct for dead code
        dead_code = len(backend.get('dead_code', []))
        score -= dead_code * 2
        
        # Deduct for unused imports
        unused_imports = len(backend.get('unused_imports', []))
        score -= unused_imports * 1
        
        # Deduct for large files
        large_files = len(frontend.get('large_files', []))
        score -= large_files * 3
        
        return max(0, min(100, score))
    
    def calculate_complexity_score(self):
        """Calculate overall complexity score"""
        backend = self.current_metrics.get('backend_analysis', {})
        complexity_scores = backend.get('complexity_scores', {})
        
        if not complexity_scores:
            return 0
        
        total_complexity = sum(complexity_scores.values())
        avg_complexity = total_complexity / len(complexity_scores)
        
        return avg_complexity
    
    def compare_with_baseline(self, baseline_metrics):
        """Compare current metrics with baseline"""
        if not baseline_metrics:
            return {'error': 'No baseline metrics provided'}
        
        comparison = {
            'timestamp': datetime.now().isoformat(),
            'changes': {},
            'improvements': [],
            'regressions': [],
            'summary': {}
        }
        
        current_overall = self.current_metrics.get('overall_metrics', {})
        baseline_overall = baseline_metrics.get('overall_metrics', {})
        
        # Compare key metrics
        for metric in ['total_files', 'total_lines', 'total_functions', 'total_duplicates']:
            current_val = current_overall.get(metric, 0)
            baseline_val = baseline_overall.get(metric, 0)
            
            if current_val != baseline_val:
                comparison['changes'][metric] = {
                    'current': current_val,
                    'baseline': baseline_val,
                    'change': current_val - baseline_val
                }
        
        # Compare quality score
        current_quality = current_overall.get('code_quality_score', 0)
        baseline_quality = baseline_overall.get('code_quality_score', 0)
        
        if current_quality > baseline_quality:
            comparison['improvements'].append({
                'type': 'quality_improvement',
                'current': current_quality,
                'baseline': baseline_quality,
                'improvement': current_quality - baseline_quality
            })
        elif current_quality < baseline_quality:
            comparison['regressions'].append({
                'type': 'quality_regression',
                'current': current_quality,
                'baseline': baseline_quality,
                'regression': baseline_quality - current_quality
            })
        
        return comparison
    
    def generate_report(self):
        """Generate comprehensive code integrity report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'project_path': str(self.project_path),
            'metrics': self.current_metrics,
            'summary': {
                'total_files_analyzed': self.current_metrics.get('overall_metrics', {}).get('total_files', 0),
                'total_lines_analyzed': self.current_metrics.get('overall_metrics', {}).get('total_lines', 0),
                'code_quality_score': self.current_metrics.get('overall_metrics', {}).get('code_quality_score', 0),
                'total_issues_found': len(self.issues),
                'duplicate_blocks_found': self.current_metrics.get('overall_metrics', {}).get('total_duplicates', 0)
            },
            'recommendations': self.generate_recommendations(),
            'issues': self.issues
        }
        
        return report
    
    def generate_recommendations(self):
        """Generate recommendations based on analysis"""
        recommendations = []
        
        backend = self.current_metrics.get('backend_analysis', {})
        frontend = self.current_metrics.get('frontend_analysis', {})
        
        # Check for duplicates
        total_duplicates = len(backend.get('duplicates', [])) + len(frontend.get('duplicates', []))
        if total_duplicates > 0:
            recommendations.append({
                'type': 'code_duplication',
                'priority': 'high',
                'description': f'Found {total_duplicates} duplicate code blocks',
                'action': 'Refactor duplicate code into reusable functions/components'
            })
        
        # Check for large files
        large_files = frontend.get('large_files', [])
        if large_files:
            recommendations.append({
                'type': 'large_files',
                'priority': 'medium',
                'description': f'Found {len(large_files)} large files',
                'action': 'Consider splitting large files into smaller modules'
            })
        
        # Check for dead code
        dead_code = backend.get('dead_code', [])
        if dead_code:
            recommendations.append({
                'type': 'dead_code',
                'priority': 'low',
                'description': f'Found {len(dead_code)} potentially unused functions',
                'action': 'Review and remove unused code'
            })
        
        return recommendations
    
    def save_metrics(self, filename=None):
        """Save current metrics to file"""
        if not filename:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"code_metrics_{timestamp}.json"
        
        metrics_file = config.REPORTS_PATH / "code_metrics" / filename
        metrics_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(metrics_file, 'w') as f:
            json.dump(self.current_metrics, f, indent=2)
        
        return str(metrics_file)


class PythonASTVisitor(ast.NodeVisitor):
    """AST visitor for Python code analysis"""
    
    def __init__(self):
        self.functions = []
        self.classes = []
        self.imports = []
        self.function_calls = []
        self.complexity = 0
    
    def visit_FunctionDef(self, node):
        self.functions.append({
            'name': node.name,
            'line': node.lineno,
            'args': len(node.args.args)
        })
        self.complexity += 1
        self.generic_visit(node)
    
    def visit_ClassDef(self, node):
        self.classes.append({
            'name': node.name,
            'line': node.lineno,
            'methods': len([n for n in node.body if isinstance(n, ast.FunctionDef)])
        })
        self.generic_visit(node)
    
    def visit_Import(self, node):
        for alias in node.names:
            self.imports.append(alias.name)
        self.generic_visit(node)
    
    def visit_ImportFrom(self, node):
        if node.module:
            self.imports.append(node.module)
        self.generic_visit(node)
    
    def visit_Call(self, node):
        if isinstance(node.func, ast.Name):
            self.function_calls.append(node.func.id)
        self.generic_visit(node)
    
    def visit_If(self, node):
        self.complexity += 1
        self.generic_visit(node)
    
    def visit_For(self, node):
        self.complexity += 1
        self.generic_visit(node)
    
    def visit_While(self, node):
        self.complexity += 1
        self.generic_visit(node)
    
    def visit_Try(self, node):
        self.complexity += 1
        self.generic_visit(node) 