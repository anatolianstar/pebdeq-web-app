# 🧪 Server Test Suite Setup Guide

## Problem
Server'da test dashboard çalışmıyor ve şu hatayı veriyor:
```
Failed to fetch backup history: Backups directory not found: /opt/pebdeq/pb_test_suite/backups
```

## Solution

### 🚀 **Method 1: Automatic Setup (Recommended)**

Backend kodu artık **otomatik olarak** gerekli klasörleri oluşturuyor. Sadece Flask app'i restart edin:

```bash
# Server'da
sudo systemctl restart your-flask-app
# veya
sudo supervisorctl restart your-app
```

### 🛠️ **Method 2: Manual Setup**

Eğer otomatik çalışmazsa, manuel setup script'ini çalıştırın:

```bash
# 1. Script'i server'a kopyalayın
scp deployment/setup_test_suite_server.sh user@your-server:/tmp/

# 2. Server'da çalıştırın
ssh user@your-server
cd /tmp
chmod +x setup_test_suite_server.sh
sudo ./setup_test_suite_server.sh
```

### 📂 **Expected Directory Structure**

Setup sonrası şu structure oluşmalı:

```
/opt/pebdeq/pb_test_suite/
├── backups/
│   ├── rollback_points/
│   ├── code_quality/
│   ├── snapshots/
│   └── successful_states/
├── reports/
│   ├── admin_tests/
│   ├── auth_tests/
│   ├── product_tests/
│   ├── invoice_tests/
│   ├── order_tests/
│   ├── test_results/
│   └── logs/
├── scripts/
├── config/
├── tests/
│   └── code_quality/
└── pytest.ini
```

### 🔧 **Verification**

Test dashboard'a gidin ve şunları kontrol edin:

1. **Backup History** tab'ı açılıyor ✅
2. **🧹 Cleanup Tests** butonu çalışıyor ✅  
3. **Code Quality Tests** çalışıyor ✅

### 🔍 **Troubleshooting**

Hala sorun varsa:

```bash
# Directory kontrolü
ls -la /opt/pebdeq/pb_test_suite/

# Permission kontrolü  
ls -la /opt/pebdeq/pb_test_suite/backups/

# Flask log'larını kontrol edin
tail -f /path/to/your/flask/logs

# Manuel directory oluşturma
sudo mkdir -p /opt/pebdeq/pb_test_suite/backups/{rollback_points,code_quality,snapshots,successful_states}
sudo mkdir -p /opt/pebdeq/pb_test_suite/reports/{admin_tests,auth_tests,product_tests,invoice_tests,order_tests,test_results,logs}
sudo chmod -R 755 /opt/pebdeq/pb_test_suite/
sudo chown -R your-app-user:your-app-group /opt/pebdeq/pb_test_suite/
```

### ✅ **Success Indicators**

Setup başarılı olduğunda:

- ❌ "Backups directory not found" hatası **kaybolur**
- ✅ Backup History tab'ı **açılır**
- ✅ Cleanup modal **istatistikleri** gösterir
- ✅ Test dashboard **tamamen çalışır**

---

## 📋 **Changes Made**

### Backend Changes:
- `ensure_test_suite_structure()` fonksiyonu eklendi
- Tüm test endpoint'lerinde otomatik directory creation
- Cleanup API endpoint'leri eklendi

### Frontend Changes:  
- 🧹 Cleanup Tests butonu eklendi
- Cleanup modal ile istatistikler
- 3 temizlik seçeneği (Reports, Backups, All)

### Scripts:
- `setup_test_suite_server.sh` - Manuel server setup
- Auto-directory creation logic 