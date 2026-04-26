import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useCart } from '../contexts/CartContext';
import ImagePreviewModal from '../components/ImagePreviewModal';
import ProductCard from '../components/ProductCard';
import { createApiUrl } from '../utils/config';
import './Products.css';

const Products = () => {
  const { addToCart, loading: cartLoading } = useCart();
  const { isInitialized: themeInitialized, siteSettings } = useTheme();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [searchParams, setSearchParams] = useSearchParams();
  const [previewModal, setPreviewModal] = useState({ isOpen: false, images: [], currentIndex: 0, altText: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [updateTrigger, forceUpdate] = useState({});
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(false);
  
  // Force update when theme colors change
  useEffect(() => {
    const handleThemeUpdate = () => {
      console.log('🎨 Products - Theme color update event received');
      forceUpdate({});
    };
    
    window.addEventListener('themeColorUpdate', handleThemeUpdate);
    return () => window.removeEventListener('themeColorUpdate', handleThemeUpdate);
  }, []);

  // Debug mode state
  const [debugMode, setDebugMode] = useState(false);

  console.log('🛍️ Products component - Theme initialized:', themeInitialized);
  console.log('🛍️ Products component - Site settings:', siteSettings);

  // Listen for theme settings updates and force re-render
  useEffect(() => {
    const handleThemeSettingsUpdate = (event) => {
      console.log('🛍️ Products - Theme settings updated:', event.detail);
      // Force component re-render by updating state
      setDebugMode(prev => !prev);
    };

    const handleForceSiteSettingsRefresh = (event) => {
      console.log('🛍️ Products - Force site settings refresh:', event.detail);
      // Force another re-render after a delay
      setTimeout(() => {
        setDebugMode(prev => !prev);
      }, 100);
    };

    document.addEventListener('themeSettingsUpdated', handleThemeSettingsUpdate);
    document.addEventListener('forceSiteSettingsRefresh', handleForceSiteSettingsRefresh);

    return () => {
      document.removeEventListener('themeSettingsUpdated', handleThemeSettingsUpdate);
      document.removeEventListener('forceSiteSettingsRefresh', handleForceSiteSettingsRefresh);
    };
  }, []);

  // Get query parameters
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const sort = searchParams.get('sort') || (siteSettings?.products_page_default_sort_by || 'newest');

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: (siteSettings?.products_page_max_items_per_page || 12).toString(),
        sort: sort,
        ...(category && { category }),
        ...(search && { search })
      });
      
      const response = await fetch(createApiUrl(`api/products?${params}`));
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      setPagination(data.pagination || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(createApiUrl('api/categories'));
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Fetch recommended products
  const fetchRecommendedProducts = async () => {
    try {
      setRecommendedLoading(true);
      const response = await fetch(createApiUrl('api/products?featured=true&per_page=8&sort=newest'));
      if (response.ok) {
        const data = await response.json();
        setRecommendedProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching recommended products:', err);
    } finally {
      setRecommendedLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [category, search, page, sort, siteSettings?.products_page_max_items_per_page]);

  useEffect(() => {
    fetchCategories();
    fetchRecommendedProducts();
  }, []);

  useEffect(() => {
    setSearchTerm(search);
    setSortBy(sort);
  }, [search, sort]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    if (!siteSettings?.products_page_enable_search) return;
    
    const newParams = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      newParams.set('search', searchTerm.trim());
    } else {
      newParams.delete('search');
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  // Handle category change
  const handleCategoryChange = (newCategory) => {
    const newParams = new URLSearchParams(searchParams);
    if (newCategory) {
      newParams.set('category', newCategory);
    } else {
      newParams.delete('category');
    }
    newParams.delete('page');
    setSearchParams(newParams);
  };

  // Handle sort change
  const handleSortChange = (newSort) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', newSort);
    newParams.delete('page');
    setSearchParams(newParams);
    setSortBy(newSort);
  };

  // Handle price filter
  const handlePriceFilter = () => {
    if (!siteSettings?.products_page_enable_filters) return;
    
    const newParams = new URLSearchParams(searchParams);
    if (priceRange.min) newParams.set('min_price', priceRange.min);
    if (priceRange.max) newParams.set('max_price', priceRange.max);
    newParams.delete('page');
    setSearchParams(newParams);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchParams(new URLSearchParams());
    setSearchTerm('');
    setSortBy(siteSettings?.products_page_default_sort_by || 'newest');
    setPriceRange({ min: '', max: '' });
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    if (!siteSettings?.products_page_enable_pagination) return;
    
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  // Get category name by slug
  const getCategoryName = (categorySlug) => {
    const categoryObj = categories.find(cat => cat.slug === categorySlug);
    return categoryObj ? categoryObj.name : categorySlug;
  };

    const openPreview = (images, currentIndex, altText) => {
    if (siteSettings?.products_page_enable_image_preview) {
      setPreviewModal({ isOpen: true, images, currentIndex, altText });
    }
  };

  // Pagination Component
  const Pagination = () => {
    if (!siteSettings?.products_page_enable_pagination || !pagination.pages || pagination.pages <= 1) return null;

    const maxVisible = 5;
    const startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    const endPage = Math.min(pagination.pages, startPage + maxVisible - 1);

    return (
      <div className="pagination">
        <button 
          onClick={() => handlePageChange(page - 1)}
          disabled={page <= 1}
          className="pagination-btn"
        >
          ← Previous
        </button>
        
        {Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(pageNum => (
          <button
            key={pageNum}
            onClick={() => handlePageChange(pageNum)}
            className={`pagination-btn ${page === pageNum ? 'active' : ''}`}
          >
            {pageNum}
          </button>
        ))}
        
        <button 
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= pagination.pages}
          className="pagination-btn"
        >
          Next →
        </button>
      </div>
    );
  };

  // If theme is not initialized, show loading
  if (!themeInitialized) {
    return (
      <div className="products-page-container">
        <div className="container">
          <div className="loading-message">Loading theme settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page products-page-container" style={{ backgroundColor: 'var(--products-background-main)' }}>
      <div className="container">
        {/* Page Header */}
        <div className="page-header">
          <h1 className="page-title" style={{ 
            color: 'var(--products-title-color)',
            fontSize: `${siteSettings?.products_page_title_font_size || 32}px`,
            fontFamily: siteSettings?.products_page_title_font_family || 'inherit',
            fontWeight: siteSettings?.products_page_title_font_weight || 'bold',
            fontStyle: siteSettings?.products_page_title_font_style || 'normal'
          }}>
            {category ? getCategoryName(category) : 'All Products'}
          </h1>
          <p className="page-description" style={{
            color: 'var(--products-text-secondary)',
            fontSize: `${siteSettings?.products_page_subtitle_font_size || 16}px`,
            fontFamily: siteSettings?.products_page_subtitle_font_family || 'inherit',
            fontWeight: siteSettings?.products_page_subtitle_font_weight || 'normal',
            fontStyle: siteSettings?.products_page_subtitle_font_style || 'normal'
          }}>
            Discover our collection of premium products
          </p>
        </div>

        {/* Search and Filters */}
        <div className="search-filters-section">
          <div className="search-filter-row">
            {/* Search Bar */}
            {siteSettings?.products_page_enable_search && (
              <div className="search-container">
                <form onSubmit={handleSearch} className="search-form">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                  />
                  <button type="submit" className="search-btn">
                    🔍
                  </button>
                </form>
              </div>
            )}

            {/* Filter Toggle */}
            {siteSettings?.products_page_enable_filters && (
              <button 
                className="filter-toggle-btn"
                onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              >
                Filters {isFiltersOpen ? '▲' : '▼'}
              </button>
            )}

            {/* Sort Dropdown */}
            <div className="sort-container">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => handleSortChange(e.target.value)}
                className="sort-select"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A-Z</option>
                <option value="name-desc">Name: Z-A</option>
                <option value="featured">Featured</option>
              </select>
            </div>
          </div>

          {/* Expandable Filters */}
          {siteSettings?.products_page_enable_filters && isFiltersOpen && (
            <div className="filters-section">
              <div className="filters-row">
                {/* Category Filter */}
                <div className="filter-group">
                  <label>Category:</label>
                  <select
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range Filter */}
                <div className="filter-group">
                  <label>Price Range:</label>
                  <div className="price-range-inputs">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                      className="price-input"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                      className="price-input"
                    />
                    <button
                      type="button"
                      onClick={handlePriceFilter}
                      className="apply-filter-btn"
                    >
                      Apply
                    </button>
                  </div>
                </div>

                {/* Clear Filters */}
                <div className="filter-group">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="clear-filters-btn"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading products...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="error-container">
            <p className="error-message">Error: {error}</p>
            <button onClick={fetchProducts} className="retry-btn">
              Try Again
            </button>
          </div>
        )}

      </div>

      {/* Main Products Section - Separate frame from search */}
      {!loading && !error && (
        <div className="main-products-section">

          <div 
            className="products-grid"
            style={{
              '--products-per-row': siteSettings?.products_page_per_row || 4,
              '--products-per-row-tablet': 4,
              '--products-per-row-mobile': 3,
              '--products-per-row-small': 2,
              '--dynamic-button-font-size': `${Math.max(10, 16 - ((siteSettings?.products_page_per_row || 4) - 3) * 1.5)}px`,
              '--product-card-button-radius': `${siteSettings?.product_card_button_radius || 16}px`
            }}
          >
            {products.length > 0 ? (
              products.map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  categories={categories}
                  siteSettings={siteSettings}
                  openPreview={openPreview}
                />
              ))
            ) : (
              <div className="no-products-container">
                <p className="no-products-message">
                  {search ? `No products found for "${search}"` : 
                   category ? `No products found in category "${getCategoryName(category)}"` : 
                   'No products available'}
                </p>
                {(search || category) && (
                  <button onClick={clearFilters} className="clear-filters-btn">
                    View All Products
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          <Pagination />
        </div>
      )}

      {/* Recommended Products Section - Outside container for wider layout */}
      {!loading && !error && recommendedProducts.length > 0 && siteSettings?.show_recommended_products !== false && (
        <div className="recommended-products-section">
          <div className="section-header">
            <h2 className="section-title" style={{
              color: 'var(--products-title-color)',
              fontSize: `${(siteSettings?.products_page_title_font_size || 32) - 8}px`,
              fontFamily: siteSettings?.products_page_title_font_family || 'inherit',
              fontWeight: siteSettings?.products_page_title_font_weight || 'bold',
              fontStyle: siteSettings?.products_page_title_font_style || 'normal'
            }}>
              Recommended Products
            </h2>
            <p className="section-subtitle" style={{
              color: 'var(--products-text-secondary)',
              fontSize: `${(siteSettings?.products_page_subtitle_font_size || 16) - 2}px`,
              fontFamily: siteSettings?.products_page_subtitle_font_family || 'inherit',
              fontWeight: siteSettings?.products_page_subtitle_font_weight || 'normal',
              fontStyle: siteSettings?.products_page_subtitle_font_style || 'normal'
            }}>
              You might also like these products
            </p>
          </div>

          {recommendedLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading recommended products...</p>
            </div>
          ) : (
            <div 
              className="recommended-products-grid"
              style={{
                '--products-per-row': siteSettings?.recommended_products_per_row || 6,
                '--products-per-row-tablet': Math.min(siteSettings?.recommended_products_per_row || 6, 4),
                '--products-per-row-mobile': Math.min(siteSettings?.recommended_products_per_row || 6, 3),
                '--products-per-row-small': Math.min(siteSettings?.recommended_products_per_row || 6, 2),
                '--dynamic-button-font-size': `${Math.max(10, 16 - ((siteSettings?.recommended_products_per_row || 6) - 3) * 1.5)}px`,
                '--product-card-button-radius': `${siteSettings?.product_card_button_radius || 16}px`
              }}
            >
              {recommendedProducts.slice(0, (siteSettings?.recommended_products_per_row || 6) * (siteSettings?.recommended_products_rows || 1)).map(product => (
                <ProductCard 
                  key={`recommended-${product.id}`}
                  product={product} 
                  categories={categories}
                  siteSettings={siteSettings}
                  openPreview={openPreview}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewModal.isOpen && (
        <ImagePreviewModal
          images={previewModal.images}
          currentIndex={previewModal.currentIndex}
          isOpen={previewModal.isOpen}
          onClose={() => setPreviewModal({ isOpen: false, images: [], currentIndex: 0, altText: '' })}
          altText={previewModal.altText}
        />
      )}
    </div>
  );
};

export default Products; 