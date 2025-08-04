#!/usr/bin/env python3
"""
🔍 Model Debug Script - Check REMBG Models on Server
====================================================

This script checks:
1. Are REMBG models downloaded?
2. Model file sizes and locations
3. Test model loading
4. Force download if needed
"""

import os
import sys
from pathlib import Path

def check_rembg_availability():
    """Check if rembg is available and working"""
    print("🔍 Checking REMBG availability...")
    
    try:
        import rembg
        print(f"✅ REMBG imported successfully - Version: {rembg.__version__}")
        return True
    except ImportError as e:
        print(f"❌ REMBG import failed: {e}")
        return False
    except Exception as e:
        print(f"❌ REMBG error: {e}")
        return False

def check_model_cache():
    """Check model cache directory and files"""
    print("\n🗂️ Checking model cache directory...")
    
    # Common cache locations
    cache_locations = [
        os.path.expanduser("~/.u2net"),
        os.path.expanduser("~/.cache/rembg"),
        "/tmp/.u2net",
        "/opt/pebdeq/.u2net",
        "/opt/pebdeq/.cache/rembg"
    ]
    
    found_models = []
    
    for cache_dir in cache_locations:
        cache_path = Path(cache_dir)
        print(f"   📁 Checking: {cache_dir}")
        
        if cache_path.exists():
            print(f"   ✅ Directory exists")
            
            # List all files in cache
            for file_path in cache_path.rglob("*"):
                if file_path.is_file():
                    size_mb = file_path.stat().st_size / (1024 * 1024)
                    print(f"      📄 {file_path.name}: {size_mb:.1f} MB")
                    found_models.append({
                        'name': file_path.name,
                        'path': str(file_path),
                        'size_mb': size_mb
                    })
        else:
            print(f"   ❌ Directory not found")
    
    return found_models

def test_model_download():
    """Test downloading and loading models"""
    print("\n🚀 Testing model download and loading...")
    
    try:
        from rembg import new_session, remove
        from PIL import Image
        import io
        import requests
        
        # Test models to try
        models_to_test = [
            'u2net',
            'u2netp', 
            'birefnet-general',
            'isnet-general-use'
        ]
        
        for model_name in models_to_test:
            print(f"\n   🎯 Testing model: {model_name}")
            
            try:
                # Try to create session (this will download model if needed)
                session = new_session(model_name)
                print(f"   ✅ Session created for {model_name}")
                
                # Test with a small image
                print(f"   🖼️ Testing with sample image...")
                
                # Create a small test image
                test_img = Image.new('RGB', (100, 100), color='red')
                img_buffer = io.BytesIO()
                test_img.save(img_buffer, format='PNG')
                img_bytes = img_buffer.getvalue()
                
                # Try to remove background
                result = remove(img_bytes, session=session)
                print(f"   ✅ Background removal test successful for {model_name}")
                print(f"   📊 Input: {len(img_bytes)} bytes, Output: {len(result)} bytes")
                
                return True, model_name
                
            except Exception as e:
                print(f"   ❌ Model {model_name} failed: {str(e)}")
                continue
        
        return False, None
        
    except ImportError as e:
        print(f"   ❌ Import error: {e}")
        return False, None
    except Exception as e:
        print(f"   ❌ General error: {e}")
        return False, None

def force_download_models():
    """Force download all models"""
    print("\n⚡ Force downloading models...")
    
    try:
        from rembg import new_session
        
        models = ['u2net', 'u2netp', 'birefnet-general', 'isnet-general-use']
        
        for model_name in models:
            print(f"   📥 Downloading {model_name}...")
            try:
                session = new_session(model_name)
                print(f"   ✅ {model_name} downloaded successfully")
            except Exception as e:
                print(f"   ❌ {model_name} download failed: {e}")
                
    except Exception as e:
        print(f"   ❌ Force download error: {e}")

def check_system_resources():
    """Check system resources"""
    print("\n💻 Checking system resources...")
    
    try:
        import psutil
        
        # Memory info
        memory = psutil.virtual_memory()
        print(f"   🧠 RAM Total: {memory.total / (1024**3):.1f} GB")
        print(f"   🧠 RAM Available: {memory.available / (1024**3):.1f} GB")
        print(f"   🧠 RAM Used: {memory.percent}%")
        
        # CPU info
        cpu_count = psutil.cpu_count()
        print(f"   🖥️ CPU Cores: {cpu_count}")
        
        # Disk space
        disk = psutil.disk_usage('/')
        print(f"   💾 Disk Free: {disk.free / (1024**3):.1f} GB")
        
    except ImportError:
        print("   ⚠️ psutil not available, using basic checks")
        import os
        print(f"   🖥️ CPU Cores: {os.cpu_count()}")

def main():
    """Main debug function"""
    print("🔍 REMBG MODEL DEBUG SCRIPT")
    print("=" * 50)
    
    # Check REMBG availability
    if not check_rembg_availability():
        print("\n❌ REMBG not available. Install with: pip install rembg")
        return
    
    # Check model cache
    models = check_model_cache()
    if not models:
        print("\n⚠️ No models found in cache")
    else:
        print(f"\n✅ Found {len(models)} model files")
    
    # Check system resources
    check_system_resources()
    
    # Test model download and loading
    success, working_model = test_model_download()
    
    if success:
        print(f"\n🎉 SUCCESS! Working model: {working_model}")
    else:
        print(f"\n❌ All models failed. Trying force download...")
        force_download_models()
        
        # Test again
        success, working_model = test_model_download()
        if success:
            print(f"\n🎉 SUCCESS after force download! Working model: {working_model}")
        else:
            print(f"\n❌ All attempts failed. Server may need more resources.")
    
    print("\n" + "=" * 50)
    print("🔍 DEBUG COMPLETE")

if __name__ == "__main__":
    main() 