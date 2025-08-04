#!/usr/bin/env python3
"""
🧪 Dual Model System Test
========================

Tests both U2Net and BiRefNet models with the new dual selection system.
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

def test_model(model_preference, description):
    """Test a specific model preference"""
    print(f"\n🎯 Testing {description}...")
    
    try:
        # Create test image
        test_image = create_test_image()
        
        # Test API with model preference
        response = requests.post(
            'http://localhost:5005/api/products/remove-background',
            files={'image': ('test.png', test_image, 'image/png')},
            data={
                'model_type': 'rembg',
                'model_preference': model_preference
            },
            timeout=60  # BiRefNet might take longer
        )
        
        print(f"   📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✅ SUCCESS!")
            print(f"   📦 Input size: {result.get('input_size')} bytes")
            print(f"   📦 Output size: {result.get('output_size')} bytes")
            print(f"   ⏱️ Processing time: {result.get('processing_time')}")
            print(f"   🎯 Model used: {result.get('model_used')}")
            
            if 'preview' in result:
                print(f"   🖼️ Preview generated: {len(result['preview'])} chars")
            
            return True
        else:
            print(f"   ❌ FAILED!")
            print(f"   📄 Response: {response.text[:200]}...")
            return False
            
    except Exception as e:
        print(f"   ❌ Exception: {e}")
        return False

def main():
    """Test all three models"""
    print("🔬 TRIPLE MODEL SYSTEM TEST")
    print("=" * 50)
    
    # Test REMBG Auto (smart selection)
    auto_success = test_model('auto', 'REMBG Auto Selection (Smart)')
    
    # Test U2Net (should always work)
    u2net_success = test_model('u2net', 'U2Net Model (Stable)')
    
    # Test BiRefNet (might fail on low RAM)
    birefnet_success = test_model('birefnet', 'BiRefNet Model (Premium)')
    
    # Summary
    print(f"\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"🚀 REMBG Auto: {'✅ SUCCESS' if auto_success else '❌ FAILED'}")
    print(f"⚡ U2Net (Stable): {'✅ SUCCESS' if u2net_success else '❌ FAILED'}")
    print(f"🌟 BiRefNet (Premium): {'✅ SUCCESS' if birefnet_success else '❌ FAILED'}")
    
    success_count = sum([auto_success, u2net_success, birefnet_success])
    
    if success_count == 3:
        print(f"\n🎉 PERFECT! All three models working!")
    elif success_count >= 2:
        print(f"\n✅ {success_count}/3 models working - System stable!")
    elif success_count >= 1:
        print(f"\n⚠️ Only {success_count}/3 models working - Needs attention!")
    else:
        print(f"\n❌ System not working correctly!")

if __name__ == "__main__":
    main() 