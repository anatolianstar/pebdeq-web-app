import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// OPTIMIZED: Import CSS in proper order for cascading
import './styles/globals.css';
import './styles/variables.css'; // Base CSS variables
import './styles/utilities.css';

// OPTIMIZED: Import ALL theme CSS files upfront for instant switching
// This prevents re-downloading CSS files on theme change
import './themes/default.css';  // Aurora theme
import './themes/dark.css';     // Dark theme  
import './themes/blue.css';     // Ocean theme (our optimized version)
import './themes/green.css';    // Nature theme

import './App.css'; // App-specific styles last

import Header from './components/Header';
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

// OPTIMIZED: Theme initialization helper
const initializeThemeOnLoad = () => {
  // Set initial theme attribute to prevent FOUC (Flash of Unstyled Content)
  const savedTheme = localStorage.getItem('selectedTheme') || 'default';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  // Add performance markers
  if (window.performance && window.performance.mark) {
    window.performance.mark('theme-init-start');
  }
  
  console.log('🎨 Initial theme set:', savedTheme);
};

// Initialize theme immediately when module loads
initializeThemeOnLoad();

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CartProvider>
          <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ScrollToTop />
            <div className="App fade-in">
              <Header />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
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