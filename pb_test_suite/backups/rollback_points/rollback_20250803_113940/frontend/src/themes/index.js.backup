// Theme Management Utilities
// This module provides functions to handle theme switching and CSS loading

// Available themes configuration
export const THEMES = {
  default: {
    id: 'default',
    name: 'Default Light',
    description: 'Clean, modern light interface',
    cssFile: 'default.css',
    icon: '☀️',
    type: 'light'
  },
  dark: {
    id: 'dark',
    name: 'Dark Mode',
    description: 'Sleek, modern dark interface',
    cssFile: 'dark.css',
    icon: '🌙',
    type: 'dark'
  },
  blue: {
    id: 'blue',
    name: 'Professional Blue',
    description: 'Corporate blue-focused interface',
    cssFile: 'blue.css',
    icon: '💙',
    type: 'light'
  },
  green: {
    id: 'green',
    name: 'Natural Green',
    description: 'Eco-friendly green interface',
    cssFile: 'green.css',
    icon: '🌱',
    type: 'light'
  }
};

// Default theme configuration
export const DEFAULT_THEME = 'default';

// Theme storage keys
const THEME_STORAGE_KEY = 'selected_theme';
const THEME_PREFERENCE_KEY = 'theme_preference';

// Theme CSS cache
const themeCache = new Map();

/**
 * Get the current theme from localStorage or default
 * @returns {string} Current theme ID
 */
export const getCurrentTheme = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored && THEMES[stored] ? stored : DEFAULT_THEME;
  } catch (error) {
    console.warn('Failed to get theme from localStorage:', error);
    return DEFAULT_THEME;
  }
};

// Debounce localStorage writes to prevent excessive writes
let saveThemeTimeout = null;

/**
 * Save theme to localStorage
 * @param {string} themeId - Theme ID to save
 */
export const saveTheme = (themeId) => {
  try {
    if (THEMES[themeId]) {
      // Clear previous timeout
      if (saveThemeTimeout) {
        clearTimeout(saveThemeTimeout);
      }
      
      // Debounce the localStorage write
      saveThemeTimeout = setTimeout(() => {
        localStorage.setItem(THEME_STORAGE_KEY, themeId);
        localStorage.setItem(THEME_PREFERENCE_KEY, JSON.stringify({
          theme: themeId,
          timestamp: Date.now()
        }));
        console.log('🎨 Theme saved to localStorage:', themeId);
      }, 100);
    }
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error);
  }
};

/**
 * Get theme preference with metadata
 * @returns {Object} Theme preference object
 */
export const getThemePreference = () => {
  try {
    const stored = localStorage.getItem(THEME_PREFERENCE_KEY);
    if (stored) {
      const preference = JSON.parse(stored);
      return {
        theme: preference.theme || DEFAULT_THEME,
        timestamp: preference.timestamp || Date.now(),
        isStored: true
      };
    }
  } catch (error) {
    console.warn('Failed to get theme preference:', error);
  }
  
  return {
    theme: DEFAULT_THEME,
    timestamp: Date.now(),
    isStored: false
  };
};

/**
 * Load theme CSS dynamically
 * @param {string} themeId - Theme ID to load
 * @returns {Promise} Promise that resolves when CSS is loaded
 */
export const loadThemeCSS = (themeId) => {
  return new Promise((resolve, reject) => {
    if (!THEMES[themeId]) {
      reject(new Error(`Theme '${themeId}' not found`));
      return;
    }

    // Check if theme is already cached
    if (themeCache.has(themeId)) {
      resolve(themeCache.get(themeId));
      return;
    }

    // Create link element for theme CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `/themes/${THEMES[themeId].cssFile}`;
    link.setAttribute('data-theme', themeId);
    
    // Handle load success
    link.onload = () => {
      themeCache.set(themeId, link);
      resolve(link);
    };
    
    // Handle load error
    link.onerror = () => {
      reject(new Error(`Failed to load theme CSS for '${themeId}'`));
    };
    
    // Add to head
    document.head.appendChild(link);
  });
};

/**
 * Remove theme CSS from document
 * @param {string} themeId - Theme ID to remove
 */
export const removeThemeCSS = (themeId) => {
  const existingLink = document.querySelector(`link[data-theme="${themeId}"]`);
  if (existingLink) {
    existingLink.remove();
    themeCache.delete(themeId);
  }
};

/**
 * Apply theme to document
 * @param {string} themeId - Theme ID to apply
 * @param {boolean} withTransition - Whether to use transition animation
 */
export const applyTheme = (themeId, withTransition = true) => {
  if (!THEMES[themeId]) {
    console.warn(`Theme '${themeId}' not found, using default`);
    themeId = DEFAULT_THEME;
  }

  const body = document.body;
  const html = document.documentElement;
  
  // Add transition class if requested
  if (withTransition) {
    body.classList.add('theme-transitioning');
  }
  
  // Remove existing theme attributes
  Object.keys(THEMES).forEach(theme => {
    body.classList.remove(`theme-${theme}`);
    html.removeAttribute(`data-theme-${theme}`);
  });
  
  // Apply new theme
  body.classList.add(`theme-${themeId}`);
  html.setAttribute('data-theme', themeId);
  
  // Load theme CSS file immediately for better performance
  const themeCSS = loadThemeCSS(themeId);
  themeCSS.then(() => {
    console.log(`Theme '${themeId}' CSS loaded successfully`);
    
    // Wait longer to ensure CSS is fully applied and DOM is updated
    setTimeout(() => {
      // Ensure CSS variables are available before dispatching event
      const testElement = document.createElement('div');
      testElement.style.cssText = 'position: absolute; visibility: hidden;';
      document.body.appendChild(testElement);
      
      // Check if CSS variables are loaded
      const computedStyle = getComputedStyle(testElement);
      const headerBg = computedStyle.getPropertyValue('--header-bg').trim();
      
      document.body.removeChild(testElement);
      
      console.log('🎨 CSS variables check - header-bg:', headerBg);
      
      // Dispatch theme ready event only after CSS is confirmed loaded
      document.dispatchEvent(new CustomEvent('themeReady', { 
        detail: { themeId } 
      }));
    }, 150); // Increased delay to ensure CSS is fully applied
  }).catch(error => {
    console.error(`Failed to load theme '${themeId}' CSS:`, error);
    // Even on error, dispatch event to prevent hanging
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('themeReady', { 
        detail: { themeId } 
      }));
    }, 100);
  });
  
  // Remove transition class after animation completes
  if (withTransition) {
    setTimeout(() => {
      body.classList.remove('theme-transitioning');
    }, 300);
  }
  
  // Update CSS custom properties for older browsers
  updateCSSCustomProperties(themeId);
  
  // Save theme preference
  saveTheme(themeId);
  
  // Dispatch theme change event
  dispatchThemeChangeEvent(themeId);
};

/**
 * Update CSS custom properties for older browsers
 * @param {string} themeId - Theme ID
 */
const updateCSSCustomProperties = (themeId) => {
  // This is a fallback for older browsers that don't support CSS custom properties
  // The actual theme switching is handled by CSS attribute selectors
  if (typeof window !== 'undefined' && window.CSS && window.CSS.supports && window.CSS.supports('color', 'var(--primary-color)')) {
    // Modern browsers support CSS custom properties
    return;
  }
  
  // Fallback for older browsers would go here
  console.warn('CSS custom properties not supported, theme switching may not work properly');
};

/**
 * Dispatch theme change event
 * @param {string} themeId - New theme ID
 */
const dispatchThemeChangeEvent = (themeId) => {
  const event = new CustomEvent('themechange', {
    detail: {
      theme: themeId,
      themeData: THEMES[themeId],
      timestamp: Date.now()
    }
  });
  
  document.dispatchEvent(event);
};

/**
 * Get theme by ID
 * @param {string} themeId - Theme ID
 * @returns {Object|null} Theme object or null if not found
 */
export const getTheme = (themeId) => {
  return THEMES[themeId] || null;
};

/**
 * Get all available themes
 * @returns {Object} All themes object
 */
export const getAllThemes = () => {
  return THEMES;
};

/**
 * Get themes as array
 * @returns {Array} Array of theme objects
 */
export const getThemesArray = () => {
  return Object.values(THEMES);
};

/**
 * Check if theme exists
 * @param {string} themeId - Theme ID to check
 * @returns {boolean} True if theme exists
 */
export const themeExists = (themeId) => {
  return Boolean(THEMES[themeId]);
};

/**
 * Get system theme preference (light/dark)
 * @returns {string} 'light' or 'dark'
 */
export const getSystemTheme = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

/**
 * Get recommended theme based on system preference
 * @returns {string} Recommended theme ID
 */
export const getRecommendedTheme = () => {
  const systemTheme = getSystemTheme();
  const currentTheme = getCurrentTheme();
  
  // If user has a preference, use it
  if (currentTheme !== DEFAULT_THEME) {
    return currentTheme;
  }
  
  // Otherwise, recommend based on system preference
  return systemTheme === 'dark' ? 'dark' : 'default';
};

/**
 * Initialize theme system
 * @param {string} defaultTheme - Default theme to use if none is set
 */
export const initializeTheme = (defaultTheme = DEFAULT_THEME) => {
  try {
    // Load base variables CSS
    const variablesLink = document.createElement('link');
    variablesLink.rel = 'stylesheet';
    variablesLink.href = '/themes/variables.css';
    variablesLink.setAttribute('data-theme', 'variables');
    document.head.appendChild(variablesLink);
    
    // Get current theme preference
    const currentTheme = getCurrentTheme();
    const themeToApply = themeExists(currentTheme) ? currentTheme : defaultTheme;
    
    // Apply theme without transition on initial load
    applyTheme(themeToApply, false);
    
    // Set up system theme change listener
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleSystemThemeChange = (e) => {
        const preference = getThemePreference();
        // Only auto-switch if user hasn't set a preference
        if (!preference.isStored) {
          const newTheme = e.matches ? 'dark' : 'default';
          applyTheme(newTheme);
        }
      };
      
      mediaQuery.addEventListener('change', handleSystemThemeChange);
      
      // Return cleanup function
      return () => {
        mediaQuery.removeEventListener('change', handleSystemThemeChange);
      };
    }
    
    console.log(`Theme system initialized with theme: ${themeToApply}`);
  } catch (error) {
    console.error('Failed to initialize theme system:', error);
    // Fallback to default theme
    applyTheme(DEFAULT_THEME, false);
  }
};

/**
 * Switch to next theme in order
 * @returns {string} New theme ID
 */
export const switchToNextTheme = () => {
  const currentTheme = getCurrentTheme();
  const themeIds = Object.keys(THEMES);
  const currentIndex = themeIds.indexOf(currentTheme);
  const nextIndex = (currentIndex + 1) % themeIds.length;
  const nextTheme = themeIds[nextIndex];
  
  applyTheme(nextTheme);
  return nextTheme;
};

/**
 * Switch to previous theme in order
 * @returns {string} New theme ID
 */
export const switchToPreviousTheme = () => {
  const currentTheme = getCurrentTheme();
  const themeIds = Object.keys(THEMES);
  const currentIndex = themeIds.indexOf(currentTheme);
  const previousIndex = currentIndex === 0 ? themeIds.length - 1 : currentIndex - 1;
  const previousTheme = themeIds[previousIndex];
  
  applyTheme(previousTheme);
  return previousTheme;
};

/**
 * Toggle between light and dark themes
 * @returns {string} New theme ID
 */
export const toggleTheme = () => {
  const currentTheme = getCurrentTheme();
  const currentThemeData = THEMES[currentTheme];
  
  if (currentThemeData.type === 'dark') {
    // Switch to default light theme
    applyTheme('default');
    return 'default';
  } else {
    // Switch to dark theme
    applyTheme('dark');
    return 'dark';
  }
};

/**
 * Preload all theme CSS files
 * @returns {Promise} Promise that resolves when all themes are loaded
 */
export const preloadAllThemes = () => {
  const promises = Object.keys(THEMES).map(themeId => {
    return loadThemeCSS(themeId).catch(error => {
      console.warn(`Failed to preload theme ${themeId}:`, error);
      return null;
    });
  });
  
  return Promise.all(promises);
};

/**
 * Clear theme cache
 */
export const clearThemeCache = () => {
  themeCache.clear();
  
  // Remove all theme CSS links
  Object.keys(THEMES).forEach(themeId => {
    removeThemeCSS(themeId);
  });
};

/**
 * Get theme statistics
 * @returns {Object} Theme usage statistics
 */
export const getThemeStats = () => {
  const preference = getThemePreference();
  
  return {
    currentTheme: getCurrentTheme(),
    systemTheme: getSystemTheme(),
    recommendedTheme: getRecommendedTheme(),
    hasStoredPreference: preference.isStored,
    lastChanged: preference.timestamp,
    availableThemes: Object.keys(THEMES).length,
    cacheSize: themeCache.size
  };
};

// Export theme utilities as default
export default {
  THEMES,
  DEFAULT_THEME,
  getCurrentTheme,
  saveTheme,
  getThemePreference,
  loadThemeCSS,
  removeThemeCSS,
  applyTheme,
  getTheme,
  getAllThemes,
  getThemesArray,
  themeExists,
  getSystemTheme,
  getRecommendedTheme,
  initializeTheme,
  switchToNextTheme,
  switchToPreviousTheme,
  toggleTheme,
  preloadAllThemes,
  clearThemeCache,
  getThemeStats
}; 