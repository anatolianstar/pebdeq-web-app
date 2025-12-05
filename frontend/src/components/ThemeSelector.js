import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import ThemePreviewModal from './ThemePreview';
import themeService from '../services/ThemeService';
import { BUILTIN_THEMES } from '../models/ThemeModel';
import './ThemeSelector.css';
import './ThemePreview.css';

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
    deleteCustomTheme,
    refreshCustomThemes,
    
    // Enhanced admin/user system
    userIsAdmin,
    userDefaultTheme,
    getThemeDisplayName,
    getFilteredThemes
  } = useTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [isChanging, setIsChanging] = useState(false);
  const [previewTheme, setPreviewTheme] = useState(null);
  const [transitionState, setTransitionState] = useState('idle'); // idle, loading, transitioning
  const dropdownRef = useRef(null);

  // Listen for theme changes and reset loading state for all selectors
  useEffect(() => {
    const handleThemeCSSLoaded = (event) => {
      const { themeId } = event.detail;
      console.log(`🎨 CSS loaded for theme: ${themeId}`);
      setTransitionState('idle');
      setIsChanging(false);
    };

    const handleThemeChanged = (event) => {
      const { theme } = event.detail;
      console.log(`🎯 Theme changed event: ${theme?.id || 'unknown'}`);
    };

    // Listen for global theme change events from ThemeContext
    const handleThemeChangeStart = (event) => {
      const { themeId, from } = event.detail;
      console.log(`🔄 Global theme change start: ${from} → ${themeId}`);
      setTransitionState('loading');
      setIsChanging(true);
    };

    const handleThemeChangeComplete = (event) => {
      const { themeId } = event.detail;
      console.log(`✅ Global theme change complete: ${themeId}`);
      setTransitionState('idle');
      setIsChanging(false);
    };

    const handleThemeChangeError = (event) => {
      const { themeId, error } = event.detail;
      console.log(`❌ Global theme change error for ${themeId}:`, error);
      setTransitionState('idle');
      setIsChanging(false);
    };

    window.addEventListener('themeCSSLoaded', handleThemeCSSLoaded);
    window.addEventListener('themeChanged', handleThemeChanged);
    window.addEventListener('themeChangeStart', handleThemeChangeStart);
    window.addEventListener('themeChangeComplete', handleThemeChangeComplete);
    window.addEventListener('themeChangeError', handleThemeChangeError);

    return () => {
      window.removeEventListener('themeCSSLoaded', handleThemeCSSLoaded);
      window.removeEventListener('themeChanged', handleThemeChanged);
      window.removeEventListener('themeChangeStart', handleThemeChangeStart);
      window.removeEventListener('themeChangeComplete', handleThemeChangeComplete);
      window.removeEventListener('themeChangeError', handleThemeChangeError);
    };
  }, []);

  // Get current theme info from theme service
  const currentThemeInfo = themeService.getTheme(currentTheme) || 
    themeService.getTheme('pq-light') || 
    { id: currentTheme, name: currentTheme, icon: '🎨', type: 'custom', colors: {} };

  // Get all available themes with admin/user filtering
  const allAvailableThemes = themeService.getAllThemes();
  const filteredThemes = getFilteredThemes ? getFilteredThemes() : allAvailableThemes;

  // Separate built-in and custom themes with admin/user context
  const builtinThemes = filteredThemes.filter(t => t.type === 'builtin');
  const customThemes = filteredThemes.filter(t => t.type === 'custom' || t.type === 'imported');
  
  // Transform theme names for display
  const transformThemeForDisplay = (theme) => {
    if (!getThemeDisplayName) return theme;
    
    return {
      ...theme,
      displayName: getThemeDisplayName(theme),
      isUserDefault: theme.id === userDefaultTheme?.themeId && theme.type === 'custom'
    };
  };
  
  // Note: Debug logs removed to prevent console spam

  // Theme service observer
  useEffect(() => {
    const unsubscribe = themeService.addObserver((event, data) => {
      switch (event) {
        case 'themeChangeStart':
          setTransitionState('transitioning');
          break;
        case 'themeChangeComplete':
          setTransitionState('idle');
          break;
        case 'themeChangeError':
          setTransitionState('idle');
          console.error('Theme change error:', data.error);
          break;
        default:
          break;
      }
    });

    return unsubscribe;
  }, []);

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

  // Handle theme change with enhanced UX and cache busting
  const handleThemeChange = async (themeId) => {
    if (themeId === currentTheme || isChanging || isUpdatingSiteSettings) return;
    
    setIsChanging(true);
    setTransitionState('loading');
    setIsOpen(false);
    
    try {
      console.log(`🎨 Switching theme to: ${themeId}`);
      
      // Delegate switching directly to ThemeContext to prevent double-loading
      await changeTheme(themeId);
      localStorage.setItem('selectedTheme', themeId);
      setTransitionState('idle');
    } catch (error) {
      console.error('Failed to change theme:', error);
      setTransitionState('idle');
      
      // Fallback: emergency cache clear + direct context change, then reload
      console.log('🧹 Attempting emergency CSS cache clear...');
      themeService.forceClearCSSCache();
      try {
        await changeTheme(themeId);
      } catch (finalError) {
        console.warn('Final fallback reload');
        localStorage.setItem('selectedTheme', themeId);
        window.location.reload();
      }
    } finally {
      // Reset UI state after a short delay
      setTimeout(() => {
        setIsChanging(false);
      }, 300);
    }
  };

  // Handle custom theme deletion
  const handleDeleteCustomTheme = async (themeId, themeName, event) => {
    event.stopPropagation(); // Prevent theme selection
    
    const confirmed = window.confirm(
      `Are you sure you want to delete the custom theme "${themeName}"?\n\nThis action cannot be undone.`
    );
    
    if (confirmed) {
      try {
        const success = await deleteCustomTheme(themeId);
        if (success) {
          console.log(`✅ Custom theme "${themeName}" deleted successfully`);
          // Refresh custom themes after deletion
          if (refreshCustomThemes) {
            await refreshCustomThemes();
          }
        } else {
          console.error(`❌ Failed to delete theme "${themeName}"`);
          alert(`Failed to delete theme "${themeName}". Please try again.`);
        }
      } catch (error) {
        console.error(`❌ Error deleting theme "${themeName}":`, error);
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

  const isLoading = isChanging || isUpdatingSiteSettings || transitionState !== 'idle';

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
                  {(() => {
                    if (transitionState === 'loading') return 'Loading theme...';
                    if (transitionState === 'transitioning') return 'Applying theme...';
                    if (isChanging) return 'Updating...';
                    if (isUpdatingSiteSettings) return 'Updating settings...';
                    return currentThemeInfo.name;
                  })()}
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
            {/* Built-in Themes Section - Always at top */}
            <div className="theme-selector__section theme-selector__section--builtin">
              <div className="theme-selector__section-header">
                <span className="theme-selector__section-title">Built-in Themes</span>
                <span className="theme-selector__section-badge">System</span>
              </div>
              {builtinThemes.map((theme) => {
                const displayTheme = transformThemeForDisplay(theme);
                return (
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
                    <span className="theme-selector__option-icon" role="img" aria-label={displayTheme.displayName || theme.name}>
                      {theme.icon}
                    </span>
                    <div className="theme-selector__option-content">
                      <span className="theme-selector__option-name">
                        {displayTheme.displayName || theme.name}
                        {displayTheme.isUserDefault && (
                          <span style={{ 
                            marginLeft: '0.5rem', 
                            fontSize: '0.7rem', 
                            background: 'var(--primary-color)', 
                            color: 'white', 
                            padding: '0.1rem 0.3rem', 
                            borderRadius: '3px' 
                          }}>
                            DEFAULT
                          </span>
                        )}
                      </span>
                      <span className="theme-selector__option-description">{theme.description}</span>
                    </div>
                    <div className="theme-selector__option-colors">
                      {(() => {
                        const previewColors = theme.getPreviewColors ? theme.getPreviewColors() : theme.colors || {};
                        return (
                          <>
                            <div 
                              className="theme-selector__color-preview"
                              style={{ backgroundColor: previewColors.primary || '#007bff' }}
                              aria-hidden="true"
                              title="Primary color"
                            />
                            <div 
                              className="theme-selector__color-preview"
                              style={{ backgroundColor: previewColors.background || '#ffffff' }}
                              aria-hidden="true"
                              title="Background color"
                            />
                            <div 
                              className="theme-selector__color-preview"
                              style={{ backgroundColor: previewColors.text || '#000000' }}
                              aria-hidden="true"
                              title="Text color"
                            />
                            <div 
                              className="theme-selector__color-preview"
                              style={{ backgroundColor: previewColors.accent || '#17a2b8' }}
                              aria-hidden="true"
                              title="Accent color"
                            />
                          </>
                        );
                      })()}
                    </div>
                    <span
                      className="theme-selector__preview-btn"
                      onClick={(e) => handlePreview(theme.id, e)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handlePreview(theme.id, e);
                        }
                      }}
                      aria-label={`Preview ${displayTheme.displayName || theme.name} theme`}
                      title={`Preview ${displayTheme.displayName || theme.name} theme`}
                      role="button"
                      tabIndex="0"
                    >
                      👁️
                    </span>
                    {theme.id === currentTheme && (
                      <span className="theme-selector__checkmark" aria-label="Currently selected">
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Themes Section - Always at bottom */}
            {!hideCustomThemes && (
              <div className="theme-selector__section theme-selector__section--custom">
                <div className="theme-selector__section-header">
                  <span className="theme-selector__section-title">Custom Themes</span>
                  <div className="theme-selector__section-info">
                    <span className="theme-selector__section-count">({customThemes.length})</span>
                    <span className="theme-selector__section-badge">Editable</span>
                  </div>
                </div>
                {customThemes.length === 0 ? (
                  <div style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                    {userIsAdmin ? 'No custom themes yet' : 'No additional themes available'}
                  </div>
                ) : customThemes.map((theme) => {
                  const displayTheme = transformThemeForDisplay(theme);
                  return (
                  <div
                    key={theme.id}
                    className={`theme-selector__option theme-selector__option--custom-card ${
                      theme.id === currentTheme ? 'theme-selector__option--active' : ''
                    }`}
                  >
                    {/* Tema Adı - Üstte Ortada */}
                    <div className="custom-theme-header">
                      <span className="theme-selector__option-icon" role="img" aria-label={displayTheme.displayName || theme.name}>
                        {theme.icon}
                      </span>
                      <span className="custom-theme-name">
                        {displayTheme.displayName || theme.name}
                        {displayTheme.isUserDefault && (
                          <span style={{ 
                            marginLeft: '0.5rem', 
                            fontSize: '0.6rem', 
                            background: 'var(--primary-color)', 
                            color: 'white', 
                            padding: '0.1rem 0.3rem', 
                            borderRadius: '3px',
                            display: 'block',
                            marginTop: '0.2rem'
                          }}>
                            DEFAULT
                          </span>
                        )}
                      </span>
                      {theme.id === currentTheme && (
                        <span className="theme-selector__checkmark" aria-label="Currently selected">
                          ✓
                        </span>
                      )}
                    </div>

                    {/* Açıklama */}
                    <div className="custom-theme-description">
                      {displayTheme.isUserDefault 
                        ? 'Default theme set by administrator'
                        : (theme.description || 'Imported custom theme')
                      }
                    </div>

                    {/* Ana Seçim Butonu */}
                    <button
                      className="custom-theme-select-btn"
                      onClick={() => handleThemeChange(theme.id)}
                      disabled={theme.id === currentTheme}
                      style={{
                        background: theme.id === currentTheme ? 'var(--success-color, #28a745)' : 'var(--primary-color, #007bff)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '8px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: theme.id === currentTheme ? 'default' : 'pointer',
                        margin: '8px 0'
                      }}
                    >
                      {theme.id === currentTheme ? '✓ Active' : 'Select Theme'}
                    </button>

                    {/* Action Butonları - Altta */}
                    <div className="custom-theme-actions">
                      <button
                        className="theme-selector__preview-btn"
                        onClick={(e) => handlePreview(theme.id, e)}
                        aria-label={`Preview ${theme.name} theme`}
                        title={`Preview ${theme.name} theme`}
                        style={{
                          background: 'var(--info-color, #17a2b8)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          marginRight: '8px'
                        }}
                      >
                        👁️ Preview
                      </button>
                      <button
                        className="theme-selector__delete-btn"
                        onClick={(e) => handleDeleteCustomTheme(theme.id, theme.name, e)}
                        aria-label={`Delete ${theme.name} theme`}
                        title={`Delete ${theme.name} theme`}
                        style={{
                          background: 'var(--danger-color, #dc3545)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  );
                })}
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
    const newTheme = currentTheme === 'pq-dark' ? 'pq-light' : 'pq-dark';
    try {
      await changeTheme(newTheme);
    } catch (error) {
      console.error('Failed to toggle theme:', error);
    }
  };

  const currentThemeInfo = themeService.getTheme(currentTheme) || {
    name: 'Current Theme',
    icon: '🎨'
  };

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
  const theme = themeService.getTheme(themeId);
  
  if (!theme) return null;

  const isActive = themeId === currentTheme;
  const previewColors = theme.getPreviewColors ? theme.getPreviewColors() : theme.colors || {};

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
        {Object.entries(previewColors).map(([key, color]) => (
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

  // Get all available themes from theme service
  const availableThemes = themeService.getAllThemes();

  return (
    <div className="theme-gallery">
      <div className="theme-gallery__grid">
        {availableThemes.map((theme) => (
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