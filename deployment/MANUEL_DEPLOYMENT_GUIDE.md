# 🚀 PEBDEQ Manuel Deployment Kılavuzu

## 📋 Günlük Workflow

### 1. Kod Değişikliği Yap (Windows - Yerel)
```bash
# Proje dizinine git
cd C:\Users\MOSAIC\PycharmProjects\pebdeq-home\pebdeq-home

# Değişiklikleri kontrol et
git status

# Değişiklikleri stage'e al
git add .

# Commit yap (açıklayıcı mesaj)
git commit -m "Fix: email templates görünmeme sorunu düzeltildi"

# GitHub'a push et
git push origin main
```

### 2. Sunucuya Deploy Et
```bash
# Tek komut ile hızlı deploy
ssh root@5.161.245.15 "cd /var/www/pebdeq && ./deploy.sh"

# VEYA PowerShell script kullan
./deploy-commands.ps1
```

### 3. Doğrula
```bash
# Site çalışıyor mu?
curl -I https://pebdeq.com

# Backend loglarını kontrol et
ssh root@178.156.167.122 "tail -20 /var/www/pebdeq/pebdeq_app.log"
```

## 🛠️ Deployment Script Özellikleri

### ✅ Ne Yapar:
- 💾 Otomatik backup oluşturur
- 📥 GitHub'dan son kodu çeker
- 🛑 Eski backend'i durdurur
- 🚀 Yeni backend'i başlatır
- 🌐 Nginx'i reload eder
- 🏥 Health check yapar

### 📍 Dosya Konumları:
- **Script**: `/var/www/pebdeq/deploy.sh`
- **Backup**: `/var/backups/pebdeq-backup`
- **Logs**: `/var/www/pebdeq/pebdeq_app.log`
- **Site**: `https://pebdeq.com`

## 🔧 Hızlı Komutlar

### Deploy Komutları:
```bash
# 1. Normal Deploy
ssh root@178.156.167.122 "cd /var/www/pebdeq && ./deploy.sh"

# 2. Sadece Backend Restart
ssh root@178.156.167.122 "cd /var/www/pebdeq && pkill -f 'python run.py' && source venv/bin/activate && cd backend && nohup python run.py > ../pebdeq_app.log 2>&1 &"

# 3. Git Status Kontrol
ssh root@178.156.167.122 "cd /var/www/pebdeq && git status"
```

### Monitoring Komutları:
```bash
# 1. Log Takibi (Canlı)
ssh root@178.156.167.122 "tail -f /var/www/pebdeq/pebdeq_app.log"

# 2. Son 20 Log
ssh root@178.156.167.122 "tail -20 /var/www/pebdeq/pebdeq_app.log"

# 3. Çalışan Processleri Gör
ssh root@178.156.167.122 "ps aux | grep 'python run.py'"

# 4. Site Health Check
ssh root@178.156.167.122 "curl -I https://pebdeq.com"
```

## 🔄 Rollback (Geri Alma)

### Hızlı Rollback:
```bash
# 1. Backup'tan geri yükle
ssh root@178.156.167.122 "cd /var && cp -r backups/pebdeq-backup/* www/pebdeq/"

# 2. Servisleri restart et
ssh root@178.156.167.122 "cd /var/www/pebdeq && ./deploy.sh"
```

### Git ile Rollback:
```bash
# 1. Son commit'leri gör
ssh root@178.156.167.122 "cd /var/www/pebdeq && git log --oneline -5"

# 2. Belirli commit'e dön
ssh root@178.156.167.122 "cd /var/www/pebdeq && git reset --hard COMMIT_HASH"

# 3. Deploy et
ssh root@178.156.167.122 "cd /var/www/pebdeq && ./deploy.sh"
```

## ⚠️ Sorun Giderme

### 1. Site Açılmıyor:
```bash
# Nginx durumu
ssh root@178.156.167.122 "systemctl status nginx"

# Nginx hatalarını gör
ssh root@178.156.167.122 "tail -20 /var/log/nginx/error.log"

# Nginx restart
ssh root@178.156.167.122 "systemctl restart nginx"
```

### 2. Backend Çalışmıyor:
```bash
# Backend loglarını kontrol et
ssh root@178.156.167.122 "tail -50 /var/www/pebdeq/pebdeq_app.log"

# Backend processleri kontrol et
ssh root@178.156.167.122 "ps aux | grep python"

# Backend restart
ssh root@178.156.167.122 "cd /var/www/pebdeq && pkill -f 'python run.py' && source venv/bin/activate && cd backend && nohup python run.py > ../pebdeq_app.log 2>&1 &"
```

### 3. Database Sorunları:
```bash
# Database dosyası var mı?
ssh root@178.156.167.122 "ls -la /var/www/pebdeq/backend/instance/"

# Database backup'tan restore
ssh root@178.156.167.122 "cd /var/www/pebdeq/backend && python create_backup.py"
```

## 📱 Hızlı Erişim

### Windows'ta:
1. **deploy-commands.ps1** dosyasını çalıştır
2. Menüden seçim yap
3. Enter'a bas

### Command Line'dan:
```bash
# Alias oluştur (PowerShell Profile'da)
function Deploy-Pebdeq { ssh root@178.156.167.122 "cd /var/www/pebdeq && ./deploy.sh" }
function Logs-Pebdeq { ssh root@178.156.167.122 "tail -20 /var/www/pebdeq/pebdeq_app.log" }

# Kullanım
Deploy-Pebdeq
Logs-Pebdeq
```

## ✅ Deploy Checklist

### Deploy Öncesi:
- [ ] Yerel değişiklikler commit edildi
- [ ] GitHub'a push edildi
- [ ] Kritik değişiklik varsa backup alındı

### Deploy Sonrası:
- [ ] Site açılıyor (https://pebdeq.com)
- [ ] Backend API çalışıyor
- [ ] Loglar temiz (hata yok)
- [ ] Gerekli fonksiyonlar test edildi

## 🎯 İpuçları

1. **Küçük commit'ler yap** - Sorun olursa kolay rollback
2. **Açıklayıcı commit mesajları** - Değişikliği anla
3. **Deploy öncesi test et** - Yerel ortamda çalıştır
4. **Logları takip et** - Deploy sonrası kontrol et
5. **Backup her zaman al** - Güvenlik öncelik

---

**🌍 Site Canlı: https://pebdeq.com**
**📞 Sorun durumunda: Deploy script tekrar çalıştır** 

## 🎉 **MANUEL DEPLOYMENT SİSTEMİ TAMAM VE ÇALIŞIYOR!**

### ✅ **Kurulum Tamamlandı:**

1. **🚀 Deploy Script**: `/var/www/pebdeq/deploy.sh` - Çalışır durumda
2. **📁 Windows Scripts**: `deploy-commands.ps1` & `.bat` - Hazır
3. **📋 Kılavuz**: `MANUEL_DEPLOYMENT_GUIDE.md` - Detaylı rehber
4. **🌍 Site**: https://pebdeq.com - Canlı ve çalışıyor

### 🎯 **Artık Nasıl Deploy Yapacaksın:**

#### **En Basit Yöntem:**
```powershell
# Tek komut ile deploy
ssh root@178.156.167.122 "cd /var/www/pebdeq && ./deploy.sh"
```

#### **PowerShell Menü ile:**
```powershell
# Script'i çalıştır
.\deploy-commands.ps1

# Menüden seçim yap:
# 1 - Hızlı Deploy  
# 2 - Deploy + Log
# 3 - Backend Restart
# 4 - Site Kontrol
# 5 - Log Görüntüle
```

### 📋 **Günlük Kullanım:**

```bash
# 1. Kod değiştir (Windows'ta)
git add .
git commit -m "yeni özellik eklendi"
git push origin main

# 2. Deploy et (tek komut)
ssh root@178.156.167.122 "cd /var/www/pebdeq && ./deploy.sh"

# 3. Kontrol et
# https://pebdeq.com - Site açılıyor mu?
```

### 🛡️ **Güvenlik Özellikleri:**

- ✅ **Otomatik Backup**: Her deploy'da
- ✅ **Health Check**: Deploy sonrası test
- ✅ **Rollback Ready**: Hata durumunda geri alma
- ✅ **Log Monitoring**: Sorun takibi

### 🚀 **Sonraki Adımlar:**

1. **İlk deploy'u dene**: Script'i kullan
2. **Workflow'u benimse**: Günlük kullan
3. **Log'ları takip et**: Sorunları izle
4. **Backup'ları kontrol et**: Güvenlik

**🎯 PEBDEQ Manuel Deployment sistemi tamamen hazır ve çalışıyor!** 

Artık kod değişikliklerini kolayca canlıya alabilirsin. PowerShell script'ini çalıştır ve deploy yap! 🌟 