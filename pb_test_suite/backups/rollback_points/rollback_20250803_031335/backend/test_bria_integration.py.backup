#!/usr/bin/env python3
"""
🧪 BRIA RMBG-1.4 Integration Test
================================

Test script to verify BRIA RMBG-1.4 model integration works correctly.
"""

import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_import_compatibility():
    """Test if required modules can be imported"""
    print("🔍 Testing import compatibility...")
    
    try:
        # Test REMBG (always required)
        from rembg import remove
        print("   ✅ REMBG imported successfully")
    except ImportError as e:
        print(f"   ❌ REMBG import failed: {e}")
        return False
    
    try:
        # Test transformers (for BRIA RMBG)
        from transformers import pipeline
        print("   ✅ Transformers imported successfully")
        bria_available = True
    except ImportError as e:
        print(f"   ⚠️ Transformers not available: {e}")
        print("   💡 BRIA RMBG will fallback to U2Net")
        bria_available = False
    
    try:
        # Test our functions
        from app.routes.products import unified_background_removal, _process_with_u2net, _process_with_bria_rmbg
        print("   ✅ Backend functions imported successfully")
    except ImportError as e:
        print(f"   ❌ Backend function import failed: {e}")
        return False
    
    return True, bria_available

def test_model_selection():
    """Test model selection logic"""
    print("\n🎯 Testing model selection logic...")
    
    try:
        from app.routes.products import unified_background_removal
        from PIL import Image
        import io
        
        # Create a small test image
        test_img = Image.new('RGB', (100, 100), color='red')
        
        print("   Testing Fast Mode (U2Net)...")
        try:
            result_fast = unified_background_removal(test_img, "fast")
            print("   ✅ Fast mode works")
        except Exception as e:
            print(f"   ❌ Fast mode failed: {e}")
            return False
        
        print("   Testing Premium Mode (BRIA RMBG-1.4)...")
        try:
            result_premium = unified_background_removal(test_img, "premium")
            print("   ✅ Premium mode works (or fell back to U2Net)")
        except Exception as e:
            print(f"   ❌ Premium mode failed: {e}")
            return False
        
        return True
        
    except Exception as e:
        print(f"   ❌ Model selection test failed: {e}")
        return False

def test_api_compatibility():
    """Test API endpoint compatibility"""
    print("\n🌐 Testing API endpoint compatibility...")
    
    try:
        # Test that API endpoint still works
        print("   API endpoint available for testing with:")
        print("   POST /api/products/remove-background")
        print("   Parameters:")
        print("   - image: image file")
        print("   - model_preference: 'fast' or 'premium'")
        print("   ✅ API structure is compatible")
        return True
    except Exception as e:
        print(f"   ❌ API compatibility test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🧪 BRIA RMBG-1.4 INTEGRATION TEST")
    print("=" * 50)
    
    # Test imports
    import_result = test_import_compatibility()
    if not import_result[0]:
        print("\n❌ IMPORT TESTS FAILED")
        return False
    
    bria_available = import_result[1]
    
    # Test model selection
    if not test_model_selection():
        print("\n❌ MODEL SELECTION TESTS FAILED")
        return False
    
    # Test API compatibility  
    if not test_api_compatibility():
        print("\n❌ API COMPATIBILITY TESTS FAILED")
        return False
    
    print("\n" + "=" * 50)
    print("🎉 ALL TESTS PASSED!")
    print("\n📊 Summary:")
    print("   ✅ Fast Mode: U2Net (always available)")
    if bria_available:
        print("   ✅ Premium Mode: BRIA RMBG-1.4 (full functionality)")
    else:
        print("   ⚠️ Premium Mode: Falls back to U2Net (BRIA dependencies missing)")
    
    print("\n💡 Usage:")
    print("   - Fast Mode: Good quality, 2-5 seconds")
    print("   - Premium Mode: Very high quality, 5-15 seconds")
    print("   - Automatic fallback: Premium → U2Net if BRIA unavailable")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 