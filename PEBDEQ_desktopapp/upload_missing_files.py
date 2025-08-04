#!/usr/bin/env python3
"""
PEBDEQ MISSING FILES UPLOADER
Backend ve Frontend dosyalarını server'a yükler
"""

import paramiko
import os
import sys
from pathlib import Path

class MissingFilesUploader:
    def __init__(self):
        self.server_ip = "5.161.245.15"
        self.server_user = "root"
        self.server_password = "twUsMkhHuLnU"
        self.server_port = 22
        self.ssh_client = None
        self.sftp_client = None
        self.local_project_path = Path(__file__).parent
        
    def connect(self):
        """Server'a SSH ve SFTP bağlantısı kur"""
        try:
            self.ssh_client = paramiko.SSHClient()
            self.ssh_client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            self.ssh_client.connect(
                hostname=self.server_ip,
                port=self.server_port,
                username=self.server_user,
                password=self.server_password,
                timeout=30
            )
            
            self.sftp_client = self.ssh_client.open_sftp()
            print("✅ Server ve SFTP bağlantısı başarılı!")
            return True
        except Exception as e:
            print(f"❌ Bağlantı hatası: {e}")
            return False
    
    def execute_command(self, command, description=""):
        """SSH komutunu çalıştır"""
        try:
            if description:
                print(f"🔧 {description}")
            
            stdin, stdout, stderr = self.ssh_client.exec_command(command)
            stdout_text = stdout.read().decode()
            stderr_text = stderr.read().decode()
            
            if stderr_text:
                print(f"⚠️  Warning: {stderr_text}")
            if stdout_text:
                print(f"📄 Output: {stdout_text}")
                
            return stdout_text, stderr_text
        except Exception as e:
            print(f"❌ Komut hatası: {e}")
            return "", str(e)
    
    def check_server_structure(self):
        """Server'da mevcut yapıyı kontrol et"""
        print("\n🔍 SERVER YAPISINI KONTROL EDİYOR...")
        
        commands = [
            ("Opt pebdeq içeriği", "ls -la /opt/pebdeq/"),
            ("Backend dizini kontrol", "ls -la /opt/pebdeq/backend/ || echo 'Backend not found'"),
            ("Frontend dizini kontrol", "ls -la /opt/pebdeq/frontend/ || echo 'Frontend not found'"),
            ("Test suite içeriği", "ls -la /opt/pebdeq/pb_test_suite/ | head -10")
        ]
        
        for description, command in commands:
            self.execute_command(command, description)
    
    def create_directories(self):
        """Gerekli dizinleri oluştur"""
        print("\n🔧 GEREKLİ DİZİNLER OLUŞTURULUYOR...")
        
        directories = [
            "/opt/pebdeq/backend",
            "/opt/pebdeq/backend/app",
            "/opt/pebdeq/backend/app/models",
            "/opt/pebdeq/backend/app/routes", 
            "/opt/pebdeq/backend/app/utils",
            "/opt/pebdeq/backend/migrations",
            "/opt/pebdeq/backend/instance",
            "/opt/pebdeq/backend/uploads",
            "/opt/pebdeq/frontend",
            "/opt/pebdeq/frontend/src",
            "/opt/pebdeq/frontend/src/components",
            "/opt/pebdeq/frontend/src/pages",
            "/opt/pebdeq/frontend/src/contexts",
            "/opt/pebdeq/frontend/public"
        ]
        
        for directory in directories:
            try:
                self.sftp_client.mkdir(directory)
                print(f"✅ Oluşturuldu: {directory}")
            except Exception as e:
                if "File exists" in str(e):
                    print(f"👍 Zaten mevcut: {directory}")
                else:
                    print(f"❌ Hata: {directory} - {e}")
    
    def upload_file(self, local_path, remote_path):
        """Tek dosya yükle"""
        try:
            # Remote dizini oluştur
            remote_dir = os.path.dirname(remote_path)
            try:
                self.sftp_client.mkdir(remote_dir)
            except:
                pass  # Dizin zaten mevcut
                
            self.sftp_client.put(str(local_path), remote_path)
            print(f"✅ Yüklendi: {local_path.name}")
            return True
        except Exception as e:
            print(f"❌ Upload hatası {local_path.name}: {e}")
            return False
    
    def upload_backend_files(self):
        """Backend dosyalarını yükle"""
        print("\n📤 BACKEND DOSYALARI YÜKLENİYOR...")
        
        backend_local = self.local_project_path / "backend"
        if not backend_local.exists():
            print(f"❌ Local backend dizini bulunamadı: {backend_local}")
            return False
        
        # Kritik backend dosyaları
        critical_files = [
            "run.py",
            "requirements.txt",
            ".env.example"
        ]
        
        for file_name in critical_files:
            local_file = backend_local / file_name
            if local_file.exists():
                remote_file = f"/opt/pebdeq/backend/{file_name}"
                self.upload_file(local_file, remote_file)
            else:
                print(f"⚠️  Dosya bulunamadı: {local_file}")
        
        # App klasörü
        app_local = backend_local / "app"
        if app_local.exists():
            for root, dirs, files in os.walk(app_local):
                for file in files:
                    if file.endswith(('.py', '.json')):
                        local_file = Path(root) / file
                        relative_path = local_file.relative_to(backend_local)
                        remote_file = f"/opt/pebdeq/backend/{relative_path}"
                        self.upload_file(local_file, remote_file)
        
        # Migrations
        migrations_local = backend_local / "migrations"
        if migrations_local.exists():
            for root, dirs, files in os.walk(migrations_local):
                for file in files:
                    if file.endswith(('.py', '.ini', '.mako')):
                        local_file = Path(root) / file
                        relative_path = local_file.relative_to(backend_local)
                        remote_file = f"/opt/pebdeq/backend/{relative_path}"
                        self.upload_file(local_file, remote_file)
        
        print("✅ Backend dosyaları upload tamamlandı!")
    
    def upload_frontend_files(self):
        """Frontend dosyalarını yükle"""
        print("\n📤 FRONTEND DOSYALARI YÜKLENİYOR...")
        
        frontend_local = self.local_project_path / "frontend"
        if not frontend_local.exists():
            print(f"❌ Local frontend dizini bulunamadı: {frontend_local}")
            return False
        
        # Kritik frontend dosyaları
        critical_files = [
            "package.json",
            "package-lock.json",
            ".env.example"
        ]
        
        for file_name in critical_files:
            local_file = frontend_local / file_name
            if local_file.exists():
                remote_file = f"/opt/pebdeq/frontend/{file_name}"
                self.upload_file(local_file, remote_file)
        
        # Public klasörü
        public_local = frontend_local / "public"
        if public_local.exists():
            for root, dirs, files in os.walk(public_local):
                for file in files:
                    local_file = Path(root) / file
                    relative_path = local_file.relative_to(frontend_local)
                    remote_file = f"/opt/pebdeq/frontend/{relative_path}"
                    self.upload_file(local_file, remote_file)
        
        # Src klasörü - sadece kritik dosyalar
        src_local = frontend_local / "src"
        if src_local.exists():
            # Ana dosyalar
            main_files = ["App.js", "App.css", "index.js"]
            for file_name in main_files:
                local_file = src_local / file_name
                if local_file.exists():
                    remote_file = f"/opt/pebdeq/frontend/src/{file_name}"
                    self.upload_file(local_file, remote_file)
            
            # Alt klasörler - seçici yükleme
            important_dirs = ["components", "pages", "contexts", "utils", "themes"]
            for dir_name in important_dirs:
                dir_local = src_local / dir_name
                if dir_local.exists():
                    for root, dirs, files in os.walk(dir_local):
                        for file in files:
                            if file.endswith(('.js', '.jsx', '.css')):
                                local_file = Path(root) / file
                                relative_path = local_file.relative_to(frontend_local)
                                remote_file = f"/opt/pebdeq/frontend/{relative_path}"
                                self.upload_file(local_file, remote_file)
        
        print("✅ Frontend dosyaları upload tamamlandı!")
    
    def setup_backend_environment(self):
        """Backend environment kurum"""
        print("\n🔧 BACKEND ENVIRONMENT KURULUYOR...")
        
        commands = [
            ("Python venv oluştur", "cd /opt/pebdeq/backend && python3 -m venv venv"),
            ("Pip upgrade", "cd /opt/pebdeq/backend && source venv/bin/activate && pip install --upgrade pip"),
            ("Requirements yükle", "cd /opt/pebdeq/backend && source venv/bin/activate && pip install -r requirements.txt"),
            ("Environment dosyası oluştur", """cd /opt/pebdeq/backend && echo 'DATABASE_URL=sqlite:///instance/site.db
SECRET_KEY=your-secret-key-here-change-in-production
FLASK_ENV=production
FLASK_DEBUG=False
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=True
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password' > .env"""),
            ("Instance dizini oluştur", "cd /opt/pebdeq/backend && mkdir -p instance"),
            ("Uploads dizini oluştur", "cd /opt/pebdeq/backend && mkdir -p uploads/products uploads/site uploads/categories"),
            ("Database init", "cd /opt/pebdeq/backend && source venv/bin/activate && flask db init || echo 'Already initialized'"),
            ("Database migrate", "cd /opt/pebdeq/backend && source venv/bin/activate && flask db migrate -m 'Initial migration' || echo 'Migration exists'"),
            ("Database upgrade", "cd /opt/pebdeq/backend && source venv/bin/activate && flask db upgrade"),
            ("Permissions düzelt", "chown -R root:root /opt/pebdeq/backend && chmod -R 755 /opt/pebdeq/backend"),
            ("Service restart", "systemctl daemon-reload && systemctl restart pebdeq-backend"),
            ("Service status", "systemctl status pebdeq-backend")
        ]
        
        for description, command in commands:
            self.execute_command(command, description)
    
    def install_frontend_dependencies(self):
        """Frontend dependencies kur"""
        print("\n🔧 FRONTEND DEPENDENCIES KURULUYOR...")
        
        commands = [
            ("Node version kontrol", "node --version && npm --version"),
            ("NPM install", "cd /opt/pebdeq/frontend && npm install"),
            ("Build frontend", "cd /opt/pebdeq/frontend && npm run build || echo 'Build command may not exist'"),
            ("Permissions düzelt", "chown -R root:root /opt/pebdeq/frontend && chmod -R 755 /opt/pebdeq/frontend")
        ]
        
        for description, command in commands:
            self.execute_command(command, description)
    
    def test_uploads(self):
        """Upload'ları test et"""
        print("\n🧪 UPLOAD'LAR TEST EDİLİYOR...")
        
        commands = [
            ("Backend dizin kontrol", "ls -la /opt/pebdeq/backend/ | head -10"),
            ("Frontend dizin kontrol", "ls -la /opt/pebdeq/frontend/ | head -10"),
            ("Backend run.py kontrol", "ls -la /opt/pebdeq/backend/run.py"),
            ("Frontend package.json kontrol", "ls -la /opt/pebdeq/frontend/package.json"),
            ("Backend service kontrol", "systemctl status pebdeq-backend"),
            ("Port kontrol", "netstat -tlnp | grep :5005 || echo 'Port 5005 not listening'"),
            ("Backend test request", "curl -s http://localhost:5005/ || echo 'Backend not responding'")
        ]
        
        for description, command in commands:
            self.execute_command(command, description)
    
    def run_upload(self):
        """Tüm upload işlemlerini çalıştır"""
        print("🚀 PEBDEQ MISSING FILES UPLOAD BAŞLATIYOR...")
        
        if not self.connect():
            return False
        
        try:
            self.check_server_structure()
            self.create_directories()
            self.upload_backend_files()
            self.upload_frontend_files()
            self.setup_backend_environment()
            self.install_frontend_dependencies()
            self.test_uploads()
            
            print("\n✅ TÜM UPLOAD İŞLEMLERİ TAMAMLANDI!")
            print("🔧 Backend servisi başlatıldı ve test edilebilir durumda.")
            
        except Exception as e:
            print(f"❌ Upload hatası: {e}")
        finally:
            if self.sftp_client:
                self.sftp_client.close()
            if self.ssh_client:
                self.ssh_client.close()
                print("🔐 SSH ve SFTP bağlantıları kapatıldı.")

if __name__ == "__main__":
    uploader = MissingFilesUploader()
    uploader.run_upload() 