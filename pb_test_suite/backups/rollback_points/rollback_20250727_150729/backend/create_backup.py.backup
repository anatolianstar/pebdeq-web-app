#!/usr/bin/env python3
"""
Database Backup Script
Bu script mevcut veritabanından yeni backup oluşturur
"""

import os
import shutil
import sys
from datetime import datetime

def create_backup():
    """Mevcut veritabanından backup oluştur"""
    
    # Dosya yolları
    current_db = os.path.join('instance', 'pebdeq.db')
    backup_db = os.path.join('instance', 'pebdeq_backup.db')
    
    try:
        # Mevcut veritabanının var olup olmadığını kontrol et
        if not os.path.exists(current_db):
            print(f"❌ Mevcut veritabanı bulunamadı: {current_db}")
            return False
        
        # Eski backup'ı tarihli backup olarak kaydet
        if os.path.exists(backup_db):
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            old_backup = os.path.join('instance', f'pebdeq_backup_{timestamp}.db')
            shutil.copy2(backup_db, old_backup)
            print(f"✅ Eski backup kaydedildi: {old_backup}")
        
        # Yeni backup oluştur
        shutil.copy2(current_db, backup_db)
        print(f"✅ Yeni backup oluşturuldu: {current_db} -> {backup_db}")
        
        print("\n🎉 Backup başarıyla oluşturuldu!")
        print("Bu backup restore_database.py ile geri yüklenebilir.")
        
        return True
        
    except Exception as e:
        print(f"❌ Hata oluştu: {e}")
        return False

if __name__ == "__main__":
    print("💾 Veritabanı backup oluşturma işlemi başlatılıyor...")
    print("="*50)
    
    if create_backup():
        sys.exit(0)
    else:
        sys.exit(1) 