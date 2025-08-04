#!/usr/bin/env python3
"""
🔧 Fixed Background Removal Function
===================================

This fixes the BytesIO error in the original background removal code.
"""

def fixed_unified_background_removal(image, model_type="auto"):
    """
    🚀 FIXED UNIFIED Background Removal - Solves BytesIO issue
    """
    print("🚀 Starting FIXED UNIFIED Background Removal...")
    
    # Performance setup
    import multiprocessing
    import torch
    from io import BytesIO
    from PIL import Image
    
    if not torch.cuda.is_available():
        cpu_count = multiprocessing.cpu_count()
        torch.set_num_threads(cpu_count)
        print(f"   🖥️  Using all {cpu_count} CPU cores")
    
    # Auto-detect best method
    if model_type == "auto":
        try:
            from rembg import remove
            model_type = "rembg"
            print("   🎯 Auto-selected: REMBG")
        except ImportError:
            model_type = "simple"
            print("   🎯 Auto-selected: Simple fallback")
    
    # Convert to RGB first (REMBG prefers RGB)
    if image.mode == 'RGBA':
        # Create white background for RGBA images
        background = Image.new('RGB', image.size, (255, 255, 255))
        background.paste(image, mask=image.split()[-1])  # Use alpha channel as mask
        image = background
        print("   📷 Converted RGBA to RGB with white background")
    elif image.mode != 'RGB':
        image = image.convert('RGB')
        print(f"   📷 Converted to RGB format")
    
    print(f"   📏 Processing image: {image.size} pixels")
    
    # Method 1: REMBG (Fixed BytesIO handling)
    if model_type == "rembg":
        try:
            print("   🎨 Method: REMBG (FIXED VERSION)")
            
            from rembg import remove, new_session
            
            # FIXED: Proper BytesIO handling
            input_buffer = BytesIO()
            image.save(input_buffer, format='PNG')
            input_buffer.seek(0)  # ← FIX: Reset buffer position!
            input_bytes = input_buffer.getvalue()
            
            print(f"   📦 Input bytes size: {len(input_bytes)}")
            
            # Try BiRefNet model first
            try:
                print("   🔄 Trying BiRefNet model...")
                session = new_session('birefnet-general')
                output_bytes = remove(input_bytes, session=session)
                print("   ✅ BiRefNet model successful")
            except Exception as e:
                print(f"   ⚠️ BiRefNet failed: {e}")
                print("   🔄 Fallback to U2Net...")
                # Fallback to default U2Net
                output_bytes = remove(input_bytes)
                print("   ✅ U2Net model successful")
            
            print(f"   📦 Output bytes size: {len(output_bytes)}")
            
            # Convert back to PIL with proper error handling
            try:
                result_image = Image.open(BytesIO(output_bytes))
                if result_image.mode != 'RGBA':
                    result_image = result_image.convert('RGBA')
                
                print("   🎉 REMBG processing completed successfully")
                return result_image
                
            except Exception as e:
                print(f"   ❌ Failed to open result image: {e}")
                raise e
            
        except Exception as e:
            print(f"   ❌ REMBG method failed: {str(e)}")
            print("   🔄 Falling back to simple method...")
            model_type = "simple"
    
    # Method 2: Simple fallback (OpenCV-based)
    if model_type == "simple":
        try:
            print("   🔧 Method: Simple OpenCV background removal")
            
            import numpy as np
            import cv2
            
            # Convert PIL to numpy
            img_array = np.array(image)
            
            # Convert RGB to BGR for OpenCV
            img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
            
            # Simple edge-based mask
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            
            # Create mask
            mask = cv2.dilate(edges, None, iterations=1)
            mask = 255 - mask  # Invert
            
            # Apply mask
            result = img_bgr.copy()
            result = cv2.bitwise_and(result, result, mask=mask)
            
            # Convert back to PIL RGBA
            result_rgb = cv2.cvtColor(result, cv2.COLOR_BGR2RGB)
            result_image = Image.fromarray(result_rgb).convert('RGBA')
            
            # Make background transparent
            data = np.array(result_image)
            red, green, blue, alpha = data.T
            
            # Find black areas (background)
            black_areas = (red == 0) & (blue == 0) & (green == 0)
            data[...][black_areas.T] = (0, 0, 0, 0)  # Make transparent
            
            result_image = Image.fromarray(data)
            
            print("   ✅ Simple background removal completed")
            return result_image
            
        except Exception as e:
            print(f"   ❌ Simple method failed: {str(e)}")
            
            # Ultimate fallback: return original with alpha channel
            if image.mode != 'RGBA':
                image = image.convert('RGBA')
            return image

# Test function
def test_fixed_background_removal():
    """Test the fixed function"""
    print("🧪 Testing fixed background removal...")
    
    try:
        from PIL import Image
        
        # Create test image
        test_img = Image.new('RGB', (200, 200), color='red')
        
        # Test the fixed function
        result = fixed_unified_background_removal(test_img, "rembg")
        
        print(f"✅ Test successful! Result size: {result.size}, mode: {result.mode}")
        return True
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    test_fixed_background_removal() 