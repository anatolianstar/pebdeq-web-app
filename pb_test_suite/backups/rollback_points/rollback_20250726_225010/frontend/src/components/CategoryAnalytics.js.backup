import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const CategoryAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [summary, setSummary] = useState({
    total_categories: 0,
    total_products: 0,
    total_revenue: 0,
    total_orders: 0
  });
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('product_count');
  const [sortOrder, setSortOrder] = useState('desc');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories/analytics', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data.analytics);
        setSummary(data.summary);
      } else {
        toast.error('Failed to load analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Error fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const sortedAnalytics = [...analytics].sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    
    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getPerformanceColor = (value, max) => {
    const percentage = (value / max) * 100;
    if (percentage >= 80) return '#28a745';
    if (percentage >= 60) return '#ffc107';
    if (percentage >= 40) return '#fd7e14';
    return '#dc3545';
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading category analytics...</p>
      </div>
    );
  }

  const maxValues = {
    product_count: Math.max(...analytics.map(a => a.product_count)),
    total_revenue: Math.max(...analytics.map(a => a.total_revenue)),
    total_orders: Math.max(...analytics.map(a => a.total_orders)),
    total_sold: Math.max(...analytics.map(a => a.total_sold))
  };

  return (
    <div className="category-analytics">
      <div className="analytics-header">
        <h2>📊 Category Analytics Dashboard</h2>
        <button 
          className="btn btn-primary"
          onClick={fetchAnalytics}
        >
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="analytics-summary">
        <div className="summary-card">
          <div className="card-icon">🏷️</div>
          <div className="card-content">
            <div className="card-value">{summary.total_categories}</div>
            <div className="card-label">Total Categories</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">📦</div>
          <div className="card-content">
            <div className="card-value">{summary.total_products}</div>
            <div className="card-label">Total Products</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">💰</div>
          <div className="card-content">
            <div className="card-value">{formatCurrency(summary.total_revenue)}</div>
            <div className="card-label">Total Revenue</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <div className="card-value">{summary.total_orders}</div>
            <div className="card-label">Total Orders</div>
          </div>
        </div>
      </div>

      {/* Analytics Table */}
      <div className="analytics-table">
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th 
                className="sortable"
                onClick={() => handleSort('product_count')}
              >
                Products <SortIcon field="product_count" />
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('total_stock')}
              >
                Total Stock <SortIcon field="total_stock" />
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('avg_price')}
              >
                Avg Price <SortIcon field="avg_price" />
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('total_orders')}
              >
                Orders <SortIcon field="total_orders" />
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('total_sold')}
              >
                Units Sold <SortIcon field="total_sold" />
              </th>
              <th 
                className="sortable"
                onClick={() => handleSort('total_revenue')}
              >
                Revenue <SortIcon field="total_revenue" />
              </th>
              <th>Performance</th>
            </tr>
          </thead>
          <tbody>
            {sortedAnalytics.map(category => (
              <tr key={category.id}>
                <td>
                  <div className="category-info">
                    <strong>{category.name}</strong>
                    <div className="category-slug">{category.slug}</div>
                  </div>
                </td>
                <td>
                  <div className="metric-cell">
                    <div className="metric-value">{category.product_count}</div>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill"
                        style={{ 
                          width: `${(category.product_count / maxValues.product_count) * 100}%`,
                          backgroundColor: getPerformanceColor(category.product_count, maxValues.product_count)
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  <div className="metric-value">{category.total_stock}</div>
                </td>
                <td>
                  <div className="metric-value">{formatCurrency(category.avg_price)}</div>
                </td>
                <td>
                  <div className="metric-cell">
                    <div className="metric-value">{category.total_orders}</div>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill"
                        style={{ 
                          width: `${(category.total_orders / maxValues.total_orders) * 100}%`,
                          backgroundColor: getPerformanceColor(category.total_orders, maxValues.total_orders)
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  <div className="metric-value">{category.total_sold}</div>
                </td>
                <td>
                  <div className="metric-cell">
                    <div className="metric-value">{formatCurrency(category.total_revenue)}</div>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill"
                        style={{ 
                          width: `${(category.total_revenue / maxValues.total_revenue) * 100}%`,
                          backgroundColor: getPerformanceColor(category.total_revenue, maxValues.total_revenue)
                        }}
                      />
                    </div>
                  </div>
                </td>
                <td>
                  <div className="performance-indicators">
                    <div className="performance-item">
                      <span className="performance-label">Products:</span>
                      <div 
                        className="performance-dot"
                        style={{ 
                          backgroundColor: getPerformanceColor(category.product_count, maxValues.product_count)
                        }}
                      />
                    </div>
                    <div className="performance-item">
                      <span className="performance-label">Revenue:</span>
                      <div 
                        className="performance-dot"
                        style={{ 
                          backgroundColor: getPerformanceColor(category.total_revenue, maxValues.total_revenue)
                        }}
                      />
                    </div>
                    <div className="performance-item">
                      <span className="performance-label">Orders:</span>
                      <div 
                        className="performance-dot"
                        style={{ 
                          backgroundColor: getPerformanceColor(category.total_orders, maxValues.total_orders)
                        }}
                      />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights */}
      <div className="analytics-insights">
        <h3>📈 Key Insights</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-title">🏆 Top Performing Category</div>
            <div className="insight-content">
              {analytics.length > 0 && (
                <div>
                  <strong>{analytics.reduce((prev, current) => 
                    prev.total_revenue > current.total_revenue ? prev : current
                  ).name}</strong>
                  <div className="insight-detail">
                    {formatCurrency(Math.max(...analytics.map(a => a.total_revenue)))} revenue
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-title">📦 Most Products</div>
            <div className="insight-content">
              {analytics.length > 0 && (
                <div>
                  <strong>{analytics.reduce((prev, current) => 
                    prev.product_count > current.product_count ? prev : current
                  ).name}</strong>
                  <div className="insight-detail">
                    {Math.max(...analytics.map(a => a.product_count))} products
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-title">💎 Highest Avg Price</div>
            <div className="insight-content">
              {analytics.length > 0 && (
                <div>
                  <strong>{analytics.reduce((prev, current) => 
                    prev.avg_price > current.avg_price ? prev : current
                  ).name}</strong>
                  <div className="insight-detail">
                    {formatCurrency(Math.max(...analytics.map(a => a.avg_price)))} avg
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-title">📊 Total Categories</div>
            <div className="insight-content">
              <strong>{analytics.length}</strong>
              <div className="insight-detail">
                {analytics.filter(a => a.product_count > 0).length} with products
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .category-analytics {
          padding: 1rem;
          background: var(--bg-secondary);
          min-height: 100vh;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }

        .analytics-header h2 {
          margin: 0;
          color: var(--text-primary);
        }

        .analytics-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          background: var(--card-bg);
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .card-icon {
          font-size: 2rem;
          opacity: 0.7;
        }

        .card-content {
          flex: 1;
        }

        .card-value {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--text-primary);
        }

        .card-label {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .analytics-table {
          background: var(--card-bg);
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          overflow-x: auto;
          margin-bottom: 2rem;
        }

        .analytics-table table {
          width: 100%;
          border-collapse: collapse;
        }

        .analytics-table th,
        .analytics-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        .analytics-table th {
          background: var(--bg-secondary);
          font-weight: 600;
          color: var(--text-primary);
        }

        .analytics-table th.sortable {
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s ease;
        }

        .analytics-table th.sortable:hover {
          background: var(--bg-tertiary);
        }

        .category-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .category-slug {
          font-size: 0.8rem;
          color: var(--text-secondary);
          font-family: monospace;
        }

        .metric-cell {
          position: relative;
        }

        .metric-value {
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .metric-bar {
          height: 4px;
          background: var(--bg-tertiary);
          border-radius: 2px;
          overflow: hidden;
        }

        .metric-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .performance-indicators {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .performance-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
        }

        .performance-label {
          color: #666;
        }

        .performance-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .analytics-insights {
          background: var(--card-bg);
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .analytics-insights h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          color: var(--text-primary);
        }

        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .insight-card {
          background: var(--bg-secondary);
          border-radius: 6px;
          padding: 1rem;
          border-left: 4px solid var(--primary-color);
        }

        .insight-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .insight-content {
          color: var(--text-secondary);
        }

        .insight-detail {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-top: 0.25rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-primary {
          background: var(--primary-color);
          color: var(--text-light);
        }

        .btn-primary:hover {
          background: var(--primary-hover);
        }

        .analytics-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          color: var(--text-secondary);
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid var(--primary-color);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .analytics-summary {
            grid-template-columns: 1fr;
          }
          
          .insights-grid {
            grid-template-columns: 1fr;
          }
          
          .analytics-table {
            font-size: 0.9rem;
          }
          
          .analytics-table th,
          .analytics-table td {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CategoryAnalytics; 