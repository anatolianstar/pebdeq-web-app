import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// OPTIMIZED: Import CSS in proper order for cascading
import './styles/globals.css';
// import './styles/variables.css'; // Base CSS variables - Disabled to prevent conflicts
import './styles/utilities.css';
import './styles/responsive.css';

// Import cleanup utility (auto-runs in development with ?cleanup=mydark)
import './utils/cleanupMyDarkThemes';

// Import cache management for consistent cross-device styling
import cacheManager from './utils/cacheManagement';

// Note: Theme CSS files are now loaded dynamically from public/themes/
// This prevents bundling all themes and allows for better performance

import './App.css'; // App-specific styles last
import './styles/theme-bridge.css'; // Theme variable bridge - MUST be last for theme overrides

import Header from './components/Header';
import MultiPageThemeManager from './components/live-theme-editor/MultiPageThemeManager';
import CanvasEditorLocal from './components/CanvasEditorLocal';
import CacheDebugger from './components/CacheDebugger';
import RuntimePagesThemeLoader from './components/RuntimePagesThemeLoader';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

import Home from './pages/Home';

import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Category from './pages/Category';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import UserDashboard from './pages/UserDashboard';
import UserSettings from './pages/UserSettings';
import Orders from './pages/Orders';
import AdminDashboard from './pages/AdminDashboard';
import TestDashboard from './pages/TestDashboard';
import ThemeControlPanel from './pages/ThemeControlPanel';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import ReturnPolicy from './pages/ReturnPolicy';
import CookiePolicy from './pages/CookiePolicy';
import DMCANotice from './pages/DMCANotice';
import AccessibilityStatement from './pages/AccessibilityStatement';
import ShippingPolicy from './pages/ShippingPolicy';

// OPTIMIZED: Import contexts in dependency order
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext'; // Must be before components that use themes
import { CartProvider } from './contexts/CartContext';

// Import theme service for enhanced theme management
import themeService from './services/ThemeService';

// Import unified theme loader
import UnifiedThemeLoader from './components/UnifiedThemeLoader';

// Enhanced theme initialization with service integration
const initializeThemeOnLoad = async () => {
  // Set initial theme attribute to prevent FOUC (Flash of Unstyled Content)
  const savedTheme = localStorage.getItem('selectedTheme') || 'pq-light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Add performance markers
  if (window.performance && window.performance.mark) {
    window.performance.mark('theme-init-start');
  }
  
  try {
    // Initialize theme service with current theme
    await themeService.switchTheme(savedTheme, { 
      showLoader: false,
      skipTransition: true // Skip transition on initial load
    });
    
    // Preload common themes for faster switching
    // Note: PQ themes now have automatic loading system, no need for preload
    // const commonThemes = ['pq-light', 'pq-dark', 'pq-gray'];
    // themeService.preloadThemes(commonThemes.filter(t => t !== savedTheme));

    console.log('✅ Enhanced theme system initialized:', savedTheme);
  } catch (error) {
    console.warn('⚠️ Theme service initialization failed, using fallback:', error);
    // Fallback to basic initialization
    document.documentElement.setAttribute('data-theme', savedTheme);
  }
  
  // Performance marker
  if (window.performance && window.performance.mark) {
    window.performance.mark('theme-init-complete');
    try {
      window.performance.measure('theme-init-duration', 'theme-init-start', 'theme-init-complete');
    } catch (e) {
      // Ignore measurement errors
    }
  }

  // Initialize cache management for consistent cross-device styling
  try {
    await cacheManager.initialize();
    console.log('✅ Cache management initialized for consistent styling');
  } catch (error) {
    console.warn('⚠️ Cache management initialization warning:', error);
  }
};

// Initialize theme immediately when module loads
initializeThemeOnLoad();



function App() {
  // Homepage style preference
  const [homepageStyle, setHomepageStyle] = useState(() => {
    return localStorage.getItem('homepageStyle') || 'default';
  });

  // Cache debugger visibility state
  const [showCacheDebugger, setShowCacheDebugger] = useState(() => {
    return localStorage.getItem('showCacheDebugger') === 'true' || 
           new URLSearchParams(window.location.search).has('debug-cache');
  });

  useEffect(() => {
    // Listen for homepage style changes from ThemeBuilder
    const handleHomepageStyleChange = (event) => {
      const newStyle = event.detail.style;
      console.log('🏠 Homepage style changed to:', newStyle);
      setHomepageStyle(newStyle);
    };

    // Listen for cache debugger toggle
    const handleToggleCacheDebugger = () => {
      setShowCacheDebugger(prev => {
        const newValue = !prev;
        localStorage.setItem('showCacheDebugger', newValue.toString());
        return newValue;
      });
    };

    const handleHideCacheDebugger = () => {
      setShowCacheDebugger(false);
      localStorage.setItem('showCacheDebugger', 'false');
    };

    // Keyboard shortcut to toggle cache debugger (Ctrl+Shift+D)
    const handleKeyDown = (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        handleToggleCacheDebugger();
      }
    };

    window.addEventListener('homepageStyleChanged', handleHomepageStyleChange);
    window.addEventListener('toggleCacheDebugger', handleToggleCacheDebugger);
    window.addEventListener('hideCacheDebugger', handleHideCacheDebugger);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('homepageStyleChanged', handleHomepageStyleChange);
      window.removeEventListener('toggleCacheDebugger', handleToggleCacheDebugger);
      window.removeEventListener('hideCacheDebugger', handleHideCacheDebugger);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Dynamic Homepage Component Selection
  const getCurrentHomepage = () => {
    return <Home />;
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <RuntimePagesThemeLoader />
            <UnifiedThemeLoader />
            <div className="App fade-in">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={getCurrentHomepage()} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/category/:slug" element={<Category />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order-confirmation" element={<OrderConfirmation />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogPost />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/user-dashboard" element={<UserDashboard />} />
                  <Route path="/user-settings" element={<UserSettings />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/tests" element={<TestDashboard />} />
                  <Route path="/admin/themes" element={<ThemeControlPanel />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/return-policy" element={<ReturnPolicy />} />
                  <Route path="/cookie-policy" element={<CookiePolicy />} />
                  <Route path="/dmca-notice" element={<DMCANotice />} />
                  <Route path="/accessibility-statement" element={<AccessibilityStatement />} />
                  <Route path="/shipping-policy" element={<ShippingPolicy />} />
                </Routes>
              </main>
              <Footer />
            </div>
            
            {/* Floating Theme Button / Theme Manager */}
            <MultiPageThemeManager />

            {/* 🎨 Canvas Editor Local - Extension Alternative */}
            <CanvasEditorLocal />
            
            {/* 🔧 Cache Debugger for styling consistency */}
            <CacheDebugger isVisible={showCacheDebugger} />
            
            {/* OPTIMIZED: Theme-aware toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: 'var(--card-bg, #363636)',
                  color: 'var(--text-primary, #fff)',
                  border: '1px solid var(--border-color, #555)',
                  borderRadius: 'var(--border-radius-md, 8px)',
                  boxShadow: 'var(--shadow-lg, 0 4px 12px rgba(0,0,0,0.15))',
                },
                success: {
                  style: {
                    background: 'var(--success-bg, #d4edda)',
                    color: 'var(--success-color, #155724)',
                    border: '1px solid var(--success-border, #c3e6cb)',
                  },
                },
                error: {
                  style: {
                    background: 'var(--danger-bg, #f8d7da)',
                    color: 'var(--danger-color, #721c24)',
                    border: '1px solid var(--danger-border, #f5c6cb)',
                  },
                },
                loading: {
                  style: {
                    background: 'var(--info-bg, #d1ecf1)',
                    color: 'var(--info-color, #0c5460)',
                    border: '1px solid var(--info-border, #bee5eb)',
                  },
                },
              }}
            />
            

          </Router>
          

        </CartProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;