const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { spawn } = require('child_process');

// Keep a global reference of the window object
let mainWindow;
let pythonBackend = null;

// Development flag
const isDevelopment = process.env.NODE_ENV === 'development' || process.argv.includes('--dev');

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 1000,
    minWidth: 1200,
    minHeight: 800,
    icon: path.join(__dirname, '../assets/icons/app-icon.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js')
    },
    show: false, // Don't show until ready
    titleBarStyle: 'default',
    autoHideMenuBar: false // Show menu bar (File, Edit, View, etc.)
  });

  // Load the app
  const rendererPath = path.join(__dirname, '../renderer/index.html');
  mainWindow.loadFile(rendererPath);

  // Show window when ready to prevent visual flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize(); // Start maximized
    mainWindow.show();
    
    // Never open DevTools automatically
    // DevTools can be opened manually with F12 if needed
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

function startPythonBackend() {
  if (pythonBackend) return;

  // Use virtual environment Python for development
  const pythonExecutable = isDevelopment 
    ? path.join(__dirname, '../python-backend/venv/Scripts/python.exe')
    : 'python';

  const pythonScript = isDevelopment
    ? path.join(__dirname, '../python-backend/main.py')
    : path.join(process.resourcesPath, 'python-backend', 'main.py');

  console.log('🐍 Starting Python backend...', pythonScript);
  console.log('🐍 Using Python executable:', pythonExecutable);

  pythonBackend = spawn(pythonExecutable, [pythonScript], {
    stdio: ['pipe', 'pipe', 'pipe'],
    env: { ...process.env, PYTHONPATH: path.dirname(pythonScript) }
  });

  pythonBackend.stdout.on('data', (data) => {
    console.log('🐍 Python:', data.toString());
  });

  pythonBackend.stderr.on('data', (data) => {
    console.error('🐍 Python Error:', data.toString());
  });

  pythonBackend.on('close', (code) => {
    console.log(`🐍 Python backend exited with code ${code}`);
    pythonBackend = null;
  });

  pythonBackend.on('error', (error) => {
    console.error('🐍 Failed to start Python backend:', error);
    dialog.showErrorBox(
      'Python Backend Error',
      `Failed to start AI processing service: ${error.message}`
    );
  });
}

function stopPythonBackend() {
  if (pythonBackend) {
    console.log('🐍 Stopping Python backend...');
    pythonBackend.kill();
    pythonBackend = null;
  }
}

// App event handlers
app.whenReady().then(() => {
  createWindow();
  createMenu();
  // startPythonBackend(); // DISABLED - Using manual backend start
  
  // macOS specific - recreate window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    stopPythonBackend();
    app.quit();
  }
});

app.on('before-quit', () => {
  stopPythonBackend();
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
    shell.openExternal(navigationUrl);
  });
});

// IPC Handlers
ipcMain.handle('app-version', () => {
  return app.getVersion();
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('get-app-path', (event, name) => {
  return app.getPath(name);
});

ipcMain.handle('python-backend-status', () => {
  return pythonBackend !== null;
});

ipcMain.handle('restart-python-backend', () => {
  // stopPythonBackend(); // DISABLED - Using manual backend
  // setTimeout(() => {
  //   startPythonBackend();
  // }, 1000);
  console.log('Python backend restart requested but disabled - using manual backend');
  return true;
});

// Menu setup
function createMenu() {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Open Images...',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            console.log('📂 Main Menu: Open Images triggered');
            mainWindow.webContents.send('menu-open-images');
          }
        },
        {
          label: 'Open Project...',
          accelerator: 'CmdOrCtrl+Shift+O',
          click: () => {
            console.log('📂 Main Menu: Open Project triggered');
            mainWindow.webContents.send('menu-open-project');
          }
        },
        { type: 'separator' },
        {
          label: 'Save Project',
          accelerator: 'CmdOrCtrl+S',
          click: () => {
            console.log('💾 Main Menu: Save Project triggered');
            mainWindow.webContents.send('menu-save-project');
          }
        },
        { type: 'separator' },
        {
          label: 'Export...',
          accelerator: 'CmdOrCtrl+E',
          click: () => {
            console.log('📤 Main Menu: Export triggered');
            mainWindow.webContents.send('menu-export');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            console.log('🚪 Main Menu: Exit triggered');
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' }
      ]
    },
    {
      label: 'Layers',
      submenu: [
        {
          label: 'Multi Generate Layer',
          accelerator: 'CmdOrCtrl+L',
          click: () => {
            console.log('🎨 Main Menu: Multi Generate triggered');
            mainWindow.webContents.send('menu-multi-generate');
          }
        },
        {
          label: 'Generate Final',
          accelerator: 'CmdOrCtrl+G',
          click: () => {
            console.log('📸 Main Menu: Generate Final triggered');
            mainWindow.webContents.send('menu-generate-final');
          }
        },
        { type: 'separator' },
        {
          label: 'Exit Composition',
          accelerator: 'Escape',
          click: () => {
            console.log('🚪 Main Menu: Exit Composition triggered');
            mainWindow.webContents.send('menu-exit-composition');
          }
        },
        { type: 'separator' },
        {
          label: 'Force Refresh Canvas',
          accelerator: 'F5',
          click: () => {
            console.log('⚡ Main Menu: Force Refresh triggered');
            mainWindow.webContents.send('menu-force-refresh');
          }
        }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forcereload' },
        { role: 'toggledevtools' },
        { type: 'separator' },
        { role: 'resetzoom' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'About PEBDEQ Desktop Pro',
          click: () => {
            console.log('ℹ️ Main Menu: About triggered');
            mainWindow.webContents.send('menu-about');
          }
        },
        {
          label: 'Documentation',
          click: () => {
            console.log('📚 Main Menu: Documentation triggered');
            shell.openExternal('https://docs.pebdeq.com');
          }
        }
      ]
    }
  ];

  // macOS specific menu adjustments
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Window Control IPC Handlers
ipcMain.handle('window-minimize', () => {
  if (mainWindow) {
    mainWindow.minimize();
  }
});

ipcMain.handle('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.restore();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.handle('window-fullscreen', () => {
  if (mainWindow) {
    const isFullScreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFullScreen);
  }
});

ipcMain.handle('window-close', () => {
  if (mainWindow) {
    mainWindow.close();
  }
});

console.log('🚀 PEBDEQ Desktop Pro starting...'); 