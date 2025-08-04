#!/usr/bin/env python3
"""
🧪 Background Removal API Test
"""

import requests
from PIL import Image
from io import BytesIO

def test_background_removal_api():
    """Test the background removal API"""
    print("🧪 Testing Background Removal API...")
    
    try:
        # Create test image
        img = Image.new('RGB', (100, 100), color='red')
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        print("✅ Test image created")
        
        # Test API
        response = requests.post(
            'http://localhost:5005/api/products/remove-background',
            files={'image': ('test.png', buffer, 'image/png')},
            data={'model_type': 'rembg'}
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("🎉 SUCCESS!")
            print(f"   Model used: {result.get('model_used')}")
            print(f"   Processing time: {result.get('processing_time')}")
            print(f"   Input size: {result.get('input_size')} bytes")
            print(f"   Output size: {result.get('output_size')} bytes")
            print(f"   Dimensions: {result.get('dimensions')}")
            
            if 'preview' in result:
                print("   ✅ Preview image generated successfully")
            
            return True
        else:
            print("❌ FAILED!")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    test_background_removal_api() 