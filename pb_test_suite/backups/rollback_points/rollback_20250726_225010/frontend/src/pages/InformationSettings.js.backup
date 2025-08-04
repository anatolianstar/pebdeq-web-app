import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

const InformationSettings = () => {
  const { user } = useAuth();
  const { currentTheme, isUpdatingSiteSettings, siteSettings: contextSiteSettings, refreshSiteSettings } = useTheme();
  const [settingsTab, setSettingsTab] = useState('contact');
  const [siteSettings, setSiteSettings] = useState({});
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  // Use site settings from theme context
  useEffect(() => {
    if (contextSiteSettings) {
      console.log('🔍 FRONTEND - Context dan gelen site settings:');
      console.log('about_page_show_mission:', contextSiteSettings.about_page_show_mission);
      console.log('about_page_show_values:', contextSiteSettings.about_page_show_values);
      console.log('about_page_show_team:', contextSiteSettings.about_page_show_team);
      console.log('about_page_show_history:', contextSiteSettings.about_page_show_history);
      console.log('about_page_show_contact:', contextSiteSettings.about_page_show_contact);
      
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



    try {
      const response = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(siteSettings)
      });

      if (response.ok) {
        toast.success('Information settings updated successfully');
        await fetchSiteSettings(); // Refresh from theme context
      } else {
        const error = await response.text();
        toast.error(`Failed to update information settings: ${error}`);
      }
    } catch (error) {
      console.error('Error updating information settings:', error);
      toast.error('Error updating information settings');
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
        <h2>Information Settings</h2>
        <p>Manage Contact, Business, SEO, About Page and Feature Settings</p>
      </div>

      <div className="settings-navigation">
        <div className="nav-section">
          <h3>Information Categories</h3>
          <div className="nav-buttons">
            <button 
              className={`nav-btn ${settingsTab === 'contact' ? 'active' : ''}`}
              onClick={() => setSettingsTab('contact')}
            >
              📞 Contact
            </button>
            <button 
              className={`nav-btn ${settingsTab === 'business' ? 'active' : ''}`}
              onClick={() => setSettingsTab('business')}
            >
              🏢 Business
            </button>
            <button 
              className={`nav-btn ${settingsTab === 'seo' ? 'active' : ''}`}
              onClick={() => setSettingsTab('seo')}
            >
              🔍 SEO
            </button>
            <button 
              className={`nav-btn ${settingsTab === 'about' ? 'active' : ''}`}
              onClick={() => setSettingsTab('about')}
            >
              ℹ️ About Page
            </button>
            <button 
              className={`nav-btn ${settingsTab === 'features' ? 'active' : ''}`}
              onClick={() => setSettingsTab('features')}
            >
              ⚡ Features
            </button>
          </div>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-header">
          <h2>Information Settings</h2>
          <button 
            type="button" 
            className="btn btn-primary settings-save-btn"
            onClick={(e) => handleUpdateSiteSettings(e)}
          >
            💾 Save Settings
          </button>
        </div>

        <div className="settings-layout">
          {/* Sol tarafta settings navigation */}
          <nav className="settings-navigation">
            <div className="settings-categories">
              <h4>Information Settings</h4>
              <button 
                type="button"
                className={`settings-category-btn ${settingsTab === 'contact' ? 'active' : ''}`}
                onClick={() => setSettingsTab('contact')}
              >
                📞 Contact & Social
              </button>
              <button 
                type="button"
                className={`settings-category-btn ${settingsTab === 'about' ? 'active' : ''}`}
                onClick={() => setSettingsTab('about')}
              >
                📄 About Page CMS
              </button>
              <button 
                type="button"
                className={`settings-category-btn ${settingsTab === 'business' ? 'active' : ''}`}
                onClick={() => setSettingsTab('business')}
              >
                💼 Business Settings
              </button>
              <button 
                type="button"
                className={`settings-category-btn ${settingsTab === 'seo' ? 'active' : ''}`}
                onClick={() => setSettingsTab('seo')}
              >
                🔍 SEO Settings
              </button>
              <button 
                type="button"
                className={`settings-category-btn ${settingsTab === 'features' ? 'active' : ''}`}
                onClick={() => setSettingsTab('features')}
              >
                🎛️ Feature Flags
              </button>
            </div>
          </nav>

          {/* Sağ tarafta settings content */}
          <div className="settings-content-area">
            {/* Contact & Social Section */}
            {settingsTab === 'contact' && (
              <div className="settings-section">
                <h3>Contact & Social Settings</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      value={siteSettings.contact_phone || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        contact_phone: e.target.value
                      }))}
                      placeholder="+90 555 123 4567"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      value={siteSettings.contact_email || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        contact_email: e.target.value
                      }))}
                      placeholder="info@pebdeq.com"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Physical Address</label>
                  <textarea
                    value={siteSettings.contact_address || ''}
                    onChange={(e) => setSiteSettings(prev => ({
                      ...prev,
                      contact_address: e.target.value
                    }))}
                    placeholder="Istanbul, Turkey"
                    rows="3"
                  />
                </div>

                <h4>Social Media Links</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Instagram</label>
                    <input
                      type="url"
                      value={siteSettings.social_instagram || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        social_instagram: e.target.value
                      }))}
                      placeholder="https://instagram.com/pebdeq"
                    />
                  </div>
                  <div className="form-group">
                    <label>Facebook</label>
                    <input
                      type="url"
                      value={siteSettings.social_facebook || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        social_facebook: e.target.value
                      }))}
                      placeholder="https://facebook.com/pebdeq"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Twitter</label>
                    <input
                      type="url"
                      value={siteSettings.social_twitter || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        social_twitter: e.target.value
                      }))}
                      placeholder="https://twitter.com/pebdeq"
                    />
                  </div>
                  <div className="form-group">
                    <label>YouTube</label>
                    <input
                      type="url"
                      value={siteSettings.social_youtube || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        social_youtube: e.target.value
                      }))}
                      placeholder="https://youtube.com/pebdeq"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>LinkedIn</label>
                  <input
                    type="url"
                    value={siteSettings.social_linkedin || ''}
                    onChange={(e) => setSiteSettings(prev => ({
                      ...prev,
                      social_linkedin: e.target.value
                    }))}
                    placeholder="https://linkedin.com/company/pebdeq"
                  />
                </div>
              </div>
            )}

            {/* About Page CMS Section */}
            {settingsTab === 'about' && (
              <div className="settings-section">
                <h3>About Page Content Management</h3>
                
                <div className="form-group">
                  <label>Page Title</label>
                  <input
                    type="text"
                    value={siteSettings.about_page_title || ''}
                    onChange={(e) => setSiteSettings(prev => ({
                      ...prev,
                      about_page_title: e.target.value
                    }))}
                    placeholder="About Us"
                  />
                </div>

                <div className="form-group">
                  <label>Page Subtitle</label>
                  <input
                    type="text"
                    value={siteSettings.about_page_subtitle || ''}
                    onChange={(e) => setSiteSettings(prev => ({
                      ...prev,
                      about_page_subtitle: e.target.value
                    }))}
                    placeholder="Learn more about our company and mission"
                  />
                </div>

                <div className="form-group">
                  <label>Main Content</label>
                  <textarea
                    value={siteSettings.about_page_content || ''}
                    onChange={(e) => setSiteSettings(prev => ({
                      ...prev,
                      about_page_content: e.target.value
                    }))}
                    placeholder="Welcome to PEBDEQ, your trusted e-commerce platform."
                    rows="4"
                  />
                  <small>This will be displayed as the main about content</small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Background Color</label>
                    <input
                      type="color"
                      value={siteSettings.about_page_background_color || '#ffffff'}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        about_page_background_color: e.target.value
                      }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Background Image URL</label>
                    <input
                      type="url"
                      value={siteSettings.about_page_background_image || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        about_page_background_image: e.target.value
                      }))}
                      placeholder="https://example.com/background.jpg"
                    />
                  </div>
                </div>

                <h4>Content Sections</h4>
                
                {/* Mission Section */}
                <div className="content-section">
                  <div className="section-header">
                    <h5>Mission Section</h5>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={siteSettings.about_page_show_mission ?? true}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          about_page_show_mission: e.target.checked
                        }))}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  
                  {siteSettings.about_page_show_mission && (
                    <>
                      <div className="form-group">
                        <label>Mission Title</label>
                        <input
                          type="text"
                          value={siteSettings.about_page_mission_title || ''}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            about_page_mission_title: e.target.value
                          }))}
                          placeholder="Our Mission"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Mission Content</label>
                        <textarea
                          value={siteSettings.about_page_mission_content || ''}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            about_page_mission_content: e.target.value
                          }))}
                          placeholder="At PEBDEQ, we specialize in providing high-quality products..."
                          rows="4"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Values Section */}
                <div className="content-section">
                  <div className="section-header">
                    <h5>Values Section</h5>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={siteSettings.about_page_show_values ?? true}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          about_page_show_values: e.target.checked
                        }))}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  
                  {siteSettings.about_page_show_values && (
                    <>
                      <div className="form-group">
                        <label>Values Title</label>
                        <input
                          type="text"
                          value={siteSettings.about_page_values_title || ''}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            about_page_values_title: e.target.value
                          }))}
                          placeholder="Our Values"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Values Content</label>
                        <textarea
                          value={siteSettings.about_page_values_content || ''}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            about_page_values_content: e.target.value
                          }))}
                          placeholder="Quality products and services&#10;Competitive prices&#10;Fast and reliable shipping"
                          rows="4"
                        />
                        <small>Use line breaks to create a list, or start lines with - for bullet points</small>
                      </div>
                    </>
                  )}
                </div>

                {/* Team Section */}
                <div className="content-section">
                  <div className="section-header">
                    <h5>Team Section</h5>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={siteSettings.about_page_show_team ?? true}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          about_page_show_team: e.target.checked
                        }))}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  
                  {siteSettings.about_page_show_team && (
                    <>
                      <div className="form-group">
                        <label>Team Title</label>
                        <input
                          type="text"
                          value={siteSettings.about_page_team_title || ''}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            about_page_team_title: e.target.value
                          }))}
                          placeholder="Our Team"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Team Content</label>
                        <textarea
                          value={siteSettings.about_page_team_content || ''}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            about_page_team_content: e.target.value
                          }))}
                          placeholder="Our dedicated team works hard to provide the best experience..."
                          rows="4"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* History Section */}
                <div className="content-section">
                  <div className="section-header">
                    <h5>History Section</h5>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={siteSettings.about_page_show_history ?? true}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          about_page_show_history: e.target.checked
                        }))}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  
                  {siteSettings.about_page_show_history && (
                    <>
                      <div className="form-group">
                        <label>History Title</label>
                        <input
                          type="text"
                          value={siteSettings.about_page_history_title || ''}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            about_page_history_title: e.target.value
                          }))}
                          placeholder="Our History"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>History Content</label>
                        <textarea
                          value={siteSettings.about_page_history_content || ''}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            about_page_history_content: e.target.value
                          }))}
                          placeholder="Founded with a vision to bring quality products to customers worldwide..."
                          rows="4"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Contact Section */}
                <div className="content-section">
                  <div className="section-header">
                    <h5>Contact Section</h5>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={siteSettings.about_page_show_contact ?? true}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          about_page_show_contact: e.target.checked
                        }))}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                  
                  {siteSettings.about_page_show_contact && (
                    <>
                      <div className="form-group">
                        <label>Contact Title</label>
                        <input
                          type="text"
                          value={siteSettings.about_page_contact_title || ''}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            about_page_contact_title: e.target.value
                          }))}
                          placeholder="Get in Touch"
                        />
                      </div>
                      
                      <div className="form-group">
                        <label>Contact Content</label>
                        <textarea
                          value={siteSettings.about_page_contact_content || ''}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            about_page_contact_content: e.target.value
                          }))}
                          placeholder="Contact us for more information about our products and services..."
                          rows="4"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Business Settings Section */}
            {settingsTab === 'business' && (
              <div className="settings-section">
                <h3>Business Settings</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Currency Symbol</label>
                    <input
                      type="text"
                      value={siteSettings.currency_symbol || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        currency_symbol: e.target.value
                      }))}
                      placeholder="₺"
                      maxLength="5"
                    />
                  </div>
                  <div className="form-group">
                    <label>Currency Code</label>
                    <input
                      type="text"
                      value={siteSettings.currency_code || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        currency_code: e.target.value
                      }))}
                      placeholder="TRY"
                      maxLength="3"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Shipping Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={siteSettings.shipping_cost || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        shipping_cost: parseFloat(e.target.value) || 0
                      }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Free Shipping Threshold</label>
                    <input
                      type="number"
                      step="0.01"
                      value={siteSettings.free_shipping_threshold || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        free_shipping_threshold: parseFloat(e.target.value) || 0
                      }))}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SEO Settings Section */}
            {settingsTab === 'seo' && (
              <div className="settings-section">
                <h3>SEO Settings</h3>
                
                <div className="form-group">
                  <label>Meta Title</label>
                  <input
                    type="text"
                    value={siteSettings.meta_title || ''}
                    onChange={(e) => setSiteSettings(prev => ({
                      ...prev,
                      meta_title: e.target.value
                    }))}
                    placeholder="PEBDEQ - Craft, Vintage, Innovation"
                    maxLength="60"
                  />
                  <small>Maximum 60 characters recommended</small>
                </div>

                <div className="form-group">
                  <label>Meta Description</label>
                  <textarea
                    value={siteSettings.meta_description || ''}
                    onChange={(e) => setSiteSettings(prev => ({
                      ...prev,
                      meta_description: e.target.value
                    }))}
                    placeholder="Discover unique 3D printed items, vintage tools, antique light bulbs, and custom laser engraving services."
                    maxLength="160"
                    rows="3"
                  />
                  <small>Maximum 160 characters recommended</small>
                </div>

                <div className="form-group">
                  <label>Meta Keywords</label>
                  <textarea
                    value={siteSettings.meta_keywords || ''}
                    onChange={(e) => setSiteSettings(prev => ({
                      ...prev,
                      meta_keywords: e.target.value
                    }))}
                    placeholder="3D printing, vintage tools, laser engraving, antique light bulbs, handmade, custom"
                    rows="3"
                  />
                  <small>Separate keywords with commas</small>
                </div>
              </div>
            )}

            {/* Feature Flags Section */}
            {settingsTab === 'features' && (
              <div className="settings-section">
                <h3>Feature Flags</h3>
                
                <div className="feature-toggles">
                  <div className="toggle-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.enable_reviews ?? true}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          enable_reviews: e.target.checked
                        }))}
                      />
                      <span>Enable Product Reviews</span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.enable_wishlist ?? true}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          enable_wishlist: e.target.checked
                        }))}
                      />
                      <span>Enable Wishlist</span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.enable_compare ?? true}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          enable_compare: e.target.checked
                        }))}
                      />
                      <span>Enable Product Comparison</span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.enable_newsletter ?? true}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          enable_newsletter: e.target.checked
                        }))}
                      />
                      <span>Enable Newsletter</span>
                    </label>
                  </div>

                  <div className="toggle-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.maintenance_mode ?? false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          maintenance_mode: e.target.checked
                        }))}
                      />
                      <span>Maintenance Mode</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InformationSettings;

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