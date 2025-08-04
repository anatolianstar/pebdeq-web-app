import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-hot-toast';
import { createApiUrl } from '../utils/config';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const { cartItems, getTotalItems, getTotalPrice, fetchCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    recentOrders: [],
    totalAddresses: 0,
    recentAddresses: [],
    accountStatus: 'active',
    lastLogin: null
  });

  // Return & Cancel States
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnNotes, setReturnNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [cancelNotes, setCancelNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [favorites, setFavorites] = useState({
    products: [],
    blogs: []
  });

  // Component rendered

  // Fetch cart when component mounts
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Fetch dashboard data when component mounts
  useEffect(() => {
    fetchDashboardData();
    fetchFavorites();
  }, []);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching dashboard data...');
      
      // Fetch user orders
      const ordersResponse = await fetch('/api/users/orders', {
        headers: getAuthHeaders()
      });
      
      let ordersData = [];
      if (ordersResponse.ok) {
        const orders = await ordersResponse.json();
        ordersData = orders.orders || [];
      } else {
        console.error('Failed to fetch orders:', ordersResponse.status);
      }
      
      // Fetch user addresses
      const addressesResponse = await fetch('/api/users/addresses', {
        headers: getAuthHeaders()
      });
      
      let addressesData = [];
      if (addressesResponse.ok) {
        const addresses = await addressesResponse.json();
        addressesData = addresses.addresses || [];
      } else {
      }

      const mockData = {
        totalOrders: ordersData.length,
        recentOrders: ordersData.slice(0, 3), // Show first 3 orders
        totalAddresses: addressesData.length,
        recentAddresses: addressesData.slice(0, 3), // Show first 3 addresses
        accountStatus: 'active',
        lastLogin: '2024-01-16T10:30:00'
      };

      setDashboardData(mockData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await fetch(createApiUrl('api/users/favorites'), {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'processing': return '#007bff';
      case 'shipped': return '#17a2b8';
      case 'delivered': return '#28a745';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      case 'return_requested': return 'Return Requested';
      case 'returned': return 'Returned';
      default: return 'Unknown';
    }
  };

  // Return & Cancel Functions
  const handleReturnRequest = (order) => {
    setSelectedOrder(order);
    setReturnReason('');
    setReturnNotes('');
    setShowReturnModal(true);
  };

  const handleCancelOrder = (order) => {
    setSelectedOrder(order);
    setCancelReason('');
    setCancelNotes('');
    setShowCancelModal(true);
  };

  const submitReturnRequest = async () => {
    if (!returnReason.trim()) {
      toast.error('Please provide a reason for return');
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch(createApiUrl('api/user/orders/${selectedOrder.id}/return'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          reason: returnReason,
          notes: returnNotes
        })
      });

      if (response.ok) {
        toast.success('Return request submitted successfully');
        setShowReturnModal(false);
        fetchDashboardData(); // Refresh dashboard data
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to submit return request');
      }
    } catch (error) {
      console.error('Error submitting return request:', error);
      toast.error('Error submitting return request');
    } finally {
      setProcessing(false);
    }
  };

  const submitCancelOrder = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }

    try {
      setProcessing(true);
      const response = await fetch(createApiUrl('api/user/orders/${selectedOrder.id}/cancel'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          reason: cancelReason,
          notes: cancelNotes
        })
      });

      if (response.ok) {
        toast.success('Order cancelled successfully');
        setShowCancelModal(false);
        fetchDashboardData(); // Refresh dashboard data
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to cancel order');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Error cancelling order');
    } finally {
      setProcessing(false);
    }
  };

  const canCancelOrder = (order) => {
    return ['pending', 'processing'].includes(order.status);
  };

  const canReturnOrder = (order) => {
    return order.status === 'delivered' && order.return_status === 'none';
  };

  const getReturnStatusText = (returnStatus) => {
    switch (returnStatus) {
      case 'none': return '';
      case 'requested': return 'Return Requested';
      case 'approved': return 'Return Approved';
      case 'denied': return 'Return Denied';
      case 'returned': return 'Returned';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="user-dashboard fade-in">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-dashboard fade-in">
      <div className="container">
        {/* User Navigation */}
        <div className="user-navigation">
          <Link to="/user-dashboard" className="nav-link active">
            📊 Dashboard
          </Link>
          <Link to="/profile" className="nav-link">
            👤 Profile
          </Link>
          <Link to="/user-settings" className="nav-link">
            ⚙️ Settings
          </Link>
        </div>

        {/* Dashboard Header */}
        <div className="dashboard-header">
          <div className="dashboard-welcome">
            <h1>Welcome back, {user?.first_name || 'User'}!</h1>
            <p>Here's what's happening with your account</p>
          </div>
          <div className="dashboard-actions">
            <button onClick={handleLogout} className="btn btn-outline">
              Logout
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div className="stat-content">
              <h3>{dashboardData.totalOrders}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div className="stat-content">
              <h3>{getTotalItems()}</h3>
              <p>Items in Cart</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3>${getTotalPrice().toFixed(2)}</h3>
              <p>Cart Total</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📍</div>
            <div className="stat-content">
              <h3>{dashboardData.totalAddresses}</h3>
              <p>Saved Addresses</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-section">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <Link to="/cart" className="action-card">
              <div className="action-icon">🛒</div>
              <div className="action-content">
                <h3>View Cart</h3>
                <p>Review items in your cart and proceed to checkout</p>
              </div>
            </Link>
            <Link to="/products" className="action-card">
              <div className="action-icon">🛍️</div>
              <div className="action-content">
                <h3>Browse Products</h3>
                <p>Discover new products and add them to your cart</p>
              </div>
            </Link>
            <Link to="/orders" className="action-card">
              <div className="action-icon">📦</div>
              <div className="action-content">
                <h3>Order History</h3>
                <p>View and track your past orders</p>
              </div>
            </Link>
            <Link to="/contact" className="action-card">
              <div className="action-icon">📞</div>
              <div className="action-content">
                <h3>Contact Support</h3>
                <p>Get help and support for your orders</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Cart Summary</h2>
            <Link to="/cart" className="view-all-link">View Cart</Link>
          </div>
          <div className="cart-summary">
            {cartItems.length > 0 ? (
              <>
                <div className="cart-items-preview">
                  {cartItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="cart-item-preview">
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
                        <p>Qty: {item.quantity} | ${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                  {cartItems.length > 3 && (
                    <div className="more-items">
                      <p>+{cartItems.length - 3} more items</p>
                    </div>
                  )}
                </div>
                <div className="cart-total">
                  <h3>Total: ${getTotalPrice().toFixed(2)}</h3>
                  <Link to="/checkout" className="btn btn-primary">
                    Proceed to Checkout
                  </Link>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>Your cart is empty. Add some products to get started!</p>
                <Link to="/products" className="btn btn-primary">
                  Browse Products
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Orders</h2>
            <Link to="/orders" className="view-all-link">View All Orders</Link>
          </div>
          <div className="recent-orders">
            {dashboardData.recentOrders.length > 0 ? (
              dashboardData.recentOrders.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-info">
                    <h3>{order.order_number}</h3>
                    <p className="order-date">{new Date(order.created_at).toLocaleDateString()}</p>
                    {order.return_status && order.return_status !== 'none' && (
                      <p className="return-status">
                        <span className="return-badge">{getReturnStatusText(order.return_status)}</span>
                      </p>
                    )}
                  </div>
                  <div className="order-details">
                    <p className="order-total">${order.total_amount ? order.total_amount.toFixed(2) : '0.00'}</p>
                    <span 
                      className="order-status"
                      style={{ 
                        backgroundColor: getStatusColor(order.status),
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="order-actions">
                    {canCancelOrder(order) && (
                      <button 
                        className="btn btn-sm btn-danger"
                        onClick={() => handleCancelOrder(order)}
                        title="Cancel Order"
                      >
                        ❌ Cancel
                      </button>
                    )}
                    {canReturnOrder(order) && (
                      <button 
                        className="btn btn-sm btn-warning"
                        onClick={() => handleReturnRequest(order)}
                        title="Request Return"
                      >
                        🔄 Return
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No orders yet. Start shopping to see your orders here!</p>
                <Link to="/products" className="btn btn-primary">
                  Browse Products
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Addresses */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Saved Addresses</h2>
            <Link to="/profile" className="view-all-link">Manage All</Link>
          </div>
          <div className="recent-addresses">
            {dashboardData.recentAddresses.length > 0 ? (
              dashboardData.recentAddresses.map(address => (
                <div key={address.id} className="address-item">
                  <div className="address-info">
                    <h3>
                      {address.title}
                      {address.is_default && <span className="default-badge">Default</span>}
                    </h3>
                    <p>{address.address_line1}</p>
                    <p>{address.city}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No saved addresses yet.</p>
                <Link to="/profile" className="btn btn-primary">
                  Add Address
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Favorites Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>My Favorites</h2>
          </div>
          <div className="favorites-section">
            {/* Favorite Products */}
            {favorites.products.length > 0 && (
              <div className="favorites-category">
                <h3>📦 Favorite Products</h3>
                <div className="favorites-grid">
                  {favorites.products.map(product => (
                    <div key={product.id} className="favorite-item">
                      <div className="favorite-image">
                        {product.images && product.images.length > 0 ? (
                          <img 
                            src={`http://localhost:5005${product.images[0]}`}
                            alt={product.name}
                          />
                        ) : (
                          <div className="no-image">📦</div>
                        )}
                      </div>
                      <div className="favorite-details">
                        <h4>{product.name}</h4>
                        <p className="favorite-category">{product.category}</p>
                        <div className="favorite-price">
                          <span className="current-price">₺{product.price}</span>
                          {product.original_price && product.original_price > product.price && (
                            <span className="original-price">₺{product.original_price}</span>
                          )}
                        </div>
                        <div className="favorite-actions">
                          <Link to={`/product/${product.slug}`} className="btn btn-sm btn-primary">
                            View Product
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Favorite Blogs */}
            {favorites.blogs.length > 0 && (
              <div className="favorites-category">
                <h3>📚 Favorite Blogs</h3>
                <div className="favorites-grid">
                  {favorites.blogs.map(blog => (
                    <div key={blog.id} className="favorite-item">
                      <div className="favorite-image">
                        {blog.featured_image ? (
                          <img 
                            src={`http://localhost:5005${blog.featured_image}`}
                            alt={blog.title}
                          />
                        ) : (
                          <div className="no-image">📚</div>
                        )}
                      </div>
                      <div className="favorite-details">
                        <h4>{blog.title}</h4>
                        <p className="favorite-category">{blog.category}</p>
                        <p className="favorite-author">by {blog.author}</p>
                        <div className="favorite-actions">
                          <Link to={`/blog/${blog.slug}`} className="btn btn-sm btn-primary">
                            Read Blog
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {favorites.products.length === 0 && favorites.blogs.length === 0 && (
              <div className="empty-state">
                <p>No favorites yet. Start exploring and like products or blogs to see them here!</p>
                <div className="empty-actions">
                  <Link to="/products" className="btn btn-primary">
                    Browse Products
                  </Link>
                  <Link to="/blog" className="btn btn-secondary">
                    Read Blogs
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Request Return</h2>
              <button 
                className="close-btn"
                onClick={() => setShowReturnModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p>Order: <strong>{selectedOrder?.order_number}</strong></p>
              <p>Total: <strong>${selectedOrder?.total_amount?.toFixed(2)}</strong></p>
              
              <div className="form-group">
                <label>Reason for Return *</label>
                <select
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="defective">Product is defective</option>
                  <option value="wrong_item">Wrong item received</option>
                  <option value="not_as_described">Not as described</option>
                  <option value="damaged">Damaged during shipping</option>
                  <option value="changed_mind">Changed my mind</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Additional Notes (Optional)</label>
                <textarea
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  placeholder="Please provide additional details..."
                  rows="3"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowReturnModal(false)}
                disabled={processing}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={submitReturnRequest}
                disabled={processing || !returnReason}
              >
                {processing ? 'Submitting...' : 'Submit Return Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cancel Order</h2>
              <button 
                className="close-btn"
                onClick={() => setShowCancelModal(false)}
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <p>Order: <strong>{selectedOrder?.order_number}</strong></p>
              <p>Total: <strong>${selectedOrder?.total_amount?.toFixed(2)}</strong></p>
              
              <div className="form-group">
                <label>Reason for Cancellation *</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="changed_mind">Changed my mind</option>
                  <option value="found_better_price">Found better price elsewhere</option>
                  <option value="ordered_by_mistake">Ordered by mistake</option>
                  <option value="delivery_too_long">Delivery taking too long</option>
                  <option value="payment_issues">Payment issues</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Additional Notes (Optional)</label>
                <textarea
                  value={cancelNotes}
                  onChange={(e) => setCancelNotes(e.target.value)}
                  placeholder="Please provide additional details..."
                  rows="3"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowCancelModal(false)}
                disabled={processing}
              >
                Keep Order
              </button>
              <button 
                className="btn btn-danger"
                onClick={submitCancelOrder}
                disabled={processing || !cancelReason}
              >
                {processing ? 'Cancelling...' : 'Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .user-dashboard {
          padding: 2rem 0;
          min-height: 80vh;
          background: #f8f9fa;
        }

        .user-navigation {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1rem;
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .user-navigation .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: #6c757d;
          font-weight: 500;
          border-radius: 6px;
          transition: all 0.3s ease;
          background: transparent;
          border: 1px solid transparent;
        }

        .user-navigation .nav-link:hover {
          color: #007bff;
          background: #e7f1ff;
          border-color: #bde1ff;
          text-decoration: none;
        }

        .user-navigation .nav-link.active {
          color: #007bff;
          background: #f8f9ff;
          border-color: #007bff;
          box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
        }

        .user-navigation .nav-link.active:hover {
          color: #0056b3;
          border-color: #0056b3;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .dashboard-welcome h1 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .dashboard-welcome p {
          color: #6c757d;
          margin: 0;
        }

        .dashboard-actions {
          display: flex;
          gap: 1rem;
        }

        .dashboard-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
        }

        .stat-icon {
          font-size: 2rem;
          background: #e3f2fd;
          padding: 1rem;
          border-radius: 50%;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-content h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .stat-content p {
          margin: 0;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .dashboard-section {
          margin-bottom: 2rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section-header h2 {
          color: #2c3e50;
          margin: 0;
        }

        .view-all-link {
          color: #007bff;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s ease;
        }

        .view-all-link:hover {
          color: #0056b3;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1rem;
        }

        .action-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          text-decoration: none;
          color: inherit;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }

        .action-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          text-decoration: none;
          color: inherit;
        }

        .action-icon {
          font-size: 1.5rem;
          background: #e3f2fd;
          padding: 0.75rem;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-content h3 {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
          font-size: 1.1rem;
        }

        .action-content p {
          margin: 0;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .recent-orders,
        .recent-addresses,
        .cart-summary {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .cart-items-preview {
          margin-bottom: 1rem;
        }

        .cart-item-preview {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e9ecef;
        }

        .cart-item-preview:last-child {
          border-bottom: none;
        }

        .cart-item-preview .item-image {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cart-item-preview .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cart-item-preview .no-image {
          font-size: 1.5rem;
          color: #6c757d;
        }

        .cart-item-preview .item-details h4 {
          margin: 0 0 0.25rem 0;
          color: #2c3e50;
          font-size: 0.9rem;
        }

        .cart-item-preview .item-details p {
          margin: 0;
          color: #6c757d;
          font-size: 0.8rem;
        }

        .more-items {
          text-align: center;
          padding: 0.5rem;
          color: #6c757d;
          font-style: italic;
        }

        .more-items p {
          margin: 0;
        }

        .cart-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 1rem;
          border-top: 2px solid #e9ecef;
        }

        .cart-total h3 {
          margin: 0;
          color: #2c3e50;
          font-size: 1.2rem;
        }

        .order-item,
        .address-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #e9ecef;
          gap: 1rem;
        }

        .order-item:last-child,
        .address-item:last-child {
          border-bottom: none;
        }

        .order-info h3,
        .address-info h3 {
          margin: 0 0 0.25rem 0;
          color: #2c3e50;
          font-size: 1rem;
        }

        .order-date,
        .address-info p {
          margin: 0;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .order-details {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .order-total {
          font-weight: 600;
          color: #2c3e50;
          margin: 0;
        }

        .default-badge {
          background: #28a745;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
          margin-left: 0.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #6c757d;
        }

        .empty-state p {
          margin-bottom: 1rem;
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

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
          text-decoration: none;
          color: white;
        }

        .btn-outline {
          background: transparent;
          color: #007bff;
          border: 2px solid #007bff;
        }

        .btn-outline:hover {
          background: #007bff;
          color: white;
        }

        /* Return & Cancel Styles */
        .order-actions {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .btn-sm {
          padding: 0.4rem 0.8rem;
          font-size: 0.75rem;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-danger {
          background-color: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background-color: #c82333;
        }

        .btn-warning {
          background-color: #ffc107;
          color: #212529;
        }

        .btn-warning:hover {
          background-color: #e0a800;
        }

        .return-status {
          margin: 0.25rem 0;
        }

        .return-badge {
          background-color: #17a2b8;
          color: white;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 0;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e9ecef;
        }

        .modal-header h2 {
          margin: 0;
          color: #2c3e50;
        }

        .close-btn {
          background: none;
          border: none;
          font-size: 1.5rem;
          cursor: pointer;
          color: #6c757d;
          padding: 0;
          width: 30px;
          height: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: all 0.2s ease;
        }

        .close-btn:hover {
          background: #f8f9fa;
          color: #495057;
        }

        .modal-body {
          padding: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #2c3e50;
        }

        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 0.9rem;
          transition: border-color 0.2s ease;
          box-sizing: border-box;
        }

        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 80px;
        }

        .modal-footer {
          padding: 1.5rem;
          border-top: 1px solid #e9ecef;
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .btn-secondary {
          background-color: #6c757d;
          color: white;
        }

        .btn-secondary:hover:not(:disabled) {
          background-color: #545b62;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .dashboard-actions {
            width: 100%;
            justify-content: center;
          }

          .dashboard-stats {
            grid-template-columns: 1fr;
          }

          .quick-actions {
            grid-template-columns: 1fr;
          }

          .order-item,
          .address-item,
          .cart-item-preview {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .order-details {
            width: 100%;
            justify-content: space-between;
          }

          .order-actions {
            width: 100%;
            justify-content: flex-end;
          }

          .cart-total {
            flex-direction: column;
            align-items: center;
            gap: 1rem;
          }

          .modal-content {
            width: 95%;
            margin: 1rem;
          }

          .modal-footer {
            flex-direction: column;
          }

          .favorites-grid {
            grid-template-columns: 1fr;
          }

          .favorites-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          }

          .favorite-image {
            padding: 8px;
            margin-bottom: 8px;
          }
        }

        /* Tablet responsive for favorites */
        @media (max-width: 1024px) {
          .favorites-grid {
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          }

          .favorite-image {
            padding: 8px;
            margin-bottom: 8px;
          }
        }

        /* Favorites Section Styles */
        .favorites-section {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .favorites-category {
          margin-bottom: 2rem;
        }

        .favorites-category:last-child {
          margin-bottom: 0;
        }

        .favorites-category h3 {
          color: #2c3e50;
          margin-bottom: 1rem;
          font-size: 1.2rem;
          font-weight: 600;
        }

        .favorites-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          align-items: stretch;
        }

        .favorite-item {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .favorite-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }

        .favorite-item:hover .favorite-image img {
          transform: scale(1.05);
        }

        .favorite-image {
          position: relative;
          overflow: hidden;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          aspect-ratio: 1 / 1;
          border-radius: 8px;
          margin-bottom: 12px;
          padding: 12px;
        }

        .favorite-image img {
          width: 100%;
          height: 100%;
          transition: transform 0.3s ease;
          object-fit: cover;
          border-radius: 8px;
          box-sizing: border-box;
        }

        .favorite-image .no-image {
          font-size: 3rem;
          color: #6c757d;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        .favorite-details {
          padding: 0 1rem 1rem 1rem;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }

        .favorite-details h4 {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .favorite-category {
          color: #6c757d;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .favorite-author {
          color: #6c757d;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .favorite-price {
          margin-bottom: 1rem;
        }

        .favorite-price .current-price {
          color: #007bff;
          font-weight: bold;
          font-size: 1.1rem;
        }

        .favorite-price .original-price {
          color: #6c757d;
          text-decoration: line-through;
          margin-left: 0.5rem;
          font-size: 0.9rem;
        }

        .favorite-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: auto;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }

        .empty-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
};

export default UserDashboard; 