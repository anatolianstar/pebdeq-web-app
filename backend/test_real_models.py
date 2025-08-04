#!/usr/bin/env python3
"""
🕵️ Real Model Detection Test
============================

Test to detect which models are actually working vs falling back to U2Net.
This will show us if BiRefNet and BRIA are really different or both using U2Net.
"""

import os
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def test_actual_model_usage():
    """Test what models are actually being used"""
    print("🕵️ REAL MODEL DETECTION TEST")
    print("=" * 50)
    print("Detecting if models are actually different or both using U2Net fallback")
    
    try:
        from app.routes.products import unified_background_removal
        from PIL import Image
        import numpy as np
        print("✅ All imports successful")
    except ImportError as e:
        print(f"❌ Import failed: {e}")
        return False
    
    # Create test image with specific pattern for analysis
    print("\n📸 Creating analysis test image...")
    img_size = (150, 150)
    test_img = Image.new('RGB', img_size, color='white')
    
    img_array = np.array(test_img)
    center_x, center_y = 75, 75
    
    # Create specific pattern to analyze model differences
    y, x = np.ogrid[:img_size[1], :img_size[0]]
    
    # Main shape (green square)
    square_mask = (np.abs(x - center_x) <= 30) & (np.abs(y - center_y) <= 30)
    img_array[square_mask] = [50, 200, 50]
    
    # Corner details for fine analysis
    corners = [(45, 45), (105, 45), (45, 105), (105, 105)]
    for cx, cy in corners:
        corner_mask = (x - cx)**2 + (y - cy)**2 <= 8**2
        img_array[corner_mask] = [200, 100, 50]
    
    test_img = Image.fromarray(img_array)
    print(f"✅ Analysis test image created: {test_img.size}")
    
    # Test each model and capture detailed results
    models_to_test = [
        ("fast", "⚡ U2Net (Reference)", "Should be baseline"),
        ("premium", "🌟 BiRefNet (Claimed)", "Should be different from U2Net"),
        ("ultra", "🚀 BRIA (Claimed)", "Should be different from U2Net and BiRefNet")
    ]
    
    results = {}
    detailed_analysis = {}
    
    for mode, mode_name, expectation in models_to_test:
        print(f"\n{mode_name}")
        print(f"Expectation: {expectation}")
        print("-" * 40)
        
        try:
            # Capture the result
            result = unified_background_removal(test_img, mode)
            
            if result.mode == 'RGBA':
                alpha = np.array(result)[:, :, 3]
                
                # Detailed analysis metrics
                unique_alphas = sorted(np.unique(alpha))
                transparency_ratio = np.sum(alpha == 0) / alpha.size
                opacity_ratio = np.sum(alpha == 255) / alpha.size
                gradient_pixels = len(alpha[(alpha > 10) & (alpha < 245)])
                
                # Create fingerprint of the alpha channel
                alpha_histogram = np.histogram(alpha, bins=10, range=(0, 255))[0]
                fingerprint = tuple(alpha_histogram)
                
                # Edge analysis
                edge_values = alpha[alpha != 0][:100] if len(alpha[alpha != 0]) > 0 else []
                edge_pattern = tuple(sorted(edge_values)[:10]) if len(edge_values) >= 10 else tuple(edge_values)
                
                results[mode] = {
                    'unique_alphas': len(unique_alphas),
                    'transparency_ratio': transparency_ratio,
                    'opacity_ratio': opacity_ratio,
                    'gradient_pixels': gradient_pixels,
                    'fingerprint': fingerprint,
                    'edge_pattern': edge_pattern,
                    'success': True
                }
                
                detailed_analysis[mode] = {
                    'alpha_range': f"{alpha.min()}-{alpha.max()}",
                    'alpha_values': unique_alphas[:10],  # First 10 unique values
                    'fingerprint': fingerprint
                }
                
                print(f"   ✅ Processing completed")
                print(f"   📊 Unique alpha values: {len(unique_alphas)}")
                print(f"   📊 Transparency ratio: {transparency_ratio:.3f}")
                print(f"   📊 Gradient pixels: {gradient_pixels}")
                print(f"   📊 Alpha range: {alpha.min()}-{alpha.max()}")
                print(f"   🔍 Fingerprint: {fingerprint[:5]}...")  # Show first 5 values
                
            else:
                print(f"   ❌ No alpha channel in result")
                results[mode] = {'success': False}
                
        except Exception as e:
            print(f"   ❌ {mode} failed: {e}")
            results[mode] = {'success': False, 'error': str(e)}
    
    # Cross-model comparison analysis
    print(f"\n" + "=" * 50)
    print(f"🔍 CROSS-MODEL COMPARISON ANALYSIS")
    print(f"=" * 50)
    
    successful_models = [mode for mode in ['fast', 'premium', 'ultra'] 
                        if results.get(mode, {}).get('success', False)]
    
    if len(successful_models) >= 2:
        print("\n🔍 Fingerprint Analysis:")
        
        # Compare fingerprints
        fingerprints = {mode: results[mode]['fingerprint'] for mode in successful_models}
        
        for mode in successful_models:
            print(f"   {mode}: {fingerprints[mode][:3]}...")
        
        # Check if any models are identical
        identical_pairs = []
        for i, mode1 in enumerate(successful_models):
            for mode2 in successful_models[i+1:]:
                fp1 = fingerprints[mode1]
                fp2 = fingerprints[mode2]
                
                # Calculate similarity
                similarity = sum(abs(a-b) for a, b in zip(fp1, fp2))
                if similarity < 50:  # Very similar fingerprints
                    identical_pairs.append((mode1, mode2, similarity))
        
        if identical_pairs:
            print(f"\n⚠️ IDENTICAL/SIMILAR MODELS DETECTED:")
            for mode1, mode2, similarity in identical_pairs:
                print(f"   🔄 {mode1} ≈ {mode2} (similarity: {similarity})")
                print(f"      → Likely both using same underlying model!")
        else:
            print(f"\n✅ All models appear to be genuinely different")
        
        # Specific analysis
        print(f"\n🎯 Model Reality Check:")
        
        if 'fast' in successful_models and 'premium' in successful_models:
            fast_fp = fingerprints['fast']
            premium_fp = fingerprints['premium']
            diff = sum(abs(a-b) for a, b in zip(fast_fp, premium_fp))
            
            if diff < 50:
                print(f"   🚨 PREMIUM (BiRefNet) = FAST (U2Net)! Difference: {diff}")
                print(f"   🔄 BiRefNet is falling back to U2Net!")
            else:
                print(f"   ✅ Premium (BiRefNet) is genuinely different from Fast")
        
        if 'fast' in successful_models and 'ultra' in successful_models:
            fast_fp = fingerprints['fast']
            ultra_fp = fingerprints['ultra']
            diff = sum(abs(a-b) for a, b in zip(fast_fp, ultra_fp))
            
            if diff < 50:
                print(f"   🚨 ULTRA (BRIA) = FAST (U2Net)! Difference: {diff}")
                print(f"   🔄 BRIA is falling back to U2Net!")
            else:
                print(f"   ✅ Ultra (BRIA) is genuinely different from Fast")
        
        if 'premium' in successful_models and 'ultra' in successful_models:
            premium_fp = fingerprints['premium']
            ultra_fp = fingerprints['ultra']
            diff = sum(abs(a-b) for a, b in zip(premium_fp, ultra_fp))
            
            if diff < 50:
                print(f"   🚨 PREMIUM (BiRefNet) = ULTRA (BRIA)! Difference: {diff}")
                print(f"   🔄 Both models producing identical results!")
            else:
                print(f"   ✅ Premium and Ultra are genuinely different")
        
        return len(identical_pairs) == 0
        
    else:
        print("❌ Insufficient successful models for comparison")
        return False

def main():
    """Main test function"""
    print("🕵️ REAL MODEL DETECTION")
    print("🔍 Finding out what's really happening")
    print("=" * 50)
    
    genuine_differences = test_actual_model_usage()
    
    print("\n" + "=" * 50)
    if genuine_differences:
        print("🎉 ALL MODELS ARE GENUINELY DIFFERENT!")
        print("✅ No fallback issues detected")
    else:
        print("🚨 FALLBACK ISSUES DETECTED!")
        print("⚠️ Some models are using the same underlying processing")
        print("\n💡 Solutions:")
        print("   1. Check if BiRefNet/BRIA models are properly installed")
        print("   2. Remove fallback mechanisms temporarily")
        print("   3. Use completely different model technologies")
    
    return genuine_differences

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 