import React from 'react';

// Try to import THEMES, fallback to empty object if not available
let THEMES = {};
try {
  const themesModule = require('../themes/index');
  THEMES = themesModule.THEMES || {};
} catch (error) {
  console.warn('Could not import THEMES, using fallback themes only');
}

// FALLBACK themes for safe access
const FALLBACK_THEMES = {
  default: {
    id: 'default',
    name: 'Light',
    colors: {
      primary: '#007bff',
      primaryHover: '#0056b3',
      textPrimary: '#212529',
      textSecondary: '#6c757d',
      bgPrimary: '#ffffff',
      bgSecondary: '#f8f9fa',
      borderColor: '#dee2e6',
      cardBg: '#ffffff',
      shadowColor: 'rgba(0,0,0,0.1)'
    }
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#4dabf7',
      primaryHover: '#339af0',
      textPrimary: '#f0f6fc',
      textSecondary: '#8b949e',
      bgPrimary: '#0d1117',
      bgSecondary: '#21262d',
      borderColor: '#30363d',
      cardBg: '#161b22',
      shadowColor: 'rgba(0,0,0,0.3)'
    }
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    colors: {
      primary: '#1976d2',
      primaryHover: '#115293',
      textPrimary: '#0d47a1',
      textSecondary: '#1565c0',
      bgPrimary: '#e3f2fd',
      bgSecondary: '#bbdefb',
      borderColor: '#90caf9',
      cardBg: '#ffffff',
      shadowColor: 'rgba(25,118,210,0.1)'
    }
  },
  green: {
    id: 'green',
    name: 'Green',
    colors: {
      primary: '#388e3c',
      primaryHover: '#2e7d32',
      textPrimary: '#1b5e20',
      textSecondary: '#2e7d32',
      bgPrimary: '#e8f5e8',
      bgSecondary: '#c8e6c9',
      borderColor: '#a5d6a7',
      cardBg: '#ffffff',
      shadowColor: 'rgba(56,142,60,0.1)'
    }
  }
};

const ThemePreviewModal = ({ themeId, onClose, onApply }) => {
  
  // Try to get theme from THEMES first, then fallback
  let theme = THEMES?.[themeId] || FALLBACK_THEMES[themeId] || FALLBACK_THEMES.default;
  
  if (!theme) {
    console.error(`Theme not found: ${themeId}, using default`);
    theme = FALLBACK_THEMES.default;
  }

  // Ensure colors object exists with fallback
  const colors = theme.colors || FALLBACK_THEMES.default.colors;

  const previewStyles = {
    '--primary-color': colors.primary || '#007bff',
    '--primary-hover': colors.primaryHover || '#0056b3',
    '--text-primary': colors.textPrimary || '#212529',
    '--text-secondary': colors.textSecondary || '#6c757d',
    '--bg-primary': colors.bgPrimary || '#ffffff',
    '--bg-secondary': colors.bgSecondary || '#f8f9fa',
    '--border-color': colors.borderColor || '#dee2e6',
    '--card-bg': colors.cardBg || '#ffffff',
    '--shadow-color': colors.shadowColor || 'rgba(0,0,0,0.1)',
  };

  return (
    <div className="theme-preview-overlay" onClick={() => onClose && onClose()}>
      <div className="theme-preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="theme-preview-header">
          <h3>Theme Preview: {theme.name || 'Unknown Theme'}</h3>
          <button className="close-button" onClick={() => onClose && onClose()}>×</button>
        </div>
        
        <div className="theme-preview-content" style={previewStyles}>
          <div className="preview-section">
            <h4>Colors & Typography</h4>
            <div className="preview-colors">
              <div className="color-sample primary">Primary</div>
              <div className="color-sample secondary">Secondary</div>
              <div className="color-sample success">Success</div>
              <div className="color-sample warning">Warning</div>
              <div className="color-sample error">Error</div>
            </div>
          </div>
          
          <div className="preview-section">
            <h4>Components</h4>
            <div className="preview-components">
              <button className="btn btn-primary">Primary Button</button>
              <button className="btn btn-secondary">Secondary Button</button>
              
              <div className="preview-card">
                <h5>Sample Card</h5>
                <p>This is how cards will look with this theme.</p>
                <div className="card-actions">
                  <button className="btn btn-outline">Learn More</button>
                </div>
              </div>
              
              <div className="preview-form">
                <input type="text" placeholder="Sample input field" />
                <textarea placeholder="Sample textarea"></textarea>
              </div>
            </div>
          </div>
          
          <div className="preview-section">
            <h4>Navigation</h4>
            <div className="preview-nav">
              <ul>
                <li><button className="nav-link active">Home</button></li>
                <li><button className="nav-link">Products</button></li>
                <li><button className="nav-link">Categories</button></li>
                <li><button className="nav-link">About</button></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="theme-preview-actions">
          <button className="btn btn-secondary" onClick={() => onClose && onClose()}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => onApply && onApply(themeId || 'default')}>
            Apply Theme
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThemePreviewModal; 