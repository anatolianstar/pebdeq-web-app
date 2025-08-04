import { useState, useEffect } from 'react';
import { createApiUrl } from '../utils/config';
import { 
  THEME_TEMPLATE, 
  generateThemeCSS, 
  validateTheme, 
  createThemeFromTemplate, 
  exportTheme, 
  importTheme, 
  generateThemeId, 
  getThemePreview 
} from '../utils/themeTemplate';
import './ThemeBuilder.css';

// Color descriptions mapping for better UX
const COLOR_DESCRIPTIONS = {
  // Primary colors
  primary: 'Primary (Buttons, Links, Active Elements)',
  primaryHover: 'Primary Hover (Button Hover State)',
  primaryActive: 'Primary Active (Pressed/Clicked State)',
  primaryLight: 'Primary Light (Subtle Highlights)',
  primaryDark: 'Primary Dark (Emphasis, Borders)',
  
  // Secondary colors
  secondary: 'Secondary (Secondary Buttons, Tags)',
  secondaryHover: 'Secondary Hover (Secondary Button Hover)',
  secondaryActive: 'Secondary Active (Secondary Pressed State)',
  secondaryLight: 'Secondary Light (Subtle Secondary Areas)',
  secondaryDark: 'Secondary Dark (Secondary Emphasis)',
  
  // Background colors
  backgroundPrimary: 'Background Primary (Main Page Background)',
  backgroundSecondary: 'Background Secondary (Cards, Panels)',
  backgroundTertiary: 'Background Tertiary (Sidebars, Sections)',
  backgroundModal: 'Background Modal (Popup/Modal Background)',
  backgroundOverlay: 'Background Overlay (Dimmed Overlay)',
  
  // Text colors
  textPrimary: 'Text Primary (Main Text, Headlines)',
  textSecondary: 'Text Secondary (Subtitles, Descriptions)',
  textMuted: 'Text Muted (Placeholders, Disabled Text)',
  textInverse: 'Text Inverse (White Text on Dark)',
  
  // Status colors
  success: 'Success (Success Messages, Confirmations)',
  successLight: 'Success Light (Success Backgrounds)',
  successDark: 'Success Dark (Success Borders)',
  
  danger: 'Danger (Error Messages, Delete Buttons)',
  dangerLight: 'Danger Light (Error Backgrounds)',
  dangerDark: 'Danger Dark (Error Borders)',
  
  warning: 'Warning (Warning Messages, Caution)',
  warningLight: 'Warning Light (Warning Backgrounds)',
  warningDark: 'Warning Dark (Warning Borders)',
  
  info: 'Info (Info Messages, Tips)',
  infoLight: 'Info Light (Info Backgrounds)',
  infoDark: 'Info Dark (Info Borders)',
  
  // Border and surface colors
  borderColor: 'Border Color (Input Borders, Dividers)',
  borderLight: 'Border Light (Subtle Separators)',
  borderDark: 'Border Dark (Strong Separators)',
  
  // Button specific colors
  buttonPrimary: 'Button Primary (Primary Button Background)',
  buttonPrimaryText: 'Button Primary Text (Primary Button Text)',
  buttonSecondary: 'Button Secondary (Secondary Button Background)',
  buttonSecondaryText: 'Button Secondary Text (Secondary Button Text)',
  
  // Link colors
  linkColor: 'Link Color (Regular Links)',
  linkHover: 'Link Hover (Link Hover State)',
  linkVisited: 'Link Visited (Visited Links)',
  
  // Form colors
  inputBackground: 'Input Background (Form Input Background)',
  inputBorder: 'Input Border (Form Input Borders)',
  inputFocus: 'Input Focus (Focused Input State)',
  inputPlaceholder: 'Input Placeholder (Placeholder Text)',
  
  // Shadow and accent colors
  shadowColor: 'Shadow Color (Drop Shadows)',
  accentColor: 'Accent Color (Highlights, Focus)',
  selectionText: 'Selection Text (Selected Text Background)',
  selectionBackground: 'Selection Background (Text Selection)'
};

// Function to get descriptive label for color key
const getColorLabel = (key) => {
  return COLOR_DESCRIPTIONS[key] || key.replace(/([A-Z])/g, ' $1').toLowerCase();
};

const ThemeBuilder = ({ onThemeCreate, onThemeUpdate, existingTheme = null }) => {
  const [themeData, setThemeData] = useState(existingTheme || THEME_TEMPLATE);
  const [activeTab, setActiveTab] = useState('basic');
  const [errors, setErrors] = useState([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importData, setImportData] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importMethod, setImportMethod] = useState('file'); // 'file' or 'text'

  // Update theme data handler
  const updateThemeData = (path, value) => {
    const newThemeData = { ...themeData };
    const keys = path.split('.');
    let current = newThemeData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    
    // Auto-generate ID from name if name changes
    if (path === 'name') {
      newThemeData.id = generateThemeId(value);
    }
    
    setThemeData(newThemeData);
    
    // Clear errors when data changes
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  // Validate and save theme
  const handleSaveTheme = async () => {
    setIsLoading(true);
    setErrors([]);
    
    const validationErrors = validateTheme(themeData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsLoading(false);
      return;
    }
    
    try {
      // Generate CSS
      const css = generateThemeCSS(themeData);
      
      // Get auth token
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in.');
      }
      
      // Save to backend
      const response = await fetch(createApiUrl('api/themes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...themeData,
          css: css,
        }),
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        if (onThemeCreate) {
          onThemeCreate(responseData.theme || responseData);
        }
        
        alert('Theme saved successfully!');
        console.log('Theme saved:', responseData);
      } else {
        throw new Error(responseData.error || responseData.message || 'Failed to save theme');
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      const errorMessage = error.message || 'An unknown error occurred while saving the theme';
      setErrors([errorMessage]);
      alert(`Save failed: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Load theme from file
  const handleImportTheme = async () => {
    let themeContent = '';
    
    try {
      if (importMethod === 'file') {
        if (!selectedFile) {
          alert('Please select a JSON file to import');
          return;
        }
        
        // Read file content
        const fileContent = await readFileContent(selectedFile);
        themeContent = fileContent;
      } else {
        if (!importData.trim()) {
          alert('Please paste theme data to import');
          return;
        }
        themeContent = importData;
      }
      
      // Validate JSON format first
      let parsed;
      try {
        parsed = JSON.parse(themeContent);
      } catch (parseError) {
        throw new Error('Invalid JSON format. Please check your theme data.');
      }
      
      // Import using utility function
      const imported = importTheme(themeContent);
      setThemeData(imported);
      
      // Save to localStorage for theme selector
      const customThemes = JSON.parse(localStorage.getItem('customThemes') || '[]');
      const newCustomTheme = {
        id: imported.id,
        name: imported.name,
        description: imported.description,
        type: imported.type,
        data: imported
      };
      
      // Check if theme already exists and update or add
      const existingIndex = customThemes.findIndex(theme => theme.id === imported.id);
      if (existingIndex >= 0) {
        customThemes[existingIndex] = newCustomTheme;
      } else {
        customThemes.push(newCustomTheme);
      }
      
      localStorage.setItem('customThemes', JSON.stringify(customThemes));
      console.log('💾 Saved custom theme to localStorage:', newCustomTheme);
      
      // Notify theme context about new custom theme
      window.dispatchEvent(new CustomEvent('customThemeAdded', { 
        detail: newCustomTheme 
      }));
      
      setShowImportModal(false);
      setImportData('');
      setSelectedFile(null);
      setErrors([]);
      
      // Ask user if they want to apply the imported theme immediately
      const shouldApply = window.confirm(`Theme "${imported.name}" imported successfully! Would you like to apply it now?`);
      if (shouldApply) {
        // Dispatch theme change event
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('changeThemeRequest', { 
            detail: { themeId: imported.id } 
          }));
        }, 500);
      }
      
      alert(`Theme "${imported.name}" imported successfully and added to theme selector!`);
      console.log('Theme imported:', imported);
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error.message || 'Failed to import theme';
      alert(`Import failed: ${errorMessage}`);
    }
  };
  
  // Helper function to read file content
  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };
  
  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        setSelectedFile(file);
      } else {
        alert('Please select a valid JSON file');
        event.target.value = '';
      }
    }
  };

  // Export theme to file
  const handleExportTheme = () => {
    try {
      // Validate theme before export
      const validationErrors = validateTheme(themeData);
      if (validationErrors.length > 0) {
        alert(`Cannot export theme with errors:\n${validationErrors.join('\n')}`);
        return;
      }
      
      const exported = exportTheme(themeData);
      const blob = new Blob([exported], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Sanitize filename
      const safeName = themeData.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const fileName = `theme_${safeName}_${Date.now()}.json`;
      link.download = fileName;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('Theme exported:', fileName);
      alert(`Theme exported successfully as ${fileName}`);
    } catch (error) {
      console.error('Export error:', error);
      const errorMessage = error.message || 'Failed to export theme';
      alert(`Export failed: ${errorMessage}`);
    }
  };

  // Apply theme preview
  const handlePreview = () => {
    if (previewMode) {
      // Remove preview
      document.documentElement.removeAttribute('data-theme');
      setPreviewMode(false);
    } else {
      // Apply preview
      const css = generateThemeCSS(themeData);
      const style = document.createElement('style');
      style.id = 'theme-preview';
      style.textContent = css;
      document.head.appendChild(style);
      document.documentElement.setAttribute('data-theme', themeData.id);
      setPreviewMode(true);
    }
  };

  // Cleanup preview on unmount
  useEffect(() => {
    return () => {
      if (previewMode) {
        document.documentElement.removeAttribute('data-theme');
        const previewStyle = document.getElementById('theme-preview');
        if (previewStyle) {
          previewStyle.remove();
        }
      }
    };
  }, [previewMode]);

  const renderBasicTab = () => (
    <div className="theme-builder-tab">
      <div className="form-group">
        <label>Theme Name</label>
        <input
          type="text"
          value={themeData.name}
          onChange={(e) => updateThemeData('name', e.target.value)}
          placeholder="Enter theme name"
        />
      </div>
      
      <div className="form-group">
        <label>Description</label>
        <textarea
          value={themeData.description}
          onChange={(e) => updateThemeData('description', e.target.value)}
          placeholder="Describe your theme"
        />
      </div>
      
      <div className="form-group">
        <label>Author</label>
        <input
          type="text"
          value={themeData.author}
          onChange={(e) => updateThemeData('author', e.target.value)}
          placeholder="Your name"
        />
      </div>
      
      <div className="form-group">
        <label>Theme Type</label>
        <select
          value={themeData.type}
          onChange={(e) => updateThemeData('type', e.target.value)}
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      
      <div className="theme-preview-card">
        <h3>Theme Preview</h3>
        <div className="color-preview-grid">
          {Object.entries(getThemePreview(themeData)).map(([key, color]) => (
            <div key={key} className="color-preview-item">
              <div 
                className="color-preview-swatch" 
                style={{ backgroundColor: color }}
              />
              <span>{key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderColorsTab = () => (
    <div className="theme-builder-tab">
      <div className="colors-section">
        <h3>Primary Colors</h3>
        <div className="color-grid">
          {Object.entries(themeData.colors).filter(([key]) => key.startsWith('primary')).map(([key, value]) => (
            <div key={key} className="color-input-group">
              <label>{getColorLabel(key)}</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="colors-section">
        <h3>Secondary Colors</h3>
        <div className="color-grid">
          {Object.entries(themeData.colors).filter(([key]) => key.startsWith('secondary')).map(([key, value]) => (
            <div key={key} className="color-input-group">
              <label>{getColorLabel(key)}</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="colors-section">
        <h3>Status Colors</h3>
        <div className="color-grid">
          {Object.entries(themeData.colors).filter(([key]) => 
            key.startsWith('success') || key.startsWith('danger') || key.startsWith('warning') || key.startsWith('info')
          ).map(([key, value]) => (
            <div key={key} className="color-input-group">
              <label>{getColorLabel(key)}</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="colors-section">
        <h3>Background Colors</h3>
        <div className="color-grid">
          {Object.entries(themeData.colors).filter(([key]) => key.startsWith('background')).map(([key, value]) => (
            <div key={key} className="color-input-group">
              <label>{getColorLabel(key)}</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="colors-section">
        <h3>Text Colors</h3>
        <div className="color-grid">
          {Object.entries(themeData.colors).filter(([key]) => key.startsWith('text')).map(([key, value]) => (
            <div key={key} className="color-input-group">
              <label>{getColorLabel(key)}</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="colors-section">
        <h3>Border Colors</h3>
        <div className="color-grid">
          {Object.entries(themeData.colors).filter(([key]) => key.startsWith('border')).map(([key, value]) => (
            <div key={key} className="color-input-group">
              <label>{getColorLabel(key)}</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="colors-section">
        <h3>Link Colors</h3>
        <div className="color-grid">
          {Object.entries(themeData.colors).filter(([key]) => key.startsWith('link')).map(([key, value]) => (
            <div key={key} className="color-input-group">
              <label>{getColorLabel(key)}</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="colors-section">
        <h3>Button Colors</h3>
        <div className="color-grid">
          {Object.entries(themeData.colors).filter(([key]) => key.startsWith('button')).map(([key, value]) => (
            <div key={key} className="color-input-group">
              <label>{getColorLabel(key)}</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="colors-section">
        <h3>Form Colors</h3>
        <div className="color-grid">
          {Object.entries(themeData.colors).filter(([key]) => key.startsWith('input')).map(([key, value]) => (
            <div key={key} className="color-input-group">
              <label>{getColorLabel(key)}</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="colors-section">
        <h3>Component Colors</h3>
        <div className="color-grid">
          {Object.entries(themeData.colors).filter(([key]) => 
            key.startsWith('header') || key.startsWith('footer') || key.startsWith('nav') || 
            key.startsWith('sidebar') || key.startsWith('card')
          ).map(([key, value]) => (
            <div key={key} className="color-input-group">
              <label>{getColorLabel(key)}</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="colors-section">
        <h3>Other Colors</h3>
        <div className="color-grid">
          {Object.entries(themeData.colors).filter(([key]) => 
            key.startsWith('selection') || key.startsWith('shadow') || key.startsWith('scrollbar') || key.startsWith('accent')
          ).map(([key, value]) => (
            <div key={key} className="color-input-group">
              <label>{getColorLabel(key)}</label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                />
                <input
                  type="text"
                  value={value}
                  onChange={(e) => updateThemeData(`colors.${key}`, e.target.value)}
                  placeholder="#000000"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderTypographyTab = () => (
    <div className="theme-builder-tab">
      <div className="typography-section">
        <h3>Font Families</h3>
        <div className="form-group">
          <label>Base Font Family</label>
          <input
            type="text"
            value={themeData.typography.fontFamilyBase}
            onChange={(e) => updateThemeData('typography.fontFamilyBase', e.target.value)}
            placeholder="Arial, sans-serif"
          />
        </div>
        
        <div className="form-group">
          <label>Heading Font Family</label>
          <input
            type="text"
            value={themeData.typography.fontFamilyHeading}
            onChange={(e) => updateThemeData('typography.fontFamilyHeading', e.target.value)}
            placeholder="Georgia, serif"
          />
        </div>
        
        <div className="form-group">
          <label>Monospace Font Family</label>
          <input
            type="text"
            value={themeData.typography.fontFamilyMono}
            onChange={(e) => updateThemeData('typography.fontFamilyMono', e.target.value)}
            placeholder="Consolas, monospace"
          />
        </div>
      </div>
      
      <div className="typography-section">
        <h3>Font Sizes</h3>
        <div className="form-grid">
          {Object.entries(themeData.typography).filter(([key]) => key.startsWith('fontSize')).map(([key, value]) => (
            <div key={key} className="form-group">
              <label>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => updateThemeData(`typography.${key}`, parseFloat(e.target.value))}
                  step="0.1"
                  min="0.5"
                  max="10"
                />
                <span className="unit">rem</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="typography-section">
        <h3>Font Weights</h3>
        <div className="form-grid">
          {Object.entries(themeData.typography).filter(([key]) => key.startsWith('fontWeight')).map(([key, value]) => (
            <div key={key} className="form-group">
              <label>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</label>
              <select
                value={value}
                onChange={(e) => updateThemeData(`typography.${key}`, parseInt(e.target.value))}
              >
                <option value={100}>Thin (100)</option>
                <option value={200}>Extra Light (200)</option>
                <option value={300}>Light (300)</option>
                <option value={400}>Normal (400)</option>
                <option value={500}>Medium (500)</option>
                <option value={600}>Semi Bold (600)</option>
                <option value={700}>Bold (700)</option>
                <option value={800}>Extra Bold (800)</option>
                <option value={900}>Black (900)</option>
              </select>
            </div>
          ))}
        </div>
      </div>
      
      <div className="typography-section">
        <h3>Line Heights</h3>
        <div className="form-grid">
          {Object.entries(themeData.typography).filter(([key]) => key.startsWith('lineHeight')).map(([key, value]) => (
            <div key={key} className="form-group">
              <label>{key.replace(/([A-Z])/g, ' $1').toLowerCase()}</label>
              <input
                type="number"
                value={value}
                onChange={(e) => updateThemeData(`typography.${key}`, parseFloat(e.target.value))}
                step="0.1"
                min="0.8"
                max="3"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSpacingTab = () => (
    <div className="theme-builder-tab">
      <div className="spacing-section">
        <h3>Spacing Scale</h3>
        <div className="form-grid">
          {Object.entries(themeData.spacing).map(([key, value]) => (
            <div key={key} className="form-group">
              <label>{key.toUpperCase()}</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => updateThemeData(`spacing.${key}`, parseFloat(e.target.value))}
                  step="0.25"
                  min="0"
                  max="10"
                />
                <span className="unit">rem</span>
              </div>
              <div className="spacing-preview" style={{ width: `${value * 16}px`, height: '8px' }} />
            </div>
          ))}
        </div>
      </div>
      
      <div className="spacing-section">
        <h3>Border Radius</h3>
        <div className="form-grid">
          {Object.entries(themeData.borderRadius).map(([key, value]) => (
            <div key={key} className="form-group">
              <label>{key}</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => updateThemeData(`borderRadius.${key}`, parseInt(e.target.value))}
                  min="0"
                  max="50"
                />
                <span className="unit">px</span>
              </div>
              <div 
                className="border-radius-preview" 
                style={{ borderRadius: `${value}px` }} 
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderComponentsTab = () => (
    <div className="theme-builder-tab">
      <div className="components-section">
        <h3>Header Settings</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Height</label>
            <input
              type="text"
              value={themeData.components.header.height}
              onChange={(e) => updateThemeData('components.header.height', e.target.value)}
              placeholder="80px"
            />
          </div>
          
          <div className="form-group">
            <label>Padding</label>
            <input
              type="text"
              value={themeData.components.header.padding}
              onChange={(e) => updateThemeData('components.header.padding', e.target.value)}
              placeholder="1rem"
            />
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={themeData.components.header.shadow}
                onChange={(e) => updateThemeData('components.header.shadow', e.target.checked)}
              />
              Show Shadow
            </label>
          </div>
          
          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={themeData.components.header.sticky}
                onChange={(e) => updateThemeData('components.header.sticky', e.target.checked)}
              />
              Sticky Header
            </label>
          </div>
        </div>
      </div>
      
      <div className="components-section">
        <h3>Button Settings</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Padding X</label>
            <input
              type="text"
              value={themeData.components.button.paddingX}
              onChange={(e) => updateThemeData('components.button.paddingX', e.target.value)}
              placeholder="1rem"
            />
          </div>
          
          <div className="form-group">
            <label>Padding Y</label>
            <input
              type="text"
              value={themeData.components.button.paddingY}
              onChange={(e) => updateThemeData('components.button.paddingY', e.target.value)}
              placeholder="0.5rem"
            />
          </div>
          
          <div className="form-group">
            <label>Border Radius</label>
            <select
              value={themeData.components.button.borderRadius}
              onChange={(e) => updateThemeData('components.button.borderRadius', e.target.value)}
            >
              {Object.keys(themeData.borderRadius).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="components-section">
        <h3>Card Settings</h3>
        <div className="form-grid">
          <div className="form-group">
            <label>Padding</label>
            <input
              type="text"
              value={themeData.components.card.padding}
              onChange={(e) => updateThemeData('components.card.padding', e.target.value)}
              placeholder="1.5rem"
            />
          </div>
          
          <div className="form-group">
            <label>Border Radius</label>
            <select
              value={themeData.components.card.borderRadius}
              onChange={(e) => updateThemeData('components.card.borderRadius', e.target.value)}
            >
              {Object.keys(themeData.borderRadius).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Shadow</label>
            <select
              value={themeData.components.card.shadow}
              onChange={(e) => updateThemeData('components.card.shadow', e.target.value)}
            >
              {Object.keys(themeData.shadows).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedTab = () => (
    <div className="theme-builder-tab">
      <div className="advanced-section">
        <h3>Breakpoints</h3>
        <div className="form-grid">
          {Object.entries(themeData.breakpoints).map(([key, value]) => (
            <div key={key} className="form-group">
              <label>{key.toUpperCase()}</label>
              <div className="input-with-unit">
                <input
                  type="number"
                  value={value}
                  onChange={(e) => updateThemeData(`breakpoints.${key}`, parseInt(e.target.value))}
                  min="0"
                  max="2000"
                />
                <span className="unit">px</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="advanced-section">
        <h3>Transitions</h3>
        <div className="form-grid">
          {Object.entries(themeData.transitions).map(([key, value]) => (
            <div key={key} className="form-group">
              <label>{key}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => updateThemeData(`transitions.${key}`, e.target.value)}
                placeholder="0.3s ease"
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="advanced-section">
        <h3>Shadows</h3>
        <div className="form-grid">
          {Object.entries(themeData.shadows).map(([key, value]) => (
            <div key={key} className="form-group">
              <label>{key}</label>
              <input
                type="text"
                value={value}
                onChange={(e) => updateThemeData(`shadows.${key}`, e.target.value)}
                placeholder="0 4px 6px rgba(0, 0, 0, 0.1)"
              />
              <div className="shadow-preview" style={{ boxShadow: value }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="theme-builder">
      <div className="theme-builder-header">
        <h2>Theme Builder</h2>
        <div className="theme-builder-actions">
          <button 
            className="btn btn-secondary" 
            onClick={() => setShowImportModal(true)}
            disabled={isLoading}
          >
            📥 Import Theme
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleExportTheme}
            disabled={isLoading}
          >
            📤 Export Theme
          </button>
          <button 
            className={`btn ${previewMode ? 'btn-warning' : 'btn-info'}`}
            onClick={handlePreview}
            disabled={isLoading}
          >
            {previewMode ? '🛑 Stop Preview' : '👁️ Preview Theme'}
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSaveTheme}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loading-spinner-btn"></span>
                Saving...
              </>
            ) : (
              <>💾 Save Theme</>
            )}
          </button>
        </div>
      </div>
      
      {errors.length > 0 && (
        <div className="error-list">
          {errors.map((error, index) => (
            <div key={index} className="error-item">{error}</div>
          ))}
        </div>
      )}
      
      <div className="theme-builder-tabs">
        <button 
          className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveTab('basic')}
        >
          Basic Info
        </button>
        <button 
          className={`tab ${activeTab === 'colors' ? 'active' : ''}`}
          onClick={() => setActiveTab('colors')}
        >
          Colors
        </button>
        <button 
          className={`tab ${activeTab === 'typography' ? 'active' : ''}`}
          onClick={() => setActiveTab('typography')}
        >
          Typography
        </button>
        <button 
          className={`tab ${activeTab === 'spacing' ? 'active' : ''}`}
          onClick={() => setActiveTab('spacing')}
        >
          Spacing
        </button>
        <button 
          className={`tab ${activeTab === 'components' ? 'active' : ''}`}
          onClick={() => setActiveTab('components')}
        >
          Components
        </button>
        <button 
          className={`tab ${activeTab === 'advanced' ? 'active' : ''}`}
          onClick={() => setActiveTab('advanced')}
        >
          Advanced
        </button>
      </div>
      
      <div className="theme-builder-content">
        {activeTab === 'basic' && renderBasicTab()}
        {activeTab === 'colors' && renderColorsTab()}
        {activeTab === 'typography' && renderTypographyTab()}
        {activeTab === 'spacing' && renderSpacingTab()}
        {activeTab === 'components' && renderComponentsTab()}
        {activeTab === 'advanced' && renderAdvancedTab()}
      </div>

      {showImportModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Import Theme</h3>
              <button 
                className="modal-close" 
                onClick={() => {
                  setShowImportModal(false);
                  setImportData('');
                  setSelectedFile(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="import-methods">
                <div className="method-tabs">
                  <button 
                    className={`method-tab ${importMethod === 'file' ? 'active' : ''}`}
                    onClick={() => setImportMethod('file')}
                  >
                    📁 Upload JSON File
                  </button>
                  <button 
                    className={`method-tab ${importMethod === 'text' ? 'active' : ''}`}
                    onClick={() => setImportMethod('text')}
                  >
                    📋 Paste JSON Text
                  </button>
                </div>
              </div>

              {importMethod === 'file' ? (
                <div className="file-import-section">
                  <div className="import-instructions">
                    <p><strong>How to import from file:</strong></p>
                    <ol>
                      <li>Click "Choose File" and select your theme JSON file</li>
                      <li>File will be validated automatically</li>
                      <li>Click "Import" to load the theme</li>
                    </ol>
                  </div>
                  
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleFileSelect}
                      id="theme-file-input"
                      className="file-input"
                    />
                    <label htmlFor="theme-file-input" className="file-input-label">
                      {selectedFile ? (
                        <>
                          <span className="file-icon">📄</span>
                          <span className="file-name">{selectedFile.name}</span>
                          <span className="file-size">({(selectedFile.size / 1024).toFixed(1)}KB)</span>
                        </>
                      ) : (
                        <>
                          <span className="upload-icon">📁</span>
                          <span>Choose JSON File</span>
                        </>
                      )}
                    </label>
                  </div>
                  
                  <div className="import-status">
                    {selectedFile ? (
                      <div className="status-indicator">
                        <span className="status-valid">✅ File ready for import</span>
                      </div>
                    ) : (
                      <div className="status-indicator">
                        <span className="status-waiting">📁 Please select a JSON file...</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-import-section">
                  <div className="import-instructions">
                    <p><strong>How to import from text:</strong></p>
                    <ol>
                      <li>Paste your theme JSON data in the text area below</li>
                      <li>Make sure the JSON format is valid</li>
                      <li>Click "Import" to load the theme</li>
                    </ol>
                  </div>
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste your theme JSON here...

Example:
{
  &quot;name&quot;: &quot;My Custom Theme&quot;,
  &quot;id&quot;: &quot;my-custom-theme&quot;,
  &quot;colors&quot;: {
    &quot;primary&quot;: &quot;#007bff&quot;,
    ...
  }
}"
                    rows="15"
                    className={`import-textarea ${importData.trim() ? 'has-content' : ''}`}
                  />
                  <div className="import-status">
                    {importData.trim() ? (
                      <div className="status-indicator">
                        {(() => {
                          try {
                            JSON.parse(importData);
                            return <span className="status-valid">✅ Valid JSON format</span>;
                          } catch {
                            return <span className="status-invalid">❌ Invalid JSON format</span>;
                          }
                        })()}
                      </div>
                    ) : (
                      <div className="status-indicator">
                        <span className="status-waiting">📋 Waiting for theme data...</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setShowImportModal(false);
                  setImportData('');
                  setSelectedFile(null);
                }}
              >
                Cancel
              </button>
              <button 
                className={`btn btn-primary ${
                  (importMethod === 'file' && !selectedFile) || 
                  (importMethod === 'text' && !importData.trim()) ? 'disabled' : ''
                }`}
                onClick={handleImportTheme}
                disabled={
                  (importMethod === 'file' && !selectedFile) || 
                  (importMethod === 'text' && !importData.trim())
                }
              >
                Import Theme
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeBuilder;