const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // App info
  getVersion: () => ipcRenderer.invoke('app-version'),
  
  // File operations
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  getAppPath: (name) => ipcRenderer.invoke('get-app-path', name),
  
  // Python backend
  getPythonBackendStatus: () => ipcRenderer.invoke('python-backend-status'),
  restartPythonBackend: () => ipcRenderer.invoke('restart-python-backend'),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('window-minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window-maximize'),
  toggleFullscreen: () => ipcRenderer.invoke('window-fullscreen'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  
  // Menu events
  onMenuEvent: (callback) => {
    ipcRenderer.on('menu-open-images', (event, ...args) => {
      callback({ type: 'menu-open-images' }, ...args);
    });
    ipcRenderer.on('menu-open-project', (event, ...args) => {
      callback({ type: 'menu-open-project' }, ...args);
    });
    ipcRenderer.on('menu-save-project', (event, ...args) => {
      callback({ type: 'menu-save-project' }, ...args);
    });
    ipcRenderer.on('menu-export', (event, ...args) => {
      callback({ type: 'menu-export' }, ...args);
    });
    ipcRenderer.on('menu-multi-generate', (event, ...args) => {
      callback({ type: 'menu-multi-generate' }, ...args);
    });
    ipcRenderer.on('menu-generate-final', (event, ...args) => {
      callback({ type: 'menu-generate-final' }, ...args);
    });
    ipcRenderer.on('menu-exit-composition', (event, ...args) => {
      callback({ type: 'menu-exit-composition' }, ...args);
    });
    ipcRenderer.on('menu-force-refresh', (event, ...args) => {
      callback({ type: 'menu-force-refresh' }, ...args);
    });
    ipcRenderer.on('menu-about', (event, ...args) => {
      callback({ type: 'menu-about' }, ...args);
    });
  },
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

// AI Processing API
contextBridge.exposeInMainWorld('aiAPI', {
  // Background removal
  removeBackground: async (imageData, model = 'u2net') => {
    try {
      const response = await fetch('http://localhost:8000/remove-background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_data: imageData,
          model: model
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Background removal error:', error);
      throw error;
    }
  },
  
  // Health check
  healthCheck: async () => {
    try {
      const response = await fetch('http://localhost:8000/health');
      return response.ok;
    } catch (error) {
      return false;
    }
  },
  
  // Get available models
  getModels: async () => {
    try {
      const response = await fetch('http://localhost:8000/models');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get models error:', error);
      throw error;
    }
  }
});

// File handling utilities
contextBridge.exposeInMainWorld('fileUtils', {
  // Convert file to base64
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },
  
  // Download processed image
  downloadImage: (dataUrl, filename) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
});

console.log('🔌 Preload script loaded - APIs exposed to renderer'); 