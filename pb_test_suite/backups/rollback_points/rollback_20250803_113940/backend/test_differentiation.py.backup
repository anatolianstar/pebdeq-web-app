#!/usr/bin/env python3
"""
🎯 Model Differentiation Test
============================

Test script to verify that models now produce clearly different characteristics:
- BRIA RMBG-1.4: Precision soft edges
- BiRefNet-General: Aggressive sharp edges
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_model_differentiation():
    """Test that models produce different edge characteristics"""
    print("🎯 MODEL DIFFERENTIATION TEST")
    print("=" * 50)
    
    try:
        from app.routes.products import unified_background_removal
        from PIL import Image
        import numpy as np
        print("✅ All imports successful")
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False
    
    # Create test image with clear foreground/background distinction
    print("\n📸 Creating edge analysis test image...")
    img_size = (200, 200)
    test_img = Image.new('RGB', img_size, color='white')  # White background
    
    img_array = np.array(test_img)
    center_x, center_y = img_size[0]//2, img_size[1]//2
    
    # Create a red circle with soft gradients (to test edge handling)
    y, x = np.ogrid[:img_size[1], :img_size[0]]
    
    # Main circle
    distance = np.sqrt((x - center_x)**2 + (y - center_y)**2)
    circle_mask = distance <= 50
    img_array[circle_mask] = [200, 50, 50]
    
    # Add gradient edge for testing edge detection
    gradient_mask = (distance > 50) & (distance <= 55)
    gradient_factor = (55 - distance[gradient_mask]) / 5
    img_array[gradient_mask] = np.column_stack([
        200 * gradient_factor + 255 * (1 - gradient_factor),
        50 * gradient_factor + 255 * (1 - gradient_factor),
        50 * gradient_factor + 255 * (1 - gradient_factor)
    ]).astype(np.uint8)
    
    test_img = Image.fromarray(img_array)
    print(f"✅ Edge test image created: {test_img.size}")
    
    # Test Premium Mode (BRIA - Soft Edges)
    print(f"\n🚀 Testing Premium Mode (BRIA RMBG-1.4 - Precision Soft Edges)")
    print("-" * 50)
    
    try:
        result_premium = unified_background_removal(test_img, "premium")
        
        if result_premium.mode == 'RGBA':
            alpha_premium = np.array(result_premium)[:, :, 3]
            
            # Analyze edge characteristics
            edge_values = alpha_premium[(alpha_premium > 10) & (alpha_premium < 245)]
            soft_edge_pixels = len(edge_values)
            unique_alpha_premium = len(np.unique(alpha_premium))
            
            print(f"   📊 Premium (BRIA) Results:")
            print(f"   📊 Soft edge pixels: {soft_edge_pixels}")
            print(f"   📊 Unique alpha values: {unique_alpha_premium}")
            print(f"   📊 Alpha value range: {alpha_premium.min()} - {alpha_premium.max()}")
            
            if soft_edge_pixels > 100:
                print(f"   🌊 ✅ SOFT EDGES DETECTED - BRIA working correctly")
            else:
                print(f"   🔪 ⚠️ Sharp edges detected - May need adjustment")
                
        else:
            print(f"   ❌ No alpha channel in Premium result")
            return False
            
    except Exception as e:
        print(f"   ❌ Premium mode failed: {e}")
        return False
    
    # Test Ultra Mode (BiRefNet - Sharp Edges)
    print(f"\n🌟 Testing Ultra Mode (BiRefNet-General - Aggressive Sharp Edges)")
    print("-" * 50)
    
    try:
        result_ultra = unified_background_removal(test_img, "ultra")
        
        if result_ultra.mode == 'RGBA':
            alpha_ultra = np.array(result_ultra)[:, :, 3]
            
            # Analyze edge characteristics
            edge_values = alpha_ultra[(alpha_ultra > 10) & (alpha_ultra < 245)]
            ultra_edge_pixels = len(edge_values)
            unique_alpha_ultra = len(np.unique(alpha_ultra))
            
            print(f"   📊 Ultra (BiRefNet) Results:")
            print(f"   📊 Sharp edge pixels: {ultra_edge_pixels}")
            print(f"   📊 Unique alpha values: {unique_alpha_ultra}")
            print(f"   📊 Alpha value range: {alpha_ultra.min()} - {alpha_ultra.max()}")
            
            # BiRefNet should have fewer gradient pixels (sharper edges)
            binary_pixels = np.sum((alpha_ultra == 0) | (alpha_ultra == 255))
            total_pixels = alpha_ultra.size
            binary_ratio = binary_pixels / total_pixels
            
            print(f"   📊 Binary pixel ratio: {binary_ratio:.3f}")
            
            if binary_ratio > 0.8:
                print(f"   🔪 ✅ SHARP EDGES DETECTED - BiRefNet working correctly")
            else:
                print(f"   🌊 ⚠️ Soft edges detected - May need adjustment")
                
        else:
            print(f"   ❌ No alpha channel in Ultra result")
            return False
            
    except Exception as e:
        print(f"   ❌ Ultra mode failed: {e}")
        return False
    
    # Comparison Analysis
    print(f"\n" + "=" * 50)
    print(f"📊 DIFFERENTIATION ANALYSIS")
    print(f"=" * 50)
    
    try:
        premium_soft_edges = len(alpha_premium[(alpha_premium > 10) & (alpha_premium < 245)])
        ultra_soft_edges = len(alpha_ultra[(alpha_ultra > 10) & (alpha_ultra < 245)])
        
        print(f"🚀 Premium (BRIA): {premium_soft_edges} soft edge pixels")
        print(f"🌟 Ultra (BiRefNet): {ultra_soft_edges} soft edge pixels")
        
        if premium_soft_edges > ultra_soft_edges * 1.5:
            print(f"\n✅ SUCCESS: Models are properly differentiated!")
            print(f"   🚀 BRIA produces SOFTER edges (precision mode)")
            print(f"   🌟 BiRefNet produces SHARPER edges (aggressive mode)")
            return True
        else:
            print(f"\n⚠️ LIMITED DIFFERENTIATION: Edge differences not significant")
            print(f"   Both models producing similar edge characteristics")
            return False
            
    except Exception as e:
        print(f"❌ Comparison analysis failed: {e}")
        return False

def main():
    """Main test function"""
    print("🎯 MODEL DIFFERENTIATION VERIFICATION")
    print("🔬 Testing BRIA vs BiRefNet Edge Processing")
    print("=" * 50)
    
    success = test_model_differentiation()
    
    print("\n" + "=" * 50)
    if success:
        print("🎉 DIFFERENTIATION SUCCESSFUL!")
        print("\n🎯 Model Characteristics Confirmed:")
        print("   🚀 Premium (BRIA): Precision soft edges for photography")
        print("   🌟 Ultra (BiRefNet): Aggressive sharp edges for graphics")
        print("\n💡 Use Premium for portraits, Ultra for product photos!")
    else:
        print("⚠️ DIFFERENTIATION NEEDS WORK")
        print("🔧 Models may need further optimization")
    
    return success

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 