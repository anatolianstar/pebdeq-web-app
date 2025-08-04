// PEBDEQ Etsy Integration - Background Script
console.log('🔧 PEBDEQ Background script loaded');

class PEBDEQBackground {
  constructor() {
    this.activePlatforms = new Set(); // Track platforms that need polling - INITIALIZE FIRST
    this.setupMessageHandlers();
    this.connectToPEBDEQ();
    this.startProcessedImagesPolling();
    // Note: Auto-refresh disabled - use manual refresh button in popup
    // this.handleExtensionReload();
  }

  async handleExtensionReload() {
    // Auto-refresh all supported platform tabs when extension reloads
    try {
      const tabs = await chrome.tabs.query({
        url: [
          "https://*.etsy.com/*",
          "https://*.shopify.com/*", 
          "https://*.myshopify.com/*",
          "https://*.ebay.com/*",
          "https://*.pebdeq.com/*",
          "https://*.amazon.com/*",
          "https://*.aliexpress.com/*",
          "https://*.walmart.com/*"
        ]
      });

      console.log(`🔄 Extension reloaded, found ${tabs.length} platform tabs`);
      
      for (const tab of tabs) {
        try {
          await chrome.tabs.reload(tab.id);
          console.log(`✅ Auto-refreshed: ${tab.title}`);
        } catch (error) {
          console.log(`⚠️ Could not refresh tab ${tab.id}:`, error.message);
        }
      }
      
      if (tabs.length > 0) {
        console.log(`🎉 ${tabs.length} platform tab(s) refreshed automatically`);
      }
      
    } catch (error) {
      console.log('⚠️ Auto-refresh failed:', error.message);
    }
  }
  
  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log('📨 Background received message:', request.action);
      
      switch (request.action) {
        case 'getPEBDEQPhotos':
          this.getPEBDEQPhotos().then(sendResponse);
          return true; // Async response
          
        case 'getPEBDEQPhoto':
          this.getPEBDEQPhoto(request.photoId).then(sendResponse);
          return true; // Async response
          
        case 'uploadToEtsy':
          this.uploadToEtsy(request.photo, request.listingId).then(sendResponse);
          return true; // Async response
          
        case 'sendPhotosToDesktop':
          this.sendPhotosToDesktop(request.files, request.platform).then(sendResponse);
          return true; // Async response
          
        case 'checkProcessedImages':
          this.checkProcessedImages(request.platform).then(sendResponse);
          return true; // Async response
          
        case 'refreshPlatformTabs':
          this.refreshPlatformTabs().then(sendResponse);
          return true; // Async response
          
        case 'checkDesktopConnection':
          this.checkDesktopConnection().then(sendResponse);
          return true; // Async response
          
        case 'pageCleanup':
          this.handlePageCleanup(request).then(sendResponse);
          return true; // Async response
          
        case 'addActivePlatform':
          this.addActivePlatform(request.platform);
          sendResponse({ success: true });
          return false; // Sync response
          
        case 'removeActivePlatform':
          this.removeActivePlatform(request.platform);
          sendResponse({ success: true });
          return false; // Sync response
          
        case 'debugStatus':
          const debugInfo = {
            activePlatforms: this.activePlatforms ? Array.from(this.activePlatforms) : [],
            pollingInterval: !!this.pollingInterval,
            isConnected: this.isPEBDEQConnected
          };
          console.log('🐛 Debug status:', debugInfo);
          sendResponse(debugInfo);
          return false; // Sync response
      }
    });
  }

  startProcessedImagesPolling() {
    console.log('🔄 Starting automatic processed images polling...');
    console.log(`📊 Initial activePlatforms state: ${this.activePlatforms ? `Set(${this.activePlatforms.size})` : 'undefined'}`);
    
    // Poll every 5 seconds for processed images
    this.pollingInterval = setInterval(async () => {
      try {
        const platformList = this.activePlatforms ? Array.from(this.activePlatforms) : [];
        console.log(`🔄 Polling tick - Active platforms (${platformList.length}): [${platformList.join(', ')}]`);
        
        // Only poll if we have active platforms
        if (this.activePlatforms && this.activePlatforms.size > 0) {
          console.log(`📋 Starting polling for ${this.activePlatforms.size} active platforms...`);
          for (const platform of this.activePlatforms) {
            console.log(`🔍 Polling platform: ${platform}`);
            await this.pollProcessedImagesForPlatform(platform);
          }
          console.log(`✅ Completed polling cycle for ${this.activePlatforms.size} platforms`);
        } else {
          console.log('ℹ️ No active platforms to poll - waiting for files to be sent...');
        }
      } catch (error) {
        console.error('❌ Error in processed images polling:', error);
      }
    }, 5000); // 5 seconds
  }

  async pollProcessedImagesForPlatform(platform) {
    try {
      console.log(`🔍 Polling for processed images on ${platform}...`);
      const result = await this.checkProcessedImages(platform);
      
      console.log(`📊 Poll result for ${platform}:`, result);
      
      if (result.success && result.images && result.images.length > 0) {
        console.log(`📥 Auto-detected ${result.images.length} processed images for ${platform}`);
        console.log('📷 Images:', result.images);
        
        // Notify content script about new processed images
        // Find tabs that match the platform (e.g., etsy.com for etsy platform)
        let platformUrl = '';
        if (platform === 'etsy') platformUrl = '*://*.etsy.com/*';
        else if (platform === 'shopify') platformUrl = '*://*.shopify.com/*';
        else if (platform === 'ebay') platformUrl = '*://*.ebay.com/*';
        else if (platform === 'amazon') platformUrl = '*://*.amazon.com/*';
        else if (platform === 'aliexpress') platformUrl = '*://*.aliexpress.com/*';
        else if (platform === 'walmart') platformUrl = '*://*.walmart.com/*';
        
        const tabs = platformUrl ? 
          await chrome.tabs.query({ url: platformUrl }) : 
          await chrome.tabs.query({ active: true, currentWindow: true });
          
        console.log(`📑 Found ${tabs.length} tabs for platform ${platform} (url: ${platformUrl})`);
        
        if (tabs.length > 0) {
          // Send to all matching tabs
          for (const tab of tabs) {
            try {
              console.log(`📤 Sending message to tab ${tab.id} (${tab.url})`);
              await chrome.tabs.sendMessage(tab.id, {
                action: 'processedImagesAvailable',
                platform: platform,
                images: result.images,
                count: result.count
              });
              console.log(`✅ Successfully notified tab ${tab.id} about ${result.images.length} images`);
            } catch (tabError) {
              console.log(`ℹ️ Could not notify tab ${tab.id} about processed images for ${platform}:`, tabError);
            }
          }
        }
      } else {
        console.log(`ℹ️ No processed images found for ${platform}`);
      }
    } catch (error) {
      console.error(`❌ Error polling processed images for ${platform}:`, error);
    }
  }

  addActivePlatform(platform) {
    console.log(`🎯 addActivePlatform called with: ${platform}`);
    
    if (!this.activePlatforms) {
      console.log('⚠️ activePlatforms was undefined, re-initializing...');
      this.activePlatforms = new Set();
    }
    
    const sizeBefore = this.activePlatforms.size;
    this.activePlatforms.add(platform);
    const sizeAfter = this.activePlatforms.size;
    
    console.log(`📍 Added ${platform} to active polling platforms`);
    console.log(`📊 Set size: ${sizeBefore} → ${sizeAfter}`);
    console.log(`📋 Current active platforms: [${Array.from(this.activePlatforms).join(', ')}]`);
    
    // Force a polling cycle immediately to test
    setTimeout(() => {
      console.log(`🚀 Triggering immediate poll check for ${platform}...`);
      this.pollProcessedImagesForPlatform(platform).catch(console.error);
    }, 1000);
  }

  removeActivePlatform(platform) {
    if (this.activePlatforms) {
      this.activePlatforms.delete(platform);
      console.log(`📍 Removed ${platform} from active polling platforms`);
    }
  }


  
  async connectToPEBDEQ() {
    try {
      // Check if PEBDEQ desktop app is running
      const response = await fetch('http://localhost:8000/api/status');
      if (response.ok) {
        console.log('✅ PEBDEQ desktop app connected');
        this.isPEBDEQConnected = true;
      }
    } catch (error) {
      console.log('📱 PEBDEQ desktop app not running');
      this.isPEBDEQConnected = false;
    }
  }
  
  async getPEBDEQPhotos() {
    if (!this.isPEBDEQConnected) {
      await this.connectToPEBDEQ();
    }
    
    try {
      const response = await fetch('http://localhost:8000/api/processed-photos');
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          photos: data.photos || []
        };
      }
    } catch (error) {
      console.error('❌ Failed to get PEBDEQ photos:', error);
    }
    
    return {
      success: false,
      photos: []
    };
  }
  
  async getPEBDEQPhoto(photoId) {
    try {
      const response = await fetch(`http://localhost:8000/api/processed-photo/${photoId}`);
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          file: data.file
        };
      }
    } catch (error) {
      console.error('❌ Failed to get PEBDEQ photo:', error);
    }
    
    return {
      success: false,
      error: 'Photo not found'
    };
  }
  
  async uploadToEtsy(photo, listingId) {
    try {
      const response = await fetch('http://localhost:8000/etsy/upload-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          photo: photo,
          listing_id: listingId
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          result: result
        };
      }
    } catch (error) {
      console.error('❌ Failed to upload to Etsy:', error);
    }
    
    return {
      success: false,
      error: 'Upload failed'
    };
  }
  
  async sendPhotosToDesktop(files, platform) {
    console.log(`📤 Sending ${files.length} photos to desktop for ${platform}`);
    
    try {
      // Send raw photos to PEBDEQ Desktop for processing
      const response = await fetch('http://localhost:8000/api/receive-photos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: files,
          targetPlatform: platform,
          timestamp: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Photos sent to desktop successfully');
        return { 
          success: true, 
          data: result,
          message: `${files.length} photos queued for processing`
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
    } catch (error) {
      console.error('❌ Failed to send photos to desktop:', error);
      return { 
        success: false, 
        error: error.message || 'Network error'
      };
    }
  }
  
  async checkProcessedImages(platform) {
    console.log(`🔍 Checking for processed images for ${platform}...`);
    
    try {
      const response = await fetch(`http://localhost:8000/api/get-processed-images/${platform}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`📥 Received ${data.count} processed images for ${platform}`);
        
        return {
          success: true,
          images: data.images || [],
          count: data.count || 0
        };
      } else {
        console.error(`❌ Failed to check processed images for ${platform}:`, response.statusText);
        return {
          success: false,
          error: `Failed to check processed images: ${response.statusText}`
        };
      }
    } catch (error) {
      console.error(`❌ Error checking processed images for ${platform}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async refreshPlatformTabs() {
    console.log('🔄 Manual refresh of platform tabs requested');
    
    try {
      // First, get ALL tabs for debugging
      const allTabs = await chrome.tabs.query({});
      console.log('🔍 ALL TABS:', allTabs.map(tab => ({id: tab.id, url: tab.url, title: tab.title})));
      
      const tabs = await chrome.tabs.query({
        url: [
          "https://*.etsy.com/*",
          "https://*.shopify.com/*", 
          "https://*.myshopify.com/*",
          "https://*.ebay.com/*",
          "https://*.pebdeq.com/*",
          "https://*.amazon.com/*",
          "https://*.aliexpress.com/*",
          "https://*.walmart.com/*",
          "*://*.etsy.com/*",
          "*://*.shopify.com/*", 
          "*://*.myshopify.com/*",
          "*://*.ebay.com/*",
          "*://*.pebdeq.com/*",
          "*://*.amazon.com/*",
          "*://*.aliexpress.com/*",
          "*://*.walmart.com/*"
        ]
      });

      console.log(`🔄 Found ${tabs.length} platform tabs to refresh`);
      if (tabs.length > 0) {
        console.log('🎯 Platform tabs found:', tabs.map(tab => ({id: tab.id, url: tab.url, title: tab.title})));
      }
      
      let refreshedCount = 0;
      for (const tab of tabs) {
        try {
          await chrome.tabs.reload(tab.id);
          refreshedCount++;
          console.log(`✅ Refreshed: ${tab.title}`);
        } catch (error) {
          console.log(`⚠️ Could not refresh tab ${tab.id}:`, error.message);
        }
      }
      
      return {
        success: true,
        count: refreshedCount,
        message: `Refreshed ${refreshedCount} platform tabs`
      };
      
    } catch (error) {
      console.error('❌ Error in manual tab refresh:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async checkDesktopConnection() {
    try {
      const response = await fetch('http://localhost:8000/api/status', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return {
          connected: true,
          status: data
        };
      } else {
        return {
          connected: false,
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      console.log('📡 Desktop connection check failed:', error.message);
      return {
        connected: false,
        error: error.message
      };
    }
  }

  async handlePageCleanup(request) {
    console.log(`🧹 Page cleanup for platform: ${request.platform}`);
    
    // For now, just log the cleanup
    // In the future, we could notify the desktop about page cleanup
    
    return {
      success: true,
      message: 'Cleanup handled'
    };
  }

  destroy() {
    // Clean up intervals when extension is being stopped
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    
    console.log('🧹 Background script cleanup completed');
  }
}

// Initialize background script
const pebdeqBackground = new PEBDEQBackground();