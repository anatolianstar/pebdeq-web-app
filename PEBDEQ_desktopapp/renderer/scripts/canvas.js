// Canvas Manager for image display and editing
const CanvasManager = {
  canvas: null,
  ctx: null,
  currentImage: null,
  processedImage: null,
  viewMode: 'original', // 'original', 'processed', 'comparison'
  zoom: 100,
  panX: 0,
  panY: 0,
  rotation: 0, // Rotation angle in degrees
  isDragging: false,
  lastMouseX: 0,
  lastMouseY: 0,
  
  // ===== ZOOM LIMITS STANDARDIZATION =====
  
  // Consistent zoom limits for all modes
  ZOOM_MIN: 5, // As requested by user
  ZOOM_MAX: 500,
  ZOOM_STEP: 1.2,
  
  // Composition scale limits
  COMPOSITION_SCALE_MIN: 0.1,
  COMPOSITION_SCALE_MAX: 3.0, // Reduced from 5.0 to prevent oversized images
  
  // Background Composition Mode
  compositionMode: false,
  backgroundImage: null,
  backgroundTemplate: null,
  
  // Foreground (processed image) positioning in composition mode
  foregroundX: 0,
  foregroundY: 0,
  foregroundScale: 1.0, // independent scaling for foreground over background
  
  // Crop system properties
  cropMode: false,
  cropFrame: { x: 0, y: 0, width: 200, height: 200 },
  aspectRatio: 'free', // 'free', '1:1', '16:9', '4:3', '3:4', '9:16'
  isDraggingCrop: false,
  cropResizeHandle: null, // 'nw', 'ne', 'sw', 'se', 'n', 's', 'e', 'w', 'move'
  
  // Aspect ratio presets
  aspectRatios: {
    'free': { label: 'Free', ratio: null },
    '1:1': { label: 'Square (1:1)', ratio: 1 },
    '4:3': { label: 'Standard (4:3)', ratio: 4/3 },
    '16:9': { label: 'Landscape (16:9)', ratio: 16/9 },
    '3:4': { label: 'Portrait (3:4)', ratio: 3/4 },
    '9:16': { label: 'Vertical (9:16)', ratio: 9/16 }
  },

  // Helper function to calculate proper image scaling while maintaining aspect ratio
  calculateAspectRatioFit(imageWidth, imageHeight, canvasWidth, canvasHeight, mode = 'cover') {
    const imageAspect = imageWidth / imageHeight;
    const canvasAspect = canvasWidth / canvasHeight;
    
    let drawWidth, drawHeight, offsetX, offsetY;
    
    if (mode === 'cover') {
      // Scale to cover entire canvas (may crop image)
      if (imageAspect > canvasAspect) {
        // Image is wider - fit to height
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imageAspect;
        offsetX = (canvasWidth - drawWidth) / 2;
        offsetY = 0;
      } else {
        // Image is taller - fit to width
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imageAspect;
        offsetX = 0;
        offsetY = (canvasHeight - drawHeight) / 2;
      }
    } else if (mode === 'contain') {
      // Scale to fit within canvas (may leave empty space)
      if (imageAspect > canvasAspect) {
        // Image is wider - fit to width
        drawWidth = canvasWidth;
        drawHeight = canvasWidth / imageAspect;
        offsetX = 0;
        offsetY = (canvasHeight - drawHeight) / 2;
      } else {
        // Image is taller - fit to height
        drawHeight = canvasHeight;
        drawWidth = canvasHeight * imageAspect;
        offsetX = (canvasWidth - drawWidth) / 2;
        offsetY = 0;
      }
    }
    
    return { drawWidth, drawHeight, offsetX, offsetY };
  },

  init() {
    this.canvas = document.getElementById('main-canvas');
    this.ctx = this.canvas.getContext('2d');
    
    // Default canvas background
    this.canvasBackground = 'theme';
    console.log('🎨 Canvas background initialized to:', this.canvasBackground);
    
    // Grid settings
    this.showGrid = false;
    this.gridSize = 30; // Küçük grid daha iyi görünür
    this.gridColor = '#999999';
    
    console.log('🎨 Canvas Manager initializing...');
    
    // Add event listeners first
    this.addEventListeners();
    
    // Set initial canvas size with multiple attempts
    this.resizeCanvas();
    
    // Force multiple resize attempts to ensure proper sizing
    setTimeout(() => {
      this.resizeCanvas();
      console.log('🎨 Canvas size recalculated (100ms):', this.canvas.width, 'x', this.canvas.height);
    }, 100);
    
    setTimeout(() => {
      this.resizeCanvas();
      console.log('🎨 Canvas size recalculated (300ms):', this.canvas.width, 'x', this.canvas.height);
    }, 300);
    
    setTimeout(() => {
      this.resizeCanvas();
      console.log('🎨 Canvas size final check (1000ms):', this.canvas.width, 'x', this.canvas.height);
    }, 1000);
    
    console.log('🎨 Canvas Manager initialized');
  },

  addEventListeners() {
    // Window resize
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Mouse events for pan/zoom
    this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
    this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
    
    // Touch events for mobile/tablet
    this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
    this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
    this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
  },

  resizeCanvas() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    
    // Ensure minimum canvas size
    const width = Math.max(rect.width, 400);
    const height = Math.max(rect.height, 300);
    
    // Only resize if dimensions actually changed
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      
      console.log('📐 Canvas resized to:', width, 'x', height);
      console.log('📐 Container rect:', rect.width, 'x', rect.height);
      
      // If there's an image, fit it to the new canvas size
      if (this.currentImage) {
        this.fitToCanvas();
        this.draw();
        console.log('🔄 Canvas resized and image refitted');
      } else {
        // Even without image, redraw to show grid/background
        this.draw();
      }
    }
  },

  loadImage(imageData) {
    const img = new Image();
    img.onload = () => {
      this.currentImage = img;
      this.imageData = imageData;
      
      console.log('🖼️ Image loading started:', imageData.name);
      console.log('📐 Image dimensions:', img.width, 'x', img.height);
      console.log('📐 Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
      
      // Force canvas resize to ensure proper sizing
      this.resizeCanvas();
      
      // Multiple attempts to ensure proper display
      setTimeout(() => {
        this.resetView();
        this.fitToCanvas();
        this.draw();
        console.log('🎯 Image loaded and fitted (attempt 1)');
      }, 50);
      
      setTimeout(() => {
        this.fitToCanvas();
        this.draw();
        console.log('🎯 Image fitted (attempt 2)');
      }, 200);
      
      setTimeout(() => {
        this.fitToCanvas();
        this.draw();
        console.log('🎯 Image fitted (final attempt)');
      }, 500);
    };
    
    img.onerror = () => {
      console.error('❌ Failed to load image:', imageData.name);
    };
    
    img.src = imageData.base64;
  },

  showProcessedImage(imageData) {
    if (imageData.processedImage) {
      const img = new Image();
      img.onload = () => {
        this.processedImage = img;
        this.draw();
        console.log('✅ Processed image loaded');
      };
      img.src = imageData.processedImage;
    }
  },

  setViewMode(mode) {
    this.viewMode = mode;
    this.draw();
  },

  resetView() {
    this.zoom = 100;
    this.panX = 0;
    this.panY = 0;
    this.rotation = 0;
    this.fitToCanvas();
  },

  fitToCanvas() {
    if (!this.currentImage) {
      console.log('⚠️ fitToCanvas: No current image');
      return;
    }
    
    console.log('🎯 fitToCanvas: Starting fit calculation');
    console.log('📐 Canvas size:', this.canvas.width, 'x', this.canvas.height);
    console.log('📐 Image size:', this.currentImage.width, 'x', this.currentImage.height);
    
    const canvasAspect = this.canvas.width / this.canvas.height;
    const imageAspect = this.currentImage.width / this.currentImage.height;
    
    // Special handling for large composite images
    const isLargeImage = this.currentImage.width > this.canvas.width * 2 || this.currentImage.height > this.canvas.height * 2;
    const fitPercentage = isLargeImage ? 0.95 : 0.9; // Use more space for large composite images
    
    console.log('📊 Image classification:', isLargeImage ? 'Large/Composite' : 'Normal');
    console.log('📊 Fit percentage:', fitPercentage);
    
    let scale;
    if (imageAspect > canvasAspect) {
      scale = (this.canvas.width * fitPercentage) / this.currentImage.width;
      console.log('🔄 Using width-based scaling');
    } else {
      scale = (this.canvas.height * fitPercentage) / this.currentImage.height;
      console.log('🔄 Using height-based scaling');
    }
    
    this.zoom = scale * 100;
    this.panX = 0;
    this.panY = 0;
    
    console.log('📏 Calculated zoom:', this.zoom + '%');
    console.log('📍 Reset pan to:', this.panX, this.panY);
    
    this.updateZoomDisplay();
    this.draw();
    
    console.log('✅ fitToCanvas: Complete');
  },

  zoomTo(percent) {
    // Get the currently displayed image for zoom calculations
    const displayedImage = this.getDisplayedImage();
    
    if (!displayedImage) {
      this.zoom = percent;
      this.updateZoomDisplay();
      this.draw();
      return;
    }
    
    console.log('🔍 ZoomTo:', percent + '% using image:', displayedImage.width + 'x' + displayedImage.height);
    
    // Get current image center in screen coordinates
    const oldScale = this.zoom / 100;
    const oldWidth = displayedImage.width * oldScale;
    const oldHeight = displayedImage.height * oldScale;
    const oldX = (this.canvas.width - oldWidth) / 2 + this.panX;
    const oldY = (this.canvas.height - oldHeight) / 2 + this.panY;
    const centerX = oldX + oldWidth / 2;
    const centerY = oldY + oldHeight / 2;
    
    // Apply new zoom
    this.zoom = percent;
    const newScale = this.zoom / 100;
    const newWidth = displayedImage.width * newScale;
    const newHeight = displayedImage.height * newScale;
    
    // Calculate new position to keep center in same place
    const newX = centerX - newWidth / 2;
    const newY = centerY - newHeight / 2;
    const baseX = (this.canvas.width - newWidth) / 2;
    const baseY = (this.canvas.height - newHeight) / 2;
    
    this.panX = newX - baseX;
    this.panY = newY - baseY;
    
    this.updateZoomDisplay();
    this.draw();
  },

  zoomIn() {
    // Get the currently displayed image for zoom calculations
    const displayedImage = this.getDisplayedImage();
    
    if (!displayedImage) {
      this.zoom = Math.min(this.zoom * this.ZOOM_STEP, this.ZOOM_MAX);
      this.updateZoomDisplay();
      this.draw();
      return;
    }
    
    console.log('🔍 ZoomIn using image:', displayedImage.width + 'x' + displayedImage.height);
    
    // Get current image center in screen coordinates
    const oldScale = this.zoom / 100;
    const oldWidth = displayedImage.width * oldScale;
    const oldHeight = displayedImage.height * oldScale;
    const oldX = (this.canvas.width - oldWidth) / 2 + this.panX;
    const oldY = (this.canvas.height - oldHeight) / 2 + this.panY;
    const centerX = oldX + oldWidth / 2;
    const centerY = oldY + oldHeight / 2;
    
    // Apply zoom in with consistent limits
    this.zoom = Math.min(this.zoom * this.ZOOM_STEP, this.ZOOM_MAX);
    const newScale = this.zoom / 100;
    const newWidth = displayedImage.width * newScale;
    const newHeight = displayedImage.height * newScale;
    
    // Calculate new position to keep center in same place
    const newX = centerX - newWidth / 2;
    const newY = centerY - newHeight / 2;
    const baseX = (this.canvas.width - newWidth) / 2;
    const baseY = (this.canvas.height - newHeight) / 2;
    
    this.panX = newX - baseX;
    this.panY = newY - baseY;
    
    this.updateZoomDisplay();
    this.draw();
  },

  zoomOut() {
    // Get the currently displayed image for zoom calculations
    const displayedImage = this.getDisplayedImage();
    
    if (!displayedImage) {
      this.zoom = Math.max(this.zoom / this.ZOOM_STEP, this.ZOOM_MIN);
      this.updateZoomDisplay();
      this.draw();
      return;
    }
    
    console.log('🔍 ZoomOut using image:', displayedImage.width + 'x' + displayedImage.height);
    
    // Get current image center in screen coordinates
    const oldScale = this.zoom / 100;
    const oldWidth = displayedImage.width * oldScale;
    const oldHeight = displayedImage.height * oldScale;
    const oldX = (this.canvas.width - oldWidth) / 2 + this.panX;
    const oldY = (this.canvas.height - oldHeight) / 2 + this.panY;
    const centerX = oldX + oldWidth / 2;
    const centerY = oldY + oldHeight / 2;
    
    // Apply zoom out with consistent limits
    this.zoom = Math.max(this.zoom / this.ZOOM_STEP, this.ZOOM_MIN);
    const newScale = this.zoom / 100;
    const newWidth = displayedImage.width * newScale;
    const newHeight = displayedImage.height * newScale;
    
    // Calculate new position to keep center in same place
    const newX = centerX - newWidth / 2;
    const newY = centerY - newHeight / 2;
    const baseX = (this.canvas.width - newWidth) / 2;
    const baseY = (this.canvas.height - newHeight) / 2;
    
    this.panX = newX - baseX;
    this.panY = newY - baseY;
    
    this.updateZoomDisplay();
    this.draw();
  },

  updateZoomDisplay() {
    const zoomElement = document.getElementById('zoom-level');
    if (zoomElement) {
      zoomElement.textContent = `${Math.round(this.zoom)}%`;
    }
  },

  // Rotation functions
  rotateLeft(degrees = 1) {
    this.rotation -= degrees;
    // Normalize rotation to 0-360 range
    while (this.rotation < 0) {
      this.rotation += 360;
    }
    console.log('🔄 Rotating left to:', this.rotation, 'degrees');
    this.draw();
  },

  rotateRight(degrees = 1) {
    this.rotation += degrees;
    // Normalize rotation to 0-360 range
    while (this.rotation >= 360) {
      this.rotation -= 360;
    }
    console.log('🔄 Rotating right to:', this.rotation, 'degrees');
    this.draw();
  },

  resetRotation() {
    this.rotation = 0;
    console.log('🔄 Rotation reset to 0 degrees');
    this.draw();
  },

  // Helper function to draw image with rotation
  drawImageWithRotation(image, x, y, width, height) {
    if (this.rotation === 0) {
      // No rotation, draw normally for performance
      this.ctx.drawImage(image, x, y, width, height);
    } else {
      // Apply rotation transform
      this.ctx.save();
      
      // Calculate center of the image
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      
      // Move to center, rotate, then move back
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate((this.rotation * Math.PI) / 180); // Convert degrees to radians
      this.ctx.translate(-centerX, -centerY);
      
      // Draw the image
      this.ctx.drawImage(image, x, y, width, height);
      
      this.ctx.restore();
    }
  },

  // Helper function to draw image with shadow and rotation
  drawImageWithShadow(image, x, y, width, height) {
    // Check object shadow first (draws behind image)
    const objectShadowSettings = typeof getObjectShadowSettings === 'function' ? getObjectShadowSettings() : null;
    if (objectShadowSettings) {
      this.drawObjectShadow(x, y, width, height, objectShadowSettings);
    }
    
    // Check if drop shadow is enabled (using main.js function)
    const shadowSettings = typeof getShadowSettings === 'function' ? getShadowSettings() : null;
    
    this.ctx.save();
    
    if (shadowSettings) {
      // Apply drop shadow effects
      this.ctx.shadowBlur = shadowSettings.blur;
      this.ctx.shadowOffsetX = shadowSettings.offsetX;
      this.ctx.shadowOffsetY = shadowSettings.offsetY;
      this.ctx.shadowColor = shadowSettings.color;
      
      // Apply shadow opacity by modifying the color
      const rgb = this.hexToRgb(shadowSettings.color);
      if (rgb) {
        this.ctx.shadowColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${shadowSettings.opacity})`;
      }
      
      console.log('🌑 Drawing image with drop shadow:', shadowSettings);
    }
    
    // Apply rotation if needed
    if (this.rotation !== 0) {
      // Calculate center of the image
      const centerX = x + width / 2;
      const centerY = y + height / 2;
      
      // Move to center, rotate, then move back
      this.ctx.translate(centerX, centerY);
      this.ctx.rotate((this.rotation * Math.PI) / 180); // Convert degrees to radians
      this.ctx.translate(-centerX, -centerY);
    }
    
    // Draw the image (with drop shadow if enabled)
    this.ctx.drawImage(image, x, y, width, height);
    
    this.ctx.restore();
  },

  // Draw realistic 3D object shadow on ground
  drawObjectShadow(imageX, imageY, imageWidth, imageHeight, settings) {
    console.log('🔧 drawObjectShadow - Full settings object:', settings);
    
    if (!this.processedImage) {
      return;
    }
    
    this.ctx.save();
    
    // Convert light angle to radians
    const lightAngleRad = (settings.lightAngle * Math.PI) / 180;
    
    // Calculate light distance factor
    console.log('🔧 lightDistance from settings:', settings.lightDistance, typeof settings.lightDistance);
    const lightDistanceFactor = (settings.lightDistance || 200) / 200;
    console.log('🔧 lightDistanceFactor:', lightDistanceFactor);
    
    // Get bottom edge points from processed image
    const bottomEdge = this.getBottomEdgePoints(imageX, imageY, imageWidth, imageHeight);
    if (!bottomEdge || bottomEdge.length === 0) {
      this.ctx.restore();
      return;
    }
    
    // Calculate shadow projection parameters with light distance
    const shadowOffsetX = Math.cos(lightAngleRad) * settings.objectHeight * 0.3 / lightDistanceFactor;
    const shadowOffsetY = Math.sin(lightAngleRad) * settings.objectHeight * 0.2 / lightDistanceFactor;
    
    console.log('💡 Light settings:', {
      angle: settings.lightAngle,
      distance: settings.lightDistance || 200,
      distanceFactor: lightDistanceFactor.toFixed(2),
      offsetX: shadowOffsetX.toFixed(1),
      offsetY: shadowOffsetY.toFixed(1)
    });
    
    // Create shadow shape
    const shadowShape = this.createBottomEdgeShadow(bottomEdge, settings, shadowOffsetX, shadowOffsetY);
    
    // Set shadow style
    const rgb = this.hexToRgb(settings.color);
    const shadowColor = rgb 
      ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${settings.opacity})`
      : `rgba(0, 0, 0, ${settings.opacity})`;
    
    this.ctx.filter = `blur(${settings.blur}px)`;
    this.ctx.fillStyle = shadowColor;
    
    // Draw simplified shadow shape
    if (shadowShape.length > 0) {
      this.ctx.beginPath();
      this.ctx.moveTo(shadowShape[0].x, shadowShape[0].y);
      
      for (let i = 1; i < shadowShape.length; i++) {
        this.ctx.lineTo(shadowShape[i].x, shadowShape[i].y);
      }
      
      this.ctx.closePath();
      this.ctx.fill();
      
      // Shadow drawn successfully
    }
    
    this.ctx.restore();
    
    // Shadow drawing completed
  },

  // Get smart object outline for shape-aware shadows
  getBottomEdgePoints(imageX, imageY, imageWidth, imageHeight) {
    console.log('🚀 getBottomEdgePoints called - NEW SYSTEM ACTIVE');
    
    if (!this.processedImage) {
      console.log('❌ No processed image available');
      return [];
    }
    
    try {
      // Create a temporary canvas to analyze the image
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = Math.floor(imageWidth);
      tempCanvas.height = Math.floor(imageHeight);
      
      console.log('📐 Temp canvas size:', tempCanvas.width, 'x', tempCanvas.height);
      
      // Draw the processed image to temp canvas
      tempCtx.drawImage(this.processedImage, 0, 0, tempCanvas.width, tempCanvas.height);
      
      // Get image data
      const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
      const data = imageData.data;
      
      console.log('📊 Image data length:', data.length);
      
      // Intelligent shape detection
      const objectBounds = this.findObjectBounds(data, tempCanvas.width, tempCanvas.height);
      console.log('📏 Object bounds found:', objectBounds);
      
      const shapeType = this.classifyObjectShape(data, tempCanvas.width, tempCanvas.height, objectBounds);
      console.log('🔍 Shape detected:', shapeType);
      console.log('🎯 NEW SHADOW SYSTEM ACTIVE! v2.0');
      
          // Generate shadow outline based on shape type
    let shadowOutline = [];
    
    console.log('🎯 DECISION: Using UNIVERSAL CIRCULAR shadow for all objects');
    console.log('🔍 Original shape detection result was:', shapeType);
    
    // Use circular shadow for ALL objects for consistency
    shadowOutline = this.generateCircularShadow(objectBounds, imageX, imageY);
    console.log('🟡 Universal circular shadow points:', shadowOutline.length);
    
    // Keep old logic for debugging (commented out)
    /*
    if (shapeType === 'circular') {
      console.log('🟡 Generating CIRCULAR shadow');
      shadowOutline = this.generateCircularShadow(objectBounds, imageX, imageY);
      console.log('🟡 Circular shadow points:', shadowOutline.length);
    } else if (shapeType === 'rectangular') {
      console.log('⬜ Generating RECTANGULAR shadow');
      shadowOutline = this.generateRectangularShadow(objectBounds, imageX, imageY);
      console.log('⬜ Rectangular shadow points:', shadowOutline.length);
    } else {
      console.log('🎭 Generating COMPLEX shadow');
      // Complex shape - use contour detection
      shadowOutline = this.generateContourShadow(data, tempCanvas.width, tempCanvas.height, imageX, imageY);
      console.log('🎭 Complex shadow points:', shadowOutline.length);
    }
    */
      
      return shadowOutline;
      
    } catch (error) {
      console.error('❌ Error in getBottomEdgePoints:', error);
      return [];
    }
  },

  // Find object boundaries in image
  findObjectBounds(data, width, height) {
    let minX = width, maxX = 0, minY = height, maxY = 0;
    let pixelCount = 0;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 128) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          pixelCount++;
        }
      }
    }
    
    return {
      minX, maxX, minY, maxY,
      width: maxX - minX,
      height: maxY - minY,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2,
      pixelCount
    };
  },

  // Classify object shape
  classifyObjectShape(data, width, height, bounds) {
    if (!bounds.width || !bounds.height) return 'unknown';
    
    const aspectRatio = bounds.width / bounds.height;
    const boundingArea = bounds.width * bounds.height;
    const fillRatio = bounds.pixelCount / boundingArea;
    
    console.log('📊 Shape analysis:', {
      aspectRatio: aspectRatio.toFixed(2),
      fillRatio: (fillRatio * 100).toFixed(1) + '%',
      dimensions: `${bounds.width}x${bounds.height}`
    });
    
    // Check for circular objects
    if (aspectRatio > 0.8 && aspectRatio < 1.2 && fillRatio > 0.6) {
      // Check circularity by sampling edge points
      const edgeVariance = this.calculateEdgeVariance(data, width, height, bounds);
      console.log('🔵 Checking circularity, variance:', edgeVariance.toFixed(3));
      if (edgeVariance < 0.3) {
        console.log('✅ CIRCULAR SHAPE DETECTED!');
        return 'circular';
      }
    }
    
    // Check for rectangular objects
    if (fillRatio > 0.75) {
      console.log('✅ RECTANGULAR SHAPE DETECTED!');
      return 'rectangular';
    }
    
    console.log('✅ COMPLEX SHAPE DETECTED!');
    return 'complex';
  },

  // Calculate edge variance to detect circular shapes
  calculateEdgeVariance(data, width, height, bounds) {
    const centerX = bounds.centerX;
    const centerY = bounds.centerY;
    const expectedRadius = Math.min(bounds.width, bounds.height) / 2;
    
    let distances = [];
    const angleStep = Math.PI / 16; // 16 sample points
    
    for (let angle = 0; angle < Math.PI * 2; angle += angleStep) {
      const rayX = Math.cos(angle);
      const rayY = Math.sin(angle);
      
      // Cast ray from center to find edge
      for (let dist = 0; dist < expectedRadius * 1.5; dist++) {
        const x = Math.floor(centerX + rayX * dist);
        const y = Math.floor(centerY + rayY * dist);
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const alpha = data[(y * width + x) * 4 + 3];
          if (alpha <= 128) {
            distances.push(dist);
            break;
          }
        }
      }
    }
    
    if (distances.length < 8) return 1; // Not enough samples
    
    // Calculate variance
    const mean = distances.reduce((a, b) => a + b, 0) / distances.length;
    const variance = distances.reduce((sum, dist) => sum + Math.pow(dist - mean, 2), 0) / distances.length;
    
    return variance / (expectedRadius * expectedRadius); // Normalized variance
  },

  // Generate circular shadow outline - SPECIAL MARKER
  generateCircularShadow(bounds, imageX, imageY) {
    const centerX = imageX + bounds.centerX;
    const centerY = imageY + bounds.maxY; // Use bottom of object
    const radius = bounds.width / 2;
    
    const points = [];
    const numPoints = 16; // Smooth circle with 16 points
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      points.push({
        x: centerX + Math.cos(angle) * radius,
        y: centerY,
        isCircular: true // SPECIAL MARKER for circular points
      });
    }
    
    console.log('🟡 Generated circular points:', points.slice(0, 3)); // Show first 3 points
    return points;
  },

  // Generate rectangular shadow outline
  generateRectangularShadow(bounds, imageX, imageY) {
    const left = imageX + bounds.minX;
    const right = imageX + bounds.maxX;
    const bottom = imageY + bounds.maxY;
    
    return [
      { x: left, y: bottom },
      { x: right, y: bottom },
      { x: right, y: bottom },
      { x: left, y: bottom }
    ];
  },

  // Generate contour-based shadow for complex shapes
  generateContourShadow(data, width, height, imageX, imageY) {
    const stepSize = Math.max(4, Math.floor(width / 24));
    const bottomEdge = [];
    
    // Find bottom edge with better sampling
    for (let x = 0; x < width; x += stepSize) {
      for (let y = height - 1; y >= 0; y--) {
        const alpha = data[(y * width + x) * 4 + 3];
        if (alpha > 128) {
          bottomEdge.push({
            x: imageX + x,
            y: imageY + y
          });
          break;
        }
      }
    }
    
    return this.aggressiveSmoothEdge(bottomEdge);
  },

  // Check if a pixel is on the edge of the object
  isEdgePixel(data, x, y, width, height) {
    const checkRadius = 1; // Reduced from 2 to 1 for more sensitive detection
    
    // Check 8 neighbors (simpler and faster)
    const neighbors = [
      [-1, -1], [-1, 0], [-1, 1],
      [0, -1],           [0, 1],
      [1, -1],  [1, 0],  [1, 1]
    ];
    
    for (const [dx, dy] of neighbors) {
      const nx = x + dx;
      const ny = y + dy;
      
      if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
        const index = (ny * width + nx) * 4;
        const alpha = data[index + 3];
        
        if (alpha <= 128) { // Found transparent neighbor
          return true;
        }
      } else {
        // Edge of canvas counts as transparent
        return true;
      }
    }
    
    return false;
  },

  // Check if a point represents a significant shape contour
  isSignificantContour(data, x, y, width, height) {
    // Check for significant changes in alpha around this point
    const centerAlpha = data[(y * width + x) * 4 + 3];
    let transitions = 0;
    
    // Check horizontal neighbors
    for (let dx = -2; dx <= 2; dx++) {
      const nx = x + dx;
      if (nx >= 0 && nx < width) {
        const neighborAlpha = data[(y * width + nx) * 4 + 3];
        if (Math.abs(centerAlpha - neighborAlpha) > 100) {
          transitions++;
        }
      }
    }
    
    // Check vertical neighbors
    for (let dy = -2; dy <= 2; dy++) {
      const ny = y + dy;
      if (ny >= 0 && ny < height) {
        const neighborAlpha = data[(ny * width + x) * 4 + 3];
        if (Math.abs(centerAlpha - neighborAlpha) > 100) {
          transitions++;
        }
      }
    }
    
    return transitions >= 2; // Significant if multiple transitions nearby
  },

  // Aggressive smoothing for clean shadows
  aggressiveSmoothEdge(points) {
    if (points.length < 3) return points;
    
    // Sort points by X coordinate first
    points.sort((a, b) => a.x - b.x);
    
    // Apply multiple passes of smoothing
    let smoothed = [...points];
    
    // First pass: Large window smoothing
    for (let pass = 0; pass < 2; pass++) {
      const newSmoothed = [];
      const windowSize = 5;
      
      for (let i = 0; i < smoothed.length; i++) {
        if (i === 0 || i === smoothed.length - 1) {
          // Keep endpoints
          newSmoothed.push(smoothed[i]);
        } else {
          // Large window average
          let avgX = 0, avgY = 0, count = 0;
          
          for (let j = Math.max(0, i - windowSize); j <= Math.min(smoothed.length - 1, i + windowSize); j++) {
            avgX += smoothed[j].x;
            avgY += smoothed[j].y;
            count++;
          }
          
          newSmoothed.push({
            x: avgX / count,
            y: avgY / count
          });
        }
      }
      smoothed = newSmoothed;
    }
    
    // Final pass: Reduce point density
    const finalSmoothed = [];
    const minDistance = 15; // Minimum distance between points
    
    finalSmoothed.push(smoothed[0]); // Always keep first point
    
    for (let i = 1; i < smoothed.length - 1; i++) {
      const lastPoint = finalSmoothed[finalSmoothed.length - 1];
      const distance = Math.sqrt(
        Math.pow(smoothed[i].x - lastPoint.x, 2) + 
        Math.pow(smoothed[i].y - lastPoint.y, 2)
      );
      
      if (distance >= minDistance) {
        finalSmoothed.push(smoothed[i]);
      }
    }
    
    finalSmoothed.push(smoothed[smoothed.length - 1]); // Always keep last point
    
    return finalSmoothed;
  },

  // Create shape-aware shadow
  createBottomEdgeShadow(bottomEdge, settings, shadowOffsetX, shadowOffsetY) {
    if (bottomEdge.length === 0) return [];
    
    console.log('🎯 createBottomEdgeShadow called with', bottomEdge.length, 'points');
    console.log('🎯 First point check:', bottomEdge[0]);
    
    // Check if these are circular points (marked specially)
    const isCircularShadow = bottomEdge.length === 16 && bottomEdge[0].isCircular;
    
    if (isCircularShadow) {
      console.log('🟡 CREATING ELLIPTICAL SHADOW for circular object');
      return this.createEllipticalShadow(bottomEdge, settings, shadowOffsetX, shadowOffsetY);
    }
    
    console.log('⬜ Creating standard shadow projection');
    
    // Sort points if needed for non-circular
    if (bottomEdge.length > 4) {
      bottomEdge.sort((a, b) => a.x - b.x);
    }
    
    const shadowPoints = [];
    const perspectiveFactor = 1 - settings.perspective;
    
    // For other shapes, use standard projection
    // Add top edge of shadow (object base + offset)
    for (const point of bottomEdge) {
      shadowPoints.push({
        x: point.x + shadowOffsetX,
        y: point.y + shadowOffsetY
      });
    }
    
    // Add bottom edge with perspective
    for (let i = bottomEdge.length - 1; i >= 0; i--) {
      const point = bottomEdge[i];
      const centerX = (bottomEdge[0].x + bottomEdge[bottomEdge.length - 1].x) / 2;
      const distanceFromCenter = point.x - centerX;
      const perspectiveOffset = distanceFromCenter * perspectiveFactor * 0.4;
      
      shadowPoints.push({
        x: point.x + shadowOffsetX + perspectiveOffset,
        y: point.y + shadowOffsetY + settings.shadowDistance
      });
    }
    
    return shadowPoints;
  },

  // Check if outline points form a circular pattern
  isLikelyCircular(points) {
    if (points.length !== 16) return false;
    
    // Check if points form roughly circular distribution
    const centerX = points.reduce((sum, p) => sum + p.x, 0) / points.length;
    const centerY = points.reduce((sum, p) => sum + p.y, 0) / points.length;
    
    const distances = points.map(p => 
      Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2))
    );
    
    const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
    const variance = distances.reduce((sum, d) => sum + Math.pow(d - avgDistance, 2), 0) / distances.length;
    
    return variance < (avgDistance * 0.3); // Low variance indicates circular
  },

  // Create elliptical shadow for circular objects
  createEllipticalShadow(bottomEdge, settings, shadowOffsetX, shadowOffsetY) {
    console.log('🟡 createEllipticalShadow called');
    
    const centerX = bottomEdge.reduce((sum, p) => sum + p.x, 0) / bottomEdge.length;
    const baseY = bottomEdge[0].y; // Use bottom of object
    
    // Calculate object radius
    const radius = Math.max(...bottomEdge.map(p => Math.abs(p.x - centerX)));
    
    console.log('🟡 Ellipse params:', { centerX, baseY, radius });
    
    // Create elliptical shadow
    const shadowPoints = [];
    const numPoints = 24; // More points for smoother ellipse
    const perspectiveFactor = 1 - settings.perspective;
    
    // Create ellipse - flatter for more realistic ground shadow
    const radiusX = radius * 1.1; // Slightly wider for realism
    const radiusY = radius * 0.25; // Flatter shadow
    
    // Calculate light distance effect on shadow size
    console.log('🔧 Debug lightDistance:', settings.lightDistance, typeof settings.lightDistance);
    const lightDistanceFactor = (settings.lightDistance || 200) / 200;
    console.log('🔧 lightDistanceFactor:', lightDistanceFactor);
    const shadowScale = 1.0 / Math.sqrt(lightDistanceFactor); // Closer light = bigger shadow
    console.log('🔧 shadowScale calculation:', '1.0 /', Math.sqrt(lightDistanceFactor), '=', shadowScale);
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radiusX * shadowScale;
      const y = baseY + Math.sin(angle) * radiusY * shadowScale;
      
      // Apply shadow offset and perspective
      const distanceFromCenter = x - centerX;
      const perspectiveOffset = distanceFromCenter * perspectiveFactor * 0.3;
      
      shadowPoints.push({
        x: x + shadowOffsetX + perspectiveOffset,
        y: y + shadowOffsetY + settings.shadowDistance - 3 // Move shadow closer to object
      });
    }
    
    console.log('🟡 Generated elliptical shadow with', shadowPoints.length, 'points');
    console.log('🟡 Shadow scale factor:', shadowScale.toFixed(2));
    return shadowPoints;
  },

  // Helper function to convert hex color to RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  // Get currently displayed image for zoom/pan calculations
  getDisplayedImage() {
    console.log('🔍 getDisplayedImage called');
    console.log('📊 View mode:', this.viewMode);
    console.log('📊 Composition mode:', this.compositionMode);
    console.log('📊 Current image exists:', !!this.currentImage);
    console.log('📊 Processed image exists:', !!this.processedImage);
    
    // In composition mode, we don't use normal zoom - composition handles its own scaling
    if (this.compositionMode) {
      console.log('⚪ Composition mode: returning null for zoom calculations');
      return null;
    }
    
    // Return the image that's currently being displayed based on view mode
    let selectedImage = null;
    
    switch (this.viewMode) {
      case 'original':
        selectedImage = this.currentImage;
        console.log('📷 Using original image for zoom');
        break;
      
      case 'processed':
        // If we have a processed image, use it, otherwise fall back to current
        selectedImage = this.processedImage || this.currentImage;
        console.log('🔄 Using processed image for zoom:', !!this.processedImage ? 'processed' : 'fallback to original');
        break;
      
      case 'comparison':
        // In comparison mode, use current image for positioning
        selectedImage = this.currentImage;
        console.log('🔄 Using original image for comparison mode zoom');
        break;
      
      default:
        selectedImage = this.currentImage;
        console.log('🔄 Using default (current) image for zoom');
        break;
    }
    
    if (selectedImage) {
      console.log('✅ Returning image:', selectedImage.width + 'x' + selectedImage.height);
    } else {
      console.log('❌ No image to return');
    }
    
    return selectedImage;
  },

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Handle composition mode - still use normal drawing but add background
    if (this.compositionMode) {
      // First draw canvas background (user's setting)
      this.drawCanvasBackground();
      
      // Then draw composition background layer
      this.drawBackgroundLayer(this.ctx, this.canvas.width, this.canvas.height);
      
      // Continue with normal drawing for the rest...
    } else {
      // Draw canvas background normally
      this.drawCanvasBackground();
    }
    
    // Draw grid if enabled (always draw grid, not just when image exists)
    if (this.showGrid) {
      this.drawGrid();
    }
    
    // In composition mode, only draw if there's a processedImage
    if (this.compositionMode && !this.processedImage) {
      console.log('🎨 Composition mode: No foreground image to draw');
      return; // Don't draw any foreground image
    }
    
    if (!this.currentImage) return;
    
    // TEMPORARILY DISABLED: Transparency background causing white overlay
    // if (this.viewMode === 'processed' && this.processedImage) {
    //   this.drawTransparencyBackground();
    // }
    
    // Calculate image position and size using the displayed image
    const displayedImage = this.getDisplayedImage() || this.currentImage;
    const scale = this.zoom / 100;
    const width = displayedImage.width * scale;
    const height = displayedImage.height * scale;
    const x = (this.canvas.width - width) / 2 + this.panX;
    const y = (this.canvas.height - height) / 2 + this.panY;
    
    // Draw images based on view mode
    switch (this.viewMode) {
      case 'original':
        this.drawImageWithRotation(this.currentImage, x, y, width, height);
        break;
        
      case 'processed':
        if (this.processedImage) {
          this.drawImageWithShadow(this.processedImage, x, y, width, height);
        } else {
          this.drawImageWithRotation(this.currentImage, x, y, width, height);
          this.drawNoProcessedImageMessage(x, y, width, height);
        }
        break;
        
      case 'comparison':
        const halfWidth = width / 2;
        
        // Draw original on left
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.rect(x, y, halfWidth, height);
        this.ctx.clip();
        this.drawImageWithRotation(this.currentImage, x, y, width, height);
        this.ctx.restore();
        
        // Draw processed on right
        if (this.processedImage) {
          this.ctx.save();
          this.ctx.beginPath();
          this.ctx.rect(x + halfWidth, y, halfWidth, height);
          this.ctx.clip();
          this.drawImageWithShadow(this.processedImage, x, y, width, height);
          this.ctx.restore();
        }
        
        // Draw divider line
        this.ctx.strokeStyle = '#2563eb';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + halfWidth, y);
        this.ctx.lineTo(x + halfWidth, y + height);
        this.ctx.stroke();
        
        // Draw labels
        this.drawComparisonLabels(x, y, halfWidth, height);
        break;
    }
    
    // Image border removed per user request
    // this.ctx.strokeStyle = '#e2e8f0';
    // this.ctx.lineWidth = 1;
    // this.ctx.strokeRect(x, y, width, height);
    
    // Draw crop overlay if crop mode is active
    if (this.cropMode) {
      this.drawCropOverlay(x, y, width, height);
    }
  },
  
  // Crop system methods
  enableCropMode() {
    this.cropMode = true;
    this.initializeCropFrame();
    this.draw();
    console.log('🔲 Crop mode enabled');
  },
  
  disableCropMode() {
    console.log('🚫 CanvasManager.disableCropMode() called');
    console.trace('disableCropMode call stack'); // This will show where it was called from
    this.cropMode = false;
    this.isDraggingCrop = false;
    this.cropResizeHandle = null;
    this.draw();
    console.log('🔲 Crop mode disabled');
  },
  
  initializeCropFrame() {
    if (!this.currentImage) return;
    
    // Center crop frame with reasonable size
    const scale = this.zoom / 100;
    const imageWidth = this.currentImage.width * scale;
    const imageHeight = this.currentImage.height * scale;
    
    // Start with 70% of image size, maintaining aspect ratio if needed
    let cropWidth = imageWidth * 0.7;
    let cropHeight = imageHeight * 0.7;
    
    // Apply aspect ratio constraint
    if (this.aspectRatio !== 'free') {
      const ratio = this.aspectRatios[this.aspectRatio].ratio;
      if (ratio) {
        if (cropWidth / cropHeight > ratio) {
          cropWidth = cropHeight * ratio;
        } else {
          cropHeight = cropWidth / ratio;
        }
      }
    }
    
    const imageX = (this.canvas.width - imageWidth) / 2 + this.panX;
    const imageY = (this.canvas.height - imageHeight) / 2 + this.panY;
    
    this.cropFrame = {
      x: imageX + (imageWidth - cropWidth) / 2,
      y: imageY + (imageHeight - cropHeight) / 2,
      width: cropWidth,
      height: cropHeight
    };
  },
  
  drawCropOverlay(imageX, imageY, imageWidth, imageHeight) {
    const ctx = this.ctx;
    
    // Draw darkened overlay outside crop area
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    
    // Top
    ctx.fillRect(imageX, imageY, imageWidth, this.cropFrame.y - imageY);
    // Bottom
    ctx.fillRect(imageX, this.cropFrame.y + this.cropFrame.height, imageWidth, imageY + imageHeight - (this.cropFrame.y + this.cropFrame.height));
    // Left
    ctx.fillRect(imageX, this.cropFrame.y, this.cropFrame.x - imageX, this.cropFrame.height);
    // Right
    ctx.fillRect(this.cropFrame.x + this.cropFrame.width, this.cropFrame.y, imageX + imageWidth - (this.cropFrame.x + this.cropFrame.width), this.cropFrame.height);
    
    // Draw crop frame border (thin reference line)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(this.cropFrame.x, this.cropFrame.y, this.cropFrame.width, this.cropFrame.height);
    ctx.setLineDash([]);
    
    // Draw corner handles
    this.drawCropHandles();
    
    // Draw grid lines (rule of thirds)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    const gridX1 = this.cropFrame.x + this.cropFrame.width / 3;
    const gridX2 = this.cropFrame.x + (this.cropFrame.width * 2) / 3;
    const gridY1 = this.cropFrame.y + this.cropFrame.height / 3;
    const gridY2 = this.cropFrame.y + (this.cropFrame.height * 2) / 3;
    
    // Vertical grid lines
    ctx.beginPath();
    ctx.moveTo(gridX1, this.cropFrame.y);
    ctx.lineTo(gridX1, this.cropFrame.y + this.cropFrame.height);
    ctx.moveTo(gridX2, this.cropFrame.y);
    ctx.lineTo(gridX2, this.cropFrame.y + this.cropFrame.height);
    ctx.stroke();
    
    // Horizontal grid lines
    ctx.beginPath();
    ctx.moveTo(this.cropFrame.x, gridY1);
    ctx.lineTo(this.cropFrame.x + this.cropFrame.width, gridY1);
    ctx.moveTo(this.cropFrame.x, gridY2);
    ctx.lineTo(this.cropFrame.x + this.cropFrame.width, gridY2);
    ctx.stroke();
    
    ctx.restore();
  },
  
  drawCropHandles() {
    const ctx = this.ctx;
    const handleSize = 8;
    const { x, y, width, height } = this.cropFrame;
    
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 2;
    
    // Corner handles
    const handles = [
      { x: x - handleSize/2, y: y - handleSize/2 }, // NW
      { x: x + width - handleSize/2, y: y - handleSize/2 }, // NE
      { x: x - handleSize/2, y: y + height - handleSize/2 }, // SW
      { x: x + width - handleSize/2, y: y + height - handleSize/2 }, // SE
    ];
    
    handles.forEach(handle => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
  },
  
  setAspectRatio(ratio) {
    this.aspectRatio = ratio;
    if (this.cropMode) {
      this.initializeCropFrame();
      this.draw();
    }
    console.log(`🔲 Aspect ratio set to: ${this.aspectRatios[ratio].label}`);
  },
  
  applyCrop() {
    return new Promise((resolve, reject) => {
      if (!this.cropMode || !this.currentImage) {
        console.error('Cannot apply crop: crop mode not active or no image');
        reject(new Error('Cannot apply crop'));
        return;
      }
      
      // Convert crop frame coordinates from canvas space to image space
      const scale = this.zoom / 100;
      const imageWidth = this.currentImage.width * scale;
      const imageHeight = this.currentImage.height * scale;
      const imageX = (this.canvas.width - imageWidth) / 2 + this.panX;
      const imageY = (this.canvas.height - imageHeight) / 2 + this.panY;
      
      // Calculate crop area in original image coordinates
      const cropX = (this.cropFrame.x - imageX) / scale;
      const cropY = (this.cropFrame.y - imageY) / scale;
      const cropWidth = this.cropFrame.width / scale;
      const cropHeight = this.cropFrame.height / scale;
      
      // Ensure crop is within image bounds
      const validCropX = Math.max(0, Math.min(cropX, this.currentImage.width));
      const validCropY = Math.max(0, Math.min(cropY, this.currentImage.height));
      const validCropWidth = Math.min(cropWidth, this.currentImage.width - validCropX);
      const validCropHeight = Math.min(cropHeight, this.currentImage.height - validCropY);
      
      if (validCropWidth <= 0 || validCropHeight <= 0) {
        console.error('Invalid crop dimensions');
        reject(new Error('Invalid crop dimensions'));
        return;
      }
      
      console.log(`🔲 Cropping area: ${validCropX.toFixed(0)}, ${validCropY.toFixed(0)}, ${validCropWidth.toFixed(0)}x${validCropHeight.toFixed(0)}`);
      
      // Create new canvas for cropped image
      const cropCanvas = document.createElement('canvas');
      const cropCtx = cropCanvas.getContext('2d');
      cropCanvas.width = validCropWidth;
      cropCanvas.height = validCropHeight;
      
      // Draw cropped portion of original image
      cropCtx.drawImage(
        this.currentImage,
        validCropX, validCropY, validCropWidth, validCropHeight, // Source
        0, 0, validCropWidth, validCropHeight // Destination
      );
      
      // Convert canvas to image
      const croppedImage = new Image();
      croppedImage.onload = () => {
        // Replace current image with cropped version
        this.currentImage = croppedImage;
        this.processedImage = null; // Clear processed version since original changed
        
        // Reset zoom and pan to fit new image
        this.zoom = 100;
        this.panX = 0;
        this.panY = 0;
        
        // Disable crop mode
        this.disableCropMode();
        
        // Redraw canvas immediately
        this.draw();
        
        console.log(`🔲 Image cropped successfully: ${validCropWidth.toFixed(0)}x${validCropHeight.toFixed(0)}`);
        
        // Resolve with the cropped image
        resolve({
          image: croppedImage,
          dataURL: cropCanvas.toDataURL(),
          width: validCropWidth,
          height: validCropHeight
        });
      };
      
      croppedImage.onerror = () => {
        reject(new Error('Failed to load cropped image'));
      };
      
      croppedImage.src = cropCanvas.toDataURL();
    });
  },

  getCropData() {
    if (!this.cropMode || !this.currentImage) {
      return null;
    }
    
    // Convert crop frame coordinates from canvas space to image space
    const scale = this.zoom / 100;
    const imageWidth = this.currentImage.width * scale;
    const imageHeight = this.currentImage.height * scale;
    const imageX = (this.canvas.width - imageWidth) / 2 + this.panX;
    const imageY = (this.canvas.height - imageHeight) / 2 + this.panY;
    
    // Calculate crop area in original image coordinates
    const cropX = (this.cropFrame.x - imageX) / scale;
    const cropY = (this.cropFrame.y - imageY) / scale;
    const cropWidth = this.cropFrame.width / scale;
    const cropHeight = this.cropFrame.height / scale;
    
    // Ensure crop is within image bounds
    const validCropX = Math.max(0, Math.min(cropX, this.currentImage.width));
    const validCropY = Math.max(0, Math.min(cropY, this.currentImage.height));
    const validCropWidth = Math.min(cropWidth, this.currentImage.width - validCropX);
    const validCropHeight = Math.min(cropHeight, this.currentImage.height - validCropY);
    
    if (validCropWidth <= 0 || validCropHeight <= 0) {
      return null;
    }
    
    return {
      sourceX: validCropX,
      sourceY: validCropY,
      width: validCropWidth,
      height: validCropHeight
    };
  },

  drawTransparencyBackground() {
    // Only draw transparency pattern behind the actual image area
    if (!this.currentImage) return;
    
    const displayedImage = this.getDisplayedImage() || this.currentImage;
    const scale = this.zoom / 100;
    const width = displayedImage.width * scale;
    const height = displayedImage.height * scale;
    const x = (this.canvas.width - width) / 2 + this.panX;
    const y = (this.canvas.height - height) / 2 + this.panY;
    
    // Draw checkerboard pattern only behind image area
    const size = 20;
    this.ctx.save();
    
    // Clip to image area
    this.ctx.beginPath();
    this.ctx.rect(x, y, width, height);
    this.ctx.clip();
    
    // Draw transparency checkerboard
    this.ctx.fillStyle = '#f8f9fa';
    this.ctx.fillRect(x, y, width, height);
    
    this.ctx.fillStyle = '#e2e8f0';
    for (let imgX = Math.floor(x / size) * size; imgX < x + width; imgX += size) {
      for (let imgY = Math.floor(y / size) * size; imgY < y + height; imgY += size) {
        if (((imgX / size) + (imgY / size)) % 2 === 0) {
          this.ctx.fillRect(imgX, imgY, size, size);
        }
      }
    }
    
    this.ctx.restore();
  },

  drawNoProcessedImageMessage(x, y, width, height) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.ctx.fillRect(x, y, width, height);
    
    this.ctx.fillStyle = 'white';
    this.ctx.font = '16px Inter, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'No processed image available',
      x + width / 2,
      y + height / 2 - 10
    );
    this.ctx.fillText(
      'Process this image first',
      x + width / 2,
      y + height / 2 + 10
    );
  },

  drawComparisonLabels(x, y, halfWidth, height) {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.font = '14px Inter, sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = 'white';
    
    // Original label
    this.ctx.fillText('Original', x + halfWidth / 2, y + 20);
    
    // Processed label
    this.ctx.fillText(
      this.processedImage ? 'Processed' : 'Not Processed',
      x + halfWidth + halfWidth / 2,
      y + 20
    );
  },

  // Mouse event handlers
  handleMouseDown(e) {
    this.isDragging = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.canvas.style.cursor = 'grabbing';
    
    // Log for composition mode
    if (this.compositionMode) {
      console.log('🖱️ Mouse down in composition mode');
    }
  },

  handleMouseMove(e) {
    if (this.isDragging) {
      const deltaX = e.clientX - this.lastMouseX;
      const deltaY = e.clientY - this.lastMouseY;
      
      // Use normal pan for both modes - user wants consistent zoom/pan behavior
      this.panX += deltaX;
      this.panY += deltaY;
      this.draw();
      
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }
  },

  handleMouseUp(e) {
    this.isDragging = false;
    this.canvas.style.cursor = 'grab';
    
    // Log for composition mode
    if (this.compositionMode) {
      console.log('🖱️ Mouse up in composition mode');
    }
  },

  handleWheel(e) {
    e.preventDefault();
    
    // Check for rotation mode (Ctrl + wheel)
    if (e.ctrlKey) {
      const rotationStep = e.shiftKey ? 5 : 1; // Shift+Ctrl+Wheel = 5°, Ctrl+Wheel = 1°
      if (e.deltaY > 0) {
        this.rotateRight(rotationStep);
      } else {
        this.rotateLeft(rotationStep);
      }
      return;
    }
    
    // Use normal zoom for both modes - user wants consistent zoom/pan behavior
    // Removed composition mode special handling
    
    const rect = this.canvas.getBoundingClientRect();
    
    // Get the currently displayed image for zoom calculations
    const displayedImage = this.getDisplayedImage();
    
    if (!displayedImage) {
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      this.zoom = Math.max(this.ZOOM_MIN, Math.min(this.ZOOM_MAX, this.zoom * zoomFactor));
      this.updateZoomDisplay();
      this.draw();
      return;
    }
    
    console.log('🔍 HandleWheel using image:', displayedImage.width + 'x' + displayedImage.height);
    
    // Get current image center in screen coordinates (same as button zoom)
    const oldScale = this.zoom / 100;
    const oldWidth = displayedImage.width * oldScale;
    const oldHeight = displayedImage.height * oldScale;
    const oldX = (this.canvas.width - oldWidth) / 2 + this.panX;
    const oldY = (this.canvas.height - oldHeight) / 2 + this.panY;
    const centerX = oldX + oldWidth / 2;
    const centerY = oldY + oldHeight / 2;
    
    // Apply zoom with consistent limits
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    this.zoom = Math.max(this.ZOOM_MIN, Math.min(this.ZOOM_MAX, this.zoom * zoomFactor));
    const newScale = this.zoom / 100;
    const newWidth = displayedImage.width * newScale;
    const newHeight = displayedImage.height * newScale;
    
    // Calculate new position to keep center in same place (center-based zoom)
    const newX = centerX - newWidth / 2;
    const newY = centerY - newHeight / 2;
    const baseX = (this.canvas.width - newWidth) / 2;
    const baseY = (this.canvas.height - newHeight) / 2;
    
    this.panX = newX - baseX;
    this.panY = newY - baseY;
    
    this.updateZoomDisplay();
    this.draw();
  },

  // Touch event handlers
  handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.isDragging = true;
      this.lastMouseX = touch.clientX;
      this.lastMouseY = touch.clientY;
    }
  },

  handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 1 && this.isDragging) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - this.lastMouseX;
      const deltaY = touch.clientY - this.lastMouseY;
      
      this.panX += deltaX;
      this.panY += deltaY;
      
      this.lastMouseX = touch.clientX;
      this.lastMouseY = touch.clientY;
      
      this.draw();
    }
  },

  handleTouchEnd(e) {
    e.preventDefault();
    this.isDragging = false;
  },

  // Export functions
  exportCanvas(filename = 'exported_image.png') {
    if (!this.currentImage) return;
    
    // Create a new canvas for export
    const exportCanvas = document.createElement('canvas');
    const exportCtx = exportCanvas.getContext('2d');
    
    const imageToExport = this.viewMode === 'processed' && this.processedImage 
      ? this.processedImage 
      : this.currentImage;
    
    exportCanvas.width = imageToExport.width;
    exportCanvas.height = imageToExport.height;
    exportCtx.drawImage(imageToExport, 0, 0);
    
    // Download
    exportCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  },

  // Canvas Background Management
  setCanvasBackground(bgType) {
    console.log('🎨 Setting canvas background to:', bgType);
    this.canvasBackground = bgType;
    
    // Force immediate redraw to show the change
    this.draw();
    
    console.log('✅ Canvas background applied:', bgType);
  },

  drawCanvasBackground() {
    const ctx = this.ctx;
    
    console.log('🎨 drawCanvasBackground called, current setting:', this.canvasBackground);
    console.log('🎨 Canvas dimensions:', this.canvas.width, 'x', this.canvas.height);
    
    switch (this.canvasBackground) {
      case 'theme':
        // Use current theme background color
        const themeColor = this.getThemeBackgroundColor();
        console.log('🎨 Theme color resolved to:', themeColor);
        ctx.fillStyle = themeColor;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        console.log('✅ Theme background drawn');
        break;
      case 'transparent':
        console.log('🔳 Drawing transparent checkered background');
        // Checkered pattern for transparency
        this.drawCheckerPattern();
        break;
      case 'white':
        console.log('🤍 Drawing white background');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        break;
      case 'black':
        console.log('⚫ Drawing black background');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        break;
      case 'gray':
        console.log('🔘 Drawing gray background');
        ctx.fillStyle = '#808080';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        break;
      case 'test':
        console.log('🔴 TESTING: Drawing red background');
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        break;
      default:
        console.log('❓ Using default case, canvasBackground value:', this.canvasBackground);
        // Default to theme color
        const defaultThemeColor = this.getThemeBackgroundColor();
        console.log('🎨 Default theme color:', defaultThemeColor);
        ctx.fillStyle = defaultThemeColor;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        console.log('✅ Default background drawn');
    }
    
    console.log('🎨 drawCanvasBackground completed');
  },

  // Get current theme background color from CSS variables
  getThemeBackgroundColor() {
    try {
      console.log('🔍 Debug theme detection:');
      console.log('  Body classes:', document.body.className);
      
      // DIRECT THEME CLASS CHECK (More reliable than CSS variables)
      if (document.body.classList.contains('theme-dark')) {
        console.log('  ✅ Dark theme detected - using #0f172a');
        return '#0f172a'; // Dark theme background
      } else if (document.body.classList.contains('theme-light')) {
        console.log('  ✅ Light theme detected - using #f8fafc');
        return '#f8fafc'; // Light theme background
      } else if (document.body.classList.contains('theme-system')) {
        // System theme - check OS preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const systemColor = prefersDark ? '#0f172a' : '#f8fafc';
        console.log('  ✅ System theme detected - OS prefers:', prefersDark ? 'dark' : 'light', '- using', systemColor);
        return systemColor;
      }
      
      // Try CSS variables as fallback
      const bodyStyles = getComputedStyle(document.body);
      let bgSecondary = bodyStyles.getPropertyValue('--bg-secondary').trim();
      
      if (bgSecondary) {
        bgSecondary = bgSecondary.replace(/['"]/g, '').trim();
        console.log('  📊 CSS variable bg-secondary:', bgSecondary);
        
        if (bgSecondary.startsWith('#')) {
          console.log('  ✅ Using CSS variable color:', bgSecondary);
          return bgSecondary;
        }
      }
      
      // Final fallback
      console.log('  ⚠️ No theme detected, using light fallback');
      return '#f8fafc';
    } catch (error) {
      console.error('❌ Error getting theme background color:', error);
      return '#f8fafc'; // Safe fallback to light theme
    }
  },

  drawCheckerPattern() {
    const ctx = this.ctx;
    const size = 20; // Size of checker squares
    const color1 = '#f0f0f0';
    const color2 = '#e0e0e0';
    
    for (let x = 0; x < this.canvas.width; x += size) {
      for (let y = 0; y < this.canvas.height; y += size) {
        const isEven = ((x / size) + (y / size)) % 2 === 0;
        ctx.fillStyle = isEven ? color1 : color2;
        ctx.fillRect(x, y, size, size);
      }
    }
  },

  // Grid System
  setShowGrid(enabled) {
    this.showGrid = enabled;
    this.draw(); // Redraw with/without grid
    console.log('📐 Grid display:', enabled ? 'enabled' : 'disabled');
  },

  drawGrid() {
    const ctx = this.ctx;
    ctx.save();
    
    ctx.strokeStyle = '#999999'; // Daha koyu gri
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5; // Daha görünür opacity
    
    // Vertical lines
    for (let x = this.gridSize; x < this.canvas.width; x += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = this.gridSize; y < this.canvas.height; y += this.gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }
    
    ctx.restore();
  },

  // ===== BACKGROUND COMPOSITION MODE FUNCTIONS =====
  
  enableCompositionMode(backgroundTemplate) {
    console.log('🎨 ENABLING COMPOSITION MODE - PRESERVING CURRENT VIEW');
    console.log('📊 Background template:', backgroundTemplate);
    console.log('📊 Current zoom:', this.zoom);
    console.log('📊 Current pan:', this.panX, this.panY);
    
    this.compositionMode = true;
    this.backgroundTemplate = backgroundTemplate;
    
    // PRESERVE current view settings - don't reset position/scale
    // Keep existing zoom, pan, and image positioning
    
    // Load background image if it's an image type
    if (backgroundTemplate.type === 'image') {
      console.log('🖼️ Loading background image for composition...');
      const bgImg = new Image();
      bgImg.onload = () => {
        console.log('✅ Background image loaded for composition');
        this.backgroundImage = bgImg;
        // Don't center - preserve current view
        this.draw();
      };
      bgImg.onerror = () => {
        console.error('❌ Error loading background image for composition');
      };
      bgImg.src = backgroundTemplate.value;
    } else {
      // For color/gradient backgrounds, we'll draw them directly
      this.backgroundImage = null;
      // Don't center - preserve current view
      this.draw();
    }
    
    console.log('✅ Composition mode enabled');
  },

  disableCompositionMode() {
    console.log('🚫 DISABLING COMPOSITION MODE');
    
    this.compositionMode = false;
    this.backgroundImage = null;
    this.backgroundTemplate = null;
    
    // Reset foreground position
    this.foregroundX = 0;
    this.foregroundY = 0;
    this.foregroundScale = 1.0;
    
    this.draw();
    console.log('✅ Composition mode disabled');
  },

  // Center the foreground image on the canvas
  centerForeground() {
    if (this.processedImage) {
      // Calculate center position
      const canvasWidth = this.canvas.width;
      const canvasHeight = this.canvas.height;
      const imgWidth = this.processedImage.width * this.foregroundScale;
      const imgHeight = this.processedImage.height * this.foregroundScale;
      
      this.foregroundX = (canvasWidth - imgWidth) / 2;
      this.foregroundY = (canvasHeight - imgHeight) / 2;
      
      console.log('📍 Foreground centered at:', this.foregroundX, this.foregroundY);
    }
  },

  // Foreground positioning functions
  setForegroundPosition(x, y) {
    this.foregroundX = x;
    this.foregroundY = y;
    if (this.compositionMode) {
      this.draw();
    }
    console.log('📍 Foreground position set to:', x, y);
  },

  moveForeground(deltaX, deltaY) {
    this.foregroundX += deltaX;
    this.foregroundY += deltaY;
    if (this.compositionMode) {
      this.draw();
    }
    console.log('🔄 Foreground moved by:', deltaX, deltaY, 'new position:', this.foregroundX, this.foregroundY);
  },

  setForegroundScale(scale) {
    // Apply consistent limits for foreground scaling
    this.foregroundScale = Math.max(this.COMPOSITION_SCALE_MIN, Math.min(this.COMPOSITION_SCALE_MAX, scale));
    if (this.compositionMode) {
      this.draw();
    }
    console.log('🔍 Foreground scale set to:', this.foregroundScale);
  },

  adjustForegroundScale(delta) {
    const newScale = this.foregroundScale + delta;
    this.setForegroundScale(newScale);
  },

  // Generate final composite - EXACTLY as seen in canvas
  generateCompositeImage() {
    if (!this.compositionMode) {
      console.error('❌ Cannot generate composite: not in composition mode');
      return null;
    }
    
    if (!this.processedImage) {
      console.error('❌ Cannot generate composite: no processed image');
      return null;
    }

    console.log('📸 GENERATING COMPOSITE IMAGE - CANVAS VIEW VERSION');
    
    // Create a new canvas with SAME SIZE as current view
    const compositeCanvas = document.createElement('canvas');
    const compositeCtx = compositeCanvas.getContext('2d');
    
    // Use CURRENT CANVAS SIZE to export exactly what user sees
    compositeCanvas.width = this.canvas.width;
    compositeCanvas.height = this.canvas.height;
    
    // Export EXACTLY what user sees by copying current canvas content
    console.log('📸 Copying current canvas view for export...');
    
    // Simply copy the current canvas content (which already has composition mode rendering)
    compositeCtx.drawImage(this.canvas, 0, 0);
    
    console.log('✅ Canvas view copied for export - preserves all positioning!');
    
    return compositeCanvas.toDataURL('image/png', 1.0);
  },

  // Draw background layer with controlled sizing
  drawBackgroundLayerControlled(ctx, width, height) {
    if (!this.backgroundTemplate) return;
    
    ctx.save();
    
    if (this.backgroundTemplate.type === 'color') {
      if (this.backgroundTemplate.value !== 'transparent') {
        ctx.fillStyle = this.backgroundTemplate.value;
        ctx.fillRect(0, 0, width, height);
      }
    } else if (this.backgroundTemplate.type === 'gradient') {
      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      
      // Extract colors from gradient string
      const colorMatches = this.backgroundTemplate.value.match(/#[a-fA-F0-9]{6}/g);
      if (colorMatches && colorMatches.length >= 2) {
        gradient.addColorStop(0, colorMatches[0]);
        gradient.addColorStop(1, colorMatches[colorMatches.length - 1]);
      } else {
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
      }
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } else if (this.backgroundTemplate.type === 'image' && this.backgroundImage) {
      // Draw background image with proper aspect ratio preservation
      // Always use 'contain' mode to show full image, then apply scale as zoom multiplier
      const scaleValue = (document.getElementById('bg-scale')?.value || 100) / 100;
      
      // First calculate how to fit the image in canvas while preserving aspect ratio
      const baseFit = this.calculateAspectRatioFit(
        this.backgroundImage.width, 
        this.backgroundImage.height, 
        width, 
        height, 
        'contain'
      );
      
      // Then apply scale as a zoom multiplier
      const scaledWidth = baseFit.drawWidth * scaleValue;
      const scaledHeight = baseFit.drawHeight * scaleValue;
      const offsetX = (width - scaledWidth) / 2;
      const offsetY = (height - scaledHeight) / 2;
      
      ctx.drawImage(
        this.backgroundImage, 
        offsetX, 
        offsetY, 
        scaledWidth, 
        scaledHeight
      );
      console.log('🖼️ Background drawn with aspect ratio preserved and scale applied:', 
        scaledWidth, 'x', scaledHeight, 'at offset:', offsetX, offsetY, 'scale:', scaleValue);
    }
    
    ctx.restore();
  },

     // Draw background layer (used in both display and composite generation)
   drawBackgroundLayer(ctx, width, height) {
     if (!this.backgroundTemplate) return;
     
     ctx.save();
     
     // Apply background effects (blur, opacity, scale)
     const blurValue = document.getElementById('bg-blur')?.value || 0;
     const opacityValue = (document.getElementById('bg-opacity')?.value || 100) / 100;
     const scaleValue = (document.getElementById('bg-scale')?.value || 100) / 100;
     
     // Apply opacity
     ctx.globalAlpha = opacityValue;
     
     // Apply blur filter
     if (blurValue > 0) {
       ctx.filter = `blur(${blurValue}px)`;
     }
     
     if (this.backgroundTemplate.type === 'color') {
       if (this.backgroundTemplate.value !== 'transparent') {
         ctx.fillStyle = this.backgroundTemplate.value;
         ctx.fillRect(0, 0, width, height);
       }
     } else if (this.backgroundTemplate.type === 'gradient') {
       // Create gradient (simplified version)
       const gradient = ctx.createLinearGradient(0, 0, width, height);
       
       // Extract colors from gradient string
       const colorMatches = this.backgroundTemplate.value.match(/#[a-fA-F0-9]{6}/g);
       if (colorMatches && colorMatches.length >= 2) {
         gradient.addColorStop(0, colorMatches[0]);
         gradient.addColorStop(1, colorMatches[colorMatches.length - 1]);
       } else {
         gradient.addColorStop(0, '#667eea');
         gradient.addColorStop(1, '#764ba2');
       }
       
       ctx.fillStyle = gradient;
       ctx.fillRect(0, 0, width, height);
         } else if (this.backgroundTemplate.type === 'image' && this.backgroundImage) {
      // Draw background image with scale effect and proper aspect ratio
      // Always use 'contain' mode to show full image, then apply scale as zoom multiplier
      
      // First calculate how to fit the image in canvas while preserving aspect ratio
      const baseFit = this.calculateAspectRatioFit(
        this.backgroundImage.width, 
        this.backgroundImage.height, 
        width, 
        height, 
        'contain'
      );
      
      // Apply scale effect to the properly fitted dimensions
      const scaledWidth = baseFit.drawWidth * scaleValue;
      const scaledHeight = baseFit.drawHeight * scaleValue;
      const offsetX = (width - scaledWidth) / 2;
      const offsetY = (height - scaledHeight) / 2;
      
      ctx.drawImage(this.backgroundImage, offsetX, offsetY, scaledWidth, scaledHeight);
    }
     
     ctx.restore();
   },

   // Draw in composition mode - background fixed, foreground movable
   drawCompositionMode() {
     console.log('🎨 Drawing in composition mode');
     
     // First draw canvas background (user's setting)
     this.drawCanvasBackground();
     
     // Then draw background layer (composition background)
     this.drawBackgroundLayer(this.ctx, this.canvas.width, this.canvas.height);
     
     // Draw grid if enabled
     if (this.showGrid) {
       this.drawGrid();
     }
     
     // Draw foreground (processed image) at current position and scale
     if (this.processedImage) {
       const imgWidth = this.processedImage.width * this.foregroundScale;
       const imgHeight = this.processedImage.height * this.foregroundScale;
       
       console.log('🖼️ Drawing foreground at:', this.foregroundX, this.foregroundY);
       console.log('📏 Foreground size:', imgWidth, 'x', imgHeight);
       
       this.ctx.drawImage(
         this.processedImage,
         this.foregroundX,
         this.foregroundY,
         imgWidth,
         imgHeight
       );
       
       // Draw foreground border for visibility
       this.ctx.save();
       this.ctx.strokeStyle = '#00ff00';
       this.ctx.lineWidth = 2;
       this.ctx.setLineDash([5, 5]);
       this.ctx.strokeRect(this.foregroundX, this.foregroundY, imgWidth, imgHeight);
       this.ctx.restore();
     }
     
     // Draw composition mode UI overlay
     this.drawCompositionUI();
   },

   // Draw composition mode UI elements
   drawCompositionUI() {
     this.ctx.save();
     
     // Draw composition mode indicator
     this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
     this.ctx.fillRect(10, 10, 250, 100);
     
     this.ctx.fillStyle = '#ffffff';
     this.ctx.font = '14px Arial';
     this.ctx.fillText('🎨 Composition Mode', 20, 30);
     this.ctx.fillText(`Scale: ${(this.foregroundScale * 100).toFixed(0)}%`, 20, 50);
     this.ctx.fillText(`Position: ${Math.round(this.foregroundX)}, ${Math.round(this.foregroundY)}`, 20, 70);
     
     // Add preview note
     this.ctx.fillStyle = '#22c55e';
     this.ctx.font = '11px Arial';
     this.ctx.fillText('📸 Final will be full resolution', 20, 90);
     
     this.ctx.restore();
   }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  CanvasManager.init();
});

console.log('🎨 Canvas script loaded'); 