# 🚀 PEBDEQ DEPLOYMENT TOOL

Kapsamlı GUI tabanlı deployment aracı - Projenizi tek tıkla serverınıza deploy edin!

## 📋 Özellikler

### ⚙️ Konfigürasyon
- **Server Ayarları**: IP, port, kullanıcı adı, şifre
- **Domain Yönetimi**: Ana domain + ek domainler (virgülle ayrılmış)
- **SSL Konfigürasyonu**: Let's Encrypt otomatik SSL sertifikası
- **Güvenlik Seçenekleri**: HTTPS zorla, HSTS, güvenlik başlıkları
- **Deployment Seçenekleri**: Otomatik mod, temiz kurulum, firewall, sistem güncellemeleri

### 🚀 Deployment Adımları (14 Adım)
1. **🔗 Server bağlantı testi**
2. **🔄 Sistem paketlerini güncelleme**
3. **🛡️ Firewall konfigürasyonu**
4. **🗑️ Mevcut deployment temizleme**
5. **📦 Proje dosyalarını yükleme**
6. **🐍 Python ortamı kurulumu**
7. **📚 Bağımlılıkları yükleme**
8. **🏗️ Frontend build**
9. **🗄️ Veritabanı kurulumu**
10. **⚙️ Servisleri konfigüre etme**
11. **🌐 Web server (Nginx) kurulumu**
12. **🔒 SSL konfigürasyonu**
13. **🧪 Sağlık kontrolleri**
14. **✅ Final doğrulama**

### 📊 İzleme & Loglar
- **Gerçek zamanlı progress bar**
- **Detaylı log kayıtları** (renkli output)
- **Adım adım checkbox takibi**
- **Log kaydetme ve temizleme**

## 🛠️ Kurulum & Başlatma

### Ön Gereksinimler
- Python 3.7+
- Windows/Linux/Mac
- İnternet bağlantısı

### Hızlı Başlangıç

1. **Batch dosyasını çalıştırın** (Windows):
   ```batch
   start_deployment.bat
   ```

2. **Manuel başlatma**:
   ```bash
   # Bağımlılıkları yükle
   pip install -r deployment_requirements.txt
   
   # GUI'yi başlat
   python deployment_gui.py
   ```

## 📋 Kullanım Kılavuzu

### 1. Konfigürasyon Sekmesi

#### Server Ayarları
- **Server IP**: Hedefinizin IP adresi (örn: 5.161.245.15)
- **Port**: SSH portu (varsayılan: 22)
- **Username**: SSH kullanıcı adı (varsayılan: root)
- **Password**: SSH şifresi

#### Domain & SSL Konfigürasyonu
- **Primary Domain**: Ana domain adınız (örn: pebdeq.com)
- **Additional Domains**: Ek domainler (örn: www.pebdeq.com, api.pebdeq.com)
- **SSL Email**: Let's Encrypt için email adresi

#### SSL Seçenekleri
- ✅ **Enable SSL/HTTPS**: Let's Encrypt otomatik SSL
- ✅ **Force HTTPS Redirect**: HTTP'yi HTTPS'e yönlendir
- ⚠️ **Enable HSTS**: HTTP Strict Transport Security

#### Deployment Seçenekleri
- ✅ **Automatic Mode**: Minimum onay iste
- ✅ **Clean Install**: Mevcut dosyaları sil
- ✅ **Setup Firewall**: UFW firewall konfigüre et
- ✅ **Install System Updates**: Sistem paketlerini güncelle

### 2. Test Connection
❗ Deployment öncesi mutlaka **"🔌 Test Connection"** butonuna tıklayın!

### 3. Deployment Sekmesi

#### Başlatma
1. **"🚀 START DEPLOYMENT"** tıklayın
2. Progress bar ve logları takip edin
3. Her adım tamamlandıkça checkbox işaretlenir

#### Kontrol
- **"⏹️ STOP"**: Deployment'ı durdur
- **"🔄 RESET"**: Tüm adımları sıfırla

### 4. Logs Sekmesi
- **Gerçek zamanlı loglar**
- **Renkli status mesajları**
- **"Clear Logs"**: Logları temizle
- **"Save Logs"**: Logları dosyaya kaydet

## 🔧 Detaylı Konfigürasyon

### Proje Yapısı Gereksinimleri
```
your-project/
├── backend/
│   ├── requirements.txt
│   ├── run.py
│   └── ...
├── frontend/
│   ├── package.json
│   └── ...
└── ...
```

### Server Gereksinimleri
- **OS**: Ubuntu 18.04+ / Debian 9+
- **RAM**: Minimum 1GB
- **Disk**: Minimum 10GB boş alan
- **Network**: Port 22 (SSH), 80 (HTTP), 443 (HTTPS) açık

### Firewall Konfigürasyonu
```bash
# Otomatik açılan portlar:
- SSH (22/tcp)
- HTTP (80/tcp) 
- HTTPS (443/tcp)
- Backend (5005/tcp - localhost only)
```

## 🚨 Sorun Giderme

### Yaygın Hatalar

#### ❌ Connection Failed
- Server IP'yi kontrol edin
- SSH portunu kontrol edin (genelde 22)
- Username/password doğru mu?
- Server firewall SSH'yi engelliyor mu?

#### ❌ Project Structure Error
- Backend klasörü var mı?
- Frontend klasörü var mı?
- requirements.txt var mı?
- package.json var mı?

#### ❌ SSL Certificate Failed
- Domain DNS A kaydı server IP'ye yönlendiriyor mu?
- Email adresi geçerli mi?
- Port 80 ve 443 açık mı?

#### ❌ Frontend Build Failed
- Node.js kurulu mu? (v14+)
- npm install başarılı oldu mu?
- package.json scripts/build var mı?

### Log Analizi
```bash
# Server'da log kontrolü:
systemctl status pebdeq-backend
systemctl status nginx
nginx -t
tail -f /var/log/nginx/error.log
```

## 🔒 Güvenlik

### Otomatik Güvenlik Önlemleri
- **UFW Firewall** konfigürasyonu
- **Nginx güvenlik başlıkları**
- **SSL/TLS sertifikası**
- **HTTPS zorla yönlendirme**
- **Hassas dosyalara erişim engeli**

### Manuel Güvenlik Kontrolleri
```bash
# SSH key tabanlı giriş (önerilir):
ssh-copy-id user@server

# Fail2ban kurulumu:
apt install fail2ban

# Sistem güncellemeleri:
apt update && apt upgrade
```

## 📊 Performans

### Cache Ayarları
- **Static dosyalar**: 1 yıl cache
- **API istekleri**: Cache yok
- **Gzip sıkıştırma**: Aktif

### Resource Kullanımı
- **Backend**: ~100-200MB RAM
- **Nginx**: ~10-50MB RAM
- **Node.js build**: Geçici 500MB+ RAM

## 🔄 Güncelleme & Maintenance

### Otomatik SSL Yenileme
```bash
# Certbot timer kontrolü:
systemctl status certbot.timer

# Manuel yenileme:
certbot renew
```

### Log Rotation
```bash
# Nginx logları:
/var/log/nginx/*.log

# Application logları:
/opt/pebdeq/backend/logs/
```

## 🆘 Destek

### Test Komutları
```bash
# Service durumu:
systemctl status pebdeq-backend nginx

# Port kontrolü:
netstat -tulpn | grep -E ':80|:443|:5005'

# Disk kullanımı:
df -h /opt/pebdeq /var/www/pebdeq

# Process kontrolü:
ps aux | grep -E 'python|nginx'
```

### Acil Durum Komutları
```bash
# Servisleri yeniden başlat:
systemctl restart pebdeq-backend nginx

# Logları temizle:
journalctl --rotate
journalctl --vacuum-time=1d

# Disk temizle:
apt autoremove
apt autoclean
```

## 📝 Notlar

- **Otomatik mod** seçildiğinde minimal onay istenir
- **Clean install** mevcut tüm dosyaları siler
- **SSL email** Let's Encrypt bildirimleri için gerekli
- **Additional domains** virgülle ayrılmalı
- **Firewall** setup edilmezse manual port açma gerekir

## 🎯 Sonuç

Bu araç ile PEBDEQ projenizi 5-10 dakikada profesyonel bir şekilde deploy edebilirsiniz!

**✅ Başarılı deployment sonrası:**
- Siteniz `https://yourdomain.com` adresinde erişilebilir
- Backend API `https://yourdomain.com/api/` altında çalışır
- SSL sertifikası otomatik yenilenir
- Güvenlik önlemleri aktif
- Log takibi mümkün

---
**📞 İletişim**: Sorun yaşarsanız log dosyalarını kaydedin ve destek alın. 