import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { createApiUrl } from '../utils/config';

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, getTotalItems, getTotalPrice, clearCart, loading: cartLoading } = useCart();
  const { user, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  
  // Order form state
  const [orderForm, setOrderForm] = useState({
    shipping_address_id: '',
    billing_address_id: '',
    payment_method: 'credit_card',
    notes: ''
  });

  // New address form state
  const [newAddress, setNewAddress] = useState({
    title: 'Home',
    first_name: '',
    last_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: 'Turkey',
    phone: ''
  });

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    card_number: '',
    card_name: '',
    expiry_date: '',
    cvv: ''
  });

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      toast.error('Please log in to checkout');
      navigate('/login');
      return;
    }

    // Redirect if cart is empty
    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      navigate('/cart');
      return;
    }

    fetchAddresses();
  }, [isAuthenticated, cartItems, navigate]);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/users/addresses', {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
        
        // Select default address if available
        const defaultAddress = data.addresses?.find(addr => addr.is_default);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress);
          setOrderForm(prev => ({
            ...prev,
            shipping_address_id: defaultAddress.id,
            billing_address_id: defaultAddress.id
          }));
        }
      } else {
        console.error('Failed to fetch addresses:', response.status);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newAddress)
      });

      if (response.ok) {
        const data = await response.json();
        setAddresses(prev => [...prev, data.address]);
        setSelectedAddress(data.address);
        setOrderForm(prev => ({
          ...prev,
          shipping_address_id: data.address.id,
          billing_address_id: data.address.id
        }));
        setShowNewAddressForm(false);
        setNewAddress({
          title: 'Home',
          first_name: '',
          last_name: '',
          address_line1: '',
          address_line2: '',
          city: '',
          postal_code: '',
          country: 'Turkey',
          phone: ''
        });
        toast.success('Address added successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Error adding address');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }

    if (orderForm.payment_method === 'credit_card') {
      if (!paymentForm.card_number || !paymentForm.card_name || !paymentForm.expiry_date || !paymentForm.cvv) {
        toast.error('Please fill in all payment details');
        return;
      }
    }

    try {
      setLoading(true);

      // Create order via API
      const orderData = {
        shipping_address_id: selectedAddress.id,
        billing_address_id: selectedAddress.id, // Same as shipping for now
        payment_method: orderForm.payment_method,
        notes: orderForm.notes
      };

      const response = await fetch(createApiUrl('api/orders/create'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Order placed successfully!');
        
        // Redirect to order confirmation
        navigate('/order-confirmation', { 
          state: { 
            order: data.order,
            orderNumber: data.order.order_number,
            total: data.order.total_amount,
            address: selectedAddress
          }
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to place order');
      }

    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getShippingCost = () => {
    // Free shipping for orders over $100
    return getTotalPrice() >= 100 ? 0 : 10;
  };

  const getTax = () => {
    // 18% tax
    return (getTotalPrice() + getShippingCost()) * 0.18;
  };

  const getFinalTotal = () => {
    return getTotalPrice() + getShippingCost() + getTax();
  };

  if (!isAuthenticated || cartItems.length === 0) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="checkout fade-in">
      <div className="container">
        <div className="checkout-header">
          <h1>Checkout</h1>
          <p>Complete your order ({getTotalItems()} items)</p>
        </div>

        <div className="checkout-content">
          {/* Left Column - Forms */}
          <div className="checkout-forms">
            {/* Shipping Address */}
            <div className="checkout-section">
              <h2>Shipping Address</h2>
              
              {addresses.length > 0 ? (
                <div className="address-selection">
                  {addresses.map((address) => (
                    <div 
                      key={address.id} 
                      className={`address-card ${selectedAddress?.id === address.id ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedAddress(address);
                        setOrderForm(prev => ({
                          ...prev,
                          shipping_address_id: address.id,
                          billing_address_id: address.id
                        }));
                      }}
                    >
                      <div className="address-header">
                        <h4>{address.title}</h4>
                        {address.is_default && <span className="default-badge">Default</span>}
                      </div>
                                              <p>{address?.first_name || 'N/A'} {address?.last_name || 'N/A'}</p>
                      <p>{address.address_line1}</p>
                      {address.address_line2 && <p>{address.address_line2}</p>}
                      <p>{address.city}, {address.postal_code}</p>
                      <p>{address.country}</p>
                      {address.phone && <p>Phone: {address.phone}</p>}
                    </div>
                  ))}
                  
                  <button 
                    className="btn btn-outline add-address-btn"
                    onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                  >
                    + Add New Address
                  </button>
                </div>
              ) : (
                <div className="no-addresses">
                  <p>No saved addresses found. Please add a shipping address.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowNewAddressForm(true)}
                  >
                    Add Address
                  </button>
                </div>
              )}

              {/* New Address Form */}
              {showNewAddressForm && (
                <form onSubmit={handleAddNewAddress} className="new-address-form">
                  <h3>Add New Address</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Address Title</label>
                      <select
                        value={newAddress.title}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, title: e.target.value }))}
                        required
                      >
                        <option value="Home">Home</option>
                        <option value="Work">Work</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input
                        type="text"
                        value={newAddress.first_name}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, first_name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input
                        type="text"
                        value={newAddress.last_name}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, last_name: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Address Line 1</label>
                    <input
                      type="text"
                      value={newAddress.address_line1}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, address_line1: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Address Line 2 (Optional)</label>
                    <input
                      type="text"
                      value={newAddress.address_line2}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, address_line2: e.target.value }))}
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        type="text"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Postal Code</label>
                      <input
                        type="text"
                        value={newAddress.postal_code}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, postal_code: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Country</label>
                      <select
                        value={newAddress.country}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                        required
                      >
                        <option value="Turkey">Turkey</option>
                        <option value="USA">USA</option>
                        <option value="Germany">Germany</option>
                        <option value="UK">UK</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Phone (Optional)</label>
                      <input
                        type="tel"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Address'}
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline"
                      onClick={() => setShowNewAddressForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Payment Method */}
            <div className="checkout-section">
              <h2>Payment Method</h2>
              
              <div className="payment-methods">
                <label className="payment-method">
                  <input
                    type="radio"
                    name="payment_method"
                    value="credit_card"
                    checked={orderForm.payment_method === 'credit_card'}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, payment_method: e.target.value }))}
                  />
                  <span>Credit Card</span>
                </label>
                
                <label className="payment-method">
                  <input
                    type="radio"
                    name="payment_method"
                    value="cash_on_delivery"
                    checked={orderForm.payment_method === 'cash_on_delivery'}
                    onChange={(e) => setOrderForm(prev => ({ ...prev, payment_method: e.target.value }))}
                  />
                  <span>Cash on Delivery</span>
                </label>
              </div>

              {orderForm.payment_method === 'credit_card' && (
                <div className="payment-form">
                  <div className="form-group">
                    <label>Card Number</label>
                    <input
                      type="text"
                      value={paymentForm.card_number}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, card_number: e.target.value }))}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                      type="text"
                      value={paymentForm.card_name}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, card_name: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date</label>
                      <input
                        type="text"
                        value={paymentForm.expiry_date}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, expiry_date: e.target.value }))}
                        placeholder="MM/YY"
                        maxLength="5"
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        value={paymentForm.cvv}
                        onChange={(e) => setPaymentForm(prev => ({ ...prev, cvv: e.target.value }))}
                        placeholder="123"
                        maxLength="4"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Notes */}
            <div className="checkout-section">
              <h2>Order Notes (Optional)</h2>
              <textarea
                value={orderForm.notes}
                onChange={(e) => setOrderForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Any special instructions for your order..."
                rows="3"
              />
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="order-summary">
            <div className="summary-card">
              <h2>Order Summary</h2>
              
              {/* Cart Items */}
              <div className="order-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="order-item">
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
                      <h4>{item.product?.name || `Product ${item.product_id}`}</h4>
                      <p>Qty: {item.quantity}</p>
                      <p className="item-price">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="price-breakdown">
                <div className="price-line">
                  <span>Subtotal ({getTotalItems()} items):</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="price-line">
                  <span>Shipping:</span>
                  <span>{getShippingCost() === 0 ? 'Free' : `$${getShippingCost().toFixed(2)}`}</span>
                </div>
                <div className="price-line">
                  <span>Tax (18%):</span>
                  <span>${getTax().toFixed(2)}</span>
                </div>
                <div className="price-line total">
                  <span>Total:</span>
                  <span>${getFinalTotal().toFixed(2)}</span>
                </div>
              </div>

              {/* Place Order Button */}
              <button 
                className="btn btn-primary btn-place-order"
                onClick={handlePlaceOrder}
                disabled={loading || cartLoading || !selectedAddress}
              >
                {loading ? 'Placing Order...' : `Place Order - $${getFinalTotal().toFixed(2)}`}
              </button>

              <p className="order-note">
                By placing your order, you agree to our Terms & Conditions and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .checkout {
          padding: 2rem 0;
          min-height: 80vh;
          background: #f8f9fa;
        }

        .checkout-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .checkout-header h1 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .checkout-header p {
          color: #6c757d;
          font-size: 1.1rem;
        }

        .checkout-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          align-items: start;
        }

        .checkout-forms {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .checkout-section {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .checkout-section h2 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e9ecef;
        }

        .address-selection {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .address-card {
          border: 2px solid #e9ecef;
          border-radius: 8px;
          padding: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .address-card:hover {
          border-color: #007bff;
        }

        .address-card.selected {
          border-color: #007bff;
          background: #f8f9ff;
        }

        .address-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .address-header h4 {
          margin: 0;
          color: #2c3e50;
        }

        .default-badge {
          background: #28a745;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
        }

        .address-card p {
          margin: 0.25rem 0;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .add-address-btn {
          align-self: flex-start;
          margin-top: 1rem;
        }

        .no-addresses {
          text-align: center;
          padding: 2rem;
          color: #6c757d;
        }

        .new-address-form {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #e9ecef;
        }

        .new-address-form h3 {
          margin-bottom: 1.5rem;
          color: #2c3e50;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #2c3e50;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .payment-methods {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .payment-method {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
        }

        .payment-method input {
          width: auto;
        }

        .payment-form {
          padding-top: 1rem;
          border-top: 1px solid #e9ecef;
        }

        .order-summary {
          position: sticky;
          top: 2rem;
        }

        .summary-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .summary-card h2 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e9ecef;
        }

        .order-items {
          margin-bottom: 2rem;
        }

        .order-item {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid #e9ecef;
        }

        .order-item:last-child {
          border-bottom: none;
        }

        .item-image {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .no-image {
          font-size: 1.5rem;
          color: #6c757d;
        }

        .item-details {
          flex: 1;
        }

        .item-details h4 {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
          font-size: 0.9rem;
        }

        .item-details p {
          margin: 0.25rem 0;
          color: #6c757d;
          font-size: 0.8rem;
        }

        .item-price {
          font-weight: 600;
          color: #007bff !important;
        }

        .price-breakdown {
          border-top: 2px solid #e9ecef;
          padding-top: 1rem;
          margin-bottom: 2rem;
        }

        .price-line {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          color: #2c3e50;
        }

        .price-line.total {
          border-top: 2px solid #e9ecef;
          margin-top: 1rem;
          padding-top: 1rem;
          font-weight: 600;
          font-size: 1.2rem;
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
        }

        .btn-outline {
          background: transparent;
          color: #007bff;
          border: 2px solid #007bff;
        }

        .btn-outline:hover:not(:disabled) {
          background: #007bff;
          color: white;
        }

        .btn-place-order {
          width: 100%;
          font-size: 1.1rem;
          padding: 1rem 2rem;
          margin-bottom: 1rem;
        }

        .order-note {
          text-align: center;
          font-size: 0.8rem;
          color: #6c757d;
          margin: 0;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .checkout-content {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .checkout-section {
            padding: 1.5rem;
          }

          .summary-card {
            position: static;
            padding: 1.5rem;
          }

          .form-actions {
            flex-direction: column;
          }

          .order-item {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }

          .item-image {
            width: 80px;
            height: 80px;
          }
        }
      `}</style>
    </div>
  );
};

export default Checkout; 