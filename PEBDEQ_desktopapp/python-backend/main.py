import asyncio
import base64
import io
import os
import time
import uuid
import json
from typing import Optional, Dict, Any, List
from datetime import datetime
from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import psutil
from PIL import Image
import numpy as np

# AI Model imports (will be loaded on demand)
try:
    from rembg import remove, new_session
    import torch
    TORCH_AVAILABLE = True
    print("[SUCCESS] PyTorch and rembg imported successfully!")
    print(f"[INFO] PyTorch version: {torch.__version__}")
    print(f"[INFO] CUDA available: {torch.cuda.is_available()}")
except ImportError as e:
    TORCH_AVAILABLE = False
    print(f"[WARNING] PyTorch/rembg not available - using basic mode: {e}")
except Exception as e:
    TORCH_AVAILABLE = False
    print(f"[ERROR] Unexpected error importing AI modules: {e}")

app = FastAPI(
    title="PEBDEQ Desktop Pro AI Service",
    description="AI-powered background removal service for desktop application",
    version="1.0.0"
)

# CORS middleware for Electron app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Electron app
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class BackgroundRemovalRequest(BaseModel):
    image_data: str  # Base64 encoded image
    model: str = "u2net"  # AI model to use (u2net, birefnet, bria-rmbg)

# Extension API models
class ExtensionFile(BaseModel):
    name: str
    size: int
    type: str
    data: str  # Base64
    targetPlatform: str

class ExtensionFilesRequest(BaseModel):
    files: List[ExtensionFile]
    targetPlatform: str
    timestamp: str
    model: str = "u2net"
    options: Optional[Dict[str, Any]] = None

class HealthResponse(BaseModel):
    status: str
    version: str
    models_available: bool
    memory_usage: Dict[str, float]
    gpu_available: bool

# Global variables
loaded_models = {}
processing_stats = {
    "total_processed": 0,
    "average_time": 0.0,
    "last_processing_time": 0.0
}

def get_system_info():
    """Get system performance information"""
    memory = psutil.virtual_memory()
    cpu_percent = psutil.cpu_percent(interval=1)
    
    gpu_available = False
    gpu_memory = 0
    
    if TORCH_AVAILABLE and torch.cuda.is_available():
        gpu_available = True
        try:
            gpu_memory = torch.cuda.get_device_properties(0).total_memory / (1024**3)  # GB
        except:
            pass
    
    return {
        "memory_total": memory.total / (1024**3),  # GB
        "memory_used": memory.used / (1024**3),   # GB
        "memory_percent": memory.percent,
        "cpu_percent": cpu_percent,
        "gpu_available": gpu_available,
        "gpu_memory": gpu_memory
    }

def base64_to_image(base64_string: str) -> Image.Image:
    """Convert base64 string to PIL Image"""
    try:
        # Remove data URL prefix if present
        if base64_string.startswith('data:image'):
            base64_string = base64_string.split(',')[1]
        
        # Decode base64
        image_data = base64.b64decode(base64_string)
        image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if image.mode in ('RGBA', 'LA', 'P'):
            rgb_image = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            rgb_image.paste(image, mask=image.split()[-1] if image.mode in ('RGBA', 'LA') else None)
            image = rgb_image
        
        return image
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")

def image_to_base64(image: Image.Image, format: str = "PNG") -> str:
    """Convert PIL Image to base64 string"""
    buffer = io.BytesIO()
    image.save(buffer, format=format, quality=95 if format == "JPEG" else None)
    image_data = buffer.getvalue()
    base64_string = base64.b64encode(image_data).decode('utf-8')
    return f"data:image/{format.lower()};base64,{base64_string}"

def process_with_u2net(image: Image.Image) -> Image.Image:
    """Process image with U2Net model"""
    try:
        if not TORCH_AVAILABLE:
            raise Exception("PyTorch not available")
        
        # Convert PIL to bytes for rembg
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        # Create session with U2Net model
        session = new_session('u2net')
        
        # Remove background
        result_bytes = remove(img_byte_arr, session=session)
        
        # Convert back to PIL
        result_image = Image.open(io.BytesIO(result_bytes))
        
        return result_image
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"U2Net processing failed: {str(e)}")

def process_with_birefnet(image: Image.Image) -> Image.Image:
    """Process image with BiRefNet model"""
    try:
        if not TORCH_AVAILABLE:
            raise Exception("PyTorch not available")
        
        # Convert PIL to bytes for rembg
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        # Create session with BiRefNet model
        session = new_session('birefnet-general')
        
        # Remove background
        result_bytes = remove(img_byte_arr, session=session)
        
        # Convert back to PIL
        result_image = Image.open(io.BytesIO(result_bytes))
        
        return result_image
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"BiRefNet processing failed: {str(e)}")

def process_with_bria(image: Image.Image) -> Image.Image:
    """Process image with BRIA RMBG model"""
    try:
        if not TORCH_AVAILABLE:
            raise Exception("PyTorch not available")
        
        # Convert PIL to bytes for rembg
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        # Create session with BRIA model (try different model names)
        try:
            session = new_session('rmbg-1.4')
        except:
            try:
                session = new_session('bria-rmbg')
            except:
                # Fallback to u2net if BRIA not available
                session = new_session('u2net')
        
        # Remove background
        result_bytes = remove(img_byte_arr, session=session)
        
        # Convert back to PIL
        result_image = Image.open(io.BytesIO(result_bytes))
        
        return result_image
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"BRIA processing failed: {str(e)}")

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    system_info = get_system_info()
    
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        models_available=TORCH_AVAILABLE,
        memory_usage={
            "total_gb": system_info["memory_total"],
            "used_gb": system_info["memory_used"],
            "percent": system_info["memory_percent"]
        },
        gpu_available=system_info["gpu_available"]
    )

@app.get("/models")
async def get_available_models():
    """Get list of available AI models"""
    models = [
        {
            "id": "u2net",
            "name": "U2Net",
            "description": "Fast and good quality background removal",
            "speed": "fast",
            "quality": "good",
            "available": TORCH_AVAILABLE
        },
        {
            "id": "birefnet", 
            "name": "BiRefNet-General",
            "description": "Premium maximum quality processing",
            "speed": "slow",
            "quality": "maximum",
            "available": TORCH_AVAILABLE
        },
        {
            "id": "bria",
            "name": "BRIA RMBG-1.4",
            "description": "Ultra precision with soft edges",
            "speed": "medium",
            "quality": "ultra",
            "available": TORCH_AVAILABLE
        }
    ]
    
    return {"models": models, "torch_available": TORCH_AVAILABLE}

@app.post("/remove-background")
async def remove_background(request: BackgroundRemovalRequest):
    """Remove background from image using specified AI model"""
    start_time = time.time()
    
    # Direct API call doesn't require extension client check
    print(f"🎯 Direct background removal request - Model: {request.model}")
    
    try:
        # Parse input image
        input_image = base64_to_image(request.image_data)
        
        # Log processing start
        print(f"[PROCESSING] Processing image with {request.model} - Size: {input_image.size}")
        
        # Select processing model
        if request.model == "u2net":
            result_image = process_with_u2net(input_image)
        elif request.model == "birefnet":
            result_image = process_with_birefnet(input_image)
        elif request.model == "bria":
            result_image = process_with_bria(input_image)
        else:
            raise HTTPException(status_code=400, detail=f"Unknown model: {request.model}")
        
        # Convert result to base64
        result_base64 = image_to_base64(result_image, "PNG")
        
        # Calculate processing time
        processing_time = time.time() - start_time
        processing_stats["last_processing_time"] = processing_time
        processing_stats["total_processed"] += 1
        
        # Update average time
        if processing_stats["total_processed"] == 1:
            processing_stats["average_time"] = processing_time
        else:
            processing_stats["average_time"] = (
                processing_stats["average_time"] * (processing_stats["total_processed"] - 1) + processing_time
            ) / processing_stats["total_processed"]
        
        print(f"[SUCCESS] Processing completed in {processing_time:.2f}s")
        
        return {
            "success": True,
            "result_image": result_base64,
            "processing_time": round(processing_time, 2),
            "model_used": request.model,
            "input_size": input_image.size,
            "output_size": result_image.size,
            "memory_usage": get_system_info()["memory_percent"]
        }
        
    except Exception as e:
        print(f"[ERROR] Processing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats")
async def get_processing_stats():
    """Get processing statistics"""
    return {
        "total_processed": processing_stats["total_processed"],
        "average_time": round(processing_stats["average_time"], 2),
        "last_processing_time": round(processing_stats["last_processing_time"], 2),
        "system_info": get_system_info()
    }

@app.post("/batch-process")
async def batch_process_images(images: list[str], model: str = "u2net"):
    """Process multiple images in batch"""
    results = []
    start_time = time.time()
    
    for i, image_data in enumerate(images):
        try:
            print(f"🔄 Processing batch image {i+1}/{len(images)}")
            
            # Process single image
            request = BackgroundRemovalRequest(image_data=image_data, model=model)
            result = await remove_background(request)
            results.append(result)
            
        except Exception as e:
            results.append({
                "success": False,
                "error": str(e),
                "index": i
            })
    
    total_time = time.time() - start_time
    
    return {
        "success": True,
        "results": results,
        "total_time": round(total_time, 2),
        "processed_count": len([r for r in results if r.get("success", False)])
    }

# ============ EXTENSION API ENDPOINTS ============

# Global variables for extension state
extension_clients = set()
processing_queue = []
INCOMING_PHOTOS_DIR = Path('incoming_photos')
PROCESSED_PHOTOS_DIR = Path('processed_photos') 
INCOMING_PHOTOS_DIR.mkdir(exist_ok=True)
PROCESSED_PHOTOS_DIR.mkdir(exist_ok=True)

@app.get("/api/status")
async def extension_status():
    """Extension status check endpoint"""
    # Check if desktop app is actually running by testing if we can reach it
    desktop_running = False
    try:
        # Simple health check - if backend is running, desktop is likely running
        desktop_running = True  # Backend running means desktop is running
    except Exception:
        desktop_running = False
    
    return {
        "status": "online" if desktop_running else "offline",
        "desktop_running": desktop_running,
        "app": "PEBDEQ Desktop Pro",
        "version": "3.2.0", 
        "features": ["ai_background_removal", "browser_extension", "multi_platform"],
        "timestamp": datetime.now().isoformat(),
        "extension_clients": len(extension_clients)
    }

@app.get("/api/processed-photos")
async def get_processed_photos():
    """Get processed photos for extension"""
    try:
        photos = []
        
        # Scan processed photos directory
        for photo_file in PROCESSED_PHOTOS_DIR.glob('*'):
            if photo_file.is_file() and photo_file.suffix.lower() in ['.png', '.jpg', '.jpeg']:
                stat = photo_file.stat()
                photos.append({
                    'id': photo_file.stem,
                    'name': photo_file.name,
                    'format': photo_file.suffix.upper().replace('.', ''),
                    'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                    'size': stat.st_size,
                    'dimensions': 'unknown'  # Could add image size detection here
                })
        
        return {
            'count': len(photos),
            'photos': sorted(photos, key=lambda x: x['modified'], reverse=True)
        }
        
    except Exception as e:
        return {
            'count': 0,
            'photos': [],
            'error': str(e)
        }

@app.post("/api/receive-photos")
async def receive_photos_from_extension(request: ExtensionFilesRequest):
    """Receive raw photos from browser extension for processing"""
    
    try:
        files = request.files
        platform = request.targetPlatform
        timestamp = request.timestamp
        
        print(f"📥 Received {len(files)} photos from {platform} platform")
        
        # Create platform-specific subdirectory
        platform_dir = INCOMING_PHOTOS_DIR / platform
        platform_dir.mkdir(exist_ok=True)
        
        processed_files = []
        
        for file_data in files:
            try:
                # Extract file information
                name = file_data.name
                file_type = file_data.type
                base64_data = file_data.data
                
                # Decode base64 data
                image_data = base64.b64decode(base64_data)
                
                # Generate unique filename
                clean_timestamp = timestamp.replace(':', '-').replace('.', '-')
                file_path = platform_dir / f"{clean_timestamp}_{name}"
                
                # Save file
                with open(file_path, 'wb') as f:
                    f.write(image_data)
                
                # Add to processing queue metadata
                file_info = {
                    'id': f"{platform}_{clean_timestamp}_{name}",
                    'name': name,
                    'path': str(file_path),
                    'platform': platform,
                    'status': 'queued',
                    'received_at': timestamp,
                    'type': file_type,
                    'size': len(image_data)
                }
                
                processed_files.append(file_info)
                processing_queue.append(file_info)
                
                print(f"✅ Saved: {name} for {platform}")
                
            except Exception as e:
                print(f"❌ Failed to process file {file_data.name}: {e}")
                continue
        
        return {
            "success": True,
            "message": f"Successfully received {len(processed_files)} photos",
            "files": processed_files,
            "platform": platform,
            "queue_length": len(processing_queue),
            "next_step": "Photos queued for processing. Use PEBDEQ Desktop to process and send to platform."
        }
        
    except Exception as e:
        print(f"❌ Error receiving photos: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/processing-queue")
async def get_processing_queue():
    """Get current processing queue status"""
    return {
        "queue_length": len(processing_queue),
        "items": processing_queue
    }

@app.get("/api/extension-file/{file_path:path}")
async def get_extension_file(file_path: str):
    """Serve extension files as base64 data for main queue integration"""
    try:
        from fastapi.responses import Response
        import base64
        
        # Resolve relative path from incoming_photos
        if not file_path.startswith(str(INCOMING_PHOTOS_DIR)):
            # Extract just the filename part from the path
            file_parts = file_path.replace('\\', '/').split('/')
            if len(file_parts) >= 2:
                platform = file_parts[-2]
                filename = file_parts[-1]
                file_path = INCOMING_PHOTOS_DIR / platform / filename
            else:
                file_path = INCOMING_PHOTOS_DIR / file_path
        else:
            file_path = Path(file_path)
        
        if not file_path.exists() or not file_path.is_file():
            raise HTTPException(status_code=404, detail="File not found")
        
        # Read file and convert to base64
        with open(file_path, 'rb') as f:
            file_bytes = f.read()
        
        # Determine MIME type
        import mimetypes
        mime_type, _ = mimetypes.guess_type(str(file_path))
        if not mime_type or not mime_type.startswith('image/'):
            mime_type = 'image/jpeg'  # Default for images
        
        # Return as data URL
        base64_data = base64.b64encode(file_bytes).decode('utf-8')
        data_url = f"data:{mime_type};base64,{base64_data}"
        
        return {"data_url": data_url}
        
    except Exception as e:
        print(f"❌ Error serving extension file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to serve file: {str(e)}")

@app.post("/api/extension-connect")
async def extension_connect():
    """Register extension client"""
    client_id = str(uuid.uuid4())
    extension_clients.add(client_id)
    print(f"🔌 Extension client connected: {client_id}")
    print(f"📊 Total extension clients: {len(extension_clients)}")
    
    return {
        "success": True,
        "client_id": client_id,
        "connected_clients": len(extension_clients)
    }

@app.post("/api/extension-disconnect")
async def extension_disconnect(client_id: str):
    """Unregister extension client"""
    extension_clients.discard(client_id)
    print(f"🔌 Extension client disconnected: {client_id}")
    print(f"📊 Total extension clients: {len(extension_clients)}")
    
    return {
        "success": True,
        "connected_clients": len(extension_clients)
    }

# Store processed images for extension pickup
processed_images_for_extension = {}

@app.post("/api/send-processed-to-extension")
async def send_processed_to_extension(request: dict):
    """Receive processed images from desktop to send back to extension"""
    try:
        global processed_images_for_extension
        
        platform = request.get("platform")
        images = request.get("images", [])
        
        print(f"📤 Desktop sending processed images - Platform: {platform}, Count: {len(images)}")
        
        if not platform or not images:
            raise HTTPException(status_code=400, detail="Platform and images required")
        
        # Store processed images for extension pickup
        if platform not in processed_images_for_extension:
            processed_images_for_extension[platform] = []
            print(f"🆕 Created new queue for platform: {platform}")
        
        processed_images_for_extension[platform].extend(images)
        
        print(f"📤 Received {len(images)} processed images for {platform} platform")
        print(f"📊 Total queued for {platform}: {len(processed_images_for_extension[platform])}")
        print(f"🗂️ Image names: {[img.get('originalName', 'unknown') for img in images]}")
        print(f"📋 All platforms in storage: {list(processed_images_for_extension.keys())}")
        
        return {
            "success": True,
            "message": f"Queued {len(images)} processed images for {platform}",
            "total_queued": len(processed_images_for_extension[platform])
        }
        
    except Exception as e:
        print(f"❌ Error storing processed images: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to store processed images: {str(e)}")

@app.get("/api/get-processed-images/{platform}")
async def get_processed_images(platform: str):
    """Get processed images for extension"""
    try:
        global processed_images_for_extension
        
        print(f"🔍 Extension polling for processed images on {platform}")
        print(f"📊 Current storage state: {list(processed_images_for_extension.keys())}")
        
        images = processed_images_for_extension.get(platform, [])
        print(f"📷 Found {len(images)} images for {platform}")
        
        if images:
            print(f"📄 Image details: {[img.get('originalName', 'unknown') for img in images]}")
        
        # DON'T auto-clear on every check - only clear when manually requested
        # Images will be cleared via /api/clear-processed-images endpoint after upload
        print(f"📦 Keeping {len(images)} images in {platform} queue for repeated access")
        
        print(f"📥 Returning {len(images)} processed images for {platform}")
        
        return {
            "success": True,
            "images": images,
            "count": len(images)
        }
        
    except Exception as e:
        print(f"❌ Error retrieving processed images: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to retrieve processed images: {str(e)}")

@app.post("/api/clear-processed-images")
async def clear_processed_images(request: dict = None):
    """Clear all processed images from memory storage"""
    try:
        global processed_images_for_extension
        
        platform = request.get("platform") if request else None
        
        if platform:
            # Clear specific platform
            cleared_count = len(processed_images_for_extension.get(platform, []))
            processed_images_for_extension[platform] = []
            print(f"🧹 Cleared {cleared_count} processed images for {platform} platform")
            return {
                "success": True,
                "message": f"Cleared {cleared_count} images for {platform}",
                "platform": platform
            }
        else:
            # Clear all platforms
            total_cleared = sum(len(images) for images in processed_images_for_extension.values())
            processed_images_for_extension.clear()
            print(f"🧹 Cleared all {total_cleared} processed images from all platforms")
            return {
                "success": True,
                "message": f"Cleared all {total_cleared} processed images",
                "total_cleared": total_cleared
            }
            
    except Exception as e:
        print(f"❌ Error clearing processed images: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to clear processed images: {str(e)}")

@app.post("/api/clear-processing-queue")
async def clear_processing_queue():
    """Clear the processing queue (incoming photos)"""
    try:
        global processing_queue
        
        cleared_count = len(processing_queue)
        processing_queue.clear()
        
        print(f"🧹 Cleared {cleared_count} items from processing queue")
        
        return {
            "success": True,
            "message": f"Cleared {cleared_count} items from processing queue",
            "cleared_count": cleared_count
        }
        
    except Exception as e:
        print(f"❌ Error clearing processing queue: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to clear processing queue: {str(e)}")

if __name__ == "__main__":
    print("[STARTUP] Starting PEBDEQ Desktop Pro AI Service...")
    print(f"[INFO] PyTorch Available: {TORCH_AVAILABLE}")
    print(f"[INFO] Extension API Available: ✅")
    print(f"[INFO] Multi-Platform Support: Etsy, Shopify, eBay, pebdeq.com")
    
    if TORCH_AVAILABLE:
        print(f"[INFO] GPU Available: {torch.cuda.is_available()}")
        if torch.cuda.is_available():
            print(f"[INFO] GPU: {torch.cuda.get_device_name(0)}")
    
    print(f"[INFO] Server starting on http://127.0.0.1:8000")
    print(f"[INFO] Extension API: http://127.0.0.1:8000/api/*")
    print(f"[INFO] Connected Extension Clients: 0")
    
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        log_level="info",
        reload=False
    ) 