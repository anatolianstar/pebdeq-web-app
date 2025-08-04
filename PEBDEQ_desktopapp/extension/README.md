# 🎨 PEBDEQ Etsy Integration Browser Extension

Seamless integration between PEBDEQ Desktop Pro and Etsy for effortless photo uploading.

## 🚀 How It Works

This extension enables **seamless photo upload** from PEBDEQ directly to Etsy listings:

1. **Process photos** in PEBDEQ Desktop Pro
2. **Go to Etsy** listing creation page
3. **Click "Add Photos"** - Extension adds a checkbox
4. **Check "Use PEBDEQ Photos"** - Your processed photos appear
5. **Select and upload** - Automatic upload to Etsy!

## 📦 Installation

### 1. Install Extension in Chrome/Edge:
```bash
1. Open Chrome/Edge
2. Go to chrome://extensions/ (or edge://extensions/)
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the 'extension' folder
6. ✅ Extension installed!
```

### 2. Make Sure PEBDEQ Desktop is Running:
```bash
1. Start PEBDEQ Desktop Pro
2. Extension automatically connects
3. Green ✅ status means ready!
```

## 🎯 Features

### ✅ **Seamless Integration**
- No manual file browsing
- Direct access to processed photos
- One-click upload to Etsy

### ✅ **Smart Photo Management**
- Thumbnails for quick selection
- Metadata display (preset, size)
- Automatic Etsy optimization

### ✅ **Real-time Sync**
- Live connection to PEBDEQ Desktop
- Instant photo availability
- Status monitoring

### ✅ **User-Friendly**
- Visual photo grid
- Clear upload feedback
- Helpful notifications

## 🛠️ Usage Workflow

### **Step 1: Prepare Photos in PEBDEQ**
```javascript
1. Load product photos into PEBDEQ
2. Remove backgrounds with AI
3. Apply Etsy-optimized backgrounds
4. Use Etsy export presets (2000x2000, etc.)
5. Photos are automatically available to extension
```

### **Step 2: Upload to Etsy**
```javascript
1. Go to Etsy.com
2. Create/edit a listing
3. Click "Add Photos"
4. ✅ Check "Use PEBDEQ Photos"
5. 📸 Select from processed photos grid
6. 🚀 Automatic upload!
```

## 🔧 Technical Details

### **Communication Flow:**
```
E-commerce Platform ↔ Extension ↔ PEBDEQ Desktop (localhost:8000)
```

### **API Endpoints:**
- `GET /api/status` - Check PEBDEQ connection
- `GET /api/processed-photos` - List all processed photos
- `GET /api/processed-photo/{id}` - Get specific photo data
- `GET /api/thumbnail/{id}` - Get photo thumbnail

### **Security:**
- Local-only communication (localhost)
- No cloud storage required
- Direct browser-to-desktop connection

## 🎨 UI Components

### **Extension Popup:**
- Connection status indicator
- Photo count display
- Quick actions (refresh, help)
- Desktop app launcher

### **Etsy Page Integration:**
- Checkbox: "Use PEBDEQ Photos"
- Photo grid with thumbnails
- Upload progress indicators
- Success/error notifications

### **Photo Grid Display:**
- 80x80px thumbnails
- Photo name and metadata
- Preset information (Etsy Main, Gallery, etc.)
- Click-to-select functionality

## 🐛 Troubleshooting

### **Extension Not Working:**
```bash
✅ Check PEBDEQ Desktop is running
✅ Visit chrome://extensions/ and reload extension
✅ Make sure port 5005 is not blocked
✅ Clear browser cache and restart
```

### **Photos Not Appearing:**
```bash
✅ Process photos in PEBDEQ first
✅ Check processed_photos folder exists
✅ Refresh extension status
✅ Try reloading Etsy page
```

### **Upload Failures:**
```bash
✅ Check internet connection
✅ Verify Etsy account permissions
✅ Ensure photo format is supported
✅ Try smaller file sizes
```

## 📱 Browser Support

- ✅ **Chrome** (Recommended)
- ✅ **Microsoft Edge**
- ✅ **Brave**
- ⚠️ **Firefox** (Manual conversion needed)
- ❌ **Safari** (Not supported)

## 🔄 Updates

The extension automatically stays in sync with PEBDEQ Desktop Pro updates. No manual updates needed!

## 📞 Support

- **Documentation:** https://pebdeq.com/docs
- **Video Tutorials:** https://pebdeq.com/tutorials  
- **Help Forum:** https://pebdeq.com/support
- **Email:** support@pebdeq.com

---

**🎉 Enjoy seamless Etsy integration with PEBDEQ!** 🚀