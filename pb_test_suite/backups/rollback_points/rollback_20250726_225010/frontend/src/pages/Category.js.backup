import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';

const Category = () => {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    per_page: 12,
    total: 0
  });
  const [sortBy, setSortBy] = useState('newest');
  
  useEffect(() => {
    fetchCategoryProducts();
  }, [slug, sortBy]);

  useEffect(() => {
    // Update sort when category loads
    if (category && category.default_sort) {
      setSortBy(category.default_sort);
    }
  }, [category]);

  useEffect(() => {
    // Update page title and meta description for SEO
    if (category) {
      document.title = category.meta_title || `${category.name} | Your Store`;
      
      // Update meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', category.meta_description || category.description || `Shop ${category.name} products`);
      }
    }
  }, [category]);

  const fetchCategoryProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const perPage = category?.products_per_page || 12;
      const response = await fetch(`/api/products/category/${slug}?page=${page}&per_page=${perPage}&sort=${sortBy}`);
      
      if (response.ok) {
        const data = await response.json();
        setCategory(data.category);
        setProducts(data.products || []);
        setPagination(data.pagination || {});
      } else if (response.status === 404) {
        setError('Category not found');
      } else {
        setError('Failed to load category products');
      }
      
    } catch (error) {
      console.error('Error fetching category products:', error);
      setError('Failed to load category products');
      toast.error('Failed to load category products');
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
  };

  const handlePageChange = (page) => {
    fetchCategoryProducts(page);
  };

  const handleAddToCart = async (product) => {
    try {
      await addToCart(product);
      toast.success('Product added to cart!');
    } catch (error) {
      toast.error('Failed to add product to cart');
    }
  };

  if (loading) {
    return (
      <div className="category fade-in">
        <div className="container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading category products...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category fade-in">
        <div className="container">
          <div className="error-state">
            <h2>Error</h2>
            <p>{error}</p>
            <Link to="/products" className="btn btn-primary">
              Browse All Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="category fade-in">
      <div className="container">
        {/* Category Header */}
        <div className="category-header">
          {category && (
            <>
              <div className="breadcrumbs">
                <Link to="/">Home</Link>
                <span>→</span>
                <Link to="/products">Products</Link>
                <span>→</span>
                <span>{category.name}</span>
              </div>
              
              <h1>{category.name}</h1>
              {category.description && (
                <p className="category-description">{category.description}</p>
              )}
            </>
          )}
        </div>

        {/* Category Controls */}
        <div className="category-controls">
          <div className="results-info">
            <span>{pagination.total} products found</span>
          </div>
          
          <div className="sort-controls">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => handleSortChange(e.target.value)}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {products.length > 0 ? (
            products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0].startsWith('http') 
                        ? product.images[0] 
                        : `http://localhost:5005${product.images[0]}`
                      } 
                      alt={product.name}
                    />
                  ) : (
                    <div className="no-image">📦</div>
                  )}
                  
                  {product.is_featured && (
                    <span className="featured-badge">Featured</span>
                  )}
                </div>
                
                <div className="product-info">
                  <h3>
                    <Link to={`/product/${product.slug}`}>
                      {product.name}
                    </Link>
                  </h3>
                  
                  <div className="product-price">
                    <span className="current-price">${product.price.toFixed(2)}</span>
                    {product.original_price && product.original_price > product.price && (
                      <span className="original-price">${product.original_price.toFixed(2)}</span>
                    )}
                  </div>
                  
                  <div className="product-stock">
                    {product.stock_quantity > 0 ? (
                      <span className="in-stock">In Stock ({product.stock_quantity})</span>
                    ) : (
                      <span className="out-of-stock">Out of Stock</span>
                    )}
                  </div>
                  
                  <div className="product-actions">
                    <Link to={`/product/${product.slug}`} className="btn btn-outline">
                      View Details
                    </Link>
                    <button 
                      onClick={() => handleAddToCart(product)}
                      className="btn btn-primary"
                      disabled={product.stock_quantity <= 0}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <h3>No products found in this category</h3>
              <p>Check back later for new products!</p>
              <Link to="/products" className="btn btn-primary">
                Browse All Products
              </Link>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="btn btn-outline"
            >
              Previous
            </button>
            
            <div className="page-numbers">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`btn ${page === pagination.page ? 'btn-primary' : 'btn-outline'}`}
                >
                  {page}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              className="btn btn-outline"
            >
              Next
            </button>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .category {
          padding: 2rem 0;
          min-height: 70vh;
          background: #f8f9fa;
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

        .error-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .error-state h2 {
          color: #dc3545;
          margin-bottom: 1rem;
        }

        .error-state p {
          color: #6c757d;
          margin-bottom: 2rem;
        }

        .category-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .breadcrumbs {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
          color: #6c757d;
        }

        .breadcrumbs a {
          color: #007bff;
          text-decoration: none;
        }

        .breadcrumbs a:hover {
          text-decoration: underline;
        }

        .category-header h1 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .category-description {
          color: #6c757d;
          font-size: 1.1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .category-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .results-info {
          font-weight: 500;
          color: #2c3e50;
        }

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .sort-controls label {
          font-weight: 500;
          color: #2c3e50;
        }

        .sort-controls select {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .product-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }

        .product-image {
          position: relative;
          width: 100%;
          height: 200px;
          overflow: hidden;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-card:hover .product-image img {
          transform: scale(1.05);
        }

        .no-image {
          font-size: 3rem;
          color: #6c757d;
        }

        .featured-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: #ffc107;
          color: #000;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .product-info {
          padding: 1.5rem;
        }

        .product-info h3 {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
        }

        .product-info h3 a {
          color: inherit;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .product-info h3 a:hover {
          color: #007bff;
        }

        .product-price {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .current-price {
          font-size: 1.2rem;
          font-weight: 600;
          color: #007bff;
        }

        .original-price {
          text-decoration: line-through;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .product-stock {
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }

        .in-stock {
          color: #28a745;
        }

        .out-of-stock {
          color: #dc3545;
        }

        .product-actions {
          display: flex;
          gap: 0.5rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          grid-column: 1 / -1;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .empty-state h3 {
          color: #2c3e50;
          margin-bottom: 1rem;
        }

        .empty-state p {
          color: #6c757d;
          margin-bottom: 2rem;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          margin-top: 3rem;
        }

        .page-numbers {
          display: flex;
          gap: 0.5rem;
        }

        .btn {
          padding: 0.5rem 1rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          text-align: center;
        }

        .btn:disabled {
          opacity: 0.5;
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

        .product-actions .btn {
          flex: 1;
          font-size: 0.8rem;
          padding: 0.5rem 0.75rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .category-controls {
            flex-direction: column;
            gap: 1rem;
          }

          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 1rem;
          }

          .product-actions {
            flex-direction: column;
          }

          .pagination {
            flex-direction: column;
            gap: 1rem;
          }

          .page-numbers {
            flex-wrap: wrap;
            justify-content: center;
          }

          .breadcrumbs {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
};

export default Category; 