#!/usr/bin/env python3
"""
PEBDEQ SERVER STATUS CHECKER
Deployment sonrası server durumunu kontrol eder
"""

import paramiko
import sys

class ServerChecker:
    def __init__(self):
        self.server_ip = "5.161.245.15"
        self.server_user = "root"
        self.server_password = "twUsMkhHuLnU"
        self.server_port = 22
        self.ssh_client = None
        
    def connect(self):
        """Server'a SSH bağlantısı kur"""
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
            print("✅ Server bağlantısı başarılı!")
            return True
        except Exception as e:
            print(f"❌ Server bağlantı hatası: {e}")
            return False
    
    def execute_command(self, command, description=""):
        """SSH komutunu çalıştır"""
        try:
            if description:
                print(f"\n🔍 {description}")
            print(f"💻 Komut: {command}")
            
            stdin, stdout, stderr = self.ssh_client.exec_command(command)
            stdout_text = stdout.read().decode()
            stderr_text = stderr.read().decode()
            
            if stderr_text:
                print(f"⚠️  Warning: {stderr_text}")
            
            if stdout_text:
                print(f"📄 Output:\n{stdout_text}")
            else:
                print("📄 Output: (empty)")
                
            return stdout_text, stderr_text
        except Exception as e:
            print(f"❌ Komut hatası: {e}")
            return "", str(e)
    
    def check_server_status(self):
        """Server durumunu kontrol et"""
        print("\n🔍 SERVER DURUMU KONTROL EDİLİYOR...")
        
        commands = [
            ("Sistemin temel bilgileri", "uname -a && whoami && pwd"),
            ("Root dizin içeriği", "ls -la /"),
            ("Opt dizin içeriği", "ls -la /opt/"),
            ("Pebdeq dizini arama", "find / -name '*pebdeq*' -type d 2>/dev/null | head -20"),
            ("Var www dizini", "ls -la /var/www/ || echo 'No www directory'"),
            ("Home dizini", "ls -la /home/ || echo 'No home directories'"),
            ("Çalışan servisler", "systemctl list-units --type=service --state=running | grep -i pebdeq || echo 'No pebdeq services'"),
            ("Python süreçleri", "ps aux | grep python | grep -v grep || echo 'No Python processes'"),
            ("Port dinleyicileri", "netstat -tlnp | grep -E ':(80|443|3000|5005)' || echo 'No web ports listening'"),
            ("Nginx durumu", "systemctl status nginx || echo 'Nginx not installed/running'"),
            ("Recent logs", "journalctl --since '1 hour ago' | grep -i pebdeq | tail -20 || echo 'No recent pebdeq logs'"),
            ("Disk kullanımı", "df -h"),
            ("Memory kullanımı", "free -h")
        ]
        
        for description, command in commands:
            self.execute_command(command, description)
    
    def find_project_files(self):
        """Proje dosyalarını bul"""
        print("\n🔍 PROJE DOSYALARI ARANLIYOR...")
        
        search_commands = [
            ("Frontend dosyaları arama", "find / -name 'package.json' 2>/dev/null | grep -v node_modules | head -10"),
            ("Backend dosyaları arama", "find / -name 'run.py' 2>/dev/null | head -10"),
            ("Requirements dosyaları", "find / -name 'requirements.txt' 2>/dev/null | head -10"),
            ("Flask app dosyaları", "find / -name 'app.py' -o -name '__init__.py' 2>/dev/null | grep -v __pycache__ | head -20"),
            ("Test suite dosyaları", "find / -name 'pb_test_suite' -type d 2>/dev/null"),
            ("Config dosyaları", "find / -name '*.json' 2>/dev/null | grep -E '(config|settings)' | head -10"),
            ("Son yüklenen dosyalar", "find / -type f -newermt '2 hours ago' 2>/dev/null | grep -v '/proc/' | grep -v '/sys/' | head -20")
        ]
        
        for description, command in search_commands:
            self.execute_command(command, description)
    
    def check_deployment_logs(self):
        """Deployment loglarını kontrol et"""
        print("\n🔍 DEPLOYMENT LOGLARI KONTROL EDİLİYOR...")
        
        log_commands = [
            ("Systemd journal - last hour", "journalctl --since '1 hour ago' | tail -50"),
            ("Syslog - deployment", "tail -100 /var/log/syslog | grep -i deploy || echo 'No deployment logs in syslog'"),
            ("Auth log", "tail -50 /var/log/auth.log | grep -v 'session closed' | tail -20"),
            ("Cron logs", "grep -i cron /var/log/syslog | tail -10 || echo 'No recent cron activity'"),
            ("Failed services", "systemctl --failed || echo 'No failed services'")
        ]
        
        for description, command in log_commands:
            self.execute_command(command, description)
    
    def run_check(self):
        """Tüm kontrolleri çalıştır"""
        print("🚀 PEBDEQ SERVER STATUS CHECK BAŞLATIYOR...")
        
        if not self.connect():
            return False
        
        try:
            self.check_server_status()
            self.find_project_files()
            self.check_deployment_logs()
            
            print("\n✅ SERVER STATUS CHECK TAMAMLANDI!")
            
        except Exception as e:
            print(f"❌ Check hatası: {e}")
        finally:
            if self.ssh_client:
                self.ssh_client.close()
                print("🔐 SSH bağlantısı kapatıldı.")

if __name__ == "__main__":
    checker = ServerChecker()
    checker.run_check() 