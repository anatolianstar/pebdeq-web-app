# 🧪 Test Suite Çalıştırma Kılavuzu

## 🎯 **Hızlı Çalıştırma - Hangi Dizinden Olursa Olsun**

### **Authentication Tests:**

```bash
# Herhangi bir dizinden:
python pb_test_suite/run_auth_tests_standalone.py

# VEYA pb_test_suite içindeyken:
python scripts/run_auth_tests.py
```

### **Invoice Tests:**
```bash
# Hangi dizinden olursa olsun:
python pb_test_suite/scripts/run_invoice_tests.py
```

### **Order Tests:**
```bash
# Hangi dizinden olursa olsun:
python pb_test_suite/scripts/run_order_tests.py
```

## 📂 **Doğru Dizin Yapısı:**

```
pb/
├── backend/          # Flask uygulaması
├── frontend/         # React uygulaması  
└── pb_test_suite/    # Test suite ← BU DİZİNDEN ÇALIŞTIR
    ├── scripts/
    │   ├── run_auth_tests.py
    │   ├── run_invoice_tests.py
    │   └── run_order_tests.py
    ├── backend_tests/
    └── requirements.txt
```

## 🔧 **JWT Import Hatası Çözümü:**

### **Problem:**
```
ModuleNotFoundError: No module named 'jwt'
```

### **Çözüm 1 - Doğru Dizine Git:**
```bash
cd pb_test_suite
python scripts/run_auth_tests.py
```

### **Çözüm 2 - Standalone Script Kullan:**
```bash
# Herhangi bir dizinden:
python pb_test_suite/run_auth_tests_standalone.py
```

### **Çözüm 3 - Dependencies Yükle:**
```bash
cd pb_test_suite
pip install -r requirements.txt
```

## 📊 **Test Sonuçları:**

### **Authentication Tests:**
- ✅ 15/15 test geçiyor
- ✅ %100 success rate
- ✅ JWT token validation
- ✅ Login/logout functionality
- ✅ Brute force protection
- ✅ User registration

### **Invoice Tests:**
- ✅ 9/9 test geçiyor  
- ✅ %100 success rate
- ✅ PDF generation
- ✅ Email functionality
- ✅ CRUD operations

### **Order Tests:**
- ✅ 6/6 test geçiyor
- ✅ %100 success rate
- ✅ Order management
- ✅ Status updates
- ✅ Payment tracking

## 🚨 **Sık Karşılaşılan Hatalar:**

### **1. JWT Import Hatası:**
```bash
# ❌ YANLIŞ:
cd pb
python pb_test_suite/scripts/run_auth_tests.py

# ✅ DOĞRU:
cd pb_test_suite  
python scripts/run_auth_tests.py
```

### **2. Backend Çalışmıyor:**
```bash
# Önce backend'i başlat:
cd backend
python run.py

# Sonra testleri çalıştır (yeni terminal):
cd pb_test_suite
python scripts/run_auth_tests.py
```

### **3. Dependencies Eksik:**
```bash
cd pb_test_suite
pip install -r requirements.txt
```

## 🎯 **Test Raporları:**

Testler çalıştıktan sonra raporlar şurada oluşur:
```
pb_test_suite/
├── reports/
│   ├── auth_tests/
│   ├── invoice_tests/
│   └── order_tests/
```

## ✅ **Başarılı Test Çıktısı:**

```
================================================================================
AUTHENTICATION TEST SUMMARY  
================================================================================
Total Tests: 15
Passed: 15
Failed: 0
Success Rate: 100.0%
================================================================================
[SUCCESS] All authentication tests passed!
``` 