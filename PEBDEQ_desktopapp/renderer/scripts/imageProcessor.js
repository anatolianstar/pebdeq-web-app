// Image Processing utilities for PEBDEQ Desktop Pro

const ImageProcessor = {
  // Canvas for image processing operations
  canvas: null,
  ctx: null,

  init() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    console.log('🖼️ Image Processor initialized');
  },

  // Load image from various sources
  async loadImage(source) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      
      if (typeof source === 'string') {
        img.src = source;
      } else if (source instanceof File) {
        img.src = URL.createObjectURL(source);
      } else {
        reject(new Error('Invalid image source'));
      }
    });
  },

  // Convert image to canvas
  imageToCanvas(image) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
    return canvas;
  },

  // Convert canvas to image
  canvasToImage(canvas) {
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = URL.createObjectURL(blob);
      });
    });
  },

  // Get image data from canvas
  getImageData(image) {
    this.canvas.width = image.width;
    this.canvas.height = image.height;
    this.ctx.drawImage(image, 0, 0);
    return this.ctx.getImageData(0, 0, image.width, image.height);
  },

  // Create image from image data
  createImageFromData(imageData) {
    this.canvas.width = imageData.width;
    this.canvas.height = imageData.height;
    this.ctx.putImageData(imageData, 0, 0);
    return this.canvasToImage(this.canvas);
  },

  // Resize image
  resizeImage(image, width, height, maintainAspect = true) {
    let newWidth = width;
    let newHeight = height;

    if (maintainAspect) {
      const aspectRatio = image.width / image.height;
      if (width / height > aspectRatio) {
        newWidth = height * aspectRatio;
      } else {
        newHeight = width / aspectRatio;
      }
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = newWidth;
    canvas.height = newHeight;

    // Use high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(image, 0, 0, newWidth, newHeight);

    return canvas;
  },

  // Crop image
  cropImage(image, x, y, width, height) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    return canvas;
  },

  // Rotate image
  rotateImage(image, angle) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const radians = (angle * Math.PI) / 180;
    const cos = Math.abs(Math.cos(radians));
    const sin = Math.abs(Math.sin(radians));
    
    canvas.width = image.width * cos + image.height * sin;
    canvas.height = image.width * sin + image.height * cos;
    
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(radians);
    ctx.drawImage(image, -image.width / 2, -image.height / 2);
    
    return canvas;
  },

  // Flip image
  flipImage(image, horizontal = false, vertical = false) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = image.width;
    canvas.height = image.height;
    
    ctx.save();
    ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1);
    ctx.drawImage(
      image,
      horizontal ? -image.width : 0,
      vertical ? -image.height : 0
    );
    ctx.restore();
    
    return canvas;
  },

  // Apply brightness filter
  adjustBrightness(imageData, brightness) {
    const data = imageData.data;
    const adjustment = brightness * 255;
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Utils.clamp(data[i] + adjustment, 0, 255);     // Red
      data[i + 1] = Utils.clamp(data[i + 1] + adjustment, 0, 255); // Green
      data[i + 2] = Utils.clamp(data[i + 2] + adjustment, 0, 255); // Blue
      // Alpha channel (data[i + 3]) remains unchanged
    }
    
    return imageData;
  },

  // Apply contrast filter
  adjustContrast(imageData, contrast) {
    const data = imageData.data;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Utils.clamp(factor * (data[i] - 128) + 128, 0, 255);     // Red
      data[i + 1] = Utils.clamp(factor * (data[i + 1] - 128) + 128, 0, 255); // Green
      data[i + 2] = Utils.clamp(factor * (data[i + 2] - 128) + 128, 0, 255); // Blue
    }
    
    return imageData;
  },

  // Apply saturation filter
  adjustSaturation(imageData, saturation) {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      const gray = 0.299 * r + 0.587 * g + 0.114 * b;
      
      data[i] = Utils.clamp(gray + saturation * (r - gray), 0, 255);
      data[i + 1] = Utils.clamp(gray + saturation * (g - gray), 0, 255);
      data[i + 2] = Utils.clamp(gray + saturation * (b - gray), 0, 255);
    }
    
    return imageData;
  },

  // Convert to grayscale
  toGrayscale(imageData) {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      data[i] = gray;     // Red
      data[i + 1] = gray; // Green
      data[i + 2] = gray; // Blue
    }
    
    return imageData;
  },

  // Apply sepia effect
  toSepia(imageData) {
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      data[i] = Utils.clamp((r * 0.393) + (g * 0.769) + (b * 0.189), 0, 255);
      data[i + 1] = Utils.clamp((r * 0.349) + (g * 0.686) + (b * 0.168), 0, 255);
      data[i + 2] = Utils.clamp((r * 0.272) + (g * 0.534) + (b * 0.131), 0, 255);
    }
    
    return imageData;
  },

  // Apply blur effect (simple box blur)
  applyBlur(imageData, radius = 1) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(data);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0;
        let count = 0;
        
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const index = (ny * width + nx) * 4;
              r += data[index];
              g += data[index + 1];
              b += data[index + 2];
              a += data[index + 3];
              count++;
            }
          }
        }
        
        const index = (y * width + x) * 4;
        output[index] = r / count;
        output[index + 1] = g / count;
        output[index + 2] = b / count;
        output[index + 3] = a / count;
      }
    }
    
    return new ImageData(output, width, height);
  },

  // Apply edge detection
  detectEdges(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new Uint8ClampedArray(data.length);
    
    // Sobel operator
    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let pixelX = 0, pixelY = 0;
        
        for (let i = 0; i < 9; i++) {
          const nx = x + (i % 3) - 1;
          const ny = y + Math.floor(i / 3) - 1;
          const index = (ny * width + nx) * 4;
          const gray = 0.299 * data[index] + 0.587 * data[index + 1] + 0.114 * data[index + 2];
          
          pixelX += gray * sobelX[i];
          pixelY += gray * sobelY[i];
        }
        
        const magnitude = Math.sqrt(pixelX * pixelX + pixelY * pixelY);
        const index = (y * width + x) * 4;
        
        output[index] = magnitude;     // Red
        output[index + 1] = magnitude; // Green
        output[index + 2] = magnitude; // Blue
        output[index + 3] = 255;       // Alpha
      }
    }
    
    return new ImageData(output, width, height);
  },

  // Create thumbnail
  createThumbnail(image, size = 150) {
    return this.resizeImage(image, size, size, true);
  },

  // Add watermark
  addWatermark(image, watermarkText, options = {}) {
    const canvas = this.imageToCanvas(image);
    const ctx = canvas.getContext('2d');
    
    const {
      fontSize = 24,
      color = 'rgba(255, 255, 255, 0.7)',
      position = 'bottom-right',
      margin = 20,
      fontFamily = 'Arial'
    } = options;
    
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'bottom';
    
    const metrics = ctx.measureText(watermarkText);
    const textWidth = metrics.width;
    const textHeight = fontSize;
    
    let x, y;
    switch (position) {
      case 'top-left':
        x = margin;
        y = margin + textHeight;
        break;
      case 'top-right':
        x = canvas.width - textWidth - margin;
        y = margin + textHeight;
        break;
      case 'bottom-left':
        x = margin;
        y = canvas.height - margin;
        break;
      case 'bottom-right':
      default:
        x = canvas.width - textWidth - margin;
        y = canvas.height - margin;
        break;
    }
    
    ctx.fillText(watermarkText, x, y);
    return canvas;
  },

  // Combine images (overlay)
  combineImages(baseImage, overlayImage, x = 0, y = 0, opacity = 1) {
    const canvas = this.imageToCanvas(baseImage);
    const ctx = canvas.getContext('2d');
    
    ctx.globalAlpha = opacity;
    ctx.drawImage(overlayImage, x, y);
    ctx.globalAlpha = 1;
    
    return canvas;
  },

  // Create background patterns
  createPatternBackground(width, height, patternType = 'checkerboard', options = {}) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    
    switch (patternType) {
      case 'checkerboard':
        const {
          size = 20,
          color1 = '#ffffff',
          color2 = '#f0f0f0'
        } = options;
        
        for (let x = 0; x < width; x += size) {
          for (let y = 0; y < height; y += size) {
            ctx.fillStyle = ((x / size + y / size) % 2 === 0) ? color1 : color2;
            ctx.fillRect(x, y, size, size);
          }
        }
        break;
        
      case 'gradient':
        const {
          direction = 'horizontal',
          startColor = '#ffffff',
          endColor = '#000000'
        } = options;
        
        const gradient = direction === 'horizontal' 
          ? ctx.createLinearGradient(0, 0, width, 0)
          : ctx.createLinearGradient(0, 0, 0, height);
        
        gradient.addColorStop(0, startColor);
        gradient.addColorStop(1, endColor);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        break;
        
      case 'solid':
      default:
        const { color = '#ffffff' } = options;
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);
        break;
    }
    
    return canvas;
  },

  // Get image histogram
  getHistogram(imageData) {
    const data = imageData.data;
    const histogram = {
      red: new Array(256).fill(0),
      green: new Array(256).fill(0),
      blue: new Array(256).fill(0),
      gray: new Array(256).fill(0)
    };
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      
      histogram.red[r]++;
      histogram.green[g]++;
      histogram.blue[b]++;
      histogram.gray[gray]++;
    }
    
    return histogram;
  }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  ImageProcessor.init();
});

// Export for global use
window.ImageProcessor = ImageProcessor;

console.log('🔧 Image Processor script loaded'); 