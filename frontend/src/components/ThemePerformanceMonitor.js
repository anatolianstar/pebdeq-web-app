import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { PerformanceMonitor } from '../themes/performance';
import './ThemePerformanceMonitor.css';

const ThemePerformanceMonitor = () => {
  const { getPerformanceMetrics } = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const updateMetrics = () => {
      try {
        const currentMetrics = getPerformanceMetrics();
        setMetrics(currentMetrics);
        
        const currentRecommendations = PerformanceMonitor.getOptimizationRecommendations();
        setRecommendations(currentRecommendations);
      } catch (error) {
        console.error('Error fetching performance metrics:', error);
      }
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [getPerformanceMetrics]);

  const formatTime = (time) => {
    if (time < 1) return `${(time * 1000).toFixed(0)}μs`;
    if (time < 1000) return `${time.toFixed(2)}ms`;
    return `${(time / 1000).toFixed(2)}s`;
  };

  const formatBytes = (bytes) => {
    if (!bytes) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getPerformanceStatus = () => {
    if (!metrics) return 'unknown';
    
    if (metrics.themeLoadTime < 50) return 'excellent';
    if (metrics.themeLoadTime < 100) return 'good';
    if (metrics.themeLoadTime < 200) return 'fair';
    return 'poor';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return '#28a745';
      case 'good': return '#28a745';
      case 'fair': return '#ffc107';
      case 'poor': return '#dc3545';
      default: return '#6c757d';
    }
  };

  if (!metrics) {
    return (
      <div className="theme-performance-monitor loading">
        <div className="monitor-header">
          <h4>Loading Performance Metrics...</h4>
        </div>
      </div>
    );
  }

  const status = getPerformanceStatus();
  const statusColor = getStatusColor(status);

  return (
    <div className="theme-performance-monitor">
      <div className="monitor-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="monitor-title">
          <h4>Theme Performance Monitor</h4>
          <span 
            className={`status-badge ${status}`}
            style={{ backgroundColor: statusColor }}
          >
            {status.toUpperCase()}
          </span>
        </div>
        <button className="expand-button">
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>

      {isExpanded && (
        <div className="monitor-content">
          {/* Performance Metrics */}
          <div className="metrics-section">
            <h5>Performance Metrics</h5>
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Theme Load Time</div>
                <div className="metric-value primary">
                  {formatTime(metrics.themeLoadTime)}
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-label">Transition Time</div>
                <div className="metric-value">
                  {formatTime(metrics.transitionTime)}
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-label">Cache Hits</div>
                <div className="metric-value success">
                  {metrics.cacheHits}
                </div>
              </div>
              
              <div className="metric-card">
                <div className="metric-label">Cache Misses</div>
                <div className="metric-value warning">
                  {metrics.cacheMisses}
                </div>
              </div>
            </div>
          </div>

          {/* Cache Information */}
          <div className="cache-section">
            <h5>Cache Information</h5>
            <div className="cache-stats">
              <div className="cache-item">
                <span className="cache-label">Theme Cache Size:</span>
                <span className="cache-value">{metrics.cacheSize} items</span>
              </div>
              <div className="cache-item">
                <span className="cache-label">Style Cache Size:</span>
                <span className="cache-value">{metrics.styleCacheSize} items</span>
              </div>
              <div className="cache-item">
                <span className="cache-label">Hit Rate:</span>
                <span className="cache-value">
                  {metrics.cacheHits + metrics.cacheMisses > 0 
                    ? `${((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(1)}%`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Memory Usage */}
          {metrics.memoryUsage && (
            <div className="memory-section">
              <h5>Memory Usage</h5>
              <div className="memory-stats">
                <div className="memory-item">
                  <span className="memory-label">Used:</span>
                  <span className="memory-value">{formatBytes(metrics.memoryUsage.used)}</span>
                </div>
                <div className="memory-item">
                  <span className="memory-label">Total:</span>
                  <span className="memory-value">{formatBytes(metrics.memoryUsage.total)}</span>
                </div>
                <div className="memory-item">
                  <span className="memory-label">Usage:</span>
                  <span className="memory-value">
                    {((metrics.memoryUsage.used / metrics.memoryUsage.total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="recommendations-section">
              <h5>Optimization Recommendations</h5>
              <div className="recommendations-list">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="recommendation-item">
                    <div className="recommendation-icon">⚡</div>
                    <div className="recommendation-text">{recommendation}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendations.length === 0 && (
            <div className="no-recommendations">
              <div className="success-icon">✓</div>
              <div className="success-text">All optimizations are working well!</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThemePerformanceMonitor; 