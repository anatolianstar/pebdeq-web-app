// Theme Performance Optimization Utilities
import { THEMES } from './index';

// Theme cache for quick access
const themeCache = new Map();
const styleCache = new Map();

// Performance monitoring
const performanceMetrics = {
  themeLoadTime: 0,
  transitionTime: 0,
  cacheHits: 0,
  cacheMisses: 0
};

// CSS optimization utilities
export const CSSOptimizer = {
  // Preload critical CSS variables
  preloadCriticalCSS: () => {
    const criticalVars = [
      '--primary-color',
      '--bg-primary',
      '--text-primary',
      '--border-color'
    ];
    
    // Pre-compute critical styles
    Object.keys(THEMES).forEach(themeId => {
      const theme = THEMES[themeId];
      // Skip if theme doesn't have colors property
      if (!theme.colors) {
        console.warn(`Theme ${themeId} doesn't have colors property, skipping critical CSS optimization`);
        return;
      }
      
      const criticalStyles = criticalVars.reduce((acc, varName) => {
        const propName = varName.replace('--', '').replace('-', '');
        acc[varName] = theme.colors[propName] || theme.colors.primary;
        return acc;
      }, {});
      
      styleCache.set(`${themeId}-critical`, criticalStyles);
    });
  },

  // Optimize CSS custom properties
  optimizeCustomProperties: (themeId) => {
    const cacheKey = `${themeId}-optimized`;
    
    if (styleCache.has(cacheKey)) {
      performanceMetrics.cacheHits++;
      return styleCache.get(cacheKey);
    }
    
    performanceMetrics.cacheMisses++;
    const theme = THEMES[themeId];
    
    if (!theme || !theme.colors) {
      console.warn(`Theme optimization failed: Theme '${themeId}' or theme colors not found`);
      return null;
    }
    
    // Create optimized CSS variables object
    const optimizedVars = {
      '--primary-color': theme.colors.primary || '#007bff',
      '--primary-hover': theme.colors.primaryHover || '#0056b3',
      '--text-primary': theme.colors.textPrimary || '#333333',
      '--text-secondary': theme.colors.textSecondary || '#666666',
      '--bg-primary': theme.colors.bgPrimary || '#ffffff',
      '--bg-secondary': theme.colors.bgSecondary || '#f8f9fa',
      '--border-color': theme.colors.borderColor || '#dee2e6',
      '--card-bg': theme.colors.cardBg || '#ffffff',
      '--shadow-color': theme.colors.shadowColor || 'rgba(0,0,0,0.1)',
      '--success-color': theme.colors.success || '#28a745',
      '--warning-color': theme.colors.warning || '#ffc107',
      '--error-color': theme.colors.error || '#dc3545',
      '--info-color': theme.colors.info || '#17a2b8'
    };
    
    styleCache.set(cacheKey, optimizedVars);
    return optimizedVars;
  },

  // Apply optimized styles with minimal reflow
  applyOptimizedStyles: (variables) => {
    const root = document.documentElement;
    const startTime = performance.now();
    
    // Batch DOM updates
    root.style.cssText += Object.entries(variables)
      .map(([key, value]) => `${key}:${value}`)
      .join(';');
    
    performanceMetrics.transitionTime = performance.now() - startTime;
  }
};

// Theme loading optimization
export const ThemeLoader = {
  // Preload theme assets
  preloadTheme: async (themeId) => {
    if (themeCache.has(themeId)) {
      return themeCache.get(themeId);
    }
    
    const theme = THEMES[themeId];
    if (!theme) return null;
    
    // Preload and cache theme data
    const themeData = {
      ...theme,
      preloaded: true,
      timestamp: Date.now()
    };
    
    themeCache.set(themeId, themeData);
    return themeData;
  },

  // Lazy load theme CSS
  lazyLoadThemeCSS: (themeId) => {
    return new Promise((resolve) => {
      const existingLink = document.querySelector(`link[data-theme="${themeId}"]`);
      
      if (existingLink) {
        resolve();
        return;
      }
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `/themes/${themeId}.css`;
      link.dataset.theme = themeId;
      
      link.onload = () => resolve();
      link.onerror = () => resolve(); // Continue even if CSS fails to load
      
      document.head.appendChild(link);
    });
  },

  // Clean up unused theme CSS
  cleanupUnusedCSS: (currentThemeId) => {
    const themeLinks = document.querySelectorAll('link[data-theme]');
    
    themeLinks.forEach(link => {
      if (link.dataset.theme !== currentThemeId) {
        // Keep only current theme and default theme
        if (link.dataset.theme !== 'default') {
          link.remove();
        }
      }
    });
  }
};

// Animation optimization
export const AnimationOptimizer = {
  // Check if user prefers reduced motion
  prefersReducedMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Optimize transition timing
  getOptimalTransitionDuration: () => {
    const isReducedMotion = AnimationOptimizer.prefersReducedMotion();
    const isLowEndDevice = navigator.hardwareConcurrency <= 2;
    
    if (isReducedMotion) return 0;
    if (isLowEndDevice) return 150;
    return 300;
  },

  // Apply optimized transitions
  applyOptimizedTransitions: (element, duration = null) => {
    const optimalDuration = duration || AnimationOptimizer.getOptimalTransitionDuration();
    
    if (optimalDuration === 0) {
      element.style.transition = 'none';
      return;
    }
    
    element.style.transition = `all ${optimalDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
  }
};

// Memory optimization
export const MemoryOptimizer = {
  // Clean up theme cache periodically
  cleanupCache: () => {
    const maxCacheSize = 10;
    const maxAge = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();
    
    // Remove old entries
    for (const [key, value] of themeCache.entries()) {
      if (value.timestamp && (now - value.timestamp) > maxAge) {
        themeCache.delete(key);
      }
    }
    
    // Limit cache size
    if (themeCache.size > maxCacheSize) {
      const entries = Array.from(themeCache.entries());
      entries.sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0));
      
      // Keep only the most recent entries
      themeCache.clear();
      entries.slice(0, maxCacheSize).forEach(([key, value]) => {
        themeCache.set(key, value);
      });
    }
  },

  // Monitor memory usage
  getMemoryUsage: () => {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }
};

// Performance monitoring
export const PerformanceMonitor = {
  startThemeChange: () => {
    return performance.now();
  },

  endThemeChange: (startTime) => {
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    performanceMetrics.themeLoadTime = duration;
    
    // Log performance if it's slow
    if (duration > 100) {
      console.warn(`Theme change took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  },

  getMetrics: () => {
    return {
      ...performanceMetrics,
      cacheSize: themeCache.size,
      styleCacheSize: styleCache.size,
      memoryUsage: MemoryOptimizer.getMemoryUsage()
    };
  },

  // Performance optimization recommendations
  getOptimizationRecommendations: () => {
    const metrics = PerformanceMonitor.getMetrics();
    const recommendations = [];
    
    if (metrics.themeLoadTime > 100) {
      recommendations.push('Consider preloading themes');
    }
    
    if (metrics.cacheMisses > metrics.cacheHits * 2) {
      recommendations.push('Increase cache hit ratio');
    }
    
    if (metrics.cacheSize > 10) {
      recommendations.push('Clean up theme cache');
    }
    
    return recommendations;
  }
};

// Main optimization function
export const optimizeThemePerformance = async (themeId) => {
  const startTime = PerformanceMonitor.startThemeChange();
  
  try {
    // 1. Preload theme if not cached
    await ThemeLoader.preloadTheme(themeId);
    
    // 2. Get optimized CSS variables
    const optimizedVars = CSSOptimizer.optimizeCustomProperties(themeId);
    
    // 3. Apply optimized styles
    if (optimizedVars) {
      CSSOptimizer.applyOptimizedStyles(optimizedVars);
    }
    
    // 4. Lazy load theme CSS
    await ThemeLoader.lazyLoadThemeCSS(themeId);
    
    // 5. Clean up unused resources
    ThemeLoader.cleanupUnusedCSS(themeId);
    
    // 6. Apply optimized transitions
    const body = document.body;
    AnimationOptimizer.applyOptimizedTransitions(body);
    
    PerformanceMonitor.endThemeChange(startTime);
    
    return true;
  } catch (error) {
    console.error('Theme optimization failed:', error);
    PerformanceMonitor.endThemeChange(startTime);
    return false;
  }
};

// Initialize performance optimizations
export const initializePerformanceOptimizations = () => {
  // Preload critical CSS
  CSSOptimizer.preloadCriticalCSS();
  
  // Set up cache cleanup interval
  setInterval(() => {
    MemoryOptimizer.cleanupCache();
  }, 60000); // Every minute
  
  // Performance monitoring
  if (process.env.NODE_ENV === 'development') {
    setInterval(() => {
      const metrics = PerformanceMonitor.getMetrics();
    }, 10000); // Every 10 seconds in development
  }
};

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  CSSOptimizer,
  ThemeLoader,
  AnimationOptimizer,
  MemoryOptimizer,
  PerformanceMonitor,
  optimizeThemePerformance,
  initializePerformanceOptimizations
}; 