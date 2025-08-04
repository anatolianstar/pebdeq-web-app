# 🤖 Auto-Deploy Feature Guide

## Overview
The Auto-Deploy feature automatically monitors your project files and deploys changes to the server in real-time.

## How to Use

### 1. Enable Auto-Deploy
1. Open **Deployment GUI**
2. Go to **[CONFIG] Configuration** tab
3. In **🤖 Auto-Deploy Settings** section:
   - ✅ Check **"🔄 Enable Auto-Deploy"**
   - ⏱️ Set **check interval** (default: 10 seconds)
   - 📄 Configure **watch extensions** (default: .py,.js,.css,.html,.json)

### 2. Configure Settings
- **Check Interval**: How often to scan for changes (5-300 seconds)
- **Watch Extensions**: File types to monitor (comma-separated)
- Make sure **"Incremental Upload"** is available (auto-enabled for auto-deploy)

### 3. Prerequisites
- ✅ Valid **project path** set
- ✅ **Server connection** configured (IP, user, password)
- ✅ **SSH connection** working

### 4. What Happens
When you save a file:
1. 🔍 **File Monitor** detects the change
2. 📤 **Incremental Upload** uploads only changed files
3. 🔄 **Auto-Restart** backend service (if .py files changed)
4. ✅ **Log Update** shows deployment status

## Monitored Directories
- `backend/` - Python backend files
- `frontend/` - React/JavaScript frontend files  
- `pb_test_suite/` - Test suite files

## Skipped Files/Folders
- `.git`, `__pycache__`, `node_modules`, `.venv`, `build`
- `.pyc`, `.pyo` files
- Deployment scripts

## Auto-Restart Logic
- **Python files** (.py) → Backend service restart
- **Other files** → Upload only (no restart)

## Status Indicators
- ✅ **"Auto-deploy: Running"** (green) = Active monitoring
- ❌ **"Auto-deploy: Stopped"** (red) = Not monitoring
- 📝 **Log messages** show detected changes and upload status

## Best Practices

### 1. Development Workflow
```bash
# 1. Enable auto-deploy
# 2. Edit files in your IDE
# 3. Save file (Ctrl+S)
# 4. Auto-deploy uploads changes
# 5. Check logs for confirmation
```

### 2. Recommended Settings
- **Interval**: 10-30 seconds (not too frequent)
- **Extensions**: Only necessary types to avoid noise
- **Connection**: Keep SSH connection stable

### 3. Troubleshooting
- **No uploads**: Check project path and server connection
- **Permission errors**: Verify SSH user permissions
- **Service restart fails**: Check backend service configuration

## Example Usage

### Scenario 1: Backend Development
```python
# Edit: backend/app/routes/products.py
def get_products():
    # Add new feature
    return jsonify({"products": data})
```
**Result**: File uploaded + backend service restarted

### Scenario 2: Frontend Development  
```javascript
// Edit: frontend/src/components/Header.js
const Header = () => {
    // Update UI
    return <div>New Header</div>;
};
```
**Result**: File uploaded (no restart needed)

### Scenario 3: CSS Styling
```css
/* Edit: frontend/src/App.css */
.new-style {
    color: blue;
}
```
**Result**: File uploaded immediately

## Performance Notes
- Uses **incremental upload** (only changed files)
- **Minimal server load** with smart file comparison
- **Thread-based** monitoring (non-blocking UI)
- **Automatic cleanup** on GUI close

## Security
- Uses same **SSH credentials** as manual deployment
- **No additional permissions** required
- **Safe file monitoring** (read-only scanning)

---

💡 **Tip**: Start with 30-second intervals and adjust based on your development speed!

🚀 **Perfect for**: Hot-reloading development environment on live server! 