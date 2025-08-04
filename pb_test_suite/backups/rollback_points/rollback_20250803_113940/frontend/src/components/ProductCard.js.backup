import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import LikeButton from './LikeButton';

const ProductCard = ({ product, categories = [], siteSettings = {}, openPreview }) => {
  const { addToCart, loading: cartLoading } = useCart();

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cartLoading) return;
    await addToCart(product, 1);
  };

  // Determine which settings to use (products page vs homepage)
  const settings = siteSettings.products_page_card_style ? {
    // Products page settings
    cardStyle: siteSettings?.products_page_card_style || 'modern',
    cardShadow: siteSettings?.products_page_card_shadow,
    cardHover: siteSettings?.products_page_card_hover_effect,
    showBadges: siteSettings?.products_page_show_badges,
    showImages: siteSettings?.products_page_show_images,
    showFavorite: siteSettings?.products_page_show_favorite,
    enableImagePreview: siteSettings?.products_page_enable_image_preview !== false,
    showCategory: siteSettings?.products_page_show_category,
    showPrice: siteSettings?.products_page_show_price,
    showOriginalPrice: siteSettings?.products_page_show_original_price,
    showStock: siteSettings?.products_page_show_stock,
    showDetails: siteSettings?.products_page_show_details,
    showBuyNow: siteSettings?.products_page_show_buy_now,
    // Styling
    categoryColor: siteSettings?.products_page_category_color || '#666',
    categoryFontSize: siteSettings?.products_page_category_font_size || 14,
    categoryFontFamily: siteSettings?.products_page_category_font_family || 'inherit',
    categoryFontWeight: siteSettings?.products_page_category_font_weight || 'normal',
    categoryFontStyle: siteSettings?.products_page_category_font_style || 'normal',
    productNameColor: siteSettings?.products_page_product_name_color || '#333',
    productNameFontSize: siteSettings?.products_page_product_name_font_size || 18,
    productNameFontFamily: siteSettings?.products_page_product_name_font_family || 'inherit',
    productNameFontWeight: siteSettings?.products_page_product_name_font_weight || 'bold',
    productNameFontStyle: siteSettings?.products_page_product_name_font_style || 'normal',
    priceColor: siteSettings?.products_page_price_color || '#e74c3c',
    priceFontSize: siteSettings?.products_page_price_font_size || 20,
    priceFontFamily: siteSettings?.products_page_price_font_family || 'inherit',
    priceFontWeight: siteSettings?.products_page_price_font_weight || 'bold',
    priceFontStyle: siteSettings?.products_page_price_font_style || 'normal',
    originalPriceColor: siteSettings?.products_page_original_price_color || '#999',
    originalPriceFontSize: siteSettings?.products_page_original_price_font_size || 16,
    originalPriceFontFamily: siteSettings?.products_page_original_price_font_family || 'inherit',
    originalPriceFontWeight: siteSettings?.products_page_original_price_font_weight || 'normal',
    originalPriceFontStyle: siteSettings?.products_page_original_price_font_style || 'normal',
    viewDetailsButtonColor: siteSettings?.products_page_view_details_button_color || 'var(--primary-color)',
    viewDetailsButtonTextColor: siteSettings?.products_page_view_details_button_text_color || 'var(--text-light)',
    viewDetailsButtonFontSize: siteSettings?.products_page_view_details_button_font_size || 14,
    viewDetailsButtonFontFamily: siteSettings?.products_page_view_details_button_font_family || 'inherit',
    viewDetailsButtonFontWeight: siteSettings?.products_page_view_details_button_font_weight || 'normal',
    viewDetailsButtonFontStyle: siteSettings?.products_page_view_details_button_font_style || 'normal',
    addToCartButtonColor: siteSettings?.products_page_add_to_cart_button_color || '#28a745',
    addToCartButtonTextColor: siteSettings?.products_page_add_to_cart_button_text_color || 'white',
    addToCartButtonFontSize: siteSettings?.products_page_add_to_cart_button_font_size || 14,
    addToCartButtonFontFamily: siteSettings?.products_page_add_to_cart_button_font_family || 'inherit',
    addToCartButtonFontWeight: siteSettings?.products_page_add_to_cart_button_font_weight || 'normal',
    addToCartButtonFontStyle: siteSettings?.products_page_add_to_cart_button_font_style || 'normal'
  } : {
    // Homepage settings - fallback to homepage settings
    cardStyle: siteSettings?.homepage_products_card_style || 'modern',
    cardShadow: siteSettings?.homepage_products_card_shadow,
    cardHover: siteSettings?.homepage_products_card_hover_effect,
    showBadges: siteSettings?.homepage_products_show_badges,
    showImages: siteSettings?.homepage_products_show_images,
    showFavorite: siteSettings?.homepage_products_show_favorite,
    enableImagePreview: siteSettings?.homepage_products_enable_image_preview !== false,
    showCategory: siteSettings?.homepage_products_show_category,
    showPrice: siteSettings?.homepage_products_show_price,
    showOriginalPrice: siteSettings?.homepage_products_show_original_price,
    showStock: siteSettings?.homepage_products_show_stock,
    showDetails: siteSettings?.homepage_products_show_details,
    showBuyNow: siteSettings?.homepage_products_show_buy_now,
    // Styling
    categoryColor: '#666',
    categoryFontSize: 14,
    categoryFontFamily: 'inherit',
    categoryFontWeight: 'normal',
    categoryFontStyle: 'normal',
    productNameColor: siteSettings?.homepage_products_product_name_color || '#333333',
    productNameFontSize: siteSettings?.homepage_products_product_name_font_size || 18,
    productNameFontFamily: siteSettings?.homepage_products_product_name_font_family || 'Arial, sans-serif',
    productNameFontWeight: siteSettings?.homepage_products_product_name_font_weight || 'bold',
    productNameFontStyle: siteSettings?.homepage_products_product_name_font_style || 'normal',
    priceColor: siteSettings?.homepage_products_product_price_color || '#007bff',
    priceFontSize: siteSettings?.homepage_products_product_price_font_size || 16,
    priceFontFamily: siteSettings?.homepage_products_product_price_font_family || 'Arial, sans-serif',
    priceFontWeight: siteSettings?.homepage_products_product_price_font_weight || 'bold',
    priceFontStyle: siteSettings?.homepage_products_product_price_font_style || 'normal',
    originalPriceColor: '#999',
    originalPriceFontSize: 16,
    originalPriceFontFamily: 'inherit',
    originalPriceFontWeight: 'normal',
    originalPriceFontStyle: 'normal',
    viewDetailsButtonColor: siteSettings?.homepage_products_view_details_button_color || '#007bff',
    viewDetailsButtonTextColor: siteSettings?.homepage_products_view_details_button_text_color || '#ffffff',
    viewDetailsButtonFontSize: 14,
    viewDetailsButtonFontFamily: 'inherit',
    viewDetailsButtonFontWeight: 'normal',
    viewDetailsButtonFontStyle: 'normal',
    addToCartButtonColor: siteSettings?.homepage_products_add_to_cart_button_color || '#28a745',
    addToCartButtonTextColor: siteSettings?.homepage_products_add_to_cart_button_text_color || '#ffffff',
    addToCartButtonFontSize: 14,
    addToCartButtonFontFamily: 'inherit',
    addToCartButtonFontWeight: 'normal',
    addToCartButtonFontStyle: 'normal'
  };

  return (
    <div 
      className={`product-card with-shadow with-hover ${settings.cardStyle}`}
      style={{
        boxShadow: settings.cardShadow ? '0 4px 8px rgba(0,0,0,0.1)' : 'none',
        transition: settings.cardHover ? 'all 0.3s ease' : 'none'
      }}
    >
      {/* Product Badges */}
      {settings.showBadges && (
        <div className="product-badges">
          {product.is_featured && <span className="badge featured">Featured</span>}
          {product.original_price && product.original_price > product.price && (
            <span className="badge discount">Sale</span>
          )}
          {product.stock_quantity <= 5 && product.stock_quantity > 0 && (
            <span className="badge low-stock">Low Stock</span>
          )}
          {product.stock_quantity === 0 && <span className="badge out-of-stock">Out of Stock</span>}
        </div>
      )}

      {/* Product Image */}
      {settings.showImages && (
        <div className="product-image-container">
          {product.images && product.images.length > 0 ? (
            <div className="product-image image-preview-hover" style={{ position: 'relative' }}>
              <Link to={`/product/${product.slug}`}>
                <img
                  src={`http://localhost:5005${product.images[0]}`}
                  alt={product.name}
                  className="product-image"
                  style={{
                    cursor: 'pointer',
                    display: 'block'
                  }}
                />
              </Link>
              {settings.enableImagePreview && openPreview && (
                <div 
                  className="image-zoom-overlay"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const productImages = product.images.map(img => `http://localhost:5005${img}`);
                    openPreview(productImages, 0, product.name);
                  }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    cursor: 'zoom-in',
                    zIndex: 5
                  }}
                />
              )}
            </div>
          ) : (
            <Link to={`/product/${product.slug}`}>
              <div className="product-image-placeholder">
                <div className="no-image-icon">📷</div>
              </div>
            </Link>
          )}
          {/* Like Button */}
          {settings.showFavorite && (
            <div className="like-button-container">
              <LikeButton 
                type="product" 
                itemId={product.id} 
                className="favorite-btn-like"
              />
            </div>
          )}
        </div>
      )}

      <div className="product-info">
        {/* Category */}
        {settings.showCategory && (
          <p className="product-category" style={{
            color: settings.categoryColor,
            fontSize: `${settings.categoryFontSize}px`,
            fontFamily: settings.categoryFontFamily,
            fontWeight: settings.categoryFontWeight,
            fontStyle: settings.categoryFontStyle
          }}>
            {getCategoryName(product.category_id)}
          </p>
        )}

        {/* Product Name */}
        <h3 className="product-name" style={{
          color: settings.productNameColor,
          fontSize: `${settings.productNameFontSize}px`,
          fontFamily: settings.productNameFontFamily,
          fontWeight: settings.productNameFontWeight,
          fontStyle: settings.productNameFontStyle
        }}>
          {product.name}
        </h3>

        {/* Price */}
        {settings.showPrice && (
          <div className="product-price" style={{
            color: settings.priceColor,
            fontSize: `${settings.priceFontSize}px`,
            fontFamily: settings.priceFontFamily,
            fontWeight: settings.priceFontWeight,
            fontStyle: settings.priceFontStyle
          }}>
            ₺{product.price.toFixed(2)}
            {settings.showOriginalPrice && product.original_price && product.original_price > product.price && (
              <span className="original-price" style={{
                color: settings.originalPriceColor,
                fontSize: `${settings.originalPriceFontSize}px`,
                fontFamily: settings.originalPriceFontFamily,
                fontWeight: settings.originalPriceFontWeight,
                fontStyle: settings.originalPriceFontStyle
              }}>
                ₺{product.original_price.toFixed(2)}
              </span>
            )}
          </div>
        )}

        {/* Stock Status */}
        {settings.showStock && (
          <div className="stock-status">
            {product.stock_quantity > 0 ? (
              <span className="in-stock">In Stock ({product.stock_quantity} available)</span>
            ) : (
              <span className="out-of-stock">Out of Stock</span>
            )}
          </div>
        )}

        {/* Product Actions */}
        <div className="product-actions">
          {/* View Details Button */}
          {settings.showDetails && (
            <Link 
              to={`/product/${product.slug}`} 
              className="btn btn-details"
              style={{
                backgroundColor: settings.viewDetailsButtonColor,
                color: settings.viewDetailsButtonTextColor,
                borderColor: settings.viewDetailsButtonColor,
                fontSize: `${settings.viewDetailsButtonFontSize}px`,
                fontFamily: settings.viewDetailsButtonFontFamily,
                fontWeight: settings.viewDetailsButtonFontWeight,
                fontStyle: settings.viewDetailsButtonFontStyle
              }}
            >
              View Details
            </Link>
          )}

          {/* Add to Cart Button */}
          {settings.showBuyNow && (
            <button
              onClick={handleAddToCart}
              disabled={cartLoading || product.stock_quantity === 0}
              className="btn btn-add-to-cart"
             style={{
               backgroundColor: settings.addToCartButtonColor,
               color: settings.addToCartButtonTextColor,
               borderColor: settings.addToCartButtonColor,
               fontSize: `${settings.addToCartButtonFontSize}px`,
               fontFamily: settings.addToCartButtonFontFamily,
               fontWeight: settings.addToCartButtonFontWeight,
               fontStyle: settings.addToCartButtonFontStyle
             }}
            >
              {cartLoading ? 'Adding...' : 'Add to Cart'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;