# 🌍 Environment Configuration Guide

Bu döküman PEBDEQ projesi için **otomatik environment yönetim sistemi** hakkında bilgi verir.

## 📋 Özet

**Artık hiçbir kodu manuel olarak değiştirmenize gerek yok!**

- ✅ **Development**: Localhost'ta `http://localhost:5005` API'ler otomatik
- ✅ **Production**: Server'da relative URL'ler (`/api/*`) otomatik
- ✅ **Otomatik Detection**: Hostname'e göre environment tespit edilir
- ✅ **Zero Configuration**: Herhangi bir manual değişiklik gerektirmez

---

## 🎯 Nasıl Çalışır?

### Frontend (React)

**📁 `frontend/src/utils/config.js`**
```javascript
// Development: localhost:5005 kullanır
// Production: relative URLs (/api/*) kullanır

import { createApiUrl } from '../utils/config';

// Eski Yöntem ❌
fetch('http://localhost:5005/api/products')

// Yeni Yöntem ✅  
fetch(createApiUrl('api/products'))
```

**Otomatik Detection Logic:**
- `window.location.hostname` !== 'localhost' → **Production Mode**
- `window.location.hostname` === 'localhost' → **Development Mode**

### Backend (Flask)

**📁 `backend/app/utils/config.py`**
```python
from app.utils.config import app_config

# Environment otomatik tespit edilir
print(app_config['environment'])  # 'development' veya 'production'
print(app_config['cors_origins'])  # Environment'a göre CORS ayarları
```

---

## 🚀 Deployment

### Option 1: Otomatik Script (Önerilen)
```bash
# Development setup
./deploy.sh development

# Production deployment  
./deploy.sh production
```

### Option 2: Manuel Setup

#### Development:
```bash
# Frontend
cd frontend && npm install && npm start

# Backend  
cd backend && python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt && python run.py
```

#### Production:
```bash
# Frontend
cd frontend && npm install && npm run build

# Backend
cd backend && cp env.production.example .env
# Edit .env file with production values
source venv/bin/activate && python run.py
```

---

## ⚙️ Configuration Files

### Frontend Environment Detection
**📁 `frontend/src/utils/config.js`**
```javascript
const getEnvironment = () => {
  if (window.location.hostname !== 'localhost' && 
      window.location.hostname !== '127.0.0.1') {
    return 'production';
  }
  return 'development';
};
```

### Backend Environment Variables
**📁 `backend/.env` (Production)**
```env
FLASK_ENV=production
FLASK_DEBUG=False
UPLOAD_FOLDER=/var/www/pebdeq/uploads
FRONTEND_URL=https://pebdeq.com
SECRET_KEY=your-production-secret
```

---

## 🔧 Migration from Old System

Eğer eski hardcoded URL'ler varsa:

```bash
# Otomatik migration script'i çalıştır
node update_api_urls.js
```

Bu script:
- ✅ Tüm `http://localhost:5005` → `createApiUrl()` dönüştürür
- ✅ Otomatik import ekler
- ✅ 19+ dosyayı güncelledik

---

## 📊 Environment Comparison

| Aspect | Development | Production |
|--------|-------------|------------|
| **Frontend API** | `http://localhost:5005/api/*` | `/api/*` (relative) |
| **Backend CORS** | `localhost:3000` allowed | `pebdeq.com` only |
| **Upload Path** | `./uploads/` | `/var/www/pebdeq/uploads/` |
| **Debug Mode** | `True` | `False` |
| **Auto Reload** | `True` | `False` |

---

## 🚨 Production Checklist

### Server Setup:
- [ ] Copy project to `/var/www/pebdeq/`
- [ ] Run `./deploy.sh production`
- [ ] Edit `backend/.env` with production values
- [ ] Configure Nginx reverse proxy
- [ ] Set up systemd service for backend
- [ ] Set `FLASK_ENV=production` environment variable

### Security:
- [ ] Change `SECRET_KEY` in `.env`
- [ ] Change `JWT_SECRET_KEY` in `.env`
- [ ] Configure proper file permissions
- [ ] Enable HTTPS
- [ ] Configure firewall

### Testing:
- [ ] Test API endpoints: `curl https://pebdeq.com/api/categories`
- [ ] Test frontend build: Check `Network` tab in browser
- [ ] Test CORS: No errors in browser console
- [ ] Test uploads: File upload functionality works

---

## 🎉 Benefits

### Before (Manuel System):
❌ Her deployment'ta kod değiştirmek gerekiyordu  
❌ Production URL'leri hardcode ediliyordu  
❌ Development/Production arasında tutarsızlık  
❌ Manuel CORS configuration  

### After (Automatic System):
✅ **Zero manual intervention** required  
✅ **Environment auto-detection**  
✅ **Consistent configuration**  
✅ **One-command deployment**  
✅ **Production-ready defaults**

---

## 🛠️ Troubleshooting

### Frontend API errors:
```bash
# Check browser console for:
console.log(window.location.hostname);  // Should be 'pebdeq.com' in production
console.log(createApiUrl('api/test'));  // Should be '/api/test' in production
```

### Backend CORS errors:
```python
# Check backend logs for CORS configuration
from app.utils.config import app_config
print(app_config['cors_origins'])
```

### Environment not detected correctly:
```bash
# Force environment in backend
export FLASK_ENV=production

# Check frontend environment
# Open browser console and check hostname
```

---

**🎯 Sonuç: Artık hiçbir kod değişikliği yapmadan development'tan production'a deploy edebilirsiniz!** 