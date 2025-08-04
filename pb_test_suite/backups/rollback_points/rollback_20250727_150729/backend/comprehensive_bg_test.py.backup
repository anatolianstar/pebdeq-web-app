#!/usr/bin/env python3
"""
🔬 Comprehensive Background Removal Test
========================================

Tests all 3 methods:
1. REMBG (with BiRefNet + U2Net)
2. BRIA (Transformers)  
3. Simple (OpenCV)

On both local and server environments.
"""

import os
import sys
import time
from datetime import datetime
from PIL import Image
from io import BytesIO
import requests
import json

def create_test_images():
    """Create various test images"""
    test_images = {}
    
    # 1. Simple red square
    img1 = Image.new('RGB', (200, 200), color='red')
    buffer1 = BytesIO()
    img1.save(buffer1, format='PNG')
    test_images['red_square'] = buffer1.getvalue()
    
    # 2. Red circle on white background
    img2 = Image.new('RGB', (200, 200), color='white')
    # Simple circle simulation
    for x in range(200):
        for y in range(200):
            if (x-100)**2 + (y-100)**2 < 50**2:
                img2.putpixel((x, y), (255, 0, 0))
    buffer2 = BytesIO()
    img2.save(buffer2, format='PNG')
    test_images['red_circle'] = buffer2.getvalue()
    
    # 3. Gradient image
    img3 = Image.new('RGB', (200, 200))
    for x in range(200):
        for y in range(200):
            img3.putpixel((x, y), (x, y, 128))
    buffer3 = BytesIO()
    img3.save(buffer3, format='PNG')
    test_images['gradient'] = buffer3.getvalue()
    
    return test_images

def test_api_method(image_data, image_name, model_type, api_url="http://localhost:5005"):
    """Test a specific model via API"""
    print(f"   🎯 Testing {model_type} with {image_name}...")
    
    try:
        start_time = time.time()
        
        response = requests.post(
            f'{api_url}/api/products/remove-background',
            files={'image': (f'{image_name}.png', BytesIO(image_data), 'image/png')},
            data={'model_type': model_type},
            timeout=30
        )
        
        processing_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            return {
                'success': True,
                'model_used': result.get('model_used'),
                'processing_time': result.get('processing_time'),
                'actual_time': f'{processing_time:.2f}s',
                'input_size': result.get('input_size'),
                'output_size': result.get('output_size'),
                'dimensions': result.get('dimensions'),
                'has_preview': 'preview' in result and result['preview'].startswith('data:image'),
                'preview_size': len(result.get('preview', '')) if 'preview' in result else 0
            }
        else:
            return {
                'success': False,
                'error': response.text,
                'status_code': response.status_code,
                'actual_time': f'{processing_time:.2f}s'
            }
            
    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'actual_time': f'{time.time() - start_time:.2f}s'
        }

def test_direct_rembg(image_data, image_name):
    """Test REMBG directly (not via API)"""
    print(f"   🔬 Direct REMBG test with {image_name}...")
    
    try:
        from rembg import remove, new_session
        
        start_time = time.time()
        
        # Test U2Net
        u2net_result = remove(image_data)
        u2net_time = time.time() - start_time
        
        # Test BiRefNet
        try:
            start_time2 = time.time()
            session = new_session('birefnet-general')
            birefnet_result = remove(image_data, session=session)
            birefnet_time = time.time() - start_time2
        except Exception as e:
            birefnet_result = None
            birefnet_time = 0
            birefnet_error = str(e)
        
        return {
            'u2net': {
                'success': True,
                'time': f'{u2net_time:.2f}s',
                'output_size': len(u2net_result),
                'input_size': len(image_data)
            },
            'birefnet': {
                'success': birefnet_result is not None,
                'time': f'{birefnet_time:.2f}s',
                'output_size': len(birefnet_result) if birefnet_result else 0,
                'error': birefnet_error if birefnet_result is None else None
            }
        }
        
    except ImportError:
        return {'error': 'REMBG not available'}
    except Exception as e:
        return {'error': str(e)}

def check_environment():
    """Check current environment"""
    info = {
        'python_version': sys.version,
        'platform': sys.platform,
        'cwd': os.getcwd()
    }
    
    # Check available libraries
    libraries = {}
    for lib in ['rembg', 'transformers', 'torch', 'cv2', 'numpy', 'PIL', 'requests']:
        try:
            __import__(lib)
            libraries[lib] = '✅ Available'
        except ImportError:
            libraries[lib] = '❌ Not available'
    
    info['libraries'] = libraries
    return info

def main():
    """Main comprehensive test"""
    print("🔬 COMPREHENSIVE BACKGROUND REMOVAL TEST")
    print("=" * 60)
    
    # Environment check
    print("\n📋 Environment Information:")
    env_info = check_environment()
    print(f"   🐍 Python: {env_info['python_version'].split()[0]}")
    print(f"   💻 Platform: {env_info['platform']}")
    print(f"   📁 Working Directory: {env_info['cwd']}")
    print("\n📦 Libraries:")
    for lib, status in env_info['libraries'].items():
        print(f"   {lib}: {status}")
    
    # Create test images
    print("\n🖼️ Creating test images...")
    test_images = create_test_images()
    print(f"   ✅ Created {len(test_images)} test images")
    
    # Test models
    models_to_test = ['rembg', 'bria', 'simple', 'auto']
    results = {}
    
    print(f"\n🧪 Testing {len(models_to_test)} models with {len(test_images)} images...")
    
    for model in models_to_test:
        print(f"\n🔬 Testing Model: {model.upper()}")
        results[model] = {}
        
        for img_name, img_data in test_images.items():
            result = test_api_method(img_data, img_name, model)
            results[model][img_name] = result
            
            if result['success']:
                print(f"      ✅ {img_name}: {result['processing_time']} | Output: {result['output_size']} bytes")
            else:
                print(f"      ❌ {img_name}: {result.get('error', 'Unknown error')}")
    
    # Direct REMBG test
    if env_info['libraries']['rembg'] == '✅ Available':
        print(f"\n🔬 Direct REMBG Testing (bypass API):")
        direct_results = {}
        
        for img_name, img_data in test_images.items():
            direct_result = test_direct_rembg(img_data, img_name)
            direct_results[img_name] = direct_result
            
            if 'error' not in direct_result:
                print(f"   ✅ {img_name}:")
                print(f"      U2Net: {direct_result['u2net']['time']} | {direct_result['u2net']['output_size']} bytes")
                if direct_result['birefnet']['success']:
                    print(f"      BiRefNet: {direct_result['birefnet']['time']} | {direct_result['birefnet']['output_size']} bytes")
                else:
                    print(f"      BiRefNet: ❌ {direct_result['birefnet'].get('error', 'Failed')}")
            else:
                print(f"   ❌ {img_name}: {direct_result['error']}")
    
    # Summary Report
    print("\n" + "=" * 60)
    print("📊 SUMMARY REPORT")
    print("=" * 60)
    
    for model in models_to_test:
        success_count = sum(1 for result in results[model].values() if result['success'])
        total_count = len(results[model])
        print(f"🎯 {model.upper()}: {success_count}/{total_count} successful")
        
        if success_count > 0:
            avg_time = sum(float(r['processing_time'].replace('s','')) 
                          for r in results[model].values() 
                          if r['success'] and 'processing_time' in r) / success_count
            print(f"   ⏱️ Average time: {avg_time:.2f}s")
    
    # Save results to file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    results_file = f"bg_removal_test_{timestamp}.json"
    
    full_results = {
        'timestamp': timestamp,
        'environment': env_info,
        'api_results': results,
        'direct_rembg': direct_results if 'direct_results' in locals() else None
    }
    
    with open(results_file, 'w') as f:
        json.dump(full_results, f, indent=2, default=str)
    
    print(f"\n💾 Results saved to: {results_file}")
    print("\n🔍 ANALYSIS COMPLETE!")

if __name__ == "__main__":
    main() 