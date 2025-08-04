#!/usr/bin/env python3
"""
🔍 BiRefNet Debug Script
=======================

Check what BiRefNet models are actually available in REMBG
and test BiRefNet functionality step by step.
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def debug_birefnet():
    """Debug BiRefNet availability and functionality"""
    print("🔍 BIREFNET DEBUG SCRIPT")
    print("=" * 40)
    
    # Test 1: Check REMBG import
    print("\n1. 📦 Testing REMBG import...")
    try:
        import rembg
        print(f"   ✅ REMBG imported successfully")
        print(f"   📋 REMBG version: {getattr(rembg, '__version__', 'unknown')}")
    except ImportError as e:
        print(f"   ❌ REMBG import failed: {e}")
        return False
    except Exception as e:
        print(f"   ❌ REMBG unexpected error: {e}")
        return False
    
    # Test 2: Check available models
    print("\n2. 🧠 Checking available models...")
    try:
        from rembg import new_session
        
        # Get all available models
        if hasattr(rembg, 'models'):
            available_models = list(rembg.models.keys())
            print(f"   📋 Available models: {available_models}")
        else:
            print("   ⚠️ Cannot access rembg.models")
        
        # Check common model names
        test_models = [
            'birefnet-general',
            'birefnet',
            'BiRefNet-General', 
            'birefnet_general',
            'BiRefNet',
            'u2net',
            'isnet-general-use'
        ]
        
        working_models = []
        for model_name in test_models:
            try:
                print(f"   🧪 Testing model: {model_name}")
                session = new_session(model_name)
                print(f"   ✅ {model_name} - SUCCESS")
                working_models.append(model_name)
                del session  # Clean up
            except Exception as e:
                print(f"   ❌ {model_name} - FAILED: {str(e)[:100]}")
        
        print(f"\n   📊 Working models: {working_models}")
        
        if not working_models:
            print("   🚫 NO MODELS WORKING!")
            return False
            
        # Find BiRefNet equivalent
        birefnet_model = None
        for model in working_models:
            if 'birefnet' in model.lower():
                birefnet_model = model
                break
        
        if birefnet_model:
            print(f"   🎯 BiRefNet model found: {birefnet_model}")
        else:
            print("   ⚠️ No BiRefNet model found, will use alternative")
            birefnet_model = working_models[0] if working_models else None
        
        return birefnet_model
        
    except Exception as e:
        print(f"   ❌ Model checking failed: {e}")
        return False

def test_birefnet_processing(model_name):
    """Test actual BiRefNet processing"""
    print(f"\n3. 🎨 Testing BiRefNet processing with: {model_name}")
    
    try:
        from rembg import new_session, remove
        from PIL import Image
        import numpy as np
        from io import BytesIO
        
        # Create test image
        test_img = Image.new('RGB', (200, 200), color='white')
        img_array = np.array(test_img)
        
        # Add red circle in center
        center_x, center_y = 100, 100
        y, x = np.ogrid[:200, :200]
        mask = (x - center_x)**2 + (y - center_y)**2 <= 50**2
        img_array[mask] = [255, 0, 0]
        
        test_img = Image.fromarray(img_array)
        print("   📸 Test image created (red circle on white)")
        
        # Convert to bytes
        buffer = BytesIO()
        test_img.save(buffer, format='PNG')
        input_bytes = buffer.getvalue()
        print(f"   📏 Input size: {len(input_bytes)} bytes")
        
        # Create session
        print(f"   🧠 Creating session for: {model_name}")
        session = new_session(model_name)
        print("   ✅ Session created")
        
        # Process
        print("   🎨 Processing image...")
        output_bytes = remove(input_bytes, session=session)
        print(f"   📏 Output size: {len(output_bytes)} bytes")
        
        # Convert back
        output_img = Image.open(BytesIO(output_bytes))
        print(f"   📊 Output: {output_img.mode}, size: {output_img.size}")
        
        # Analyze result
        if output_img.mode == 'RGBA':
            alpha = np.array(output_img)[:, :, 3]
            unique_alphas = len(np.unique(alpha))
            transparency_ratio = np.sum(alpha == 0) / alpha.size
            
            print(f"   📊 Unique alpha values: {unique_alphas}")
            print(f"   📊 Transparency ratio: {transparency_ratio:.3f}")
            
            if transparency_ratio > 0.1:
                print("   ✅ Background removal working!")
                return True
            else:
                print("   ⚠️ Little transparency detected")
                return False
        else:
            print("   ⚠️ No alpha channel in output")
            return False
        
    except Exception as e:
        print(f"   ❌ Processing test failed: {e}")
        import traceback
        print(f"   📋 Traceback: {traceback.format_exc()}")
        return False

def main():
    """Main debug function"""
    print("🔍 BIREFNET AVAILABILITY DEBUG")
    print("🧪 Checking what's really available")
    print("=" * 40)
    
    # Check model availability
    working_model = debug_birefnet()
    
    if working_model:
        # Test processing
        success = test_birefnet_processing(working_model)
        
        print("\n" + "=" * 40)
        if success:
            print("🎉 BIREFNET FUNCTIONALITY CONFIRMED!")
            print(f"   🎯 Working model: {working_model}")
            print("   ✅ Background removal working")
            print("\n💡 Update code to use this model name!")
        else:
            print("⚠️ BIREFNET MODEL FOUND BUT NOT WORKING")
            print("🔧 Processing issues detected")
    else:
        print("\n" + "=" * 40)
        print("❌ BIREFNET NOT AVAILABLE")
        print("🔧 Need to install BiRefNet model or use alternative")
    
    return working_model is not None

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 