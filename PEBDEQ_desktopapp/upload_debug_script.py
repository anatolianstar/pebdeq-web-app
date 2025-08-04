#!/usr/bin/env python3
"""
Quick upload script for debug_models.py
"""
import subprocess
import sys

def upload_and_run():
    """Upload debug script and run it on server"""
    
    print("🚀 Uploading debug script to server...")
    
    # Upload file
    scp_cmd = [
        "scp", 
        "backend/debug_models.py",
        "root@5.161.245.15:/opt/pebdeq/backend/"
    ]
    
    try:
        subprocess.run(scp_cmd, check=True)
        print("✅ File uploaded successfully")
    except subprocess.CalledProcessError as e:
        print(f"❌ Upload failed: {e}")
        return False
    
    print("\n🔧 Running debug script on server...")
    
    # Run script on server
    ssh_cmd = [
        "ssh",
        "root@5.161.245.15", 
        "cd /opt/pebdeq/backend && python debug_models.py"
    ]
    
    try:
        result = subprocess.run(ssh_cmd, capture_output=True, text=True)
        print("📊 DEBUG SCRIPT OUTPUT:")
        print("=" * 50)
        print(result.stdout)
        if result.stderr:
            print("\n⚠️ ERRORS:")
            print(result.stderr)
        print("=" * 50)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ SSH execution failed: {e}")
        return False

if __name__ == "__main__":
    upload_and_run() 