import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const Cart = () => {
  const { 
    cartItems, 
    loading, 
    removeFromCart, 
    updateQuantity, 
    clearCart, 
    getTotalItems, 
    getTotalPrice,
    fetchCart
  } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Refresh cart when component mounts
    fetchCart();
  }, []);

  const handleQuantityChange = (itemId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(itemId);
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId) => {
    if (window.confirm('Are you sure you want to remove this item from your cart?')) {
      removeFromCart(itemId);
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your entire cart?')) {
      clearCart();
    }
  };

  if (loading) {
    return (
      <div className="cart fade-in">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart fade-in">
      <div className="container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          {cartItems.length > 0 && (
            <p>{getTotalItems()} item(s) in your cart</p>
          )}
        </div>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Add some products to your cart to get started.</p>
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="cart-content">
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-image">
                    {item.product?.image_url ? (
                      <img 
                        src={item.product.image_url.startsWith('http') 
                          ? item.product.image_url 
                          : `http://localhost:5005${item.product.image_url}`
                        } 
                        alt={item.product?.name || 'Product'} 
                      />
                    ) : (
                      <div className="no-image">📦</div>
                    )}
                  </div>
                  
                  <div className="item-details">
                    <h3 className="item-name">
                      {item.product ? (
                        <Link to={`/product/${item.product.slug}`}>
                          {item.product.name}
                        </Link>
                      ) : (
                        `Product ID: ${item.product_id}`
                      )}
                    </h3>
                    
                    <div className="item-info">
                      <p className="item-price">
                        <span className="current-price">${item.price?.toFixed(2)}</span>
                        {item.product?.current_price && item.product.current_price !== item.price && (
                          <span className="updated-price">
                            (Current: ${item.product.current_price.toFixed(2)})
                          </span>
                        )}
                      </p>
                      
                      <div className="quantity-controls">
                        <label>Quantity:</label>
                        <div className="quantity-input">
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={loading || item.quantity <= 1}
                            className="quantity-btn"
                          >
                            -
                          </button>
                          <input 
                            type="number" 
                            value={item.quantity} 
                            onChange={(e) => {
                              const value = parseInt(e.target.value);
                              if (!isNaN(value) && value >= 0) {
                                handleQuantityChange(item.id, value);
                              }
                            }}
                            min="1"
                            className="quantity-field"
                            disabled={loading}
                          />
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            disabled={loading}
                            className="quantity-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      
                      <p className="item-subtotal">
                        Subtotal: ${item.subtotal?.toFixed(2) || (item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="item-actions">
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="btn btn-remove"
                      disabled={loading}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="cart-summary">
              <div className="summary-card">
                <h3>Order Summary</h3>
                <div className="summary-line">
                  <span>Items ({getTotalItems()}):</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="summary-line">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="summary-line total">
                  <span>Total:</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                
                <div className="checkout-actions">
                  {isAuthenticated ? (
                    <Link to="/checkout" className="btn btn-primary btn-checkout">
                      Proceed to Checkout
                    </Link>
                  ) : (
                    <div className="login-prompt">
                      <p>Please log in to checkout</p>
                      <Link to="/login" className="btn btn-primary">
                        Log In
                      </Link>
                      <Link to="/register" className="btn btn-outline">
                        Sign Up
                      </Link>
                    </div>
                  )}
                  
                  <Link to="/products" className="btn btn-outline">
                    Continue Shopping
                  </Link>
                  
                  <button 
                    onClick={handleClearCart}
                    className="btn btn-danger"
                    disabled={loading}
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .cart {
          padding: 2rem 0;
          min-height: 70vh;
        }

        .cart-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .cart-header h1 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .cart-header p {
          color: #6c757d;
          font-size: 1.1rem;
        }

        .loading-spinner {
          text-align: center;
          padding: 4rem;
        }

        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-cart {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .empty-cart-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-cart h2 {
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .empty-cart p {
          color: #6c757d;
          margin-bottom: 2rem;
        }

        .cart-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          align-items: start;
        }

        .cart-items {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 100px 1fr auto;
          gap: 1rem;
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
          align-items: center;
        }

        .cart-item:last-child {
          border-bottom: none;
        }

        .item-image {
          width: 100px;
          height: 100px;
          border-radius: 8px;
          overflow: hidden;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          font-size: 2rem;
          color: #6c757d;
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
        }

        .item-name a {
          color: inherit;
          text-decoration: none;
        }

        .item-name a:hover {
          color: #007bff;
          text-decoration: underline;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .item-price {
          margin: 0;
          font-weight: 600;
        }

        .current-price {
          color: #007bff;
          font-size: 1.1rem;
        }

        .updated-price {
          color: #6c757d;
          font-size: 0.9rem;
          margin-left: 0.5rem;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .quantity-controls label {
          font-weight: 500;
          color: #2c3e50;
        }

        .quantity-input {
          display: flex;
          align-items: center;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }

        .quantity-btn {
          background: #f8f9fa;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          transition: background-color 0.2s;
          min-width: 30px;
        }

        .quantity-btn:hover:not(:disabled) {
          background: #e9ecef;
        }

        .quantity-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quantity-field {
          border: none;
          padding: 0.5rem;
          width: 60px;
          text-align: center;
          font-size: 1rem;
        }

        .item-subtotal {
          margin: 0;
          font-weight: 600;
          color: #28a745;
        }

        .item-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .summary-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 2rem;
          position: sticky;
          top: 2rem;
        }

        .summary-card h3 {
          margin: 0 0 1rem 0;
          color: #2c3e50;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e9ecef;
        }

        .summary-line {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          color: #2c3e50;
        }

        .summary-line.total {
          border-top: 2px solid #e9ecef;
          margin-top: 1rem;
          padding-top: 1rem;
          font-weight: 600;
          font-size: 1.2rem;
        }

        .checkout-actions {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .login-prompt {
          text-align: center;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .login-prompt p {
          margin: 0 0 1rem 0;
          color: #6c757d;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          text-align: center;
          display: inline-block;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
          text-decoration: none;
          color: white;
        }

        .btn-outline {
          background: transparent;
          color: #007bff;
          border: 2px solid #007bff;
        }

        .btn-outline:hover:not(:disabled) {
          background: #007bff;
          color: white;
          text-decoration: none;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #c82333;
        }

        .btn-remove {
          background: transparent;
          color: #dc3545;
          border: 1px solid #dc3545;
          padding: 0.5rem;
          font-size: 0.8rem;
        }

        .btn-remove:hover:not(:disabled) {
          background: #dc3545;
          color: white;
        }

        .btn-checkout {
          font-size: 1.1rem;
          padding: 1rem 2rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .cart-content {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .cart-item {
            grid-template-columns: 80px 1fr;
            gap: 1rem;
          }

          .item-actions {
            grid-column: 1 / -1;
            margin-top: 1rem;
          }

          .item-info {
            gap: 0.75rem;
          }

          .quantity-controls {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .summary-card {
            position: static;
          }

          .checkout-actions {
            gap: 0.75rem;
          }

          .login-prompt {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Cart; 