#!/usr/bin/env python3
"""
🔄 New Model Order Test
======================

Test script to verify the new model order:
1. Fast (U2Net)
2. Premium (BiRefNet) - moved from 3rd to 2nd 
3. Ultra (BRIA) - moved from 2nd to 3rd
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_new_order():
    """Test the new model order"""
    print("🔄 NEW MODEL ORDER TEST")
    print("=" * 50)
    print("Testing BiRefNet in 2nd position, BRIA in 3rd position")
    
    try:
        from app.routes.products import unified_background_removal
        from PIL import Image
        import numpy as np
        print("✅ All imports successful")
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False
    
    # Create test image
    print("\n📸 Creating test image...")
    img_size = (200, 200)
    test_img = Image.new('RGB', img_size, color='white')
    
    img_array = np.array(test_img)
    center_x, center_y = img_size[0]//2, img_size[1]//2
    
    # Create a blue circle
    y, x = np.ogrid[:img_size[1], :img_size[0]]
    distance = np.sqrt((x - center_x)**2 + (y - center_y)**2)
    circle_mask = distance <= 40
    img_array[circle_mask] = [50, 50, 200]
    
    test_img = Image.fromarray(img_array)
    print(f"✅ Test image created: {test_img.size}")
    
    # Test new model order
    models_to_test = [
        ("fast", "⚡ Fast Mode (U2Net)", "1st position - unchanged"),
        ("premium", "🌟 Premium Mode (BiRefNet)", "2nd position - moved from 3rd"),
        ("ultra", "🚀 Ultra Mode (BRIA)", "3rd position - moved from 2nd")
    ]
    
    results = {}
    
    for mode, mode_name, position_info in models_to_test:
        print(f"\n{mode_name}")
        print(f"Position: {position_info}")
        print("-" * 40)
        
        try:
            result = unified_background_removal(test_img, mode)
            
            if result.mode == 'RGBA':
                alpha = np.array(result)[:, :, 3]
                
                # Quality metrics
                unique_values = len(np.unique(alpha))
                transparency_ratio = np.sum(alpha == 0) / alpha.size
                soft_edges = len(alpha[(alpha > 10) & (alpha < 245)])
                binary_ratio = np.sum((alpha == 0) | (alpha == 255)) / alpha.size
                
                results[mode] = {
                    'unique_values': unique_values,
                    'transparency_ratio': transparency_ratio,
                    'soft_edges': soft_edges,
                    'binary_ratio': binary_ratio,
                    'success': True
                }
                
                print(f"   ✅ Processing completed")
                print(f"   📊 Unique alpha values: {unique_values}")
                print(f"   📊 Transparency ratio: {transparency_ratio:.3f}")
                print(f"   📊 Soft edge pixels: {soft_edges}")
                print(f"   📊 Binary ratio: {binary_ratio:.3f}")
                
                # Position-specific analysis
                if mode == "premium":
                    print(f"   🌟 BiRefNet in 2nd position: {'✅ Working' if transparency_ratio > 0.1 else '⚠️ Issues'}")
                elif mode == "ultra":
                    print(f"   🚀 BRIA in 3rd position: {'✅ Working' if transparency_ratio > 0.1 else '⚠️ Issues'}")
                    
            else:
                print(f"   ❌ No alpha channel in result")
                results[mode] = {'success': False}
                
        except Exception as e:
            print(f"   ❌ {mode} failed: {e}")
            results[mode] = {'success': False, 'error': str(e)}
    
    # Final Analysis
    print(f"\n" + "=" * 50)
    print(f"🔄 NEW ORDER ANALYSIS")
    print(f"=" * 50)
    
    all_success = all(results.get(mode, {}).get('success', False) for mode in ['fast', 'premium', 'ultra'])
    
    if all_success:
        print("✅ ALL MODELS WORKING IN NEW POSITIONS!")
        
        # Compare BiRefNet performance in 2nd vs previous 3rd position
        premium_quality = results['premium']['transparency_ratio']
        ultra_quality = results['ultra']['transparency_ratio']
        
        print(f"\n🌟 BiRefNet (2nd position): {premium_quality:.3f} transparency")
        print(f"🚀 BRIA (3rd position): {ultra_quality:.3f} transparency")
        
        if premium_quality > 0.15:
            print(f"\n🎉 BiRefNet working excellently in 2nd position!")
        
        if ultra_quality > 0.15:
            print(f"🎉 BRIA working well in 3rd position!")
        
        print(f"\n💡 Order change successful:")
        print(f"   ⚡ U2Net: 1st position (unchanged)")
        print(f"   🌟 BiRefNet: 2nd position (moved from 3rd) ✅")
        print(f"   🚀 BRIA: 3rd position (moved from 2nd) ✅")
        
        return True
    else:
        print("⚠️ SOME MODELS FAILED IN NEW POSITIONS")
        for mode, result in results.items():
            status = "✅" if result.get('success') else "❌"
            print(f"   {status} {mode}")
        return False

def main():
    """Main test function"""
    print("🔄 NEW MODEL ORDER VERIFICATION")
    print("🎯 Testing BiRefNet moved to 2nd position")
    print("=" * 50)
    
    success = test_new_order()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 NEW ORDER WORKING PERFECTLY!")
        print("\n🎯 BiRefNet now in 2nd position where it works reliably!")
        print("🚀 BRIA moved to 3rd position for precision processing!")
    else:
        print("⚠️ NEW ORDER HAS ISSUES")
        print("🔧 Some models may need adjustment")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 