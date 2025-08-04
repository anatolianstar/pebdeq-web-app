import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const MenuSettings = () => {
  const { user } = useAuth();
  const { currentTheme, isUpdatingSiteSettings, siteSettings: contextSiteSettings, refreshSiteSettings } = useTheme();
  const [siteSettings, setSiteSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [settingsTab, setSettingsTab] = useState('navigation');
  const [uploadingSiteLogo, setUploadingSiteLogo] = useState(false);
  const [uploadingSiteLogo2, setUploadingSiteLogo2] = useState(false);
  const fileInputRef = useRef(null);
  const fileInputRef2 = useRef(null);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  // Use site settings from theme context
  useEffect(() => {
    if (contextSiteSettings) {
      console.log('🎨 MenuSettings - Using site settings from theme context:', contextSiteSettings);
      setSiteSettings(contextSiteSettings);
      setLoading(false);
    }
  }, [contextSiteSettings]);

  const fetchSiteSettings = async () => {
    console.log('🔄 MenuSettings - Refreshing site settings through theme context...');
    const settings = await refreshSiteSettings();
    if (settings) {
      setSiteSettings(settings);
    }
    setLoading(false);
  };

  const handleUpdateSiteSettings = async (e) => {
    e.preventDefault();
    
    console.log('🔍 Frontend\'den gönderilen Menu Settings verileri:');
    console.log('Tüm siteSettings:', siteSettings);

    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(siteSettings)
      });

      if (response.ok) {
        toast.success('Menu settings updated successfully');
        fetchSiteSettings();
      } else {
        const error = await response.text();
        toast.error(`Failed to update menu settings: ${error}`);
      }
    } catch (error) {
      console.error('Error updating menu settings:', error);
      toast.error('Error updating menu settings');
    }
  };

  const handleSiteLogoUpload = async (file) => {
    setUploadingSiteLogo(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_type', 'site_logo');
      
      const response = await fetch('/api/admin/upload-site-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setSiteSettings(prev => ({
          ...prev,
          site_logo: data.url
        }));
        toast.success('Site logo uploaded successfully');
      } else {
        const error = await response.text();
        toast.error(`Failed to upload site logo: ${error}`);
      }
    } catch (error) {
      console.error('Error uploading site logo:', error);
      toast.error('Error uploading site logo');
    } finally {
      setUploadingSiteLogo(false);
    }
  };

  const handleSiteLogo2Upload = async (file) => {
    setUploadingSiteLogo2(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_type', 'site_logo2');
      
      const response = await fetch('/api/admin/upload-site-file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setSiteSettings(prev => ({
          ...prev,
          site_logo2: data.url
        }));
        toast.success('Second site logo uploaded successfully');
      } else {
        const error = await response.text();
        toast.error(`Failed to upload second site logo: ${error}`);
      }
    } catch (error) {
      console.error('Error uploading second site logo:', error);
      toast.error('Error uploading second site logo');
    } finally {
      setUploadingSiteLogo2(false);
    }
  };

  // Navigation Links Management Functions
  const updateNavLink = (linkId, field, value) => {
    setSiteSettings(prev => ({
      ...prev,
      navigation_links: (prev.navigation_links && Array.isArray(prev.navigation_links) ? prev.navigation_links : []).map(link => 
        link.id === linkId ? { ...link, [field]: value } : link
      )
    }));
  };

  const moveNavLink = (linkId, direction) => {
    setSiteSettings(prev => {
      const links = [...(prev.navigation_links && Array.isArray(prev.navigation_links) ? prev.navigation_links : [])];
      const currentIndex = links.findIndex(link => link.id === linkId);
      
      if (direction === 'up' && currentIndex > 0) {
        // Swap with previous item
        const temp = links[currentIndex - 1].order;
        links[currentIndex - 1].order = links[currentIndex].order;
        links[currentIndex].order = temp;
      } else if (direction === 'down' && currentIndex < links.length - 1) {
        // Swap with next item
        const temp = links[currentIndex + 1].order;
        links[currentIndex + 1].order = links[currentIndex].order;
        links[currentIndex].order = temp;
      }
      
      return {
        ...prev,
        navigation_links: links
      };
    });
  };

  const addNewNavLink = () => {
    const newId = Date.now(); // Simple ID generation
    const newLink = {
      id: newId,
      title: 'New Link',
      url: '/new-page',
      enabled: true,
      order: (siteSettings.navigation_links && Array.isArray(siteSettings.navigation_links) ? siteSettings.navigation_links.length : 0) + 1,
      is_internal: true,
      show_for: 'all',
      type: 'custom'
    };
    
    setSiteSettings(prev => ({
      ...prev,
      navigation_links: [...(prev.navigation_links && Array.isArray(prev.navigation_links) ? prev.navigation_links : []), newLink]
    }));
  };

  const removeNavLink = (linkId) => {
    setSiteSettings(prev => ({
      ...prev,
      navigation_links: (prev.navigation_links && Array.isArray(prev.navigation_links) ? prev.navigation_links : []).filter(link => link.id !== linkId)
    }));
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
      console.log('🎨 MenuSettings - Theme changed to:', currentTheme);
      // Reload settings when theme changes
      setTimeout(() => {
        fetchSiteSettings();
      }, 500); // Wait for theme sync to complete
    }
  }, [currentTheme]);

  // Also reload when theme updating completes
  useEffect(() => {
    if (!isUpdatingSiteSettings) {
      console.log('🎨 MenuSettings - Theme update completed, reloading settings');
      fetchSiteSettings();
    }
  }, [isUpdatingSiteSettings]);

  return (
    <div className="menu-settings-container">
      <div className="menu-settings-header">
        <h2>Menu Settings</h2>
        <p>Manage your site's navigation and identity</p>
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
              className={`nav-btn ${settingsTab === 'navigation' ? 'active' : ''}`}
              onClick={() => setSettingsTab('navigation')}
            >
              🧭 Navigation
            </button>
            <button 
              className={`nav-btn ${settingsTab === 'identity' ? 'active' : ''}`}
              onClick={() => setSettingsTab('identity')}
            >
              🏢 Site Identity
            </button>
          </div>
        </div>
      </div>

      <div className="settings-content">
        {/* Settings header with save button */}
        <div className="settings-header">
          <h2>Menu & Identity Settings</h2>
          <button 
            type="button" 
            className="btn btn-primary settings-save-btn"
            onClick={(e) => handleUpdateSiteSettings(e)}
          >
            💾 Save Settings
          </button>
        </div>

        <div className="settings-layout">
          {/* Settings content */}
          <div className="settings-main">
            <form onSubmit={handleUpdateSiteSettings} className="site-settings-form">
              
              {/* Navigation Settings Tab */}
              {settingsTab === 'navigation' && (
                <>
                  <h3>Navigation Settings</h3>
                  <p>Manage navigation menu appearance and links</p>

                  {/* Navigation Styling */}
                  <h4>🎨 Navigation Styling</h4>
                  <p>Customize the appearance of navigation menu links</p>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Link Color</label>
                        <input
                          type="color"
                          value={siteSettings.nav_link_color || '#2c3e50'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            nav_link_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Link Hover Color</label>
                        <input
                          type="color"
                          value={siteSettings.nav_link_hover_color || '#007bff'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            nav_link_hover_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Size (pixels)</label>
                        <input
                          type="number"
                          value={siteSettings.nav_link_font_size || 16}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            nav_link_font_size: parseInt(e.target.value) || 16
                          }))}
                          min="12"
                          max="30"
                        />
                      </div>

                      <div className="form-group">
                        <label>Font Weight</label>
                        <select
                          value={siteSettings.nav_link_font_weight || '500'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            nav_link_font_weight: e.target.value
                          }))}
                        >
                          <option value="normal">Normal</option>
                          <option value="500">Medium</option>
                          <option value="600">Semi Bold</option>
                          <option value="700">Bold</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Text Transform</label>
                        <select
                          value={siteSettings.nav_link_text_transform || 'none'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            nav_link_text_transform: e.target.value
                          }))}
                        >
                          <option value="none">None</option>
                          <option value="uppercase">Uppercase</option>
                          <option value="lowercase">Lowercase</option>
                          <option value="capitalize">Capitalize</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Font Family</label>
                        <select
                          value={siteSettings.nav_link_font_family || 'inherit'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            nav_link_font_family: e.target.value
                          }))}
                        >
                          <option value="inherit">Default</option>
                          <option value="Arial, sans-serif">Arial</option>
                          <option value="'Times New Roman', serif">Times New Roman</option>
                          <option value="'Courier New', monospace">Courier New</option>
                          <option value="'Georgia', serif">Georgia</option>
                          <option value="'Verdana', sans-serif">Verdana</option>
                          <option value="'Tahoma', sans-serif">Tahoma</option>
                          <option value="'Comic Sans MS', cursive">Comic Sans MS</option>
                          <option value="'Impact', fantasy">Impact</option>
                          <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                          <option value="'Palatino', serif">Palatino</option>
                          <option value="'Lucida Sans', sans-serif">Lucida Sans</option>
                          <option value="'Roboto', sans-serif">Roboto</option>
                          <option value="'Open Sans', sans-serif">Open Sans</option>
                          <option value="'Lato', sans-serif">Lato</option>
                          <option value="'Montserrat', sans-serif">Montserrat</option>
                          <option value="'Poppins', sans-serif">Poppins</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.nav_link_underline || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              nav_link_underline: e.target.checked
                            }))}
                          />
                          Default Underline
                        </label>
                      </div>

                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.nav_link_text_shadow || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              nav_link_text_shadow: e.target.checked
                            }))}
                          />
                          Text Shadow
                        </label>
                      </div>
                    </div>

                  <hr />

                  {/* Navigation Links Manager */}
                  <h4>📋 Navigation Links Manager</h4>
                  <p>Manage menu items and their order. Use the "Order" field to set the position (1=first, 2=second, etc.)</p>
                  
                  <div className="navigation-links-manager">
                    <div className="nav-links-list">
                      {(siteSettings.navigation_links && Array.isArray(siteSettings.navigation_links) ? siteSettings.navigation_links : [])
                        .sort((a, b) => a.order - b.order)
                        .map((link, index) => (
                        <div key={link.id} className="nav-link-item">
                          <div className="nav-link-order">
                            <div className="form-group">
                              <label>Order</label>
                              <input
                                type="number"
                                value={link.order || 1}
                                onChange={(e) => updateNavLink(link.id, 'order', parseInt(e.target.value) || 1)}
                                min="1"
                                max="50"
                                className="order-input"
                              />
                            </div>
                          </div>
                          
                          <div className="nav-link-content">
                            <div className="nav-link-header">
                              <label>
                                <input
                                  type="checkbox"
                                  checked={link.enabled}
                                  onChange={(e) => updateNavLink(link.id, 'enabled', e.target.checked)}
                                />
                                <span className={`nav-link-title ${link.type}`}>
                                  {link.title}
                                  <small>({link.type === 'auth' ? 'Auth' : 'Page'} • {link.show_for})</small>
                                </span>
                              </label>
                            </div>
                            
                            {link.enabled && (
                              <div className="nav-link-details">
                                <div className="nav-link-compact-row">
                                  <div className="form-group compact-title">
                                    <label>Title</label>
                                    <input
                                      type="text"
                                      value={link.title}
                                      onChange={(e) => updateNavLink(link.id, 'title', e.target.value)}
                                      placeholder="Link title"
                                    />
                                  </div>
                                  
                                  <div className="form-group compact-url">
                                    <label>URL</label>
                                    <input
                                      type="text"
                                      value={link.url}
                                      onChange={(e) => updateNavLink(link.id, 'url', e.target.value)}
                                      placeholder="/page or https://example.com"
                                      disabled={link.type === 'auth' && link.url === 'logout'}
                                    />
                                  </div>
                                  
                                  <div className="form-group compact-show-for">
                                    <label>Show For</label>
                                    <select
                                      value={link.show_for}
                                      onChange={(e) => updateNavLink(link.id, 'show_for', e.target.value)}
                                      disabled={link.type === 'auth'}
                                    >
                                      <option value="all">Everyone</option>
                                      <option value="guest">Guests Only</option>
                                      <option value="user">Logged In Users</option>
                                      <option value="admin">Admin Only</option>
                                    </select>
                                  </div>
                                  
                                  <div className="form-group compact-internal">
                                    <label>
                                      <input
                                        type="checkbox"
                                        checked={link.is_internal}
                                        onChange={(e) => updateNavLink(link.id, 'is_internal', e.target.checked)}
                                      />
                                      Internal Link
                                    </label>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="nav-link-actions">
                            {link.type === 'custom' && (
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => removeNavLink(link.id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="nav-link-add">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={addNewNavLink}
                      >
                        + Add New Link
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Site Identity Tab */}
              {settingsTab === 'identity' && (
                <div className="settings-section">
                  <h3>Site Identity</h3>
                  
                  {/* Header Appearance - Moved to top */}
                  <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                    <h4>🎨 Header Appearance</h4>
                    <p>Header height is automatically calculated based on logo height + padding</p>
                    
                    <div className="form-row">
                      <div className="form-group">
                        <label>Header Background Color</label>
                        <input
                          type="color"
                          value={siteSettings.header_background_color || '#ffffff'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            header_background_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Header Text Color</label>
                        <input
                          type="color"
                          value={siteSettings.header_text_color || '#2c3e50'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            header_text_color: e.target.value
                          }))}
                        />
                      </div>

                      <div className="form-group">
                        <label>Header Padding (pixels)</label>
                        <input
                          type="number"
                          value={siteSettings.header_padding || 15}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            header_padding: parseInt(e.target.value) || 15
                          }))}
                          min="0"
                          max="50"
                        />
                        <small>Top and bottom padding around logo</small>
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.header_sticky || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              header_sticky: e.target.checked
                            }))}
                          />
                          Sticky Header
                        </label>
                      </div>

                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.header_shadow || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              header_shadow: e.target.checked
                            }))}
                          />
                          Header Shadow
                        </label>
                      </div>

                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.header_border_bottom || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              header_border_bottom: e.target.checked
                            }))}
                          />
                          Bottom Border
                        </label>
                      </div>

                      <div className="form-group">
                        <label>Border Color</label>
                        <input
                          type="color"
                          value={siteSettings.header_border_color || '#e9ecef'}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            header_border_color: e.target.value
                          }))}
                          disabled={!siteSettings.header_border_bottom}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Site Name</label>
                    <input
                      type="text"
                      value={siteSettings.site_name || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        site_name: e.target.value
                      }))}
                      placeholder="pebdeq"
                      required
                    />
                    <small>Site name to be displayed in header (lowercase)</small>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.use_logo}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          use_logo: e.target.checked
                        }))}
                      />
                      Use logo (if unchecked, text will be shown)
                    </label>
                  </div>

                  {siteSettings.use_logo && (
                    <>
                      <div className="form-group">
                        <label>Site Logo</label>
                        <div className="custom-file-input">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleSiteLogoUpload(file);
                              }
                            }}
                            disabled={uploadingSiteLogo}
                          />
                          <div className={`custom-file-button ${siteSettings.site_logo ? 'file-selected' : ''}`}>
                            {uploadingSiteLogo ? 'Uploading...' : 
                             siteSettings.site_logo ? 'Logo uploaded' : 
                             'Choose Logo'}
                          </div>
                        </div>
                        
                        {siteSettings.site_logo && (
                          <div className="logo-preview">
                            <img 
                              src={`http://localhost:5005${siteSettings.site_logo}`} 
                              alt="Site Logo" 
                              style={{ 
                                width: `${siteSettings.logo_width}px`,
                                height: `${siteSettings.logo_height}px`,
                                objectFit: 'contain' 
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => setSiteSettings(prev => ({
                                ...prev,
                                site_logo: null
                              }))}
                            >
                              Remove Logo
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Logo Width (pixels)</label>
                          <input
                            type="number"
                            min="20"
                            max="500"
                            value={siteSettings.logo_width}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              logo_width: parseInt(e.target.value) || 120
                            }))}
                            placeholder="120"
                          />
                          <small>Between 20-500 pixels</small>
                        </div>

                        <div className="form-group">
                          <label>Logo Height (pixels)</label>
                          <input
                            type="number"
                            min="20"
                            max="200"
                            value={siteSettings.logo_height}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              logo_height: parseInt(e.target.value) || 40
                            }))}
                            placeholder="40"
                          />
                          <small>Between 20-200 pixels</small>
                        </div>
                      </div>
                      
                      {/* Logo Shadow Settings */}
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.logo_shadow_enabled || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              logo_shadow_enabled: e.target.checked
                            }))}
                          />
                          Enable logo shadow effect
                        </label>
                      </div>

                      {siteSettings.logo_shadow_enabled && (
                        <div className="shadow-settings">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Shadow Color</label>
                              <input
                                type="color"
                                value={siteSettings.logo_shadow_color || '#000000'}
                                onChange={(e) => setSiteSettings(prev => ({
                                  ...prev,
                                  logo_shadow_color: e.target.value
                                }))}
                              />
                            </div>
                            <div className="form-group">
                              <label>Shadow Blur (0-20)</label>
                              <input
                                type="range"
                                min="0"
                                max="20"
                                value={siteSettings.logo_shadow_blur || 5}
                                onChange={(e) => setSiteSettings(prev => ({
                                  ...prev,
                                  logo_shadow_blur: parseInt(e.target.value)
                                }))}
                              />
                              <small>{siteSettings.logo_shadow_blur || 5}px</small>
                            </div>
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label>Horizontal Offset (-10 to 10)</label>
                              <input
                                type="range"
                                min="-10"
                                max="10"
                                value={siteSettings.logo_shadow_offset_x || 2}
                                onChange={(e) => setSiteSettings(prev => ({
                                  ...prev,
                                  logo_shadow_offset_x: parseInt(e.target.value)
                                }))}
                              />
                              <small>{siteSettings.logo_shadow_offset_x || 2}px</small>
                            </div>
                            <div className="form-group">
                              <label>Vertical Offset (-10 to 10)</label>
                              <input
                                type="range"
                                min="-10"
                                max="10"
                                value={siteSettings.logo_shadow_offset_y || 2}
                                onChange={(e) => setSiteSettings(prev => ({
                                  ...prev,
                                  logo_shadow_offset_y: parseInt(e.target.value)
                                }))}
                              />
                              <small>{siteSettings.logo_shadow_offset_y || 2}px</small>
                            </div>
                          </div>
                          
                          <div className="form-group">
                            <label>Shadow Opacity (0.0-1.0)</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={siteSettings.logo_shadow_opacity || 0.3}
                              onChange={(e) => setSiteSettings(prev => ({
                                ...prev,
                                logo_shadow_opacity: parseFloat(e.target.value)
                              }))}
                            />
                            <small>{siteSettings.logo_shadow_opacity || 0.3}</small>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.use_logo2}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          use_logo2: e.target.checked
                        }))}
                      />
                      Use second logo
                    </label>
                  </div>

                  {siteSettings.use_logo2 && (
                    <>
                      <div className="form-group">
                        <label>Second Logo</label>
                        <div className="custom-file-input">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleSiteLogo2Upload(file);
                              }
                            }}
                            disabled={uploadingSiteLogo2}
                          />
                          <div className={`custom-file-button ${siteSettings.site_logo2 ? 'file-selected' : ''}`}>
                            {uploadingSiteLogo2 ? 'Uploading...' : 
                             siteSettings.site_logo2 ? 'Second logo uploaded' : 
                             'Choose Second Logo'}
                          </div>
                        </div>
                        
                        {siteSettings.site_logo2 && (
                          <div className="logo-preview">
                            <img 
                              src={`http://localhost:5005${siteSettings.site_logo2}`} 
                              alt="Second Site Logo" 
                              style={{ 
                                width: `${siteSettings.logo2_width}px`,
                                height: `${siteSettings.logo2_height}px`,
                                objectFit: 'contain' 
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => setSiteSettings(prev => ({
                                ...prev,
                                site_logo2: null
                              }))}
                            >
                              Remove Second Logo
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Second Logo Width (pixels)</label>
                          <input
                            type="number"
                            min="20"
                            max="500"
                            value={siteSettings.logo2_width}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              logo2_width: parseInt(e.target.value) || 120
                            }))}
                            placeholder="120"
                          />
                          <small>Between 20-500 pixels</small>
                        </div>

                        <div className="form-group">
                          <label>Second Logo Height (pixels)</label>
                          <input
                            type="number"
                            min="20"
                            max="200"
                            value={siteSettings.logo2_height}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              logo2_height: parseInt(e.target.value) || 40
                            }))}
                            placeholder="40"
                          />
                          <small>Between 20-200 pixels</small>
                        </div>
                      </div>
                      
                      {/* Second Logo Shadow Settings */}
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={siteSettings.logo2_shadow_enabled || false}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              logo2_shadow_enabled: e.target.checked
                            }))}
                          />
                          Enable second logo shadow effect
                        </label>
                      </div>

                      {siteSettings.logo2_shadow_enabled && (
                        <div className="shadow-settings">
                          <div className="form-row">
                            <div className="form-group">
                              <label>Shadow Color</label>
                              <input
                                type="color"
                                value={siteSettings.logo2_shadow_color || '#000000'}
                                onChange={(e) => setSiteSettings(prev => ({
                                  ...prev,
                                  logo2_shadow_color: e.target.value
                                }))}
                              />
                            </div>
                            <div className="form-group">
                              <label>Shadow Blur (0-20)</label>
                              <input
                                type="range"
                                min="0"
                                max="20"
                                value={siteSettings.logo2_shadow_blur || 5}
                                onChange={(e) => setSiteSettings(prev => ({
                                  ...prev,
                                  logo2_shadow_blur: parseInt(e.target.value)
                                }))}
                              />
                              <small>{siteSettings.logo2_shadow_blur || 5}px</small>
                            </div>
                          </div>
                          
                          <div className="form-row">
                            <div className="form-group">
                              <label>Horizontal Offset (-10 to 10)</label>
                              <input
                                type="range"
                                min="-10"
                                max="10"
                                value={siteSettings.logo2_shadow_offset_x || 2}
                                onChange={(e) => setSiteSettings(prev => ({
                                  ...prev,
                                  logo2_shadow_offset_x: parseInt(e.target.value)
                                }))}
                              />
                              <small>{siteSettings.logo2_shadow_offset_x || 2}px</small>
                            </div>
                            <div className="form-group">
                              <label>Vertical Offset (-10 to 10)</label>
                              <input
                                type="range"
                                min="-10"
                                max="10"
                                value={siteSettings.logo2_shadow_offset_y || 2}
                                onChange={(e) => setSiteSettings(prev => ({
                                  ...prev,
                                  logo2_shadow_offset_y: parseInt(e.target.value)
                                }))}
                              />
                              <small>{siteSettings.logo2_shadow_offset_y || 2}px</small>
                            </div>
                          </div>
                          
                          <div className="form-group">
                            <label>Shadow Opacity (0.0-1.0)</label>
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.1"
                              value={siteSettings.logo2_shadow_opacity || 0.3}
                              onChange={(e) => setSiteSettings(prev => ({
                                ...prev,
                                logo2_shadow_opacity: parseFloat(e.target.value)
                              }))}
                            />
                            <small>{siteSettings.logo2_shadow_opacity || 0.3}</small>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Marquee Settings */}
                  <div className="settings-divider">
                    <h4>Header Marquee Settings</h4>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.marquee_enabled}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          marquee_enabled: e.target.checked
                        }))}
                      />
                      Enable header marquee
                    </label>
                  </div>

                  {siteSettings.marquee_enabled && (
                    <>
                      <div className="form-group">
                        <label>Marquee Text</label>
                        <textarea
                          value={siteSettings.marquee_text}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            marquee_text: e.target.value
                          }))}
                          placeholder="Enter marquee text..."
                          rows="3"
                          required
                        />
                        <small>Text to display in the scrolling marquee</small>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Font Family</label>
                          <select
                            value={siteSettings.marquee_font_family}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              marquee_font_family: e.target.value
                            }))}
                          >
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="Helvetica, sans-serif">Helvetica</option>
                            <option value="Times New Roman, serif">Times New Roman</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="Verdana, sans-serif">Verdana</option>
                            <option value="Courier New, monospace">Courier New</option>
                            <option value="Impact, sans-serif">Impact</option>
                            <option value="Comic Sans MS, cursive">Comic Sans MS</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Font Size</label>
                          <input
                            type="text"
                            value={siteSettings.marquee_font_size}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              marquee_font_size: e.target.value
                            }))}
                            placeholder="14px"
                          />
                          <small>e.g., 14px, 1.2em, 16pt</small>
                        </div>

                        <div className="form-group">
                          <label>Font Weight</label>
                          <select
                            value={siteSettings.marquee_font_weight}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              marquee_font_weight: e.target.value
                            }))}
                          >
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                            <option value="lighter">Lighter</option>
                            <option value="100">100</option>
                            <option value="200">200</option>
                            <option value="300">300</option>
                            <option value="400">400</option>
                            <option value="500">500</option>
                            <option value="600">600</option>
                            <option value="700">700</option>
                            <option value="800">800</option>
                            <option value="900">900</option>
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Text Color</label>
                          <input
                            type="color"
                            value={siteSettings.marquee_color}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              marquee_color: e.target.value
                            }))}
                          />
                        </div>

                        <div className="form-group">
                          <label>Background Color</label>
                          <input
                            type="color"
                            value={siteSettings.marquee_background_color}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              marquee_background_color: e.target.value
                            }))}
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Scroll Speed (pixels/second)</label>
                          <input
                            type="number"
                            min="10"
                            max="200"
                            value={siteSettings.marquee_speed}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              marquee_speed: parseInt(e.target.value) || 30
                            }))}
                            placeholder="30"
                          />
                          <small>Between 10-200 pixels per second</small>
                        </div>

                        <div className="form-group">
                          <label>Scroll Direction</label>
                          <select
                            value={siteSettings.marquee_direction}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              marquee_direction: e.target.value
                            }))}
                          >
                            <option value="left">Left to Right</option>
                            <option value="right">Right to Left</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>
                            <input
                              type="checkbox"
                              checked={siteSettings.marquee_pause_on_hover}
                              onChange={(e) => setSiteSettings(prev => ({
                                ...prev,
                                marquee_pause_on_hover: e.target.checked
                              }))}
                            />
                            Pause on hover
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              
            </form>
          </div>
        </div>
      </div>
      <style jsx="true">{`
        .menu-settings-container {
          padding: 2rem;
          min-height: 100vh;
          background: #f8f9fa;
        }

        .menu-settings-header {
          margin-bottom: 2rem;
          text-align: center;
        }

        .menu-settings-header h2 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .menu-settings-header p {
          color: #6c757d;
          margin: 0;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .settings-header h2 {
          color: #2c3e50;
          margin: 0;
        }

        .settings-save-btn {
          padding: 0.75rem 1.5rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .settings-save-btn:hover {
          background: #0056b3;
        }

        .settings-layout {
          display: block;
        }

        .site-settings-form {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .settings-section h3 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          font-size: 1.4rem;
          font-weight: 600;
        }

        .settings-section p {
          color: #6c757d;
          margin-bottom: 2rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #2c3e50;
          word-break: break-word;
        }

        .form-group input,
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

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .form-group small {
          display: block;
          margin-top: 0.25rem;
          color: #6c757d;
          font-size: 0.8rem;
        }

        .nav-link-add .btn {
          padding: 0.75rem 1.5rem;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }

        .nav-link-add .btn:hover {
          background: #0056b3;
        }

        .nav-link-actions .btn {
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover {
          background: #c82333;
        }

        /* Navigation Links Manager Compact Layout */
        .nav-link-item {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 1rem;
          margin-bottom: 1rem;
        }

        .nav-link-order {
          margin-bottom: 0.75rem;
        }

        .nav-link-order .form-group {
          margin-bottom: 0;
        }

        .order-input {
          width: 80px;
        }

        .nav-link-header {
          margin-bottom: 0.75rem;
        }

        .nav-link-title {
          font-weight: 500;
          color: #2c3e50;
        }

        .nav-link-title small {
          color: #6c757d;
          font-weight: normal;
          margin-left: 0.5rem;
        }

        .nav-link-compact-row {
          display: grid;
          grid-template-columns: 2fr 2fr 1.5fr 1fr;
          gap: 1rem;
          align-items: end;
        }

        .compact-title input {
          width: 100%;
        }

        .compact-url input {
          width: 100%;
        }

        .compact-show-for select {
          width: 100%;
          font-size: 0.9rem;
        }

        .compact-internal {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 1.5rem;
        }

        .compact-internal label {
          margin-bottom: 0;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .nav-link-actions {
          margin-top: 0.75rem;
          display: flex;
          justify-content: flex-end;
        }

        /* Responsive for compact layout */
        @media (max-width: 1024px) {
          .nav-link-compact-row {
            grid-template-columns: 1fr 1fr;
            gap: 0.75rem;
          }

          .compact-show-for,
          .compact-internal {
            grid-column: span 2;
            margin-top: 0.5rem;
          }
        }

        @media (max-width: 768px) {
          .nav-link-compact-row {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .compact-title,
          .compact-url,
          .compact-show-for,
          .compact-internal {
            grid-column: span 1;
          }

          .compact-internal {
            justify-content: flex-start;
            margin-top: 0.25rem;
          }
        }

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

        /* Responsive Design */
        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .settings-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
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

export default MenuSettings; 