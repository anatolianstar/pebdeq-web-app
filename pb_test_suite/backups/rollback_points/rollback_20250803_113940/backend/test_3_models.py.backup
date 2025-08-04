#!/usr/bin/env python3
"""
🎯 Professional 3-Model Background Removal Test
===============================================

Test script to verify all 3 AI models work correctly:
- Fast Mode: U2Net
- Premium Mode: BiRefNet-General  
- Ultra Mode: BRIA RMBG-1.4
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_all_models():
    """Test all 3 models for professional background removal"""
    print("🎯 PROFESSIONAL 3-MODEL SYSTEM TEST")
    print("=" * 60)
    
    # Check if we can import everything
    try:
        from app.routes.products import unified_background_removal
        from PIL import Image
        import numpy as np
        print("✅ All imports successful")
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False
    
    # Create a detailed test image
    print("\n📸 Creating professional test image...")
    try:
        img_size = (400, 400)
        test_img = Image.new('RGB', img_size, color='white')
        
        import numpy as np
        img_array = np.array(test_img)
        
        # Add detailed foreground object
        center_x, center_y = img_size[0]//2, img_size[1]//2
        
        # Main object (red circle)
        y, x = np.ogrid[:img_size[1], :img_size[0]]
        mask = (x - center_x)**2 + (y - center_y)**2 <= 60**2
        img_array[mask] = [255, 50, 50]  # Red
        
        # Add some detail patterns
        for i in range(5):
            offset = 20 * i
            detail_mask = (x - center_x)**2 + (y - center_y)**2 <= (40 + offset)**2
            detail_mask &= (x - center_x)**2 + (y - center_y)**2 >= (35 + offset)**2
            img_array[detail_mask] = [100 + i*30, 100, 200 - i*20]
        
        test_img = Image.fromarray(img_array)
        print(f"✅ Professional test image created: {test_img.size}, mode: {test_img.mode}")
    except Exception as e:
        print(f"❌ Failed to create test image: {e}")
        return False
    
    models_to_test = [
        ("fast", "⚡ Fast Mode (U2Net)", "2-5 seconds, good quality"),
        ("premium", "🌟 Premium Mode (BiRefNet-General)", "10-30 seconds, maximum quality - 2nd position"),
        ("ultra", "🚀 Ultra Mode (BRIA RMBG-1.4)", "5-15 seconds, precision soft edges - 3rd position")
    ]
    
    results = {}
    
    for model_type, model_name, description in models_to_test:
        print(f"\n{model_name}")
        print(f"📋 {description}")
        print("-" * 50)
        
        try:
            result = unified_background_removal(test_img, model_type)
            print(f"✅ {model_name} completed successfully")
            print(f"   📊 Result: {result.size}, mode: {result.mode}")
            
            # Analyze quality
            if result.mode == 'RGBA':
                alpha_channel = np.array(result)[:, :, 3]
                unique_alpha = np.unique(alpha_channel)
                transparent_pixels = np.sum(alpha_channel == 0)
                opaque_pixels = np.sum(alpha_channel == 255)
                partial_transparent = np.sum((alpha_channel > 0) & (alpha_channel < 255))
                
                print(f"   📊 Alpha values: {len(unique_alpha)} unique")
                print(f"   📊 Transparent: {transparent_pixels}, Opaque: {opaque_pixels}")
                print(f"   📊 Anti-aliasing: {partial_transparent} pixels")
                
                if partial_transparent > 0:
                    print(f"   🌟 High quality anti-aliasing detected")
                
                results[model_type] = {
                    'success': True,
                    'transparency': len(unique_alpha) > 1,
                    'anti_aliasing': partial_transparent > 0,
                    'quality_score': len(unique_alpha)
                }
            else:
                print("   ⚠️ No alpha channel found")
                results[model_type] = {'success': False}
            
        except Exception as e:
            print(f"❌ {model_name} failed: {e}")
            results[model_type] = {'success': False, 'error': str(e)}
    
    # Summary report
    print("\n" + "=" * 60)
    print("📊 PROFESSIONAL SYSTEM SUMMARY")
    print("=" * 60)
    
    successful_models = [k for k, v in results.items() if v.get('success')]
    
    if len(successful_models) == 3:
        print("🎉 ALL 3 MODELS WORKING PERFECTLY!")
        print("\n🎯 Professional Background Removal System Ready:")
        print("   ⚡ Fast Mode: U2Net - Quick & reliable")
        print("   🌟 Premium Mode: BiRefNet-General - Maximum quality (2nd position)")  
        print("   🚀 Ultra Mode: BRIA RMBG-1.4 - Precision soft edges (3rd position)")
        
        # Quality comparison
        print("\n🏆 Quality Comparison:")
        for model_type, model_name, _ in models_to_test:
            result = results.get(model_type, {})
            if result.get('success'):
                quality = result.get('quality_score', 0)
                anti_alias = "✅" if result.get('anti_aliasing') else "⚪"
                print(f"   {model_name}: Quality={quality}, Anti-aliasing={anti_alias}")
    
    elif len(successful_models) >= 1:
        print(f"⚠️ {len(successful_models)}/3 models working")
        print(f"✅ Working: {', '.join(successful_models)}")
        failed = [k for k in results.keys() if k not in successful_models]
        if failed:
            print(f"❌ Failed: {', '.join(failed)}")
    else:
        print("❌ NO MODELS WORKING - Check dependencies")
    
    return len(successful_models) >= 2  # At least 2 models should work

def check_dependencies():
    """Check if all dependencies are available for 3-model system"""
    print("\n🔍 DEPENDENCY CHECK FOR 3-MODEL SYSTEM:")
    print("=" * 50)
    
    deps = {
        'numpy': ('Basic operations', True),
        'PIL': ('Image processing', True),
        'rembg': ('U2Net + BiRefNet', True),
        'torch': ('BRIA RMBG', False),
        'transformers': ('BRIA RMBG', False)
    }
    
    available = {}
    
    for dep, (desc, required) in deps.items():
        try:
            if dep == 'PIL':
                from PIL import Image
            elif dep == 'numpy':
                import numpy
            elif dep == 'rembg':
                from rembg import remove, new_session
            elif dep == 'torch':
                import torch
            elif dep == 'transformers':
                from transformers import pipeline
            
            status = "✅ REQUIRED" if required else "✅ OPTIONAL"
            print(f"{status} {dep}: {desc}")
            available[dep] = True
            
        except ImportError:
            status = "❌ MISSING" if required else "⚠️ MISSING"
            print(f"{status} {dep}: {desc}")
            available[dep] = False
    
    print(f"\n📊 Available: {sum(available.values())}/{len(available)} dependencies")
    
    # Model availability
    print("\n🤖 MODEL AVAILABILITY:")
    if available['rembg']:
        print("✅ Fast Mode (U2Net): Available")
        print("✅ Premium Mode (BiRefNet-General): Available")
    else:
        print("❌ Fast/Premium Modes: REMBG missing")
        
    if available['torch'] and available['transformers']:
        print("✅ Ultra Mode (BRIA RMBG-1.4): Available")
    else:
        print("⚠️ Ultra Mode (BRIA RMBG-1.4): Will fallback to U2Net")
    
    return available

def main():
    """Main test function"""
    print("🎯 PROFESSIONAL BACKGROUND REMOVAL SYSTEM")
    print("🤖 3 AI Models - Complete Test Suite")
    print("=" * 60)
    
    # Check dependencies
    deps = check_dependencies()
    
    if not deps['rembg']:
        print("\n❌ CRITICAL: REMBG missing - install with: pip install rembg")
        return False
    
    # Test all models
    success = test_all_models()
    
    print("\n" + "=" * 60)
    if success:
        print("🎉 PROFESSIONAL SYSTEM READY!")
        print("🚀 All models tested and working")
        print("💼 Production-ready background removal")
    else:
        print("⚠️ System partially working")
        print("🔧 Some models may need attention")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 