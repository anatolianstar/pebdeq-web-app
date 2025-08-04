import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ThemePreviewModal from './ThemePreview';
import './ThemeSelector.css';
import './ThemePreview.css';

// Theme definitions for built-in themes (fallback)
const FALLBACK_THEMES = {
  default: {
    id: 'default',
    name: 'Light',
    description: 'Clean light theme',
    icon: '☀️',
    type: 'builtin',
    colors: {
      primary: '#007bff',
      background: '#ffffff',
      text: '#212529'
    }
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    description: 'Dark theme for low light',
    icon: '🌙',
    type: 'builtin',
    colors: {
      primary: '#4dabf7',
      background: '#0d1117',
      text: '#f0f6fc'
    }
  },
  blue: {
    id: 'blue',
    name: 'Blue',
    description: 'Professional blue theme',
    icon: '💙',
    type: 'builtin',
    colors: {
      primary: '#1976d2',
      background: '#e3f2fd',
      text: '#0d47a1'
    }
  },
  green: {
    id: 'green',
    name: 'Green',
    description: 'Natural green theme',
    icon: '🌱',
    type: 'builtin',
    colors: {
      primary: '#388e3c',
      background: '#e8f5e8',
      text: '#1b5e20'
    }
  }
};

const ThemeSelector = ({ 
  showLabel = true, 
  size = 'normal', 
  position = 'auto',
  className = '',
  iconOnly = false,
  hideCustomThemes = false
}) => {
  const {
    currentTheme,
    changeTheme,
    isUpdatingSiteSettings,
    builtInThemes,
    customThemes: contextCustomThemes,
    deleteCustomTheme
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [previewTheme, setPreviewTheme] = useState(null);
  const dropdownRef = useRef(null);

  // Get current theme info from context themes or fallback
  const allThemes = [...(builtInThemes || []), ...(contextCustomThemes || [])];
  const currentThemeInfo = allThemes.find(theme => theme.id === currentTheme) || 
                           FALLBACK_THEMES[currentTheme] || 
                           FALLBACK_THEMES.default;

  // Separate built-in and custom themes
  const builtinThemes = builtInThemes || Object.values(FALLBACK_THEMES);
  const customThemes = contextCustomThemes || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle theme change
  const handleThemeChange = async (themeId) => {
    if (themeId === currentTheme || isChanging || isUpdatingSiteSettings) return;
    
    setIsChanging(true);
    setIsOpen(false);
    
    try {
      await changeTheme(themeId);
      console.log(`✅ Theme changed to: ${themeId}`);
    } catch (error) {
      console.error('Failed to change theme:', error);
    } finally {
      setIsChanging(false);
    }
  };

  // Handle custom theme deletion
  const handleDeleteCustomTheme = (themeId, themeName, event) => {
    event.stopPropagation(); // Prevent theme selection
    
    const confirmed = window.confirm(
      `Are you sure you want to delete the custom theme "${themeName}"?\n\nThis action cannot be undone.`
    );
    
    if (confirmed) {
      const success = deleteCustomTheme(themeId);
      if (success) {
        console.log(`✅ Custom theme "${themeName}" deleted successfully`);
        // Optional: Add a success message or toast here
        // For now using console message, can be enhanced with toast library
      } else {
        console.error(`❌ Failed to delete theme "${themeName}"`);
        alert(`Failed to delete theme "${themeName}". Please try again.`);
      }
    }
  };

  // Handle preview
  const handlePreview = (themeId, event) => {
    event.stopPropagation();
    setPreviewTheme(themeId);
    setIsOpen(false);
  };

  const handleClosePreview = () => {
    setPreviewTheme(null);
  };

  const handleApplyFromPreview = async (themeId) => {
    setPreviewTheme(null);
    await handleThemeChange(themeId);
  };

  const getClassName = () => {
    const baseClass = 'theme-selector';
    const classes = [baseClass, className];
    
    if (size === 'small') classes.push(`${baseClass}--small`);
    if (size === 'large') classes.push(`${baseClass}--large`);
    if (iconOnly) classes.push(`${baseClass}--icon-only`);
    if (isOpen) classes.push(`${baseClass}--open`);
    if (isChanging || isUpdatingSiteSettings) classes.push(`${baseClass}--loading`);
    
    return classes.filter(Boolean).join(' ');
  };

  const isLoading = isChanging || isUpdatingSiteSettings;

  return (
    <>
      <div className={getClassName()} ref={dropdownRef}>
        <button
          className="theme-selector__trigger"
          onClick={() => !isLoading && setIsOpen(!isOpen)}
          disabled={isLoading}
          aria-label={`Current theme: ${currentThemeInfo.name}. Click to change theme.`}
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          title={isLoading ? 'Updating theme...' : `Current theme: ${currentThemeInfo.name}`}
        >
          <span className="theme-selector__icon" role="img" aria-label={currentThemeInfo.name}>
            {isLoading ? '⏳' : currentThemeInfo.icon}
          </span>
          
          {!iconOnly && (
            <>
              {showLabel && (
                <span className="theme-selector__label">
                  {isLoading ? 'Updating...' : currentThemeInfo.name}
                </span>
              )}
              <span className="theme-selector__arrow" aria-hidden="true">
                {isOpen ? '▲' : '▼'}
              </span>
            </>
          )}
        </button>

        {isOpen && !isLoading && (
          <div 
            className="theme-selector__dropdown"
            role="listbox"
            aria-label="Available themes"
          >
            {/* Built-in Themes Section */}
            <div className="theme-selector__section">
              <div className="theme-selector__section-header">
                <span className="theme-selector__section-title">Built-in Themes</span>
              </div>
              {builtinThemes.map((theme) => (
                <button
                  key={theme.id}
                  className={`theme-selector__option ${
                    theme.id === currentTheme ? 'theme-selector__option--active' : ''
                  }`}
                  onClick={() => handleThemeChange(theme.id)}
                  disabled={theme.id === currentTheme}
                  role="option"
                  aria-selected={theme.id === currentTheme}
                  title={theme.description}
                >
                  <span className="theme-selector__option-icon" role="img" aria-label={theme.name}>
                    {theme.icon}
                  </span>
                  <div className="theme-selector__option-content">
                    <span className="theme-selector__option-name">{theme.name}</span>
                    <span className="theme-selector__option-description">{theme.description}</span>
                  </div>
                  <div className="theme-selector__option-colors">
                    {FALLBACK_THEMES[theme.id] && (
                      <>
                        <div 
                          className="theme-selector__color-preview"
                          style={{ backgroundColor: FALLBACK_THEMES[theme.id].colors.primary }}
                          aria-hidden="true"
                        />
                        <div 
                          className="theme-selector__color-preview"
                          style={{ backgroundColor: FALLBACK_THEMES[theme.id].colors.background }}
                          aria-hidden="true"
                        />
                        <div 
                          className="theme-selector__color-preview"
                          style={{ backgroundColor: FALLBACK_THEMES[theme.id].colors.text }}
                          aria-hidden="true"
                        />
                      </>
                    )}
                  </div>
                  <button
                    className="theme-selector__preview-btn"
                    onClick={(e) => handlePreview(theme.id, e)}
                    aria-label={`Preview ${theme.name} theme`}
                    title={`Preview ${theme.name} theme`}
                  >
                    👁️
                  </button>
                  {theme.id === currentTheme && (
                    <span className="theme-selector__checkmark" aria-label="Currently selected">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Custom Themes Section */}
            {!hideCustomThemes && customThemes.length > 0 && (
              <div className="theme-selector__section">
                <div className="theme-selector__section-header">
                  <span className="theme-selector__section-title">Custom Themes</span>
                  <span className="theme-selector__section-count">({customThemes.length})</span>
                </div>
                {customThemes.map((theme) => (
                  <button
                    key={theme.id}
                    className={`theme-selector__option theme-selector__option--custom ${
                      theme.id === currentTheme ? 'theme-selector__option--active' : ''
                    }`}
                    onClick={() => handleThemeChange(theme.id)}
                    disabled={theme.id === currentTheme}
                    role="option"
                    aria-selected={theme.id === currentTheme}
                    title={theme.description || 'Custom theme'}
                  >
                    <span className="theme-selector__option-icon" role="img" aria-label={theme.name}>
                      {theme.icon}
                    </span>
                    <div className="theme-selector__option-content">
                      <span className="theme-selector__option-name">{theme.name}</span>
                      <span className="theme-selector__option-description">
                        {theme.description || 'Imported custom theme'}
                      </span>
                    </div>
                    <div className="theme-selector__option-actions">
                      <button
                        className="theme-selector__preview-btn"
                        onClick={(e) => handlePreview(theme.id, e)}
                        aria-label={`Preview ${theme.name} theme`}
                        title={`Preview ${theme.name} theme`}
                      >
                        👁️
                      </button>
                      <button
                        className="theme-selector__delete-btn"
                        onClick={(e) => handleDeleteCustomTheme(theme.id, theme.name, e)}
                        aria-label={`Delete ${theme.name} theme`}
                        title={`Delete ${theme.name} theme`}
                      >
                        🗑️
                      </button>
                    </div>
                    {theme.id === currentTheme && (
                      <span className="theme-selector__checkmark" aria-label="Currently selected">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {previewTheme && (
        <ThemePreviewModal
          themeId={previewTheme}
          onClose={handleClosePreview}
          onApply={handleApplyFromPreview}
        />
      )}
    </>
  );
};

// Quick theme toggle component for simple theme switching
export const QuickThemeToggle = ({ className = '' }) => {
  const { currentTheme, changeTheme, isUpdatingSiteSettings } = useTheme();

  const handleToggle = async () => {
    if (isUpdatingSiteSettings) return;
    
    // Simple toggle between light and dark
    const newTheme = currentTheme === 'dark' ? 'default' : 'dark';
    try {
      await changeTheme(newTheme);
    } catch (error) {
      console.error('Failed to toggle theme:', error);
    }
  };

  const currentThemeInfo = FALLBACK_THEMES[currentTheme] || FALLBACK_THEMES.default;

  return (
    <button
      className={`quick-theme-toggle ${className}`}
      onClick={handleToggle}
      disabled={isUpdatingSiteSettings}
      aria-label={`Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} theme`}
      title={`Current: ${currentThemeInfo.name}. Click to toggle.`}
    >
      <span role="img" aria-hidden="true">
        {isUpdatingSiteSettings ? '⏳' : currentThemeInfo.icon}
      </span>
    </button>
  );
};

// Theme preview card component
export const ThemePreviewCard = ({ themeId, size = 'normal', onClick }) => {
  const { currentTheme } = useTheme();
  const theme = FALLBACK_THEMES[themeId];
  
  if (!theme) return null;

  const isActive = themeId === currentTheme;

  return (
    <div
      className={`theme-preview-card theme-preview-card--${size} ${
        isActive ? 'theme-preview-card--active' : ''
      }`}
      onClick={() => onClick && onClick(themeId)}
      role="button"
      tabIndex={0}
      aria-label={`${theme.name} theme${isActive ? ' (current)' : ''}`}
    >
      <div className="theme-preview-card__header">
        <span className="theme-preview-card__icon" role="img">
          {theme.icon}
        </span>
        <span className="theme-preview-card__name">{theme.name}</span>
        {isActive && <span className="theme-preview-card__checkmark">✓</span>}
      </div>
      <div className="theme-preview-card__colors">
        {Object.entries(theme.colors).map(([key, color]) => (
          <div
            key={key}
            className="theme-preview-card__color"
            style={{ backgroundColor: color }}
            title={`${key}: ${color}`}
          />
        ))}
      </div>
      <p className="theme-preview-card__description">{theme.description}</p>
    </div>
  );
};

// Theme gallery component
export const ThemeGallery = ({ onThemeChange }) => {
  const { changeTheme, isUpdatingSiteSettings } = useTheme();

  const handleThemeSelect = async (themeId) => {
    if (isUpdatingSiteSettings) return;
    
    try {
      await changeTheme(themeId);
      if (onThemeChange) onThemeChange(themeId);
    } catch (error) {
      console.error('Failed to change theme:', error);
    }
  };

  return (
    <div className="theme-gallery">
      <div className="theme-gallery__grid">
        {Object.values(FALLBACK_THEMES).map((theme) => (
          <ThemePreviewCard
            key={theme.id}
            themeId={theme.id}
            onClick={handleThemeSelect}
          />
        ))}
      </div>
      {isUpdatingSiteSettings && (
        <div className="theme-gallery__loading">
          <p>Updating theme colors...</p>
        </div>
      )}
    </div>
  );
};

export default ThemeSelector; 