import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { createApiUrl } from '../utils/config';

const Orders = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
    has_next: false,
    has_prev: false
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    fetchOrders();
  }, [isAuthenticated, navigate]);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const fetchOrders = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(createApiUrl('api/users/orders?page=${page}&per_page=10'), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
        setPagination(data.pagination || {});
      } else {
        console.error('Failed to fetch orders:', response.status);
        toast.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error loading orders');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await fetch(createApiUrl(`api/users/orders/${orderId}`), {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedOrder(data.order);
        setShowOrderDetails(true);
      } else {
        console.error('Failed to fetch order details:', response.status);
        toast.error('Failed to fetch order details');
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Error loading order details');
    }
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
      default: return 'Unknown';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'paid': return '#28a745';
      case 'cash_on_delivery': return '#17a2b8';
      case 'failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'paid': return 'Paid';
      case 'cash_on_delivery': return 'Cash on Delivery';
      case 'failed': return 'Failed';
      default: return 'Unknown';
    }
  };

  const handlePageChange = (newPage) => {
    fetchOrders(newPage);
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  if (loading) {
    return (
      <div className="orders-page fade-in">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page fade-in">
      <div className="container">
        {/* User Navigation */}
        <div className="user-navigation">
          <Link to="/user-dashboard" className="nav-link">
            📊 Dashboard
          </Link>
          <Link to="/profile" className="nav-link">
            👤 Profile
          </Link>
          <Link to="/orders" className="nav-link active">
            📦 Orders
          </Link>
          <Link to="/user-settings" className="nav-link">
            ⚙️ Settings
          </Link>
        </div>

        {/* Orders Header */}
        <div className="orders-header">
          <div className="orders-welcome">
            <h1>My Orders</h1>
            <p>View and track all your orders in one place</p>
          </div>
          <div className="orders-stats">
            <div className="stat-item">
              <span className="stat-number">{pagination.total}</span>
              <span className="stat-label">Total Orders</span>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="orders-content">
          {orders.length > 0 ? (
            <>
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <h3>{order.order_number}</h3>
                        <p className="order-date">
                          {new Date(order.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                      <div className="order-status">
                        <span 
                          className="status-badge"
                          style={{ 
                            backgroundColor: getStatusColor(order.status),
                            color: 'white'
                          }}
                        >
                          {getStatusText(order.status)}
                        </span>
                        <span 
                          className="payment-status-badge"
                          style={{ 
                            backgroundColor: getPaymentStatusColor(order.payment_status),
                            color: 'white'
                          }}
                        >
                          {getPaymentStatusText(order.payment_status)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="order-summary">
                      <div className="order-details">
                        <div className="detail-item">
                          <span className="label">Items:</span>
                          <span className="value">{order.items ? order.items.length : 0}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Total:</span>
                          <span className="value total-amount">${order.total_amount?.toFixed(2) || '0.00'}</span>
                        </div>
                        <div className="detail-item">
                          <span className="label">Payment:</span>
                          <span className="value">{order.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 'Credit Card'}</span>
                        </div>
                      </div>
                      
                      <div className="order-actions">
                        <button 
                          className="btn btn-primary"
                          onClick={() => handleViewDetails(order.id)}
                        >
                          View Details
                        </button>
                        {order.status === 'delivered' && (
                          <button className="btn btn-outline">
                            Reorder
                          </button>
                        )}
                      </div>
                    </div>

                    {order.items && order.items.length > 0 && (
                      <div className="order-items-preview">
                        <h4>Items ({order.items.length})</h4>
                        <div className="items-grid">
                          {order.items.slice(0, 4).map((item, index) => (
                            <div key={index} className="item-preview">
                              <div className="item-image">
                                {item.product?.image_url ? (
                                  <img 
                                    src={item.product.image_url.startsWith('http') 
                                      ? item.product.image_url 
                                      : `http://localhost:5005${item.product.image_url}`
                                    } 
                                    alt={item.product_name || 'Product'} 
                                  />
                                ) : (
                                  <div className="no-image">📦</div>
                                )}
                              </div>
                              <div className="item-info">
                                <p className="item-name">{item.product_name}</p>
                                <p className="item-quantity">Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 4 && (
                            <div className="more-items">
                              <p>+{order.items.length - 4} more</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="pagination">
                  <button 
                    className="btn btn-outline"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.has_prev}
                  >
                    Previous
                  </button>
                  <span className="page-info">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  <button 
                    className="btn btn-outline"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.has_next}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No Orders Yet</h3>
              <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
              <Link to="/products" className="btn btn-primary">
                Browse Products
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowOrderDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order Details</h2>
              <button className="modal-close" onClick={() => setShowOrderDetails(false)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="order-detail-header">
                <h3>{selectedOrder.order_number}</h3>
                <div className="order-badges">
                  <span 
                    className="status-badge"
                    style={{ 
                      backgroundColor: getStatusColor(selectedOrder.status),
                      color: 'white'
                    }}
                  >
                    {getStatusText(selectedOrder.status)}
                  </span>
                  <span 
                    className="payment-status-badge"
                    style={{ 
                      backgroundColor: getPaymentStatusColor(selectedOrder.payment_status),
                      color: 'white'
                    }}
                  >
                    {getPaymentStatusText(selectedOrder.payment_status)}
                  </span>
                </div>
              </div>

              <div className="order-detail-info">
                <div className="info-section">
                  <h4>Order Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="label">Order Date:</span>
                      <span className="value">{new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Payment Method:</span>
                      <span className="value">{selectedOrder.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 'Credit Card'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Subtotal:</span>
                      <span className="value">${selectedOrder.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Shipping:</span>
                      <span className="value">${selectedOrder.shipping_cost?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="info-item">
                      <span className="label">Tax:</span>
                      <span className="value">${selectedOrder.tax_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div className="info-item total">
                      <span className="label">Total:</span>
                      <span className="value">${selectedOrder.total_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                  </div>
                </div>

                {selectedOrder.shipping_address && (
                  <div className="info-section">
                    <h4>Shipping Address</h4>
                    <div className="address-info">
                      <p><strong>{selectedOrder.shipping_address?.first_name || 'N/A'} {selectedOrder.shipping_address?.last_name || 'N/A'}</strong></p>
                      <p>{selectedOrder.shipping_address?.address_line1 || 'N/A'}</p>
                      {selectedOrder.shipping_address?.address_line2 && <p>{selectedOrder.shipping_address.address_line2}</p>}
                      <p>{selectedOrder.shipping_address?.city || 'N/A'}, {selectedOrder.shipping_address?.postal_code || 'N/A'}</p>
                      <p>{selectedOrder.shipping_address?.country || 'N/A'}</p>
                      {selectedOrder.shipping_address?.phone && <p>Phone: {selectedOrder.shipping_address.phone}</p>}
                    </div>
                  </div>
                )}

                {selectedOrder.items && selectedOrder.items.length > 0 && (
                  <div className="info-section">
                    <h4>Order Items</h4>
                    <div className="items-detail">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="item-detail">
                          <div className="item-image">
                            {item.product?.image_url ? (
                              <img 
                                src={item.product.image_url.startsWith('http') 
                                  ? item.product.image_url 
                                  : `http://localhost:5005${item.product.image_url}`
                                } 
                                alt={item.product_name || 'Product'} 
                              />
                            ) : (
                              <div className="no-image">📦</div>
                            )}
                          </div>
                          <div className="item-details">
                            <h5>{item.product_name}</h5>
                            <p>Quantity: {item.quantity}</p>
                            <p>Price: ${item.price?.toFixed(2)} each</p>
                            <p className="item-total">Total: ${item.subtotal?.toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedOrder.notes && (
                  <div className="info-section">
                    <h4>Order Notes</h4>
                    <p>{selectedOrder.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx="true">{`
        .orders-page {
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

        .orders-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .orders-welcome h1 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .orders-welcome p {
          color: #6c757d;
          margin: 0;
        }

        .orders-stats {
          display: flex;
          gap: 2rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 2rem;
          font-weight: bold;
          color: #007bff;
        }

        .stat-label {
          display: block;
          font-size: 0.9rem;
          color: #6c757d;
        }

        .orders-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .order-card {
          border: 1px solid #e9ecef;
          border-radius: 12px;
          padding: 2rem;
          background: #f8f9fa;
          transition: all 0.3s ease;
        }

        .order-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .order-info h3 {
          color: #2c3e50;
          margin: 0 0 0.5rem 0;
          font-size: 1.3rem;
        }

        .order-date {
          color: #6c757d;
          margin: 0;
          font-size: 0.9rem;
        }

        .order-status {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .status-badge,
        .payment-status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .order-summary {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .order-details {
          display: flex;
          gap: 2rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item .label {
          font-size: 0.8rem;
          color: #6c757d;
        }

        .detail-item .value {
          font-weight: 500;
          color: #2c3e50;
        }

        .detail-item.total .value {
          color: #28a745;
          font-size: 1.1rem;
          font-weight: bold;
        }

        .order-actions {
          display: flex;
          gap: 1rem;
        }

        .order-items-preview {
          border-top: 1px solid #e9ecef;
          padding-top: 1.5rem;
        }

        .order-items-preview h4 {
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .item-preview {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .item-image {
          width: 50px;
          height: 50px;
          border-radius: 6px;
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
          font-size: 1.2rem;
          color: #6c757d;
        }

        .item-info {
          flex: 1;
        }

        .item-name {
          margin: 0 0 0.25rem 0;
          font-weight: 500;
          color: #2c3e50;
          font-size: 0.9rem;
        }

        .item-quantity {
          margin: 0;
          color: #6c757d;
          font-size: 0.8rem;
        }

        .more-items {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          color: #6c757d;
          font-style: italic;
        }

        .more-items p {
          margin: 0;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e9ecef;
        }

        .page-info {
          color: #6c757d;
          font-weight: 500;
        }

        .empty-state {
          text-align: center;
          padding: 4rem;
          color: #6c757d;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .empty-state h3 {
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .empty-state p {
          margin-bottom: 2rem;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          max-width: 800px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2rem;
          border-bottom: 1px solid #e9ecef;
        }

        .modal-header h2 {
          color: #2c3e50;
          margin: 0;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 2rem;
          cursor: pointer;
          color: #6c757d;
        }

        .modal-close:hover {
          color: #dc3545;
        }

        .modal-body {
          padding: 2rem;
        }

        .order-detail-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e9ecef;
        }

        .order-detail-header h3 {
          color: #2c3e50;
          margin: 0;
        }

        .order-badges {
          display: flex;
          gap: 0.5rem;
        }

        .order-detail-info {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .info-section h4 {
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .info-item.total {
          background: #d4edda;
          border: 1px solid #c3e6cb;
        }

        .info-item .label {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .info-item .value {
          color: #2c3e50;
          font-weight: 500;
        }

        .info-item.total .value {
          color: #155724;
          font-weight: bold;
        }

        .address-info {
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .address-info p {
          margin: 0.25rem 0;
          color: #6c757d;
        }

        .address-info p strong {
          color: #2c3e50;
        }

        .items-detail {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .item-detail {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .item-detail .item-image {
          width: 80px;
          height: 80px;
        }

        .item-detail .item-details {
          flex: 1;
        }

        .item-detail .item-details h5 {
          color: #2c3e50;
          margin: 0 0 0.5rem 0;
        }

        .item-detail .item-details p {
          margin: 0.25rem 0;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .item-detail .item-total {
          color: #28a745;
          font-weight: bold;
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
          display: inline-block;
          text-align: center;
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

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .orders-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .order-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .order-summary {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .order-details {
            flex-direction: column;
            gap: 1rem;
          }

          .order-actions {
            width: 100%;
          }

          .items-grid {
            grid-template-columns: 1fr;
          }

          .info-grid {
            grid-template-columns: 1fr;
          }

          .order-detail-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
          }

          .pagination {
            flex-direction: column;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Orders; 