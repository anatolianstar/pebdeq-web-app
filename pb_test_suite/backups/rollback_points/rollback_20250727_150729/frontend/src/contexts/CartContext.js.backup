import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'react-hot-toast';
import { createApiUrl } from '../utils/config';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);



  // Initialize cart when component mounts
  useEffect(() => {
    console.log('🛒 CartProvider - initializing cart...');
    initializeCart();
  }, []);

  // Handle user authentication changes
  useEffect(() => {
    // Skip if we're still loading
    if (loading) return;
    

    
    if (isAuthenticated) {
      // User is authenticated, fetch their cart
      
      fetchCart();
    } else {
      // User is not authenticated, ensure we have a session
      
      const guestSessionId = getSessionId();
      console.log('🛒 Guest session ID:', guestSessionId);
      fetchCart();
    }
  }, [isAuthenticated]); // Only depend on isAuthenticated, not user

  const getSessionId = () => {
    if (!sessionId) {
      const newSessionId = localStorage.getItem('cart_session_id') || generateSessionId();
      console.log('🛒 Generated/Retrieved session ID:', newSessionId);
      setSessionId(newSessionId);
      localStorage.setItem('cart_session_id', newSessionId);
      return newSessionId;
    }
    return sessionId;
  };

  const generateSessionId = () => {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  const getHeaders = () => {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (isAuthenticated) {
      headers['Authorization'] = `Bearer ${localStorage.getItem('token')}`;
      
    } else {
      headers['X-Session-ID'] = getSessionId();
      console.log('🛒 Using session ID for request:', getSessionId());
    }

    return headers;
  };

  const initializeCart = async () => {
    try {
      setLoading(true);
      console.log('🛒 Initializing cart...');
      
      // Wait a moment for auth to initialize
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (isAuthenticated) {

      } else {
        // For guest users, create session if not exists
        const guestSessionId = getSessionId();

      }
      
      await fetchCart();
    } catch (error) {
      console.error('❌ Error initializing cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      const headers = getHeaders();
      console.log('🛒 Fetching cart with headers:', headers);
      
      const response = await fetch(createApiUrl('api/cart'), {
        headers: headers
      });

      console.log('🛒 Fetch cart response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('🛒 Cart data received:', data);
        console.log('🛒 Cart items count:', data.cart?.items?.length || 0);
        setCartItems(data.cart?.items || []);
      } else {
        console.error('❌ Failed to fetch cart, status:', response.status);
        const errorData = await response.json();
        console.error('❌ Error details:', errorData);
      }
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      setLoading(true);
      
      // Check if product exists and has an id
      if (!product || !product.id) {
        console.error('❌ Product ID is required');
        toast.error('Product ID is required');
        return false;
      }

      console.log('🛒 Adding to cart:', product.name, 'quantity:', quantity);

      const response = await fetch(createApiUrl('api/cart/add'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity
        })
      });

      console.log('🛒 Add to cart response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('🛒 Add to cart response data:', data);
        setCartItems(data.cart?.items || []);
        toast.success('Item added to cart!');
        return true;
      } else {
        const error = await response.json();
        console.error('❌ Add to cart error:', error);
        toast.error(error.error || 'Failed to add item to cart');
        return false;
      }
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      toast.error('Error adding item to cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId) => {
    try {
      setLoading(true);
      console.log('🛒 Removing from cart, item ID:', itemId);

      const response = await fetch(createApiUrl('api/cart/remove'), {
        method: 'DELETE',
        headers: getHeaders(),
        body: JSON.stringify({
          item_id: itemId
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🛒 Remove from cart response data:', data);
        setCartItems(data.cart?.items || []);
        toast.success('Item removed from cart');
        return true;
      } else {
        const error = await response.json();
        console.error('❌ Remove from cart error:', error);
        toast.error(error.error || 'Failed to remove item from cart');
        return false;
      }
    } catch (error) {
      console.error('❌ Error removing from cart:', error);
      toast.error('Error removing item from cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      setLoading(true);
      console.log('🛒 Updating quantity, item ID:', itemId, 'quantity:', quantity);

      const response = await fetch(createApiUrl('api/cart/update'), {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({
          item_id: itemId,
          quantity: quantity
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🛒 Update quantity response data:', data);
        setCartItems(data.cart?.items || []);
        return true;
      } else {
        const error = await response.json();
        console.error('❌ Update quantity error:', error);
        toast.error(error.error || 'Failed to update quantity');
        return false;
      }
    } catch (error) {
      console.error('❌ Error updating quantity:', error);
      toast.error('Error updating quantity');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      console.log('🛒 Clearing cart...');

      const response = await fetch(createApiUrl('api/cart/clear'), {
        method: 'DELETE',
        headers: getHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🛒 Clear cart response data:', data);
        setCartItems([]);
        toast.success('Cart cleared');
        return true;
      } else {
        const error = await response.json();
        console.error('❌ Clear cart error:', error);
        toast.error(error.error || 'Failed to clear cart');
        return false;
      }
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      toast.error('Error clearing cart');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const mergeGuestCart = async () => {
    try {
      if (!sessionId) return;

      const response = await fetch(createApiUrl('api/cart/merge'), {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          session_id: sessionId
        })
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cart?.items || []);
        // Clear session data
        localStorage.removeItem('cart_session_id');
        setSessionId(null);
        // Cart merged successfully
      }
    } catch (error) {
      console.error('❌ Error merging cart:', error);
    }
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cartItems.length;
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.product_id === productId);
  };

  const getCartItem = (productId) => {
    return cartItems.find(item => item.product_id === productId);
  };

  const value = {
    cartItems,
    loading,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getCartItemCount,
    isInCart,
    getCartItem,
    fetchCart,
    sessionId
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}; 