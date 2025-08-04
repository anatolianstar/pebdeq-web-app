import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import './ImageCropModal.css';

const ImageCropModal = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  onCropComplete,
  title = "Image Crop"
}) => {
  const canvasRef = useRef(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, size: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 500, height: 500 });

  useEffect(() => {
    if (isOpen && imageUrl) {
      loadImage();
    }
  }, [isOpen, imageUrl]);

  const loadImage = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      setOriginalImage(img);
      
      // Calculate canvas size to fit the image
      const maxSize = 500;
      const scale = Math.min(maxSize / img.width, maxSize / img.height);
      const newWidth = img.width * scale;
      const newHeight = img.height * scale;
      
      setCanvasSize({ width: newWidth, height: newHeight });
      
      // Set initial crop area to center
      const cropSize = Math.min(newWidth, newHeight) * 0.8;
      setCropArea({
        x: (newWidth - cropSize) / 2,
        y: (newHeight - cropSize) / 2,
        size: cropSize
      });
      
      setImageLoaded(true);
    };
    img.onerror = () => {
      toast.error('Image could not be loaded');
    };
    img.src = imageUrl.startsWith('http') ? imageUrl : `http://localhost:5005${imageUrl}`;
  };

  useEffect(() => {
    if (imageLoaded && originalImage) {
      drawCanvas();
    }
  }, [imageLoaded, originalImage, cropArea, canvasSize]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !originalImage) return;

    const ctx = canvas.getContext('2d');
    
    // Set high quality rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw image
    ctx.drawImage(originalImage, 0, 0, canvasSize.width, canvasSize.height);
    
    // Draw overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Clear crop area
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillRect(cropArea.x, cropArea.y, cropArea.size, cropArea.size);
    
    // Draw crop area border
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = '#00b894';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.size, cropArea.size);
    
    // Draw corner handles
    const handleSize = 8;
    ctx.fillStyle = '#00b894';
    
    // Top-left handle
    ctx.fillRect(cropArea.x - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
    
    // Top-right handle
    ctx.fillRect(cropArea.x + cropArea.size - handleSize/2, cropArea.y - handleSize/2, handleSize, handleSize);
    
    // Bottom-left handle
    ctx.fillRect(cropArea.x - handleSize/2, cropArea.y + cropArea.size - handleSize/2, handleSize, handleSize);
    
    // Bottom-right handle
    ctx.fillRect(cropArea.x + cropArea.size - handleSize/2, cropArea.y + cropArea.size - handleSize/2, handleSize, handleSize);
  };

  const handleMouseDown = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click is inside crop area
    if (x >= cropArea.x && x <= cropArea.x + cropArea.size &&
        y >= cropArea.y && y <= cropArea.y + cropArea.size) {
      setIsDragging(true);
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newX = Math.max(0, Math.min(x - dragStart.x, canvasSize.width - cropArea.size));
    const newY = Math.max(0, Math.min(y - dragStart.y, canvasSize.height - cropArea.size));

    setCropArea(prev => ({
      ...prev,
      x: newX,
      y: newY
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCropSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    const maxSize = Math.min(canvasSize.width, canvasSize.height);
    const clampedSize = Math.max(50, Math.min(newSize, maxSize));
    
    setCropArea(prev => ({
      ...prev,
      size: clampedSize,
      x: Math.max(0, Math.min(prev.x, canvasSize.width - clampedSize)),
      y: Math.max(0, Math.min(prev.y, canvasSize.height - clampedSize))
    }));
  };

  const handleCrop = () => {
    if (!originalImage) return;

    // Create a new canvas for the cropped image
    const cropCanvas = document.createElement('canvas');
    const cropCtx = cropCanvas.getContext('2d');
    
    // Set high quality rendering for crop canvas
    cropCtx.imageSmoothingEnabled = true;
    cropCtx.imageSmoothingQuality = 'high';
    
    // Set canvas size to square with higher resolution
    const outputSize = 800; // Increased from 300 to 800 for better quality
    cropCanvas.width = outputSize;
    cropCanvas.height = outputSize;
    
    // Calculate scaling factors
    const scaleX = originalImage.width / canvasSize.width;
    const scaleY = originalImage.height / canvasSize.height;
    
    // Calculate crop area in original image coordinates
    const originalCropX = cropArea.x * scaleX;
    const originalCropY = cropArea.y * scaleY;
    const originalCropSize = cropArea.size * scaleX;
    
    // Draw cropped image
    cropCtx.drawImage(
      originalImage,
      originalCropX, originalCropY, originalCropSize, originalCropSize,
      0, 0, outputSize, outputSize
    );
    
    // Convert to blob with higher quality
    cropCanvas.toBlob((blob) => {
      const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
      onCropComplete(file);
      toast.success('Image successfully cropped!');
    }, 'image/jpeg', 0.95); // Increased quality from 0.9 to 0.95
  };

  const handleClose = () => {
    setImageLoaded(false);
    setOriginalImage(null);
    setCropArea({ x: 0, y: 0, size: 200 });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="image-crop-modal-overlay">
      <div className="image-crop-modal">
        <div className="modal-header">
          <h3>🖼️ {title}</h3>
          <button className="close-button" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-content">
          {imageLoaded && (
            <div className="crop-controls">
              <label>
                <strong>Crop Size:</strong>
                <input
                  type="range"
                  min="50"
                  max={Math.min(canvasSize.width, canvasSize.height)}
                  value={cropArea.size}
                  onChange={handleCropSizeChange}
                  className="crop-size-slider"
                />
                <span>{Math.round(cropArea.size)}px</span>
              </label>
            </div>
          )}
          
          <div className="canvas-container">
            {imageLoaded ? (
              <canvas
                ref={canvasRef}
                width={canvasSize.width}
                height={canvasSize.height}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="crop-canvas"
              />
            ) : (
              <div className="loading-placeholder">
                <span>Loading image...</span>
              </div>
            )}
          </div>
          
          <div className="modal-actions">
            <button className="btn-cancel" onClick={handleClose}>
              Cancel
            </button>
            <button 
              className="btn-crop" 
              onClick={handleCrop}
              disabled={!imageLoaded}
            >
              Crop and Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal; 