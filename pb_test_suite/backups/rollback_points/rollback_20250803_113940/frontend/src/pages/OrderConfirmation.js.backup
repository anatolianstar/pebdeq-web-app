import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const { order, orderNumber, total, address } = location.state || {};

  useEffect(() => {
    // Redirect if not authenticated or no order data
    if (!isAuthenticated || !orderNumber) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, orderNumber, navigate]);

  if (!orderNumber) {
    return null; // Will redirect in useEffect
  }

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
      case 'pending': return 'Order Received';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getNextSteps = (status) => {
    switch (status) {
      case 'pending':
        return 'We have received your order and will start processing it soon.';
      case 'processing':
        return 'Your order is being prepared for shipment.';
      case 'shipped':
        return 'Your order has been shipped and is on its way to you.';
      case 'delivered':
        return 'Your order has been delivered successfully.';
      default:
        return 'We will keep you updated on your order status.';
    }
  };

  return (
    <div className="order-confirmation fade-in">
      <div className="container">
        {/* Success Header */}
        <div className="confirmation-header">
          <div className="success-icon">✅</div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your order. We'll send you a confirmation email shortly.</p>
        </div>

        {/* Order Details */}
        <div className="confirmation-content">
          <div className="order-details-section">
            <div className="order-summary-card">
              <h2>Order Details</h2>
              
              <div className="order-info">
                <div className="info-row">
                  <span className="label">Order Number:</span>
                  <span className="value">{orderNumber}</span>
                </div>
                
                <div className="info-row">
                  <span className="label">Order Date:</span>
                  <span className="value">{new Date().toLocaleDateString()}</span>
                </div>
                
                <div className="info-row">
                  <span className="label">Status:</span>
                  <span 
                    className="status-badge"
                    style={{ 
                      backgroundColor: getStatusColor(order?.status || 'pending'),
                      color: 'white'
                    }}
                  >
                    {getStatusText(order?.status || 'pending')}
                  </span>
                </div>
                
                <div className="info-row">
                  <span className="label">Total Amount:</span>
                  <span className="value total-amount">${total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              {/* Price Breakdown */}
              {order && (
                <div className="price-breakdown">
                  <h3>Price Breakdown</h3>
                  <div className="breakdown-item">
                    <span>Subtotal:</span>
                    <span>${order.subtotal?.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Shipping:</span>
                    <span>{order.shipping_cost === 0 ? 'Free' : `$${order.shipping_cost?.toFixed(2)}`}</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Tax:</span>
                    <span>${order.tax_amount?.toFixed(2)}</span>
                  </div>
                  <div className="breakdown-item total">
                    <span>Total:</span>
                    <span>${order.total_amount?.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Shipping Address */}
            {address && (
              <div className="address-card">
                <h3>Shipping Address</h3>
                <div className="address-info">
                                        <p><strong>{address?.first_name || 'N/A'} {address?.last_name || 'N/A'}</strong></p>
                  <p>{address.address_line1}</p>
                  {address.address_line2 && <p>{address.address_line2}</p>}
                  <p>{address.city}, {address.postal_code}</p>
                  <p>{address.country}</p>
                  {address.phone && <p>Phone: {address.phone}</p>}
                </div>
              </div>
            )}

            {/* Order Items */}
            {order?.items && order.items.length > 0 && (
              <div className="order-items-card">
                <h3>Order Items</h3>
                <div className="items-list">
                  {order.items.map((item) => (
                    <div key={item.id} className="item-row">
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
                        <h4>{item.product_name}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p className="item-price">${item.price?.toFixed(2)} each</p>
                        <p className="item-total">${item.subtotal?.toFixed(2)} total</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="next-steps-section">
            <div className="next-steps-card">
              <h3>What's Next?</h3>
              <div className="steps-content">
                <p className="next-steps-text">
                  {getNextSteps(order?.status || 'pending')}
                </p>
                
                <div className="contact-info">
                  <h4>Order Tracking</h4>
                  <p>You can track your order status by visiting your dashboard.</p>
                  
                  <h4>Need Help?</h4>
                  <p>If you have any questions about your order, please contact us:</p>
                  <ul>
                    <li>Email: support@pebdeq.com</li>
                    <li>Phone: +90 (XXX) XXX-XXXX</li>
                  </ul>
                </div>
              </div>
              
              <div className="action-buttons">
                <Link to="/user-dashboard" className="btn btn-primary">
                  View Order Status
                </Link>
                <Link to="/products" className="btn btn-outline">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Email Confirmation Note */}
        <div className="email-note">
          <p>📧 A confirmation email has been sent to your registered email address with all the order details.</p>
        </div>
      </div>

      <style jsx="true">{`
        .order-confirmation {
          padding: 2rem 0;
          min-height: 80vh;
          background: #f8f9fa;
        }

        .confirmation-header {
          text-align: center;
          margin-bottom: 3rem;
          background: white;
          padding: 3rem 2rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .success-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
        }

        .confirmation-header h1 {
          color: #28a745;
          margin-bottom: 1rem;
          font-size: 2.5rem;
          font-weight: 700;
        }

        .confirmation-header p {
          color: #6c757d;
          font-size: 1.2rem;
          margin: 0;
        }

        .confirmation-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 2rem;
          align-items: start;
        }

        .order-details-section {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .order-summary-card,
        .address-card,
        .order-items-card,
        .next-steps-card {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .order-summary-card h2,
        .address-card h3,
        .order-items-card h3,
        .next-steps-card h3 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e9ecef;
        }

        .order-info {
          margin-bottom: 2rem;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f8f9fa;
        }

        .info-row:last-child {
          border-bottom: none;
        }

        .label {
          font-weight: 500;
          color: #6c757d;
        }

        .value {
          font-weight: 600;
          color: #2c3e50;
        }

        .total-amount {
          font-size: 1.2rem;
          color: #28a745;
        }

        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .price-breakdown {
          border-top: 2px solid #e9ecef;
          padding-top: 1rem;
        }

        .price-breakdown h3 {
          margin-bottom: 1rem;
          color: #2c3e50;
          font-size: 1.1rem;
        }

        .breakdown-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          color: #2c3e50;
        }

        .breakdown-item.total {
          border-top: 2px solid #e9ecef;
          margin-top: 1rem;
          padding-top: 1rem;
          font-weight: 600;
          font-size: 1.1rem;
        }

        .address-info p {
          margin: 0.25rem 0;
          color: #2c3e50;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .item-row {
          display: flex;
          gap: 1rem;
          padding: 1rem 0;
          border-bottom: 1px solid #e9ecef;
        }

        .item-row:last-child {
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
          font-size: 1rem;
        }

        .item-details p {
          margin: 0.25rem 0;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .item-price,
        .item-total {
          font-weight: 600;
          color: #007bff !important;
        }

        .next-steps-section {
          position: sticky;
          top: 2rem;
        }

        .steps-content {
          margin-bottom: 2rem;
        }

        .next-steps-text {
          background: #e3f2fd;
          padding: 1rem;
          border-radius: 8px;
          color: #1976d2;
          margin-bottom: 2rem;
          border-left: 4px solid #2196f3;
        }

        .contact-info h4 {
          color: #2c3e50;
          margin: 1.5rem 0 0.5rem 0;
          font-size: 1rem;
        }

        .contact-info p {
          color: #6c757d;
          margin: 0.5rem 0;
          font-size: 0.9rem;
        }

        .contact-info ul {
          margin: 0.5rem 0;
          padding-left: 1.5rem;
        }

        .contact-info li {
          color: #6c757d;
          font-size: 0.9rem;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .email-note {
          margin-top: 2rem;
          text-align: center;
          background: #e8f5e8;
          padding: 1rem;
          border-radius: 8px;
          border: 1px solid #c3e6c3;
        }

        .email-note p {
          margin: 0;
          color: #155724;
          font-size: 0.9rem;
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
          text-decoration: none;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .confirmation-content {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .confirmation-header {
            padding: 2rem 1rem;
          }

          .confirmation-header h1 {
            font-size: 2rem;
          }

          .order-summary-card,
          .address-card,
          .order-items-card,
          .next-steps-card {
            padding: 1.5rem;
          }

          .next-steps-section {
            position: static;
          }

          .item-row {
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

export default OrderConfirmation; 