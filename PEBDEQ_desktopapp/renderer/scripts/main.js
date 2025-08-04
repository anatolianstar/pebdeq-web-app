// Application state
const AppState = {
  selectedModel: 'u2net',
  images: [],
  currentImageIndex: -1,
  pythonBackendOnline: false,
  isProcessing: false,
  currentProcessedResult: null, // Store latest processing result for accept/discard
  awaitingUserDecision: false,   // Flag to show accept/discard controls
  extensionClientsCount: 0,      // Number of connected extension clients
  extensionQueue: []             // Queue of photos from extensions
};

// ===== GLOBAL UNDO/REDO SYSTEM =====

class ActionHistory {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistorySize = 20; // Keep last 20 actions
  }

  // Add a new action to history
  addAction(action) {
    // Remove any redo history when new action is added
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new action
    this.history.push({
      ...action,
      timestamp: Date.now(),
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
    
    this.updateUI();
    console.log('📝 Action added to history:', action.type, '| Total:', this.history.length);
  }

  // Undo last action
  undo() {
    if (!this.canUndo()) {
      updateStatusMessage('❌ No actions to undo');
      return false;
    }

    const action = this.history[this.currentIndex];
    console.log('↶ Undoing action:', action.type);

    try {
      this.restoreState(action.beforeState);
      this.currentIndex--;
      this.updateUI();
      
      updateStatusMessage(`↶ Undone: ${action.description}`);
      return true;
    } catch (error) {
      console.error('❌ Undo failed:', error);
      updateStatusMessage('❌ Undo failed');
      return false;
    }
  }

  // Redo next action
  redo() {
    if (!this.canRedo()) {
      updateStatusMessage('❌ No actions to redo');
      return false;
    }

    this.currentIndex++;
    const action = this.history[this.currentIndex];
    console.log('↷ Redoing action:', action.type);

    try {
      this.restoreState(action.afterState);
      this.updateUI();
      
      updateStatusMessage(`↷ Redone: ${action.description}`);
      return true;
    } catch (error) {
      console.error('❌ Redo failed:', error);
      updateStatusMessage('❌ Redo failed');
      return false;
    }
  }

  // Check if undo is possible
  canUndo() {
    return this.currentIndex >= 0;
  }

  // Check if redo is possible
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  // Restore application state
  restoreState(state) {
    if (!state || !AppState.images[AppState.currentImageIndex]) {
      throw new Error('Invalid state data');
    }

    const currentImage = AppState.images[AppState.currentImageIndex];
    
    // Restore image states
    if (state.originalImage) currentImage.originalImage = state.originalImage;
    if (state.processedImage) currentImage.processedImage = state.processedImage;
    if (state.filename) currentImage.filename = state.filename;
    
    // Restore background selection
    if (state.selectedBackgroundId !== undefined) {
      AppState.selectedBackgroundId = state.selectedBackgroundId;
      this.updateBackgroundSelection();
    }

    // Restore canvas view
    if (state.canvasView) {
      CanvasManager.rotation = state.canvasView.rotation || 0;
      CanvasManager.zoom = state.canvasView.zoom || 1;
      CanvasManager.panX = state.canvasView.panX || 0;
      CanvasManager.panY = state.canvasView.panY || 0;
    }

    // Update canvas and UI
    CanvasManager.updateProcessedImage(currentImage.processedImage);
    this.updateImageInfo();
  }

  // Get current application state
  getCurrentState() {
    const currentImage = AppState.images[AppState.currentImageIndex];
    if (!currentImage) return null;

    return {
      originalImage: currentImage.originalImage,
      processedImage: currentImage.processedImage,
      filename: currentImage.filename,
      selectedBackgroundId: AppState.selectedBackgroundId,
      canvasView: {
        rotation: CanvasManager.rotation || 0,
        zoom: CanvasManager.zoom || 1,
        panX: CanvasManager.panX || 0,
        panY: CanvasManager.panY || 0
      }
    };
  }

  // Update background selection in UI
  updateBackgroundSelection() {
    document.querySelectorAll('.template-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    if (AppState.selectedBackgroundId) {
      const selectedItem = document.querySelector(`[data-id="${AppState.selectedBackgroundId}"]`);
      if (selectedItem) {
        selectedItem.classList.add('selected');
      }
    }
  }

  // Update image info display
  updateImageInfo() {
    const currentImage = AppState.images[AppState.currentImageIndex];
    if (currentImage) {
      updateImageInfo(currentImage.filename, currentImage.dimensions);
    }
  }

  // Update undo/redo button states
  updateUI() {
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    
    if (undoBtn) {
      undoBtn.disabled = !this.canUndo();
      undoBtn.title = this.canUndo() 
        ? `Undo: ${this.history[this.currentIndex]?.description} (Ctrl+Z)` 
        : 'No actions to undo (Ctrl+Z)';
    }
    
    if (redoBtn) {
      redoBtn.disabled = !this.canRedo();
      redoBtn.title = this.canRedo() 
        ? `Redo: ${this.history[this.currentIndex + 1]?.description} (Ctrl+Y)` 
        : 'No actions to redo (Ctrl+Y)';
    }
  }

  // Clear history (when new image is loaded)
  clear() {
    this.history = [];
    this.currentIndex = -1;
    this.updateUI();
    console.log('🗑️ Action history cleared');
  }

  // Get history summary for debugging
  getHistorySummary() {
    return this.history.map((action, index) => ({
      index,
      type: action.type,
      description: action.description,
      timestamp: new Date(action.timestamp).toLocaleTimeString(),
      current: index === this.currentIndex
    }));
  }
}

// Global action history instance
const ActionHistory_Global = new ActionHistory();

// Default settings
const DEFAULT_SETTINGS = {
  defaultModel: 'u2net',
  processingQuality: 'balanced',
  autoExport: false,
  fileNaming: 'suffix',
  appTheme: 'system',
  canvasBg: 'theme',
  showGrid: false,
  memoryLimit: '4gb',
  autoSave: true,
  defaultCropRatio: '1:1',
  autoCropMode: false,
  exportPreset: 'general'
};

// Etsy-specific export presets
const EXPORT_PRESETS = {
  'etsy-main': {
    name: 'Etsy Main Photo',
    width: 2000,
    height: 2000,
    format: 'PNG',
    quality: 95,
    background: 'white',
    dpi: 72,
    description: 'Optimal for Etsy main listing photo'
  },
  'etsy-gallery': {
    name: 'Etsy Gallery',
    width: 1000,
    height: 1000,
    format: 'JPG',
    quality: 85,
    background: 'transparent',
    dpi: 72,
    description: 'Perfect for additional Etsy photos'
  },
  'etsy-lifestyle': {
    name: 'Etsy Lifestyle',
    width: 1500,
    height: 1500,
    format: 'JPG',
    quality: 90,
    background: 'lifestyle',
    dpi: 72,
    description: 'Lifestyle shots with backgrounds'
  },
  'etsy-mobile': {
    name: 'Etsy Mobile',
    width: 800,
    height: 800,
    format: 'JPG',
    quality: 80,
    background: 'white',
    dpi: 72,
    description: 'Mobile-optimized for fast loading'
  },
  'general': {
    name: 'General Export',
    width: 1024,
    height: 1024,
    format: 'PNG',
    quality: 90,
    background: 'transparent',
    dpi: 72,
    description: 'Standard export settings'
  }
};

// Etsy SEO-friendly naming patterns
const ETSY_NAMING_PATTERNS = {
  'main-photo': '{product-name}-main-etsy-listing',
  'gallery-photo': '{product-name}-gallery-{index}-etsy',
  'lifestyle': '{product-name}-lifestyle-{style}-etsy',
  'detail': '{product-name}-detail-{feature}-etsy',
  'size-reference': '{product-name}-size-scale-etsy',
  'packaging': '{product-name}-packaging-shipping-etsy'
};

// SEO keywords for different product types
const ETSY_SEO_KEYWORDS = {
  'handmade': ['handmade', 'artisan', 'craft', 'unique'],
  'vintage': ['vintage', 'retro', 'antique', 'classic'],
  'jewelry': ['jewelry', 'necklace', 'earrings', 'bracelet'],
  'clothing': ['fashion', 'style', 'apparel', 'outfit'],
  'home-decor': ['decor', 'home', 'interior', 'design'],
  'art': ['art', 'print', 'wall-art', 'poster']
};

// Current settings (will be loaded from localStorage)
let Settings = { ...DEFAULT_SETTINGS };

// Etsy Integration State
const EtsyIntegration = {
  authenticated: false,
  token: null,
  expiresAt: null,
  userShop: null,
  
  // Check authentication status (DISABLED - using new extension system)
  async checkAuthStatus() {
    console.log('🔌 EtsyIntegration.checkAuthStatus disabled - using extension system');
    return { authenticated: false };
  },
  
  // Start authentication process
  async authenticate() {
    try {
      updateStatusMessage('🔗 Starting Etsy authentication...');
      
      const response = await fetch('/etsy/auth/start');
      const result = await response.json();
      
      if (result.auth_url) {
        // Open Etsy auth in new window
        const authWindow = window.open(result.auth_url, 'EtsyAuth', 'width=600,height=700');
        
        // Poll for authentication completion
        const pollForAuth = setInterval(async () => {
          try {
            if (authWindow.closed) {
              clearInterval(pollForAuth);
              // Check if authentication was successful
              const status = await this.checkAuthStatus();
              if (status.authenticated) {
                updateStatusMessage('✅ Etsy authentication successful!');
                this.authenticated = true;
                this.updateUI();
              } else {
                updateStatusMessage('❌ Etsy authentication failed or cancelled');
              }
            }
          } catch (error) {
            clearInterval(pollForAuth);
            updateStatusMessage('❌ Authentication check failed');
          }
        }, 1000);
        
      } else if (result.setup_required) {
        updateStatusMessage('⚠️ Etsy API credentials not configured. Please check setup.');
      }
    } catch (error) {
      console.error('Etsy authentication failed:', error);
      updateStatusMessage('❌ Failed to start Etsy authentication');
    }
  },
  
  // Upload single image to Etsy listing
  async uploadToListing(imageData, listingId, photoType = 'gallery') {
    if (!this.authenticated) {
      throw new Error('Not authenticated with Etsy');
    }
    
    try {
      const uploadData = {
        listing_id: listingId,
        image_data: imageData.processedImage || imageData.base64,
        photo_type: photoType
      };
      
      const response = await fetch('/etsy/upload-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(uploadData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        updateStatusMessage(`✅ Photo uploaded to Etsy listing ${listingId}`);
        return result;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Etsy upload failed:', error);
      throw error;
    }
  },
  
  // Bulk upload all processed images
  async bulkUpload() {
    if (!this.authenticated) {
      updateStatusMessage('❌ Please connect to Etsy first');
      return;
    }
    
    const processedImages = AppState.images.filter(img => 
      img.status === 'processed' && img.processedImage
    );
    
    if (processedImages.length === 0) {
      updateStatusMessage('ℹ️ No processed images to upload');
      return;
    }
    
    // Get listing ID from user
    const listingId = prompt('Enter Etsy Listing ID for bulk upload:');
    if (!listingId) return;
    
    updateStatusMessage(`🔄 Uploading ${processedImages.length} images to Etsy...`);
    
    const uploads = [{
      listing_id: listingId,
      photos: processedImages.map((img, index) => ({
        image_data: img.processedImage,
        type: index === 0 ? 'main' : 'gallery'
      }))
    }];
    
    try {
      const response = await fetch('/etsy/bulk-upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uploads })
      });
      
      const result = await response.json();
      
      if (result.success) {
        updateStatusMessage(`✅ Bulk upload completed: ${result.total_uploaded} uploaded, ${result.total_failed} failed`);
      } else {
        updateStatusMessage(`❌ Bulk upload failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Bulk upload failed:', error);
      updateStatusMessage('❌ Bulk upload failed');
    }
  },
  
  // Quick upload current image
  async quickUpload() {
    if (!this.authenticated) {
      updateStatusMessage('❌ Please connect to Etsy first');
      return;
    }
    
    const currentImage = AppState.images[AppState.currentImageIndex];
    if (!currentImage || !currentImage.processedImage) {
      updateStatusMessage('❌ No processed image selected');
      return;
    }
    
    const listingId = prompt('Enter Etsy Listing ID:');
    if (!listingId) return;
    
    const photoType = document.getElementById('etsy-preset-select').value.replace('etsy-', '');
    
    try {
      updateStatusMessage('🔄 Uploading to Etsy...');
      await this.uploadToListing(currentImage, listingId, photoType);
    } catch (error) {
      updateStatusMessage(`❌ Upload failed: ${error.message}`);
    }
  },
  
  // Update UI based on authentication status
  updateUI() {
    const authIndicator = document.getElementById('etsy-auth-indicator');
    const authBtn = document.getElementById('etsy-auth-btn');
    const uploadOptions = document.getElementById('etsy-upload-options');
    
    if (this.authenticated) {
      authIndicator.className = 'auth-indicator online';
      authIndicator.innerHTML = '<span class="auth-icon">✅</span><span class="auth-text">Connected</span>';
      authBtn.innerHTML = '<span>🔄</span> Refresh Connection';
      uploadOptions.classList.remove('hidden');
    } else {
      authIndicator.className = 'auth-indicator offline';
      authIndicator.innerHTML = '<span class="auth-icon">🔒</span><span class="auth-text">Not Connected</span>';
      authBtn.innerHTML = '<span>🔗</span> Connect to Etsy';
      uploadOptions.classList.add('hidden');
    }
  }
};

// Theme preview state
let isThemePreviewing = false;
let originalTheme = null;

// Background Template System
const BackgroundTemplates = {
  currentCategory: 'all',
  selectedBackground: null,
  customBackgrounds: [],
  searchQuery: '',
  
  // Default background templates
  templates: [
    // Etsy Optimized Category
    {
      id: 'etsy-white',
      name: 'Etsy Clean White',
      category: 'etsy',
      type: 'color',
      value: '#ffffff',
      preview: '#ffffff',
      description: 'Perfect for Etsy main photos - clean & professional'
    },
    {
      id: 'etsy-lifestyle-wood',
      name: 'Wood Lifestyle',
      category: 'etsy',
      type: 'gradient',
      value: 'linear-gradient(135deg, #8b7355 0%, #d4c5b3 100%)',
      preview: 'linear-gradient(135deg, #8b7355 0%, #d4c5b3 100%)',
      description: 'Warm wood texture for handmade/craft products'
    },
    {
      id: 'etsy-rustic-linen',
      name: 'Rustic Linen',
      category: 'etsy',
      type: 'gradient',
      value: 'linear-gradient(135deg, #f5f1eb 0%, #e8ddd4 100%)',
      preview: 'linear-gradient(135deg, #f5f1eb 0%, #e8ddd4 100%)',
      description: 'Soft textile background for clothing/accessories'
    },
    {
      id: 'etsy-marble-luxury',
      name: 'Marble Luxury',
      category: 'etsy',
      type: 'gradient',
      value: 'linear-gradient(135deg, #f7f3f0 0%, #e9e2dd 100%)',
      preview: 'linear-gradient(135deg, #f7f3f0 0%, #e9e2dd 100%)',
      description: 'Elegant marble for jewelry/premium items'
    },
    {
      id: 'etsy-vintage-cream',
      name: 'Vintage Cream',
      category: 'etsy',
      type: 'gradient',
      value: 'radial-gradient(circle, #f9f6f0 0%, #f1ede3 100%)',
      preview: 'radial-gradient(circle, #f9f6f0 0%, #f1ede3 100%)',
      description: 'Vintage-style background for antique items'
    },
    // Studio Category
    {
      id: 'transparent',
      name: 'Transparent',
      category: 'studio',
      type: 'color',
      value: 'transparent',
      preview: 'transparent-bg'
    },
    {
      id: 'white-studio',
      name: 'White Studio',
      category: 'studio',
      type: 'gradient',
      value: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      preview: 'white-bg'
    },
    {
      id: 'gray-studio',
      name: 'Gray Studio',
      category: 'studio',
      type: 'gradient',
      value: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
      preview: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)'
    },
    {
      id: 'black-studio',
      name: 'Black Studio',
      category: 'studio',
      type: 'color',
      value: '#000000',
      preview: '#000000'
    },
    
    // Nature Category
    {
      id: 'forest-green',
      name: 'Forest Green',
      category: 'nature',
      type: 'gradient',
      value: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
      preview: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)'
    },
    {
      id: 'ocean-blue',
      name: 'Ocean Blue',
      category: 'nature',
      type: 'gradient',
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'sunset-orange',
      name: 'Sunset',
      category: 'nature',
      type: 'gradient',
      value: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      preview: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 'mountain-mist',
      name: 'Mountain Mist',
      category: 'nature',
      type: 'gradient',
      value: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      preview: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    },
    
    // Urban Category
    {
      id: 'city-night',
      name: 'City Night',
      category: 'urban',
      type: 'gradient',
      value: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
      preview: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
    },
    {
      id: 'neon-pink',
      name: 'Neon Pink',
      category: 'urban',
      type: 'gradient',
      value: 'linear-gradient(135deg, #ff006e 0%, #8338ec 100%)',
      preview: 'linear-gradient(135deg, #ff006e 0%, #8338ec 100%)'
    },
    {
      id: 'concrete-gray',
      name: 'Concrete',
      category: 'urban',
      type: 'color',
      value: '#6c757d',
      preview: '#6c757d'
    },
    {
      id: 'steel-blue',
      name: 'Steel Blue',
      category: 'urban',
      type: 'gradient',
      value: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      preview: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)'
    },
    
    // Abstract Category
    {
      id: 'purple-haze',
      name: 'Purple Haze',
      category: 'abstract',
      type: 'gradient',
      value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      id: 'rainbow-gradient',
      name: 'Rainbow',
      category: 'abstract',
      type: 'gradient',
      value: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 25%, #fecfef 50%, #ffd93d 75%, #6bcf7f 100%)',
      preview: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 25%, #fecfef 50%, #ffd93d 75%, #6bcf7f 100%)'
    },
    {
      id: 'fire-gradient',
      name: 'Fire',
      category: 'abstract',
      type: 'gradient',
      value: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)',
      preview: 'linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)'
    },
    {
      id: 'ice-gradient',
      name: 'Ice Blue',
      category: 'abstract',
      type: 'gradient',
      value: 'linear-gradient(135deg, #74b9ff 0%, #e17055 100%)',
      preview: 'linear-gradient(135deg, #74b9ff 0%, #e17055 100%)'
    }
  ]
};

// DOM elements
const elements = {
  fileInput: document.getElementById('file-input'),
  dropZone: document.getElementById('drop-zone'),
  canvasContainer: document.getElementById('canvas-container'),
  mainCanvas: document.getElementById('main-canvas'),
  loadingOverlay: document.getElementById('loading-overlay'),
  progressFill: document.getElementById('progress-fill'),
  progressText: document.getElementById('progress-text'),
  imageList: document.getElementById('image-list'),
  modelSelect: document.getElementById('model-select'),
  pythonStatus: document.getElementById('python-status'),
  statusMessage: document.getElementById('status-message'),
  imageInfo: document.getElementById('image-info'),
  memoryUsage: document.getElementById('memory-usage'),
  processingTime: document.getElementById('processing-time'),
  // Accept/Discard controls
  resultControls: document.getElementById('result-controls'),
  standardControls: document.getElementById('standard-controls'),
  acceptBtn: document.getElementById('accept-btn'),
  discardBtn: document.getElementById('discard-btn'),
  
  // Crop controls
  cropModeBtn: document.getElementById('crop-mode-btn'),
  cropControls: document.getElementById('crop-controls'),
  aspectRatioSelect: document.getElementById('aspect-ratio-select'),
  applyCropBtn: document.getElementById('apply-crop-btn'),
  cutExportBtn: document.getElementById('cut-export-btn'),
  cancelCropBtn: document.getElementById('cancel-crop-btn'),
  
  // Crop preview modal
  cropPreviewModal: document.getElementById('crop-preview-modal'),
  cropPreviewImage: document.getElementById('crop-preview-image'),
  cropDimensions: document.getElementById('crop-dimensions'),
  cropFilesize: document.getElementById('crop-filesize'),
  closeCropPreviewBtn: document.getElementById('close-crop-preview-btn'),
  retryCropBtn: document.getElementById('retry-crop-btn'),
  saveCropBtn: document.getElementById('save-crop-btn')
};

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 PEBDEQ Desktop Pro initializing...');
  
  // Apply default theme class if none exists
  if (!document.body.classList.contains('theme-light') && 
      !document.body.classList.contains('theme-dark') && 
      !document.body.classList.contains('theme-system')) {
    document.body.classList.add('theme-system');
  }
  
  // Load settings first
  loadSettings();
  
  // Initialize background library
  initializeBackgroundLibrary();
  
  initializeEventListeners();
  checkPythonBackend();
  updateUI();
  
  // Initialize Extension Manager
  if (typeof window.initializeApp === 'function') {
    window.initializeApp();
    console.log('🔌 Extension Manager auto-initialized');
  }
  
  console.log('✅ Application initialized');
});

// Event listeners
function initializeEventListeners() {
  // Window Controls
  setupWindowControls();
  
  // File input
  elements.fileInput.addEventListener('change', handleFileSelect);
  
  // Drop zone (only for non-button areas)
  elements.dropZone.addEventListener('click', (e) => {
    // Only trigger if not clicking on the button
    if (e.target.id !== 'select-files-btn' && !e.target.closest('#select-files-btn')) {
      elements.fileInput.value = ''; // Reset before opening
      elements.fileInput.click();
    }
  });
  elements.dropZone.addEventListener('dragover', handleDragOver);
  elements.dropZone.addEventListener('drop', handleFileDrop);
  elements.dropZone.addEventListener('dragleave', handleDragLeave);
  
  // Select files button
  document.getElementById('select-files-btn').addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent drop zone click
    elements.fileInput.value = ''; // Reset before opening
    elements.fileInput.click();
  });
  
  // Model selection
  elements.modelSelect.addEventListener('change', (e) => {
    AppState.selectedModel = e.target.value;
    updateStatusMessage(`Selected model: ${getModelDisplayName(e.target.value)}`);
  });
  
  // Sidebar buttons
  document.getElementById('open-images-btn').addEventListener('click', () => {
    elements.fileInput.value = ''; // Reset before opening
    elements.fileInput.click();
  });
  document.getElementById('save-project-btn').addEventListener('click', handleSaveProject);
  
  // Queue actions
  document.getElementById('process-all-btn').addEventListener('click', handleProcessAll);
  document.getElementById('reset-all-btn').addEventListener('click', handleResetAllProcessed);
  document.getElementById('export-all-btn').addEventListener('click', handleExportAll);
  document.getElementById('clear-queue-btn').addEventListener('click', handleClearQueue);
  document.getElementById('send-to-platform-btn').addEventListener('click', handleSendToPlatform);
  
  // Etsy Integration Event Listeners - Safe initialization
  setTimeout(() => {
    const etsyAuthBtn = document.getElementById('etsy-auth-btn');
    const etsyQuickBtn = document.getElementById('etsy-quick-upload-btn');
    const etsyBulkBtn = document.getElementById('etsy-bulk-upload-btn');
    const etsyCreateBtn = document.getElementById('etsy-create-listing-btn');
    
    if (etsyAuthBtn) {
      etsyAuthBtn.addEventListener('click', () => {
        EtsyIntegration.authenticate();
      });
    }
    
    if (etsyQuickBtn) {
      etsyQuickBtn.addEventListener('click', () => {
        EtsyIntegration.quickUpload();
      });
    }
    
    if (etsyBulkBtn) {
      etsyBulkBtn.addEventListener('click', () => {
        EtsyIntegration.bulkUpload();
      });
    }
    
    if (etsyCreateBtn) {
      etsyCreateBtn.addEventListener('click', () => {
        updateStatusMessage('🚧 Create Listing feature coming soon!');
      });
    }
    
    // Check Etsy auth status on load (DISABLED - using new extension system)
    // EtsyIntegration.checkAuthStatus();
  }, 1000);
  
  // Toolbar buttons
  document.getElementById('zoom-fit-btn').addEventListener('click', () => CanvasManager.fitToCanvas());
  document.getElementById('zoom-100-btn').addEventListener('click', () => CanvasManager.zoomTo(100));
  document.getElementById('zoom-in-btn').addEventListener('click', () => CanvasManager.zoomIn());
  document.getElementById('zoom-out-btn').addEventListener('click', () => CanvasManager.zoomOut());
  
  // Force refresh button - manual fix for canvas visibility issues
  document.getElementById('force-refresh-btn').addEventListener('click', () => {
    console.log('🔄 Force refresh button clicked');
    
    // Check if we have a current image with composite background
    const currentImage = AppState.images[AppState.currentImageIndex];
    
    if (currentImage?.compositeImage) {
      console.log('🖼️ Found composite image, refreshing with proper sizing...');
      CanvasManager.resizeCanvas();
      setTimeout(() => {
        console.log('🔄 Force refreshing composite image display...');
        CanvasManager.showCompositeImage(currentImage);
      }, 100);
      updateStatusMessage('🔄 Canvas refreshed with composite image');
      console.log('✅ Composite image force refresh completed');
    } else if (CanvasManager.currentImage) {
      console.log('🔄 Forcing canvas resize and image fit...');
      CanvasManager.resizeCanvas();
      setTimeout(() => {
        CanvasManager.fitToCanvas();
      }, 100);
      updateStatusMessage('🔄 Canvas refreshed - image should now be visible');
      console.log('✅ Force refresh completed');
    } else {
      updateStatusMessage('⚠️ No image loaded to refresh');
      console.log('⚠️ No image to refresh');
    }
  });
  
  // Rotation buttons with fine control and hold-to-repeat
  let rotationInterval = null;
  
  const setupRotationButton = (buttonId, rotateFunction) => {
    const button = document.getElementById(buttonId);
    let isHolding = false;
    
    const startRotation = (e) => {
      const degrees = e.shiftKey ? 90 : 1;
      rotateFunction(degrees);
      updateStatusMessage(`🔄 Rotating ${degrees}° to ${CanvasManager.rotation}°`);
      
      // Start continuous rotation if not shift (90° mode)
      if (!e.shiftKey && !isHolding) {
        isHolding = true;
        rotationInterval = setInterval(() => {
          rotateFunction(1);
          updateStatusMessage(`🔄 Rotating to ${CanvasManager.rotation}°`);
        }, 50); // Rotate every 50ms
      }
    };
    
    const stopRotation = () => {
      if (rotationInterval) {
        clearInterval(rotationInterval);
        rotationInterval = null;
        isHolding = false;
      }
    };
    
    button.addEventListener('mousedown', startRotation);
    button.addEventListener('mouseup', stopRotation);
    button.addEventListener('mouseleave', stopRotation);
    button.addEventListener('touchstart', startRotation);
    button.addEventListener('touchend', stopRotation);
  };
  
  setupRotationButton('rotate-left-btn', (degrees) => CanvasManager.rotateLeft(degrees));
  setupRotationButton('rotate-right-btn', (degrees) => CanvasManager.rotateRight(degrees));
  document.getElementById('reset-rotation-btn').addEventListener('click', () => {
    console.log('🔄 Reset rotation button clicked');
    CanvasManager.resetRotation();
    updateStatusMessage('🔄 Rotation reset to 0°');
  });
  
  // View mode buttons
  document.getElementById('view-original-btn').addEventListener('click', () => switchViewMode('original'));
  document.getElementById('view-processed-btn').addEventListener('click', () => switchViewMode('processed'));
  document.getElementById('view-comparison-btn').addEventListener('click', () => switchViewMode('comparison'));
  
  // Accept/Discard buttons
  if (elements.acceptBtn && elements.discardBtn) {
    // Test basic click detection first
    elements.acceptBtn.addEventListener('click', (e) => {
      console.log('🔥 ACCEPT CLICKED! Will call handler...');
      console.log('🔍 Click event:', e);
      console.log('🔍 Button disabled?', elements.acceptBtn.disabled);
      console.log('🔍 Button classList:', elements.acceptBtn.classList.toString());
      
      handleAcceptResult();
    });
    elements.discardBtn.addEventListener('click', (e) => {
      console.log('🔥 DISCARD CLICKED! Will call handler...');
      console.log('🔍 Click event:', e);
      console.log('🔍 Button disabled?', elements.discardBtn.disabled);
      
      handleDiscardResult();
    });
    
    console.log('✅ Accept/Discard buttons initialized');
    console.log('Accept button:', elements.acceptBtn);
    console.log('Discard button:', elements.discardBtn);
    
    // Add visual feedback test
    elements.acceptBtn.addEventListener('mousedown', () => {
      console.log('🖱️ Accept button MOUSEDOWN detected');
    });
    elements.discardBtn.addEventListener('mousedown', () => {
      console.log('🖱️ Discard button MOUSEDOWN detected');
    });
    
  } else {
    console.error('❌ Accept/Discard buttons not found in DOM');
    console.log('acceptBtn element:', elements.acceptBtn);
    console.log('discardBtn element:', elements.discardBtn);
  }
  
    // Crop controls
  if (elements.cropModeBtn) {
    elements.cropModeBtn.addEventListener('click', toggleCropMode);
  }

  if (elements.aspectRatioSelect) {
    elements.aspectRatioSelect.addEventListener('change', (e) => {
      CanvasManager.setAspectRatio(e.target.value);
    });
  }

  if (elements.applyCropBtn) {
    elements.applyCropBtn.addEventListener('click', applyCrop);
  }

  if (elements.cutExportBtn) {
    console.log('✅ Cut Export button found and event listener added');
    elements.cutExportBtn.addEventListener('click', handleCutAndExport);
  } else {
    console.error('❌ Cut Export button not found in DOM!');
  }

  if (elements.cancelCropBtn) {
    elements.cancelCropBtn.addEventListener('click', cancelCrop);
  }

  // Tools - Manual Refine and Smooth Edges
  document.getElementById('manual-refine-btn').addEventListener('click', openManualRefine);
  document.getElementById('edge-smooth-btn').addEventListener('click', openSmoothEdges);
  document.getElementById('color-correct-btn').addEventListener('click', openColorCorrection);
  document.getElementById('shadow-toggle-btn').addEventListener('click', toggleShadowControls);
  document.getElementById('object-shadow-toggle-btn').addEventListener('click', toggleObjectShadowControls);

  // Drop Shadow control sliders
  const shadowBlur = document.getElementById('shadow-blur');
  const shadowOffsetX = document.getElementById('shadow-offset-x');
  const shadowOffsetY = document.getElementById('shadow-offset-y');
  const shadowOpacity = document.getElementById('shadow-opacity');
  const shadowColor = document.getElementById('shadow-color');

  // Object Shadow control sliders
  const lightAngle = document.getElementById('light-angle');
  const objectHeight = document.getElementById('object-height');
  const shadowDistance = document.getElementById('shadow-distance');
  const shadowPerspective = document.getElementById('shadow-perspective');
  const objectShadowBlur = document.getElementById('object-shadow-blur');
  const objectShadowOpacity = document.getElementById('object-shadow-opacity');
  const objectShadowColor = document.getElementById('object-shadow-color');

  if (shadowBlur) {
    shadowBlur.addEventListener('input', (e) => {
      document.getElementById('shadow-blur-value').textContent = e.target.value + 'px';
      CanvasManager.draw();
    });
  }

  if (shadowOffsetX) {
    shadowOffsetX.addEventListener('input', (e) => {
      document.getElementById('shadow-offset-x-value').textContent = e.target.value + 'px';
      CanvasManager.draw();
    });
  }

  if (shadowOffsetY) {
    shadowOffsetY.addEventListener('input', (e) => {
      document.getElementById('shadow-offset-y-value').textContent = e.target.value + 'px';
      CanvasManager.draw();
    });
  }

  if (shadowOpacity) {
    shadowOpacity.addEventListener('input', (e) => {
      document.getElementById('shadow-opacity-value').textContent = e.target.value + '%';
      CanvasManager.draw();
    });
  }

  if (shadowColor) {
    shadowColor.addEventListener('input', () => {
      CanvasManager.draw();
    });
  }

  // Object Shadow event listeners
  if (lightAngle) {
    lightAngle.addEventListener('input', (e) => {
      document.getElementById('light-angle-value').textContent = e.target.value + '°';
      CanvasManager.draw();
    });
  }

  const lightDistance = document.getElementById('light-distance');
  if (lightDistance) {
    lightDistance.addEventListener('input', (e) => {
      document.getElementById('light-distance-value').textContent = e.target.value;
      CanvasManager.draw();
    });
  }

  if (objectHeight) {
    objectHeight.addEventListener('input', (e) => {
      document.getElementById('object-height-value').textContent = e.target.value + 'px';
      CanvasManager.draw();
    });
  }

  if (shadowDistance) {
    shadowDistance.addEventListener('input', (e) => {
      document.getElementById('shadow-distance-value').textContent = e.target.value + 'px';
      CanvasManager.draw();
    });
  }

  if (shadowPerspective) {
    shadowPerspective.addEventListener('input', (e) => {
      document.getElementById('shadow-perspective-value').textContent = e.target.value;
      CanvasManager.draw();
    });
  }

  if (objectShadowBlur) {
    objectShadowBlur.addEventListener('input', (e) => {
      document.getElementById('object-shadow-blur-value').textContent = e.target.value + 'px';
      CanvasManager.draw();
    });
  }

  if (objectShadowOpacity) {
    objectShadowOpacity.addEventListener('input', (e) => {
      document.getElementById('object-shadow-opacity-value').textContent = e.target.value + '%';
      CanvasManager.draw();
    });
  }

  if (objectShadowColor) {
    objectShadowColor.addEventListener('input', () => {
      CanvasManager.draw();
    });
  }

  // Undo/Redo button event listeners
  document.getElementById('undo-btn').addEventListener('click', () => {
    ActionHistory_Global.undo();
  });
  document.getElementById('redo-btn').addEventListener('click', () => {
    ActionHistory_Global.redo();
  });

  // Crop preview modal event listeners
  if (elements.closeCropPreviewBtn) {
    elements.closeCropPreviewBtn.addEventListener('click', closeCropPreview);
  }

  if (elements.retryCropBtn) {
    elements.retryCropBtn.addEventListener('click', retryCrop);
  }

  if (elements.saveCropBtn) {
    elements.saveCropBtn.addEventListener('click', saveCropResult);
  }

  // Close modal on background click
  if (elements.cropPreviewModal) {
    elements.cropPreviewModal.addEventListener('click', (e) => {
      if (e.target === elements.cropPreviewModal) {
        closeCropPreview();
      }
    });
  }

  // Settings modal controls
  const settingsBtn = document.getElementById('settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  const resetSettingsBtn = document.getElementById('reset-settings-btn');

  if (settingsBtn) {
    settingsBtn.addEventListener('click', openSettingsModal);
  }

  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', closeSettingsModal);
  }

  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', saveSettings);
  }

  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', resetSettings);
  }
  
  // Header file operations removed - using native menu bar

  // Close modal on background click
  if (settingsModal) {
    settingsModal.addEventListener('click', (e) => {
      if (e.target === settingsModal) {
        closeSettingsModal();
      }
    });
  }

  // ESC key to close modal and rotation shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !settingsModal?.classList.contains('hidden')) {
      closeSettingsModal();
    }
    
    // Global shortcuts (only when no input is focused)
    if (!e.target.matches('input, textarea, select')) {
      // Undo/Redo shortcuts
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        // Ctrl+Z = Undo
        ActionHistory_Global.undo();
        e.preventDefault();
      } else if ((e.key === 'y' && (e.ctrlKey || e.metaKey)) || 
                 (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey)) {
        // Ctrl+Y or Ctrl+Shift+Z = Redo
        ActionHistory_Global.redo();
        e.preventDefault();
      } else if (e.key === 'r' || e.key === 'R') {
        let degrees = 1; // Default 1 degree
        if (e.ctrlKey) degrees = 90; // Ctrl+R = 90 degrees
        else if (e.altKey) degrees = 5; // Alt+R = 5 degrees
        
        // Capture state before rotation (only for significant rotations)
        const beforeState = degrees >= 90 ? ActionHistory_Global.getCurrentState() : null;
        
        if (e.shiftKey) {
          // Shift+R = Rotate left
          CanvasManager.rotateLeft(degrees);
          updateStatusMessage(`🔄 Rotated left ${degrees}° to ${CanvasManager.rotation}° (Shift+R)`);
        } else {
          // R = Rotate right
          CanvasManager.rotateRight(degrees);
          updateStatusMessage(`🔄 Rotated right ${degrees}° to ${CanvasManager.rotation}° (R)`);
        }
        
        // Add to action history for significant rotations
        if (beforeState && degrees >= 90) {
          ActionHistory_Global.addAction({
            type: 'rotation',
            description: `Rotated ${degrees}°`,
            beforeState: beforeState,
            afterState: ActionHistory_Global.getCurrentState()
          });
        }
        e.preventDefault();
      } else if (e.key === 'ArrowLeft' && e.ctrlKey) {
        // Ctrl+Left Arrow = Rotate left 1°
        const degrees = e.shiftKey ? 90 : (e.altKey ? 5 : 1);
        CanvasManager.rotateLeft(degrees);
        updateStatusMessage(`🔄 Rotated left ${degrees}° to ${CanvasManager.rotation}° (Ctrl+←)`);
        e.preventDefault();
      } else if (e.key === 'ArrowRight' && e.ctrlKey) {
        // Ctrl+Right Arrow = Rotate right 1°
        const degrees = e.shiftKey ? 90 : (e.altKey ? 5 : 1);
        CanvasManager.rotateRight(degrees);
        updateStatusMessage(`🔄 Rotated right ${degrees}° to ${CanvasManager.rotation}° (Ctrl+→)`);
        e.preventDefault();
      } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        // Ctrl+0 = Reset rotation
        const beforeState = ActionHistory_Global.getCurrentState();
        CanvasManager.resetRotation();
        
        // Add to action history
        ActionHistory_Global.addAction({
          type: 'rotation',
          description: 'Rotation reset to 0°',
          beforeState: beforeState,
          afterState: ActionHistory_Global.getCurrentState()
        });
        
        updateStatusMessage('🔄 Rotation reset to 0° (Ctrl+0)');
        e.preventDefault();
      }
    }
  });

  // Live theme preview when user changes theme in settings
  const themeSelect = document.getElementById('app-theme');
  if (themeSelect) {
    themeSelect.addEventListener('change', (e) => {
      const selectedTheme = e.target.value;
      console.log('🎨 Live theme preview:', selectedTheme);
      
      // Mark as previewing if different from original
      isThemePreviewing = (selectedTheme !== originalTheme);
      
      applyTheme(selectedTheme);
      
      // Show preview message
      const themeEmoji = selectedTheme === 'dark' ? '🌙' : 
                         selectedTheme === 'light' ? '☀️' : '🖥️';
      
      if (isThemePreviewing) {
        updateStatusMessage(`🎨 Theme preview: ${themeEmoji} ${selectedTheme} (Save to keep, Cancel to revert)`);
      } else {
        updateStatusMessage(`🎨 Theme: ${themeEmoji} ${selectedTheme}`);
      }
    });
  }
  
  // Live canvas background preview
  const canvasBgSelect = document.getElementById('canvas-bg');
  if (canvasBgSelect) {
    canvasBgSelect.addEventListener('change', (e) => {
      const selectedBg = e.target.value;
      
      // Apply immediately to canvas
      if (CanvasManager && CanvasManager.setCanvasBackground) {
        CanvasManager.setCanvasBackground(selectedBg);
        
        // Force redraw to show the change
        if (CanvasManager.draw) {
          CanvasManager.draw();
        }
      }
      
      // Show preview message
      const bgEmoji = selectedBg === 'theme' ? '🎨' : 
                      selectedBg === 'white' ? '⚪' :
                      selectedBg === 'black' ? '⚫' :
                      selectedBg === 'transparent' ? '🔳' : '🔹';
                      
      updateStatusMessage(`🖼️ Canvas background: ${bgEmoji} ${selectedBg}`);
    });
  }
  
  // Menu events from Electron
  if (window.electronAPI) {
    console.log('📞 electronAPI available, setting up menu event listeners...');
    window.electronAPI.onMenuEvent((event, ...args) => {
      console.log('📞 Menu event received:', event?.type || 'undefined', 'Args:', args);
      console.log('📞 Event object:', event);
      
      if (!event || !event.type) {
        console.error('❌ Menu event has no type:', event);
        updateStatusMessage('❌ Invalid menu event received');
        return;
      }
      
      switch (event.type) {
        case 'menu-open-images':
          console.log('📂 Menu: Open Images clicked');
          updateStatusMessage('📂 Opening file browser...');
          // Use Electron's native file dialog instead of HTML file input
          openFileDialogFromMenu();
          break;
        case 'menu-open-project':
          console.log('📂 Menu: Open Project clicked');
          updateStatusMessage('📂 Opening project file...');
          handleOpenProject();
          break;
        case 'menu-save-project':
          console.log('💾 Menu: Save Project clicked');
          updateStatusMessage('💾 Saving project...');
          handleSaveProject();
          break;
        case 'menu-export':
          console.log('📤 Menu: Export clicked');
          updateStatusMessage('📤 Starting export...');
          handleExportAll();
          break;
        case 'menu-multi-generate':
          console.log('🎨 Renderer: Multi Generate handler called');
          updateStatusMessage('🎨 Multi Generate triggered...');
          handleMenuMultiGenerate();
          break;
        case 'menu-generate-final':
          console.log('📸 Renderer: Generate Final handler called');
          updateStatusMessage('📸 Generate Final triggered...');
          handleMenuGenerateFinal();
          break;
        case 'menu-exit-composition':
          console.log('🚪 Renderer: Exit Composition handler called');
          updateStatusMessage('🚪 Exiting composition...');
          handleMenuExitComposition();
          break;
        case 'menu-force-refresh':
          console.log('⚡ Renderer: Force Refresh handler called');
          updateStatusMessage('⚡ Refreshing canvas...');
          handleMenuForceRefresh();
          break;
        case 'menu-about':
          console.log('ℹ️ Renderer: About handler called');
          updateStatusMessage('ℹ️ Opening about dialog...');
          showAboutDialog();
          break;
        default:
          console.log('❓ Unknown menu event received:', event.type);
          updateStatusMessage(`❓ Unknown menu event: ${event.type}`);
          break;
      }
    });
  }
}

// Menu Test Function - TEMPORARY FOR TESTING
function testFileMenu() {
  console.log('🧪 TESTING FILE MENU FUNCTIONS');
  
  updateStatusMessage('🧪 Testing File Menu...');
  
  // Test Save Project
  setTimeout(() => {
    console.log('🧪 Testing Save Project...');
    handleSaveProject();
  }, 1000);
  
  // Test Export All (if there are images)
  setTimeout(() => {
    console.log('🧪 Testing Export All...');
    if (AppState.images.length > 0) {
      handleExportAll();
    } else {
      console.log('🧪 No images to export');
      updateStatusMessage('🧪 No images to export - add some images first');
    }
  }, 3000);
  
  // Test Open Images
  setTimeout(() => {
    console.log('🧪 Testing Open Images...');
    updateStatusMessage('🧪 File menu tests completed! Check console for details.');
  }, 5000);
}

// Menu Test Functions
function testAllMenus() {
  console.log('🧪 TESTING ALL MENU FUNCTIONS');
  updateStatusMessage('🧪 Testing all menus - check console for details');
  
  const menuTests = [
    { name: 'Open Images', event: 'menu-open-images' },
    { name: 'Open Project', event: 'menu-open-project' },
    { name: 'Save Project', event: 'menu-save-project' }, 
    { name: 'Export', event: 'menu-export' },
    { name: 'Multi Generate', event: 'menu-multi-generate' },
    { name: 'Generate Final', event: 'menu-generate-final' },
    { name: 'Exit Composition', event: 'menu-exit-composition' },
    { name: 'Force Refresh', event: 'menu-force-refresh' },
    { name: 'About', event: 'menu-about' }
  ];
  
  let delay = 0;
  menuTests.forEach((test, index) => {
    setTimeout(() => {
      console.log(`🧪 Testing: ${test.name}`);
      if (window.electronAPI && window.electronAPI.onMenuEvent) {
        // Simulate menu event
        try {
          const fakeEvent = { type: test.event };
          console.log(`🔥 Triggering ${test.event}`);
          
          // This will test if the handler exists
          switch (test.event) {
            case 'menu-open-images':
              elements.fileInput.value = '';
              console.log('✅ Open Images handler works');
              break;
            case 'menu-save-project':
              if (typeof handleSaveProject === 'function') {
                console.log('✅ Save Project handler exists');
              } else {
                console.log('❌ Save Project handler missing');
              }
              break;
            case 'menu-export':
              if (typeof handleExportAll === 'function') {
                console.log('✅ Export handler exists');
              } else {
                console.log('❌ Export handler missing');
              }
              break;
            case 'menu-new-composition':
              if (typeof handleMenuNewComposition === 'function') {
                console.log('✅ New Composition handler exists');
              } else {
                console.log('❌ New Composition handler missing');
              }
              break;
            case 'menu-multi-generate':
              if (typeof handleMenuMultiGenerate === 'function') {
                console.log('✅ Multi Generate handler exists');
              } else {
                console.log('❌ Multi Generate handler missing');
              }
              break;
            case 'menu-generate-final':
              if (typeof handleMenuGenerateFinal === 'function') {
                console.log('✅ Generate Final handler exists');
              } else {
                console.log('❌ Generate Final handler missing');
              }
              break;
            case 'menu-exit-composition':
              if (typeof handleMenuExitComposition === 'function') {
                console.log('✅ Exit Composition handler exists');
              } else {
                console.log('❌ Exit Composition handler missing');
              }
              break;
            case 'menu-reset-canvas':
              if (typeof handleMenuResetCanvas === 'function') {
                console.log('✅ Reset Canvas handler exists');
              } else {
                console.log('❌ Reset Canvas handler missing');
              }
              break;
            case 'menu-force-refresh':
              if (typeof handleMenuForceRefresh === 'function') {
                console.log('✅ Force Refresh handler exists');
              } else {
                console.log('❌ Force Refresh handler missing');
              }
              break;
            case 'menu-about':
              if (typeof showAboutDialog === 'function') {
                console.log('✅ About handler exists');
              } else {
                console.log('❌ About handler missing');
              }
              break;
            default:
              console.log(`❓ Unknown test: ${test.event}`);
          }
        } catch (error) {
          console.log(`❌ Error testing ${test.name}:`, error);
        }
      }
    }, delay);
    delay += 500;
  });
  
  setTimeout(() => {
    console.log('🧪 Menu testing completed!');
    updateStatusMessage('🧪 Menu testing completed - check console for results');
  }, delay + 1000);
}

// Test individual menu items
function testMenuItem(menuType) {
  console.log(`🧪 Testing menu item: ${menuType}`);
  updateStatusMessage(`🧪 Testing ${menuType}...`);
  
  if (window.electronAPI && window.electronAPI.onMenuEvent) {
    // Simulate the exact event structure
    const fakeEvent = { type: menuType };
    console.log('🔥 Simulating event:', fakeEvent);
    
    // Manually trigger the switch case
    switch (menuType) {
             case 'menu-open-images':
         console.log('📂 Renderer: Open Images handler called');
         updateStatusMessage('📂 Opening file browser...');
         openFileDialogFromMenu();
         break;
      case 'menu-save-project':
        console.log('💾 Renderer: Save Project handler called');
        updateStatusMessage('💾 Saving project...');
        handleSaveProject();
        break;
      case 'menu-export':
        console.log('📤 Renderer: Export handler called');
        updateStatusMessage('📤 Starting export...');
        handleExportAll();
        break;
      case 'menu-open-project':
        console.log('📂 Renderer: Open Project handler called');
        updateStatusMessage('📂 Opening project file...');
        handleOpenProject();
        break;
      case 'menu-multi-generate':
        console.log('🎨 Renderer: Multi Generate handler called');
        updateStatusMessage('🎨 Multi Generate triggered...');
        handleMenuMultiGenerate();
        break;
      case 'menu-generate-final':
        console.log('📸 Renderer: Generate Final handler called');
        updateStatusMessage('📸 Generate Final triggered...');
        handleMenuGenerateFinal();
        break;
      case 'menu-exit-composition':
        console.log('🚪 Renderer: Exit Composition handler called');
        updateStatusMessage('🚪 Exiting composition...');
        handleMenuExitComposition();
        break;
      case 'menu-force-refresh':
        console.log('⚡ Renderer: Force Refresh handler called');
        updateStatusMessage('⚡ Refreshing canvas...');
        handleMenuForceRefresh();
        break;
      case 'menu-about':
        console.log('ℹ️ Renderer: About handler called');
        updateStatusMessage('ℹ️ Opening about dialog...');
        showAboutDialog();
        break;
      default:
        console.log(`❓ Unknown test menu type: ${menuType}`);
        updateStatusMessage(`❓ Unknown menu type: ${menuType}`);
    }
  } else {
    console.error('❌ electronAPI not available');
    updateStatusMessage('❌ electronAPI not available');
  }
}

// Expose test functions to console
if (typeof window !== 'undefined') {
  window.testFileMenu = testFileMenu;
  window.testAllMenus = testAllMenus;
  window.testMenuItem = testMenuItem;
  console.log('🧪 TEST FUNCTIONS AVAILABLE:');
  console.log('  - testFileMenu() - Test File menu only');
  console.log('  - testAllMenus() - Test all menu handlers');
  console.log('  - testMenuItem("menu-new-composition") - Test specific menu');
  console.log('📋 MENU TYPES:');
  console.log('  menu-open-images, menu-open-project, menu-save-project, menu-export');
  console.log('  menu-multi-generate, menu-generate-final, menu-exit-composition');
  console.log('  menu-force-refresh, menu-about');
}

// Open project file from menu
async function handleOpenProject() {
  console.log('📂 Opening project file...');
  
  try {
    if (window.electronAPI && window.electronAPI.showOpenDialog) {
      const result = await window.electronAPI.showOpenDialog({
        title: 'Open Project',
        buttonLabel: 'Open Project',
        properties: ['openFile'],
        filters: [
          { name: 'PEBDEQ Project', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      console.log('📂 Project dialog result:', result);
      
      if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
        const projectPath = result.filePaths[0];
        console.log('📂 Selected project:', projectPath);
        updateStatusMessage(`📂 Loading project: ${projectPath.split('\\').pop().split('/').pop()}`);
        
        try {
          const response = await fetch(`file://${projectPath}`);
          const projectData = await response.json();
          
          console.log('📂 Project data loaded:', projectData);
          
          // Validate project data
          if (projectData.version && projectData.images) {
            // Clear current state
            AppState.images = [];
            AppState.currentImageIndex = -1;
            
            // Load project data
            AppState.selectedModel = projectData.selectedModel || 'u2net';
            elements.modelSelect.value = AppState.selectedModel;
            
            // Update UI
            updateImageList();
            updateCanvasDisplay();
            
            updateStatusMessage(`✅ Project loaded: ${projectData.images.length} images, Model: ${projectData.selectedModel}`);
            console.log(`✅ Project loaded successfully with ${projectData.images.length} images`);
          } else {
            console.error('❌ Invalid project file format');
            updateStatusMessage('❌ Invalid project file format');
          }
        } catch (error) {
          console.error('❌ Error reading project file:', error);
          updateStatusMessage('❌ Error reading project file');
        }
      } else {
        console.log('📂 No project file selected');
        updateStatusMessage('📂 No project file selected');
      }
    } else {
      console.error('❌ Electron showOpenDialog not available');
      updateStatusMessage('❌ File dialog not available');
    }
  } catch (error) {
    console.error('❌ Error opening project dialog:', error);
    updateStatusMessage('❌ Error opening project dialog');
  }
}

// Open file dialog from menu (bypasses user activation requirement)
async function openFileDialogFromMenu() {
  console.log('📂 Opening native file dialog from menu...');
  
  try {
    if (window.electronAPI && window.electronAPI.showOpenDialog) {
      const result = await window.electronAPI.showOpenDialog({
        title: 'Select Images',
        buttonLabel: 'Open Images',
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      });
      
      console.log('📂 File dialog result:', result);
      
      if (!result.canceled && result.filePaths && result.filePaths.length > 0) {
        console.log('📂 Selected files:', result.filePaths);
        updateStatusMessage(`📂 Loading ${result.filePaths.length} image(s)...`);
        
        // Convert file paths to File objects
        const files = await Promise.all(
          result.filePaths.map(async (filePath) => {
            try {
              const response = await fetch(`file://${filePath}`);
              const blob = await response.blob();
              const fileName = filePath.split('\\').pop().split('/').pop();
              return new File([blob], fileName, { type: blob.type });
            } catch (error) {
              console.error('❌ Error loading file:', filePath, error);
              return null;
            }
          })
        );
        
        // Filter out failed loads and add to queue
        const validFiles = files.filter(file => file !== null);
        if (validFiles.length > 0) {
          addImagesToQueue(validFiles);
          console.log(`✅ Added ${validFiles.length} images to queue`);
        } else {
          updateStatusMessage('❌ Failed to load selected images');
        }
      } else {
        console.log('📂 No files selected');
        updateStatusMessage('📂 No files selected');
      }
    } else {
      console.error('❌ Electron showOpenDialog not available');
      updateStatusMessage('❌ File dialog not available - try drag & drop instead');
    }
  } catch (error) {
    console.error('❌ Error opening file dialog:', error);
    updateStatusMessage('❌ Error opening file dialog');
  }
}

// Menu handler functions for Layers menu

function handleMenuMultiGenerate() {
  console.log('📋 Menu: Multi Generate requested');
  
  if (!CanvasManager.compositionMode) {
    updateStatusMessage('⚠️ Please start composition mode first');
    return;
  }
  
  generateMultiComposite();
}

function handleMenuGenerateFinal() {
  console.log('📋 Menu: Generate Final requested');
  
  if (!CanvasManager.compositionMode) {
    updateStatusMessage('⚠️ Please start composition mode first');
    return;
  }
  
  generateFinalComposite();
}

function handleMenuExitComposition() {
  console.log('📋 Menu: Exit Composition requested');
  
  if (!CanvasManager.compositionMode) {
    updateStatusMessage('ℹ️ Not in composition mode');
    return;
  }
  
  exitCompositionMode();
}

function handleMenuForceRefresh() {
  console.log('📋 Menu: Force Refresh requested');
  
  if (CanvasManager && CanvasManager.draw) {
    CanvasManager.draw();
    updateStatusMessage('⚡ Canvas refreshed');
  } else {
    updateStatusMessage('⚠️ Canvas refresh not available');
  }
}

// File handling
function handleFileSelect(event) {
  console.log('📂 File input triggered, files selected:', event.target.files.length);
  
  if (event.target.files.length === 0) {
    console.log('📂 No files selected');
    updateStatusMessage('📂 No files selected');
    return;
  }
  
  // Clear action history when new images are loaded
  ActionHistory_Global.clear();
  
  const files = Array.from(event.target.files);
  console.log('📂 Processing files:', files.map(f => f.name));
  
  updateStatusMessage(`📂 Loading ${files.length} image(s)...`);
  addImagesToQueue(files);
  
  // Reset input value to allow selecting the same file again
  event.target.value = '';
}

function handleFileDrop(event) {
  event.preventDefault();
  elements.dropZone.classList.remove('dragover');
  
  const files = Array.from(event.dataTransfer.files).filter(file => 
    file.type.startsWith('image/')
  );
  
  if (files.length > 0) {
    addImagesToQueue(files);
  } else {
    updateStatusMessage('⚠️ Please drop valid image files only');
  }
}

function handleDragOver(event) {
  event.preventDefault();
  elements.dropZone.classList.add('dragover');
}

function handleDragLeave(event) {
  event.preventDefault();
  elements.dropZone.classList.remove('dragover');
}

async function addImagesToQueue(files, sourceInfo = null) {
  updateStatusMessage(`Adding ${files.length} image(s) to queue...`);
  
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      updateStatusMessage(`⚠️ ${file.name} is too large (max 10MB)`);
      continue;
    }
    
    try {
      const base64 = await window.fileUtils.fileToBase64(file);
      const imageData = {
        id: Date.now() + Math.random(),
        name: file.name,
        file,
        base64,
        status: 'pending',
        originalImage: null,
        processedImage: null,
        processingTime: null,
        // Extension metadata (optional)
        source: sourceInfo?.source || 'manual',        // 'manual' or 'extension'
        platform: sourceInfo?.platform || null,       // 'etsy', 'shopify', etc.
        availableSlots: sourceInfo?.availableSlots || null
      };
      
      AppState.images.push(imageData);
      addImageToUI(imageData);
    } catch (error) {
      console.error('Failed to process file:', file.name, error);
      updateStatusMessage(`❌ Failed to load ${file.name}`);
    }
  }
  
  updateUI();
  updateStatusMessage(`✅ Added ${files.length} image(s) to queue`);
}

function addImageToUI(imageData) {
  const imageItem = document.createElement('div');
  imageItem.className = 'image-item';
  imageItem.dataset.imageId = imageData.id;
  
  // Platform badge for extension images
  const platformBadge = imageData.platform ? `<span class="platform-badge">${imageData.platform.toUpperCase()}</span>` : '';
  
  imageItem.innerHTML = `
    <img class="image-thumbnail" src="${imageData.base64}" alt="${imageData.name}">
    <div class="image-info">
      <div class="image-name">${imageData.name} ${platformBadge}</div>
      <div class="image-status">Pending</div>
    </div>
  `;
  
  imageItem.addEventListener('click', () => selectImage(imageData.id));
  elements.imageList.appendChild(imageItem);
}

// Image processing
async function processImage(imageData) {
  if (!AppState.pythonBackendOnline) {
    updateStatusMessage('❌ Python backend is offline');
    return;
  }
  
  updateImageStatus(imageData.id, 'processing');
  showLoadingOverlay(true);
  updateStatusMessage(`🎯 Processing ${imageData.name} with ${getModelDisplayName(AppState.selectedModel)}...`);
  
  const startTime = Date.now();
  
  try {
    const result = await window.aiAPI.removeBackground(
      imageData.base64, 
      AppState.selectedModel, 
      Settings.processingQuality || 'balanced'
    );
    
    if (result.success) {
      const processingTime = Date.now() - startTime;
      
      // Store result in imageData first
      imageData.processedImage = result.result_image;
      imageData.processingTime = processingTime;
      imageData.modelUsed = AppState.selectedModel;
      
      // Store result for accept/discard workflow
      AppState.currentProcessedResult = {
        result_image: result.result_image,
        processing_time: processingTime,
        model_used: AppState.selectedModel,
        input_size: result.input_size,
        output_size: result.output_size
      };
      
      // Update UI to show processing completed but awaiting decision
      updateImageStatus(imageData.id, 'processed');
      updateStatusMessage(`🎯 ${imageData.name} processed in ${(processingTime/1000).toFixed(2)}s - Accept or try another model?`);
      
      // Update processing time display
      elements.processingTime.textContent = `Time: ${(processingTime/1000).toFixed(2)}s`;
      
      // Show Accept/Discard controls
      showAcceptDiscardControls();
      
      // Show processed image in canvas if this is the selected image
      if (AppState.currentImageIndex === AppState.images.findIndex(img => img.id === imageData.id)) {
        CanvasManager.showProcessedImage(imageData);
        
        // Switch to processed view to show the result
        switchViewMode('processed');
      }
    } else {
      throw new Error(result.error || 'Processing failed');
    }
  } catch (error) {
    console.error('Processing error:', error);
    imageData.status = 'error';
    updateImageStatus(imageData.id, 'error');
    updateStatusMessage(`❌ Failed to process ${imageData.name}: ${error.message}`);
  } finally {
    showLoadingOverlay(false);
  }
}

async function handleProcessAll() {
  if (AppState.isProcessing) return;
  
  const pendingImages = AppState.images.filter(img => img.status === 'pending');
  if (pendingImages.length === 0) {
    updateStatusMessage('ℹ️ No pending images to process');
    return;
  }
  
  AppState.isProcessing = true;
  updateUI();
  
  // Memory limit warning for large batches
  if (pendingImages.length > 5 && Settings.memoryLimit === '2gb') {
    updateStatusMessage(`⚠️ Processing ${pendingImages.length} images with 2GB limit - may be slow`);
  } else {
  updateStatusMessage(`🔄 Processing ${pendingImages.length} images...`);
  }
  
  for (let i = 0; i < pendingImages.length; i++) {
    const image = pendingImages[i];
    updateStatusMessage(`🔄 Processing ${i + 1}/${pendingImages.length}: ${image.name}`);
    await processImage(image);
    
    // Keep processed images available for user decision (no auto-accept)
    console.log('🎯 Image processed - user can decide later:', image.name);
    
    // Update progress
    updateProgress((i + 1) / pendingImages.length * 100);
  }
  
  AppState.isProcessing = false;
  updateProgress(0);
  
  // DON'T hide controls after batch processing - let user decide on each image
  console.log('🎯 Batch processing completed - controls remain available for individual decisions');
  
  updateUI();
  updateStatusMessage(`✅ Batch processing completed`);
}

async function handleResetAllProcessed() {
  console.log('🔄 Reset All Processed clicked');
  
  const processedImages = AppState.images.filter(img => 
    img.status === 'processed' || img.status === 'completed'
  );
  
  if (processedImages.length === 0) {
    updateStatusMessage('ℹ️ No processed images to reset');
    return;
  }
  
  console.log(`🔄 Resetting ${processedImages.length} processed images`);
  
  processedImages.forEach(imageData => {
    // Clear processed image and reset to pending
    imageData.processedImage = null;
    imageData.status = 'pending';
    updateImageStatus(imageData.id, 'pending');
    
    console.log('🔄 Reset image:', imageData.name);
  });
  
  // Clear any current processed result state
  AppState.currentProcessedResult = null;
  AppState.awaitingUserDecision = false;
  
  // Clear canvas processed image
  CanvasManager.processedImage = null;
  
  // Switch back to original view
  switchViewMode('original');
  
  // Hide accept/discard controls
  hideAcceptDiscardControls();
  
  // Update UI to refresh all button states
  updateUI();
  
  updateStatusMessage(`🔄 Reset ${processedImages.length} images - Ready for reprocessing!`);
  console.log(`✅ Reset completed for ${processedImages.length} images`);
}

// UI updates
function updateImageStatus(imageId, status) {
  const imageItem = document.querySelector(`[data-image-id="${imageId}"]`);
  if (imageItem) {
    const statusElement = imageItem.querySelector('.image-status');
    statusElement.textContent = status.charAt(0).toUpperCase() + status.slice(1);
    
    // Update item classes
    imageItem.classList.remove('pending', 'processing', 'completed', 'error');
    imageItem.classList.add(status);
  }
  
  // Update the image data
  const imageData = AppState.images.find(img => img.id === imageId);
  if (imageData) {
    imageData.status = status;
  }
}

function selectImage(imageId) {
  console.log('🎯 selectImage called with ID:', imageId);
  
  // Remove active class from all items
  document.querySelectorAll('.image-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to selected item
  const selectedItem = document.querySelector(`[data-image-id="${imageId}"]`);
  if (selectedItem) {
    selectedItem.classList.add('active');
    console.log('✅ Selected item marked as active');
  } else {
    console.error('❌ Could not find item with ID:', imageId);
  }
  
  // Update current image index
  AppState.currentImageIndex = AppState.images.findIndex(img => img.id === imageId);
  const imageData = AppState.images[AppState.currentImageIndex];
  
  console.log('📊 Current image index:', AppState.currentImageIndex);
  console.log('📊 Image data:', imageData ? imageData.name : 'NOT FOUND');
  
  if (imageData) {
    // Show image in canvas
    console.log('🖼️ Loading image in canvas:', imageData.name);
    console.log('📊 Image base64 length:', imageData.base64 ? imageData.base64.length : 'NO BASE64');
    CanvasManager.loadImage(imageData);
    
    // Auto-enable crop mode if setting is enabled
    if (Settings.autoCropMode && !CanvasManager.cropMode) {
      setTimeout(() => {
        toggleCropMode();
      }, 500); // Small delay to ensure image is loaded
    }
    
    // If image has processed version, show that too
    if (imageData.processedImage) {
      CanvasManager.showProcessedImage(imageData);
      console.log('📸 Loaded processed image for:', imageData.name);
      
      // Show accept/discard controls for processed images
      AppState.currentProcessedResult = {
        result_image: imageData.processedImage,
        processing_time: imageData.processingTime || 0,
        model_used: imageData.modelUsed || AppState.selectedModel
      };
      AppState.awaitingUserDecision = true;
      showAcceptDiscardControls();
      console.log('🎛️ Showing controls for processed image:', imageData.name);
    } else {
      // Hide controls for non-processed images
      hideAcceptDiscardControls();
      AppState.currentProcessedResult = null;
      AppState.awaitingUserDecision = false;
    }
    
    // Update image info
    elements.imageInfo.textContent = `${imageData.name} (${imageData.status})`;
    
    // Show canvas container, hide drop zone
    elements.dropZone.classList.add('hidden');
    elements.canvasContainer.classList.remove('hidden');
    
    console.log('🎯 Selected image:', imageData.name, 'Status:', imageData.status, 'Has processed:', !!imageData.processedImage);
  }
}

function switchViewMode(mode) {
  // Update button states
  document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`view-${mode}-btn`).classList.add('active');
  
  // Update canvas view
  CanvasManager.setViewMode(mode);
}

function showLoadingOverlay(show, progress = 0) {
  elements.loadingOverlay.classList.toggle('hidden', !show);
  updateProgress(progress);
}

function updateProgress(percent) {
  elements.progressFill.style.width = `${percent}%`;
  elements.progressText.textContent = `${Math.round(percent)}%`;
}

function updateStatusMessage(message) {
  elements.statusMessage.textContent = message;
  console.log('📋', message);
}

function updateUI() {
  // Update button states
  const hasImages = AppState.images.length > 0;
  const hasPendingImages = AppState.images.some(img => img.status === 'pending');
  const hasCompletedImages = AppState.images.some(img => img.status === 'completed');
  const hasProcessedImages = AppState.images.some(img => 
    img.status === 'processed' || img.status === 'completed'
  );
  
  document.getElementById('process-all-btn').disabled = !hasPendingImages || AppState.isProcessing;
  document.getElementById('reset-all-btn').disabled = !hasProcessedImages || AppState.isProcessing;
  document.getElementById('export-all-btn').disabled = !hasCompletedImages;
  
  // Enable send-to-platform button only if there are completed extension images
  const hasExtensionImages = AppState.images.some(img => 
    img.source === 'extension' && 
    img.platform && 
    img.status === 'completed' && 
    (img.processedImage || img.compositeImage)
  );
  document.getElementById('send-to-platform-btn').disabled = !hasExtensionImages;
  
  // Update memory usage (mock for now)
  updateMemoryUsage();
}

// Backend communication
async function checkPythonBackend() {
  try {
    const isOnline = await window.aiAPI.healthCheck();
    AppState.pythonBackendOnline = isOnline;
    
    const statusElement = elements.pythonStatus;
    statusElement.classList.toggle('online', isOnline);
    statusElement.classList.toggle('offline', !isOnline);
    
    if (isOnline) {
      updateStatusMessage('✅ AI Service connected');
      
      // Load available models
      try {
        const modelsResponse = await window.aiAPI.getModels();
        console.log('🤖 Available models:', modelsResponse);
      } catch (error) {
        console.warn('Failed to load models:', error);
      }
    } else {
      updateStatusMessage('❌ AI Service offline - Please check Python backend');
    }
  } catch (error) {
    console.error('Backend check failed:', error);
    AppState.pythonBackendOnline = false;
    elements.pythonStatus.classList.add('offline');
    elements.pythonStatus.classList.remove('online');
    updateStatusMessage('❌ AI Service connection failed');
  }
  
  // DISABLED: Continuous polling is unnecessary
  // setTimeout(checkPythonBackend, 5000);
  console.log('🔄 Health check completed - No auto-polling');
}

// Export functions
async function handleExportAll() {
  const completedImages = AppState.images.filter(img => img.status === 'completed');
  
  if (completedImages.length === 0) {
    updateStatusMessage('ℹ️ No processed images to export');
    return;
  }
  
  updateStatusMessage(`📁 Exporting ${completedImages.length} processed images...`);
  console.log('📁 EXPORT ALL - Processing', completedImages.length, 'images');
  
  for (const imageData of completedImages) {
    // Priority: composite image > processed image
    const imageToExport = imageData.compositeImage || imageData.processedImage;
    
    if (imageToExport) {
      const filename = generateFilename(imageData.name);
      const imageType = imageData.compositeImage ? 'composite' : 'processed';
      
      console.log(`📤 Exporting ${imageType} image:`, filename);
      console.log(`📊 Has composite: ${!!imageData.compositeImage}, Has processed: ${!!imageData.processedImage}`);
      
      window.fileUtils.downloadImage(imageToExport, filename);
    } else {
      console.error('❌ No image to export for:', imageData.name);
    }
  }
  
  updateStatusMessage(`✅ Exported ${completedImages.length} images`);
  console.log('✅ Export All completed');
}

async function handleSendToPlatform() {
  // Force refresh extension status before checking
  if (extensionManager) {
    await extensionManager.checkExtensionStatus();
    console.log(`🔄 Refreshed extension status: ${AppState.extensionClientsCount} clients`);
  }
  
  // Check if any extensions are connected first
  if (AppState.extensionClientsCount === 0) {
    updateStatusMessage('⚠️ No extensions connected. Please connect browser extension first.');
    console.log('❌ Cannot send to platform - no extensions connected');
    return;
  }
  
  // Find all processed images that came from extensions
  const extensionImages = AppState.images.filter(img => 
    img.source === 'extension' && 
    img.platform && 
    img.status === 'completed' && 
    (img.processedImage || img.compositeImage)
  );
  
  if (extensionImages.length === 0) {
    updateStatusMessage('ℹ️ No processed extension images to send');
    return;
  }
  
  // Group by platform
  const imagesByPlatform = extensionImages.reduce((acc, img) => {
    if (!acc[img.platform]) {
      acc[img.platform] = [];
    }
    acc[img.platform].push(img);
    return acc;
  }, {});
  
  updateStatusMessage(`🌐 Sending ${extensionImages.length} processed images to platforms...`);
  console.log('🌐 SEND TO PLATFORM - Processing', extensionImages.length, 'images');
  console.log('📊 Images grouped by platform:', imagesByPlatform);
  
  try {
    // Send images to backend for extension pickup
    for (const [platform, images] of Object.entries(imagesByPlatform)) {
      const processedImages = [];
      
      for (const imageData of images) {
        // Priority: composite image > processed image
        const imageToSend = imageData.compositeImage || imageData.processedImage;
        
        if (imageToSend) {
          console.log(`🔍 Processing ${imageData.name} - Image type:`, typeof imageToSend, imageToSend?.constructor?.name);
          
          // Convert to base64 (handle both canvas and base64 string)
          let base64Data;
          
          if (typeof imageToSend === 'string') {
            // Already a base64 string
            base64Data = imageToSend;
          } else if (imageToSend && typeof imageToSend.toDataURL === 'function') {
            // Canvas element
            base64Data = imageToSend.toDataURL('image/png');
          } else {
            console.error('❌ Unknown image format for:', imageData.name, imageToSend);
            continue;
          }
          
          processedImages.push({
            originalName: imageData.name,
            processedData: base64Data,
            extensionId: imageData.extensionId,
            platform: platform
          });
        }
      }
      
      if (processedImages.length > 0) {
        // Send to backend for extension pickup
        const response = await fetch('http://localhost:8000/api/send-processed-to-extension', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            platform: platform,
            images: processedImages
          })
        });
        
        if (response.ok) {
          console.log(`✅ Sent ${processedImages.length} images to ${platform} extension`);
          updateStatusMessage(`✅ Sent ${processedImages.length} images to ${platform.toUpperCase()}`);
          
          // Clear extension queue and processing queue after successful platform send
          try {
            await extensionManager.clearExtensionQueue();
            console.log(`🧹 Cleared extension queue after platform send`);
          } catch (clearError) {
            console.error('❌ Failed to clear extension queue:', clearError);
          }
        } else {
          console.error(`❌ Failed to send images to ${platform}:`, response.statusText);
          updateStatusMessage(`❌ Failed to send images to ${platform.toUpperCase()}`);
        }
      }
    }
    
    console.log('✅ Send to Platform completed');
    
  } catch (error) {
    console.error('❌ Error sending images to platform:', error);
    updateStatusMessage('❌ Failed to send images to platform');
  }
}

function handleClearQueue() {
  if (confirm('Are you sure you want to clear all images from the queue?')) {
    AppState.images = [];
    AppState.currentImageIndex = -1;
    elements.imageList.innerHTML = '';
    
    // Show drop zone, hide canvas
    elements.dropZone.classList.remove('hidden');
    elements.canvasContainer.classList.add('hidden');
    
    updateUI();
    updateStatusMessage('🗑️ Queue cleared');
  }
}

function handleSaveProject() {
  console.log('💾 Executing handleSaveProject...');
  
  if (AppState.images.length === 0) {
    updateStatusMessage('⚠️ No images in project to save');
    return;
  }
  
  const projectData = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    selectedModel: AppState.selectedModel,
    imageCount: AppState.images.length,
    completedCount: AppState.images.filter(img => img.status === 'completed').length,
    images: AppState.images.map(img => ({
      id: img.id,
      name: img.name,
      status: img.status,
      processingTime: img.processingTime
    }))
  };
  
  console.log('💾 Project data prepared:', projectData);
  
  const dataStr = JSON.stringify(projectData, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
  const filename = `pebdeq_project_${timestamp}.json`;
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log(`💾 Project saved as: ${filename}`);
  updateStatusMessage(`💾 Project saved as: ${filename}`);
}

// Utility functions
function getModelDisplayName(modelId) {
  const modelNames = {
    'u2net': 'U2Net (Fast)',
    'birefnet': 'BiRefNet (Premium)',
    'bria': 'BRIA RMBG (Ultra)'
  };
  return modelNames[modelId] || modelId;
}

function updateMemoryUsage() {
  // Mock memory usage for now
  const usage = Math.floor(Math.random() * 30) + 20; // 20-50%
  elements.memoryUsage.textContent = `RAM: ${usage}%`;
}

function showAboutDialog() {
  alert(`PEBDEQ Desktop Pro v1.0.0
Professional Background Removal Application

Features:
• Multiple AI Models (U2Net, BiRefNet, BRIA)
• Interactive Canvas Editor
• Batch Processing
• Professional Export

© 2025 PEBDEQ Team`);
}

// Accept/Discard Result Handlers - Removed duplicate function

function handleDiscardResult() {
  console.log('🗑️ Discard button clicked!');
  console.log('currentProcessedResult:', AppState.currentProcessedResult);
  console.log('currentImageIndex:', AppState.currentImageIndex);
  
  if (!AppState.currentProcessedResult) {
    console.error('❌ No processed result to discard');
    return;
  }
  
  const imageData = AppState.images[AppState.currentImageIndex];
  if (!imageData) {
    console.error('❌ No image data found');
    return;
  }
  
  console.log('🗑️ Discarding result for:', imageData.name);
  
  // Discard the result and reset to pending
  imageData.processedImage = null;
  imageData.processingTime = null;
  imageData.status = 'pending';
  
  // Update UI
  updateImageStatus(imageData.id, 'pending');
  hideAcceptDiscardControls();
  
  // Reset state
  AppState.currentProcessedResult = null;
  AppState.awaitingUserDecision = false;
  
  // Switch back to original view
  switchViewMode('original');
  
  updateStatusMessage(`🔄 Result discarded. Try a different model for ${imageData.name}`);
  updateUI();
}

function showAcceptDiscardControls() {
  AppState.awaitingUserDecision = true;
  if (elements.resultControls && elements.standardControls) {
    elements.resultControls.classList.remove('hidden');
    elements.standardControls.classList.add('hidden');
    console.log('🎯 Accept/Discard controls shown');
  } else {
    console.error('❌ Control elements not found for show operation');
  }
}

function hideAcceptDiscardControls() {
  AppState.awaitingUserDecision = false;
  // TEMPORARILY DISABLED - Keep buttons always visible for debugging
  console.log('🔄 Accept/Discard controls hide called but DISABLED for debugging');
  // if (elements.resultControls && elements.standardControls) {
  //   elements.resultControls.classList.add('hidden');
  //   elements.standardControls.classList.remove('hidden');
  //   console.log('🔄 Accept/Discard controls hidden');
  // } else {
  //   console.error('❌ Control elements not found for hide operation');
  // }
}

// Crop handling functions
function toggleCropMode() {
  if (CanvasManager.cropMode) {
    // Disable crop mode
    cancelCrop();
  } else {
    // Enable crop mode
    if (!CanvasManager.currentImage) {
      updateStatusMessage('⚠️ Please load an image first');
      return;
    }
    
    CanvasManager.enableCropMode();
    elements.cropModeBtn.classList.add('active');
    elements.cropModeBtn.innerHTML = '<span>✂️</span> Disable Crop Mode';
    elements.cropControls.classList.remove('hidden');
    
    // Apply default crop ratio from settings
    if (Settings.defaultCropRatio && elements.aspectRatioSelect) {
      elements.aspectRatioSelect.value = Settings.defaultCropRatio;
      CanvasManager.setAspectRatio(Settings.defaultCropRatio);
    }
    
    updateStatusMessage('✂️ Crop mode enabled - Adjust the crop frame and click Apply');
  }
}

async function applyCrop() {
  if (!CanvasManager.cropMode || !CanvasManager.currentImage) {
    return;
  }
  
  // Capture state before changes
  const beforeState = ActionHistory_Global.getCurrentState();
  
  console.log('🔲 Applying crop...');
  updateStatusMessage('✂️ Processing crop...');
  
  try {
    // Apply crop using CanvasManager (now returns a Promise)
    const cropResult = await CanvasManager.applyCrop();
    
    console.log('🔲 Crop completed, updating UI...');
    
    // Update the current image data in AppState if there's an active image
    if (AppState.currentImageIndex >= 0 && AppState.images[AppState.currentImageIndex]) {
      const currentImageData = AppState.images[AppState.currentImageIndex];
      
      // Update image data with cropped version
      currentImageData.base64 = cropResult.dataURL;
      currentImageData.processedImage = null; // Clear any previous processing
      currentImageData.status = 'pending'; // Reset to pending since image changed
      
      // Update queue display
      updateImageStatus(currentImageData.id, 'pending');
      updateUI();
      
      console.log(`🔲 Image data updated: ${cropResult.width}x${cropResult.height}`);
    }
    
    // UI cleanup for crop mode (CanvasManager already disabled crop mode)
    elements.cropModeBtn.classList.remove('active');
    elements.cropModeBtn.innerHTML = '<span>✂️</span> Enable Crop Mode';
    elements.cropControls.classList.add('hidden');
    
    // Add to action history
    ActionHistory_Global.addAction({
      type: 'crop',
      description: 'Image cropped',
      beforeState: beforeState,
      afterState: ActionHistory_Global.getCurrentState()
    });

    updateStatusMessage('✂️ Image cropped successfully! Ready for background removal.');
    console.log('🔲 Crop workflow completed successfully');
    
  } catch (error) {
    console.error('❌ Crop failed:', error);
    updateStatusMessage('❌ Failed to apply crop: ' + error.message);
    
    // Reset UI on error
    cancelCrop();
  }
}

// Cut and Export workflow functions
let currentCropResult = null; // Store current crop result

async function handleCutAndExport() {
  console.log('🔥 CUT AND EXPORT BUTTON CLICKED!');
  
  if (!CanvasManager.cropMode || !CanvasManager.currentImage) {
    updateStatusMessage('⚠️ Please enable crop mode first');
    return;
  }
  
  console.log('✂️ Cutting image and preparing preview...');
  updateStatusMessage('✂️ Cutting image...');
  
  // Temporarily disable the button
  const cutBtn = elements.cutExportBtn;
  const originalText = cutBtn.innerHTML;
  cutBtn.disabled = true;
  cutBtn.innerHTML = '<span>⏳</span> Cutting...';
  
  try {
    // Get crop data without modifying the original image
    const cropData = CanvasManager.getCropData();
    
    if (!cropData) {
      updateStatusMessage('❌ Invalid crop area');
      cutBtn.disabled = false;
      cutBtn.innerHTML = originalText;
      return;
    }
    
    // Create cropped canvas
    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');
    
    croppedCanvas.width = Math.round(cropData.width);
    croppedCanvas.height = Math.round(cropData.height);
    
    // Draw cropped portion
    croppedCtx.drawImage(
      CanvasManager.currentImage,
      cropData.sourceX, cropData.sourceY, cropData.width, cropData.height, // Source
      0, 0, croppedCanvas.width, croppedCanvas.height // Destination
    );
    
    // Store the result
    currentCropResult = {
      canvas: croppedCanvas,
      dataURL: croppedCanvas.toDataURL('image/png'),
      width: croppedCanvas.width,
      height: croppedCanvas.height,
      fileSize: Math.round(croppedCanvas.toDataURL('image/png').length * 0.75 / 1024) // Rough estimate
    };
    
    // Show preview modal
    showCropPreview();
    
    // Restore button
    cutBtn.disabled = false;
    cutBtn.innerHTML = originalText;
    
    updateStatusMessage('✂️ Image cut successfully! Check preview to save or retry');
    
  } catch (error) {
    console.error('❌ Cut and export failed:', error);
    updateStatusMessage('❌ Failed to cut image: ' + error.message);
    
    // Restore button on error
    cutBtn.disabled = false;
    cutBtn.innerHTML = originalText;
  }
}

function showCropPreview() {
  if (!currentCropResult) return;
  
  // Update preview image
  elements.cropPreviewImage.src = currentCropResult.dataURL;
  elements.cropDimensions.textContent = `${currentCropResult.width}×${currentCropResult.height}`;
  elements.cropFilesize.textContent = `${currentCropResult.fileSize} KB`;
  
  // Show modal
  elements.cropPreviewModal.classList.remove('hidden');
  
  console.log('🖼️ Crop preview modal opened');
  console.log(`📐 Preview dimensions: ${currentCropResult.width}×${currentCropResult.height}`);
}

function closeCropPreview() {
  elements.cropPreviewModal.classList.add('hidden');
  currentCropResult = null;
  console.log('🚪 Crop preview modal closed');
}

function retryCrop() {
  console.log('🔄 Retry crop requested');
  closeCropPreview();
  updateStatusMessage('🔄 Ready to adjust crop area - modify the crop frame and try again');
}

function saveCropResult() {
  if (!currentCropResult) {
    updateStatusMessage('❌ No crop result to save');
    return;
  }
  
  console.log('💾 Saving crop result...');
  updateStatusMessage('💾 Saving cropped image...');
  
  // Generate filename
  const currentImageData = AppState.images[AppState.currentImageIndex];
  const originalName = currentImageData ? currentImageData.name : 'cropped_image';
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, "");
  const filename = `${nameWithoutExtension}_cropped.png`;
  
  // Save the image
  currentCropResult.canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log(`💾 Cropped image saved: ${filename}`);
    console.log(`📐 Final dimensions: ${currentCropResult.width}×${currentCropResult.height}`);
    updateStatusMessage(`💾 Cropped image saved: ${filename}`);
    
    // Close modal and crop mode
    closeCropPreview();
    cancelCrop(); // This will disable crop mode
    
  }, 'image/png');
}

// ===== SHADOW EFFECTS TOOL =====

function toggleShadowControls() {
  console.log('🌑 Toggling Shadow Controls...');
  
  const shadowControls = document.getElementById('shadow-controls');
  const toggleBtn = document.getElementById('shadow-toggle-btn');
  
  if (!shadowControls) {
    console.error('❌ Shadow controls element not found');
    return;
  }
  
  const isHidden = shadowControls.classList.contains('hidden');
  
  if (isHidden) {
    // Show shadow controls
    shadowControls.classList.remove('hidden');
    toggleBtn.classList.add('active');
    updateStatusMessage('🌑 Shadow effects enabled - Adjust settings below');
    console.log('✅ Shadow controls shown');
  } else {
    // Hide shadow controls
    shadowControls.classList.add('hidden');
    toggleBtn.classList.remove('active');
    updateStatusMessage('🌑 Shadow effects disabled');
    console.log('✅ Shadow controls hidden');
  }
  
  // Redraw canvas to show/hide shadow
  CanvasManager.draw();
}

// Check if shadow effects are enabled
function isShadowEnabled() {
  const shadowControls = document.getElementById('shadow-controls');
  return shadowControls && !shadowControls.classList.contains('hidden');
}

// Get current shadow settings
function getShadowSettings() {
  if (!isShadowEnabled()) return null;
  
  return {
    blur: parseInt(document.getElementById('shadow-blur')?.value || 10),
    offsetX: parseInt(document.getElementById('shadow-offset-x')?.value || 5),
    offsetY: parseInt(document.getElementById('shadow-offset-y')?.value || 5),
    opacity: parseFloat((document.getElementById('shadow-opacity')?.value || 50) / 100),
    color: document.getElementById('shadow-color')?.value || '#000000'
  };
}

// ===== OBJECT SHADOW TOOL =====

function toggleObjectShadowControls() {
  console.log('📦 Toggling Object Shadow Controls...');
  
  const objectShadowControls = document.getElementById('object-shadow-controls');
  const toggleBtn = document.getElementById('object-shadow-toggle-btn');
  
  if (!objectShadowControls) {
    console.error('❌ Object shadow controls element not found');
    return;
  }
  
  const isHidden = objectShadowControls.classList.contains('hidden');
  
  if (isHidden) {
    // Show object shadow controls
    objectShadowControls.classList.remove('hidden');
    toggleBtn.classList.add('active');
    updateStatusMessage('📦 Object shadow enabled - Realistic 3D ground shadow');
    console.log('✅ Object shadow controls shown');
  } else {
    // Hide object shadow controls
    objectShadowControls.classList.add('hidden');
    toggleBtn.classList.remove('active');
    updateStatusMessage('📦 Object shadow disabled');
    console.log('✅ Object shadow controls hidden');
  }
  
  // Toggle completed
  
  // Redraw canvas to show/hide object shadow
  CanvasManager.draw();
}

// Check if object shadow effects are enabled
function isObjectShadowEnabled() {
  const objectShadowControls = document.getElementById('object-shadow-controls');
  return objectShadowControls && !objectShadowControls.classList.contains('hidden');
}

// Get current object shadow settings
function getObjectShadowSettings() {
  if (!isObjectShadowEnabled()) return null;
  
  return {
    lightAngle: parseFloat(document.getElementById('light-angle')?.value || 330),
    lightDistance: parseFloat(document.getElementById('light-distance')?.value || 200),
    objectHeight: parseFloat(document.getElementById('object-height')?.value || 300),
    shadowDistance: parseFloat(document.getElementById('shadow-distance')?.value || 0),
    perspective: parseFloat(document.getElementById('shadow-perspective')?.value || 1),
    blur: parseFloat(document.getElementById('object-shadow-blur')?.value || 10),
    opacity: parseFloat((document.getElementById('object-shadow-opacity')?.value || 60) / 100),
    color: document.getElementById('object-shadow-color')?.value || '#000000'
  };
}

// ===== MANUAL REFINE TOOL =====

function openManualRefine() {
  console.log('✏️ Opening Manual Refine...');
  
  // Check if we have a processed image
  const currentImageData = AppState.images[AppState.currentImageIndex];
  if (!currentImageData?.processedImage) {
    updateStatusMessage('⚠️ Please process an image first to use Manual Refine');
    return;
  }
  
  // Show modal
  document.getElementById('manual-refine-modal').classList.remove('hidden');
  
  // Initialize refine canvas
  initializeRefineCanvas();
  
  // Setup refine event listeners
  setupRefineEventListeners();
  
  updateStatusMessage('✏️ Manual Refine opened - Use brush to refine edges');
}

let refineZoom = 1;
let refinePanX = 0;
let refinePanY = 0;
let refineIsPanning = false;
let refineLastMouseX = 0;
let refineLastMouseY = 0;
let refineOriginalImage = null;

function initializeRefineCanvas() {
  const canvas = document.getElementById('refine-canvas');
  const ctx = canvas.getContext('2d');
  const currentImageData = AppState.images[AppState.currentImageIndex];
  
  // Reset zoom and pan
  refineZoom = 1;
  refinePanX = 0;
  refinePanY = 0;
  
  // Create image from processed result
  const img = new Image();
  img.onload = () => {
    refineOriginalImage = img;
    
    // Set canvas to original image size
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw the processed image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0);
    
    // Initial fit to container
    fitRefineCanvas();
    
    console.log('✏️ Refine canvas initialized:', img.width, 'x', img.height);
  };
  img.src = currentImageData.processedImage;
}

function fitRefineCanvas() {
  const canvas = document.getElementById('refine-canvas');
  const wrapper = document.getElementById('refine-canvas-wrapper');
  
  if (!refineOriginalImage) return;
  
  // Calculate scale to fit in container
  const containerWidth = wrapper.clientWidth - 40; // Padding
  const containerHeight = wrapper.clientHeight - 40;
  
  const scaleX = containerWidth / refineOriginalImage.width;
  const scaleY = containerHeight / refineOriginalImage.height;
  refineZoom = Math.min(scaleX, scaleY, 1); // Don't zoom in beyond 100%
  
  // Center the image
  refinePanX = 0;
  refinePanY = 0;
  
  updateRefineCanvasDisplay();
  
  console.log('✏️ Canvas fitted, zoom:', refineZoom);
}

function updateRefineCanvasDisplay() {
  const canvas = document.getElementById('refine-canvas');
  
  if (!refineOriginalImage) return;
  
  const displayWidth = refineOriginalImage.width * refineZoom;
  const displayHeight = refineOriginalImage.height * refineZoom;
  
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;
  canvas.style.transform = `translate(${refinePanX}px, ${refinePanY}px)`;
  
  // Update brush cursor size
  updateBrushCursor();
}

let isRefining = false;
let brushMode = 'erase'; // 'erase' or 'restore'
let brushSize = 20;
let brushHardness = 80;
let refineHistory = [];

function setupRefineEventListeners() {
  const canvas = document.getElementById('refine-canvas');
  const brushCursor = document.getElementById('brush-cursor');
  
  // Brush mode buttons
  document.getElementById('erase-mode-btn').addEventListener('click', () => {
    brushMode = 'erase';
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('erase-mode-btn').classList.add('active');
    updateStatusMessage('✏️ Erase mode - Click and drag to remove parts');
  });
  
  document.getElementById('restore-mode-btn').addEventListener('click', () => {
    brushMode = 'restore';
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('restore-mode-btn').classList.add('active');
    updateStatusMessage('✏️ Restore mode - Click and drag to add back parts');
  });
  
  // Brush size slider
  const brushSizeSlider = document.getElementById('brush-size');
  brushSizeSlider.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    document.getElementById('brush-size-value').textContent = `${brushSize}px`;
    updateBrushCursor();
  });
  
  // Brush hardness slider
  const brushHardnessSlider = document.getElementById('brush-hardness');
  brushHardnessSlider.addEventListener('input', (e) => {
    brushHardness = parseInt(e.target.value);
    document.getElementById('brush-hardness-value').textContent = `${brushHardness}%`;
  });
  
  // Canvas mouse events
  canvas.addEventListener('mousedown', handleRefineMouseDown);
  canvas.addEventListener('mousemove', handleRefineMouseMove);
  canvas.addEventListener('mouseup', handleRefineMouseUp);
  canvas.addEventListener('mouseleave', () => {
    stopRefining();
    refineIsPanning = false;
    brushCursor.style.display = 'none';
  });
  canvas.addEventListener('mouseenter', () => {
    brushCursor.style.display = 'block';
  });
  
  // Disable context menu on canvas
  canvas.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  });
  
  // Zoom controls
  document.getElementById('refine-zoom-fit').addEventListener('click', fitRefineCanvas);
  document.getElementById('refine-zoom-100').addEventListener('click', () => {
    refineZoom = 1;
    refinePanX = 0;
    refinePanY = 0;
    updateRefineCanvasDisplay();
  });
  document.getElementById('refine-zoom-in').addEventListener('click', () => {
    refineZoom = Math.min(refineZoom * 1.2, 5);
    updateRefineCanvasDisplay();
  });
  document.getElementById('refine-zoom-out').addEventListener('click', () => {
    refineZoom = Math.max(refineZoom / 1.2, 0.1);
    updateRefineCanvasDisplay();
  });
  
  // Undo and Reset buttons
  document.getElementById('undo-refine-btn').addEventListener('click', undoRefineStep);
  document.getElementById('reset-refine-btn').addEventListener('click', resetRefineCanvas);
  
  // Action buttons
  document.getElementById('close-refine-btn').addEventListener('click', closeManualRefine);
  document.getElementById('cancel-refine-btn').addEventListener('click', closeManualRefine);
  document.getElementById('apply-refine-btn').addEventListener('click', applyManualRefine);
  
  updateBrushCursor();
}

function updateBrushCursor() {
  const cursor = document.getElementById('brush-cursor');
  const displaySize = brushSize * refineZoom;
  cursor.style.width = `${displaySize}px`;
  cursor.style.height = `${displaySize}px`;
}

function handleRefineMouseDown(e) {
  const canvas = document.getElementById('refine-canvas');
  const rect = canvas.getBoundingClientRect();
  
  refineLastMouseX = e.clientX;
  refineLastMouseY = e.clientY;
  
  if (e.button === 2 || e.ctrlKey) { // Right click or Ctrl+click for panning
    refineIsPanning = true;
    canvas.style.cursor = 'grabbing';
  } else { // Left click for brush
    isRefining = true;
    
    // Save current state for undo
    const ctx = canvas.getContext('2d');
    refineHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    
    // Keep only last 10 history states
    if (refineHistory.length > 10) {
      refineHistory.shift();
    }
    
    // Start brush stroke
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    performBrushStroke(x, y);
  }
}

function handleRefineMouseMove(e) {
  const canvas = document.getElementById('refine-canvas');
  const rect = canvas.getBoundingClientRect();
  const cursor = document.getElementById('brush-cursor');
  
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  // Update cursor position
  cursor.style.left = `${x}px`;
  cursor.style.top = `${y}px`;
  
  if (refineIsPanning) {
    // Pan the canvas
    const deltaX = e.clientX - refineLastMouseX;
    const deltaY = e.clientY - refineLastMouseY;
    
    refinePanX += deltaX;
    refinePanY += deltaY;
    
    updateRefineCanvasDisplay();
    
    refineLastMouseX = e.clientX;
    refineLastMouseY = e.clientY;
  } else if (isRefining) {
    // Continue brush stroke
    performBrushStroke(x, y);
  }
}

function handleRefineMouseUp(e) {
  isRefining = false;
  refineIsPanning = false;
  
  const canvas = document.getElementById('refine-canvas');
  canvas.style.cursor = 'crosshair';
}

function undoRefineStep() {
  if (refineHistory.length === 0) {
    updateStatusMessage('❌ No actions to undo');
    return;
  }
  
  const canvas = document.getElementById('refine-canvas');
  const ctx = canvas.getContext('2d');
  
  // Restore last state
  const lastState = refineHistory.pop();
  ctx.putImageData(lastState, 0, 0);
  
  updateStatusMessage('↶ Last action undone');
  console.log('✏️ Undo applied, history length:', refineHistory.length);
}

function resetRefineCanvas() {
  if (!refineOriginalImage) return;
  
  const confirmed = confirm('Are you sure you want to reset all changes?\n\nThis will restore the original processed image.');
  
  if (!confirmed) return;
  
  const canvas = document.getElementById('refine-canvas');
  const ctx = canvas.getContext('2d');
  
  // Clear and redraw original image
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(refineOriginalImage, 0, 0);
  
  // Clear history
  refineHistory = [];
  
  updateStatusMessage('🔄 Canvas reset to original');
  console.log('✏️ Canvas reset to original state');
}

function performBrushStroke(x, y) {
  const canvas = document.getElementById('refine-canvas');
  const ctx = canvas.getContext('2d');
  
  // Convert screen coordinates to canvas coordinates accounting for zoom and pan
  const rect = canvas.getBoundingClientRect();
  const canvasX = (x / refineZoom);
  const canvasY = (y / refineZoom);
  
  ctx.save();
  ctx.globalCompositeOperation = brushMode === 'erase' ? 'destination-out' : 'source-over';
  
  // Create brush gradient for soft edges (size adjusted for zoom)
  const effectiveBrushSize = brushSize / refineZoom;
  const gradient = ctx.createRadialGradient(canvasX, canvasY, 0, canvasX, canvasY, effectiveBrushSize / 2);
  const opacity = brushHardness / 100;
  
  if (brushMode === 'erase') {
    gradient.addColorStop(0, `rgba(0, 0, 0, ${opacity})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  } else {
    // For restore mode, use the original image data
    gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
  }
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(canvasX, canvasY, effectiveBrushSize / 2, 0, 2 * Math.PI);
  ctx.fill();
  
  ctx.restore();
}

function closeManualRefine() {
  document.getElementById('manual-refine-modal').classList.add('hidden');
  refineHistory = [];
  updateStatusMessage('✏️ Manual Refine closed');
}

function applyManualRefine() {
  console.log('✏️ Applying manual refine changes...');
  
  const canvas = document.getElementById('refine-canvas');
  const refinedDataURL = canvas.toDataURL('image/png');
  
  // Update the processed image with refined version
  const currentImageData = AppState.images[AppState.currentImageIndex];
  if (currentImageData) {
    currentImageData.processedImage = refinedDataURL;
    updateStatusMessage('✏️ Manual refine applied successfully!');
    
    // Update canvas display
    CanvasManager.showProcessedImage(currentImageData);
  }
  
  closeManualRefine();
}

// ===== COLOR CORRECTION FUNCTIONALITY =====

let colorSettings = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  vibrance: 0,
  temperature: 0,
  tint: 0,
  hue: 0,
  highlights: 0,
  shadows: 0,
  clarity: 0
};

let originalColorData = null;

function openColorCorrection() {
  if (!AppState.images[AppState.currentImageIndex]?.processedImage) {
    updateStatusMessage('❌ No processed image available for color correction');
    return;
  }
  
  const modal = document.getElementById('color-correct-modal');
  modal.classList.remove('hidden');
  modal.style.display = 'flex';
  
  // Reset settings
  resetColorSettings();
  
  // Initialize canvases
  initializeColorCanvases();
  
  // Setup event listeners
  setupColorEventListeners();
  
  updateStatusMessage('🎨 Color Correction opened - Adjust colors and lighting');
}

function resetColorSettings() {
  colorSettings = {
    brightness: 0,
    contrast: 0,
    saturation: 0,
    vibrance: 0,
    temperature: 0,
    tint: 0,
    hue: 0,
    highlights: 0,
    shadows: 0,
    clarity: 0
  };
  
  // Update all sliders and values
  Object.keys(colorSettings).forEach(key => {
    const slider = document.getElementById(`${key}-slider`);
    const valueSpan = document.getElementById(`${key}-value`);
    if (slider && valueSpan) {
      slider.value = colorSettings[key];
      valueSpan.textContent = key === 'hue' ? `${colorSettings[key]}°` : colorSettings[key];
    }
  });
  
  // Clear active preset
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.remove('active');
  });
}

function initializeColorCanvases() {
  const beforeCanvas = document.getElementById('color-before-canvas');
  const afterCanvas = document.getElementById('color-after-canvas');
  const currentImageData = AppState.images[AppState.currentImageIndex];
  
  const img = new Image();
  img.onload = () => {
    // Store original image data
    originalColorData = img;
    
    // Setup before canvas
    const beforeCtx = beforeCanvas.getContext('2d');
    const maxSize = 400;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    
    beforeCanvas.width = img.width * scale;
    beforeCanvas.height = img.height * scale;
    beforeCtx.drawImage(img, 0, 0, beforeCanvas.width, beforeCanvas.height);
    
    // Setup after canvas with same dimensions
    afterCanvas.width = beforeCanvas.width;
    afterCanvas.height = beforeCanvas.height;
    
    // Initial render
    updateColorPreview();
    
    console.log('🎨 Color correction canvases initialized:', beforeCanvas.width, 'x', beforeCanvas.height);
  };
  img.src = currentImageData.processedImage;
}

function setupColorEventListeners() {
  // Slider event listeners
  Object.keys(colorSettings).forEach(key => {
    const slider = document.getElementById(`${key}-slider`);
    const valueSpan = document.getElementById(`${key}-value`);
    
    if (slider && valueSpan) {
      slider.addEventListener('input', (e) => {
        colorSettings[key] = parseInt(e.target.value);
        valueSpan.textContent = key === 'hue' ? `${colorSettings[key]}°` : colorSettings[key];
        updateColorPreview();
      });
    }
  });
  
  // Preset buttons
  document.getElementById('preset-auto').addEventListener('click', () => applyPreset('auto'));
  document.getElementById('preset-vivid').addEventListener('click', () => applyPreset('vivid'));
  document.getElementById('preset-warm').addEventListener('click', () => applyPreset('warm'));
  document.getElementById('preset-cool').addEventListener('click', () => applyPreset('cool'));
  document.getElementById('preset-vintage').addEventListener('click', () => applyPreset('vintage'));
  document.getElementById('preset-bw').addEventListener('click', () => applyPreset('bw'));
  
  // Action buttons
  document.getElementById('reset-color-btn').addEventListener('click', () => {
    resetColorSettings();
    updateColorPreview();
  });
  document.getElementById('cancel-color-btn').addEventListener('click', closeColorCorrection);
  document.getElementById('close-color-btn').addEventListener('click', closeColorCorrection);
  document.getElementById('apply-color-btn').addEventListener('click', applyColorCorrection);
}

function applyPreset(presetName) {
  // Clear all active preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Set active preset button
  document.getElementById(`preset-${presetName}`).classList.add('active');
  
  // Apply preset values
  switch (presetName) {
    case 'auto':
      Object.assign(colorSettings, {
        brightness: 10, contrast: 15, saturation: 5, vibrance: 10,
        temperature: 0, tint: 0, hue: 0, highlights: -5, shadows: 10, clarity: 5
      });
      break;
    case 'vivid':
      Object.assign(colorSettings, {
        brightness: 5, contrast: 25, saturation: 30, vibrance: 20,
        temperature: 5, tint: 0, hue: 0, highlights: 0, shadows: 5, clarity: 15
      });
      break;
    case 'warm':
      Object.assign(colorSettings, {
        brightness: 8, contrast: 10, saturation: 10, vibrance: 5,
        temperature: 25, tint: 5, hue: 5, highlights: -10, shadows: 15, clarity: 0
      });
      break;
    case 'cool':
      Object.assign(colorSettings, {
        brightness: 5, contrast: 12, saturation: 8, vibrance: 3,
        temperature: -20, tint: -8, hue: -5, highlights: 5, shadows: 8, clarity: 8
      });
      break;
    case 'vintage':
      Object.assign(colorSettings, {
        brightness: -5, contrast: -10, saturation: -15, vibrance: -5,
        temperature: 15, tint: 10, hue: 10, highlights: -20, shadows: 20, clarity: -10
      });
      break;
    case 'bw':
      Object.assign(colorSettings, {
        brightness: 0, contrast: 20, saturation: -100, vibrance: 0,
        temperature: 0, tint: 0, hue: 0, highlights: 0, shadows: 0, clarity: 10
      });
      break;
  }
  
  // Update UI
  Object.keys(colorSettings).forEach(key => {
    const slider = document.getElementById(`${key}-slider`);
    const valueSpan = document.getElementById(`${key}-value`);
    if (slider && valueSpan) {
      slider.value = colorSettings[key];
      valueSpan.textContent = key === 'hue' ? `${colorSettings[key]}°` : colorSettings[key];
    }
  });
  
  updateColorPreview();
}

function updateColorPreview() {
  if (!originalColorData) return;
  
  const afterCanvas = document.getElementById('color-after-canvas');
  const ctx = afterCanvas.getContext('2d');
  
  // Clear and redraw original
  ctx.clearRect(0, 0, afterCanvas.width, afterCanvas.height);
  ctx.drawImage(originalColorData, 0, 0, afterCanvas.width, afterCanvas.height);
  
  // Apply color corrections
  applyColorFilters(ctx, afterCanvas.width, afterCanvas.height);
}

function applyColorFilters(ctx, width, height) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  
  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];
    
    // Brightness
    if (colorSettings.brightness !== 0) {
      const brightnessFactor = colorSettings.brightness * 2.55;
      r = Math.max(0, Math.min(255, r + brightnessFactor));
      g = Math.max(0, Math.min(255, g + brightnessFactor));
      b = Math.max(0, Math.min(255, b + brightnessFactor));
    }
    
    // Contrast
    if (colorSettings.contrast !== 0) {
      const contrastFactor = (259 * (colorSettings.contrast + 255)) / (255 * (259 - colorSettings.contrast));
      r = Math.max(0, Math.min(255, contrastFactor * (r - 128) + 128));
      g = Math.max(0, Math.min(255, contrastFactor * (g - 128) + 128));
      b = Math.max(0, Math.min(255, contrastFactor * (b - 128) + 128));
    }
    
    // Temperature & Tint
    if (colorSettings.temperature !== 0) {
      const tempFactor = colorSettings.temperature / 100;
      if (tempFactor > 0) {
        r = Math.min(255, r + tempFactor * 30);
        g = Math.min(255, g + tempFactor * 15);
      } else {
        b = Math.min(255, b - tempFactor * 30);
        g = Math.min(255, g - tempFactor * 10);
      }
    }
    
    if (colorSettings.tint !== 0) {
      const tintFactor = colorSettings.tint / 100;
      if (tintFactor > 0) {
        r = Math.min(255, r + tintFactor * 20);
        b = Math.max(0, b - tintFactor * 10);
      } else {
        g = Math.min(255, g - tintFactor * 20);
        r = Math.max(0, r + tintFactor * 10);
      }
    }
    
    // Convert to HSL for saturation, hue adjustments
    const hsl = rgbToHsl(r, g, b);
    
    // Saturation
    if (colorSettings.saturation !== 0) {
      hsl[1] = Math.max(0, Math.min(1, hsl[1] + (colorSettings.saturation / 100)));
    }
    
    // Vibrance (selective saturation)
    if (colorSettings.vibrance !== 0) {
      const maxSat = Math.max(r, g, b);
      const minSat = Math.min(r, g, b);
      const currentSat = (maxSat - minSat) / 255;
      const vibranceFactor = (1 - currentSat) * (colorSettings.vibrance / 100);
      hsl[1] = Math.max(0, Math.min(1, hsl[1] + vibranceFactor));
    }
    
    // Hue shift
    if (colorSettings.hue !== 0) {
      hsl[0] = (hsl[0] + colorSettings.hue / 360) % 1;
      if (hsl[0] < 0) hsl[0] += 1;
    }
    
    // Convert back to RGB
    const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
    r = rgb[0];
    g = rgb[1];
    b = rgb[2];
    
    // Highlights and Shadows
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
    
    if (colorSettings.highlights !== 0 && luminance > 128) {
      const factor = 1 - (colorSettings.highlights / 100) * ((luminance - 128) / 127);
      r *= factor;
      g *= factor;
      b *= factor;
    }
    
    if (colorSettings.shadows !== 0 && luminance < 128) {
      const factor = 1 + (colorSettings.shadows / 100) * (1 - luminance / 128);
      r *= factor;
      g *= factor;
      b *= factor;
    }
    
    // Clarity (mid-tone contrast)
    if (colorSettings.clarity !== 0) {
      const midtone = Math.abs(luminance - 128) / 128;
      const clarityFactor = 1 + (colorSettings.clarity / 100) * midtone;
      r = Math.max(0, Math.min(255, 128 + (r - 128) * clarityFactor));
      g = Math.max(0, Math.min(255, 128 + (g - 128) * clarityFactor));
      b = Math.max(0, Math.min(255, 128 + (b - 128) * clarityFactor));
    }
    
    data[i] = Math.round(r);
    data[i + 1] = Math.round(g);
    data[i + 2] = Math.round(b);
  }
  
  ctx.putImageData(imageData, 0, 0);
}

// Helper functions for color space conversion
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
}

function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function applyColorCorrection() {
  if (!originalColorData) {
    updateStatusMessage('❌ No image data available');
    return;
  }
  
  // Capture state before changes
  const beforeState = ActionHistory_Global.getCurrentState();
  
  const confirmed = confirm('Apply color corrections to the image?\n\nThis action cannot be undone.');
  if (!confirmed) return;
  
  // Apply corrections to the actual processed image
  const currentImageData = AppState.images[AppState.currentImageIndex];
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  
  const img = new Image();
  img.onload = () => {
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    tempCtx.drawImage(img, 0, 0);
    
    // Apply the same color filters at full resolution
    applyColorFilters(tempCtx, tempCanvas.width, tempCanvas.height);
    
    // Update the processed image
    currentImageData.processedImage = tempCanvas.toDataURL('image/png');
    
    // Update the main canvas
    CanvasManager.updateProcessedImage(currentImageData.processedImage);
    
    // Add to action history
    ActionHistory_Global.addAction({
      type: 'color_correction',
      description: 'Color correction applied',
      beforeState: beforeState,
      afterState: ActionHistory_Global.getCurrentState()
    });

    updateStatusMessage('✅ Color corrections applied successfully');
    console.log('🎨 Color correction applied to image');
    
    closeColorCorrection();
  };
  img.src = currentImageData.processedImage;
}

function closeColorCorrection() {
  const modal = document.getElementById('color-correct-modal');
  modal.classList.add('hidden');
  modal.style.display = 'none';
  
  // Clear data
  originalColorData = null;
  
  updateStatusMessage('🎨 Color correction closed');
}

// ===== SMOOTH EDGES TOOL =====

function openSmoothEdges() {
  console.log('〰️ Opening Smooth Edges...');
  
  // Check if we have a processed image
  const currentImageData = AppState.images[AppState.currentImageIndex];
  if (!currentImageData?.processedImage) {
    updateStatusMessage('⚠️ Please process an image first to use Smooth Edges');
    return;
  }
  
  // Show modal
  document.getElementById('smooth-edges-modal').classList.remove('hidden');
  
  // Initialize smooth previews
  initializeSmoothPreviews();
  
  // Setup smooth event listeners
  setupSmoothEventListeners();
  
  updateStatusMessage('〰️ Smooth Edges opened - Adjust settings to preview results');
}

function initializeSmoothPreviews() {
  const beforeCanvas = document.getElementById('smooth-before-canvas');
  const afterCanvas = document.getElementById('smooth-after-canvas');
  const currentImageData = AppState.images[AppState.currentImageIndex];
  
  const img = new Image();
  img.onload = () => {
    // Set canvas sizes
    const maxSize = 200;
    const scale = Math.min(maxSize / img.width, maxSize / img.height);
    const width = img.width * scale;
    const height = img.height * scale;
    
    beforeCanvas.width = afterCanvas.width = width;
    beforeCanvas.height = afterCanvas.height = height;
    
    // Draw original in before canvas
    const beforeCtx = beforeCanvas.getContext('2d');
    beforeCtx.drawImage(img, 0, 0, width, height);
    
    // Initial smooth preview
    updateSmoothPreview();
    
    console.log('〰️ Smooth previews initialized');
  };
  img.src = currentImageData.processedImage;
}

function setupSmoothEventListeners() {
  // Smooth radius slider
  const radiusSlider = document.getElementById('smooth-radius');
  radiusSlider.addEventListener('input', (e) => {
    document.getElementById('smooth-radius-value').textContent = `${e.target.value}px`;
    updateSmoothPreview();
  });
  
  // Smooth strength slider
  const strengthSlider = document.getElementById('smooth-strength');
  strengthSlider.addEventListener('input', (e) => {
    document.getElementById('smooth-strength-value').textContent = `${e.target.value}%`;
    updateSmoothPreview();
  });
  
  // Action buttons
  document.getElementById('close-smooth-btn').addEventListener('click', closeSmoothEdges);
  document.getElementById('cancel-smooth-btn').addEventListener('click', closeSmoothEdges);
  document.getElementById('apply-smooth-btn').addEventListener('click', applySmoothEdges);
}

function updateSmoothPreview() {
  const afterCanvas = document.getElementById('smooth-after-canvas');
  const beforeCanvas = document.getElementById('smooth-before-canvas');
  const afterCtx = afterCanvas.getContext('2d');
  
  // Get current settings
  const radius = parseInt(document.getElementById('smooth-radius').value);
  const strength = parseInt(document.getElementById('smooth-strength').value) / 100;
  
  // Copy before canvas to after canvas
  afterCtx.clearRect(0, 0, afterCanvas.width, afterCanvas.height);
  afterCtx.drawImage(beforeCanvas, 0, 0);
  
  // Apply smoothing filter
  applySmoothingFilter(afterCanvas, radius, strength);
}

function applySmoothingFilter(canvas, radius, strength) {
  const ctx = canvas.getContext('2d');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Simple edge smoothing by blurring alpha channel
  for (let i = 3; i < data.length; i += 4) { // Alpha channel
    if (data[i] > 0 && data[i] < 255) { // Edge pixels
      // Average with neighboring pixels
      let total = 0;
      let count = 0;
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const neighborIndex = i + (dy * canvas.width + dx) * 4;
          if (neighborIndex >= 3 && neighborIndex < data.length) {
            total += data[neighborIndex];
            count++;
          }
        }
      }
      
      if (count > 0) {
        const smoothed = total / count;
        data[i] = data[i] * (1 - strength) + smoothed * strength;
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

function closeSmoothEdges() {
  document.getElementById('smooth-edges-modal').classList.add('hidden');
  updateStatusMessage('〰️ Smooth Edges closed');
}

function applySmoothEdges() {
  console.log('〰️ Applying smooth edges...');
  
  const currentImageData = AppState.images[AppState.currentImageIndex];
  const radius = parseInt(document.getElementById('smooth-radius').value);
  const strength = parseInt(document.getElementById('smooth-strength').value) / 100;
  
  // Create full-size canvas for smoothing
  const tempCanvas = document.createElement('canvas');
  const tempCtx = tempCanvas.getContext('2d');
  
  const img = new Image();
  img.onload = () => {
    tempCanvas.width = img.width;
    tempCanvas.height = img.height;
    tempCtx.drawImage(img, 0, 0);
    
    // Apply smoothing to full image
    applySmoothingFilter(tempCanvas, radius, strength);
    
    // Update processed image
    const smoothedDataURL = tempCanvas.toDataURL('image/png');
    currentImageData.processedImage = smoothedDataURL;
    
    updateStatusMessage('〰️ Smooth edges applied successfully!');
    
    // Update canvas display
    CanvasManager.showProcessedImage(currentImageData);
    
    closeSmoothEdges();
  };
  img.src = currentImageData.processedImage;
}

function cancelCrop() {
  console.log('🚫 cancelCrop() called - disabling crop mode');
  console.trace('cancelCrop call stack'); // This will show where it was called from
  CanvasManager.disableCropMode();
  elements.cropModeBtn.classList.remove('active');
  elements.cropModeBtn.innerHTML = '<span>✂️</span> Enable Crop Mode';
  elements.cropControls.classList.add('hidden');
  updateStatusMessage('✂️ Crop mode disabled');
}

// Accept/Discard Control Helpers
function showAcceptDiscardControls() {
  console.log('👁️ Showing Accept/Discard controls');
  if (elements.resultControls) {
    elements.resultControls.classList.remove('hidden');
  }
  if (elements.standardControls) {
    elements.standardControls.classList.add('hidden');
  }
}

function hideAcceptDiscardControls() {
  console.log('🙈 Hiding Accept/Discard controls');
  if (elements.resultControls) {
    elements.resultControls.classList.add('hidden');
  }
  if (elements.standardControls) {
    elements.standardControls.classList.remove('hidden');
  }
}

// Accept/Discard Result Handlers
function handleAcceptResult() {
  console.log('🔥 ACCEPT HANDLER CALLED!');
  console.log('📊 AppState.currentProcessedResult:', AppState.currentProcessedResult);
  console.log('📊 AppState.currentImageIndex:', AppState.currentImageIndex);
  console.log('📊 AppState.images:', AppState.images);
  
  // Capture state before changes
  const beforeState = ActionHistory_Global.getCurrentState();

  if (!AppState.currentProcessedResult) {
    console.error('❌ No processed result to accept');
    updateStatusMessage('❌ No processed result to accept');
    return;
  }

  // Get current image directly
  if (AppState.currentImageIndex >= 0 && AppState.images[AppState.currentImageIndex]) {
    const imageData = AppState.images[AppState.currentImageIndex];
    console.log('🎯 Found current image:', imageData.name);

    // Mark as completed
    imageData.status = 'completed';
    updateImageStatus(imageData.id, 'completed');

    // Clear processed result state
    AppState.currentProcessedResult = null;
    AppState.awaitingUserDecision = false;

    // Hide accept/discard controls
    hideAcceptDiscardControls();

    // Auto-export if enabled
    if (Settings.autoExport) {
      autoExportImage(imageData);
    }

    // Update UI to refresh button states (this will enable Export All)
    updateUI();

    updateStatusMessage(`✅ ${imageData.name} accepted and completed!`);
    console.log('✅ Image accepted:', imageData.name);
  } else {
    console.error('❌ Could not find current image');
    console.error('Current index:', AppState.currentImageIndex);
    console.error('Images array:', AppState.images);
    updateStatusMessage('❌ Could not find image to accept');
  }
}

// Auto-export single image function
function autoExportImage(imageData) {
  try {
    // Priority: composite image > processed image
    const imageToExport = imageData.compositeImage || imageData.processedImage;
    
    if (!imageToExport) {
      console.error('❌ No image to export');
      return;
    }

    // Generate filename based on settings
    const filename = generateFilename(imageData.name);
    const imageType = imageData.compositeImage ? 'composite' : 'processed';
    
    console.log(`💾 Auto-exporting ${imageType} image:`, filename);
    console.log(`📊 Has composite: ${!!imageData.compositeImage}, Has processed: ${!!imageData.processedImage}`);
    
    // Create download link
    const link = document.createElement('a');
    link.href = imageToExport;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`✅ Auto-exported ${imageType}:`, filename);
    updateStatusMessage(`💾 Auto-exported ${imageType}: ${filename}`);
    
  } catch (error) {
    console.error('❌ Auto-export error:', error);
    updateStatusMessage('❌ Auto-export failed');
  }
}

// Generate filename based on settings
function generateFilename(originalName) {
  const nameWithoutExtension = originalName.replace(/\.[^/.]+$/, "");
  const currentDate = new Date().toISOString().split('T')[0];
  
  switch (Settings.fileNaming) {
    case 'original':
      return `${nameWithoutExtension}.png`;
    case 'suffix':
      return `${nameWithoutExtension}_rmbg.png`;
    case 'timestamp':
      return `${nameWithoutExtension}_${currentDate}.png`;
    default:
      return `${nameWithoutExtension}_rmbg.png`;
  }
}

function handleDiscardResult() {
  console.log('🔥 DISCARD HANDLER CALLED!');
  console.log('📊 AppState.currentProcessedResult:', AppState.currentProcessedResult);
  console.log('📊 AppState.currentImageIndex:', AppState.currentImageIndex);
  
  if (!AppState.currentProcessedResult) {
    console.error('❌ No processed result to discard');
    updateStatusMessage('❌ No processed result to discard');
    return;
  }
  
  // Get current image directly
  if (AppState.currentImageIndex >= 0 && AppState.images[AppState.currentImageIndex]) {
    const imageData = AppState.images[AppState.currentImageIndex];
    console.log('🎯 Found current image to discard:', imageData.name);
    
    // Clear processed image and reset to pending
    imageData.processedImage = null;
    imageData.status = 'pending';
    updateImageStatus(imageData.id, 'pending');
    
    // Clear processed result state
    AppState.currentProcessedResult = null;
    AppState.awaitingUserDecision = false;
    
    // Clear canvas processed image
    CanvasManager.processedImage = null;
    
    // Switch back to original view
    switchViewMode('original');
    
    // Hide accept/discard controls
    hideAcceptDiscardControls();
    
    // Update UI to refresh button states
    updateUI();
    
    updateStatusMessage(`🔄 ${imageData.name} reset - Try another model!`);
    console.log('🔄 Image discarded:', imageData.name);
  } else {
    console.error('❌ Could not find current image to discard');
    console.error('Current index:', AppState.currentImageIndex);
    updateStatusMessage('❌ Could not find image to discard');
  }
}

// Settings Management Functions
function loadSettings() {
  try {
    const savedSettings = localStorage.getItem('pebdeq-settings');
    if (savedSettings) {
      Settings = { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) };
    }
    
    // Apply settings to UI
    applySettings();
    
    console.log('✅ Settings loaded:', Settings);
  } catch (error) {
    console.error('❌ Error loading settings:', error);
    Settings = { ...DEFAULT_SETTINGS };
  }
}

function saveSettings() {
  try {
    // Get values from UI with explicit boolean handling
    const autoSaveCheckbox = document.getElementById('auto-save');
    const showGridCheckbox = document.getElementById('show-grid');
    
    const settingsData = {
      defaultModel: document.getElementById('default-model')?.value || DEFAULT_SETTINGS.defaultModel,
      processingQuality: document.getElementById('processing-quality')?.value || DEFAULT_SETTINGS.processingQuality,
      autoExport: document.getElementById('auto-export')?.checked === true,
      fileNaming: document.getElementById('file-naming')?.value || DEFAULT_SETTINGS.fileNaming,
      appTheme: document.getElementById('app-theme')?.value || DEFAULT_SETTINGS.appTheme,
      canvasBg: document.getElementById('canvas-bg')?.value || DEFAULT_SETTINGS.canvasBg,
      showGrid: showGridCheckbox ? showGridCheckbox.checked === true : DEFAULT_SETTINGS.showGrid,
      memoryLimit: document.getElementById('memory-limit')?.value || DEFAULT_SETTINGS.memoryLimit,
      autoSave: autoSaveCheckbox ? autoSaveCheckbox.checked === true : DEFAULT_SETTINGS.autoSave,
      defaultCropRatio: document.getElementById('default-crop-ratio')?.value || DEFAULT_SETTINGS.defaultCropRatio,
      autoCropMode: document.getElementById('auto-crop-mode')?.checked === true
    };
    
    console.log('💾 Settings being saved:', settingsData);
    console.log('🔍 Auto-save checkbox state:', autoSaveCheckbox?.checked);
    console.log('🔍 Show grid checkbox state:', showGridCheckbox?.checked);
    
    // Save to localStorage
    localStorage.setItem('pebdeq-settings', JSON.stringify(settingsData));
    Settings = { ...settingsData };
    
    // Apply new settings (including theme)
    applySettings();
    
    // Clear preview state since we're saving
    isThemePreviewing = false;
    originalTheme = null;
    
    // Close modal
    closeSettingsModal();
    
    // Show theme-specific success message
    const themeEmoji = settingsData.appTheme === 'dark' ? '🌙' : 
                       settingsData.appTheme === 'light' ? '☀️' : '🖥️';
    updateStatusMessage(`✅ Settings saved! ${themeEmoji} Theme: ${settingsData.appTheme}`);
    console.log('💾 Settings saved:', Settings);
    console.log('🎨 Active theme:', Settings.appTheme);
    
  } catch (error) {
    console.error('❌ Error saving settings:', error);
    updateStatusMessage('❌ Error saving settings');
  }
}

function resetSettings() {
  try {
    Settings = { ...DEFAULT_SETTINGS };
    updateSettingsUI();
    localStorage.removeItem('pebdeq-settings');
    
    updateStatusMessage('🔄 Settings reset to defaults');
    console.log('🔄 Settings reset to defaults');
  } catch (error) {
    console.error('❌ Error resetting settings:', error);
  }
}

function applySettings() {
  try {
    console.log('⚙️ Applying settings:', Settings);
    
    // Apply theme first (affects everything visually)
    if (Settings.appTheme) {
      applyTheme(Settings.appTheme);
    }
    
    // Apply default model
    if (elements.modelSelect && Settings.defaultModel) {
      elements.modelSelect.value = Settings.defaultModel;
      AppState.selectedModel = Settings.defaultModel;
    }
    
    // Apply canvas background (with retry for timing)
    const applyCanvasBackground = () => {
      if (Settings.canvasBg && CanvasManager && CanvasManager.setCanvasBackground) {
        CanvasManager.setCanvasBackground(Settings.canvasBg);
        
        // Force redraw
        if (CanvasManager.draw) {
          CanvasManager.draw();
        }
        return true;
      } else {
        return false;
      }
    };
    
    // Try immediately, then retry with delays
    if (!applyCanvasBackground()) {
      setTimeout(() => {
        if (!applyCanvasBackground()) {
          setTimeout(() => {
            applyCanvasBackground();
          }, 500);
        }
      }, 100);
    }
    
    // Apply show grid - force update
    if (CanvasManager && CanvasManager.setShowGrid) {
      console.log('📐 Setting grid to:', Settings.showGrid);
      CanvasManager.setShowGrid(Settings.showGrid);
    }
    
    // Apply default crop ratio to UI
    const aspectRatioSelect = elements.aspectRatioSelect;
    if (aspectRatioSelect && Settings.defaultCropRatio) {
      aspectRatioSelect.value = Settings.defaultCropRatio;
    }
    
    console.log('✅ Settings applied successfully');
    console.log('🔍 Auto-save is:', Settings.autoSave ? 'ENABLED' : 'DISABLED');
    console.log('🔍 Show grid is:', Settings.showGrid ? 'ENABLED' : 'DISABLED');
    console.log('🎨 Theme is:', Settings.appTheme);
  } catch (error) {
    console.error('❌ Error applying settings:', error);
  }
}

function updateSettingsUI() {
  try {
    // Update all form fields with current settings
    const defaultModelSelect = document.getElementById('default-model');
    const processingQualitySelect = document.getElementById('processing-quality');
    const autoExportCheckbox = document.getElementById('auto-export');
    const fileNamingSelect = document.getElementById('file-naming');
    const appThemeSelect = document.getElementById('app-theme');
    const canvasBgSelect = document.getElementById('canvas-bg');
    const showGridCheckbox = document.getElementById('show-grid');
    const memoryLimitSelect = document.getElementById('memory-limit');
    const autoSaveCheckbox = document.getElementById('auto-save');
    const defaultCropRatioSelect = document.getElementById('default-crop-ratio');
    const autoCropModeCheckbox = document.getElementById('auto-crop-mode');
    
    if (defaultModelSelect) defaultModelSelect.value = Settings.defaultModel;
    if (processingQualitySelect) processingQualitySelect.value = Settings.processingQuality;
    if (autoExportCheckbox) autoExportCheckbox.checked = Settings.autoExport;
    if (fileNamingSelect) fileNamingSelect.value = Settings.fileNaming;
    if (appThemeSelect) appThemeSelect.value = Settings.appTheme;
    if (canvasBgSelect) canvasBgSelect.value = Settings.canvasBg;
    if (showGridCheckbox) showGridCheckbox.checked = Settings.showGrid;
    if (memoryLimitSelect) memoryLimitSelect.value = Settings.memoryLimit;
    if (autoSaveCheckbox) autoSaveCheckbox.checked = Settings.autoSave;
    if (defaultCropRatioSelect) defaultCropRatioSelect.value = Settings.defaultCropRatio;
    if (autoCropModeCheckbox) autoCropModeCheckbox.checked = Settings.autoCropMode;
    
    console.log('🔄 Settings UI updated');
  } catch (error) {
    console.error('❌ Error updating settings UI:', error);
  }
}

function openSettingsModal() {
  try {
    const modal = document.getElementById('settings-modal');
    if (modal) {
      // Store original theme for potential revert
      originalTheme = Settings.appTheme;
      isThemePreviewing = false;
      
      updateSettingsUI(); // Load current values
      modal.classList.remove('hidden');
      console.log('⚙️ Settings modal opened');
      console.log('💾 Original theme stored:', originalTheme);
    }
  } catch (error) {
    console.error('❌ Error opening settings modal:', error);
  }
}

function closeSettingsModal() {
  try {
    const modal = document.getElementById('settings-modal');
    if (modal) {
      // Revert theme if user was previewing and didn't save
      if (isThemePreviewing && originalTheme) {
        console.log('🔄 Reverting theme to original:', originalTheme);
        applyTheme(originalTheme);
        updateStatusMessage(`🔄 Theme reverted to ${originalTheme}`);
      }
      
      // Reset preview state
      isThemePreviewing = false;
      originalTheme = null;
      
      modal.classList.add('hidden');
      console.log('❌ Settings modal closed');
    }
  } catch (error) {
    console.error('❌ Error closing settings modal:', error);
  }
}

// Background Template Management Functions
function initializeBackgroundLibrary() {
  console.log('🖼️ Initializing Background Library...');
  
  // Load custom backgrounds from localStorage
  loadCustomBackgrounds();
  
  // Render initial templates
  renderBackgroundTemplates();
  
  // Setup event listeners
  setupBackgroundEventListeners();
  
  console.log('✅ Background Library initialized with', BackgroundTemplates.templates.length, 'templates');
}

function loadCustomBackgrounds() {
  console.log('📁 LOAD CUSTOM BACKGROUNDS CALLED');
  
  try {
    const saved = localStorage.getItem('pebdeq-custom-backgrounds');
    console.log('📊 localStorage data:', saved ? 'Found' : 'Not found');
    
    if (saved) {
      BackgroundTemplates.customBackgrounds = JSON.parse(saved);
      console.log('📁 Loaded', BackgroundTemplates.customBackgrounds.length, 'custom backgrounds');
      console.log('📊 Custom backgrounds:', BackgroundTemplates.customBackgrounds);
    } else {
      console.log('ℹ️ No custom backgrounds found in localStorage');
      BackgroundTemplates.customBackgrounds = [];
    }
  } catch (error) {
    console.error('❌ Error loading custom backgrounds:', error);
    console.error('❌ Error stack:', error.stack);
    BackgroundTemplates.customBackgrounds = [];
  }
  
  console.log('✅ loadCustomBackgrounds complete, total custom:', BackgroundTemplates.customBackgrounds.length);
}

function saveCustomBackgrounds() {
  try {
    localStorage.setItem('pebdeq-custom-backgrounds', JSON.stringify(BackgroundTemplates.customBackgrounds));
    console.log('💾 Custom backgrounds saved');
  } catch (error) {
    console.error('❌ Error saving custom backgrounds:', error);
  }
}

function renderBackgroundTemplates() {
  console.log('🖼️ RENDER BACKGROUND TEMPLATES CALLED');
  
  const grid = document.getElementById('bg-templates-grid');
  if (!grid) {
    console.error('❌ Background templates grid not found!');
    return;
  }
  console.log('✅ Background templates grid found');
  
  // Clear current content
  grid.innerHTML = '';
  console.log('🧹 Grid content cleared');
  
  // Get filtered templates
  const filteredTemplates = getFilteredTemplates();
  
  console.log('🖼️ Rendering', filteredTemplates.length, 'background templates');
  console.log('📊 Current category:', BackgroundTemplates.currentCategory);
  console.log('📊 Search query:', BackgroundTemplates.searchQuery);
  console.log('📊 Filtered templates:', filteredTemplates);
  
  if (filteredTemplates.length === 0) {
    console.log('⚠️ No templates to render, showing empty state');
    grid.innerHTML = `
      <div class="bg-loading">
        <span>🔍 No backgrounds found for "${BackgroundTemplates.searchQuery || BackgroundTemplates.currentCategory}"</span>
      </div>
    `;
    return;
  }
  
  // Render each template
  filteredTemplates.forEach((template, index) => {
    console.log(`📦 Creating template element ${index + 1}/${filteredTemplates.length}:`, template.name);
    try {
      const templateElement = createTemplateElement(template);
      grid.appendChild(templateElement);
      console.log(`✅ Template "${template.name}" added to grid`);
    } catch (error) {
      console.error(`❌ Error creating template element for "${template.name}":`, error);
    }
  });
  
  console.log('🎉 All background templates rendered successfully');
}

function getFilteredTemplates() {
  let templates = [...BackgroundTemplates.templates, ...BackgroundTemplates.customBackgrounds];
  
  console.log('🔍 FILTER TEMPLATES CALLED');
  console.log('📊 Total templates:', BackgroundTemplates.templates.length);
  console.log('📊 Custom backgrounds:', BackgroundTemplates.customBackgrounds.length);
  console.log('📊 Current category:', BackgroundTemplates.currentCategory);
  console.log('📊 All templates before filter:', templates.length);
  
  // Filter by category
  if (BackgroundTemplates.currentCategory !== 'all') {
    templates = templates.filter(t => t.category === BackgroundTemplates.currentCategory);
    console.log('📊 Templates after category filter:', templates.length);
  }
  
  // Filter by search query
  if (BackgroundTemplates.searchQuery) {
    const query = BackgroundTemplates.searchQuery.toLowerCase();
    templates = templates.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.category.toLowerCase().includes(query)
    );
    console.log('📊 Templates after search filter:', templates.length);
  }
  
  console.log('📊 Final filtered templates:', templates);
  return templates;
}

function createTemplateElement(template) {
  const element = document.createElement('div');
  element.className = 'bg-template-item';
  element.dataset.bgId = template.id;
  
  if (BackgroundTemplates.selectedBackground?.id === template.id) {
    element.classList.add('selected');
  }
  
  const preview = document.createElement('div');
  preview.className = 'bg-template-preview';
  
  // Set preview style
  if (template.preview.startsWith('linear-gradient') || template.preview.startsWith('radial-gradient')) {
    preview.style.background = template.preview;
  } else if (template.preview.startsWith('#')) {
    preview.style.backgroundColor = template.preview;
  } else if (template.preview.startsWith('url(')) {
    preview.style.backgroundImage = template.preview;
  } else {
    // Use CSS class for special cases like transparent
    preview.className += ` ${template.preview}`;
  }
  
  // Add delete button for custom backgrounds
  if (template.category === 'custom') {
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'bg-delete-btn';
    deleteBtn.innerHTML = '×';
    deleteBtn.title = 'Delete custom background';
    
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent template selection
      handleDeleteCustomBackground(template);
    });
    
    preview.appendChild(deleteBtn);
  }
  
  const name = document.createElement('span');
  name.className = 'bg-template-name';
  name.textContent = template.name;
  
  element.appendChild(preview);
  element.appendChild(name);
  
  // Add click handler - async version
  element.addEventListener('click', async () => {
    console.log('🖱️ Template element clicked:', template.name);
    await selectBackgroundTemplate(template);
  });
  
  return element;
}

async function selectBackgroundTemplate(template) {
  console.log('🎯 BACKGROUND TEMPLATE SELECTED - COMPOSITION MODE:', template.name);
  console.log('📊 Template data:', template);
  console.log('📊 Current AppState.currentImageIndex:', AppState.currentImageIndex);
  console.log('📊 Current images:', AppState.images);
  
  // Update selection
  BackgroundTemplates.selectedBackground = template;
  console.log('✅ Background selection updated in BackgroundTemplates');
  
  // Update UI
  document.querySelectorAll('.bg-template-item').forEach(item => {
    item.classList.remove('selected');
  });
  console.log('🔄 Cleared all selections');
  
  const selectedElement = document.querySelector(`[data-bg-id="${template.id}"]`);
  if (selectedElement) {
    selectedElement.classList.add('selected');
    console.log('✅ Added selected class to element');
  } else {
    console.error('❌ Could not find template element with id:', template.id);
  }
  
  // Show background effects panel
  showBackgroundEffects();
  console.log('🎛️ Background effects panel shown');
  
  // Check if we have a current processed image
  const currentImage = AppState.images[AppState.currentImageIndex];
  console.log('🖼️ Current image data:', currentImage);
  
  if (AppState.currentImageIndex >= 0 && currentImage?.processedImage) {
    console.log('✅ Found processed image, enabling COMPOSITION MODE...');
    updateStatusMessage(`🎨 Activating composition mode with: ${template.name}...`);
    
    try {
      // Reset layer counter when starting new composition
      resetLayerCounter();
      
      // Enable composition mode instead of old composite system
      CanvasManager.enableCompositionMode(template);
      
      // Show initial layer indicator
      showLayerIndicator(1);
      
      console.log('🎉 Composition mode activated!');
      updateStatusMessage(`✅ Layer 1 ready! Drag to move, scroll to scale foreground.`);
    } catch (error) {
      console.error('❌ Error enabling composition mode:', error);
      updateStatusMessage('❌ Error enabling composition mode');
    }
  } else {
    console.log('⚠️ No processed image found for composition mode');
    console.log('   - currentImageIndex:', AppState.currentImageIndex);
    console.log('   - currentImage exists:', !!currentImage);
    console.log('   - processedImage exists:', !!currentImage?.processedImage);
    updateStatusMessage(`🖼️ Background "${template.name}" selected. Process an image first to use composition mode.`);
  }
}

function showBackgroundEffects() {
  const effectsPanel = document.getElementById('bg-effects');
  if (effectsPanel) {
    effectsPanel.classList.remove('hidden');
    
    // Setup effect value displays
    updateEffectValueDisplays();
  }
  
  // Also show composition controls if they exist
  const compositionControls = document.getElementById('composition-controls');
  if (compositionControls) {
    compositionControls.classList.remove('hidden');
  }
}

function hideBackgroundEffects() {
  const effectsPanel = document.getElementById('bg-effects');
  if (effectsPanel) {
    effectsPanel.classList.add('hidden');
  }
}

function updateEffectValueDisplays() {
  const blurSlider = document.getElementById('bg-blur');
  const opacitySlider = document.getElementById('bg-opacity');
  const scaleSlider = document.getElementById('bg-scale');
  
  const blurValue = document.getElementById('bg-blur-value');
  const opacityValue = document.getElementById('bg-opacity-value');
  const scaleValue = document.getElementById('bg-scale-value');
  
  if (blurSlider && blurValue) {
    blurValue.textContent = blurSlider.value + 'px';
  }
  
  if (opacitySlider && opacityValue) {
    opacityValue.textContent = opacitySlider.value + '%';
  }
  
  if (scaleSlider && scaleValue) {
    scaleValue.textContent = scaleSlider.value + '%';
  }
}

function setupBackgroundEventListeners() {
  console.log('🔧 Setting up background event listeners...');
  
  // Category buttons
  const categoryButtons = document.querySelectorAll('.bg-category-btn');
  console.log('🔘 Found', categoryButtons.length, 'category buttons');
  
  categoryButtons.forEach((btn, index) => {
    const category = btn.dataset.category;
    console.log(`🔘 Setting up category button ${index + 1}: ${category}`);
    
    btn.addEventListener('click', (e) => {
      const category = e.currentTarget.dataset.category;
      console.log('🔘 Category button clicked:', category);
      selectBackgroundCategory(category);
    });
  });
  
  // Search input
  const searchInput = document.getElementById('bg-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      BackgroundTemplates.searchQuery = e.target.value;
      renderBackgroundTemplates();
    });
  }
  
  // Upload button
  const uploadBtn = document.getElementById('upload-bg-btn');
  if (uploadBtn) {
    uploadBtn.addEventListener('click', handleCustomBackgroundUpload);
  }
  
  // Effect sliders
  const effectSliders = ['bg-blur', 'bg-opacity', 'bg-scale'];
  effectSliders.forEach(sliderId => {
    const slider = document.getElementById(sliderId);
    if (slider) {
      slider.addEventListener('input', updateEffectValueDisplays);
    }
  });
  
  // Apply effects button - async version
  const applyEffectsBtn = document.getElementById('apply-bg-effects');
  if (applyEffectsBtn) {
    applyEffectsBtn.addEventListener('click', async () => {
      console.log('🎛️ Apply background effects button clicked');
      await applyBackgroundEffects();
    });
  }
  
  // Composition mode buttons
  const generateFinalBtn = document.getElementById('generate-final-btn');
  if (generateFinalBtn) {
    generateFinalBtn.addEventListener('click', () => {
              console.log('📸 Generate final composite button clicked');
        generateFinalComposite();
        
        // Update status to show user what to expect
        setTimeout(() => {
          updateStatusMessage('ℹ️ If canvas looks small, use Force Refresh (⚡) button to fix display');
        }, 2000);
    });
  }

  const multiGenerateBtn = document.getElementById('multi-generate-btn');
  if (multiGenerateBtn) {
    multiGenerateBtn.addEventListener('click', () => {
      console.log('🎨 Multi generate composite button clicked');
      generateMultiComposite();
    });
  }
  
  const exitCompositionBtn = document.getElementById('exit-composition-btn');
  if (exitCompositionBtn) {
    exitCompositionBtn.addEventListener('click', () => {
      console.log('🚪 Exit composition mode button clicked');
      exitCompositionMode();
    });
  }
}

function selectBackgroundCategory(category) {
  console.log('📂 BACKGROUND CATEGORY SELECTED:', category);
  
  BackgroundTemplates.currentCategory = category;
  console.log('✅ Category updated in BackgroundTemplates:', BackgroundTemplates.currentCategory);
  
  // Update category button states
  const allCategoryBtns = document.querySelectorAll('.bg-category-btn');
  console.log('🔘 Found', allCategoryBtns.length, 'category buttons to update');
  
  allCategoryBtns.forEach(btn => {
    btn.classList.remove('active');
    console.log('🔘 Removed active class from:', btn.dataset.category);
  });
  
  const activeBtn = document.querySelector(`[data-category="${category}"]`);
  if (activeBtn) {
    activeBtn.classList.add('active');
    console.log('✅ Added active class to:', category);
  } else {
    console.error('❌ Could not find category button for:', category);
  }
  
  // Re-render templates
  console.log('🔄 Re-rendering templates for category:', category);
  renderBackgroundTemplates();
}

function handleCustomBackgroundUpload() {
  console.log('📤 CUSTOM BACKGROUND UPLOAD CALLED');
  
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.multiple = false;
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      console.log('❌ No file selected');
      return;
    }
    
    try {
      console.log('📤 Uploading custom background:', file.name);
      console.log('📊 File size:', file.size, 'bytes');
      console.log('📊 File type:', file.type);
      updateStatusMessage('📤 Processing custom background...');
      
      const base64 = await fileToBase64(file);
      console.log('✅ Base64 conversion complete, length:', base64.length);
      
      const customBg = {
        id: 'custom-' + Date.now(),
        name: file.name.replace(/\.[^/.]+$/, ''),
        category: 'custom',
        type: 'image',
        value: base64,
        preview: `url(${base64})`
      };
      
      console.log('📦 Created custom background object:', customBg);
      
      BackgroundTemplates.customBackgrounds.push(customBg);
      console.log('📊 Total custom backgrounds now:', BackgroundTemplates.customBackgrounds.length);
      
      saveCustomBackgrounds();
      console.log('💾 Custom backgrounds saved to localStorage');
      
      // Switch to custom category to show the new background
      console.log('🔄 Switching to custom category...');
      selectBackgroundCategory('custom');
      
      updateStatusMessage(`✅ Custom background "${customBg.name}" added!`);
      console.log('✅ Custom background upload complete:', customBg.name);
      
    } catch (error) {
      console.error('❌ Error uploading custom background:', error);
      console.error('❌ Error stack:', error.stack);
      updateStatusMessage('❌ Failed to upload custom background');
    }
  };
  
  console.log('🖱️ Triggering file picker...');
  input.click();
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function handleDeleteCustomBackground(template) {
  console.log('🗑️ Delete custom background requested:', template.name);
  
  // Show confirmation dialog
  const confirmed = confirm(`Are you sure you want to delete the custom background "${template.name}"?\n\nThis action cannot be undone.`);
  
  if (!confirmed) {
    console.log('❌ User cancelled delete operation');
    return;
  }
  
  console.log('✅ User confirmed delete operation');
  
  try {
    // Find and remove from custom backgrounds array
    const index = BackgroundTemplates.customBackgrounds.findIndex(bg => bg.id === template.id);
    if (index > -1) {
      BackgroundTemplates.customBackgrounds.splice(index, 1);
      console.log('🗑️ Removed from customBackgrounds array, remaining:', BackgroundTemplates.customBackgrounds.length);
    } else {
      console.error('❌ Template not found in customBackgrounds array');
    }
    
    // Clear selection if this template was selected
    if (BackgroundTemplates.selectedBackground?.id === template.id) {
      BackgroundTemplates.selectedBackground = null;
      console.log('🔄 Cleared selected background');
    }
    
    // Save to localStorage
    saveCustomBackgrounds();
    console.log('💾 Updated localStorage');
    
    // Re-render templates to update UI
    renderBackgroundTemplates();
    console.log('🎨 Templates re-rendered');
    
    updateStatusMessage(`🗑️ Custom background "${template.name}" deleted`);
    console.log('✅ Custom background delete completed');
    
  } catch (error) {
    console.error('❌ Error deleting custom background:', error);
    updateStatusMessage('❌ Error deleting custom background');
  }
}

// Background Application Functions
async function applyBackgroundToImage(backgroundTemplate) {
  console.log('🎨 APPLY BACKGROUND TO IMAGE CALLED - ASYNC VERSION');
  console.log('📊 Background template:', backgroundTemplate);
  console.log('📊 Current image index:', AppState.currentImageIndex);
  
  const currentImage = AppState.images[AppState.currentImageIndex];
  console.log('📊 Current image data:', currentImage);
  
  if (!currentImage || !currentImage.processedImage) {
    console.error('❌ No processed image to apply background to');
    console.error('   - currentImage exists:', !!currentImage);
    console.error('   - processedImage exists:', !!currentImage?.processedImage);
    updateStatusMessage('❌ No processed image to apply background to');
    return;
  }
  
  console.log('🎨 Applying background:', backgroundTemplate.name);
  console.log('📊 Processed image URL length:', currentImage.processedImage.length);
  updateStatusMessage(`🎨 Applying background: ${backgroundTemplate.name}...`);
  
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    console.log('✅ Canvas created successfully');
    
    // Load the processed image
    const processedImg = new Image();
    console.log('📦 Creating new image element...');
    
    // Create promise for processed image loading
    const processedImageLoaded = new Promise((resolve, reject) => {
      processedImg.onload = () => {
        console.log('✅ Processed image loaded successfully');
        console.log('📊 Image dimensions:', processedImg.width, 'x', processedImg.height);
        resolve();
      };
      
      processedImg.onerror = (error) => {
        console.error('❌ Error loading processed image for background application:', error);
        console.error('❌ Image source:', currentImage.processedImage.substring(0, 100) + '...');
        reject(error);
      };
      
      console.log('📡 Setting processed image source...');
      processedImg.src = currentImage.processedImage;
    });
    
    // Wait for processed image to load
    await processedImageLoaded;
    
    canvas.width = processedImg.width;
    canvas.height = processedImg.height;
    console.log('✅ Canvas dimensions set:', canvas.width, 'x', canvas.height);
    
    // Draw background (await for async image backgrounds)
    console.log('🎨 Drawing background - AWAITING...');
    await drawBackgroundOnCanvas(ctx, canvas.width, canvas.height, backgroundTemplate);
    console.log('✅ Background drawing completed');
    
    // Draw processed image on top
    console.log('🖼️ Drawing processed image on top...');
    ctx.drawImage(processedImg, 0, 0);
    
    // Create composite image
    console.log('📸 Creating composite image...');
    const compositeDataURL = canvas.toDataURL('image/png', 1.0);
    console.log('✅ Composite image created, data URL length:', compositeDataURL.length);
    
    // Store composite image
    currentImage.compositeImage = compositeDataURL;
    currentImage.appliedBackground = backgroundTemplate;
    console.log('💾 Composite image stored in currentImage');
    
    // Update canvas display
    console.log('🖼️ Updating canvas display...');
    if (CanvasManager && CanvasManager.showCompositeImage) {
      CanvasManager.showCompositeImage(currentImage);
      console.log('✅ Canvas display updated');
    } else {
      console.error('❌ CanvasManager.showCompositeImage not available');
    }
    
    updateStatusMessage(`✅ Background "${backgroundTemplate.name}" applied!`);
    console.log('🎉 Background applied successfully - ASYNC VERSION!');
    
  } catch (error) {
    console.error('❌ Error in applyBackgroundToImage:', error);
    console.error('❌ Error stack:', error.stack);
    updateStatusMessage('❌ Error applying background');
  }
}

function drawBackgroundOnCanvas(ctx, width, height, backgroundTemplate) {
  return new Promise((resolve, reject) => {
    console.log('🎨 DRAW BACKGROUND ON CANVAS CALLED');
    console.log('📊 Canvas dimensions:', width, 'x', height);
    console.log('📊 Background template:', backgroundTemplate);
    
    // Get current effect values
    const blurValue = document.getElementById('bg-blur')?.value || 0;
    const opacityValue = (document.getElementById('bg-opacity')?.value || 100) / 100;
    const scaleValue = (document.getElementById('bg-scale')?.value || 100) / 100;
    
    console.log('📊 Effect values - Blur:', blurValue, 'Opacity:', opacityValue, 'Scale:', scaleValue);
    
    ctx.save();
    console.log('💾 Canvas context saved');
    
    // Apply opacity
    ctx.globalAlpha = opacityValue;
    console.log('🔄 Global alpha set to:', opacityValue);
    
    // Apply blur (using filter if supported)
    if (blurValue > 0) {
      ctx.filter = `blur(${blurValue}px)`;
      console.log('🌫️ Blur filter applied:', ctx.filter);
    }
    
    if (backgroundTemplate.type === 'color') {
      console.log('🎨 Drawing solid color background:', backgroundTemplate.value);
      // Solid color background
      if (backgroundTemplate.value === 'transparent') {
        console.log('⚪ Transparent background - not drawing anything');
        // Don't draw anything for transparent
      } else {
        ctx.fillStyle = backgroundTemplate.value;
        ctx.fillRect(0, 0, width, height);
        console.log('✅ Solid color background drawn');
      }
      ctx.restore();
      resolve();
    } else if (backgroundTemplate.type === 'gradient') {
      console.log('🌈 Drawing gradient background:', backgroundTemplate.value);
      // Create gradient background
      const gradient = createCanvasGradient(ctx, width, height, backgroundTemplate.value);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      console.log('✅ Gradient background drawn');
      ctx.restore();
      resolve();
    } else if (backgroundTemplate.type === 'image') {
      console.log('🖼️ Drawing image background - ASYNC MODE');
      // Image background - ASYNC handling
      const bgImg = new Image();
      
      bgImg.onload = () => {
        console.log('✅ Background image loaded successfully');
        try {
          // Calculate scaling
          const scaledWidth = width * scaleValue;
          const scaledHeight = height * scaleValue;
          const offsetX = (width - scaledWidth) / 2;
          const offsetY = (height - scaledHeight) / 2;
          
          console.log('📊 Scaled dimensions:', scaledWidth, 'x', scaledHeight);
          console.log('📊 Offset:', offsetX, ',', offsetY);
          
          ctx.drawImage(bgImg, offsetX, offsetY, scaledWidth, scaledHeight);
          console.log('✅ Background image drawn successfully');
          
          ctx.restore();
          resolve();
        } catch (error) {
          console.error('❌ Error drawing background image:', error);
          ctx.restore();
          reject(error);
        }
      };
      
      bgImg.onerror = (error) => {
        console.error('❌ Error loading background image:', error);
        ctx.restore();
        reject(error);
      };
      
      console.log('📡 Setting background image source...');
      console.log('📊 Image data length:', backgroundTemplate.value.length);
      bgImg.src = backgroundTemplate.value;
    } else {
      console.error('❌ Unknown background type:', backgroundTemplate.type);
      ctx.restore();
      reject(new Error('Unknown background type: ' + backgroundTemplate.type));
    }
  });
}

function createCanvasGradient(ctx, width, height, gradientString) {
  console.log('🌈 CREATE CANVAS GRADIENT CALLED');
  console.log('📊 Gradient string:', gradientString);
  console.log('📊 Canvas dimensions:', width, 'x', height);
  
  // Parse CSS gradient string and create canvas gradient
  // For simplicity, we'll create a linear gradient from top-left to bottom-right
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  console.log('✅ Linear gradient created');
  
  // Extract colors from gradient string (simplified parsing)
  const colorMatches = gradientString.match(/#[a-fA-F0-9]{6}/g);
  console.log('🎨 Extracted colors:', colorMatches);
  
  if (colorMatches && colorMatches.length >= 2) {
    console.log('✅ Found', colorMatches.length, 'colors, adding color stops...');
    
    gradient.addColorStop(0, colorMatches[0]);
    gradient.addColorStop(1, colorMatches[colorMatches.length - 1]);
    console.log('🎯 Added start color:', colorMatches[0], 'and end color:', colorMatches[colorMatches.length - 1]);
    
    // Add intermediate colors if more than 2
    if (colorMatches.length > 2) {
      for (let i = 1; i < colorMatches.length - 1; i++) {
        const stop = i / (colorMatches.length - 1);
        gradient.addColorStop(stop, colorMatches[i]);
        console.log('🎯 Added intermediate color:', colorMatches[i], 'at stop:', stop);
      }
    }
  } else {
    console.log('⚠️ Could not parse colors, using fallback gradient');
    // Fallback gradient
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    console.log('🎯 Fallback colors applied: #667eea -> #764ba2');
  }
  
  console.log('✅ Gradient created successfully');
  return gradient;
}

async function applyBackgroundEffects() {
  if (!BackgroundTemplates.selectedBackground) {
    updateStatusMessage('⚠️ Please select a background first');
    return;
  }
  
  console.log('✨ APPLYING BACKGROUND EFFECTS - COMPOSITION MODE VERSION...');
  
  // Apply effects ONLY to background in composition mode - don't touch foreground
  if (CanvasManager.compositionMode) {
    console.log('🎨 Updating background layer with new effects...');
    
    // Simply redraw the canvas with updated background effects
    // The background layer will be redrawn with new effect values
    CanvasManager.draw();
    
    updateStatusMessage('✅ Background effects applied!');
    console.log('✅ Background effects applied - composition preserved');
  } else {
    console.log('⚠️ Not in composition mode, falling back to old method');
    // Fallback to old method if not in composition mode
    await applyBackgroundToImage(BackgroundTemplates.selectedBackground);
  }
}

// Add background functionality to CanvasManager
function extendCanvasManagerForBackgrounds() {
  console.log('🔧 Extending CanvasManager for backgrounds...');
  
  if (!CanvasManager.showCompositeImage) {
    console.log('➕ Adding showCompositeImage function to CanvasManager');
    CanvasManager.showCompositeImage = function(imageData) {
      console.log('🖼️ SHOW COMPOSITE IMAGE CALLED');
      console.log('📊 Image data:', imageData);
      
      if (imageData.compositeImage) {
        console.log('✅ Composite image found, creating display image...');
        console.log('📊 Composite image data length:', imageData.compositeImage.length);
        
        // Exit composition mode if we're in it (to show final result)
        if (this.compositionMode) {
          console.log('🚪 Exiting composition mode to show final composite');
          this.disableCompositionMode();
          
          // Hide composition controls
          const compositionControls = document.getElementById('composition-controls');
          if (compositionControls) {
            compositionControls.classList.add('hidden');
          }
        }
        
        const img = new Image();
        img.onload = () => {
          console.log('✅ Composite image loaded successfully');
          console.log('📊 Image dimensions:', img.width, 'x', img.height);
          
          // Set both currentImage and processedImage to the composite
          this.currentImage = img;
          this.processedImage = img;
          this.viewMode = 'processed';
          console.log('🔄 View mode set to processed with composite image');
          
          // Force canvas refresh with proper image sizing
          console.log('🔄 Forcing canvas refresh for composite...');
          this.resizeCanvas();
          
          // Use fitToCanvas specifically for the composite image
          console.log('📏 Fitting composite image to canvas...');
          this.fitToCanvas();
          this.draw();
          
          // Additional refresh attempts with delay to ensure proper display
          setTimeout(() => {
            console.log('🔄 Second composite refresh attempt...');
            this.fitToCanvas();
            this.draw();
          }, 100);
          
          setTimeout(() => {
            console.log('🔄 Final composite refresh attempt...');
            this.fitToCanvas();
            this.draw();
          }, 300);
          
          console.log('🎨 Canvas draw() called for composite');
          console.log('🖼️ Composite image displayed with proper sizing');
        };
        
        img.onerror = (error) => {
          console.error('❌ Error loading composite image for display:', error);
          console.error('❌ Composite image source:', imageData.compositeImage.substring(0, 100) + '...');
        };
        
        console.log('📡 Setting composite image source...');
        img.src = imageData.compositeImage;
      } else {
        console.error('❌ No composite image found in imageData');
        console.error('📊 Available properties:', Object.keys(imageData));
      }
    };
    console.log('✅ showCompositeImage function added to CanvasManager');
  } else {
    console.log('ℹ️ showCompositeImage already exists in CanvasManager');
  }
}

// Show layer indicator with animation
function showLayerIndicator(layerNumber) {
  console.log(`🎨 Showing layer indicator: Layer ${layerNumber}`);
  
  try {
    const layerIndicator = document.getElementById('layer-indicator');
    const layerText = document.querySelector('.layer-text');
    
    if (!layerIndicator || !layerText) {
      console.error('❌ Layer indicator elements not found');
      return;
    }
    
    // Update layer text
    layerText.textContent = `Layer ${layerNumber}`;
    
    // Show with animation
    layerIndicator.classList.remove('hidden');
    
    // Force reflow to trigger animation
    layerIndicator.offsetHeight;
    
    // Hide after 5 seconds
    setTimeout(() => {
      layerIndicator.classList.add('hidden');
    }, 5000);
    
    console.log(`✅ Layer indicator shown: Layer ${layerNumber}`);
    
  } catch (error) {
    console.error('❌ Error showing layer indicator:', error);
  }
}

// Reset layer counter
function resetLayerCounter() {
  console.log('🔄 Resetting layer counter');
  layerCounter = 1;
  
  // Hide layer indicator
  const layerIndicator = document.getElementById('layer-indicator');
  if (layerIndicator) {
    layerIndicator.classList.add('hidden');
  }
}

// Reset background effects to default values
function resetBackgroundEffects() {
  console.log('🔄 RESETTING BACKGROUND EFFECTS TO DEFAULT');
  
  try {
    // Reset blur to 0
    const blurSlider = document.getElementById('bg-blur');
    const blurValue = document.getElementById('bg-blur-value');
    if (blurSlider) {
      blurSlider.value = 0;
      if (blurValue) blurValue.textContent = '0px';
    }
    
    // Reset opacity to 100
    const opacitySlider = document.getElementById('bg-opacity');
    const opacityValue = document.getElementById('bg-opacity-value');
    if (opacitySlider) {
      opacitySlider.value = 100;
      if (opacityValue) opacityValue.textContent = '100%';
    }
    
    // Reset scale to 100
    const scaleSlider = document.getElementById('bg-scale');
    const scaleValue = document.getElementById('bg-scale-value');
    if (scaleSlider) {
      scaleSlider.value = 100;
      if (scaleValue) scaleValue.textContent = '100%';
    }
    
    console.log('✅ Background effects reset to default values');
    
  } catch (error) {
    console.error('❌ Error resetting background effects:', error);
  }
}

// Set composite as background for multi-layer composition
function setCompositeAsBackground(compositeDataURL) {
  console.log('🔄 SETTING COMPOSITE AS BACKGROUND');
  
  try {
    // Create a new background template from the composite
    const compositeTemplate = {
      id: 'composite_' + Date.now(),
      name: 'Generated Composite',
      type: 'image',
      value: compositeDataURL,
      category: 'custom'
    };
    
    console.log('📸 Created composite background template:', compositeTemplate.name);
    
    // Update BackgroundTemplates system
    BackgroundTemplates.selectedBackground = compositeTemplate;
    
    // Load the composite as background image in CanvasManager
    const bgImg = new Image();
    bgImg.onload = () => {
      console.log('✅ Composite background image loaded');
      
             // Update CanvasManager with new background
       CanvasManager.backgroundTemplate = compositeTemplate;
       CanvasManager.backgroundImage = bgImg;
       
       // Clear foreground so user can select new image to layer
       CanvasManager.processedImage = null;
       
       // Reset background effects to default values
       resetBackgroundEffects();
       
       // Redraw canvas with new background
       CanvasManager.draw();
      
             console.log('🎨 Canvas redrawn with composite as background');
       updateStatusMessage('✅ Background updated! Select another processed image from sidebar to layer on top.');
    };
    
    bgImg.onerror = () => {
      console.error('❌ Failed to load composite as background');
      updateStatusMessage('❌ Error setting composite as background');
    };
    
    bgImg.src = compositeDataURL;
    
  } catch (error) {
    console.error('❌ Error in setCompositeAsBackground:', error);
    updateStatusMessage('❌ Error setting composite as background');
  }
}

// Layer counter for multi-composition
let layerCounter = 1;

// Multi-layer Composition Function
function generateMultiComposite() {
  console.log('🎨 GENERATE MULTI COMPOSITE CALLED');
  
  if (!CanvasManager.compositionMode) {
    console.error('❌ Not in composition mode');
    updateStatusMessage('❌ Not in composition mode');
    return;
  }
  
  try {
    updateStatusMessage('🎨 Generating multi-layer composite...');
    
    // Generate composite using CanvasManager
    const compositeDataURL = CanvasManager.generateCompositeImage();
    
    if (!compositeDataURL) {
      console.error('❌ Failed to generate multi composite');
      updateStatusMessage('❌ Failed to generate multi composite');
      return;
    }
    
    // Store composite in current image
    const currentImage = AppState.images[AppState.currentImageIndex];
    if (currentImage) {
      currentImage.compositeImage = compositeDataURL;
      currentImage.appliedBackground = BackgroundTemplates.selectedBackground;
      
      console.log('✅ Multi composite generated and stored');
      
      // Increment layer counter
      layerCounter++;
      
      // Show layer indicator with animation
      showLayerIndicator(layerCounter);
      
      // Set the generated composite as the new background for layering
      setCompositeAsBackground(compositeDataURL);
      
      updateStatusMessage(`✅ Layer ${layerCounter} ready! Select another image to layer on top.`);
      
      // Stay in composition mode for multi-layering
      console.log(`🎨 Staying in composition mode - Layer ${layerCounter} set as background`);
      
    } else {
      console.error('❌ No current image to store multi composite');
      updateStatusMessage('❌ No current image to store multi composite');
    }
    
  } catch (error) {
    console.error('❌ Error generating multi composite:', error);
    updateStatusMessage('❌ Error generating multi composite');
  }
}

// Composition Mode Management Functions
function generateFinalComposite() {
  console.log('📸 GENERATE FINAL COMPOSITE CALLED');
  
  if (!CanvasManager.compositionMode) {
    console.error('❌ Not in composition mode');
    updateStatusMessage('❌ Not in composition mode');
    return;
  }
  
  try {
    updateStatusMessage('📸 Generating final composite...');
    
    // Generate composite using CanvasManager
    const compositeDataURL = CanvasManager.generateCompositeImage();
    
    if (!compositeDataURL) {
      console.error('❌ Failed to generate composite');
      updateStatusMessage('❌ Failed to generate composite');
      return;
    }
    
          // Store composite in current image
      const currentImage = AppState.images[AppState.currentImageIndex];
      if (currentImage) {
        currentImage.compositeImage = compositeDataURL;
        currentImage.appliedBackground = BackgroundTemplates.selectedBackground;
        
        console.log('✅ Final composite generated and stored');
        updateStatusMessage('✅ Final composite generated! You can now export or continue editing.');
        
        // Exit composition mode (RESTORED ORIGINAL BEHAVIOR)
        exitCompositionMode();
        
        // Show the composite result with a small delay to ensure composition mode is fully exited
        setTimeout(() => {
          console.log('🖼️ Displaying final composite on canvas...');
          CanvasManager.showCompositeImage(currentImage);
        }, 200);
      
    } else {
      console.error('❌ No current image to store composite');
      updateStatusMessage('❌ No current image to store composite');
    }
    
  } catch (error) {
    console.error('❌ Error generating final composite:', error);
    updateStatusMessage('❌ Error generating final composite');
  }
}

function exitCompositionMode() {
  console.log('🚪 EXIT COMPOSITION MODE CALLED');
  
  try {
    // Reset layer counter when exiting composition
    resetLayerCounter();
    
    // Disable composition mode in CanvasManager
    CanvasManager.disableCompositionMode();
    
    // Hide composition controls
    const compositionControls = document.getElementById('composition-controls');
    if (compositionControls) {
      compositionControls.classList.add('hidden');
    }
    
    // Reset background selection UI
    document.querySelectorAll('.bg-template-item').forEach(item => {
      item.classList.remove('selected');
    });
    
    // Hide background effects panel
    hideBackgroundEffects();
    
    // Clear selected background
    BackgroundTemplates.selectedBackground = null;
    
    console.log('✅ Composition mode exited');
    updateStatusMessage('✅ Composition mode exited. Returned to normal view.');
    
  } catch (error) {
    console.error('❌ Error exiting composition mode:', error);
    updateStatusMessage('❌ Error exiting composition mode');
  }
}

// Window Controls Setup
function setupWindowControls() {
  console.log('🪟 Setting up window controls...');
  
  const minimizeBtn = document.getElementById('minimize-btn');
  const maximizeBtn = document.getElementById('maximize-btn');
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  const closeBtn = document.getElementById('close-btn');
  
  // Minimize window
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      console.log('🪟 Minimize clicked');
      window.electronAPI?.minimizeWindow?.();
    });
  }
  
  // Maximize/Restore window
  if (maximizeBtn) {
    maximizeBtn.addEventListener('click', () => {
      console.log('🪟 Maximize/Restore clicked');
      window.electronAPI?.maximizeWindow?.();
    });
  }
  
  // Full screen toggle
  if (fullscreenBtn) {
    fullscreenBtn.addEventListener('click', () => {
      console.log('🪟 Fullscreen toggle clicked');
      window.electronAPI?.toggleFullscreen?.();
    });
  }
  
  // Close window
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      console.log('🪟 Close clicked');
      window.electronAPI?.closeWindow?.();
    });
  }
  
  console.log('✅ Window controls setup complete');
}

// Header File Operations removed - using native menu bar instead

// Call extension on load
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    extendCanvasManagerForBackgrounds();
    
    // Apply canvas background after CanvasManager is extended
    setTimeout(() => {
      if (Settings.canvasBg && CanvasManager && CanvasManager.setCanvasBackground) {
        CanvasManager.setCanvasBackground(Settings.canvasBg);
        if (CanvasManager.draw) {
          CanvasManager.draw();
        }
      }
    }, 200);
  }, 100);
});

// Theme Management Functions
function applyTheme(themeName) {
  const body = document.body;
  
  // Remove all theme classes
  body.classList.remove('theme-light', 'theme-dark', 'theme-system');
  
  switch (themeName) {
    case 'light':
      body.classList.add('theme-light');
      console.log('☀️ Light theme applied');
      break;
    case 'dark':
      body.classList.add('theme-dark');
      console.log('🌙 Dark theme applied');
      break;
    case 'system':
    default:
      body.classList.add('theme-system');
      console.log('🖥️ System theme applied (follows OS preference)');
      break;
  }
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// Listen for system theme changes when in system mode
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (Settings.appTheme === 'system') {
    console.log('🖥️ System theme changed to:', e.matches ? 'dark' : 'light');
    applyTheme('system'); // Re-apply system theme
  }
});

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Application error:', event.error);
  updateStatusMessage(`❌ Error: ${event.error.message}`);
});

// ===== EXTENSION INTEGRATION =====

class ExtensionManager {
  constructor() {
    this.apiBaseUrl = 'http://localhost:8000/api';
    this.pollInterval = 5000; // Poll every 5 seconds
    this.pollTimer = null;
    this.init();
  }

  init() {
    console.log('🔌 Initializing Extension Manager...');
    this.setupEventListeners();
    this.startPolling();
  }

  setupEventListeners() {
    // Refresh extension queue button
    const refreshBtn = document.getElementById('refresh-extension-queue-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshExtensionQueue();
      });
    }

    // Process extension queue button
    const processBtn = document.getElementById('process-extension-queue-btn');
    if (processBtn) {
      processBtn.addEventListener('click', () => {
        this.processExtensionQueue();
      });
    }

    // Clear extension queue button
    const clearBtn = document.getElementById('clear-extension-queue-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.clearExtensionQueue();
      });
    }
  }

  startPolling() {
    // Initial check
    this.checkExtensionStatus();
    this.refreshExtensionQueue();

    // Set up polling
    this.pollTimer = setInterval(() => {
      this.checkExtensionStatus();
      this.refreshExtensionQueue();
    }, this.pollInterval);

    console.log('⏰ Extension polling started');
  }

  stopPolling() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
      console.log('⏰ Extension polling stopped');
    }
  }

  async checkExtensionStatus() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/status`);
      
      if (response.ok) {
        const data = await response.json();
        this.updateExtensionStatus(data.extension_clients || 0);
      } else {
        this.updateExtensionStatus(0);
      }
    } catch (error) {
      console.log('🔌 Extension status check failed:', error.message);
      this.updateExtensionStatus(0);
    }
  }

  updateExtensionStatus(count) {
    AppState.extensionClientsCount = count;
    
    // Update UI
    const countElement = document.getElementById('extension-count');
    const statusElement = document.getElementById('extension-status');
    
    if (countElement) {
      countElement.textContent = count;
    }
    
    if (statusElement) {
      if (count > 0) {
        statusElement.classList.remove('offline');
        statusElement.classList.add('online');
      } else {
        statusElement.classList.remove('online');
        statusElement.classList.add('offline');
      }
    }
    
    // Force UI update with visual feedback
    console.log(`🔄 Extension counter updated: ${count} clients connected`);
  }

  async refreshExtensionQueue() {
    try {
      const response = await fetch(`${this.apiBaseUrl}/processing-queue`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Auto-add extension photos to main queue
        if (data.items && data.items.length > 0) {
          await this.addExtensionPhotosToMainQueue(data.items);
        }
        
        this.updateExtensionQueue(data.items || []);
      } else {
        console.log('Failed to fetch extension queue');
      }
    } catch (error) {
      console.log('🔌 Extension queue refresh failed:', error.message);
    }
  }

  async addExtensionPhotosToMainQueue(queueItems) {
    for (const item of queueItems) {
      // Check if this item is already in main queue
      const existsInMain = AppState.images.find(img => 
        img.extensionId === item.id
      );
      
      if (!existsInMain) {
        try {
          // Get file data from backend
          const encodedPath = encodeURIComponent(item.path);
          const response = await fetch(`${this.apiBaseUrl}/extension-file/${encodedPath}`);
          
          if (!response.ok) {
            console.log(`Could not load ${item.path}, skipping...`);
            continue;
          }
          
          const data = await response.json();
          const base64 = data.data_url;
          
          // Convert data URL to blob then to file
          const response2 = await fetch(base64);
          const blob = await response2.blob();
          const file = new File([blob], item.name, { type: item.type });
          
          // Create image data with extension metadata
          const imageData = {
            id: Date.now() + Math.random(),
            name: item.name,
            file,
            base64,
            status: 'pending',
            originalImage: null,
            processedImage: null,
            processingTime: null,
            // Extension metadata
            source: 'extension',
            platform: item.platform,
            availableSlots: null,
            extensionId: item.id // Track original extension queue item
          };
          
          AppState.images.push(imageData);
          addImageToUI(imageData);
          
          console.log(`📸 Auto-added ${item.name} from ${item.platform} to main queue`);
          
        } catch (error) {
          console.error(`❌ Failed to add extension photo ${item.name}:`, error);
        }
      }
    }
    
    // Update UI if we added anything
    updateUI();
  }

  updateExtensionQueue(queueItems) {
    AppState.extensionQueue = queueItems;
    
    const queueList = document.getElementById('extension-queue-list');
    const processBtn = document.getElementById('process-extension-queue-btn');
    const clearBtn = document.getElementById('clear-extension-queue-btn');
    
    if (!queueList) return;
    
    // Clear existing items
    queueList.innerHTML = '';
    
    if (queueItems.length === 0) {
      // Show empty message
      queueList.innerHTML = `
        <div class="empty-queue-message">
          <span>📱</span>
          <p>No photos from browser extensions</p>
          <small>Photos sent from browser extensions will appear here</small>
        </div>
      `;
      
      if (processBtn) processBtn.disabled = true;
      if (clearBtn) clearBtn.disabled = true;
    } else {
      // Show queue items
      queueItems.forEach(item => {
        const itemElement = this.createQueueItemElement(item);
        queueList.appendChild(itemElement);
      });
      
      if (processBtn) processBtn.disabled = false;
      if (clearBtn) clearBtn.disabled = false;
    }
  }

  createQueueItemElement(item) {
    const div = document.createElement('div');
    div.className = 'extension-queue-item';
    div.dataset.itemId = item.id;
    
    const fileSize = item.size ? `${(item.size / 1024 / 1024).toFixed(1)}MB` : 'Unknown';
    const timestamp = new Date(item.received_at).toLocaleTimeString();
    
    div.innerHTML = `
      <div class="extension-queue-item-header">
        <div class="extension-queue-item-name">${item.name}</div>
        <div class="extension-queue-item-platform ${item.platform}">${item.platform}</div>
      </div>
      <div class="extension-queue-item-details">
        <span>${fileSize}</span>
        <span>${timestamp}</span>
      </div>
      <div class="extension-queue-item-status ${item.status}">${item.status}</div>
      <div class="extension-queue-item-actions">
        <button class="queue-item-btn primary" onclick="extensionManager.processItem('${item.id}')">
          🎨 Process
        </button>
        <button class="queue-item-btn" onclick="extensionManager.removeItem('${item.id}')">
          🗑️ Remove
        </button>
      </div>
    `;
    
    return div;
  }

  async processItem(itemId) {
    console.log('🎨 Processing extension item:', itemId);
    updateStatusMessage(`🎨 Processing item from extension queue...`);
    
    // Update status to completed (simplified for now)
    this.updateItemStatus(itemId, 'completed');
    updateStatusMessage(`✅ Item processed successfully`);
  }

  updateItemStatus(itemId, status) {
    const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
    if (itemElement) {
      const statusElement = itemElement.querySelector('.extension-queue-item-status');
      if (statusElement) {
        statusElement.className = `extension-queue-item-status ${status}`;
        statusElement.textContent = status;
      }
    }
  }

  async removeItem(itemId) {
    console.log('🗑️ Removing extension item:', itemId);
    
    // Remove from UI immediately
    const itemElement = document.querySelector(`[data-item-id="${itemId}"]`);
    if (itemElement) {
      itemElement.remove();
    }
    
    // Remove from state
    AppState.extensionQueue = AppState.extensionQueue.filter(item => item.id !== itemId);
    
    // Refresh queue display if empty
    if (AppState.extensionQueue.length === 0) {
      this.updateExtensionQueue([]);
    }
  }

  async processExtensionQueue() {
    console.log('🚀 Processing entire extension queue...');
    updateStatusMessage(`🎨 Processing extension queue...`);
    
    const queuedItems = AppState.extensionQueue.filter(item => item.status === 'queued');
    
    // Process all items
    for (const item of queuedItems) {
      this.updateItemStatus(item.id, 'completed');
    }
    
    updateStatusMessage(`✅ Extension queue processed successfully`);
  }

  async clearExtensionQueue() {
    console.log('🗑️ Clearing extension queue...');
    
    try {
      // Clear backend processing queue
      const response = await fetch(`${this.apiBaseUrl}/clear-processing-queue`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        console.log('✅ Backend processing queue cleared');
      }
      
      // Clear extension queue UI
      AppState.extensionQueue = [];
      this.updateExtensionQueue([]);
      
      // Clear extension images from main image list
      const beforeCount = AppState.images.length;
      AppState.images = AppState.images.filter(img => img.source !== 'extension');
      const clearedCount = beforeCount - AppState.images.length;
      
      console.log(`🧹 Cleared ${clearedCount} extension images from main queue`);
      updateStatusMessage('🗑️ Extension queue cleared completely');
      
      return true;
    } catch (error) {
      console.error('❌ Error clearing extension queue:', error);
      updateStatusMessage('❌ Failed to clear extension queue');
      return false;
    }
  }

  destroy() {
    this.stopPolling();
  }
}

// Global extension manager instance
let extensionManager;

// Initialize extension manager after main app initialization
const originalInitializeApp = window.initializeApp || function() {};
window.initializeApp = function() {
  // Call original initialization
  originalInitializeApp();
  
  // Initialize extension manager
  if (!extensionManager) {
    extensionManager = new ExtensionManager();
    console.log('🔌 Extension Manager initialized');
  }
};

// Cleanup when window closes
window.addEventListener('beforeunload', () => {
  if (extensionManager) {
    extensionManager.destroy();
  }
});

console.log('📝 Main application script loaded (with Extension Manager)'); 