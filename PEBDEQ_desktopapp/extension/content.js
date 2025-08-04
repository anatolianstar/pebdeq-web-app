// PEBDEQ Etsy Integration - Content Script
console.log('🎨 PEBDEQ Etsy Integration loaded!');

class PEBDEQEtsyIntegration {
  constructor() {
    this.isActive = false;
    this.pebdeqPhotos = [];
    this.initialPhotoCount = null; // For upload progress detection
    this.pauseEbayObserver = false; // For DOM observer control during upload
    this.init();
    this.setupBackgroundMessageListener();
  }
  
  init() {
    // Wait for page to fully load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setupIntegration());
    } else {
      this.setupIntegration();
    }
  }

  setupBackgroundMessageListener() {
    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('📨 Content script received message:', request);
      
      if (request.action === 'processedImagesAvailable') {
        console.log(`🎉 Received processedImagesAvailable for ${request.platform}: ${request.count} images`);
        this.handleAutoProcessedImages(request.platform, request.images, request.count);
      }
      

    });
  }

  async handleAutoProcessedImages(platform, images, count) {
    console.log(`🎉 AUTO-DETECTED ${count} processed images for ${platform}!`);
    
    // Store images for upload first
    this.processedImages = this.processedImages || {};
    this.processedImages[platform] = images;
    
    // INSTANT UI UPDATE - Modal açık mı kontrol et
    const modal = document.getElementById('pebdeq-shopify-modal-overlay');
    const isModalOpen = modal && modal.style.display === 'flex';
    
    console.log(`🔍 Modal open status: ${isModalOpen}`);
    console.log(`📊 Processing ${images.length} images for ${platform}`);
    
    // MULTIPLE AGGRESSIVE UPDATE ATTEMPTS
    this.forceUpdateProcessedImages(platform, images, isModalOpen);
    
    // If modal is open, force flash notification
    if (isModalOpen) {
      console.log('📱 Modal is open - FORCING instant UI refresh!');
      this.flashProcessedImagesNotification(platform, images.length);
      this.updateProcessingStatus(`✅ ${images.length} images ready!`, 'success');
    } else {
      console.log('📱 Modal is closed - storing images for later display');
      this.updateProcessingStatus(`📦 ${images.length} images processed (open modal to view)`, 'info');
    }
    
    this.showNotification(`🎉 ${images.length} processed images ready!`, 'success');
  }

  forceUpdateProcessedImages(platform, images, isModalOpen) {
    console.log(`⚡ FORCE updating processed images - MULTIPLE ATTEMPTS`);
    
    // Immediate update (0ms)
    this.updateProcessedImagesUI(platform, images);
    
    // Retry at 50ms 
    setTimeout(() => {
      console.log(`🔄 Retry 1: Updating UI for ${platform}`);
      this.updateProcessedImagesUI(platform, images);
    }, 50);
    
    // Retry at 100ms
    setTimeout(() => {
      console.log(`🔄 Retry 2: Updating UI for ${platform}`);
      this.updateProcessedImagesUI(platform, images);
    }, 100);
    
    // Retry at 200ms
    setTimeout(() => {
      console.log(`🔄 Retry 3: Updating UI for ${platform}`);
      this.updateProcessedImagesUI(platform, images);
    }, 200);
    
    // Final aggressive update at 500ms
    setTimeout(() => {
      console.log(`🔄 FINAL RETRY: Aggressive UI update for ${platform}`);
      this.aggressiveUpdateProcessedImages(platform, images);
    }, 500);
  }

  aggressiveUpdateProcessedImages(platform, images) {
    console.log(`💪 AGGRESSIVE UPDATE for ${platform} - ${images.length} images`);
    
    const processedDiv = document.getElementById(`pebdeq-processed-photos-${platform}`);
    const processedList = document.getElementById(`pebdeq-processed-list-${platform}`);
    const uploadButton = document.getElementById(`pebdeq-upload-to-${platform}`);
    
    // FORCE SHOW elements if they exist
    if (processedDiv) {
      processedDiv.style.cssText = `
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        height: auto !important;
        overflow: visible !important;
        position: relative !important;
        z-index: 9999 !important;
        background: #e6f7f1 !important;
        border: 3px solid #00a76a !important;
        padding: 16px !important;
        margin: 16px 0 !important;
        border-radius: 8px !important;
        animation: flashGreen 2s ease-in-out !important;
      `;
      console.log(`💪 FORCE showed processedDiv`);
    }
    
    if (processedList && images.length > 0) {
      // Clear and rebuild with aggressive styling
      processedList.innerHTML = '';
      
      images.forEach((image, index) => {
        const imageItem = document.createElement('div');
        imageItem.innerHTML = `
          <div style="
            margin: 12px 0 !important; 
            padding: 16px !important; 
            background: linear-gradient(135deg, #e6f7f1, #ffffff) !important; 
            border-radius: 12px !important; 
            border: 3px solid #00a76a !important; 
            box-shadow: 0 8px 24px rgba(0,128,96,0.3) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: space-between !important;
            animation: slideIn 0.5s ease-out !important;
            transform: scale(1) !important;
            opacity: 1 !important;
            visibility: visible !important;
          ">
            <span style="font-weight: bold; color: #008060; font-size: 16px;">🎉 ${image.originalName}</span>
            <span style="color: #00a76a; font-weight: bold; background: #e6f7f1; padding: 8px 16px; border-radius: 20px; font-size: 14px;">✅ READY NOW!</span>
          </div>
        `;
        processedList.appendChild(imageItem);
      });
      console.log(`💪 FORCE rebuilt processedList with ${images.length} items`);
    }
    
    if (uploadButton) {
      uploadButton.disabled = false;
      uploadButton.style.cssText += `
        opacity: 1 !important;
        cursor: pointer !important;
        background: linear-gradient(135deg, #008060, #00a76a) !important;
        animation: pulse 3s infinite !important;
        border: 3px solid #00a76a !important;
        box-shadow: 0 8px 24px rgba(0,128,96,0.4) !important;
      `;
      console.log(`💪 FORCE enabled uploadButton`);
    }
    
    console.log(`💪 AGGRESSIVE UPDATE COMPLETED for ${platform}`);
  }

  updateProcessedImagesUI(platform, images) {
    console.log(`🔄 FORCE Updating UI for ${platform} with ${images.length} images`);
    
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
    const processedDiv = document.getElementById(`pebdeq-processed-photos-${platform}`);
    const processedList = document.getElementById(`pebdeq-processed-list-${platform}`);
    const uploadButton = document.getElementById(`pebdeq-upload-to-${platform}`);
      
      console.log(`📍 Found elements: div=${!!processedDiv}, list=${!!processedList}, button=${!!uploadButton}`);
    
    if (processedList && images.length > 0) {
        // FORCE Clear and rebuild processed images list
      processedList.innerHTML = '';
      
      images.forEach((image, index) => {
        const imageItem = document.createElement('div');
          imageItem.className = `pebdeq-processed-item-${Date.now()}-${index}`;
          imageItem.style.cssText = `
            margin: 8px 0 !important; 
            padding: 12px !important; 
            background: linear-gradient(135deg, #e6f7f1, #ffffff) !important; 
            border-radius: 8px !important; 
            border: 2px solid #008060 !important; 
            box-shadow: 0 4px 12px rgba(0,128,96,0.2) !important;
            transition: all 0.3s ease !important;
            animation: slideIn 0.3s ease-out !important;
            transform: scale(1) !important;
            opacity: 1 !important;
            display: block !important;
            visibility: visible !important;
          `;
        imageItem.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-weight: bold; color: #008060; font-size: 14px;">🎉 ${image.originalName}</span>
              <span style="color: #00a76a; font-weight: bold; background: #e6f7f1; padding: 4px 8px; border-radius: 12px; font-size: 12px;">✅ READY NOW</span>
            </div>
        `;
        processedList.appendChild(imageItem);
          
          // Add flash animation
          setTimeout(() => {
            imageItem.style.background = 'linear-gradient(135deg, #f0fff4, #e6f7f1)';
          }, 100);
        });
        
        // FORCE show processed photos section with strong CSS
        if (processedDiv) {
          processedDiv.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            height: auto !important;
            overflow: visible !important;
            position: relative !important;
            z-index: 1000 !important;
          `;
        }
        
        // FORCE enable upload button
        if (uploadButton) {
          uploadButton.disabled = false;
          uploadButton.style.cssText += `
            opacity: 1 !important;
            cursor: pointer !important;
            background: linear-gradient(135deg, #008060, #00a76a) !important;
            animation: pulse 2s infinite !important;
          `;
        }
        
        console.log(`✅ FORCE UI updated: ${images.length} processed images displayed with strong visibility`);
        
        // Auto-scroll to processed section if modal is open
        if (processedDiv) {
          setTimeout(() => {
            processedDiv.scrollIntoView({ 
              behavior: 'smooth', 
              block: 'center' 
            });
            console.log('📜 Auto-scrolled to processed images section');
          }, 200);
        }
      }
    }, 100); // Small delay to ensure DOM readiness
  }

  refreshProcessedImagesDisplay(platform) {
    console.log(`🔄 Refreshing processed images display for ${platform}`);
    
    // Check if we have stored processed images
    if (this.processedImages && this.processedImages[platform]) {
      const images = this.processedImages[platform];
      console.log(`📊 Found ${images.length} stored processed images for ${platform}`);
      this.updateProcessedImagesUI(platform, images);
    } else {
      console.log(`ℹ️ No stored processed images found for ${platform}`);
      // Auto-check for new processed images
      this.checkProcessedImages(platform);
    }
  }

  flashProcessedImagesNotification(platform, count) {
    console.log(`⚡ Flashing notification for ${count} processed images on ${platform}`);
    
    // Find the modal content for attention
    const modal = document.getElementById('pebdeq-shopify-modal');
    if (modal) {
      // Flash border animation
      modal.style.border = '3px solid #00a76a';
      modal.style.animation = 'flashGreen 1s ease-in-out 3';
      
      setTimeout(() => {
        modal.style.border = '1px solid rgba(0, 128, 96, 0.1)';
        modal.style.animation = 'none';
      }, 3000);
    }
    
    // Create floating notification inside modal
    const floatingNotif = document.createElement('div');
    floatingNotif.style.cssText = `
      position: absolute !important;
      top: 20px !important;
      right: 20px !important;
      background: linear-gradient(135deg, #00a76a, #008060) !important;
      color: white !important;
      padding: 12px 20px !important;
      border-radius: 25px !important;
      font-weight: bold !important;
      z-index: 999999 !important;
      animation: slideInRight 0.5s ease-out, fadeOut 0.5s ease-in 2.5s forwards !important;
      box-shadow: 0 4px 20px rgba(0, 167, 106, 0.4) !important;
    `;
    floatingNotif.innerHTML = `🎉 ${count} images ready!`;
    
    if (modal) {
      modal.appendChild(floatingNotif);
      
      // Remove after animation
      setTimeout(() => {
        if (floatingNotif.parentNode) {
          floatingNotif.parentNode.removeChild(floatingNotif);
        }
      }, 3000);
    }
  }

  updateProcessingStatus(message, type = 'info') {
    console.log(`📊 Updating processing status: ${message} (${type})`);
    
    // Update trigger button with status
    const triggerButton = document.getElementById('pebdeq-shopify-trigger');
    if (triggerButton) {
      const colors = {
        info: '#008060',
        success: '#00a76a', 
        warning: '#ff8c00',
        error: '#d72c0d'
      };
      
      const emoji = {
        info: '📦',
        success: '✅',
        warning: '⚠️', 
        error: '❌'
      };
      
      // Update button appearance
      triggerButton.innerHTML = `${emoji[type]} PEBDEQ`;
      triggerButton.style.background = `linear-gradient(135deg, ${colors[type]}, ${colors[type]}dd)`;
      triggerButton.title = message; // Tooltip
      
      // Pulse animation for new updates
      if (type === 'success') {
        triggerButton.style.animation = 'pulse 1s ease-out 3';
        setTimeout(() => {
          triggerButton.style.animation = '';
        }, 3000);
      }
    }
  }

  startRealTimeMonitoring(platform) {
    console.log(`🔄 Starting real-time monitoring for ${platform}`);
    
    // Clear existing interval if any
    this.stopRealTimeMonitoring();
    
    // Check for processed images every 500ms when modal is open
    this.realTimeMonitoringInterval = setInterval(() => {
      console.log(`⏰ Real-time check for ${platform} processed images`);
      
      // Check if we have stored processed images that aren't displayed
      if (this.processedImages && this.processedImages[platform]) {
        const images = this.processedImages[platform];
        
        // Check if processed section is visible
        const processedDiv = document.getElementById(`pebdeq-processed-photos-${platform}`);
        const processedList = document.getElementById(`pebdeq-processed-list-${platform}`);
        
        if (processedDiv && processedList) {
          const isVisible = processedDiv.style.display !== 'none' && 
                           processedDiv.style.visibility !== 'hidden' &&
                           processedList.children.length > 0;
          
          if (!isVisible && images.length > 0) {
            console.log(`⚡ Real-time: Found ${images.length} hidden processed images - FORCING display!`);
            this.aggressiveUpdateProcessedImages(platform, images);
          }
        }
      }
    }, 500); // Check every 500ms
    
    console.log(`✅ Real-time monitoring started for ${platform}`);
  }

  stopRealTimeMonitoring() {
    if (this.realTimeMonitoringInterval) {
      console.log(`⏹️ Stopping real-time monitoring`);
      clearInterval(this.realTimeMonitoringInterval);
      this.realTimeMonitoringInterval = null;
    }
  }
  
  async setupIntegration() {
    console.log('🚨 STARTING setupIntegration()');
    console.log('🔧 Setting up PEBDEQ integration...');
    
    // Set up disconnect handlers first
    this.setupDisconnectHandlers();
    
    // Check if we're on a listing creation/edit page
    const isListing = this.isListingPage();
    console.log('🚨 isListingPage() returned:', isListing);
    
    if (isListing) {
      console.log('🚨 LISTING PAGE DETECTED - Setting up UI injection...');
      await this.loadPEBDEQPhotos();
      this.detectAvailableSlots();
      
      // Only use old file upload observer for Etsy (for backward compatibility)
      const hostname = window.location.hostname;
      if (hostname.includes('etsy.com')) {
      this.observeFileUploads();
      }
      
      console.log('🚨 About to inject platform-specific UI...');
      this.injectPlatformSpecificUI();
      console.log('🚨 Platform UI injection completed!');
      
      // Additional visibility check for Shopify (backup)
      if (hostname.includes('shopify.com') || hostname.includes('myshopify.com')) {
        setTimeout(() => this.forceShopifyUIVisibility(), 1500);
      }
    } else {
      console.log('🚨 NOT A LISTING PAGE - Skipping UI injection');
    }
  }

  setupDisconnectHandlers() {
    // Disconnect when page is about to unload
    window.addEventListener('beforeunload', () => {
      console.log('🔌 Page unloading - cleaning up...');
      this.cleanup();
    });
    
    // Also handle page hide (for mobile/tab switching)
    window.addEventListener('pagehide', () => {
      console.log('🔌 Page hidden - cleaning up...');
      this.cleanup();
    });
    
    // Handle visibility change (tab becomes inactive for a long time)
    let visibilityTimer = null;
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        // Clean up after 30 seconds of being hidden
        visibilityTimer = setTimeout(() => {
          console.log('🔌 Page hidden for 30s - cleaning up...');
          this.cleanup();
        }, 30000);
      } else {
        // Cancel cleanup if page becomes visible again
        if (visibilityTimer) {
          clearTimeout(visibilityTimer);
          visibilityTimer = null;
        }
      }
    });
  }

  cleanup() {
    try {
      // Clean up eBay interval
      if (this.ebayRetryInterval) {
        clearInterval(this.ebayRetryInterval);
        this.ebayRetryInterval = null;
        console.log('🧹 eBay retry interval cleaned up');
      }
      
      // Send cleanup message to background script
      chrome.runtime.sendMessage({
        action: 'pageCleanup',
        platform: this.getCurrentPlatform()
      }).catch(error => {
        console.log('Note: Could not send cleanup message:', error.message);
      });
    } catch (error) {
      console.log('Note: Cleanup message failed:', error.message);
    }
  }

  getCurrentPlatform() {
    const hostname = window.location.hostname;
    if (hostname.includes('etsy.com')) return 'etsy';
    if (hostname.includes('shopify.com') || hostname.includes('myshopify.com')) return 'shopify';
    if (hostname.includes('ebay.com')) return 'ebay';
    if (hostname.includes('pebdeq.com')) return 'pebdeq';
    if (hostname.includes('amazon.com')) return 'amazon';
    if (hostname.includes('aliexpress.com')) return 'aliexpress';
    if (hostname.includes('walmart.com')) return 'walmart';
    return 'unknown';
  }
  
  detectAvailableSlots() {
    // Simplified slot detection - use sensible defaults
    // Complex detection of existing images can be error-prone
    const hostname = window.location.hostname;
    let defaultSlots = 10; // Most platforms allow 10+ images
    
    if (hostname.includes('etsy.com')) {
      defaultSlots = 10; // Etsy allows 10 images
    } else if (hostname.includes('shopify.com') || hostname.includes('myshopify.com')) {
      defaultSlots = 20; // Shopify allows many images
    } else if (hostname.includes('ebay.com')) {
      defaultSlots = 12; // eBay allows 12 images
    } else if (hostname.includes('pebdeq.com')) {
      defaultSlots = 15; // Our platform
    } else if (hostname.includes('amazon.com')) {
      defaultSlots = 9; // Amazon allows up to 9 images
    } else if (hostname.includes('aliexpress.com')) {
      defaultSlots = 6; // AliExpress allows 6 images
    } else if (hostname.includes('walmart.com')) {
      defaultSlots = 8; // Walmart allows 8 images
    }
    
    this.availableSlots = defaultSlots;
    console.log(`📊 Using default slots for ${hostname}: ${defaultSlots}`);
    return defaultSlots;
  }
  

  
  injectPlatformSpecificUI() {
    const hostname = window.location.hostname;
    
    if (hostname.includes('etsy.com')) {
      this.injectEtsyUI();
    } else if (hostname.includes('shopify.com')) {
      this.injectShopifyUI();
    } else if (hostname.includes('ebay.com')) {
      this.injectEbayUI();
    } else if (hostname.includes('pebdeq.com')) {
      this.injectPebdeqUI();
    } else if (hostname.includes('amazon.com')) {
      this.injectAmazonUI();
    } else if (hostname.includes('aliexpress.com')) {
      this.injectAliExpressUI();
    } else if (hostname.includes('walmart.com')) {
      this.injectWalmartUI();
    }
    

  }
  
  injectEtsyUI() {
    console.log('🎨 Setting up Etsy integration...');
    this.waitForEtsyUploadDialog();
  }
  
  waitForEtsyUploadDialog() {
    // Look for Etsy's photo upload area
    const uploadArea = document.querySelector('[data-test-id="listing-photos"]') ||
                      document.querySelector('.photos-area') ||
                      document.querySelector('div[class*="photo"]');
    
    if (uploadArea) {
      this.injectEtsyPEBDEQSection(uploadArea);
    } else {
      setTimeout(() => this.waitForEtsyUploadDialog(), 1000);
    }
  }
  
  injectEtsyPEBDEQSection(uploadArea) {
    if (document.getElementById('pebdeq-etsy-section')) return;
    
    const pebdeqSection = document.createElement('div');
    pebdeqSection.id = 'pebdeq-etsy-section';
    pebdeqSection.className = 'pebdeq-etsy-integration';
    pebdeqSection.innerHTML = `
      <div class="pebdeq-section">
        <div class="pebdeq-header" style="margin-bottom: 15px;">
          <h3 style="margin: 0;">📤 Send to Desktop for Processing</h3>
        </div>
        <div id="pebdeq-upload-interface-etsy">
          <input type="file" id="pebdeq-file-input-etsy" multiple accept="image/*" style="margin: 10px 0;" />
          <div id="pebdeq-selected-photos-etsy"></div>
          <button id="pebdeq-send-to-desktop-etsy" style="margin-top: 10px; background: #f56400; color: white; padding: 8px 16px; border: none; border-radius: 4px;">
            📤 Send to Desktop
          </button>
          <button id="pebdeq-check-processed-etsy" style="margin: 10px 0 0 10px; background: #4caf50; color: white; padding: 8px 16px; border: none; border-radius: 4px;">
            🔍 Check Processed
          </button>
        </div>
        <div id="pebdeq-processed-photos-etsy" style="display: none; margin-top: 15px; padding: 15px; background: #f0f8ff; border-radius: 8px; border: 2px solid #4caf50;">
          <h4 style="margin: 0 0 10px 0; color: #2e7d32;">✨ Processed Photos Ready</h4>
          <div id="pebdeq-processed-list-etsy" style="margin-bottom: 10px;"></div>
          <button id="pebdeq-upload-to-etsy" style="background: #2e7d32; color: white; padding: 10px 20px; border: none; border-radius: 4px; font-weight: bold;" disabled>
            🌐 Upload to ETSY
          </button>
          <button id="pebdeq-clear-etsy" style="background: #d32f2f; color: white; padding: 10px 20px; border: none; border-radius: 4px; font-weight: bold; margin-left: 10px;">
            🧹 Clear All
          </button>
        </div>
      </div>
      
      <style>
        .pebdeq-toggle {
          user-select: none;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .pebdeq-toggle.disconnected {
          background: #ffebee;
          color: #000000;
          border-color: #f44336;
        }
        .pebdeq-toggle.connected {
          background: #e8f5e8;
          color: #2e2e2e;
          border-color: #4caf50;
        }
        .pebdeq-toggle:hover {
          opacity: 0.8;
          transform: scale(1.02);
        }
        .pebdeq-toggle:active {
          transform: scale(0.98);
        }
      </style>
    `;
    
    uploadArea.insertBefore(pebdeqSection, uploadArea.firstChild);
    this.setupNewWorkflowListeners('etsy');
  }
  
  injectShopifyUI() {
    console.log('🛍️ Setting up Advanced Shopify integration...');
    
    // Detect Shopify store information
    this.detectShopifyStore();
    
    // Multiple injection points for different Shopify admin areas
    this.tryMultipleShopifyInjections();
  }
  
  detectShopifyStore() {
    // Extract store information from Shopify admin
    const storeInfo = this.extractShopifyStoreInfo();
    if (storeInfo) {
      console.log('🏪 Detected Shopify Store:', storeInfo);
      this.currentShopifyStore = storeInfo;
    }
  }
  
  extractShopifyStoreInfo() {
    try {
      // Get store name from URL
      const urlMatch = window.location.hostname.match(/^(.+)\.myshopify\.com$/);
      const storeName = urlMatch ? urlMatch[1] : null;
      
      // Get additional info from page elements
      const storeNameElement = document.querySelector('[data-testid="ShopNameTitle"]') ||
                              document.querySelector('.Polaris-TopBar__LogoContainer') ||
                              document.querySelector('[data-polaris-topbar] h1');
      
      const displayName = storeNameElement?.textContent?.trim() || storeName;
      
      return {
        storeName: storeName,
        displayName: displayName,
        url: window.location.hostname,
        adminUrl: window.location.origin
      };
    } catch (error) {
      console.log('ℹ️ Could not extract store info:', error.message);
      return null;
    }
  }
  
  tryMultipleShopifyInjections() {
    // Try different injection points based on current page
    const injectionPoints = [
      // Product media manager (primary) - parent container'ını target et
      {
        selector: '[data-testid="ProductMediaManagerCard"]',
        type: 'after-media',
        priority: 1
      },
      // Media section içeren layout section (daha iyi)
      {
        selector: '.Polaris-Layout__Section:has([data-testid="ProductMediaManagerCard"])',
        type: 'media-container',
        priority: 2
      },
      // Product form media section
      {
        selector: '.Polaris-Layout__Section:has([data-testid*="media"])',
        type: 'form',
        priority: 3
      },
      // Any Polaris card with media
      {
        selector: '.Polaris-Card:has([aria-label*="Media"])',
        type: 'card',
        priority: 4
      },
      // Product page content area
      {
        selector: '.Polaris-Layout__Section',
        type: 'layout',
        priority: 5
      },
      // Fallback: main content
      {
        selector: 'main[role="main"]',
        type: 'main',
        priority: 6
      }
    ];
    
    // Sort by priority and try each
    injectionPoints.sort((a, b) => a.priority - b.priority);
    
    for (const point of injectionPoints) {
      const element = document.querySelector(point.selector);
      if (element) {
        console.log(`✅ Found injection point: ${point.type} (${point.selector})`);
        this.injectAdvancedShopifySection(element, point.type);
        
        // FORCE VISIBILITY CHECK after injection
        setTimeout(() => this.forceShopifyUIVisibility(), 500);
        return; // Success, stop trying
      }
    }
    
    // If nothing found, retry after DOM changes
    setTimeout(() => this.tryMultipleShopifyInjections(), 1000);
  }
  
  injectEbayUI() {
    console.log('🏷️ Setting up eBay integration...');
    
    this.tryInjectEbay();
    this.setupEbayObserver();
  }
  
  tryInjectEbay() {
    // First, double-check no existing section exists (including hidden ones)
    const existingSections = document.querySelectorAll('#pebdeq-ebay-section');
    if (existingSections.length > 0) {
      console.log(`⚠️ Found ${existingSections.length} existing sections, cleaning up duplicates...`);
      // Remove all but the first one
      for (let i = 1; i < existingSections.length; i++) {
        existingSections[i].remove();
      }
      return true; // Section already exists
    }
    
    // Target eBay's photo upload area SPECIFICALLY - inject AFTER it
    const photoUploadArea = document.querySelector('.summary__photos') ||
                           document.querySelector('[class*="photos"]') ||
                           document.querySelector('[data-testid*="photo"]') ||
                           document.querySelector('[class*="image"]');
    
    console.log('🎯 Looking for eBay photo upload area...');
    console.log('📷 Found photo area:', photoUploadArea?.className || 'not found');
    
    if (photoUploadArea) {
      console.log('📤 Injecting AFTER photo upload area...');
      this.injectEbayPEBDEQSection(photoUploadArea, 'after');
      return true;
    }
    
    // Fallback: Look for any container that can hold our section
    const fallbackTargets = [
      document.querySelector('form'),
      document.querySelector('.main-content'),
      document.querySelector('main'),
      document.querySelector('#mainContent'),
      document.querySelector('.container')
    ];
    
    for (const target of fallbackTargets) {
      if (target) {
        console.log('🎯 Found fallback injection target:', target.tagName, target.className || 'no class');
        this.injectEbayPEBDEQSection(target, 'before');
        return true;
      }
    }
    
    console.log('❌ No suitable injection target found');
    return false;
  }
  
  setupEbayObserver() {
    console.log('👁️ Setting up eBay DOM observer...');
    
    let isInjecting = false; // Prevent infinite loops
    let lastCheckTime = 0;
    
    // Watch for DOM changes and re-inject if needed (with throttling)
    const observer = new MutationObserver((mutations) => {
      // SKIP if upload is in progress (pause mode)
      if (this.pauseEbayObserver) {
        // console.log('⏸️ Skipping DOM observer - upload in progress');
        return;
      }
      
      const now = Date.now();
      
      // Throttle checks to prevent excessive re-injection
      if (now - lastCheckTime < 1000 || isInjecting) return;
      lastCheckTime = now;
      
      // Check if our section still exists
      const section = document.getElementById('pebdeq-ebay-section');
      if (!section) {
        console.log('🔄 PEBDEQ section disappeared, re-injecting...');
        isInjecting = true;
        
        setTimeout(() => {
          this.tryInjectEbay();
          isInjecting = false;
        }, 500); // Delay to let DOM settle
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Backup check every 10 seconds (longer interval)
    this.ebayRetryInterval = setInterval(() => {
      // SKIP if upload is in progress (pause mode)
      if (this.pauseEbayObserver) {
        // console.log('⏸️ Skipping periodic check - upload in progress');
        return;
      }
      
      if (!document.getElementById('pebdeq-ebay-section') && !isInjecting) {
        console.log('⏰ Periodic retry: eBay section missing, re-injecting...');
        isInjecting = true;
        this.tryInjectEbay();
        setTimeout(() => { isInjecting = false; }, 1000);
      }
    }, 10000); // Changed from 3 to 10 seconds
  }
  
  injectPebdeqUI() {
    console.log('🌐 Setting up pebdeq.com integration...');
    // This is your own site, so you have full control
    this.injectPebdeqPEBDEQSection();
  }
  
  isListingPage() {
    const url = window.location.href;
    const hostname = window.location.hostname;
    
    // DEBUG LOG - ALWAYS SHOW
    console.log('🚨 DEBUG isListingPage()');
    console.log('🚨 URL:', url);
    console.log('🚨 Hostname:', hostname);
    
    // Etsy detection
    if (hostname.includes('etsy.com')) {
      const isEtsyListing = url.includes('/listing/') || 
             url.includes('/sell/') || 
             url.includes('/your/shops/');
      console.log('🚨 Etsy detection result:', isEtsyListing);
      return isEtsyListing;
    }
    
    // Shopify detection (enhanced)
    if (hostname.includes('shopify.com') || hostname.includes('myshopify.com')) {
      const isShopifyListing = url.includes('/admin/products') || 
             url.includes('/admin/products/new') ||
             url.includes('/admin/products/') ||
             url.includes('/admin/bulk') ||
             url.includes('product_id=') ||
             url.includes('/admin/themes') ||
             (url.includes('/admin') && (url.includes('product') || url.includes('media')));
      console.log('🚨 Shopify detection result:', isShopifyListing);
      console.log('🚨 URL matches checked:');
      console.log('  - /admin/products:', url.includes('/admin/products'));
      console.log('  - /admin/products/new:', url.includes('/admin/products/new'));
      console.log('  - /admin/products/:', url.includes('/admin/products/'));
      console.log('  - /admin + product:', url.includes('/admin') && url.includes('product'));
      return isShopifyListing;
    }
    
    // eBay detection  
    if (hostname.includes('ebay.com')) {
      return url.includes('/sl/sell') || 
             url.includes('/itm/edit') ||
             url.includes('/lstng') ||
             url.includes('mode=ReviseItem') ||
             url.includes('draftId=');
    }
    
    // pebdeq.com detection
    if (hostname.includes('pebdeq.com')) {
      return url.includes('/admin/') || url.includes('/products/');
    }
    
    // Amazon detection
    if (hostname.includes('amazon.com')) {
      return url.includes('/gp/product/') || 
             url.includes('/dp/') ||
             url.includes('/listing/') ||
             url.includes('/abis/') ||
             url.includes('/seller-central/');
    }
    
    // AliExpress detection
    if (hostname.includes('aliexpress.com')) {
      return url.includes('/item/') || 
             url.includes('/manage/') ||
             url.includes('/product/') ||
             url.includes('/seller/');
    }
    
    // Walmart detection
    if (hostname.includes('walmart.com')) {
      return url.includes('/seller/') || 
             url.includes('/item/') ||
             url.includes('/manage/') ||
             url.includes('/product/');
    }
    
    return false;
  }
  
  async loadPEBDEQPhotos() {
    try {
      // Communicate with PEBDEQ desktop app
      const response = await chrome.runtime.sendMessage({
        action: 'getPEBDEQPhotos'
      });
      
      if (response && response.photos) {
        this.pebdeqPhotos = response.photos;
        console.log(`📸 Loaded ${this.pebdeqPhotos.length} PEBDEQ photos`);
      }
    } catch (error) {
      console.log('📱 PEBDEQ desktop app not connected');
    }
  }
  
  observeFileUploads() {
    // Watch for file upload buttons and inputs
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            this.checkForUploadElements(node);
          }
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Also check existing elements
    this.checkForUploadElements(document.body);
  }
  
  checkForUploadElements(element) {
    // Look for file inputs and upload buttons
    const fileInputs = element.querySelectorAll('input[type="file"]');
    const uploadButtons = element.querySelectorAll('[data-test-id*="upload"], [class*="upload"], [id*="upload"]');
    
    fileInputs.forEach(input => this.enhanceFileInput(input));
    uploadButtons.forEach(button => this.enhanceUploadButton(button));
  }
  
  enhanceFileInput(input) {
    if (input.hasAttribute('data-pebdeq-enhanced')) return;
    input.setAttribute('data-pebdeq-enhanced', 'true');
    
    // Add PEBDEQ option near the file input
    const container = input.closest('div') || input.parentElement;
    if (container && this.pebdeqPhotos.length > 0) {
      this.addPEBDEQOption(container, input);
    }
  }
  
  enhanceUploadButton(button) {
    if (button.hasAttribute('data-pebdeq-enhanced')) return;
    button.setAttribute('data-pebdeq-enhanced', 'true');
    
    // If this looks like a photo upload button
    const text = button.textContent.toLowerCase();
    if (text.includes('photo') || text.includes('image') || text.includes('upload')) {
      this.addPEBDEQOption(button.parentElement, null);
    }
  }
  
  addPEBDEQOption(container, fileInput) {
    const pebdeqContainer = document.createElement('div');
    pebdeqContainer.className = 'pebdeq-integration-container';
    pebdeqContainer.innerHTML = `
      <div class="pebdeq-option">
        <input type="checkbox" id="use-pebdeq-photos" class="pebdeq-checkbox">
        <label for="use-pebdeq-photos" class="pebdeq-label">
          📸 Upload Processed Photos
        </label>
      </div>
      <div class="pebdeq-photo-selector hidden" id="pebdeq-photo-selector">
        <div class="pebdeq-photos-grid">
          ${this.renderPhotoGrid()}
        </div>
      </div>
    `;
    
    container.appendChild(pebdeqContainer);
    
    // Add event listeners
    const checkbox = pebdeqContainer.querySelector('#use-pebdeq-photos');
    const selector = pebdeqContainer.querySelector('#pebdeq-photo-selector');
    
    checkbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        selector.classList.remove('hidden');
      } else {
        selector.classList.add('hidden');
      }
    });
    
    // Add click handlers for photos
    const photoElements = pebdeqContainer.querySelectorAll('.pebdeq-photo');
    photoElements.forEach(photo => {
      photo.addEventListener('click', (e) => {
        const photoId = e.target.dataset.photoId;
        this.selectPEBDEQPhoto(photoId, fileInput);
      });
    });
  }
  
  renderPhotoGrid() {
    return this.pebdeqPhotos.map(photo => `
      <div class="pebdeq-photo" data-photo-id="${photo.id}">
        <img src="${photo.thumbnail}" alt="${photo.name}" />
        <div class="pebdeq-photo-name">${photo.name}</div>
        <div class="pebdeq-photo-info">${photo.preset} • ${photo.size}</div>
      </div>
    `).join('');
  }
  
  async selectPEBDEQPhoto(photoId, fileInput) {
    console.log(`📸 Selecting PEBDEQ photo: ${photoId}`);
    
    try {
      // Get the actual file from PEBDEQ
      const response = await chrome.runtime.sendMessage({
        action: 'getPEBDEQPhoto',
        photoId: photoId
      });
      
      if (response && response.file) {
        // Convert to File object and trigger upload
        const file = this.dataURLtoFile(response.file.data, response.file.name);
        
        if (fileInput) {
          // Simulate file selection
          this.simulateFileSelection(fileInput, file);
        } else {
          // Upload directly via Etsy's API
          this.uploadToEtsy(file);
        }
        
        // Visual feedback
        this.showUploadSuccess(response.file.name);
      }
    } catch (error) {
      console.error('❌ Failed to get PEBDEQ photo:', error);
      this.showUploadError('Failed to load photo from PEBDEQ');
    }
  }
  
  dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }
  
  simulateFileSelection(input, file) {
    // Create a new FileList with our file
    const dt = new DataTransfer();
    dt.items.add(file);
    input.files = dt.files;
    
    // Trigger change event
    const event = new Event('change', { bubbles: true });
    input.dispatchEvent(event);
  }
  
  uploadToEtsy(file) {
    // Find Etsy's upload mechanism and trigger it
    console.log('🚀 Uploading to Etsy:', file.name);
    
    // This would need to integrate with Etsy's specific upload API
    // Each platform has different upload mechanisms
  }
  
  showUploadSuccess(filename) {
    this.showNotification(`✅ ${filename} uploaded successfully!`, 'success');
  }
  
  showUploadError(message) {
    this.showNotification(`❌ ${message}`, 'error');
  }
  
  
  

  

  

  

  

  

  

  

  
  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `pebdeq-notification pebdeq-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
  

  
  // ============ PLATFORM-SPECIFIC INJECTION METHODS ============
  
  injectAdvancedShopifySection(targetElement, injectionType) {
    if (document.getElementById('pebdeq-shopify-modal')) return;
    
    console.log('🛍️ Creating PEBDEQ popup modal for Shopify...');
    
    const storeInfo = this.currentShopifyStore;
    const storeName = storeInfo?.displayName || storeInfo?.storeName || 'Your Shopify Store';
    
    // Create modal overlay
    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'pebdeq-shopify-modal-overlay';
    modalOverlay.style.cssText = `
      position: fixed !important;
      top: 0 !important;
      left: 0 !important;
      width: 100% !important;
      height: 100% !important;
      background: rgba(0, 0, 0, 0.5) !important;
      z-index: 999999 !important;
      display: none !important;
      justify-content: center !important;
      align-items: center !important;
    `;
    
    // Create the PEBDEQ modal content
    const pebdeqModal = document.createElement('div');
    pebdeqModal.id = 'pebdeq-shopify-modal';
    pebdeqModal.className = 'Polaris-Card pebdeq-shopify-integration';
    pebdeqModal.style.cssText = `
      position: relative !important;
      background: linear-gradient(135deg, #ffffff 0%, #f8fafb 100%) !important;
      border-radius: 16px !important;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 8px 32px rgba(0, 0, 0, 0.2) !important;
      max-width: 800px !important;
      width: 95% !important;
      min-height: 70vh !important;
      max-height: 90vh !important;
      overflow-y: auto !important;
      margin: 20px !important;
      border: 1px solid rgba(0, 128, 96, 0.1) !important;
    `;
    pebdeqModal.innerHTML = `
      <div class="Polaris-Card__Header">
        <div class="Polaris-Stack Polaris-Stack--alignment-center">
          <div class="Polaris-Stack__Item Polaris-Stack__Item--fill">
            <h2 class="Polaris-Heading">🛍️ PEBDEQ × Shopify</h2>
            <p class="Polaris-TextStyle--subdued">Store: ${storeName}</p>
          </div>
          <div class="Polaris-Stack__Item">
            <button id="pebdeq-modal-close" class="Polaris-Button Polaris-Button--plain" style="margin-right: 10px;">
              <span class="Polaris-Button__Content">
                <span class="Polaris-Button__Text">✕</span>
              </span>
            </button>
            <div class="Polaris-Badge Polaris-Badge--statusSuccess">
              <span class="Polaris-Badge__Pip"></span>
              <span class="Polaris-Badge__Content">Connected</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="Polaris-Card__Section">
        <div class="Polaris-Stack Polaris-Stack--vertical Polaris-Stack--spacing-loose">
          
          <!-- Photo Upload Section -->
          <div class="Polaris-Stack__Item">
            <div class="Polaris-FormLayout">
              <div class="Polaris-FormLayout__Item">
                <div class="Polaris-Labelled__LabelWrapper">
                  <div class="Polaris-Label">
                    <label class="Polaris-Label__Text">📤 Upload Photos for Processing</label>
                  </div>
                </div>
                <div class="Polaris-Connected">
                  <div class="Polaris-Connected__Item Polaris-Connected__Item--primary">
                    <input type="file" id="pebdeq-file-input-shopify" multiple accept="image/*" 
                           class="Polaris-DropZone__FileInput" style="opacity: 0; position: absolute; pointer-events: none;" />
                    <div class="Polaris-DropZone" onclick="document.getElementById('pebdeq-file-input-shopify').click()">
                      <div class="Polaris-DropZone__Container">
                        <div class="Polaris-Stack Polaris-Stack--vertical Polaris-Stack--alignment-center">
                          <div class="Polaris-Stack__Item">
                            <span class="Polaris-Icon">📷</span>
                          </div>
                          <div class="Polaris-Stack__Item">
                            <div class="Polaris-DisplayText Polaris-DisplayText--sizeSmall">
                              Click to select photos or drag and drop
                            </div>
                          </div>
                          <div class="Polaris-Stack__Item">
                            <div class="Polaris-TextStyle--subdued">
                              Upload photos for AI background removal
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Selected Photos Display -->
          <div class="Polaris-Stack__Item" id="pebdeq-selected-photos-shopify" style="display: none;">
            <div class="Polaris-Card Polaris-Card--subdued">
              <div class="Polaris-Card__Section">
                <div class="Polaris-Stack">
                  <div class="Polaris-Stack__Item Polaris-Stack__Item--fill">
                    <h3 class="Polaris-Heading">Selected Photos</h3>
                  </div>
                  <div class="Polaris-Stack__Item">
                    <button type="button" class="Polaris-Button Polaris-Button--primary" 
                            id="pebdeq-send-to-desktop-shopify" disabled>
                      <span class="Polaris-Button__Content">
                        <span class="Polaris-Button__Text">📤 Send to Desktop</span>
                      </span>
            </button>
          </div>
        </div>
                <div id="pebdeq-file-list-shopify" class="Polaris-Stack Polaris-Stack--vertical" style="margin-top: 16px;">
                  <!-- File list will be populated here -->
      </div>
              </div>
            </div>
          </div>
          
          <!-- Processed Photos Section -->
          <div class="Polaris-Stack__Item" id="pebdeq-processed-photos-shopify" style="display: none;">
            <div class="Polaris-Card Polaris-Card--statusSuccess">
              <div class="Polaris-Card__Section">
                <div class="Polaris-Stack">
                  <div class="Polaris-Stack__Item Polaris-Stack__Item--fill">
                    <h3 class="Polaris-Heading">✨ Processed Photos Ready</h3>
                    <p class="Polaris-TextStyle--subdued">Photos are ready for upload to your Shopify store</p>
                  </div>
                  <div class="Polaris-Stack__Item">
                    <button type="button" class="Polaris-Button Polaris-Button--primary" 
                            id="pebdeq-upload-to-shopify" disabled style="background: linear-gradient(135deg, #008060, #00a76a) !important; font-size: 16px !important; padding: 16px 32px !important; border-radius: 12px !important;">
                      <span class="Polaris-Button__Content">
                        <span class="Polaris-Button__Text">🚀 Upload to Shopify</span>
                      </span>
                    </button>
                  </div>
                </div>
                <div id="pebdeq-processed-list-shopify" style="margin-top: 16px;">
                  <!-- Processed photos list will be populated here -->
                </div>
              </div>
            </div>
          </div>
          

          
        </div>
      </div>
      
      <style>
        .pebdeq-shopify-integration {
          margin: 16px 0 !important;
          border: 2px solid #008060 !important;
          display: block !important;
          visibility: visible !important;
          position: relative !important;
          z-index: 1000 !important;
        }
        
        .pebdeq-shopify-integration .Polaris-Card__Header {
          background: linear-gradient(135deg, #008060 0%, #004c3f 100%) !important;
          color: white !important;
        }
        
        .pebdeq-shopify-integration .Polaris-Heading,
        .pebdeq-shopify-integration .Polaris-TextStyle--subdued {
          color: white !important;
        }
        
        .pebdeq-shopify-integration .Polaris-DropZone {
          border: 2px dashed #008060 !important;
          transition: all 0.2s ease !important;
        }
        
        .pebdeq-shopify-integration .Polaris-DropZone:hover {
          border-color: #004c3f !important;
          background-color: #f6f9f8 !important;
        }
        
        .pebdeq-file-item {
          display: flex !important;
          align-items: center !important;
          padding: 8px !important;
          background: #f6f9f8 !important;
          border-radius: 4px !important;
          margin: 4px 0 !important;
        }
        
        .pebdeq-file-item .file-name {
          flex: 1 !important;
          font-weight: 500 !important;
        }
        
        .pebdeq-file-item .file-size {
          color: #6d7175 !important;
          margin: 0 8px !important;
        }
        
        .pebdeq-file-item .remove-btn {
          background: #d72c0d !important;
          color: white !important;
          border: none !important;
          border-radius: 2px !important;
          padding: 2px 6px !important;
          font-size: 12px !important;
          cursor: pointer !important;
        }

        /* REAL-TIME ANIMATIONS */
        @keyframes flashGreen {
          0% { border-color: rgba(0, 128, 96, 0.1); }
          50% { border-color: #00a76a; box-shadow: 0 0 20px rgba(0, 167, 106, 0.5); }
          100% { border-color: rgba(0, 128, 96, 0.1); }
        }

        @keyframes slideInRight {
          0% { transform: translateX(100px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        @keyframes fadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; transform: translateX(100px); }
        }

        @keyframes slideIn {
          0% { transform: translateY(-20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 128, 96, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(0, 128, 96, 0); }
          100% { box-shadow: 0 0 0 0 rgba(0, 128, 96, 0); }
        }
      </style>
    `;
    
    // Setup modal structure: overlay contains modal  
    modalOverlay.appendChild(pebdeqModal);
    document.body.appendChild(modalOverlay);
    
    console.log('📍 PEBDEQ modal overlay injected to body');
    
    // Create floating trigger button for opening modal
    const triggerButton = document.createElement('button');
    triggerButton.id = 'pebdeq-shopify-trigger';
    triggerButton.innerHTML = '🛍️ PEBDEQ';
    triggerButton.style.cssText = `
      position: fixed !important;
      bottom: 20px !important;
      right: 20px !important;
      background: linear-gradient(135deg, #008060, #00a76a) !important;
      color: white !important;
      border: none !important;
      border-radius: 24px !important;
      padding: 12px 20px !important;
      font-weight: bold !important;
      cursor: pointer !important;
      box-shadow: 0 6px 24px rgba(0, 128, 96, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2) !important;
      z-index: 999998 !important;
      font-size: 15px !important;
      transition: all 0.3s ease !important;
      backdrop-filter: blur(10px) !important;
    `;
    
    // Add hover effects
    triggerButton.addEventListener('mouseenter', () => {
      triggerButton.style.transform = 'scale(1.05)';
      triggerButton.style.boxShadow = '0 8px 32px rgba(0, 128, 96, 0.4), 0 4px 16px rgba(0, 0, 0, 0.3)';
    });
    
    triggerButton.addEventListener('mouseleave', () => {
      triggerButton.style.transform = 'scale(1)';
      triggerButton.style.boxShadow = '0 6px 24px rgba(0, 128, 96, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)';
    });
    
    document.body.appendChild(triggerButton);
    console.log('📍 PEBDEQ trigger button added to bottom-right');
    
    this.setupAdvancedShopifyListeners();
    
    // Force visibility check after setup
    setTimeout(() => this.forceShopifyUIVisibility(), 200);
    
    console.log('✅ Shopify Advanced integration setup completed');
  }
  
  // Keep old method for backward compatibility
  injectShopifyPEBDEQSection(mediaSection) {
    this.injectAdvancedShopifySection(mediaSection, 'media');
  }
  
  injectEbayPEBDEQSection(photoSection, position = 'before') {
    if (document.getElementById('pebdeq-ebay-section')) return;
    
    const pebdeqSection = document.createElement('div');
    pebdeqSection.id = 'pebdeq-ebay-section';
    pebdeqSection.className = 'pebdeq-ebay-integration';
    pebdeqSection.innerHTML = `
      <div class="pebdeq-section">
        <div class="pebdeq-header" style="margin-bottom: 15px;">
          <h3 style="margin: 0;">📤 Send to Desktop for Processing</h3>
        </div>
        <div id="pebdeq-upload-interface-ebay">
          <input type="file" id="pebdeq-file-input-ebay" multiple accept="image/*" style="margin: 10px 0;" />
          <div id="pebdeq-selected-photos-ebay"></div>
          <button id="pebdeq-send-to-desktop-ebay" style="margin-top: 10px; background: #0054a4; color: white; padding: 8px 16px; border: none; border-radius: 4px;">
            📤 Send to Desktop
          </button>
          <button id="pebdeq-check-processed-ebay" style="margin: 10px 0 0 10px; background: #4caf50; color: white; padding: 8px 16px; border: none; border-radius: 4px;">
            🔍 Check Processed
          </button>
        </div>
        <div id="pebdeq-processed-photos-ebay" style="display: none; margin-top: 15px; padding: 15px; background: #f0f8ff; border-radius: 8px; border: 2px solid #4caf50;">
          <h4 style="margin: 0 0 10px 0; color: #2e7d32;">✨ Processed Photos Ready</h4>
          <div id="pebdeq-processed-list-ebay" style="margin-bottom: 10px;"></div>
          <button id="pebdeq-upload-to-ebay" style="background: #2e7d32; color: white; padding: 10px 20px; border: none; border-radius: 4px; font-weight: bold;" disabled>
            🌐 Upload to EBAY
          </button>
          <button id="pebdeq-clear-ebay" style="background: #d32f2f; color: white; padding: 10px 20px; border: none; border-radius: 4px; font-weight: bold; margin-left: 10px;">
            🧹 Clear All
          </button>
      </div>
      </div>
      
      <style>
        .pebdeq-ebay-integration {
          background: #fff !important;
          border: 2px solid #0054a4 !important;
          border-radius: 8px !important;
          padding: 16px !important;
          margin: 16px 0 !important;
          font-family: Arial, sans-serif !important;
          width: auto !important;
          max-width: 100% !important;
          min-width: 400px !important;
          box-sizing: border-box !important;
          display: block !important;
          position: relative !important;
          z-index: 1000 !important;
          overflow: visible !important;
          clear: both !important;
        }
        
        .pebdeq-ebay-integration h3 {
          color: #0054a4 !important;
          font-size: 16px !important;
          font-weight: bold !important;
          margin: 0 !important;
          padding: 0 !important;
          line-height: normal !important;
        }
        
        .pebdeq-ebay-integration .pebdeq-header {
          margin-bottom: 15px !important;
          display: block !important;
        }
        
        .pebdeq-ebay-integration button {
          display: inline-block !important;
          margin: 10px 10px 0 0 !important;
          padding: 8px 16px !important;
          border: none !important;
          border-radius: 4px !important;
          cursor: pointer !important;
          font-family: Arial, sans-serif !important;
          font-size: 14px !important;
          transition: all 0.2s ease !important;
        }
        
        .pebdeq-ebay-integration button:hover {
          opacity: 0.9 !important;
          transform: translateY(-1px) !important;
        }
        
        .pebdeq-ebay-integration button:disabled {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
        }
        
        .pebdeq-ebay-integration input[type="file"] {
          width: 100% !important;
          max-width: 400px !important;
          margin: 10px 0 !important;
          padding: 8px !important;
          border: 1px solid #ccc !important;
          border-radius: 4px !important;
          font-family: Arial, sans-serif !important;
        }
      </style>
    `;
    
    // Position-based insertion strategy
    try {
      let insertionSuccess = false;
      
      console.log('🔍 Target analysis:', {
        tagName: photoSection.tagName,
        className: photoSection.className,
        textContent: photoSection.textContent?.slice(0, 100),
        position: position,
        parentTag: photoSection.parentNode?.tagName
      });
      
      if (position === 'after') {
        console.log('📍 AFTER Strategy: Inserting after photo upload area');
        
        // Find the next sibling or insert at end of parent
        if (photoSection.nextSibling) {
          console.log('📍 Inserting before next sibling');
          photoSection.parentNode.insertBefore(pebdeqSection, photoSection.nextSibling);
        } else {
          console.log('📍 Appending after photo section');
          photoSection.parentNode.appendChild(pebdeqSection);
        }
        insertionSuccess = true;
      } else {
        // Original 'before' logic
        console.log('📍 BEFORE Strategy: Original injection logic');
        
        if (photoSection.tagName && photoSection.tagName.match(/^H[1-6]$/)) {
          console.log('📍 Inserting after heading');
          photoSection.parentNode.insertBefore(pebdeqSection, photoSection.nextSibling);
        } else if (photoSection.className && photoSection.className.includes('summary__photos')) {
          console.log('📍 Inserting before summary photos');
          photoSection.parentNode.insertBefore(pebdeqSection, photoSection);
        } else {
          console.log('📍 Inserting at beginning of container');
    photoSection.insertBefore(pebdeqSection, photoSection.firstChild);
        }
        insertionSuccess = true;
      }
      
      if (insertionSuccess) {
        console.log('✅ PEBDEQ section successfully injected into eBay');
    this.setupNewWorkflowListeners('ebay');
      }
      
    } catch (error) {
      console.error('❌ Error injecting PEBDEQ section:', error);
      console.log('🔄 Trying fallback injection...');
      
      // Fallback 1: Try inserting before the first major section
      try {
        const mainContent = document.querySelector('main') || document.querySelector('[role="main"]') || document.querySelector('.main-content');
        if (mainContent && mainContent.firstElementChild) {
          mainContent.insertBefore(pebdeqSection, mainContent.firstElementChild);
          console.log('✅ Fallback injection successful');
          this.setupNewWorkflowListeners('ebay');
        } else {
          throw new Error('No main content found');
        }
      } catch (fallbackError) {
        // Final fallback: append to body with fixed positioning
        console.log('🚨 Using emergency body injection');
        pebdeqSection.style.position = 'relative';
        pebdeqSection.style.zIndex = '1000';
        pebdeqSection.style.margin = '20px auto';
        pebdeqSection.style.maxWidth = '800px';
        document.body.appendChild(pebdeqSection);
        this.setupNewWorkflowListeners('ebay');
      }
    }
  }
  
  injectPebdeqPEBDEQSection() {
    if (document.getElementById('pebdeq-native-section')) return;
    
    const pebdeqSection = document.createElement('div');
    pebdeqSection.id = 'pebdeq-native-section';
    pebdeqSection.innerHTML = `
      <div class="pebdeq-native-integration">
        <h3>🎨 Desktop PEBDEQ Integration</h3>
        <p>Directly connected to your PEBDEQ Desktop App</p>
        <button id="sync-pebdeq-photos">🔄 Sync Latest Photos</button>
        <div id="pebdeq-photos-grid-native">
          ${this.createPhotoGrid('native')}
        </div>
      </div>
    `;
    
    const targetElement = document.querySelector('.product-form') || 
                          document.querySelector('.media-upload') ||
                          document.body;
    
    targetElement.appendChild(pebdeqSection);
    this.setupPlatformEventListeners('native');
  }
  
  createPhotoGrid(platform) {
    return this.pebdeqPhotos.map(photo => `
      <div class="pebdeq-photo-item" data-photo-id="${photo.id}" data-platform="${platform}">
        <img src="data:image/jpeg;base64,${photo.thumbnail || ''}" alt="${photo.name}" />
        <div class="photo-info">
          <span class="photo-name">${photo.name}</span>
          <span class="photo-dimensions">${photo.dimensions}</span>
        </div>
      </div>
    `).join('');
  }
  
  setupPlatformEventListeners(platform) {
    const checkbox = document.getElementById(`use-pebdeq-photos-${platform}`);
    const grid = document.getElementById(`pebdeq-photos-grid-${platform}`);
    
    if (checkbox && grid) {
      checkbox.addEventListener('change', (e) => {
        grid.style.display = e.target.checked ? 'grid' : 'none';
      });
      
      grid.addEventListener('click', (e) => {
        const photoItem = e.target.closest('.pebdeq-photo-item');
        if (photoItem) {
          const photoId = photoItem.dataset.photoId;
          this.handlePhotoSelection(photoId, platform);
        }
      });
    }
  }
  
  async handlePhotoSelection(photoId, platform) {
    console.log(`📸 Selected photo ${photoId} for ${platform}`);
    
    switch (platform) {
      case 'shopify':
        await this.uploadToShopify(photoId);
        break;
      case 'ebay':
        await this.uploadToEbay(photoId);
        break;
      case 'native':
        await this.uploadToPebdeqSite(photoId);
        break;
      default:
        await this.uploadToEtsy(photoId);
    }
  }
  
  async uploadToShopify(photoId) {
    console.log('🛍️ Uploading to Shopify:', photoId);
    // Platform-specific implementation
  }
  
  async uploadToEbay(photoId) {
    console.log('🏷️ Uploading to eBay:', photoId);
    // Platform-specific implementation
  }
  
  async uploadToPebdeqSite(photoId) {
    console.log('🌐 Uploading to pebdeq.com:', photoId);
    // Your site-specific implementation
  }
  
  // ============ NEW WORKFLOW IMPLEMENTATION ============
  
  setupNewWorkflowListeners(platform) {
    const checkbox = document.getElementById(`use-pebdeq-workflow-${platform}`);
    const uploadInterface = document.getElementById(`pebdeq-upload-interface-${platform}`);
    const fileInput = document.getElementById(`pebdeq-file-input-${platform}`);
    const selectedPhotosDiv = document.getElementById(`pebdeq-selected-photos-${platform}`);
    const sendButton = document.getElementById(`pebdeq-send-to-desktop-${platform}`);
    const checkProcessedButton = document.getElementById(`pebdeq-check-processed-${platform}`);
    const processedPhotosDiv = document.getElementById(`pebdeq-processed-photos-${platform}`);
    const uploadToPlatformButton = document.getElementById(`pebdeq-upload-to-${platform}`);
    
    // For Etsy, we removed the checkbox, so only check required elements
    if (!uploadInterface || !fileInput || !sendButton) {
      console.error('❌ Could not find essential workflow elements for', platform);
      return;
    }
    
    // Only set up checkbox listener if checkbox exists (Shopify, eBay)
    if (checkbox && platform !== 'etsy') {
      if (!checkbox) {
        console.error('❌ Could not find checkbox for', platform);
        return;
      }
    }
    
    // Store selected files per platform
    this.selectedFiles = this.selectedFiles || {};
    this.selectedFiles[platform] = [];
    
    // Checkbox toggle (only for platforms that have checkboxes)
    if (checkbox && platform !== 'etsy') {
    checkbox.addEventListener('change', (e) => {
      uploadInterface.style.display = e.target.checked ? 'block' : 'none';
      if (!e.target.checked) {
        this.clearSelectedFiles(platform);
      }
    });
    }
    
    // File input validation and preview
    fileInput.addEventListener('change', (e) => {
      this.handleFileSelection(e, platform);
    });
    
    // Send to desktop button
    sendButton.addEventListener('click', () => {
      this.sendFilesToDesktop(platform);
    });
    
    // Check processed button
    if (checkProcessedButton) {
      checkProcessedButton.addEventListener('click', () => {
        this.checkProcessedImages(platform);
      });
    }
    
    // Upload to platform button
    if (uploadToPlatformButton) {
      uploadToPlatformButton.addEventListener('click', () => {
        this.uploadProcessedToPlatform(platform);
      });
    }
    
    // Clear button
    const clearButton = document.getElementById(`pebdeq-clear-${platform}`);
    if (clearButton) {
      clearButton.addEventListener('click', () => {
        this.clearProcessedImages(platform);
      });
    }
    

  }
  
  handleFileSelection(event, platform) {
    const files = Array.from(event.target.files);
    const maxFiles = this.availableSlots;
    
    // Validate file count
    if (files.length > maxFiles) {
      alert(`⚠️ You can only select ${maxFiles} photos (${maxFiles} slots available)`);
      event.target.value = ''; // Clear selection
      return;
    }
    
    // Validate file types
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      alert('⚠️ Only image files are allowed');
      return;
    }
    
    // Store selected files
    this.selectedFiles[platform] = validFiles;
    
    // Update preview and button
    this.updateFilePreview(platform);
    this.updateSendButton(platform);
  }
  
  updateFilePreview(platform) {
    const selectedPhotosDiv = document.getElementById(`pebdeq-selected-photos-${platform}`);
    const files = this.selectedFiles[platform];
    
    if (files.length === 0) {
      selectedPhotosDiv.innerHTML = '';
      return;
    }
    
    let previewHTML = '<div class="selected-files-preview">';
    files.forEach((file, index) => {
      const size = (file.size / 1024 / 1024).toFixed(1);
      previewHTML += `
        <div class="file-preview-item">
          <span class="file-name">${file.name}</span>
          <span class="file-size">${size}MB</span>
          <button class="remove-file-btn" data-index="${index}">✕</button>
        </div>
      `;
    });
    previewHTML += '</div>';
    
    selectedPhotosDiv.innerHTML = previewHTML;
    
    // Add remove file functionality
    selectedPhotosDiv.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-file-btn')) {
        const index = parseInt(e.target.dataset.index);
        this.removeFileFromSelection(platform, index);
      }
    });
  }
  
  removeFileFromSelection(platform, index) {
    this.selectedFiles[platform].splice(index, 1);
    this.updateFilePreview(platform);
    this.updateSendButton(platform);
    
    // Update file input
    const fileInput = document.getElementById(`pebdeq-file-input-${platform}`);
    if (this.selectedFiles[platform].length === 0) {
      fileInput.value = '';
    }
  }
  
  updateSendButton(platform) {
    const sendButton = document.getElementById(`pebdeq-send-to-desktop-${platform}`);
    const fileCount = this.selectedFiles[platform].length;
    
    // Only update enable/disable state, keep simple text
    sendButton.disabled = fileCount === 0;
    sendButton.style.opacity = fileCount === 0 ? '0.5' : '1';
  }
  
  clearSelectedFiles(platform) {
    this.selectedFiles[platform] = [];
    this.updateFilePreview(platform);
    this.updateSendButton(platform);
    
    const fileInput = document.getElementById(`pebdeq-file-input-${platform}`);
    if (fileInput) fileInput.value = '';
  }
  
  async sendFilesToDesktop(platform) {
    const files = this.selectedFiles[platform];
    if (files.length === 0) {
      alert('⚠️ No files selected');
      return;
    }
    
    const sendButton = document.getElementById(`pebdeq-send-to-desktop-${platform}`);
    sendButton.textContent = '⏳ Sending...';
    sendButton.disabled = true;
    
    try {
      // Convert files to base64 and send to desktop
      const fileData = await Promise.all(files.map(async (file) => {
        const base64 = await this.fileToBase64(file);
        return {
          name: file.name,
          size: file.size,
          type: file.type,
          data: base64,
          targetPlatform: platform
        };
      }));
      
      // Send to desktop via background script
      const response = await chrome.runtime.sendMessage({
        action: 'sendPhotosToDesktop',
        files: fileData,
        platform: platform
      });
      
      if (response.success) {
        this.showNotification(`✅ ${files.length} photos sent to PEBDEQ Desktop!`, 'success');
        this.clearSelectedFiles(platform);
        
        // Add platform to active polling list in background script
        console.log(`📍 Content script: Adding ${platform} to active polling platforms`);
        chrome.runtime.sendMessage({
          action: 'addActivePlatform',
          platform: platform
        }, (response) => {
          console.log(`✅ Content script: Successfully added ${platform} to polling:`, response);
        });
        
        // Update available slots (they're now "reserved")
        this.availableSlots -= files.length;
      } else {
        throw new Error(response.error || 'Failed to send photos');
      }
      
    } catch (error) {
      console.error('❌ Failed to send photos to desktop:', error);
      this.showNotification(`❌ Failed to send photos: ${error.message}`, 'error');
    } finally {
      sendButton.disabled = false;
      sendButton.textContent = '📤 Send to Desktop';
    }
  }
  

  
  async checkProcessedImages(platform) {
    const checkButton = document.getElementById(`pebdeq-check-processed-${platform}`);
    const processedDiv = document.getElementById(`pebdeq-processed-photos-${platform}`);
    const processedList = document.getElementById(`pebdeq-processed-list-${platform}`);
    const uploadButton = document.getElementById(`pebdeq-upload-to-${platform}`);
    
    if (!checkButton) return;
    
    // Update button to show loading
    const originalText = checkButton.textContent;
    checkButton.textContent = '🔄 Checking...';
    checkButton.disabled = true;
    
    try {
      // Ask background script to check for processed images
      const response = await chrome.runtime.sendMessage({
        action: 'checkProcessedImages',
        platform: platform
      });
      
      if (response.success && response.images && response.images.length > 0) {
        // Display processed images
        processedList.innerHTML = '';
        
        response.images.forEach((image, index) => {
          const imageItem = document.createElement('div');
          imageItem.style.cssText = 'margin: 5px 0; padding: 8px; background: white; border-radius: 4px; border: 1px solid #ddd;';
          imageItem.innerHTML = `
            <span style="font-weight: bold;">📸 ${image.originalName}</span>
            <span style="color: #666; margin-left: 10px;">✅ Processed</span>
          `;
          processedList.appendChild(imageItem);
        });
        
        // Store images for upload
        this.processedImages = this.processedImages || {};
        this.processedImages[platform] = response.images;
        
        // Show processed photos section
        processedDiv.style.display = 'block';
        uploadButton.disabled = false;
        
        this.showNotification(`✨ ${response.images.length} processed images ready for upload!`, 'success');
        
      } else {
        this.showNotification('ℹ️ No processed images available yet', 'info');
        processedDiv.style.display = 'none';
      }
      
    } catch (error) {
      console.error('❌ Error checking processed images:', error);
      this.showNotification('❌ Failed to check processed images', 'error');
    } finally {
      checkButton.textContent = originalText;
      checkButton.disabled = false;
    }
  }

  async clearProcessedImages(platform) {
    if (!confirm(`🧹 Clear all processed images for ${platform.toUpperCase()}?\n\nThis will remove all stored images from memory.`)) {
      return;
    }
    
    try {
      // Clear from backend storage
      const response = await fetch('http://localhost:8000/api/clear-processed-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platform })
      });
      
      if (response.ok) {
        console.log(`🧹 Manually cleared processed images for ${platform}`);
        
        // Clear local display
        this.processedImages = this.processedImages || {};
        this.processedImages[platform] = [];
        
        const processedDiv = document.getElementById(`pebdeq-processed-photos-${platform}`);
        if (processedDiv) processedDiv.style.display = 'none';
        
        // Remove from polling
        chrome.runtime.sendMessage({
          action: 'removeActivePlatform',
          platform: platform
        });
        
        this.showNotification(`🧹 All processed images cleared for ${platform.toUpperCase()}!`, 'success');
        
      } else {
        throw new Error('Failed to clear backend storage');
      }
      
    } catch (error) {
      console.error('❌ Error clearing processed images:', error);
      this.showNotification(`❌ Failed to clear images for ${platform.toUpperCase()}`, 'error');
    }
  }


  
  async uploadProcessedToPlatform(platform) {
    const uploadButton = document.getElementById(`pebdeq-upload-to-${platform}`);
    const images = this.processedImages?.[platform];
    
    if (!images || images.length === 0) {
      this.showNotification('❌ No processed images to upload', 'error');
      return;
    }
    
    const originalText = uploadButton.textContent;
    uploadButton.textContent = '🌐 Uploading...';
    uploadButton.disabled = true;
    
    try {
      if (platform === 'etsy') {
        await this.uploadToEtsy(images);
      } else if (platform === 'shopify') {
        await this.uploadToShopify(images);
      } else if (platform === 'ebay') {
        await this.uploadToEbay(images);
      } else {
        this.showNotification(`🚧 Upload to ${platform.toUpperCase()} feature coming soon!`, 'info');
      }
      
      // Remove platform from active polling after successful upload
      chrome.runtime.sendMessage({
        action: 'removeActivePlatform',
        platform: platform
      });
      
      // Clear processed images from backend storage
      try {
        const response = await fetch('http://localhost:8000/api/clear-processed-images', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ platform: platform })
        });
        
        if (response.ok) {
          console.log(`🧹 Cleared processed images from backend for ${platform}`);
          this.showNotification(`✅ Upload completed and storage cleared!`, 'success');
        }
      } catch (error) {
        console.error('❌ Failed to clear backend storage:', error);
      }
      
      // Clear the processed images display
      this.processedImages[platform] = [];
      const processedDiv = document.getElementById(`pebdeq-processed-photos-${platform}`);
      if (processedDiv) processedDiv.style.display = 'none';
      
    } catch (error) {
      console.error(`❌ Error uploading to ${platform}:`, error);
      this.showNotification(`❌ Failed to upload to ${platform.toUpperCase()}`, 'error');
    } finally {
      uploadButton.textContent = originalText;
      uploadButton.disabled = false;
    }
  }

  async uploadToEtsy(images) {
    console.log(`📤 Starting Etsy upload for ${images.length} images`);
    
    // Find Etsy's file input elements
    const fileInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
    let etsyFileInput = null;
    
    // Look for Etsy's specific file input (multiple possible selectors)
    for (const input of fileInputs) {
      if (input.multiple || 
          input.closest('[data-test-id*="photo"]') || 
          input.closest('[class*="photo"]') ||
          input.closest('[class*="image"]') ||
          input.closest('[class*="upload"]')) {
        etsyFileInput = input;
        break;
      }
    }
    
    if (!etsyFileInput) {
      // Fallback: look for any file input that accepts images
      etsyFileInput = document.querySelector('input[type="file"][accept*="image"]');
    }
    
    if (!etsyFileInput) {
      throw new Error('Could not find Etsy file upload input. Make sure you are on the correct upload page.');
    }
    
    console.log('🎯 Found Etsy file input:', etsyFileInput);
    
    // Convert base64 images to File objects
    const files = [];
    for (const image of images) {
      try {
        // Convert base64 to blob
        const response = await fetch(image.processedData);
        const blob = await response.blob();
        
        // Create file with original name
        const file = new File([blob], image.originalName, { 
          type: 'image/png',
          lastModified: Date.now()
        });
        
        files.push(file);
        console.log(`✅ Converted ${image.originalName} to file object`);
      } catch (error) {
        console.error(`❌ Failed to convert ${image.originalName}:`, error);
      }
    }
    
    if (files.length === 0) {
      throw new Error('Failed to convert any images to file objects');
    }
    
    // Create a FileList-like object
    const fileList = this.createFileList(files);
    
    // Alternative approach: Find Etsy's drop zone and simulate drop
    const dropZone = this.findEtsyDropZone();
    
    if (dropZone) {
      console.log('🎯 Found Etsy drop zone, using drag&drop simulation');
      
      // Simulate drag and drop on the drop zone
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      
      // Simulate dragenter
      const dragEnterEvent = new DragEvent('dragenter', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      });
      dropZone.dispatchEvent(dragEnterEvent);
      
      // Simulate dragover
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      });
      dropZone.dispatchEvent(dragOverEvent);
      
      // Simulate drop
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      });
      dropZone.dispatchEvent(dropEvent);
      
      console.log('✅ Used drop zone simulation');
    } else {
      // Fallback: Simple file input click simulation
      console.log('🔄 Using simple file input method...');
      
      // Create a hidden file input with our files
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'file';
      hiddenInput.multiple = true;
      hiddenInput.accept = 'image/*';
      hiddenInput.style.display = 'none';
      
      // Add to DOM temporarily
      document.body.appendChild(hiddenInput);
      
      // Set files using DataTransfer
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      hiddenInput.files = dataTransfer.files;
      
      // Trigger change on our hidden input
      hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Copy the change to Etsy's input
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', { value: hiddenInput });
      etsyFileInput.dispatchEvent(changeEvent);
      
      // Clean up
      document.body.removeChild(hiddenInput);
      
      console.log('✅ Used fallback input method');
    }
    
    // Trigger change event to notify Etsy's upload system
    const changeEvent = new Event('change', { bubbles: true });
    etsyFileInput.dispatchEvent(changeEvent);
    
    // Also trigger input event (some systems listen to this)
    const inputEvent = new Event('input', { bubbles: true });
    etsyFileInput.dispatchEvent(inputEvent);
    
    // Additional events that might be needed
    const focusEvent = new Event('focus', { bubbles: true });
    etsyFileInput.dispatchEvent(focusEvent);
    
    const blurEvent = new Event('blur', { bubbles: true });
    etsyFileInput.dispatchEvent(blurEvent);
    
    console.log(`✅ Successfully uploaded ${files.length} images to Etsy interface`);
    this.showNotification(`✅ Uploaded ${files.length} processed images to Etsy! You can now publish manually.`, 'success');
    
    // Hide the processed photos section since upload is complete
    const processedDiv = document.getElementById('pebdeq-processed-photos-etsy');
    if (processedDiv) {
      processedDiv.style.display = 'none';
    }
  }

  setupAdvancedShopifyListeners() {
    console.log('🔧 Setting up advanced Shopify listeners...');
    
    // Modal trigger button listener
    const triggerButton = document.getElementById('pebdeq-shopify-trigger');
    if (triggerButton) {
      triggerButton.addEventListener('click', () => {
        const overlay = document.getElementById('pebdeq-shopify-modal-overlay');
        if (overlay) {
          overlay.style.display = 'flex';
          console.log('📱 PEBDEQ modal opened');
          
          // Force refresh processed images when modal opens
          this.refreshProcessedImagesDisplay('shopify');
          
          // Update status to show modal is open
          this.updateProcessingStatus('Modal opened - ready for processing!', 'info');
          
          // Start real-time monitoring for processed images
          this.startRealTimeMonitoring('shopify');
        }
      });
    }
    
    // Modal close button listener
    const closeButton = document.getElementById('pebdeq-modal-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        const overlay = document.getElementById('pebdeq-shopify-modal-overlay');
        if (overlay) {
          overlay.style.display = 'none';
          console.log('📱 PEBDEQ modal closed');
          
          // Stop real-time monitoring when modal closes
          this.stopRealTimeMonitoring();
        }
      });
    }
    
    // Modal overlay click to close
    const overlay = document.getElementById('pebdeq-shopify-modal-overlay');
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.style.display = 'none';
          console.log('📱 PEBDEQ modal closed via overlay click');
          
          // Stop real-time monitoring when modal closes
          this.stopRealTimeMonitoring();
        }
      });
    }
    
    // File input listener
    const fileInput = document.getElementById('pebdeq-file-input-shopify');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => this.handleShopifyFileSelection(e));
    }
    
    // Send to desktop button
    const sendButton = document.getElementById('pebdeq-send-to-desktop-shopify');
    if (sendButton) {
      sendButton.addEventListener('click', () => this.sendShopifyFilesToDesktop());
    }
    
    // Upload to Shopify button
    const uploadButton = document.getElementById('pebdeq-upload-to-shopify');
    if (uploadButton) {
      uploadButton.addEventListener('click', () => this.uploadProcessedToPlatform('shopify'));
    }
    
    // Bulk operation buttons
    const bulkCreateBtn = document.getElementById('pebdeq-bulk-create-products');
    if (bulkCreateBtn) {
      bulkCreateBtn.addEventListener('click', () => this.handleBulkCreateProducts());
    }
    
    const bulkUpdateBtn = document.getElementById('pebdeq-bulk-update-media');
    if (bulkUpdateBtn) {
      bulkUpdateBtn.addEventListener('click', () => this.handleBulkUpdateMedia());
    }
    
    const exportBtn = document.getElementById('pebdeq-export-processed');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.handleExportProcessed());
    }
    
    // Setup drag and drop for the drop zone
    this.setupShopifyDragAndDrop();
    
    // Initialize file storage
    this.selectedFiles = this.selectedFiles || {};
    this.selectedFiles['shopify'] = [];
  }
  
  setupShopifyDragAndDrop() {
    const dropZone = document.querySelector('#pebdeq-shopify-section .Polaris-DropZone');
    if (!dropZone) return;
    
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#004c3f';
      dropZone.style.backgroundColor = '#f6f9f8';
    });
    
    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#008060';
      dropZone.style.backgroundColor = '';
    });
    
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#008060';
      dropZone.style.backgroundColor = '';
      
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      if (files.length > 0) {
        this.handleShopifyDroppedFiles(files);
      }
    });
  }
  
  handleShopifyFileSelection(event) {
    const files = Array.from(event.target.files);
    this.handleShopifyFiles(files);
  }
  
  handleShopifyDroppedFiles(files) {
    this.handleShopifyFiles(files);
  }
  
  handleShopifyFiles(files) {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    const maxFiles = this.availableSlots || 20; // Shopify allows many images
    
    if (validFiles.length > maxFiles) {
      this.showNotification(`⚠️ Maximum ${maxFiles} files allowed. Selected first ${maxFiles} files.`, 'warning');
      validFiles.splice(maxFiles);
    }
    
    // Store files
    this.selectedFiles['shopify'] = validFiles;
    
    // Update UI
    this.updateShopifyFileDisplay();
    this.updateShopifyButtons();
  }
  
  updateShopifyFileDisplay() {
    const files = this.selectedFiles['shopify'];
    const selectedSection = document.getElementById('pebdeq-selected-photos-shopify');
    const fileList = document.getElementById('pebdeq-file-list-shopify');
    
    if (files.length === 0) {
      selectedSection.style.display = 'none';
      return;
    }
    
    selectedSection.style.display = 'block';
    
    fileList.innerHTML = files.map((file, index) => `
      <div class="pebdeq-file-item">
        <span class="file-name">📷 ${file.name}</span>
        <span class="file-size">${(file.size / 1024 / 1024).toFixed(1)}MB</span>
        <button class="remove-btn" onclick="window.pebdeqIntegration.removeShopifyFile(${index})">✕</button>
      </div>
    `).join('');
  }
  
  removeShopifyFile(index) {
    this.selectedFiles['shopify'].splice(index, 1);
    this.updateShopifyFileDisplay();
    this.updateShopifyButtons();
  }
  
  updateShopifyButtons() {
    const sendButton = document.getElementById('pebdeq-send-to-desktop-shopify');
    const hasFiles = this.selectedFiles['shopify'] && this.selectedFiles['shopify'].length > 0;
    
    if (sendButton) {
      sendButton.disabled = !hasFiles;
    }
  }
  
  async sendShopifyFilesToDesktop() {
    const files = this.selectedFiles['shopify'];
    if (!files || files.length === 0) {
      this.showNotification('⚠️ No files selected', 'warning');
      return;
    }
    
    const sendButton = document.getElementById('pebdeq-send-to-desktop-shopify');
    const originalText = sendButton.textContent;
    sendButton.innerHTML = '<span class="Polaris-Button__Content"><span class="Polaris-Button__Text">⏳ Sending...</span></span>';
    sendButton.disabled = true;
    
    try {
      // Convert files to base64
      const fileData = await Promise.all(files.map(async (file) => {
        const base64 = await this.fileToBase64(file);
        return {
          name: file.name,
          size: file.size,
          type: file.type,
          data: base64,
          targetPlatform: 'shopify',
          storeInfo: this.currentShopifyStore
        };
      }));
      
      // Send to desktop via background script
      const response = await chrome.runtime.sendMessage({
        action: 'sendPhotosToDesktop',
        files: fileData,
        platform: 'shopify'
      });
      
      if (response.success) {
        this.showNotification(`✅ ${files.length} photos sent to PEBDEQ Desktop for processing!`, 'success');
        
        // Clear selection
        this.selectedFiles['shopify'] = [];
        this.updateShopifyFileDisplay();
        this.updateShopifyButtons();
        
        // Add to polling
        console.log('📍 Content script: Adding shopify to active platforms...');
        chrome.runtime.sendMessage({
          action: 'addActivePlatform',
          platform: 'shopify'
        }, (response) => {
          console.log('📍 Content script: addActivePlatform response:', response);
        });
        
        // Update processing status
        this.updateProcessingStatus(`🔄 Processing ${files.length} images...`, 'warning');
        
      } else {
        throw new Error(response.error || 'Failed to send photos');
      }
      
    } catch (error) {
      console.error('❌ Failed to send photos to desktop:', error);
      this.showNotification(`❌ Failed to send photos: ${error.message}`, 'error');
      this.updateProcessingStatus(`❌ Send failed: ${error.message}`, 'error');
    } finally {
      sendButton.innerHTML = originalText;
      sendButton.disabled = false;
    }
  }
  
  async handleBulkCreateProducts() {
    const images = this.processedImages?.['shopify'];
    if (!images || images.length === 0) {
      this.showNotification('❌ No processed images available', 'error');
      return;
    }
    
    this.showNotification('🔄 Creating products from processed images...', 'info');
    
    // This would integrate with Shopify Admin API
    // For now, show placeholder
    setTimeout(() => {
      this.showNotification(`🚧 Bulk product creation coming soon! ${images.length} images ready.`, 'info');
    }, 1000);
  }
  
  async handleBulkUpdateMedia() {
    const images = this.processedImages?.['shopify'];
    if (!images || images.length === 0) {
      this.showNotification('❌ No processed images available', 'error');
      return;
    }
    
    this.showNotification('🔄 Updating product media...', 'info');
    
    // This would update existing products with new media
    setTimeout(() => {
      this.showNotification(`🚧 Bulk media update coming soon! ${images.length} images ready.`, 'info');
    }, 1000);
  }
  
  async handleExportProcessed() {
    const images = this.processedImages?.['shopify'];
    if (!images || images.length === 0) {
      this.showNotification('❌ No processed images available', 'error');
      return;
    }
    
    // Export processed images as ZIP or individual downloads
    this.showNotification(`💾 Exporting ${images.length} processed images...`, 'info');
    
    // Implementation would download the images
    setTimeout(() => {
      this.showNotification(`🚧 Export feature coming soon! ${images.length} images ready.`, 'info');
    }, 1000);
  }

  async uploadToShopify(images) {
    console.log(`📤 Starting Shopify upload for ${images.length} images`);
    
    // Find Shopify's file input elements  
    const fileInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
    let shopifyFileInput = null;
    
    // Look for Shopify's specific file input (exclude our own)
    for (const input of fileInputs) {
      if (!input.closest('#pebdeq-shopify-section') && // Exclude our own inputs
          (input.multiple || 
           input.closest('[data-testid*="media"]') || 
           input.closest('[class*="media"]') ||
           input.closest('[class*="upload"]') ||
           input.closest('.Polaris-DropZone') ||
           input.closest('[data-testid="ProductMediaManagerCard"]'))) {
        shopifyFileInput = input;
        break;
      }
    }
    
    if (!shopifyFileInput) {
      // Fallback: look for any file input that accepts images (excluding ours)
      for (const input of fileInputs) {
        if (!input.closest('#pebdeq-shopify-section')) {
          shopifyFileInput = input;
          break;
        }
      }
    }
    
    if (!shopifyFileInput) {
      throw new Error('Could not find Shopify file upload input. Make sure you are on a product page with media upload capability.');
    }
    
    console.log('🎯 Found Shopify file input:', shopifyFileInput);
    
    // Convert base64 images to File objects
    const files = [];
    for (const image of images) {
      try {
        // Convert base64 to blob
        const response = await fetch(image.processedData);
        const blob = await response.blob();
        
        // Create file with original name
        const file = new File([blob], image.originalName, { 
          type: 'image/png',
          lastModified: Date.now()
        });
        
        files.push(file);
        console.log(`✅ Converted ${image.originalName} to file object`);
      } catch (error) {
        console.error(`❌ Failed to convert ${image.originalName}:`, error);
      }
    }
    
    if (files.length === 0) {
      throw new Error('Failed to convert any images to file objects');
    }
    
    // Try Shopify's drop zone first, then fallback to file input
    const dropZone = this.findShopifyDropZone();
    
    if (dropZone) {
      console.log('🎯 Found Shopify drop zone, using drag&drop simulation');
      
      // Simulate drag and drop on the drop zone
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      
      // Simulate dragenter
      const dragEnterEvent = new DragEvent('dragenter', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      });
      dropZone.dispatchEvent(dragEnterEvent);
      
      // Simulate dragover
      const dragOverEvent = new DragEvent('dragover', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      });
      dropZone.dispatchEvent(dragOverEvent);
      
      // Simulate drop
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer
      });
      dropZone.dispatchEvent(dropEvent);
      
      console.log('✅ Used Shopify drop zone simulation');
    } else {
      // Fallback: Simple file input method
      console.log('🔄 Using Shopify file input method...');
      
      // Create a hidden file input with our files
      const hiddenInput = document.createElement('input');
      hiddenInput.type = 'file';
      hiddenInput.multiple = true;
      hiddenInput.accept = 'image/*';
      hiddenInput.style.display = 'none';
      
      // Add to DOM temporarily
      document.body.appendChild(hiddenInput);
      
      // Set files using DataTransfer
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      hiddenInput.files = dataTransfer.files;
      
      // Trigger change on our hidden input
      hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Copy the change to Shopify's input
      const changeEvent = new Event('change', { bubbles: true });
      Object.defineProperty(changeEvent, 'target', { value: hiddenInput });
      shopifyFileInput.dispatchEvent(changeEvent);
      
      // Clean up
      document.body.removeChild(hiddenInput);
      
      console.log('✅ Used fallback Shopify input method');
    }
    
    // Trigger additional events to notify Shopify's upload system
    const changeEvent = new Event('change', { bubbles: true });
    shopifyFileInput.dispatchEvent(changeEvent);
    
    // Also trigger input event (some systems listen to this)
    const inputEvent = new Event('input', { bubbles: true });
    shopifyFileInput.dispatchEvent(inputEvent);
    
    // Additional events that might be needed
    const focusEvent = new Event('focus', { bubbles: true });
    shopifyFileInput.dispatchEvent(focusEvent);
    
    const blurEvent = new Event('blur', { bubbles: true });
    shopifyFileInput.dispatchEvent(blurEvent);
    
    console.log(`✅ Successfully uploaded ${files.length} images to Shopify interface`);
    this.showNotification(`✅ Uploaded ${files.length} processed images to Shopify! You can now save the product.`, 'success');
    
    // Hide the processed photos section since upload is complete
    const processedDiv = document.getElementById('pebdeq-processed-photos-shopify');
    if (processedDiv) processedDiv.style.display = 'none';
  }
  


  async uploadToEbay(images) {
    console.log(`📤 Starting eBay upload for ${images.length} images`);
    
    // DISABLE DOM Observer during upload to prevent interference
    console.log('🛑 Temporarily disabling eBay DOM observer during upload');
    this.pauseEbayObserver = true;
    
    // Reset upload progress tracking for fresh start
    this.initialPhotoCount = null;
    
    // Find eBay's file input or upload area
    const uploadArea = this.findEbayUploadArea();
    const fileInput = this.findEbayFileInput();
    
    if (!uploadArea && !fileInput) {
      throw new Error('Could not find eBay upload area. Make sure you are on the item edit page.');
    }
    
    console.log('🎯 Found eBay upload area:', uploadArea?.tagName || 'not found');
    console.log('🎯 Found eBay file input:', fileInput?.tagName || 'not found');
    
    // Convert base64 images to File objects
    const files = [];
    for (const image of images) {
      try {
        // Convert base64 to blob
        const response = await fetch(image.processedData);
        const blob = await response.blob();
        
        // Create file with original name
        const file = new File([blob], image.originalName, { 
          type: 'image/png',
          lastModified: Date.now()
        });
        
        files.push(file);
        console.log(`✅ Converted ${image.originalName} to file object`);
      } catch (error) {
        console.error(`❌ Failed to convert ${image.originalName}:`, error);
      }
    }
    
    if (files.length === 0) {
      throw new Error('Failed to convert any images to file objects');
    }
    
    // Try different upload methods sequentially (ONLY ONE SUCCESS ALLOWED)
    let uploadSuccess = false;
    let successMethod = '';
    
    // Method 1: Try drag & drop simulation on upload area
    if (uploadArea && !uploadSuccess) {
      console.log('🎯 Attempting eBay drag & drop upload...');
      uploadSuccess = await this.simulateEbayDragDrop(uploadArea, files);
      if (uploadSuccess) {
        successMethod = 'Drag & Drop';
        console.log('✅ STOP: Drag & Drop successful, skipping other methods');
      }
    }
    
    // Method 2: Try file input simulation (ONLY if Method 1 failed)
    if (!uploadSuccess && fileInput) {
      console.log('🔄 Attempting eBay file input upload...');
      uploadSuccess = await this.simulateEbayFileInput(fileInput, files);
      if (uploadSuccess) {
        successMethod = 'File Input';
        console.log('✅ STOP: File Input successful, skipping other methods');
      }
    }
    
    // Method 3: Try Add button click + file selection (ONLY if Methods 1&2 failed)
    if (!uploadSuccess) {
      console.log('🔄 Attempting eBay Add button simulation...');
      uploadSuccess = await this.simulateEbayAddButton(files);
      if (uploadSuccess) {
        successMethod = 'Add Button';
        console.log('✅ STOP: Add Button successful, skipping other methods');
      }
    }
    
    // Method 4: Try programmatic upload (ONLY if all previous methods failed)
    if (!uploadSuccess) {
      console.log('🔄 Attempting eBay programmatic upload...');
      uploadSuccess = await this.simulateEbayProgrammaticUpload(files);
      if (uploadSuccess) {
        successMethod = 'Programmatic';
        console.log('✅ STOP: Programmatic upload successful');
      }
    }
    
    // RE-ENABLE DOM Observer after upload completion
    console.log('✅ Re-enabling eBay DOM observer after upload');
    this.pauseEbayObserver = false;
    
    if (uploadSuccess) {
      console.log(`🎉 Successfully uploaded ${files.length} images to eBay via ${successMethod} method`);
      this.showNotification(`✅ ${files.length} images uploaded to eBay via ${successMethod}!`, 'success');
    } else {
      console.log('⚠️ All upload methods attempted but eBay may require manual verification');
      this.showNotification(`📸 ${files.length} images ready - eBay may require manual upload confirmation`, 'info');
    }
  }
  
  findEbayUploadArea() {
    // Look for eBay's NATIVE upload/drop areas (exclude our own)
    const selectors = [
      // eBay current selectors (2024)
      '.summary__photos',
      '.image-uploader',
      '.photo-upload-container', 
      '.listing-photos',
      '.photo-gallery',
      '[data-testid*="image"]',
      '[data-testid*="photo"]',
      '[data-testid*="upload"]',
      // Generic selectors
      '.image-upload-area',
      '.photo-upload',
      '.media-upload',
      '[class*="upload"]:not([id*="pebdeq"])',
      '[class*="drop"]:not([id*="pebdeq"])',
      '.photo-dropzone',
      '.upload-dropzone',
      // Look for Add button area
      'button[class*="add"]:not([id*="pebdeq"])',
      '[role="button"][class*="photo"]:not([id*="pebdeq"])'
    ];
    
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      
      for (const element of elements) {
        // Skip our own PEBDEQ elements
        if (element.id && element.id.includes('pebdeq')) continue;
        if (element.closest('#pebdeq-ebay-section')) continue;
        if (element.closest('[id*="pebdeq"]')) continue;
        
        if (this.isValidUploadArea(element)) {
          console.log(`🔍 Found eBay native upload area: ${selector}`, element.className || element.id);
          return element;
        }
      }
    }
    
    // Final fallback: Find the summary photos section (but not our injection)
    const summaryPhotos = document.querySelector('.summary__photos:not([id*="pebdeq"])');
    if (summaryPhotos && !summaryPhotos.closest('#pebdeq-ebay-section')) {
      console.log('🔍 Using eBay summary photos section as fallback');
      return summaryPhotos;
    }
    
    console.log('❌ No suitable eBay native upload area found');
    return null;
  }
  
  isValidUploadArea(element) {
    // Check if element is likely an upload area
    const elementText = element.textContent?.toLowerCase() || '';
    const elementClass = element.className?.toLowerCase() || '';
    
    return elementText.includes('add') || 
           elementText.includes('upload') || 
           elementText.includes('photo') ||
           elementClass.includes('upload') ||
           elementClass.includes('photo') ||
           elementClass.includes('image') ||
           element.querySelector('input[type="file"]') !== null;
  }
  
  findEbayFileInput() {
    // Look for eBay's NATIVE file input elements (exclude our own)
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    console.log(`🔍 Found ${fileInputs.length} file inputs on page`);
    
    // Filter out our own PEBDEQ inputs
    const nativeInputs = Array.from(fileInputs).filter(input => {
      return !input.id.includes('pebdeq') && 
             !input.closest('#pebdeq-ebay-section') &&
             !input.closest('[id*="pebdeq"]');
    });
    
    console.log(`🎯 Found ${nativeInputs.length} native eBay file inputs`);
    
    // Priority 1: File inputs with image accept and inside eBay photo areas
    for (const input of nativeInputs) {
      if (input.accept && input.accept.includes('image')) {
        const isInPhotoArea = input.closest('.summary__photos') ||
                             input.closest('[class*="photo"]') ||
                             input.closest('[class*="image"]') ||
                             input.closest('[class*="upload"]') ||
                             input.closest('[data-testid*="photo"]');
        
        if (isInPhotoArea) {
          console.log('🎯 Found priority eBay native file input:', input.id || input.className);
          return input;
        }
      }
    }
    
    // Priority 2: Any native file input that accepts images
    for (const input of nativeInputs) {
      if (input.accept && (input.accept.includes('image') || input.accept.includes('*'))) {
        console.log('🔍 Found eBay native file input (accepts images):', input.id || input.className);
        return input;
      }
    }
    
    // Priority 3: Any visible native file input
    for (const input of nativeInputs) {
      const style = window.getComputedStyle(input);
      if (style.display !== 'none' && style.visibility !== 'hidden') {
        console.log('🔍 Found visible eBay native file input (fallback):', input.id || input.className);
        return input;
      }
    }
    
    console.log('❌ No suitable eBay native file input found');
    return null;
  }
  
  async simulateEbayDragDrop(uploadArea, files) {
    try {
      console.log(`🎯 Simulating drag & drop for ${files.length} files on:`, uploadArea.className);
      
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      
      // Focus the upload area first
      uploadArea.focus();
      
      // Simulate complete drag events sequence with proper timing
      const dragEvents = [
        { type: 'dragenter', delay: 50 },
        { type: 'dragover', delay: 100 },
        { type: 'dragover', delay: 100 }, // Multiple dragover events
        { type: 'drop', delay: 150 }
      ];
      
      for (const { type, delay } of dragEvents) {
        const event = new DragEvent(type, {
          bubbles: true,
          cancelable: true,
          dataTransfer: dataTransfer,
          clientX: 100,
          clientY: 100
        });
        
        console.log(`📤 Dispatching ${type} event`);
        uploadArea.dispatchEvent(event);
        
        // Prevent default behavior for dragover
        if (type === 'dragover') {
          event.preventDefault();
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      // Also try dispatching on child elements that might handle the event
      const addButton = uploadArea.querySelector('button, [role="button"], .add-button, [class*="add"]');
      if (addButton) {
        console.log('🎯 Also trying drag & drop on add button');
        const dropEvent = new DragEvent('drop', {
          bubbles: true,
          cancelable: true,
          dataTransfer: dataTransfer
        });
        addButton.dispatchEvent(dropEvent);
      }
      
      console.log('✅ eBay drag & drop simulation completed');
      
      // For drag & drop, we can't easily verify files were set, so check progress
      // But with shorter timeout since it's more reliable than file input
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const progressDetected = this.checkUploadProgress();
      if (progressDetected) {
        console.log('🎉 Drag & drop progress detected');
        return true;
      } else {
        console.log('⚠️ No immediate progress from drag & drop');
        // For drag & drop, be more conservative - let other methods try
        return false;
      }
    } catch (error) {
      console.error('❌ eBay drag & drop failed:', error);
      return false;
    }
  }
  
  async simulateEbayFileInput(fileInput, files) {
    try {
      console.log(`🎯 Simulating file input for ${files.length} files on:`, fileInput);
      
      // Create DataTransfer with files
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      
      // Focus the input first
      fileInput.focus();
      
      // Try different methods to set files on input
      let filesSetSuccessfully = false;
      try {
        // Method 1: Try direct assignment (works in some browsers)
        fileInput.files = dataTransfer.files;
        console.log('✅ Direct files assignment successful');
        filesSetSuccessfully = true;
      } catch (directError) {
        console.log('⚠️ Direct assignment failed, trying alternative methods');
        
        try {
          // Method 2: Try Object.defineProperty with configurable
          Object.defineProperty(fileInput, 'files', {
            value: dataTransfer.files,
            writable: false,
            configurable: true
          });
          console.log('✅ defineProperty assignment successful');
          filesSetSuccessfully = true;
        } catch (defineError) {
          console.log('⚠️ defineProperty failed, using event simulation only');
          
          // Method 3: Create custom event with files in detail
          const customEvent = new CustomEvent('files-set', {
            detail: { files: dataTransfer.files },
            bubbles: true
          });
          fileInput.dispatchEvent(customEvent);
          // Can't guarantee success for this method
        }
      }
      
      // Trigger multiple events that eBay might listen to
      const events = [
        new Event('focus', { bubbles: true }),
        new Event('change', { bubbles: true }),
        new Event('input', { bubbles: true }),
        new Event('blur', { bubbles: true })
      ];
      
      for (const event of events) {
        console.log(`📤 Dispatching ${event.type} event`);
        fileInput.dispatchEvent(event);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      // Also try clicking the input or its label
      const label = fileInput.closest('label') || document.querySelector(`label[for="${fileInput.id}"]`);
      if (label) {
        console.log('🎯 Also clicking associated label');
        label.click();
      }
      
      // Try triggering form events on parent form
      const form = fileInput.closest('form');
      if (form) {
        console.log('🎯 Triggering form events');
        const formChangeEvent = new Event('change', { bubbles: true });
        form.dispatchEvent(formChangeEvent);
      }
      
      console.log('✅ eBay file input simulation completed');
      
      // If files were set successfully, assume upload started (eBay processes in background)
      if (filesSetSuccessfully) {
        console.log('🎉 Files set successfully - assuming eBay upload started');
        // Still wait a bit to let eBay process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Do a quick check but don't rely on strict detection
        const hasProgress = this.checkUploadProgress();
        console.log(`📊 Quick progress check: ${hasProgress ? 'detected' : 'not detected'}`);
        
        // Return true since files were set successfully (eBay handles async)
        return true;
      } else {
        // Wait longer for eBay to process the file input
        await new Promise(resolve => setTimeout(resolve, 2000));
        return this.checkUploadProgress();
      }
    } catch (error) {
      console.error('❌ eBay file input failed:', error);
      return false;
    }
  }
  
  async simulateEbayAddButton(files) {
    try {
      console.log(`🎯 Looking for eBay Add button to simulate click...`);
      
      // Look for Add photo buttons with various selectors
      const addButtonSelectors = [
        'button[class*="add"]:not([id*="pebdeq"])',
        '[role="button"][class*="add"]:not([id*="pebdeq"])',
        'button:not([id*="pebdeq"])',
        '[class*="add-photo"]:not([id*="pebdeq"])',
        '[class*="add-image"]:not([id*="pebdeq"])',
        '[data-testid*="add"]:not([id*="pebdeq"])',
        '.photo-add-button:not([id*="pebdeq"])',
        '.image-add-btn:not([id*="pebdeq"])'
      ];
      
      let addButton = null;
      
      for (const selector of addButtonSelectors) {
        const buttons = document.querySelectorAll(selector);
        for (const button of buttons) {
          if (button && !button.closest('#pebdeq-ebay-section') && !button.id?.includes('pebdeq')) {
            // Check if button text suggests it's for adding photos
            const buttonText = button.textContent?.toLowerCase() || '';
            const buttonTitle = button.title?.toLowerCase() || '';
            const buttonAriaLabel = button.getAttribute('aria-label')?.toLowerCase() || '';
            
            if (buttonText.includes('add') || buttonText.includes('upload') || buttonText.includes('+') ||
                buttonTitle.includes('add') || buttonTitle.includes('upload') || 
                buttonAriaLabel.includes('add') || buttonAriaLabel.includes('upload') ||
                buttonText.includes('photo') || buttonText.includes('image')) {
              addButton = button;
              console.log(`🎯 Found Add button: ${selector}`, buttonText || buttonTitle || buttonAriaLabel);
              break;
            }
          }
        }
        if (addButton) break;
      }
      
      if (!addButton) {
        // Look for plus icons or generic add buttons in photo sections
        const photoSection = document.querySelector('.summary__photos:not([id*="pebdeq"])');
        if (photoSection) {
          addButton = photoSection.querySelector('button:not([id*="pebdeq"]), [role="button"]:not([id*="pebdeq"])');
          console.log('🔍 Found button in photo section:', addButton?.textContent?.slice(0, 30));
        }
      }
      
      if (addButton) {
        console.log('🖱️ Clicking eBay Add button...');
        
        // Simulate user interaction
        addButton.focus();
        addButton.click();
        
        // Wait for any file dialog or upload interface to appear
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Try to find the file input that might have appeared
        const newFileInput = this.findEbayFileInput();
        if (newFileInput) {
          console.log('🎯 Found file input after button click, attempting upload...');
          // Use a simpler file assignment to avoid recursion
          try {
            const dataTransfer = new DataTransfer();
            files.forEach(file => dataTransfer.items.add(file));
            newFileInput.files = dataTransfer.files;
            
            console.log('✅ Add button file assignment successful');
            
            const changeEvent = new Event('change', { bubbles: true });
            newFileInput.dispatchEvent(changeEvent);
            
            // Assume success if file assignment worked
            console.log('🎉 Add button method - files set successfully');
            await new Promise(resolve => setTimeout(resolve, 1000));
            return true;
          } catch (error) {
            console.error('❌ File input assignment after button click failed:', error);
            return false;
          }
        } else {
          console.log('⚠️ No file input appeared after button click');
        }
      } else {
        console.log('❌ No Add button found');
      }
      
      return false;
    } catch (error) {
      console.error('❌ eBay Add button simulation failed:', error);
      return false;
    }
  }
  
  async simulateEbayProgrammaticUpload(files) {
    try {
      // This would require reverse engineering eBay's upload API
      // For now, we'll focus on the DOM-based approaches above
      console.log('🔄 eBay programmatic upload not yet implemented');
      return false;
    } catch (error) {
      console.error('❌ eBay programmatic upload failed:', error);
      return false;
    }
  }
  
  checkUploadProgress() {
    console.log('🔍 Checking eBay upload progress (STRICT MODE)...');
    
    // STORE initial state for comparison
    if (!this.initialPhotoCount) {
      const galleries = document.querySelectorAll('.summary__photos:not([id*="pebdeq"]), [class*="photo-gallery"]:not([id*="pebdeq"])');
      this.initialPhotoCount = 0;
      galleries.forEach(gallery => {
        if (!gallery.closest('#pebdeq-ebay-section')) {
          this.initialPhotoCount += gallery.querySelectorAll('img').length;
        }
      });
      console.log(`📊 Initial photo count: ${this.initialPhotoCount}`);
    }
    
    // Check for SPECIFIC upload indicators (must be active/visible)
    const activeProgressIndicators = [
      '[class*="uploading"]:not([id*="pebdeq"])',
      '[class*="upload-progress"]:not([id*="pebdeq"])',
      '[data-testid*="uploading"]:not([id*="pebdeq"])',
      '.progress-bar:not([id*="pebdeq"])',
      '[role="progressbar"]:not([id*="pebdeq"])'
    ];
    
    for (const selector of activeProgressIndicators) {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (!element.closest('#pebdeq-ebay-section')) {
          const isVisible = element.offsetParent !== null;
          if (isVisible) {
            console.log(`✅ Found ACTIVE upload indicator: ${selector}`, element.className);
            return true;
          }
        }
      }
    }
    
    // Check for NEW IMAGES in eBay gallery (compare with initial count)
    const galleries = document.querySelectorAll('.summary__photos:not([id*="pebdeq"]), [class*="photo-gallery"]:not([id*="pebdeq"])');
    let currentPhotoCount = 0;
    let foundNewImages = false;
    
    for (const gallery of galleries) {
      if (gallery.closest('#pebdeq-ebay-section')) continue; // Skip our section
      
      const images = gallery.querySelectorAll('img');
      currentPhotoCount += images.length;
      
      // Also check for images with recent src changes or temp URLs
      const recentImages = Array.from(images).filter(img => {
        const src = img.src || '';
        return src.includes('blob:') || 
               src.includes('data:') ||
               src.includes('/temp/') ||
               src.includes('upload') ||
               // Check for eBay's dynamic image URLs
               (src.includes('ebayimg.com') && img.getAttribute('data-testid'));
      });
      
      if (recentImages.length > 0) {
        console.log(`📸 Found ${recentImages.length} recently uploaded/temp images`);
        foundNewImages = true;
      }
    }
    
    console.log(`📊 Photo count: ${this.initialPhotoCount} → ${currentPhotoCount}`);
    
    if (currentPhotoCount > this.initialPhotoCount || foundNewImages) {
      const difference = currentPhotoCount - this.initialPhotoCount;
      console.log(`✅ NEW IMAGES DETECTED: +${difference} count increase OR recent uploads found`);
      return true;
    }
    
    // Check for ACTIVE file inputs with files (stricter)
    const forms = document.querySelectorAll('form:not([id*="pebdeq"])');
    for (const form of forms) {
      const fileInputs = form.querySelectorAll('input[type="file"]:not([id*="pebdeq"])');
      for (const input of fileInputs) {
        if (input.files && input.files.length > 0) {
          // Check if this input is in an upload context
          const isInUploadArea = input.closest('.summary__photos') || 
                                input.closest('[class*="photo"]') ||
                                input.closest('[class*="upload"]');
          if (isInUploadArea) {
            console.log(`✅ Found ACTIVE file input with ${input.files.length} files in upload area`);
            return true;
          }
        }
      }
    }
    
    console.log('⚠️ No STRICT upload progress detected');
    return false;
  }

  createFileList(files) {
    // Create a DataTransfer object to simulate file selection
    const dataTransfer = new DataTransfer();
    
    files.forEach(file => {
      dataTransfer.items.add(file);
    });
    
    return dataTransfer.files;
  }

  createDataTransfer(files) {
    // Create a DataTransfer object for drag and drop simulation
    const dataTransfer = new DataTransfer();
    
    files.forEach(file => {
      dataTransfer.items.add(file);
    });
    
    return dataTransfer;
  }

  findEtsyDropZone() {
    // Look for Etsy's drop zone with various selectors
    const selectors = [
      '[data-test-id*="drop"]',
      '[class*="drop-zone"]',
      '[class*="dropzone"]',
      '[class*="upload-area"]',
      '[class*="media-grid"]',
      '.le-media-grid',
      '[class*="thumbnail-upload"]',
      '[class*="photo-upload"]'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        console.log(`🎯 Found potential drop zone with selector: ${selector}`);
        return element;
      }
    }
    
    // Fallback: look for any element that handles drop events
    const allElements = document.querySelectorAll('*');
    for (const element of allElements) {
      if (element.ondrop || 
          element.getAttribute('ondrop') ||
          element.classList.toString().includes('drop') ||
          element.classList.toString().includes('upload')) {
        console.log('🎯 Found drop zone via event/class detection');
        return element;
      }
    }
    
    console.log('❌ No drop zone found');
    return null;
  }

  findShopifyDropZone() {
    // Look for Shopify's drop zone with Polaris-specific selectors
    const selectors = [
      // Polaris DropZone components
      '.Polaris-DropZone',
      '[data-testid="ProductMediaManagerCard"] .Polaris-DropZone',
      '[data-testid="media-upload"] .Polaris-DropZone',
      
      // General drop zones
      '[data-testid*="drop"]',
      '[class*="drop-zone"]',
      '[class*="dropzone"]', 
      '[class*="upload-area"]',
      '[class*="media-manager"]',
      '[class*="media-upload"]',
      
      // Shopify specific
      '[data-testid="ProductMediaManagerCard"]',
      '[data-testid="MediaManager"]',
      '.Polaris-Card:has([aria-label*="Media"])',
      '.Polaris-Card:has([data-testid*="media"])'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && !element.closest('#pebdeq-shopify-section')) { // Exclude our own elements
        console.log(`🛍️ Found Shopify drop zone with selector: ${selector}`);
        return element;
      }
    }
    
    // Fallback: look for any element that handles drop events (excluding our own)
    const allElements = document.querySelectorAll('*');
    for (const element of allElements) {
      if (!element.closest('#pebdeq-shopify-section') && // Exclude our elements
          (element.ondrop || 
           element.getAttribute('ondrop') ||
           element.classList.toString().includes('drop') ||
           element.classList.toString().includes('upload') ||
           element.classList.toString().includes('Polaris-DropZone'))) {
        console.log('🛍️ Found Shopify drop zone via event/class detection');
        return element;
      }
    }
    
    console.log('❌ No Shopify drop zone found');
    return null;
  }
  
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }

  // ============ NEW PLATFORM INJECTION METHODS ============
  
  injectAmazonUI() {
    console.log('📦 Setting up Amazon integration...');
    this.showNotification('🚧 Amazon integration coming soon! Complex platform requires additional development.', 'info');
  }
  
  injectAliExpressUI() {
    console.log('🛒 Setting up AliExpress integration...');
    this.showNotification('🚧 AliExpress integration coming soon!', 'info');
  }
  
  injectWalmartUI() {
    console.log('🏪 Setting up Walmart integration...');
    this.showNotification('🚧 Walmart integration coming soon!', 'info');
  }

  forceShopifyUIVisibility() {
    console.log('🔧 Force checking Shopify modal visibility...');
    
    const modal = document.getElementById('pebdeq-shopify-modal');
    const overlay = document.getElementById('pebdeq-shopify-modal-overlay');
    const trigger = document.getElementById('pebdeq-shopify-trigger');
    
    if (!modal || !overlay || !trigger) {
      console.log('❌ PEBDEQ modal components not found for visibility check');
      return;
    }

    // Check trigger button visibility
    const triggerRect = trigger.getBoundingClientRect();
    const triggerStyles = window.getComputedStyle(trigger);
    
    console.log('📏 PEBDEQ Trigger button status:', {
      width: triggerRect.width,
      height: triggerRect.height,
      display: triggerStyles.display,
      visibility: triggerStyles.visibility,
      position: triggerStyles.position
    });

    // Force trigger button visibility if hidden
    if (triggerRect.width === 0 || triggerRect.height === 0 || 
        triggerStyles.display === 'none' || 
        triggerStyles.visibility === 'hidden') {
      
      console.log('🚨 PEBDEQ Trigger button is hidden! Forcing visibility...');
      
      // Apply strong visibility CSS to trigger
      trigger.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        background: #008060 !important;
        color: white !important;
        border: none !important;
        border-radius: 20px !important;
        padding: 10px 15px !important;
        font-weight: bold !important;
        cursor: pointer !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
        z-index: 999998 !important;
        font-size: 14px !important;
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
      `;
      
      console.log('✅ PEBDEQ Trigger button visibility forced!');
      this.showNotification('🛍️ PEBDEQ modal ready! Click button in bottom-right corner.', 'success');
      
    } else {
      console.log('✅ PEBDEQ Trigger button is visible');
      this.showNotification('🛍️ PEBDEQ modal ready! Click button in bottom-right corner.', 'success');
    }
  }
}


// IMMEDIATE DEBUG LOG (should appear on ALL pages)
console.log('🚨 PEBDEQ Content Script LOADED on:', window.location.href);
console.log('🚨 Hostname:', window.location.hostname);

// Initialize integration
const pebdeqIntegration = new PEBDEQEtsyIntegration();

// Make it globally available for onclick handlers
window.pebdeqIntegration = pebdeqIntegration;

// IMMEDIATE DEBUG LOG 2
console.log('🚨 PEBDEQ Integration class created successfully');