import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { updateSiteSettingsToMatchTheme, applyThemeSyncedStyles } from '../themes/siteSettingsIntegration';
import { createApiUrl } from '../utils/config';

const ThemeContext = createContext();

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
  const [userIsAdmin, setUserIsAdmin] = useState(null); // null=unknown, false=not admin, true=admin

  // Load custom themes from localStorage
  const loadCustomThemes = () => {
    try {
      const storedCustomThemes = localStorage.getItem('customThemes');
      if (storedCustomThemes) {
        const parsed = JSON.parse(storedCustomThemes);
        console.log('🎨 Loaded custom themes:', parsed.length, parsed);
        setCustomThemes(parsed);
        return parsed;
      } else {
        console.log('🎨 No custom themes found in localStorage');
        setCustomThemes([]);
        return [];
      }
    } catch (error) {
      console.error('Error loading custom themes:', error);
      setCustomThemes([]);
      return [];
    }
  };

  // Delete custom theme from localStorage and state
  const deleteCustomTheme = (themeId) => {
    try {
      console.log('🗑️ Deleting custom theme:', themeId);
      
      // Get current custom themes
      const storedCustomThemes = JSON.parse(localStorage.getItem('customThemes') || '[]');
      
      // Filter out the theme to delete
      const updatedThemes = storedCustomThemes.filter(theme => theme.id !== themeId);
      
      // Update localStorage
      localStorage.setItem('customThemes', JSON.stringify(updatedThemes));
      
      // Update state
      setCustomThemes(updatedThemes);
      
      // If currently selected theme is being deleted, switch to default
      if (currentTheme === themeId) {
        console.log('🔄 Deleted theme was active, switching to default theme');
        changeTheme('default');
      }
      
      console.log('✅ Custom theme deleted successfully');
      
      // Dispatch event for other components that might be listening
      const event = new CustomEvent('customThemeDeleted', { 
        detail: { themeId, remainingCount: updatedThemes.length } 
      });
      window.dispatchEvent(event);
      
      return true;
    } catch (error) {
      console.error('❌ Error deleting custom theme:', error);
      return false;
    }
  };

  // Listen for custom theme addition events and reload on dependency changes
  useEffect(() => {
    // Load custom themes on mount
    loadCustomThemes();

    // Listen for custom theme events
    const handleCustomThemeAdded = (event) => {
      console.log('🎨 Custom theme added event:', event.detail);
      loadCustomThemes(); // Reload all custom themes
    };

    window.addEventListener('customThemeAdded', handleCustomThemeAdded);
    
    return () => {
      window.removeEventListener('customThemeAdded', handleCustomThemeAdded);
    };
  }, []); // Only run once on mount

  // NOTE: Theme change request listener moved below changeTheme definition

  // Re-apply current theme when custom themes change and current theme is custom
  useEffect(() => {
    if (customThemes.length > 0 && currentTheme) {
      const isCurrentThemeCustom = customThemes.find(theme => theme.id === currentTheme);
      if (isCurrentThemeCustom) {
        console.log('🔄 Re-applying current custom theme after state update:', isCurrentThemeCustom.name);
        setTimeout(() => {
          applyCustomTheme(isCurrentThemeCustom);
        }, 100);
      }
    }
  }, [customThemes, currentTheme]); // Run when custom themes or current theme changes

  // Apply custom theme
  const applyCustomTheme = (customThemeData) => {
    try {
      console.log('🎨 Applying custom theme:', customThemeData);
      console.log('📊 Theme data:', customThemeData.data);
      
      // First, clear existing theme CSS links
      const existingThemeLinks = document.querySelectorAll('link[data-theme]');
      existingThemeLinks.forEach(link => link.remove());
      
      // Remove any existing inline theme styles
      const existingThemeStyles = document.querySelectorAll('style[data-custom-theme]');
      existingThemeStyles.forEach(style => style.remove());
      
      // Clear root styles from built-in themes
      const root = document.documentElement;
      root.removeAttribute('data-theme');
      
      // Generate CSS from theme data
      const cssVariables = generateCSSFromThemeData(customThemeData.data);
      console.log('🎨 Generated CSS variables:', cssVariables);
      
      // Apply CSS variables to document root
      Object.entries(cssVariables).forEach(([property, value]) => {
        root.style.setProperty(property, value);
        console.log(`Setting ${property}: ${value}`);
      });
      
      // Create and inject custom theme CSS
      const customCSS = generateCustomThemeCSS(customThemeData.data);
      if (customCSS) {
        const styleElement = document.createElement('style');
        styleElement.setAttribute('data-custom-theme', customThemeData.id);
        styleElement.textContent = customCSS;
        document.head.appendChild(styleElement);
        console.log('💅 Injected custom theme CSS');
      }
      
      // Set data-theme attribute for custom theme
      root.setAttribute('data-theme', customThemeData.id);
      
      // Sync custom theme colors with site settings
      setTimeout(async () => {
        try {
          console.log('🎨 Syncing custom theme colors with site settings...');
          
          // First sync theme colors to site settings
          if (customThemeData.data && customThemeData.data.colors) {
            console.log('🎨 Syncing theme colors to site settings...');
            const syncSuccess = await syncCustomThemeColorsToSiteSettings(customThemeData.data.colors, customThemeData.data.site_settings_colors);
            console.log('🎨 Sync result:', syncSuccess);
          }
          
          // Then refresh site settings and force component updates
          console.log('🔄 Refreshing site settings after custom theme application...');
          const updatedSettings = await fetchSiteSettings();
          if (updatedSettings) {
            console.log('✅ Site settings refreshed after custom theme application');
            console.log('🎨 Updated homepage_background_color:', updatedSettings.homepage_background_color);
            
            // Force update site settings state
            setSiteSettings(updatedSettings);
            
            applyThemeSyncedStyles(updatedSettings);
            
            // Dispatch multiple events to ensure all components update
            document.dispatchEvent(new CustomEvent('forceSiteSettingsRefresh', {
              detail: { source: 'custom-theme-applied', themeId: customThemeData.id, settings: updatedSettings }
            }));
            
            document.dispatchEvent(new CustomEvent('themeSettingsUpdated', {
              detail: { source: 'custom-theme-sync', settings: updatedSettings }
            }));
            
            // Force a DOM reflow to trigger re-renders
            document.body.style.display = 'none';
            void document.body.offsetHeight;
            document.body.style.display = '';
          }
        } catch (error) {
          console.error('❌ Error syncing/refreshing site settings after custom theme:', error);
        }
      }, 200);
      
      console.log(`✅ Successfully applied custom theme: ${customThemeData.name}`);
    } catch (error) {
      console.error('❌ Error applying custom theme:', error);
      console.error('Stack:', error.stack);
    }
  };

  // Generate CSS variables from theme data with proper mapping
  const generateCSSFromThemeData = (themeData) => {
    const cssVariables = {};
    
    console.log('🎨 Processing theme data for CSS variables:', themeData);
    
    // Map ALL colors with proper CSS variable names (including new template fields)
    if (themeData.colors) {
      Object.entries(themeData.colors).forEach(([key, value]) => {
        // Convert camelCase to kebab-case for CSS variables
        const cssKey = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        cssVariables[cssKey] = value;
        
        // Also add common CSS variable mappings
        const commonMappings = {
          'primary': '--primary-color',
          'secondary': '--secondary-color', 
          'backgroundPrimary': '--background-primary',
          'backgroundSecondary': '--background-secondary',
          'textPrimary': '--text-primary',
          'textSecondary': '--text-secondary',
          'borderColor': '--border-color',
          // Admin Settings Direct Mappings
          'header_background_color': '--header-bg',
          'header_text_color': '--header-text',
          'header_border_color': '--header-border',
          'nav_link_color': '--nav-link-color',
          'nav_link_hover_color': '--nav-link-hover',
          'marquee_background_color': '--marquee-bg',
          'marquee_color': '--marquee-text',
          'homepage_background_color': '--homepage-bg',
          'footer_background_color': '--footer-bg',
          'footer_text_color': '--footer-text',
          'products_page_background_color': '--products-bg',
          'products_page_title_color': '--products-title',
          'homepage_products_product_name_color': '--product-name-color',
          'homepage_products_product_price_color': '--product-price-color',
          'homepage_products_product_category_color': '--product-category-color',
          'product_detail_product_name_color': '--product-detail-name',
          'product_detail_product_price_color': '--product-detail-price',
          'product_detail_product_description_color': '--product-detail-desc'
        };
        
        if (commonMappings[key]) {
          cssVariables[commonMappings[key]] = value;
        }
      });
      
      console.log(`🎨 Mapped ${Object.keys(themeData.colors).length} color fields to CSS variables`);
    }
    
    // Map typography with proper units (including new admin settings fonts)
    if (themeData.typography) {
      Object.entries(themeData.typography).forEach(([key, value]) => {
        const cssKey = `--${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
        
        // Handle different value types for admin settings fonts
        if (typeof value === 'number') {
          // Admin settings font sizes are in pixels, template font sizes are in rem
          if (key.includes('font_size') || key.includes('_size')) {
            cssVariables[cssKey] = `${value}px`; // Admin settings use px
          } else if (key.includes('fontSize') || key.includes('Size')) {
            cssVariables[cssKey] = `${value}rem`; // Template legacy uses rem
          } else {
            cssVariables[cssKey] = value;
          }
        } else {
          cssVariables[cssKey] = value;
        }
        
        console.log(`🎨 Typography CSS variable: ${cssKey} = ${cssVariables[cssKey]}`);
      });
      
      console.log(`🎨 Mapped ${Object.keys(themeData.typography).length} typography fields to CSS variables`);
    }
    
    // Map spacing values
    if (themeData.spacing) {
      Object.entries(themeData.spacing).forEach(([key, value]) => {
        const cssKey = `--spacing-${key}`;
        cssVariables[cssKey] = typeof value === 'number' ? `${value}rem` : value;
      });
    }
    
    return cssVariables;
  };

  // Generate complete CSS for custom theme
  const generateCustomThemeCSS = (themeData) => {
    let css = `/* Custom Theme CSS - ADMIN SETTINGS INTEGRATION */\n`;
    
    console.log('🎨 Generating CSS for theme data:', themeData);
    
    // Priority 1: Admin Settings Colors (New Template Fields)
    if (themeData.colors) {
      css += `
        /* ========== ADMIN SETTINGS DIRECT CSS MAPPING ========== */
        
        /* Header Styles */
        .header, .site-header {
          background-color: ${themeData.colors.header_background_color || themeData.colors.backgroundPrimary || '#ffffff'} !important;
          color: ${themeData.colors.header_text_color || themeData.colors.textPrimary || '#212529'} !important;
          border-bottom: 1px solid ${themeData.colors.header_border_color || themeData.colors.borderColor || '#dee2e6'} !important;
        }
        
        /* Navigation Styles */
        .nav a, .navigation a, .nav-links a {
          color: ${themeData.colors.nav_link_color || themeData.colors.primary || '#007bff'} !important;
          font-size: ${themeData.typography?.nav_link_font_size || 16}px !important;
          font-weight: ${themeData.typography?.nav_link_font_weight || '500'} !important;
          font-family: ${themeData.typography?.nav_link_font_family || 'inherit'} !important;
        }
        
        .nav a:hover, .navigation a:hover, .nav-links a:hover {
          color: ${themeData.colors.nav_link_hover_color || themeData.colors.primaryHover || '#0056b3'} !important;
        }
        
        /* Marquee Styles */
        .marquee-banner {
          background-color: ${themeData.colors.marquee_background_color || themeData.colors.primary || '#007bff'} !important;
          color: ${themeData.colors.marquee_color || themeData.colors.textLight || '#ffffff'} !important;
          font-family: ${themeData.typography?.marquee_font_family || 'Arial, sans-serif'} !important;
          font-size: ${themeData.typography?.marquee_font_size || '14px'} !important;
          font-weight: ${themeData.typography?.marquee_font_weight || 'normal'} !important;
        }
        
        /* Homepage Background */
        .home-container, .category-section, .featured-products {
          background-color: ${themeData.colors.homepage_background_color || themeData.colors.backgroundPrimary || '#ffffff'} !important;
        }
        
        /* Footer Styles */
        .footer, .site-footer {
          background-color: ${themeData.colors.footer_background_color || themeData.colors.backgroundDark || '#343a40'} !important;
          color: ${themeData.colors.footer_text_color || themeData.colors.textLight || '#ffffff'} !important;
        }
        
        /* Product Card Styles */
        .product-card h3, .product-name {
          color: ${themeData.colors.homepage_products_product_name_color || themeData.colors.primary || '#007bff'} !important;
          font-family: ${themeData.typography?.homepage_products_product_name_font_family || 'Arial, sans-serif'} !important;
          font-size: ${themeData.typography?.homepage_products_product_name_font_size || 18}px !important;
          font-weight: ${themeData.typography?.homepage_products_product_name_font_weight || 'bold'} !important;
        }
        
        .product-card .price, .product-price {
          color: ${themeData.colors.homepage_products_product_price_color || themeData.colors.success || '#28a745'} !important;
          font-family: ${themeData.typography?.homepage_products_product_price_font_family || 'Arial, sans-serif'} !important;
          font-size: ${themeData.typography?.homepage_products_product_price_font_size || 16}px !important;
          font-weight: ${themeData.typography?.homepage_products_product_price_font_weight || 'bold'} !important;
        }
        
        .product-card .category, .product-category {
          color: ${themeData.colors.homepage_products_product_category_color || themeData.colors.textSecondary || '#6c757d'} !important;
          font-family: ${themeData.typography?.homepage_products_product_category_font_family || 'Arial, sans-serif'} !important;
          font-size: ${themeData.typography?.homepage_products_product_category_font_size || 14}px !important;
          font-weight: ${themeData.typography?.homepage_products_product_category_font_weight || 'normal'} !important;
        }
        
        /* Product Detail Page */
        .product-detail .product-name {
          color: ${themeData.colors.product_detail_product_name_color || themeData.colors.textPrimary || '#212529'} !important;
          font-family: ${themeData.typography?.product_detail_product_name_font_family || 'Arial, sans-serif'} !important;
          font-size: ${themeData.typography?.product_detail_product_name_font_size || 28}px !important;
          font-weight: ${themeData.typography?.product_detail_product_name_font_weight || 'bold'} !important;
        }
        
        .product-detail .product-price {
          color: ${themeData.colors.product_detail_product_price_color || themeData.colors.success || '#28a745'} !important;
          font-family: ${themeData.typography?.product_detail_product_price_font_family || 'Arial, sans-serif'} !important;
          font-size: ${themeData.typography?.product_detail_product_price_font_size || 24}px !important;
          font-weight: ${themeData.typography?.product_detail_product_price_font_weight || 'bold'} !important;
        }
        
        .product-detail .product-description {
          color: ${themeData.colors.product_detail_product_description_color || themeData.colors.textSecondary || '#6c757d'} !important;
          font-family: ${themeData.typography?.product_detail_product_description_font_family || 'Arial, sans-serif'} !important;
          font-size: ${themeData.typography?.product_detail_product_description_font_size || 16}px !important;
          font-weight: ${themeData.typography?.product_detail_product_description_font_weight || 'normal'} !important;
        }
        
        /* Products Page */
        .products-page {
          background-color: ${themeData.colors.products_page_background_color || themeData.colors.backgroundPrimary || '#ffffff'} !important;
        }
        
        .products-page h1, .products-title {
          color: ${themeData.colors.products_page_title_color || themeData.colors.textPrimary || '#212529'} !important;
          font-family: ${themeData.typography?.products_page_title_font_family || 'Arial, sans-serif'} !important;
          font-size: ${themeData.typography?.products_page_title_font_size || 32}px !important;
          font-weight: ${themeData.typography?.products_page_title_font_weight || 'bold'} !important;
        }
        
        /* Button Styles */
        .btn.add-to-cart, .add-to-cart-btn {
          background-color: ${themeData.colors.homepage_products_add_to_cart_button_color || themeData.colors.success || '#28a745'} !important;
          color: ${themeData.colors.homepage_products_add_to_cart_button_text_color || themeData.colors.textLight || '#ffffff'} !important;
          font-family: ${themeData.typography?.homepage_products_add_to_cart_button_font_family || 'Arial, sans-serif'} !important;
          font-size: ${themeData.typography?.homepage_products_add_to_cart_button_font_size || 14}px !important;
          font-weight: ${themeData.typography?.homepage_products_add_to_cart_button_font_weight || 'normal'} !important;
        }
        
        .btn.view-details, .view-details-btn {
          background-color: ${themeData.colors.homepage_products_view_details_button_color || themeData.colors.primary || '#007bff'} !important;
          color: ${themeData.colors.homepage_products_view_details_button_text_color || themeData.colors.textLight || '#ffffff'} !important;
          font-family: ${themeData.typography?.homepage_products_view_details_button_font_family || 'Arial, sans-serif'} !important;
          font-size: ${themeData.typography?.homepage_products_view_details_button_font_size || 14}px !important;
          font-weight: ${themeData.typography?.homepage_products_view_details_button_font_weight || 'normal'} !important;
        }
        
        /* ========== LEGACY STYLES (for compatibility) ========== */
        body {
          background-color: ${themeData.colors.backgroundPrimary || themeData.colors.homepage_background_color || '#ffffff'} !important;
          color: ${themeData.colors.textPrimary || '#212529'} !important;
        }
        
        .btn-primary {
          background-color: ${themeData.colors.primary || '#007bff'} !important;
          border-color: ${themeData.colors.primary || '#007bff'} !important;
        }
        
        .btn-secondary {
          background-color: ${themeData.colors.secondary || '#6c757d'} !important;
          border-color: ${themeData.colors.secondary || '#6c757d'} !important;
        }
      `;
    }
    
    console.log('🎨 Generated CSS length:', css.length);
    return css;
  };

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    console.log('🎨 Loading saved theme:', savedTheme);
    console.log('🔍 Theme system initializing...');
    setCurrentTheme(savedTheme);
    
    // Load custom themes first to check if savedTheme is custom
    const storedCustomThemes = loadCustomThemes();
    
    // Check if saved theme is a custom theme
    const isCustomTheme = storedCustomThemes.find(theme => theme.id === savedTheme);
    
    if (isCustomTheme) {
      console.log('🎨 Applying saved custom theme:', isCustomTheme.name);
      // Apply custom theme directly
      setTimeout(() => {
        applyCustomTheme(isCustomTheme);
      }, 100);
    } else {
      console.log('🎨 Loading built-in theme:', savedTheme);
      // Load built-in theme CSS
      loadThemeCSS(savedTheme);
      
      // Debug: Check if theme CSS files exist
      fetch('/themes/variables.css')
        .then(response => {
          if (response.ok) {
            console.log('✅ variables.css found');
          } else {
            console.error('❌ variables.css not found');
          }
        })
        .catch(error => console.error('❌ Error checking variables.css:', error));
        
      fetch(`/themes/${savedTheme}.css`)
        .then(response => {
          if (response.ok) {
            console.log(`✅ ${savedTheme}.css found`);
          } else {
            console.error(`❌ ${savedTheme}.css not found`);
          }
        })
        .catch(error => console.error(`❌ Error checking ${savedTheme}.css:`, error));
    }
  }, []);

  // Load theme CSS
  const loadThemeCSS = async (themeId) => {
    try {
      console.log(`🎨 Loading theme CSS for: ${themeId}`);
      
      // Remove existing theme CSS
      const existingThemeLink = document.querySelector(`link[data-theme]`);
      if (existingThemeLink) {
        existingThemeLink.remove();
      }
      
      // Add new theme CSS
      const themeLink = document.createElement('link');
      themeLink.rel = 'stylesheet';
      themeLink.href = `/themes/${themeId}.css`;
      themeLink.setAttribute('data-theme', themeId);
      document.head.appendChild(themeLink);
      
      // Wait for CSS to load
      await new Promise((resolve) => {
        themeLink.onload = resolve;
        themeLink.onerror = resolve; // Don't fail if CSS doesn't exist
      });
      
      // Set data-theme attribute on document
      document.documentElement.setAttribute('data-theme', themeId);
      
      console.log(`✅ Theme CSS loaded for: ${themeId}`);
    } catch (error) {
      console.error(`❌ Error loading theme CSS for ${themeId}:`, error);
    }
  };

  // Sync custom theme colors to site settings
  const syncCustomThemeColorsToSiteSettings = async (themeColors, siteSettingsColors) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('⚠️ No auth token, skipping site settings sync');
        return false;
      }
      
      console.log('🎨 Syncing theme colors to site settings...');
      console.log('   Theme colors:', themeColors);
      console.log('   Site settings colors:', siteSettingsColors);
      
      // Prepare sync data
      const syncData = {
        theme_colors: themeColors,
        site_settings_colors: siteSettingsColors
      };
      
      const response = await fetch(createApiUrl('api/themes/sync-colors'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(syncData)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Theme colors synced to site settings:', result);
        return true;
      } else {
        const error = await response.json();
        console.error('❌ Failed to sync theme colors:', error);
        return false;
      }
    } catch (error) {
      console.error('❌ Error syncing theme colors to site settings:', error);
      return false;
    }
  };

  // Force CSS variables update
  const forceThemeUpdate = (themeId) => {
    const root = document.documentElement;
    
    // Ensure data-theme attribute is set
    root.setAttribute('data-theme', themeId);
    
    // Force style recalculation
    const body = document.body;
    const originalDisplay = body.style.display;
    body.style.display = 'none';
    void body.offsetHeight; // Trigger reflow
    body.style.display = originalDisplay;
    
    // Dispatch a custom event to notify components
    const event = new CustomEvent('themeForceUpdate', { 
      detail: { themeId } 
    });
    document.dispatchEvent(event);
    
    console.log(`🔄 Forced theme update for: ${themeId}`);
  };

  // Fetch site settings
  const fetchSiteSettings = async () => {
    try {
      // Get auth token for admin endpoint
      const token = localStorage.getItem('token');
      console.log('🔍 ThemeContext - Token found:', token ? 'YES' : 'NO');
      console.log('🔍 ThemeContext - User admin status:', userIsAdmin);
      
      // If no token OR user is known to not be admin, use public endpoint
      if (!token || userIsAdmin === false) {
        try {
          const response = await fetch(createApiUrl('api/site-settings'), {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(2000) // 2 second timeout
          });
          
          if (response.ok) {
            const settings = await response.json();
            console.log('📊 Site settings loaded from public endpoint:', Object.keys(settings).length, 'settings');
            setSiteSettings(settings);
            applyThemeSyncedStyles(settings);
            return settings;
          } else {
            console.warn('Public endpoint returned:', response.status);
            return null;
          }
        } catch (publicError) {
          console.warn('Public endpoint failed:', publicError.message);
          return null;
        }
      }
      
      // Try admin endpoint with auth token
      try {
        const response = await fetch(createApiUrl('api/admin/site-settings'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(2000) // 2 second timeout
        });
        
        if (response.ok) {
          const settings = await response.json();
          console.log('📊 Site settings loaded from admin endpoint:', Object.keys(settings).length, 'settings');
          // User has admin access
          setUserIsAdmin(true);
          setSiteSettings(settings);
          applyThemeSyncedStyles(settings);
          return settings;
        } else {
          console.warn('Admin endpoint returned:', response.status);
          if (response.status === 403) {
            console.log('🔒 User does not have admin privileges, marking as non-admin');
            // User is not admin, remember this to avoid future attempts
            setUserIsAdmin(false);
          }
          // Fall back to public endpoint directly (avoid infinite recursion)
          console.log('🔄 Falling back to public endpoint...');
          
          try {
            const publicResponse = await fetch(createApiUrl('api/site-settings'), {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
              },
              signal: AbortSignal.timeout(2000)
            });
            
            if (publicResponse.ok) {
              const settings = await publicResponse.json();
              console.log('📊 Site settings loaded from public fallback:', Object.keys(settings).length, 'settings');
              setSiteSettings(settings);
              applyThemeSyncedStyles(settings);
              return settings;
            } else {
              console.warn('Public fallback also returned:', publicResponse.status);
              return null;
            }
          } catch (publicFallbackError) {
            console.warn('Public fallback failed:', publicFallbackError.message);
            return null;
          }
        }
      } catch (adminError) {
        console.warn('Admin endpoint failed:', adminError.message);
        // If it's a network error or auth error, user might not be admin
        if (adminError.message.includes('403') || adminError.message.includes('Forbidden')) {
          console.log('🔒 User likely not admin due to error, marking as non-admin');
          setUserIsAdmin(false);
        }
        console.log('🔄 Falling back to public endpoint...');
        
        // Remove token and try public endpoint once
        try {
          const response = await fetch(createApiUrl('api/site-settings'), {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(2000)
          });
          
          if (response.ok) {
            const settings = await response.json();
            console.log('📊 Site settings loaded from public fallback:', Object.keys(settings).length, 'settings');
            setSiteSettings(settings);
            applyThemeSyncedStyles(settings);
            return settings;
          }
        } catch (fallbackError) {
          console.warn('Fallback also failed:', fallbackError.message);
        }
        
        return null;
      }
      
    } catch (error) {
      console.error('❌ Critical error fetching site settings:', error.message);
      // Return null instead of throwing to prevent loops
      return null;
    }
  };

  // Initial setup: load site settings and sync with saved theme - OPTIMIZED
  useEffect(() => {
    let isInitializing = false; // Guard against multiple initializations
    
    const initializeThemeAndSettings = async () => {
      if (isInitializing || isInitialized) {
        console.log('🛑 Initialization already in progress or completed, skipping...');
        return;
      }
      
      isInitializing = true;
      console.log('🚀 Fast initialization starting...');
      
      try {
        // Get saved theme
        const savedTheme = localStorage.getItem('selectedTheme') || 'default';
        
        // Set theme immediately (don't wait for CSS load)
        setCurrentTheme(savedTheme);
        
        // Mark as initialized early so header can render
        setIsInitialized(true);
        isInitializing = false;
        console.log('⚡ Quick initialization completed - UI can render');
        
        // Load theme CSS in background
        loadThemeCSS(savedTheme).then(() => {
          forceThemeUpdate(savedTheme);
          console.log('🎨 Theme CSS loaded in background');
        }).catch(error => {
          console.error('❌ Error loading theme CSS in background:', error);
        });
        
        // Load site settings in background with shorter timeout
        setTimeout(async () => {
          console.log('🔄 Loading site settings in background...');
          try {
            const settings = await Promise.race([
              fetchSiteSettings(),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
              )
            ]);
            
            if (settings) {
              console.log('✅ Site settings loaded successfully');
              applyThemeSyncedStyles(settings);
            } else {
              console.warn('⚠️ Site settings failed to load');
            }
          } catch (error) {
            console.warn('⚠️ Site settings loading timed out or failed:', error.message);
            // Continue with default settings
          }
        }, 100); // Load settings after 100ms
        
      } catch (error) {
        console.error('❌ Error during fast initialization:', error);
        // Still mark as initialized so app doesn't get stuck
        setIsInitialized(true);
        isInitializing = false;
      }
    };
    
    // Only initialize once
    if (!isInitialized) {
      initializeThemeAndSettings();
    }
  }, [isInitialized]); // Add isInitialized as dependency to prevent multiple runs

  // Change theme function with site settings sync
  const changeTheme = useCallback(async (themeId) => {
    if (themeId === currentTheme) return;
    
    console.log(`🎨 Changing theme from ${currentTheme} to ${themeId}`);
    console.log('🔍 Available custom themes:', customThemes);
    
    try {
      // Set updating flag
      setIsUpdatingSiteSettings(true);
      
      // Check if this is a custom theme (check both raw and localStorage)
      let customTheme = customThemes.find(theme => theme.id === themeId);
      
      // Fallback: also check localStorage directly
      if (!customTheme) {
        const storedCustomThemes = JSON.parse(localStorage.getItem('customThemes') || '[]');
        customTheme = storedCustomThemes.find(theme => theme.id === themeId);
        console.log('🔍 Checked localStorage custom themes:', storedCustomThemes);
      }
      
      if (customTheme) {
        // Handle custom theme
        console.log(`🎨 Found and applying custom theme:`, customTheme);
        applyCustomTheme(customTheme);
      } else {
        // Handle built-in theme
        console.log(`🎨 Applying built-in theme: ${themeId}`);
        
        // Load new theme CSS
        await loadThemeCSS(themeId);
        
        // Force theme update to ensure CSS variables are applied
        forceThemeUpdate(themeId);
        
        // Built-in theme sync: Updates site settings with theme colors
        // Latest change wins: Theme change → Theme colors, Manual change → Manual colors
        setTimeout(async () => {
          try {
            console.log('🔧 SYNC DEBUG: Starting sync for theme:', themeId);
            console.log('🔧 SYNC DEBUG: updateSiteSettingsToMatchTheme function exists:', typeof updateSiteSettingsToMatchTheme);
            
            const success = await updateSiteSettingsToMatchTheme(themeId);
            console.log('🔧 SYNC DEBUG: Backend sync result:', success);
            
            if (success) {
              const updatedSettings = await fetchSiteSettings();
              console.log('🔧 SYNC DEBUG: Updated settings fetched:', !!updatedSettings);
              
              if (updatedSettings) {
                console.log('✅ Site settings synchronized with built-in theme');
                console.log('🎨 Homepage background now:', updatedSettings.homepage_background_color);
                console.log('🎨 Header background now:', updatedSettings.header_background_color);
                
                // Force update site settings state to trigger component re-renders
                setSiteSettings(updatedSettings);
                applyThemeSyncedStyles(updatedSettings);
                
                // Dispatch events to notify components
                document.dispatchEvent(new CustomEvent('forceSiteSettingsRefresh', {
                  detail: { source: 'builtin-theme-sync', themeId: themeId, settings: updatedSettings }
                }));
                
                document.dispatchEvent(new CustomEvent('themeSettingsUpdated', {
                  detail: { source: 'builtin-theme-sync', settings: updatedSettings }
                }));
              }
            } else {
              console.error('❌ SYNC DEBUG: Backend sync failed');
            }
          } catch (error) {
            console.error('❌ SYNC DEBUG: Exception during sync:', error);
          }
        }, 300);
        
        // Theme change is now immediate, settings sync happens in background
      }
      
      // Update theme state
      setCurrentTheme(themeId);
      localStorage.setItem('selectedTheme', themeId);
      
      console.log(`✅ Theme changed to: ${themeId}`);
      
    } catch (error) {
      console.error('Error changing theme:', error);
    } finally {
      setIsUpdatingSiteSettings(false);
    }
  }, [currentTheme, customThemes]);

  // Listen for theme change requests (after changeTheme is available)
  useEffect(() => {
    const handleChangeThemeRequest = (event) => {
      console.log('🎨 Theme change request:', event.detail);
      if (event.detail.themeId) {
        changeTheme(event.detail.themeId);
      }
    };

    window.addEventListener('changeThemeRequest', handleChangeThemeRequest);
    
    return () => {
      window.removeEventListener('changeThemeRequest', handleChangeThemeRequest);
    };
  }, [changeTheme]); // Depend on changeTheme function

  // Refresh site settings (for manual updates)
  const refreshSiteSettings = async () => {
    console.log('🔄 Refreshing site settings...');
    try {
      const settings = await fetchSiteSettings();
      return settings;
    } catch (error) {
      console.error('❌ Error refreshing site settings:', error);
      return null;
    }
  };

  // Available themes array
  const builtInThemes = [
    { id: 'default', name: 'Default', icon: '🌟', type: 'builtin' },
    { id: 'dark', name: 'Dark', icon: '🌙', type: 'builtin' },
    { id: 'blue', name: 'Blue', icon: '💙', type: 'builtin' },
    { id: 'green', name: 'Green', icon: '💚', type: 'builtin' }
  ];

  // Custom themes formatted for theme selector
  const formattedCustomThemes = customThemes.map(theme => ({
    id: theme.id,
    name: theme.name,
    icon: '🎨',
    type: 'custom',
    description: theme.description
  }));

  // Combined themes array
  const themesArray = [...builtInThemes, ...formattedCustomThemes];

  const value = {
    currentTheme,
    siteSettings,
    isInitialized,
    isUpdatingSiteSettings,
    changeTheme,
    refreshSiteSettings,
    themesArray,
    builtInThemes,
    customThemes: formattedCustomThemes,
    loadCustomThemes,
    deleteCustomTheme,
    applyCustomTheme,
    // Debug function
    debugCustomThemes: () => {
      console.log('🐛 CUSTOM THEME DEBUG:');
      console.log('📊 Raw custom themes state:', customThemes);
      console.log('📊 Formatted custom themes:', formattedCustomThemes);
      console.log('📊 localStorage custom themes:', JSON.parse(localStorage.getItem('customThemes') || '[]'));
      console.log('📊 Current theme:', currentTheme);
      console.log('📊 All available themes:', themesArray);
      console.log('📊 Is current theme custom:', customThemes.some(theme => theme.id === currentTheme));
    },
    // Theme utilities
    isDarkMode: currentTheme === 'dark',
    isLightMode: currentTheme === 'default',
    isBlueTheme: currentTheme === 'blue',
    isGreenTheme: currentTheme === 'green',
    isCustomTheme: customThemes.some(theme => theme.id === currentTheme)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 