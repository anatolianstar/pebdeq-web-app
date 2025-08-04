# 🚀 PEBDEQ - Quick Reference Guide

## 🔑 Server Credentials & Access

### SSH Connection
```bash
ssh pebdeq@178.156.167.122
```
**IP:** `178.156.167.122`  
**User:** `pebdeq`  
**Domain:** `pebdeq.com`

### Database Credentials
```bash
Host: localhost
Database: pebdeq_production
User: pebdeq_user
Password: simple123
URL: postgresql://pebdeq_user:simple123@localhost/pebdeq_production
```

### Admin Panel Access
```
Email: admin@pebdeq.com
Password: admin123
URL: https://pebdeq.com/admin
```

---

## 🏗️ Architecture Overview

```
Internet → Cloudflare → Nginx (Port 80/443) → React Frontend
                                            → Gunicorn (Port 5005) → Flask Backend → PostgreSQL
```

### Key Paths
```bash
Project Root: /var/www/pebdeq/
Frontend: /var/www/pebdeq/frontend/build/
Backend: /var/www/pebdeq/backend/
Environment: /var/www/pebdeq/venv/
Config: /etc/nginx/sites-available/pebdeq.com
SSL: /etc/letsencrypt/live/pebdeq.com/
```

---

## ⚡ Most Used Commands

### 1. Connect to Server
```bash
ssh pebdeq@178.156.167.122
```

### 2. Check Services Status
```bash
sudo systemctl status nginx postgresql
sudo lsof -i :5005
```

### 3. Restart Backend (Most Common!)
```bash
cd /var/www/pebdeq/backend
sudo pkill -f gunicorn
source ../venv/bin/activate
nohup gunicorn --bind 127.0.0.1:5005 --workers 2 run:app > /dev/null 2>&1 &
```

### 4. Restart Nginx
```bash
sudo systemctl restart nginx
```

### 5. Check Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### 6. Test API
```bash
curl https://pebdeq.com/api/categories
curl https://pebdeq.com/api/site-settings
```

### 7. Database Reset
```bash
cd /var/www/pebdeq/backend
source ../venv/bin/activate
python3 reset_db.py
```

### 8. Frontend Rebuild
```bash
cd /var/www/pebdeq/frontend
rm -rf build/
echo "REACT_APP_API_URL=https://pebdeq.com" > .env
npm run build
sudo systemctl restart nginx
```

---

## 🔧 Service Definitions

### **Nginx** - Web Server
- **Purpose:** Reverse proxy, serves React frontend, routes API calls
- **Config:** `/etc/nginx/sites-available/pebdeq.com`
- **Control:** `sudo systemctl restart nginx`
- **Logs:** `/var/log/nginx/error.log`

### **Gunicorn** - Python WSGI Server
- **Purpose:** Runs Flask backend application
- **Port:** `5005`
- **Workers:** `2`
- **Control:** `sudo pkill -f gunicorn` then restart
- **Check:** `sudo lsof -i :5005`

### **PostgreSQL** - Database
- **Purpose:** Stores all application data
- **Database:** `pebdeq_production`
- **User:** `pebdeq_user`
- **Control:** `sudo systemctl restart postgresql`

### **React Frontend** - User Interface
- **Purpose:** Web application UI
- **Build Path:** `/var/www/pebdeq/frontend/build/`
- **Environment:** Production mode with `REACT_APP_API_URL=https://pebdeq.com`

### **Flask Backend** - API Server
- **Purpose:** REST API, business logic
- **Path:** `/var/www/pebdeq/backend/`
- **Environment:** `.env` file with PostgreSQL config

---

## 🚨 Emergency Commands

### Complete Service Restart
```bash
# Stop everything
sudo systemctl stop nginx
sudo pkill -f gunicorn

# Start everything
sudo systemctl start nginx
cd /var/www/pebdeq/backend && source ../venv/bin/activate
nohup gunicorn --bind 127.0.0.1:5005 --workers 2 run:app > /dev/null 2>&1 &
```

### Fix Permissions
```bash
sudo chown -R pebdeq:pebdeq /var/www/pebdeq
sudo chown -R www-data:www-data /var/www/pebdeq/frontend/build
sudo chmod -R 755 /var/www/pebdeq
```

### SSL Certificate Renewal
```bash
sudo certbot renew
sudo systemctl restart nginx
```

---

## 🔍 Quick Troubleshooting

### Problem: Site Down (502/503)
**Solution:** Backend crashed
```bash
cd /var/www/pebdeq/backend
sudo pkill -f gunicorn
source ../venv/bin/activate
nohup gunicorn --bind 127.0.0.1:5005 --workers 2 run:app > /dev/null 2>&1 &
```

### Problem: Frontend Shows API Error
**Solution:** Wrong API URL in build
```bash
cd /var/www/pebdeq/frontend
rm -rf build/
echo "REACT_APP_API_URL=https://pebdeq.com" > .env
npm run build
sudo systemctl restart nginx
```

### Problem: Database Connection Error
**Solution:** Check PostgreSQL and credentials
```bash
sudo systemctl status postgresql
sudo systemctl restart postgresql
# Test connection:
psql postgresql://pebdeq_user:simple123@localhost/pebdeq_production
```

### Problem: SSL Certificate Error
**Solution:** Renew certificate
```bash
sudo certbot renew --force-renewal
sudo systemctl restart nginx
```

---

## 📊 Health Check Commands

### Quick Status Check
```bash
# All in one command
echo "=== NGINX ===" && sudo systemctl is-active nginx && \
echo "=== POSTGRESQL ===" && sudo systemctl is-active postgresql && \
echo "=== GUNICORN ===" && sudo lsof -i :5005 | grep LISTEN && \
echo "=== WEBSITE ===" && curl -s -o /dev/null -w "%{http_code}" https://pebdeq.com
```

### Performance Test
```bash
curl -w "DNS: %{time_namelookup}s, SSL: %{time_appconnect}s, Total: %{time_total}s\n" -o /dev/null -s https://pebdeq.com
```

### API Test
```bash
curl https://pebdeq.com/api/categories | jq '.'
```

---

## 🌐 Cloudflare Settings

### DNS Records
```
Type: A    Name: @         IPv4: 178.156.167.122    Proxy: ✅ Proxied
Type: A    Name: www       IPv4: 178.156.167.122    Proxy: ✅ Proxied
```

### SSL/TLS Settings
```
Encryption Mode: Full (strict)
Always Use HTTPS: On
HSTS: Enabled
```

---

## 📝 Common File Locations

### Configuration Files
```bash
# Nginx config
/etc/nginx/sites-available/pebdeq.com

# Backend environment
/var/www/pebdeq/backend/.env

# Frontend environment  
/var/www/pebdeq/frontend/.env

# SSL certificates
/etc/letsencrypt/live/pebdeq.com/
```

### Log Files
```bash
# Nginx logs
/var/log/nginx/error.log
/var/log/nginx/access.log

# Backend logs
/var/www/pebdeq/backend/nohup.out

# System logs
journalctl -u nginx
journalctl -u postgresql
```

---

## 🎯 Quick Setup (Fresh Server)

### One-Command Setup
```bash
# After SSH connection:
cd ~ && \
git clone https://github.com/your-username/pebdeq-home.git && \
cd pebdeq-home && \
chmod +x auto-deploy.sh && \
./auto-deploy.sh
```

### Post-Setup Commands
```bash
# SSL setup
sudo certbot --nginx -d pebdeq.com

# Database sample data
cd /var/www/pebdeq/backend && source ../venv/bin/activate && python3 reset_db.py
```

---

## 🆘 Emergency Contact Info

**Server:** `178.156.167.122`  
**SSH User:** `pebdeq`  
**Domain:** `pebdeq.com`  
**Database:** `pebdeq_production`  
**Admin:** `admin@pebdeq.com / admin123`

**Project Structure:**
```
/var/www/pebdeq/
├── backend/          # Flask API
├── frontend/build/   # React UI
├── venv/            # Python environment
└── uploads/         # File storage
```

---

## ⭐ Pro Tips

1. **Always use virtual environment:** `source ../venv/bin/activate`
2. **Check logs first:** `sudo tail -f /var/log/nginx/error.log`
3. **Test locally before restart:** `curl http://127.0.0.1:5005/api/categories`
4. **Backup before changes:** `cp file file.backup`
5. **Use nohup for background processes:** `nohup command &`

---

**💡 Remember: Most issues are solved by restarting Gunicorn backend!** 