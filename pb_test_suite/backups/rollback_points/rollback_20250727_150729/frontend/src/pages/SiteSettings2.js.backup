import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const SiteSettings2 = () => {
  const { user } = useAuth();
  const { currentTheme, isUpdatingSiteSettings, siteSettings: contextSiteSettings, refreshSiteSettings } = useTheme();
  const [settingsTab, setSettingsTab] = useState('products-page');
  const [settingsCategory, setSettingsCategory] = useState('product-settings'); // home-settings, product-settings
  const [siteSettings, setSiteSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  // Use site settings from theme context
  useEffect(() => {
    if (contextSiteSettings) {

      setSiteSettings(contextSiteSettings);
      setLoading(false);
    }
  }, [contextSiteSettings]);

  const fetchSiteSettings = async () => {

    const settings = await refreshSiteSettings();
    if (settings) {
      setSiteSettings(settings);
    }
    setLoading(false);
  };

  const handleUpdateSiteSettings = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Frontend\'den gönderilen Products Page Style Settings verileri:');
    console.log('products_page_title_font_family:', siteSettings.products_page_title_font_family);
    console.log('products_page_product_name_font_family:', siteSettings.products_page_product_name_font_family);
    console.log('Tüm siteSettings:', siteSettings);

    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(siteSettings)
      });

      if (response.ok) {
        toast.success('Site settings updated successfully');
        await fetchSiteSettings(); // Refresh from theme context
      } else {
        const error = await response.text();
        toast.error(`Failed to update site settings: ${error}`);
      }
    } catch (error) {
      console.error('Error updating site settings:', error);
      toast.error('Error updating site settings');
    }
  };

  // Initial load
  useEffect(() => {
    if (!contextSiteSettings) {
      fetchSiteSettings();
    }
  }, []);

  // Watch for theme changes and reload settings
  useEffect(() => {
    if (currentTheme) {

      // Reload settings when theme changes
      setTimeout(() => {
        fetchSiteSettings();
      }, 500); // Wait for theme sync to complete
    }
  }, [currentTheme]);

  // Also reload when theme updating completes
  useEffect(() => {
    if (!isUpdatingSiteSettings) {

      fetchSiteSettings();
    }
  }, [isUpdatingSiteSettings]);

  return (
    <div className="menu-settings-container">
      <div className="menu-settings-header">
        <h2>Site Settings</h2>
        <p>Manage your site's appearance and functionality</p>
      </div>

      {/* Theme Update Loading Indicator */}
      {isUpdatingSiteSettings && (
        <div className="theme-update-alert">
          <div className="alert alert-info">
            <div className="loading-spinner-inline"></div>
            <span>🎨 Updating theme colors... Please wait.</span>
          </div>
        </div>
      )}

      <div className="settings-navigation">
        <div className="nav-section">
          <h3>Settings Categories</h3>
          <div className="nav-buttons">
            <button 
              className={`nav-btn ${settingsCategory === 'home-settings' ? 'active' : ''}`}
              onClick={() => setSettingsCategory('home-settings')}
            >
              🏠 Home Settings
            </button>
            <button 
              className={`nav-btn ${settingsCategory === 'product-settings' ? 'active' : ''}`}
              onClick={() => setSettingsCategory('product-settings')}
            >
              🛍️ Product Settings
            </button>
          </div>
        </div>
      </div>

      <div className="settings-navigation">
        <div className="nav-section">
          <h3>Site Settings</h3>
          <div className="nav-buttons">
            <button 
              className={`nav-btn ${settingsTab === 'homepage-products-styling' ? 'active' : ''}`}
              onClick={() => setSettingsTab('homepage-products-styling')}
            >
              🎨 Home Style
            </button>
            <button 
              className={`nav-btn ${settingsTab === 'homepage-products' ? 'active' : ''}`}
              onClick={() => setSettingsTab('homepage-products')}
            >
              🏠 Home Products
            </button>
            <button 
              className={`nav-btn ${settingsTab === 'homepage-products2' ? 'active' : ''}`}
              onClick={() => setSettingsTab('homepage-products2')}
            >
              🏠 Home Products 2
            </button>
            <button 
              className={`nav-btn ${settingsTab === 'products-page' ? 'active' : ''}`}
              onClick={() => setSettingsTab('products-page')}
            >
              📄 Products Page
            </button>
            <button 
              className={`nav-btn ${settingsTab === 'products-page-styling' ? 'active' : ''}`}
              onClick={() => setSettingsTab('products-page-styling')}
            >
              🎨 Products Style
            </button>
            <button 
              className={`nav-btn ${settingsTab === 'product-detail' ? 'active' : ''}`}
              onClick={() => setSettingsTab('product-detail')}
            >
              📝 Product Detail
            </button>
          </div>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-header">
          <h2>Advanced Site Settings</h2>
          <button 
            type="button" 
            className="btn btn-primary settings-save-btn"
            onClick={(e) => handleUpdateSiteSettings(e)}
          >
            💾 Save Settings
          </button>
        </div>

        <div className="settings-layout">
          <div className="settings-main">
            <form onSubmit={handleUpdateSiteSettings} className="site-settings-form">
              
              {/* PRODUCT SETTINGS TABS */}
              
              {/* Products Page Tab */}
              {settingsTab === 'products-page' && (
                <div className="settings-section">
                  <h3>Products Page Settings</h3>
                  <p>Configure the layout and display options for the products page</p>
                  <div className="form-group">
                    <label>Products Page Background Color</label>
                    <input
                      type="color"
                      value={siteSettings.products_page_background_color || '#ffffff'}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        products_page_background_color: e.target.value
                      }))}
                    />
                    <small>This color will be applied to the products page background</small>
                  </div>
                  <hr />
                  <h4>Layout Settings</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Products Per Row</label>
                      <input
                        type="number"
                        min="2"
                        max="6"
                        value={siteSettings.products_page_per_row || 4}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          products_page_per_row: parseInt(e.target.value) || 4
                        }))}
                      />
                      <small>Number of products per row (2-6)</small>
                    </div>
                    <div className="form-group">
                      <label>Items Per Page</label>
                      <input
                        type="number"
                        min="8"
                        max="48"
                        value={siteSettings.products_page_max_items_per_page || 12}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          products_page_max_items_per_page: parseInt(e.target.value) || 12
                        }))}
                      />
                      <small>Number of products per page (8-48)</small>
                    </div>
                  </div>
                  <hr />
                  <h4>Display Options</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.products_page_show_images || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_show_images: e.target.checked
                          }))}
                        />
                        Show product images
                      </label>
                    </div>
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.products_page_show_favorite || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_show_favorite: e.target.checked
                          }))}
                        />
                        Show favorite button
                      </label>
                    </div>
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.products_page_show_price || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_show_price: e.target.checked
                          }))}
                        />
                        Show price
                      </label>
                    </div>
                  </div>
                  <hr />
                  <h4>Features</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.products_page_enable_pagination || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_enable_pagination: e.target.checked
                          }))}
                        />
                        Enable pagination
                      </label>
                    </div>
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.products_page_enable_filters || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_enable_filters: e.target.checked
                          }))}
                        />
                        Enable filters
                      </label>
                    </div>
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.products_page_enable_search || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_enable_search: e.target.checked
                          }))}
                        />
                        Enable search
                      </label>
                    </div>
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.products_page_enable_image_preview !== false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_enable_image_preview: e.target.checked
                          }))}
                        />
                        Enable image preview modal
                      </label>
                      <small>Allow users to preview product images in a modal popup</small>
                    </div>
                  </div>
                </div>
              )}

              {/* Products Page Styling Tab */}
              {settingsTab === 'products-page-styling' && (
                <div className="settings-section">
                  <h3>Products Page Style Settings</h3>
                  <p>Customize the appearance of product cards on the Products page</p>

                  {/* Page Title and Subtitle Styling */}
                  <div style={{ backgroundColor: '#fff8dc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4>📄 Page Title Styling</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Title Color</label>
                        <input
                          type="color"
                          value={siteSettings.products_page_title_color || '#333333'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_title_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Title Font Family</label>
                        <select
                          value={siteSettings.products_page_title_font_family || 'Arial, sans-serif'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_title_font_family: e.target.value
                          }))}
                        >
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="'Times New Roman', serif">Times New Roman</option>
                          <option value="'Courier New', monospace">Courier New</option>
                          <option value="'Georgia', serif">Georgia</option>
                          <option value="'Verdana', sans-serif">Verdana</option>
                          <option value="'Tahoma', sans-serif">Tahoma</option>
                          <option value="'Roboto', sans-serif">Roboto</option>
                          <option value="'Open Sans', sans-serif">Open Sans</option>
                          <option value="'Lato', sans-serif">Lato</option>
                          <option value="'Montserrat', sans-serif">Montserrat</option>
                          <option value="'Poppins', sans-serif">Poppins</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Title Font Size (px)</label>
                        <input
                          type="number"
                          value={siteSettings.products_page_title_font_size || 32}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_title_font_size: parseInt(e.target.value) || 32
                          }))}
                          min="16"
                          max="60"
                        />
                      </div>

                      <div className="form-group">
                        <label>Title Font Weight</label>
                        <select
                          value={siteSettings.products_page_title_font_weight || 'bold'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_title_font_weight: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="100">100 (Thin)</option>
                          <option value="300">300 (Light)</option>
                          <option value="400">400 (Regular)</option>
                          <option value="500">500 (Medium)</option>
                          <option value="600">600 (Semi Bold)</option>
                          <option value="700">700 (Bold)</option>
                          <option value="900">900 (Black)</option>
                        </select>
                      </div>
                    </div>

                    <h5>Subtitle Styling</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Subtitle Color</label>
                        <input
                          type="color"
                          value={siteSettings.products_page_subtitle_color || '#666666'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_subtitle_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Subtitle Font Family</label>
                        <select
                          value={siteSettings.products_page_subtitle_font_family || 'Arial, sans-serif'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_subtitle_font_family: e.target.value
                          }))}
                        >
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="'Times New Roman', serif">Times New Roman</option>
                          <option value="'Courier New', monospace">Courier New</option>
                          <option value="'Georgia', serif">Georgia</option>
                          <option value="'Verdana', sans-serif">Verdana</option>
                          <option value="'Tahoma', sans-serif">Tahoma</option>
                          <option value="'Roboto', sans-serif">Roboto</option>
                          <option value="'Open Sans', sans-serif">Open Sans</option>
                          <option value="'Lato', sans-serif">Lato</option>
                          <option value="'Montserrat', sans-serif">Montserrat</option>
                          <option value="'Poppins', sans-serif">Poppins</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Subtitle Font Size (px)</label>
                        <input
                          type="number"
                          value={siteSettings.products_page_subtitle_font_size || 16}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_subtitle_font_size: parseInt(e.target.value) || 16
                          }))}
                          min="12"
                          max="30"
                        />
                      </div>

                      <div className="form-group">
                        <label>Subtitle Font Weight</label>
                        <select
                          value={siteSettings.products_page_subtitle_font_weight || 'normal'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_subtitle_font_weight: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="100">100 (Thin)</option>
                          <option value="300">300 (Light)</option>
                          <option value="400">400 (Regular)</option>
                          <option value="500">500 (Medium)</option>
                          <option value="600">600 (Semi Bold)</option>
                          <option value="700">700 (Bold)</option>
                          <option value="900">900 (Black)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Product Name Styling */}
                  <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4>📝 Product Name Styling</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Text Color</label>
                        <input
                          type="color"
                          value={siteSettings.products_page_product_name_color || '#333333'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_product_name_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Family</label>
                        <select
                          value={siteSettings.products_page_product_name_font_family || 'Arial, sans-serif'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_product_name_font_family: e.target.value
                          }))}
                        >
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="'Times New Roman', serif">Times New Roman</option>
                          <option value="'Courier New', monospace">Courier New</option>
                          <option value="'Georgia', serif">Georgia</option>
                          <option value="'Verdana', sans-serif">Verdana</option>
                          <option value="'Tahoma', sans-serif">Tahoma</option>
                          <option value="'Roboto', sans-serif">Roboto</option>
                          <option value="'Open Sans', sans-serif">Open Sans</option>
                          <option value="'Lato', sans-serif">Lato</option>
                          <option value="'Montserrat', sans-serif">Montserrat</option>
                          <option value="'Poppins', sans-serif">Poppins</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Font Size (px)</label>
                        <input
                          type="number"
                          value={siteSettings.products_page_product_name_font_size || 18}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_product_name_font_size: parseInt(e.target.value) || 18
                          }))}
                          min="10"
                          max="50"
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Weight</label>
                        <select
                          value={siteSettings.products_page_product_name_font_weight || 'bold'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_product_name_font_weight: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="100">100 (Thin)</option>
                          <option value="300">300 (Light)</option>
                          <option value="400">400 (Regular)</option>
                          <option value="500">500 (Medium)</option>
                          <option value="600">600 (Semi Bold)</option>
                          <option value="700">700 (Bold)</option>
                          <option value="900">900 (Black)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Font Style</label>
                        <select
                          value={siteSettings.products_page_product_name_font_style || 'normal'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_product_name_font_style: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="italic">Italic</option>
                          <option value="oblique">Oblique</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Product Price Styling */}
                  <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4>💰 Product Price Styling</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Text Color</label>
                        <input
                          type="color"
                          value={siteSettings.products_page_product_price_color || '#007bff'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_product_price_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Family</label>
                        <select
                          value={siteSettings.products_page_product_price_font_family || 'Arial, sans-serif'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_product_price_font_family: e.target.value
                          }))}
                        >
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="'Times New Roman', serif">Times New Roman</option>
                          <option value="'Courier New', monospace">Courier New</option>
                          <option value="'Georgia', serif">Georgia</option>
                          <option value="'Verdana', sans-serif">Verdana</option>
                          <option value="'Tahoma', sans-serif">Tahoma</option>
                          <option value="'Roboto', sans-serif">Roboto</option>
                          <option value="'Open Sans', sans-serif">Open Sans</option>
                          <option value="'Lato', sans-serif">Lato</option>
                          <option value="'Montserrat', sans-serif">Montserrat</option>
                          <option value="'Poppins', sans-serif">Poppins</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Font Size (px)</label>
                        <input
                          type="number"
                          value={siteSettings.products_page_product_price_font_size || 16}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_product_price_font_size: parseInt(e.target.value) || 16
                          }))}
                          min="10"
                          max="50"
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Weight</label>
                        <select
                          value={siteSettings.products_page_product_price_font_weight || 'bold'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_product_price_font_weight: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="100">100 (Thin)</option>
                          <option value="300">300 (Light)</option>
                          <option value="400">400 (Regular)</option>
                          <option value="500">500 (Medium)</option>
                          <option value="600">600 (Semi Bold)</option>
                          <option value="700">700 (Bold)</option>
                          <option value="900">900 (Black)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Font Style</label>
                        <select
                          value={siteSettings.products_page_product_price_font_style || 'normal'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_product_price_font_style: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="italic">Italic</option>
                          <option value="oblique">Oblique</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Category Styling */}
                  <div style={{ backgroundColor: '#f0f8ff', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4>🏷️ Category Label Styling</h4>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Text Color</label>
                        <input
                          type="color"
                          value={siteSettings.products_page_product_category_color || '#666666'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_product_category_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Family</label>
                        <select
                          value={siteSettings.products_page_product_category_font_family || 'Arial, sans-serif'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_product_category_font_family: e.target.value
                          }))}
                        >
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="'Times New Roman', serif">Times New Roman</option>
                          <option value="'Courier New', monospace">Courier New</option>
                          <option value="'Georgia', serif">Georgia</option>
                          <option value="'Verdana', sans-serif">Verdana</option>
                          <option value="'Tahoma', sans-serif">Tahoma</option>
                          <option value="'Roboto', sans-serif">Roboto</option>
                          <option value="'Open Sans', sans-serif">Open Sans</option>
                          <option value="'Lato', sans-serif">Lato</option>
                          <option value="'Montserrat', sans-serif">Montserrat</option>
                          <option value="'Poppins', sans-serif">Poppins</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Font Size (px)</label>
                        <input
                          type="number"
                          value={siteSettings.products_page_product_category_font_size || 14}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_product_category_font_size: parseInt(e.target.value) || 14
                          }))}
                          min="10"
                          max="30"
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Weight</label>
                        <select
                          value={siteSettings.products_page_product_category_font_weight || 'normal'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_product_category_font_weight: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="100">100 (Thin)</option>
                          <option value="300">300 (Light)</option>
                          <option value="400">400 (Regular)</option>
                          <option value="500">500 (Medium)</option>
                          <option value="600">600 (Semi Bold)</option>
                          <option value="700">700 (Bold)</option>
                          <option value="900">900 (Black)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Font Style</label>
                        <select
                          value={siteSettings.products_page_product_category_font_style || 'normal'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_product_category_font_style: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="italic">Italic</option>
                          <option value="oblique">Oblique</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Button Styling */}
                  <div style={{ backgroundColor: '#ffeaa7', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4>🔘 Button Styling</h4>
                    
                    <h5>View Details Button</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Background Color</label>
                        <input
                          type="color"
                          value={siteSettings.products_page_view_details_button_color || '#007bff'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_view_details_button_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Text Color</label>
                        <input
                          type="color"
                          value={siteSettings.products_page_view_details_button_text_color || '#ffffff'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_view_details_button_text_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Size (px)</label>
                        <input
                          type="number"
                          value={siteSettings.products_page_view_details_button_font_size || 14}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_view_details_button_font_size: parseInt(e.target.value) || 14
                          }))}
                          min="10"
                          max="24"
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Weight</label>
                        <select
                          value={siteSettings.products_page_view_details_button_font_weight || 'normal'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_view_details_button_font_weight: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="600">600 (Semi Bold)</option>
                          <option value="700">700 (Bold)</option>
                        </select>
                      </div>
                    </div>

                    <h5>Add to Cart Button</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Background Color</label>
                        <input
                          type="color"
                          value={siteSettings.products_page_add_to_cart_button_color || '#28a745'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_add_to_cart_button_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Text Color</label>
                        <input
                          type="color"
                          value={siteSettings.products_page_add_to_cart_button_text_color || '#ffffff'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_add_to_cart_button_text_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Size (px)</label>
                        <input
                          type="number"
                          value={siteSettings.products_page_add_to_cart_button_font_size || 14}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_add_to_cart_button_font_size: parseInt(e.target.value) || 14
                          }))}
                          min="10"
                          max="24"
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Weight</label>
                        <select
                          value={siteSettings.products_page_add_to_cart_button_font_weight || 'normal'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            products_page_add_to_cart_button_font_weight: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="600">600 (Semi Bold)</option>
                          <option value="700">700 (Bold)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Product Detail Tab */}
              {settingsTab === 'product-detail' && (
                <div className="settings-section">
                  <h3>Product Detail Page Settings</h3>
                  <p>Customize which elements are shown on product detail pages and their colors</p>

                  {/* Display Options */}
                  <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4>👁️ Display Options</h4>
                    <p>Control which elements are shown on product detail pages</p>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.product_detail_show_thumbnails || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              product_detail_show_thumbnails: e.target.checked
                            }))}
                          />
                          Show Image Thumbnails
                        </label>
                      </div>

                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.product_detail_show_category_badge || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              product_detail_show_category_badge: e.target.checked
                            }))}
                          />
                          Show Category Badge
                        </label>
                      </div>

                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.product_detail_show_featured_badge || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              product_detail_show_featured_badge: e.target.checked
                            }))}
                          />
                          Show Featured Badge
                        </label>
                      </div>

                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.product_detail_show_stock_info || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              product_detail_show_stock_info: e.target.checked
                            }))}
                          />
                          Show Stock Information
                        </label>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.product_detail_show_variations || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              product_detail_show_variations: e.target.checked
                            }))}
                          />
                          Show Product Variations
                        </label>
                      </div>

                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.product_detail_show_description || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              product_detail_show_description: e.target.checked
                            }))}
                          />
                          Show Product Description
                        </label>
                      </div>

                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.product_detail_show_details_section || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              product_detail_show_details_section: e.target.checked
                            }))}
                          />
                          Show Product Details Section
                        </label>
                      </div>

                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.product_detail_show_video || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              product_detail_show_video: e.target.checked
                            }))}
                          />
                          Show Product Video
                        </label>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.product_detail_show_buy_now_button || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              product_detail_show_buy_now_button: e.target.checked
                            }))}
                          />
                          Show Buy Now Button
                        </label>
                      </div>

                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.product_detail_show_continue_shopping_button || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              product_detail_show_continue_shopping_button: e.target.checked
                            }))}
                          />
                          Show Continue Shopping Button
                        </label>
                      </div>

                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.product_detail_show_quantity_selector || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              product_detail_show_quantity_selector: e.target.checked
                            }))}
                          />
                          Show Quantity Selector
                        </label>
                      </div>

                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.product_detail_show_image_lightbox || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              product_detail_show_image_lightbox: e.target.checked
                            }))}
                          />
                          Show Image Lightbox
                        </label>
                      </div>
                    </div>
                  </div>

                  <hr />

                  {/* Button Colors */}
                  <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4>🎨 Button Colors</h4>
                    <p>Customize button colors and text colors</p>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Add to Cart Button Color</label>
                        <input
                          type="color"
                          value={siteSettings.product_detail_add_to_cart_button_color || '#007bff'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_add_to_cart_button_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Add to Cart Button Text Color</label>
                        <input
                          type="color"
                          value={siteSettings.product_detail_add_to_cart_button_text_color || '#ffffff'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_add_to_cart_button_text_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Buy Now Button Color</label>
                        <input
                          type="color"
                          value={siteSettings.product_detail_buy_now_button_color || '#28a745'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_buy_now_button_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Buy Now Button Text Color</label>
                        <input
                          type="color"
                          value={siteSettings.product_detail_buy_now_button_text_color || '#ffffff'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_buy_now_button_text_color: e.target.value
                          }))}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Continue Shopping Button Color</label>
                        <input
                          type="color"
                          value={siteSettings.product_detail_continue_shopping_button_color || '#007bff'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_continue_shopping_button_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Continue Shopping Button Text Color</label>
                        <input
                          type="color"
                          value={siteSettings.product_detail_continue_shopping_button_text_color || '#007bff'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_continue_shopping_button_text_color: e.target.value
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  <hr />

                  {/* Text Colors */}
                  <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4>🖋️ Text Colors</h4>
                    <p>Customize text colors for product information</p>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Product Name Color</label>
                        <input
                          type="color"
                          value={siteSettings.product_detail_product_name_color || '#333333'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_name_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Product Price Color</label>
                        <input
                          type="color"
                          value={siteSettings.product_detail_product_price_color || '#007bff'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_price_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Product Description Color</label>
                        <input
                          type="color"
                          value={siteSettings.product_detail_product_description_color || '#333333'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_description_color: e.target.value
                          }))}
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Product Details Label Color</label>
                        <input
                          type="color"
                          value={siteSettings.product_detail_product_details_label_color || '#666666'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_details_label_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Product Details Value Color</label>
                        <input
                          type="color"
                          value={siteSettings.product_detail_product_details_value_color || '#333333'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_details_value_color: e.target.value
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  <hr />

                  {/* Font Settings */}
                  <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4>🖋️ Font Settings</h4>
                    <p>Customize font family, size, weight, and style for different text elements</p>
                    
                    {/* Product Name Font */}
                    <h5>Product Name</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Font Family</label>
                        <select
                          value={siteSettings.product_detail_product_name_font_family || 'Arial, sans-serif'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_name_font_family: e.target.value
                          }))}
                        >
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="'Times New Roman', serif">Times New Roman</option>
                          <option value="'Courier New', monospace">Courier New</option>
                          <option value="'Georgia', serif">Georgia</option>
                          <option value="'Verdana', sans-serif">Verdana</option>
                          <option value="'Tahoma', sans-serif">Tahoma</option>
                          <option value="'Roboto', sans-serif">Roboto</option>
                          <option value="'Open Sans', sans-serif">Open Sans</option>
                          <option value="'Lato', sans-serif">Lato</option>
                          <option value="'Montserrat', sans-serif">Montserrat</option>
                          <option value="'Poppins', sans-serif">Poppins</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Font Size (px)</label>
                        <input
                          type="number"
                          value={siteSettings.product_detail_product_name_font_size || 28}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_name_font_size: parseInt(e.target.value) || 28
                          }))}
                          min="10"
                          max="100"
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Weight</label>
                        <select
                          value={siteSettings.product_detail_product_name_font_weight || 'bold'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_name_font_weight: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="100">100 (Thin)</option>
                          <option value="300">300 (Light)</option>
                          <option value="400">400 (Regular)</option>
                          <option value="500">500 (Medium)</option>
                          <option value="600">600 (Semi Bold)</option>
                          <option value="700">700 (Bold)</option>
                          <option value="900">900 (Black)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Font Style</label>
                        <select
                          value={siteSettings.product_detail_product_name_font_style || 'normal'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_name_font_style: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="italic">Italic</option>
                          <option value="oblique">Oblique</option>
                        </select>
                      </div>
                    </div>

                    {/* Product Price Font */}
                    <h5>Product Price</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Font Family</label>
                        <select
                          value={siteSettings.product_detail_product_price_font_family || 'Arial, sans-serif'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_price_font_family: e.target.value
                          }))}
                        >
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="'Times New Roman', serif">Times New Roman</option>
                          <option value="'Courier New', monospace">Courier New</option>
                          <option value="'Georgia', serif">Georgia</option>
                          <option value="'Verdana', sans-serif">Verdana</option>
                          <option value="'Tahoma', sans-serif">Tahoma</option>
                          <option value="'Roboto', sans-serif">Roboto</option>
                          <option value="'Open Sans', sans-serif">Open Sans</option>
                          <option value="'Lato', sans-serif">Lato</option>
                          <option value="'Montserrat', sans-serif">Montserrat</option>
                          <option value="'Poppins', sans-serif">Poppins</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Font Size (px)</label>
                        <input
                          type="number"
                          value={siteSettings.product_detail_product_price_font_size || 24}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_price_font_size: parseInt(e.target.value) || 24
                          }))}
                          min="10"
                          max="100"
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Weight</label>
                        <select
                          value={siteSettings.product_detail_product_price_font_weight || 'bold'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_price_font_weight: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="100">100 (Thin)</option>
                          <option value="300">300 (Light)</option>
                          <option value="400">400 (Regular)</option>
                          <option value="500">500 (Medium)</option>
                          <option value="600">600 (Semi Bold)</option>
                          <option value="700">700 (Bold)</option>
                          <option value="900">900 (Black)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Font Style</label>
                        <select
                          value={siteSettings.product_detail_product_price_font_style || 'normal'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_price_font_style: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="italic">Italic</option>
                          <option value="oblique">Oblique</option>
                        </select>
                      </div>
                    </div>

                    {/* Product Description Font */}
                    <h5>Product Description</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Font Family</label>
                        <select
                          value={siteSettings.product_detail_product_description_font_family || 'Arial, sans-serif'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_description_font_family: e.target.value
                          }))}
                        >
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="'Times New Roman', serif">Times New Roman</option>
                          <option value="'Courier New', monospace">Courier New</option>
                          <option value="'Georgia', serif">Georgia</option>
                          <option value="'Verdana', sans-serif">Verdana</option>
                          <option value="'Tahoma', sans-serif">Tahoma</option>
                          <option value="'Roboto', sans-serif">Roboto</option>
                          <option value="'Open Sans', sans-serif">Open Sans</option>
                          <option value="'Lato', sans-serif">Lato</option>
                          <option value="'Montserrat', sans-serif">Montserrat</option>
                          <option value="'Poppins', sans-serif">Poppins</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Font Size (px)</label>
                        <input
                          type="number"
                          value={siteSettings.product_detail_product_description_font_size || 16}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_description_font_size: parseInt(e.target.value) || 16
                          }))}
                          min="10"
                          max="100"
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Weight</label>
                        <select
                          value={siteSettings.product_detail_product_description_font_weight || 'normal'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_description_font_weight: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="100">100 (Thin)</option>
                          <option value="300">300 (Light)</option>
                          <option value="400">400 (Regular)</option>
                          <option value="500">500 (Medium)</option>
                          <option value="600">600 (Semi Bold)</option>
                          <option value="700">700 (Bold)</option>
                          <option value="900">900 (Black)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Font Style</label>
                        <select
                          value={siteSettings.product_detail_product_description_font_style || 'normal'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_description_font_style: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="italic">Italic</option>
                          <option value="oblique">Oblique</option>
                        </select>
                      </div>
                    </div>

                    {/* Product Details Label Font */}
                    <h5>Product Details Labels</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Font Family</label>
                        <select
                          value={siteSettings.product_detail_product_details_label_font_family || 'Arial, sans-serif'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_details_label_font_family: e.target.value
                          }))}
                        >
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="'Times New Roman', serif">Times New Roman</option>
                          <option value="'Courier New', monospace">Courier New</option>
                          <option value="'Georgia', serif">Georgia</option>
                          <option value="'Verdana', sans-serif">Verdana</option>
                          <option value="'Tahoma', sans-serif">Tahoma</option>
                          <option value="'Roboto', sans-serif">Roboto</option>
                          <option value="'Open Sans', sans-serif">Open Sans</option>
                          <option value="'Lato', sans-serif">Lato</option>
                          <option value="'Montserrat', sans-serif">Montserrat</option>
                          <option value="'Poppins', sans-serif">Poppins</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Font Size (px)</label>
                        <input
                          type="number"
                          value={siteSettings.product_detail_product_details_label_font_size || 14}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_details_label_font_size: parseInt(e.target.value) || 14
                          }))}
                          min="10"
                          max="100"
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Weight</label>
                        <select
                          value={siteSettings.product_detail_product_details_label_font_weight || 'bold'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_details_label_font_weight: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="100">100 (Thin)</option>
                          <option value="300">300 (Light)</option>
                          <option value="400">400 (Regular)</option>
                          <option value="500">500 (Medium)</option>
                          <option value="600">600 (Semi Bold)</option>
                          <option value="700">700 (Bold)</option>
                          <option value="900">900 (Black)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Font Style</label>
                        <select
                          value={siteSettings.product_detail_product_details_label_font_style || 'normal'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_details_label_font_style: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="italic">Italic</option>
                          <option value="oblique">Oblique</option>
                        </select>
                      </div>
                    </div>

                    {/* Product Details Value Font */}
                    <h5>Product Details Values</h5>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Font Family</label>
                        <select
                          value={siteSettings.product_detail_product_details_value_font_family || 'Arial, sans-serif'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_details_value_font_family: e.target.value
                          }))}
                        >
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="'Times New Roman', serif">Times New Roman</option>
                          <option value="'Courier New', monospace">Courier New</option>
                          <option value="'Georgia', serif">Georgia</option>
                          <option value="'Verdana', sans-serif">Verdana</option>
                          <option value="'Tahoma', sans-serif">Tahoma</option>
                          <option value="'Roboto', sans-serif">Roboto</option>
                          <option value="'Open Sans', sans-serif">Open Sans</option>
                          <option value="'Lato', sans-serif">Lato</option>
                          <option value="'Montserrat', sans-serif">Montserrat</option>
                          <option value="'Poppins', sans-serif">Poppins</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Font Size (px)</label>
                        <input
                          type="number"
                          value={siteSettings.product_detail_product_details_value_font_size || 14}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_details_value_font_size: parseInt(e.target.value) || 14
                          }))}
                          min="10"
                          max="100"
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Weight</label>
                        <select
                          value={siteSettings.product_detail_product_details_value_font_weight || 'normal'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_details_value_font_weight: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="100">100 (Thin)</option>
                          <option value="300">300 (Light)</option>
                          <option value="400">400 (Regular)</option>
                          <option value="500">500 (Medium)</option>
                          <option value="600">600 (Semi Bold)</option>
                          <option value="700">700 (Bold)</option>
                          <option value="900">900 (Black)</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Font Style</label>
                        <select
                          value={siteSettings.product_detail_product_details_value_font_style || 'normal'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            product_detail_product_details_value_font_style: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="italic">Italic</option>
                          <option value="oblique">Oblique</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* HOME SETTINGS TABS */}
              
              {/* Homepage Products Tab */}
              {settingsTab === 'homepage-products' && (
                <div className="settings-section">
                  <h3>Homepage Products Settings</h3>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.homepage_products_show_section || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_show_section: e.target.checked
                        }))}
                      />
                      Show homepage products section
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Section Title</label>
                    <input
                      type="text"
                      value={siteSettings.homepage_products_title || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        homepage_products_title: e.target.value
                      }))}
                      placeholder="Featured Products"
                    />
                  </div>

                  <div className="form-group">
                    <label>Section Subtitle</label>
                    <input
                      type="text"
                      value={siteSettings.homepage_products_subtitle || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        homepage_products_subtitle: e.target.value
                      }))}
                      placeholder="Discover our most popular items"
                    />
                  </div>

                  <hr />

                  {/* Layout Settings */}
                  <h4>Layout Settings</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Maximum Rows</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={siteSettings.homepage_products_max_rows || 2}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_max_rows: parseInt(e.target.value) || 2
                        }))}
                      />
                      <small>Number of rows to display (1-5)</small>
                    </div>

                    <div className="form-group">
                      <label>Products Per Row</label>
                      <input
                        type="number"
                        min="2"
                        max="6"
                        value={siteSettings.homepage_products_per_row || 4}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_per_row: parseInt(e.target.value) || 4
                        }))}
                      />
                      <small>Number of products per row (2-6)</small>
                    </div>

                    <div className="form-group">
                      <label>Maximum Items</label>
                      <input
                        type="number"
                        min="4"
                        max="30"
                        value={siteSettings.homepage_products_max_items || 8}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_max_items: parseInt(e.target.value) || 8
                        }))}
                      />
                      <small>Total number of products to show (4-30)</small>
                    </div>
                  </div>

                  <hr />

                  {/* Image Settings */}
                  <h4>Image Settings</h4>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.homepage_products_show_images || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_show_images: e.target.checked
                        }))}
                      />
                      Show product images
                    </label>
                  </div>

                  {/* Button Settings */}
                  <h4>Button Settings</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_favorite || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_favorite: e.target.checked
                          }))}
                        />
                        Show favorite button
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_buy_now || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_buy_now: e.target.checked
                          }))}
                        />
                        Show buy now button
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_details || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_details: e.target.checked
                          }))}
                        />
                        Show details button
                      </label>
                    </div>
                  </div>

                  <hr />

                  {/* Information Display */}
                  <h4>Information Display</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_price || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_price: e.target.checked
                          }))}
                        />
                        Show price
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_original_price || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_original_price: e.target.checked
                          }))}
                        />
                        Show original price (if discounted)
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_stock || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_stock: e.target.checked
                          }))}
                        />
                        Show stock status
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_category || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_category: e.target.checked
                          }))}
                        />
                        Show category
                      </label>
                    </div>
                  </div>

                  <hr />

                  {/* Sorting and Filtering */}
                  <h4>Sorting and Filtering</h4>
                  
                  <div className="form-group">
                    <label>Sort Products By</label>
                    <select
                      value={siteSettings.homepage_products_sort_by || 'featured'}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        homepage_products_sort_by: e.target.value
                      }))}
                    >
                      <option value="featured">Featured Products</option>
                      <option value="newest">Newest First</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                  </div>

                  <hr />

                  {/* View All Button */}
                  <h4>View All Button</h4>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.homepage_products_show_view_all || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_show_view_all: e.target.checked
                        }))}
                      />
                      Show "View All Products" button
                    </label>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Button Text</label>
                      <input
                        type="text"
                        value={siteSettings.homepage_products_view_all_text || ''}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_view_all_text: e.target.value
                        }))}
                        placeholder="View All Products"
                      />
                    </div>

                    <div className="form-group">
                      <label>Button Link</label>
                      <input
                        type="text"
                        value={siteSettings.homepage_products_view_all_link || ''}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products_view_all_link: e.target.value
                        }))}
                        placeholder="/products"
                      />
                    </div>
                  </div>

                  <hr />

                  {/* Card Style Settings */}
                  <h4>Card Style Settings</h4>
                  
                  <div className="form-group">
                    <label>Card Style</label>
                    <select
                      value={siteSettings.homepage_products_card_style || 'modern'}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        homepage_products_card_style: e.target.value
                      }))}
                    >
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_card_shadow || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_card_shadow: e.target.checked
                          }))}
                        />
                        Show card shadow
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_card_hover_effect || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_card_hover_effect: e.target.checked
                          }))}
                        />
                        Show hover effects
                      </label>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_badges || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_badges: e.target.checked
                          }))}
                        />
                        Show badges (Featured, New, etc.)
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_rating || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_rating: e.target.checked
                          }))}
                        />
                        Show ratings
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_show_quick_view || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_show_quick_view: e.target.checked
                          }))}
                        />
                        Show quick view button
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products_enable_image_preview || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_enable_image_preview: e.target.checked
                          }))}
                        />
                        Enable image preview modal
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Homepage Products 2 Tab */}
              {settingsTab === 'homepage-products2' && (
                <div className="settings-section">
                  <h3>Homepage Products 2 Settings</h3>
                  <p>Configure the second products section on your homepage</p>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.homepage_products2_show_section || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_show_section: e.target.checked
                        }))}
                      />
                      Show homepage products 2 section
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Section Title</label>
                    <input
                      type="text"
                      value={siteSettings.homepage_products2_title || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        homepage_products2_title: e.target.value
                      }))}
                      placeholder="Latest Products"
                    />
                  </div>

                  <div className="form-group">
                    <label>Section Subtitle</label>
                    <input
                      type="text"
                      value={siteSettings.homepage_products2_subtitle || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        homepage_products2_subtitle: e.target.value
                      }))}
                      placeholder="Check out our newest arrivals"
                    />
                  </div>

                  <hr />

                  {/* Layout Settings */}
                  <h4>Layout Settings</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>Maximum Rows</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={siteSettings.homepage_products2_max_rows || 2}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_max_rows: parseInt(e.target.value) || 2
                        }))}
                      />
                      <small>Number of rows to display (1-5)</small>
                    </div>

                    <div className="form-group">
                      <label>Products Per Row</label>
                      <input
                        type="number"
                        min="2"
                        max="6"
                        value={siteSettings.homepage_products2_per_row || 4}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_per_row: parseInt(e.target.value) || 4
                        }))}
                      />
                      <small>Number of products per row (2-6)</small>
                    </div>

                    <div className="form-group">
                      <label>Maximum Items</label>
                      <input
                        type="number"
                        min="4"
                        max="30"
                        value={siteSettings.homepage_products2_max_items || 8}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_max_items: parseInt(e.target.value) || 8
                        }))}
                      />
                      <small>Total number of products to show (4-30)</small>
                    </div>
                  </div>

                  <hr />

                  {/* Image Settings */}
                  <h4>Image Settings</h4>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.homepage_products2_show_images || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_show_images: e.target.checked
                        }))}
                      />
                      Show product images
                    </label>
                  </div>

                  {/* Button Settings */}
                  <h4>Button Settings</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_favorite || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_favorite: e.target.checked
                          }))}
                        />
                        Show favorite button
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_buy_now || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_buy_now: e.target.checked
                          }))}
                        />
                        Show buy now button
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_details || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_details: e.target.checked
                          }))}
                        />
                        Show details button
                      </label>
                    </div>
                  </div>

                  <hr />

                  {/* Information Display */}
                  <h4>Information Display</h4>
                  
                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_price || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_price: e.target.checked
                          }))}
                        />
                        Show price
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_original_price || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_original_price: e.target.checked
                          }))}
                        />
                        Show original price
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_stock || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_stock: e.target.checked
                          }))}
                        />
                        Show stock status
                      </label>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.homepage_products2_show_category || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_show_category: e.target.checked
                        }))}
                      />
                      Show category name
                    </label>
                  </div>

                  <hr />

                  {/* Sorting and Filtering */}
                  <h4>Sorting and Filtering</h4>
                  
                  <div className="form-group">
                    <label>Sort Products By</label>
                    <select
                      value={siteSettings.homepage_products2_sort_by || 'newest'}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        homepage_products2_sort_by: e.target.value
                      }))}
                    >
                      <option value="featured">Featured Products</option>
                      <option value="newest">Newest First</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="name">Name: A to Z</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Filter by Categories</label>
                    <div className="categories-selection">
                      <small>Categories filter will be available when categories are loaded</small>
                    </div>
                    <small>Leave empty to show all categories</small>
                  </div>

                  <hr />

                  {/* View All Button */}
                  <h4>View All Button</h4>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.homepage_products2_show_view_all || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_show_view_all: e.target.checked
                        }))}
                      />
                      Show "View All Products" button
                    </label>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Button Text</label>
                      <input
                        type="text"
                        value={siteSettings.homepage_products2_view_all_text || ''}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_view_all_text: e.target.value
                        }))}
                        placeholder="View All Products"
                      />
                    </div>

                    <div className="form-group">
                      <label>Button Link</label>
                      <input
                        type="text"
                        value={siteSettings.homepage_products2_view_all_link || ''}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          homepage_products2_view_all_link: e.target.value
                        }))}
                        placeholder="/products"
                      />
                    </div>
                  </div>

                  <hr />

                  {/* Card Style Settings */}
                  <h4>Card Style Settings</h4>
                  
                  <div className="form-group">
                    <label>Card Style</label>
                    <select
                      value={siteSettings.homepage_products2_card_style || 'modern'}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        homepage_products2_card_style: e.target.value
                      }))}
                    >
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="minimal">Minimal</option>
                    </select>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_card_shadow || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_card_shadow: e.target.checked
                          }))}
                        />
                        Show card shadow
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_card_hover_effect || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_card_hover_effect: e.target.checked
                          }))}
                        />
                        Show hover effects
                      </label>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_badges || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_badges: e.target.checked
                          }))}
                        />
                        Show badges (Featured, New, etc.)
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_rating || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_rating: e.target.checked
                          }))}
                        />
                        Show ratings
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_show_quick_view || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_show_quick_view: e.target.checked
                          }))}
                        />
                        Show quick view button
                      </label>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.homepage_products2_enable_image_preview || false}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_enable_image_preview: e.target.checked
                          }))}
                        />
                        Enable image preview modal
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Homepage Products Styling Tab */}
              {settingsTab === 'homepage-products-styling' && (
                <div className="settings-section">
                  <h3>Homepage Products Style Settings</h3>
                  <p>Customize the appearance of product cards on the Homepage</p>
                  <div style={{ backgroundColor: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4>🏠 Homepage Products Section 1</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Product Name Color</label>
                        <input
                          type="color"
                          value={siteSettings.homepage_products_product_name_color || '#333333'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_product_name_color: e.target.value
                          }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Product Name Font Size (px)</label>
                        <input
                          type="number"
                          value={siteSettings.homepage_products_product_name_font_size || 18}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_product_name_font_size: parseInt(e.target.value) || 18
                          }))}
                          min="10"
                          max="50"
                        />
                      </div>
                      <div className="form-group">
                        <label>Product Price Color</label>
                        <input
                          type="color"
                          value={siteSettings.homepage_products_product_price_color || '#007bff'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products_product_price_color: e.target.value
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4>🏠 Homepage Products Section 2</h4>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Product Name Color</label>
                        <input
                          type="color"
                          value={siteSettings.homepage_products2_product_name_color || '#333333'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_product_name_color: e.target.value
                          }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Product Name Font Size (px)</label>
                        <input
                          type="number"
                          value={siteSettings.homepage_products2_product_name_font_size || 18}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_product_name_font_size: parseInt(e.target.value) || 18
                          }))}
                          min="10"
                          max="50"
                        />
                      </div>
                      <div className="form-group">
                        <label>Product Price Color</label>
                        <input
                          type="color"
                          value={siteSettings.homepage_products2_product_price_color || '#007bff'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            homepage_products2_product_price_color: e.target.value
                          }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
            </form>
          </div>
        </div>
      </div>

      {/* Add CSS for theme update loading indicator */}
      <style jsx="true">{`
        .theme-update-alert {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          min-width: 300px;
          animation: slideIn 0.3s ease-out;
        }

        .alert {
          padding: 12px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .alert-info {
          background-color: #e3f2fd;
          border: 1px solid #90caf9;
          color: #1565c0;
        }

        .loading-spinner-inline {
          width: 18px;
          height: 18px;
          border: 2px solid #90caf9;
          border-top: 2px solid #1565c0;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default SiteSettings2;

// Add the same styles as MenuSettings for consistent layout
const styles = `
  .menu-settings-container {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .menu-settings-header {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e9ecef;
  }

  .menu-settings-header h2 {
    margin: 0 0 0.5rem 0;
    color: #2c3e50;
    font-size: 2rem;
    font-weight: 600;
  }

  .menu-settings-header p {
    margin: 0;
    color: #6c757d;
    font-size: 1.1rem;
  }

  .settings-navigation {
    margin-bottom: 2rem;
  }

  .nav-section h3 {
    margin: 0 0 1rem 0;
    color: #2c3e50;
    font-size: 1.25rem;
    font-weight: 500;
  }

  .nav-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: center;
  }

  .nav-btn {
    padding: 0.75rem 1.5rem;
    border: 2px solid #dee2e6;
    background: white;
    color: #495057;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.3s ease;
    min-width: 120px;
    text-align: center;
  }

  .nav-btn:hover {
    border-color: #007bff;
    color: #007bff;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(0,123,255,0.1);
  }

  .nav-btn.active {
    background: #007bff;
    border-color: #007bff;
    color: white;
    box-shadow: 0 2px 4px rgba(0,123,255,0.2);
  }

  .settings-content {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    border: 1px solid #e9ecef;
  }

  .settings-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #e9ecef;
    background: #f8f9fa;
    border-radius: 12px 12px 0 0;
  }

  .settings-header h2 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .settings-save-btn {
    padding: 0.75rem 1.5rem;
    background: #28a745;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .settings-save-btn:hover {
    background: #218838;
    transform: translateY(-1px);
    box-shadow: 0 2px 4px rgba(40,167,69,0.2);
  }

  .settings-layout {
    width: 100%;
    display: block;
  }

  .settings-main {
    padding: 0;
    width: 100%;
    max-width: none;
  }

  .site-settings-form {
    background: white;
    border-radius: 0 0 12px 12px;
    padding: 2rem;
    width: 100%;
    box-sizing: border-box;
  }

  .settings-section {
    width: 100%;
    max-width: none;
  }

  .form-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    width: 100%;
  }

  .form-group {
    width: 100%;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    width: 100%;
    box-sizing: border-box;
  }

  @media (max-width: 768px) {
    .menu-settings-container {
      padding: 1rem;
    }
    
    .nav-buttons {
      justify-content: center;
    }
    
    .nav-btn {
      min-width: auto;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }
    
    .settings-header {
      flex-direction: column;
      gap: 1rem;
      text-align: center;
      padding: 1rem;
    }
    
    .settings-main {
      padding: 1rem;
    }
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
} 