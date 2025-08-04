// PEBDEQ Extension Popup Script - Clean Version
console.log('🎨 PEBDEQ Popup loading...');

class PEBDEQPopup {
  constructor() {
    console.log('🔧 PEBDEQPopup constructor called');
    this.clientId = null;
    this.isConnected = false;
    this.init();
  }
  
  async init() {
    this.setupEventListeners();
    this.setupDisconnectHandlers();
    this.setupConnectionStatusListener();
    await this.checkExistingConnection();
    await this.checkStatus();
  }

  setupDisconnectHandlers() {
    // Disconnect when popup is closed
    window.addEventListener('beforeunload', () => {
      if (this.isConnected) {
        console.log('🔌 Popup closing - disconnecting...');
        this.disconnect();
      }
    });
    
    // Also disconnect when the browser window is closed
    window.addEventListener('unload', () => {
      if (this.isConnected) {
        console.log('🔌 Window closing - disconnecting...');
        this.disconnect();
      }
    });
    
    // For Chrome extensions, use chrome.runtime.onSuspend
    if (chrome.runtime && chrome.runtime.onSuspend) {
      chrome.runtime.onSuspend.addListener(() => {
        if (this.isConnected) {
          console.log('🔌 Extension suspending - disconnecting...');
          this.disconnect();
        }
      });
    }
  }
  
  async checkExistingConnection() {
    try {
      // Check if we have a stored client ID from this browser session
      const result = await chrome.storage.session.get(['pebdeq_client_id', 'pebdeq_connected']);
      
      if (result.pebdeq_client_id && result.pebdeq_connected) {
        this.clientId = result.pebdeq_client_id;
        this.isConnected = true;
        console.log('🔄 Using existing connection with ID:', this.clientId);
      } else {
        console.log('🆕 No existing connection found, creating new one...');
        await this.connectToDesktop();
      }
    } catch (error) {
      console.log('⚠️ Error checking existing connection:', error);
      await this.connectToDesktop();
    }
  }

  async connectToDesktop() {
    if (this.isConnected) {
      console.log('✅ Already connected with ID:', this.clientId);
      return;
    }

    try {
      console.log('🔌 Attempting to connect to desktop...');
      const response = await fetch('http://localhost:8000/api/extension-connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.clientId = data.client_id;
        this.isConnected = true;
        
        // Store connection in session storage
        await chrome.storage.session.set({
          pebdeq_client_id: this.clientId,
          pebdeq_connected: true
        });
        
        console.log('🔌 Connected to desktop with ID:', this.clientId);
        console.log('👥 Total connected clients:', data.connected_clients);
      } else {
        console.log('🔌 Failed to register with desktop:', response.status);
      }
    } catch (error) {
      console.log('🔌 Failed to connect to desktop:', error.message);
    }
  }
  
  setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        console.log('🔄 Manual refresh triggered');
        this.checkStatus();
      });
    }

    // Handle window/tab close to disconnect properly
    window.addEventListener('beforeunload', () => {
      this.disconnect();
    });

    // Call second part of event listeners
    this.setupEventListenersSecondPart();
  }

  async disconnect() {
    if (!this.clientId) return;

    try {
      const response = await fetch('http://localhost:8000/api/extension-disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: this.clientId })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`🔌 Disconnected from desktop. Remaining clients: ${data.connected_clients}`);
      }
      
      // Clear session storage
      await chrome.storage.session.remove(['pebdeq_client_id', 'pebdeq_connected']);
      
      this.isConnected = false;
      this.clientId = null;
      
      console.log('🔌 Disconnected from desktop');
    } catch (error) {
      console.log('⚠️ Error disconnecting:', error);
    }
  }
    
  // Continue setupEventListeners method
  setupEventListenersSecondPart() {

    // Refresh tabs button
    const refreshTabsBtn = document.getElementById('refresh-tabs-btn');
    if (refreshTabsBtn) {
      refreshTabsBtn.addEventListener('click', () => {
        this.refreshPlatformTabs();
      });
    }
    
    // Help button
    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        this.showHelp();
      });
    }

    // Debug button (temporary for testing)
    const debugBtn = document.createElement('button');
    debugBtn.textContent = '🐛 Debug Status';
    debugBtn.className = 'action-btn secondary';
    debugBtn.style.marginTop = '10px';
    debugBtn.addEventListener('click', () => {
      this.debugStatus();
    });
    
    const actionsDiv = document.querySelector('.actions');
    if (actionsDiv) {
      actionsDiv.appendChild(debugBtn);
    }
  }

  async checkStatus() {
    console.log('🔍 Checking PEBDEQ Desktop status...');
    const statusEl = document.getElementById('status');
    const desktopStatusEl = document.getElementById('desktop-status');
    const desktopTextEl = document.getElementById('desktop-text');

    
    if (!statusEl) {
      console.error('❌ Status element not found!');
      return;
    }
    
    // Set checking state
    statusEl.className = 'status disconnected';
    statusEl.innerHTML = '<span class="status-icon">🔄</span><span>Checking...</span>';
    
    try {
      console.log('📡 Fetching from localhost:8000/api/status...');
      
      // Check desktop app connection
      const response = await fetch('http://localhost:8000/api/status', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Desktop response:', data);
        
        // Check if desktop is actually running, not just backend responding
        const isDesktopRunning = data.desktop_running === true;
        
        if (isDesktopRunning) {
          // Update UI for connected state
          statusEl.className = 'status connected';
          statusEl.innerHTML = '<span class="status-icon">✅</span><span>Connected & Ready</span>';
          
          // Update desktop status indicator
          if (desktopStatusEl) {
            desktopStatusEl.className = 'desktop-indicator online';
          }
          if (desktopTextEl) {
            desktopTextEl.textContent = 'Online';
          }
          
          console.log('🎉 Successfully connected to PEBDEQ Desktop');
        } else {
          // Backend responding but desktop not fully running
          statusEl.className = 'status disconnected';
          statusEl.innerHTML = '<span class="status-icon">⚠️</span><span>Backend Online, Desktop Starting...</span>';
          
          if (desktopStatusEl) {
            desktopStatusEl.className = 'desktop-indicator offline';
          }
          if (desktopTextEl) {
            desktopTextEl.textContent = 'Starting...';
          }
        }
        
        console.log(`📊 Extension clients: ${data.extension_clients || 0}`);
        
      } else {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('❌ HTTP Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
    } catch (error) {
      console.error('❌ Connection failed:', error);
      
      // Update UI for offline state
      statusEl.className = 'status disconnected';
      statusEl.innerHTML = '<span class="status-icon">🔒</span><span>Desktop App Offline</span>';
      
      if (desktopStatusEl) {
        desktopStatusEl.className = 'desktop-indicator';
      }
      if (desktopTextEl) {
        desktopTextEl.textContent = 'Offline';
      }

      
      // Log detailed error for debugging
      const errorMsg = error.message.includes('Failed to fetch') 
        ? 'PEBDEQ Desktop not running on port 8000' 
        : error.message;
      
      console.log('📝 Connection error details:', errorMsg);
    }
  }

  async debugStatus() {
    try {
      console.log('🐛 Getting debug status...');
      
      // Get debug info from background script
      const response = await chrome.runtime.sendMessage({ action: 'debugStatus' });
      
      const debugInfo = `
🐛 PEBDEQ Extension Debug Status:

📋 Active Platforms: ${response.activePlatforms.length > 0 ? response.activePlatforms.join(', ') : 'None'}
🔄 Polling Active: ${response.pollingInterval ? 'Yes' : 'No'}
🔌 Desktop Connected: ${response.isConnected ? 'Yes' : 'No'}
🆔 Client ID: ${this.clientId || 'Not set'}
🔗 Connection Status: ${this.isConnected ? 'Connected' : 'Disconnected'}

🔍 Check browser console for detailed logs...
      `;
      
      alert(debugInfo);
      console.log('🐛 Full debug response:', response);
      
    } catch (error) {
      console.error('❌ Debug status error:', error);
      alert('❌ Failed to get debug status');
    }
  }

  setupConnectionStatusListener() {
    // Simple popup status - no complex monitoring needed
    console.log('🔗 Simple popup status monitoring...');
  }

  showHelp() {
    console.log('❓ Showing help information');
    
    const helpText = `
PEBDEQ Multi-Platform Integration Help:

1. Make sure PEBDEQ Desktop is running (port 8000)
2. Navigate to any e-commerce platform:
   • Etsy.com (listing creation)
   • eBay.com (sell item page)  
   • Shopify.com (product page)
   • pebdeq.com (admin area)

3. Look for the PEBDEQ checkbox in photo upload sections
4. Select photos and click "Send to Desktop"
5. Process photos in PEBDEQ Desktop
6. Use "Send to Platform" button to upload

Need more help? Check the extension README.
    `;
    
    alert(helpText);
  }

  async refreshPlatformTabs() {
    console.log('🔄 Refreshing platform tabs...');
    
    try {
      // Send message to background script to refresh tabs
      const response = await chrome.runtime.sendMessage({
        action: 'refreshPlatformTabs'
      });
      
      if (response && response.success) {
        console.log(`✅ Refreshed ${response.count || 0} platform tabs`);
        this.showNotification(`Refreshed ${response.count || 0} platform tab(s)`, 'success');
      } else {
        this.showNotification('No platform tabs found to refresh', 'info');
      }
      
    } catch (error) {
      console.error('❌ Error refreshing tabs:', error);
      this.showNotification('Failed to refresh tabs', 'error');
    }
  }

  showNotification(message, type = 'info') {
    console.log(`📢 ${type.toUpperCase()}: ${message}`);
    
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      right: 10px;
      padding: 12px;
      background: ${type === 'error' ? '#fef2f2' : '#eff6ff'};
      color: ${type === 'error' ? '#dc2626' : '#1e40af'};
      border: 1px solid ${type === 'error' ? '#fecaca' : '#bfdbfe'};
      border-radius: 6px;
      font-size: 12px;
      z-index: 1000;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  // Cleanup when popup is closed
  cleanup() {
    if (this.clientId) {
      console.log('🧹 Cleaning up extension connection...');
      fetch('http://localhost:8000/api/extension-disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ client_id: this.clientId })
      }).catch(err => {
        console.log('🧹 Cleanup failed (app may be offline):', err.message);
      });
    }
  }
}

// Initialize popup when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.pebdeqPopup = new PEBDEQPopup();
  });
} else {
  window.pebdeqPopup = new PEBDEQPopup();
}

// Cleanup when popup closes
window.addEventListener('beforeunload', () => {
  if (window.pebdeqPopup) {
    window.pebdeqPopup.cleanup();
  }
});

// Auto-refresh status every 10 seconds
setInterval(() => {
  if (window.pebdeqPopup) {
    console.log('⏰ Auto-refresh status check');
    window.pebdeqPopup.checkStatus();
  }
}, 10000);