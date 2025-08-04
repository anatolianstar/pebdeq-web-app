import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { updateSiteSettingsToMatchTheme, applyThemeSyncedStyles } from '../themes/siteSettingsIntegration';
import { createApiUrl } from '../utils/config';

const ThemeContext = createContext();

// Debounce utility for performance optimization
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Cache for API responses
const cache = {
  siteSettings: null,
  lastFetch: 0,
  TTL: 30000 // 30 seconds cache
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('default');
  const [siteSettings, setSiteSettings] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isUpdatingSiteSettings, setIsUpdatingSiteSettings] = useState(false);
  const [customThemes, setCustomThemes] = useState([]);
  const [userIsAdmin, setUserIsAdmin] = useState(null);
  
  // Refs for preventing race conditions
  const isInitializingRef = useRef(false);
  const currentRequestRef = useRef(null);

  // OPTIMIZED: CSS Theme Loading - Pre-load all theme CSS files
  useEffect(() => {
    const preloadThemeCSS = () => {
      const themes = ['default', 'dark', 'blue', 'green'];
      
      themes.forEach(themeId => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'style';
        link.href = `/themes/${themeId}.css`;
        link.onload = () => {
          // Convert preload to actual stylesheet
          link.rel = 'stylesheet';
          link.setAttribute('data-theme-preload', themeId);
        };
        document.head.appendChild(link);
      });
      
      console.log('🎨 Pre-loaded all theme CSS files for instant switching');
    };

    preloadThemeCSS();
  }, []);

  // OPTIMIZED: Custom themes loading with error handling
  const loadCustomThemes = useCallback(() => {
    try {
      const storedCustomThemes = localStorage.getItem('customThemes');
      if (storedCustomThemes) {
        const parsed = JSON.parse(storedCustomThemes);
        console.log('🎨 Loaded custom themes:', parsed.length);
        setCustomThemes(parsed);
        return parsed;
      } else {
        setCustomThemes([]);
        return [];
      }
    } catch (error) {
      console.error('Error loading custom themes:', error);
      // Clear corrupted data
      localStorage.removeItem('customThemes');
      setCustomThemes([]);
      return [];
    }
  }, []);

  // OPTIMIZED: Custom theme deletion with batch updates
  const deleteCustomTheme = useCallback((themeId) => {
    try {
      console.log('🗑️ Deleting custom theme:', themeId);
      
      const storedCustomThemes = JSON.parse(localStorage.getItem('customThemes') || '[]');
      const updatedThemes = storedCustomThemes.filter(theme => theme.id !== themeId);
      
      localStorage.setItem('customThemes', JSON.stringify(updatedThemes));
      setCustomThemes(updatedThemes);
      
      // Switch to default if deleted theme was active
      if (currentTheme === themeId) {
        console.log('🔄 Switching to default theme');
        changeTheme('default');
      }
      
      // Dispatch cleanup event
      window.dispatchEvent(new CustomEvent('customThemeDeleted', { 
        detail: { themeId, remainingCount: updatedThemes.length } 
      }));
      
      return true;
    } catch (error) {
      console.error('❌ Error deleting custom theme:', error);
      return false;
    }
  }, [currentTheme]);

  // OPTIMIZED: Custom theme application with performance improvements
  const applyCustomTheme = useCallback((customThemeData) => {
    try {
      console.log('🎨 Applying custom theme:', customThemeData.name);
      
      // Clear existing custom styles efficiently
      const existingStyles = document.querySelectorAll('style[data-custom-theme]');
      existingStyles.forEach(style => style.remove());
      
      const root = document.documentElement;
      
      // Remove built-in theme attribute
      root.removeAttribute('data-theme');
      
      // Generate and apply CSS variables in one batch
      const cssVariables = generateOptimizedCSSVariables(customThemeData.data);
      
      // Batch DOM updates
      requestAnimationFrame(() => {
        Object.entries(cssVariables).forEach(([property, value]) => {
          root.style.setProperty(property, value);
        });
        
        // Set custom theme attribute
        root.setAttribute('data-theme', customThemeData.id);
        
        // Inject minimal CSS
        const css = generateMinimalCustomCSS(customThemeData.data);
        if (css) {
          const styleElement = document.createElement('style');
          styleElement.setAttribute('data-custom-theme', customThemeData.id);
          styleElement.textContent = css;
          document.head.appendChild(styleElement);
        }
        
        console.log('✅ Custom theme applied successfully');
      });
      
      // OPTIMIZED: Debounced site settings sync
      debouncedSyncCustomTheme(customThemeData);
      
    } catch (error) {
      console.error('❌ Error applying custom theme:', error);
    }
  }, []);

  // OPTIMIZED: Streamlined CSS variable generation
  const generateOptimizedCSSVariables = (themeData) => {
    const cssVariables = {};
    
    if (themeData.colors) {
      // Direct mapping for performance
      const colorMappings = {
        'primary': '--primary-color',
        'secondary': '--secondary-color',
        'backgroundPrimary': '--bg-primary',
        'backgroundSecondary': '--bg-secondary',
        'textPrimary': '--text-primary',
        'textSecondary': '--text-secondary',
        'borderColor': '--border-color',
        'header_background_color': '--header-bg',
        'header_text_color': '--header-text',
        'footer_background_color': '--footer-bg',
        'footer_text_color': '--footer-text',
        'homepage_background_color': '--homepage-bg'
      };
      
      Object.entries(themeData.colors).forEach(([key, value]) => {
        const cssKey = colorMappings[key] || `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        cssVariables[cssKey] = value;
      });
    }
    
    if (themeData.typography) {
      Object.entries(themeData.typography).forEach(([key, value]) => {
        const cssKey = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        cssVariables[cssKey] = typeof value === 'number' ? `${value}px` : value;
      });
    }
    
    return cssVariables;
  };

  // OPTIMIZED: Minimal CSS generation (avoid large CSS strings)
  const generateMinimalCustomCSS = (themeData) => {
    if (!themeData.colors) return '';
    
    // Only generate essential CSS, let CSS variables handle the rest
    return `
      /* Custom Theme Essential Overrides */
      .header { 
        background-color: var(--header-bg, ${themeData.colors.header_background_color || '#ffffff'});
        color: var(--header-text, ${themeData.colors.header_text_color || '#212529'});
      }
      .footer { 
        background-color: var(--footer-bg, ${themeData.colors.footer_background_color || '#343a40'});
        color: var(--footer-text, ${themeData.colors.footer_text_color || '#ffffff'});
      }
      .home-container { 
        background-color: var(--homepage-bg, ${themeData.colors.homepage_background_color || '#ffffff'});
      }
    `;
  };

  // OPTIMIZED: Fast CSS theme switching (no re-download)
  const loadThemeCSS = useCallback(async (themeId) => {
    try {
      console.log(`🎨 Switching to theme: ${themeId}`);
      
      // Remove custom theme styles
      const customStyles = document.querySelectorAll('style[data-custom-theme]');
      customStyles.forEach(style => style.remove());
      
      // Clear custom CSS variables
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      
      // Remove custom CSS variables (keep built-in ones)
      Array.from(root.style).forEach(property => {
        if (property.startsWith('--') && !property.includes('theme')) {
          root.style.removeProperty(property);
        }
      });
      
      // Set theme attribute instantly (CSS is already preloaded)
      root.setAttribute('data-theme', themeId);
      
      console.log(`✅ Theme switched to: ${themeId} (instant)`);
    } catch (error) {
      console.error(`❌ Error switching theme to ${themeId}:`, error);
    }
  }, []);

  // OPTIMIZED: Cached site settings with smart refresh
  const fetchSiteSettings = useCallback(async () => {
    // Check cache first
    const now = Date.now();
    if (cache.siteSettings && (now - cache.lastFetch) < cache.TTL) {
      console.log('📊 Using cached site settings');
      setSiteSettings(cache.siteSettings);
      return cache.siteSettings;
    }

    // Cancel previous request if still pending
    if (currentRequestRef.current) {
      currentRequestRef.current.abort();
    }

    const controller = new AbortController();
    currentRequestRef.current = controller;

    try {
      const token = localStorage.getItem('token');
      const endpoint = token && userIsAdmin !== false ? 
        'api/admin/site-settings' : 'api/site-settings';
      
      const headers = {
        'Accept': 'application/json',
        ...(token && userIsAdmin !== false && { 'Authorization': `Bearer ${token}` })
      };

      const response = await fetch(createApiUrl(endpoint), {
        method: 'GET',
        headers,
        signal: controller.signal
      });

      if (response.ok) {
        const settings = await response.json();
        
        // Update cache
        cache.siteSettings = settings;
        cache.lastFetch = now;
        
        // Update admin status
        if (endpoint.includes('admin')) {
          setUserIsAdmin(true);
        }
        
        console.log('📊 Site settings loaded and cached');
        setSiteSettings(settings);
        applyThemeSyncedStyles(settings);
        return settings;
      } else if (response.status === 403 && endpoint.includes('admin')) {
        // Fallback to public endpoint
        setUserIsAdmin(false);
        return fetchSiteSettings(); // Recursive call with public endpoint
      }
      
      return null;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Error fetching site settings:', error);
      }
      return null;
    } finally {
      currentRequestRef.current = null;
    }
  }, [userIsAdmin]);

  // OPTIMIZED: Debounced site settings sync
  const debouncedSyncSettings = useCallback(
    debounce(async (themeId) => {
      try {
        console.log('🔧 Syncing site settings for theme:', themeId);
        const success = await updateSiteSettingsToMatchTheme(themeId);
        
        if (success) {
          // Invalidate cache to force fresh fetch
          cache.siteSettings = null;
          const updatedSettings = await fetchSiteSettings();
          
          if (updatedSettings) {
            console.log('✅ Site settings synchronized');
            
            // Dispatch single event
            document.dispatchEvent(new CustomEvent('themeSettingsUpdated', {
              detail: { source: 'sync', themeId, settings: updatedSettings }
            }));
          }
        }
      } catch (error) {
        console.error('❌ Error in debounced sync:', error);
      }
    }, 1000), // 1 second debounce
    [fetchSiteSettings]
  );

  // OPTIMIZED: Debounced custom theme sync
  const debouncedSyncCustomTheme = useCallback(
    debounce(async (customThemeData) => {
      try {
        if (customThemeData.data?.colors && customThemeData.data?.site_settings_colors) {
          const success = await syncCustomThemeColorsToSiteSettings(
            customThemeData.data.colors, 
            customThemeData.data.site_settings_colors
          );
          
          if (success) {
            cache.siteSettings = null; // Invalidate cache
            const updatedSettings = await fetchSiteSettings();
            
            if (updatedSettings) {
              document.dispatchEvent(new CustomEvent('themeSettingsUpdated', {
                detail: { source: 'custom-sync', settings: updatedSettings }
              }));
            }
          }
        }
      } catch (error) {
        console.error('❌ Error in custom theme sync:', error);
      }
    }, 1000),
    [fetchSiteSettings]
  );

  // OPTIMIZED: Custom theme color sync with error handling
  const syncCustomThemeColorsToSiteSettings = useCallback(async (themeColors, siteSettingsColors) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ No auth token, skipping sync');
        return false;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(createApiUrl('api/themes/sync-colors'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          theme_colors: themeColors,
          site_settings_colors: siteSettingsColors
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Theme colors synced');
        return true;
      } else {
        console.error('❌ Sync failed:', response.status);
        return false;
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Error in color sync:', error);
      }
      return false;
    }
  }, []);

  // OPTIMIZED: Fast initialization
  useEffect(() => {
    const fastInitialize = async () => {
      if (isInitializingRef.current || isInitialized) return;
      
      isInitializingRef.current = true;
      console.log('🚀 Fast theme initialization...');

      try {
        // 1. Load saved theme immediately
        const savedTheme = localStorage.getItem('selectedTheme') || 'default';
        setCurrentTheme(savedTheme);
        
        // 2. Load custom themes
        const customThemesData = loadCustomThemes();
        
        // 3. Apply theme instantly
        const isCustomTheme = customThemesData.find(theme => theme.id === savedTheme);
        
        if (isCustomTheme) {
          setTimeout(() => applyCustomTheme(isCustomTheme), 50);
        } else {
          // Built-in theme - instant switch (CSS already preloaded)
          document.documentElement.setAttribute('data-theme', savedTheme);
        }
        
        // 4. Mark as initialized for UI rendering
        setIsInitialized(true);
        console.log('⚡ Theme initialized - UI ready');
        
        // 5. Load site settings in background (non-blocking)
        setTimeout(() => {
          fetchSiteSettings().catch(error => {
            console.warn('Site settings loading failed:', error.message);
          });
        }, 200);
        
      } catch (error) {
        console.error('❌ Initialization error:', error);
        setIsInitialized(true); // Prevent UI blocking
      } finally {
        isInitializingRef.current = false;
      }
    };

    fastInitialize();
  }, []); // Run only once

  // OPTIMIZED: Theme change with performance improvements
  const changeTheme = useCallback(async (themeId) => {
    if (themeId === currentTheme || isUpdatingSiteSettings) {
      console.log('🛑 Theme change skipped - same theme or updating');
      return;
    }
    
    console.log(`🎨 Changing theme: ${currentTheme} → ${themeId}`);
    
    try {
      setIsUpdatingSiteSettings(true);
      
      // Check if custom theme
      const customTheme = customThemes.find(theme => theme.id === themeId);
      
      if (customTheme) {
        // Apply custom theme
        applyCustomTheme(customTheme);
      } else {
        // Apply built-in theme (instant switch)
        await loadThemeCSS(themeId);
        
        // Sync with backend (debounced)
        debouncedSyncSettings(themeId);
      }
      
      // Update state immediately for responsive UI
      setCurrentTheme(themeId);
      localStorage.setItem('selectedTheme', themeId);
      
      console.log(`✅ Theme changed to: ${themeId}`);
      
    } catch (error) {
      console.error('❌ Theme change error:', error);
    } finally {
      // Quick UI response
      setTimeout(() => setIsUpdatingSiteSettings(false), 100);
    }
  }, [currentTheme, customThemes, isUpdatingSiteSettings, applyCustomTheme, loadThemeCSS, debouncedSyncSettings]);

  // OPTIMIZED: Event listeners with cleanup
  useEffect(() => {
    const handleCustomThemeAdded = () => {
      console.log('🎨 Custom theme added, reloading...');
      loadCustomThemes();
    };

    const handleChangeThemeRequest = (event) => {
      if (event.detail?.themeId) {
        changeTheme(event.detail.themeId);
      }
    };

    // Add listeners
    window.addEventListener('customThemeAdded', handleCustomThemeAdded);
    window.addEventListener('changeThemeRequest', handleChangeThemeRequest);
    
    return () => {
      // Cleanup
      window.removeEventListener('customThemeAdded', handleCustomThemeAdded);
      window.removeEventListener('changeThemeRequest', handleChangeThemeRequest);
      
      // Cancel pending requests
      if (currentRequestRef.current) {
        currentRequestRef.current.abort();
      }
    };
  }, [changeTheme, loadCustomThemes]);

  // OPTIMIZED: Memoized refresh function
  const refreshSiteSettings = useCallback(async () => {
    console.log('🔄 Forcing site settings refresh...');
    cache.siteSettings = null; // Clear cache
    return await fetchSiteSettings();
  }, [fetchSiteSettings]);

  // OPTIMIZED: Memoized theme arrays
  const builtInThemes = [
    { id: 'default', name: 'Aurora', icon: '🌟', type: 'builtin', description: 'Colorful gradient theme' },
    { id: 'dark', name: 'Dark', icon: '🌙', type: 'builtin', description: 'Dark mode for low light' },
    { id: 'blue', name: 'Ocean', icon: '💙', type: 'builtin', description: 'Professional blue theme' },
    { id: 'green', name: 'Nature', icon: '💚', type: 'builtin', description: 'Eco-friendly green theme' }
  ];

  const formattedCustomThemes = customThemes.map(theme => ({
    id: theme.id,
    name: theme.name,
    icon: '🎨',
    type: 'custom',
    description: theme.description || 'Custom theme'
  }));

  const themesArray = [...builtInThemes, ...formattedCustomThemes];

  // OPTIMIZED: Memoized context value
  const contextValue = {
    // Core state
    currentTheme,
    siteSettings,
    isInitialized,
    isUpdatingSiteSettings,
    
    // Theme management
    changeTheme,
    refreshSiteSettings,
    
    // Theme data
    themesArray,
    builtInThemes,
    customThemes: formattedCustomThemes,
    
    // Custom theme management
    loadCustomThemes,
    deleteCustomTheme,
    applyCustomTheme,
    
    // Utility flags
    isDarkMode: currentTheme === 'dark',
    isLightMode: currentTheme === 'default',
    isBlueTheme: currentTheme === 'blue',
    isGreenTheme: currentTheme === 'green',
    isCustomTheme: customThemes.some(theme => theme.id === currentTheme),
    
    // Performance utilities
    clearThemeCache: () => {
      cache.siteSettings = null;
      console.log('🧹 Theme cache cleared');
    },
    
    // Debug utilities (development only)
    debug: {
      cache: () => console.log('💾 Cache:', cache),
      themes: () => console.log('🎨 All themes:', themesArray),
      settings: () => console.log('⚙️ Settings:', siteSettings)
    }
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};