#!/usr/bin/env python3
"""
Database Restore Script
This script restores database from backup
"""

import os
import shutil
import sys

def restore_database():
    """Restore database from backup"""
    
    # File paths
    current_db = os.path.join('instance', 'pebdeq.db')
    backup_db = os.path.join('instance', 'pebdeq_backup.db')
    
    try:
        # Check if backup file exists
        if not os.path.exists(backup_db):
            print(f"❌ Backup file not found: {backup_db}")
            return False
        
        # Delete current database
        if os.path.exists(current_db):
            os.remove(current_db)
            print(f"✅ Current database deleted: {current_db}")
        
        # Copy backup
        shutil.copy2(backup_db, current_db)
        print(f"✅ Database restored: {backup_db} -> {current_db}")
        
        print("\n🎉 Database successfully restored!")
        print("You can now restart the backend.")
        
        return True
        
    except Exception as e:
        print(f"❌ Error occurred: {e}")
        return False

if __name__ == "__main__":
    print("🔄 Starting database restore process...")
    print("="*50)
    
    if restore_database():
        sys.exit(0)
    else:
        sys.exit(1) 