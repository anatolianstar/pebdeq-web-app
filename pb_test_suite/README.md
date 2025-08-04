# 🧪 PEBDEQ TEST SUITE

A comprehensive test suite for the PEBDEQ e-commerce project with code integrity monitoring and backup management.

## 📋 **Features**

- ✅ **Complete API Testing** - Backend endpoint testing
- ✅ **Frontend UI Testing** - React component and page testing
- ✅ **Code Integrity Monitoring** - Duplicate code detection and quality analysis
- ✅ **Automatic Backup System** - Golden state backups on 100% test success
- ✅ **Performance Testing** - Response time and load testing
- ✅ **Security Testing** - Input validation and vulnerability scanning
- ✅ **Detailed Reporting** - HTML reports, coverage, and metrics

## 🏗️ **Project Structure**

```
pb_test_suite/
├── 📁 core/                    # Core test infrastructure
│   ├── base_test.py           # Base test class
│   ├── test_config.py         # Test configuration
│   ├── code_integrity.py      # Code analysis
│   └── backup_manager.py      # Backup system
├── 📁 backend_tests/          # Backend API tests
│   ├── api/                   # API endpoint tests
│   ├── database/              # Database tests
│   └── utils/                 # Utility tests
├── 📁 frontend_tests/         # Frontend UI tests
│   ├── ui/                    # UI component tests
│   ├── components/            # React component tests
│   └── pages/                 # Page tests
├── 📁 integration_tests/      # Integration tests
├── 📁 performance_tests/      # Performance tests
├── 📁 security_tests/         # Security tests
├── 📁 backups/                # Code backups
│   ├── successful_states/     # 100% success backups
│   ├── snapshots/            # Code snapshots
│   └── rollback_points/      # Rollback points
├── 📁 reports/               # Test reports
├── 📁 scripts/               # Automation scripts
└── 📁 config/                # Configuration files
```

## 🚀 **Quick Start**

### 1. **Setup**
```bash
# Navigate to test suite
cd pb_test_suite

# Install dependencies
pip install -r requirements.txt

# Setup environment
python scripts/setup_test_environment.py
```

### 2. **Run Tests**
```bash
# Run all tests
python scripts/run_all_tests.py

# Run specific test categories
python scripts/run_backend_tests.py
python scripts/run_frontend_tests.py

# Run basic validation
python backend_tests/api/test_basic_setup.py
```

### 3. **Check Results**
```bash
# View test reports
open reports/test_report.html

# Check backup status
python scripts/list_backups.py
```

## 🧪 **Test Categories**

### **Backend Tests**
- **Authentication Tests** - Login, logout, JWT validation
- **Admin API Tests** - Site settings, user management
- **Product Tests** - CRUD operations, categories
- **Order Tests** - Order creation, status updates
- **Invoice Tests** - PDF generation, numbering
- **Theme Tests** - Theme switching, CSS variables

### **Frontend Tests**
- **UI Component Tests** - Header, footer, modals
- **Page Tests** - Home, admin, products pages
- **Theme Tests** - Theme selector, switching
- **Form Tests** - Validation, submission
- **Navigation Tests** - Routing, menu navigation

### **Integration Tests**
- **Full Workflow Tests** - Complete user journeys
- **Admin Operations** - End-to-end admin tasks
- **Theme Integration** - Backend-frontend theme sync

### **Performance Tests**
- **API Response Time** - Endpoint performance
- **Page Load Speed** - Frontend performance
- **Database Queries** - Query optimization
- **Theme Switching** - Theme change speed

### **Security Tests**
- **Input Validation** - XSS, SQL injection prevention
- **Authentication Security** - Token security
- **Permission Tests** - Role-based access control

## 🛡️ **Code Integrity System**

### **Duplicate Code Detection**
```bash
# Find duplicate code
python scripts/detect_duplicates.py

# Get detailed analysis
python scripts/analyze_code_structure.py
```

### **Code Quality Metrics**
- **Complexity Analysis** - Function/class complexity
- **Dead Code Detection** - Unused functions/imports
- **Structure Analysis** - File organization
- **Security Analysis** - Potential vulnerabilities

### **Quality Thresholds**
- **Duplicate Similarity**: 85% threshold
- **Complexity Score**: Max 10 per function
- **File Size**: Warning at 500+ lines
- **Test Coverage**: Target 80%+

## 💾 **Backup System**

### **Automatic Backups**
- **Golden State Backups** - Created on 100% test success
- **Snapshot Backups** - Before major changes
- **Rollback Points** - Recovery checkpoints

### **Backup Commands**
```bash
# Create manual backup
python scripts/create_backup.py --name "feature_x_complete"

# Restore from backup
python scripts/restore_backup.py --name "backup_20241214_143022"

# Compare with backup
python scripts/compare_with_backup.py --name "backup_20241214_143022"

# List all backups
python scripts/list_backups.py

# Cleanup old backups
python scripts/cleanup_backups.py --keep-last 10
```

### **Backup Triggers**
- ✅ **Test Success**: 100% test pass rate
- ✅ **Code Integrity**: No critical issues found
- ✅ **Quality Check**: Meets quality thresholds
- ✅ **Manual Trigger**: On demand

## 📊 **Reporting**

### **Test Reports**
- **HTML Reports** - Interactive test results
- **Coverage Reports** - Code coverage analysis
- **Performance Reports** - Speed and load metrics
- **Quality Reports** - Code quality metrics

### **Report Locations**
```
reports/
├── test_report.html           # Main test report
├── coverage_html/             # Coverage reports
├── performance_reports/       # Performance metrics
├── code_metrics/             # Code quality metrics
└── logs/                     # Test execution logs
```

## 🔧 **Configuration**

### **Test Settings**
Edit `config/test_config.py` to customize:
- **API URLs** - Backend/frontend URLs
- **Test Users** - Admin and user credentials
- **Performance Thresholds** - Response time limits
- **Backup Settings** - Backup retention policies

### **Environment Variables**
```bash
# Optional environment overrides
export TEST_BACKEND_URL="http://localhost:5000"
export TEST_FRONTEND_URL="http://localhost:3000"
export TEST_TIMEOUT=30
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Configuration Errors**
```bash
# Validate configuration
python scripts/validate_config.py

# Reset configuration
python scripts/reset_config.py
```

#### **Backend Connection Issues**
```bash
# Check backend status
python scripts/check_backend.py

# Test API connectivity
python scripts/test_api_connection.py
```

#### **Test Failures**
```bash
# Run specific test
python -m pytest backend_tests/api/test_auth.py -v

# Debug mode
python -m pytest backend_tests/api/test_auth.py -v -s --tb=long
```

#### **Backup Issues**
```bash
# Verify backup integrity
python scripts/verify_backup.py --name "backup_name"

# Force backup creation
python scripts/create_backup.py --force
```

## 🎯 **Best Practices**

### **Writing Tests**
1. **Inherit from BaseTest** - Use the base test class
2. **Use Descriptive Names** - Clear test method names
3. **Test One Thing** - Single assertion per test
4. **Clean Up** - Proper teardown methods
5. **Use Test Data** - Consistent test data

### **Code Quality**
1. **Follow PEP 8** - Python style guidelines
2. **Add Documentation** - Docstrings and comments
3. **Handle Errors** - Proper exception handling
4. **Use Type Hints** - Better code clarity
5. **Regular Refactoring** - Keep code clean

### **Performance**
1. **Mock External Calls** - Faster test execution
2. **Use Fixtures** - Reusable test data
3. **Parallel Testing** - Run tests in parallel
4. **Profile Tests** - Monitor test performance
5. **Optimize Slow Tests** - Identify bottlenecks

## 📈 **Metrics & Goals**

### **Test Coverage Goals**
- **Backend API**: 90%+ coverage
- **Frontend Components**: 80%+ coverage
- **Integration Tests**: 70%+ coverage
- **Critical Paths**: 100% coverage

### **Performance Goals**
- **API Response**: < 2 seconds
- **Page Load**: < 5 seconds
- **Test Execution**: < 10 minutes
- **Theme Switch**: < 0.5 seconds

### **Quality Goals**
- **Duplicate Code**: < 5%
- **Complexity Score**: < 10 per function
- **Dead Code**: 0 instances
- **Security Issues**: 0 critical

## 🔮 **Future Enhancements**

### **Planned Features**
- **Visual Regression Testing** - UI screenshot comparison
- **Load Testing** - High traffic simulation
- **Mobile Testing** - Mobile app testing
- **CI/CD Integration** - Automated test pipeline
- **Slack Integration** - Test notifications

### **Performance Improvements**
- **Test Parallelization** - Faster test execution
- **Smart Test Selection** - Run only affected tests
- **Caching** - Test result caching
- **Incremental Testing** - Changed code only

## 🤝 **Contributing**

### **Adding New Tests**
1. Create test file in appropriate directory
2. Inherit from `BaseTest` class
3. Follow naming conventions
4. Add to test suite documentation
5. Update TODO list

### **Improving Infrastructure**
1. Check existing issues
2. Discuss major changes
3. Write tests for new features
4. Update documentation
5. Submit pull request

## 📞 **Support**

For questions and issues:
- **Documentation**: Check this README and code comments
- **Logs**: Check `reports/logs/` for detailed logs
- **Configuration**: Validate with `scripts/validate_config.py`
- **Troubleshooting**: Follow troubleshooting guide above

---

**🎉 Happy Testing! 🧪** 