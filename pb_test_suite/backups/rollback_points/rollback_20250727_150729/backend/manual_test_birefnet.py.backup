#!/usr/bin/env python3
"""
🧪 Manual BiRefNet Test
========================

Direct test of BiRefNet vs U2Net to see which works better.
"""

import requests
from PIL import Image
from io import BytesIO

def create_test_image():
    """Create a simple test image"""
    img = Image.new('RGB', (200, 200), color='red')
    buffer = BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return buffer

def main():
    print("🧪 MANUAL BiRefNet TEST")
    print("=" * 40)
    
    # Test BiRefNet (default)
    print("\n🎯 Testing BiRefNet (Default)...")
    test_image = create_test_image()
    
    response = requests.post(
        'http://localhost:5005/api/products/remove-background',
        files={'image': ('test.png', test_image, 'image/png')},
        data={
            'model_type': 'rembg',
            'model_preference': 'birefnet'
        },
        timeout=60
    )
    
    print(f"   Status: {response.status_code}")
    if response.status_code == 200:
        result = response.json()
        print(f"   ✅ SUCCESS!")
        print(f"   Time: {result.get('processing_time')}")
        print(f"   Input: {result.get('input_size')} bytes")
        print(f"   Output: {result.get('output_size')} bytes")
    else:
        print(f"   ❌ FAILED: {response.text[:200]}")

if __name__ == "__main__":
    main() 