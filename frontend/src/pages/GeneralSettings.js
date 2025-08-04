import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';
import { createApiUrl } from '../utils/config';

const GeneralSettings = () => {
  const { user } = useAuth();
  const { currentTheme, isUpdatingSiteSettings, siteSettings: contextSiteSettings, refreshSiteSettings } = useTheme();
  const [settingsTab, setSettingsTab] = useState('homepage');
  const [siteSettings, setSiteSettings] = useState({
    // Homepage General Settings
    homepage_background_color: '#ffffff',
    
    // Google OAuth Settings
    google_oauth_enabled: false,
    google_oauth_client_id: '',
    google_oauth_client_secret: '',
    google_oauth_redirect_uri: 'http://localhost:3000/auth/google/callback',
    google_oauth_scope: 'profile email',
    
    // Site URL Settings
    site_base_url: 'http://localhost:3000',
    site_is_production: false,
    site_ssl_enabled: false,
    
    // Welcome Section
    welcome_title: 'Welcome to Pebdeq',
    welcome_subtitle: 'Crafted. Vintage. Smart.',
    welcome_background_image: null,
    welcome_background_color: '#667eea',
    welcome_text_color: '#ffffff',
    welcome_button_text: 'Explore Products',
    welcome_button_link: '/products',
    welcome_button_color: '#00b894',
    
    // Collections Section
    collections_title: 'Our Collections',
    collections_show_categories: [],
    collections_categories_per_row: 4,
    collections_max_rows: 1,
    collections_show_section: true,
    
    // Footer Settings
    footer_show_section: true,
    footer_background_color: '#2c3e50',
    footer_text_color: '#ffffff',
    footer_company_name: 'PEBDEQ',
    footer_company_description: 'Crafted with passion, delivered with precision.',
    footer_copyright_text: '© 2024 PEBDEQ. All rights reserved.',
    
    // Footer Support Section
    footer_support_title: 'Support',
    footer_support_show_section: true,
    
    // Footer Quick Links Section (JSON Array)
    footer_quick_links_title: 'Quick Links',
    footer_quick_links_show_section: true,
    footer_quick_links: [
      {title: 'About Us', url: '/about', is_external: false},
      {title: 'Products', url: '/products', is_external: false},
      {title: 'Blog', url: '/blog', is_external: false},
      {title: 'Privacy Policy', url: '/privacy', is_external: false}
    ],
    
    // Footer Support Links Section (JSON Array)
    footer_support_links: [
      {title: 'Contact Us', url: '/contact', is_external: false},
      {title: 'FAQ', url: '/faq', is_external: false},
      {title: 'Shipping Info', url: '/shipping', is_external: false},
      {title: 'Returns', url: '/returns', is_external: false}
    ],
    
    // Footer Social Section
    footer_social_title: 'Follow Us',
    footer_social_show_section: true,
    footer_social_instagram: '',
    footer_social_facebook: '',
    footer_social_twitter: '',
    footer_social_youtube: '',
    footer_social_linkedin: '',
    footer_social_pinterest: '',
    footer_social_tiktok: '',
    
    // Footer Newsletter Section
    footer_newsletter_title: 'Newsletter',
    footer_newsletter_show_section: true,
    footer_newsletter_description: 'Subscribe to get updates about new products and offers.',
    footer_newsletter_placeholder: 'Enter your email address',
    footer_newsletter_button_text: 'Subscribe',
    
    // Footer Legal Section
    footer_legal_title: 'Legal',
    footer_legal_show_section: true,
    footer_legal_privacy_policy_content: '',
    footer_legal_terms_of_service_content: '',
    footer_legal_cookie_policy_content: '',
    footer_legal_dmca_notice_content: '',
    footer_legal_shipping_policy_content: '',
    footer_legal_return_policy_content: '',
    footer_legal_accessibility_statement_content: '',
    
    // Footer Logo Settings
    footer_use_logo: false,
    footer_logo: null,
    footer_logo_width: 120,
    footer_logo_height: 40
  });
  const [uploadingWelcomeBackground, setUploadingWelcomeBackground] = useState(false);
  const [uploadingFooterLogo, setUploadingFooterLogo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingSiteLogo, setUploadingSiteLogo] = useState(false);
  const [uploadingSiteLogo2, setUploadingSiteLogo2] = useState(false);
  const fileInputRef = useRef(null);
  const fileInputRef2 = useRef(null);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  // Helper function to generate redirect URI
  const generateRedirectURI = (baseUrl) => {
    if (!baseUrl) return '';
    // Remove trailing slash if exists
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${cleanBaseUrl}/auth/google/callback`;
  };

  // Define fetchSiteSettings for other uses
  const fetchSiteSettings = useCallback(async () => {
    if (!refreshSiteSettings) return;
    try {
      const settings = await refreshSiteSettings();
      if (settings) {
        setSiteSettings(prevSettings => ({
          ...prevSettings,
          ...settings
        }));
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching site settings:', error);
      setLoading(false);
    }
  }, [refreshSiteSettings]);

  // Force refresh settings on component mount (only once)
  useEffect(() => {
    if (refreshSiteSettings) {
      refreshSiteSettings().then(settings => {
        if (settings) {
          setSiteSettings(prevSettings => ({
            ...prevSettings,
            ...settings
          }));
        }
        setLoading(false);
      }).catch(error => {
        console.error('Error loading site settings:', error);
        setLoading(false);
      });
    }
  }, []); // Empty dependency array - only run once on mount

  // Use site settings from theme context
  useEffect(() => {

    
    if (contextSiteSettings) {
      
      setSiteSettings(prevSettings => {
        const newSettings = {
          ...prevSettings,
          ...contextSiteSettings
        };
        return newSettings;
      });
      setLoading(false);
    }
  }, [contextSiteSettings]);

  const handleUpdateSiteSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    

    console.log('Tüm siteSettings:', siteSettings);
    console.log('Google OAuth ayarları:', {
      enabled: siteSettings.google_oauth_enabled,
      client_id: siteSettings.google_oauth_client_id,
      client_secret: siteSettings.google_oauth_client_secret ? '***HIDDEN***' : '',
      redirect_uri: siteSettings.google_oauth_redirect_uri,
      scope: siteSettings.google_oauth_scope
    });

    try {
      const response = await fetch(createApiUrl('api/admin/site-settings'), {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(siteSettings)
      });

      if (response.ok) {
        toast.success('General settings updated successfully');
        console.log('✅ Google OAuth ayarları başarıyla kaydedildi');
        await fetchSiteSettings(); // Refresh from theme context
      } else {
        const error = await response.text();
        console.error('❌ Settings kaydetme hatası:', error);
        toast.error(`Failed to update general settings: ${error}`);
      }
    } catch (error) {
      console.error('❌ Error updating general settings:', error);
      toast.error('Error updating general settings');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (!contextSiteSettings) {
      fetchSiteSettings().catch(error => {
        console.error('Error in initial settings load:', error);
      });
    }
  }, []);

  // Watch for theme changes and reload settings
  useEffect(() => {
    if (currentTheme) {
      // Reload settings when theme changes
      setTimeout(() => {
        fetchSiteSettings().catch(error => {
          console.error('Error reloading settings after theme change:', error);
        });
      }, 500); // Wait for theme sync to complete
    }
  }, [currentTheme]);

  // Also reload when theme updating completes
  useEffect(() => {
    if (!isUpdatingSiteSettings) {
      fetchSiteSettings().catch(error => {
        console.error('Error reloading settings after theme update:', error);
      });
    }
  }, [isUpdatingSiteSettings]);

  const handleWelcomeBackgroundUpload = async (file) => {
    setUploadingWelcomeBackground(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_type', 'welcome_background');
      
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
          welcome_background_image: data.url
        }));
        toast.success('Welcome background uploaded successfully');
      } else {
        const error = await response.text();
        toast.error(`Failed to upload welcome background: ${error}`);
      }
    } catch (error) {
      console.error('Error uploading welcome background:', error);
      toast.error('Error uploading welcome background');
    } finally {
      setUploadingWelcomeBackground(false);
    }
  };

  const handleFooterLogoUpload = async (file) => {
    setUploadingFooterLogo(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_type', 'footer_logo');
      
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
          footer_logo: data.url
        }));
        toast.success('Footer logo uploaded successfully');
      } else {
        const error = await response.text();
        toast.error(`Failed to upload footer logo: ${error}`);
      }
    } catch (error) {
      console.error('Error uploading footer logo:', error);
      toast.error('Error uploading footer logo');
    } finally {
      setUploadingFooterLogo(false);
    }
  };

  useEffect(() => {
    fetchSiteSettings().catch(error => {
      console.error('Error in component mount settings load:', error);
    });
  }, []);

  return (
    <div className="menu-settings-container">
      <div className="menu-settings-header">
        <h2>General Settings</h2>
        <p>Manage General Site Settings</p>
      </div>

      <div className="settings-navigation">
        <div className="nav-section">
          <h3>General Settings</h3>
          <div className="nav-buttons">
            <button 
              className={`nav-btn ${settingsTab === 'homepage' ? 'active' : ''}`}
              onClick={() => setSettingsTab('homepage')}
            >
              🏠 Homepage
            </button>
            <button 
              className={`nav-btn ${settingsTab === 'welcome' ? 'active' : ''}`}
              onClick={() => setSettingsTab('welcome')}
            >
              👋 Welcome
            </button>
            <button 
              className={`nav-btn ${settingsTab === 'collections' ? 'active' : ''}`}
              onClick={() => setSettingsTab('collections')}
            >
              📦 Collections
            </button>
            <button 
              className={`nav-btn ${settingsTab === 'footer' ? 'active' : ''}`}
              onClick={() => setSettingsTab('footer')}
            >
              🦶 Footer
            </button>
            <button 
              className={`nav-btn ${settingsTab === 'google-oauth' ? 'active' : ''}`}
              onClick={() => setSettingsTab('google-oauth')}
            >
              🔑 Google OAuth
            </button>
          </div>
        </div>
      </div>

      <div className="settings-content">
        <div className="settings-header">
          <h2>General Site Settings</h2>
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
              
              {/* Homepage Settings Tab */}
              {settingsTab === 'homepage' && (
                <div className="settings-section">
                  <h3>Homepage Settings</h3>
                  <p>Customize the general appearance of your homepage</p>

                  <div className="form-group">
                    <label>Homepage Background Color</label>
                    <input
                      type="color"
                      value={siteSettings.homepage_background_color || '#ffffff'}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        homepage_background_color: e.target.value
                      }))}
                    />
                    <small>This color will be applied to the main homepage background</small>
                  </div>
                </div>
              )}

              {/* Welcome Section Tab */}
              {settingsTab === 'welcome' && (
                <div className="settings-section">
                  <h3>Welcome Section</h3>
                  <p>Customize the appearance of the welcome section on the home page</p>

                  <div className="form-group">
                    <label>Welcome Title</label>
                    <input
                      type="text"
                      value={siteSettings.welcome_title}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        welcome_title: e.target.value
                      }))}
                      placeholder="Welcome to Pebdeq"
                    />
                  </div>

                  <div className="form-group">
                    <label>Welcome Subtitle</label>
                    <input
                      type="text"
                      value={siteSettings.welcome_subtitle}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        welcome_subtitle: e.target.value
                      }))}
                      placeholder="Crafted. Vintage. Smart."
                    />
                  </div>

                  <div className="form-group">
                    <label>Welcome Background Image</label>
                    <div className="custom-file-input">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleWelcomeBackgroundUpload(file);
                          }
                        }}
                        disabled={uploadingWelcomeBackground}
                      />
                      <div className={`custom-file-button ${siteSettings.welcome_background_image ? 'file-selected' : ''}`}>
                        {uploadingWelcomeBackground ? 'Uploading...' : 
                         siteSettings.welcome_background_image ? 'Background image uploaded' : 
                         'Choose Background Image'}
                      </div>
                    </div>
                    
                    {siteSettings.welcome_background_image && (
                      <div className="background-preview">
                        <img 
                          src={`http://localhost:5005${siteSettings.welcome_background_image}`} 
                          alt="Welcome Background" 
                          style={{ 
                            width: '200px',
                            height: '120px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                          }}
                        />
                        <button
                          type="button"
                          className="btn btn-sm btn-danger"
                          onClick={() => setSiteSettings(prev => ({
                            ...prev,
                            welcome_background_image: null
                          }))}
                        >
                          Remove Background Image
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Background Color</label>
                      <input
                        type="color"
                        value={siteSettings.welcome_background_color}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          welcome_background_color: e.target.value
                        }))}
                      />
                      <small>Color to use if no background image</small>
                    </div>

                    <div className="form-group">
                      <label>Text Color</label>
                      <input
                        type="color"
                        value={siteSettings.welcome_text_color}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          welcome_text_color: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Button Text</label>
                    <input
                      type="text"
                      value={siteSettings.welcome_button_text}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        welcome_button_text: e.target.value
                      }))}
                      placeholder="Explore Products"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Button Link</label>
                      <input
                        type="text"
                        value={siteSettings.welcome_button_link}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          welcome_button_link: e.target.value
                        }))}
                        placeholder="/products"
                      />
                    </div>

                    <div className="form-group">
                      <label>Button Color</label>
                      <input
                        type="color"
                        value={siteSettings.welcome_button_color}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          welcome_button_color: e.target.value
                        }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Collections Section Tab */}
              {settingsTab === 'collections' && (
                <div className="settings-section">
                  <h3>Collections Section</h3>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.collections_show_section}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          collections_show_section: e.target.checked
                        }))}
                      />
                      Show collections section
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Collections Title</label>
                    <input
                      type="text"
                      value={siteSettings.collections_title || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        collections_title: e.target.value
                      }))}
                      placeholder="Our Collections"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Categories Per Row</label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={siteSettings.collections_categories_per_row || 4}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          collections_categories_per_row: parseInt(e.target.value) || 4
                        }))}
                        placeholder="4"
                      />
                      <small>Between 1-6</small>
                    </div>

                    <div className="form-group">
                      <label>Maximum Rows</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={siteSettings.collections_max_rows || 1}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          collections_max_rows: parseInt(e.target.value) || 1
                        }))}
                        placeholder="1"
                      />
                      <small>Between 1-5</small>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Settings Tab */}
              {settingsTab === 'footer' && (
                <div className="settings-section">
                  <h3>Footer Settings</h3>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.footer_show_section || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_show_section: e.target.checked
                        }))}
                      />
                      Show footer section
                    </label>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Footer Background Color</label>
                      <input
                        type="color"
                        value={siteSettings.footer_background_color || '#2c3e50'}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_background_color: e.target.value
                        }))}
                      />
                    </div>

                    <div className="form-group">
                      <label>Footer Text Color</label>
                      <input
                        type="color"
                        value={siteSettings.footer_text_color || '#ffffff'}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_text_color: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Company Name</label>
                    <input
                      type="text"
                      value={siteSettings.footer_company_name || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_company_name: e.target.value
                      }))}
                      placeholder="PEBDEQ"
                    />
                  </div>

                  <div className="form-group">
                    <label>Company Description</label>
                    <textarea
                      value={siteSettings.footer_company_description || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_company_description: e.target.value
                      }))}
                      placeholder="Crafted with passion, delivered with precision."
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Copyright Text</label>
                    <input
                      type="text"
                      value={siteSettings.footer_copyright_text || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_copyright_text: e.target.value
                      }))}
                      placeholder="© 2024 PEBDEQ. All rights reserved."
                    />
                  </div>

                  {/* Footer Logo Settings */}
                  <div className="settings-divider">
                    <h4>Footer Logo Settings</h4>
                  </div>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.footer_use_logo || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_use_logo: e.target.checked
                        }))}
                      />
                      Use footer logo (if unchecked, company name will be shown)
                    </label>
                  </div>

                  {siteSettings.footer_use_logo && (
                    <>
                      <div className="form-group">
                        <label>Footer Logo</label>
                        <div className="custom-file-input">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files[0];
                              if (file) {
                                handleFooterLogoUpload(file);
                              }
                            }}
                            disabled={uploadingFooterLogo}
                          />
                          <div className={`custom-file-button ${siteSettings.footer_logo ? 'file-selected' : ''}`}>
                            {uploadingFooterLogo ? 'Uploading...' : 
                             siteSettings.footer_logo ? 'Footer logo uploaded' : 
                             'Choose Footer Logo'}
                          </div>
                        </div>
                        
                        {siteSettings.footer_logo && (
                          <div className="logo-preview">
                            <img 
                              src={`http://localhost:5005${siteSettings.footer_logo}`} 
                              alt="Footer Logo" 
                              style={{ 
                                width: `${siteSettings.footer_logo_width}px`,
                                height: `${siteSettings.footer_logo_height}px`,
                                objectFit: 'contain' 
                              }}
                            />
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => setSiteSettings(prev => ({
                                ...prev,
                                footer_logo: null
                              }))}
                            >
                              Remove Footer Logo
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Footer Logo Width (pixels)</label>
                          <input
                            type="number"
                            min="20"
                            max="500"
                            value={siteSettings.footer_logo_width || 120}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              footer_logo_width: parseInt(e.target.value) || 120
                            }))}
                            placeholder="120"
                          />
                          <small>Between 20-500 pixels</small>
                        </div>

                        <div className="form-group">
                          <label>Footer Logo Height (pixels)</label>
                          <input
                            type="number"
                            min="20"
                            max="200"
                            value={siteSettings.footer_logo_height || 40}
                            onChange={(e) => setSiteSettings(prev => ({
                              ...prev,
                              footer_logo_height: parseInt(e.target.value) || 40
                            }))}
                            placeholder="40"
                          />
                          <small>Between 20-200 pixels</small>
                        </div>
                      </div>
                    </>
                  )}

                  <hr />

                  {/* Support Section */}
                  <div className="form-group">
                    <h4>Support Section</h4>
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.footer_support_show_section || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_support_show_section: e.target.checked
                        }))}
                      />
                      Show support section
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Support Section Title</label>
                    <input
                      type="text"
                      value={siteSettings.footer_support_title || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_support_title: e.target.value
                      }))}
                      placeholder="Support"
                    />
                  </div>

                  {/* Dynamic Support Links Manager */}
                  <div className="form-group">
                    <label>Support Links</label>
                    <div className="links-manager">
                      {(siteSettings.footer_support_links || []).map((link, index) => (
                        <div key={index} className="link-item" style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 2fr 120px 80px',
                          gap: '10px',
                          marginBottom: '10px',
                          padding: '15px',
                          border: '1px solid #e1e5e9',
                          borderRadius: '8px',
                          backgroundColor: '#f8f9fa',
                          transition: 'all 0.2s ease'
                        }}>
                          <input
                            type="text"
                            value={link.title || ''}
                            onChange={(e) => {
                              const newLinks = [...(siteSettings.footer_support_links || [])];
                              newLinks[index] = { ...newLinks[index], title: e.target.value };
                              setSiteSettings(prev => ({
                                ...prev,
                                footer_support_links: newLinks
                              }));
                            }}
                            placeholder="Link Title"
                          />
                          <input
                            type="text"
                            value={link.url || ''}
                            onChange={(e) => {
                              const newLinks = [...(siteSettings.footer_support_links || [])];
                              newLinks[index] = { ...newLinks[index], url: e.target.value };
                              setSiteSettings(prev => ({
                                ...prev,
                                footer_support_links: newLinks
                              }));
                            }}
                            placeholder="URL (e.g., /contact)"
                          />
                          <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                            <input
                              type="checkbox"
                              checked={link.is_external || false}
                              onChange={(e) => {
                                const newLinks = [...(siteSettings.footer_support_links || [])];
                                newLinks[index] = { ...newLinks[index], is_external: e.target.checked };
                                setSiteSettings(prev => ({
                                  ...prev,
                                  footer_support_links: newLinks
                                }));
                              }}
                            />
                            External
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newLinks = (siteSettings.footer_support_links || []).filter((_, i) => i !== index);
                              setSiteSettings(prev => ({
                                ...prev,
                                footer_support_links: newLinks
                              }));
                            }}
                            style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newLinks = [...(siteSettings.footer_support_links || []), { title: '', url: '', is_external: false }];
                          setSiteSettings(prev => ({
                            ...prev,
                            footer_support_links: newLinks
                          }));
                        }}
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '12px 20px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          transition: 'background-color 0.2s ease',
                          fontSize: '14px'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                      >
                        ➕ Add New Support Link
                      </button>
                    </div>
                  </div>



                  <hr />

                  {/* Quick Links Section */}
                  <div className="form-group">
                    <h4>Quick Links Section</h4>
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.footer_quick_links_show_section || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_quick_links_show_section: e.target.checked
                        }))}
                      />
                      Show quick links section
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Quick Links Section Title</label>
                    <input
                      type="text"
                      value={siteSettings.footer_quick_links_title || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_quick_links_title: e.target.value
                      }))}
                      placeholder="Quick Links"
                    />
                  </div>

                  {/* Dynamic Quick Links Manager */}
                  <div className="form-group">
                    <label>Quick Links</label>
                    <div className="links-manager">
                      {(siteSettings.footer_quick_links || []).map((link, index) => (
                        <div key={index} className="link-item" style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 2fr 120px 80px',
                          gap: '10px',
                          marginBottom: '10px',
                          padding: '15px',
                          border: '1px solid #e1e5e9',
                          borderRadius: '8px',
                          backgroundColor: '#f8f9fa',
                          transition: 'all 0.2s ease'
                        }}>
                          <input
                            type="text"
                            value={link.title || ''}
                            onChange={(e) => {
                              const newLinks = [...(siteSettings.footer_quick_links || [])];
                              newLinks[index] = { ...newLinks[index], title: e.target.value };
                              setSiteSettings(prev => ({
                                ...prev,
                                footer_quick_links: newLinks
                              }));
                            }}
                            placeholder="Link Title"
                          />
                          <input
                            type="text"
                            value={link.url || ''}
                            onChange={(e) => {
                              const newLinks = [...(siteSettings.footer_quick_links || [])];
                              newLinks[index] = { ...newLinks[index], url: e.target.value };
                              setSiteSettings(prev => ({
                                ...prev,
                                footer_quick_links: newLinks
                              }));
                            }}
                            placeholder="URL (e.g., /about)"
                          />
                          <label style={{ display: 'flex', alignItems: 'center', fontSize: '14px' }}>
                            <input
                              type="checkbox"
                              checked={link.is_external || false}
                              onChange={(e) => {
                                const newLinks = [...(siteSettings.footer_quick_links || [])];
                                newLinks[index] = { ...newLinks[index], is_external: e.target.checked };
                                setSiteSettings(prev => ({
                                  ...prev,
                                  footer_quick_links: newLinks
                                }));
                              }}
                            />
                            External
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newLinks = (siteSettings.footer_quick_links || []).filter((_, i) => i !== index);
                              setSiteSettings(prev => ({
                                ...prev,
                                footer_quick_links: newLinks
                              }));
                            }}
                            style={{
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              padding: '5px 10px',
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newLinks = [...(siteSettings.footer_quick_links || []), { title: '', url: '', is_external: false }];
                          setSiteSettings(prev => ({
                            ...prev,
                            footer_quick_links: newLinks
                          }));
                        }}
                        style={{
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          padding: '12px 20px',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontWeight: '500',
                          transition: 'background-color 0.2s ease',
                          fontSize: '14px'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                      >
                        ➕ Add New Link
                      </button>
                    </div>
                  </div>



                  <hr />

                  {/* Social Section */}
                  <div className="form-group">
                    <h4>Social Section</h4>
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.footer_social_show_section || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_social_show_section: e.target.checked
                        }))}
                      />
                      Show social section
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Social Section Title</label>
                    <input
                      type="text"
                      value={siteSettings.footer_social_title || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_social_title: e.target.value
                      }))}
                      placeholder="Follow Us"
                    />
                  </div>

                  <div className="form-group">
                    <label>Instagram URL</label>
                    <input
                      type="url"
                      value={siteSettings.footer_social_instagram || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_social_instagram: e.target.value
                      }))}
                      placeholder="https://instagram.com/yourpage"
                    />
                  </div>

                  <div className="form-group">
                    <label>Facebook URL</label>
                    <input
                      type="url"
                      value={siteSettings.footer_social_facebook || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_social_facebook: e.target.value
                      }))}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>

                  <div className="form-group">
                    <label>Twitter URL</label>
                    <input
                      type="url"
                      value={siteSettings.footer_social_twitter || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_social_twitter: e.target.value
                      }))}
                      placeholder="https://twitter.com/yourpage"
                    />
                  </div>

                  <div className="form-group">
                    <label>YouTube URL</label>
                    <input
                      type="url"
                      value={siteSettings.footer_social_youtube || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_social_youtube: e.target.value
                      }))}
                      placeholder="https://youtube.com/channel/yourpage"
                    />
                  </div>

                  <div className="form-group">
                    <label>LinkedIn URL</label>
                    <input
                      type="url"
                      value={siteSettings.footer_social_linkedin || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_social_linkedin: e.target.value
                      }))}
                      placeholder="https://linkedin.com/company/yourpage"
                    />
                  </div>

                  <div className="form-group">
                    <label>Pinterest URL</label>
                    <input
                      type="url"
                      value={siteSettings.footer_social_pinterest || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_social_pinterest: e.target.value
                      }))}
                      placeholder="https://pinterest.com/yourpage"
                    />
                  </div>

                  <div className="form-group">
                    <label>TikTok URL</label>
                    <input
                      type="url"
                      value={siteSettings.footer_social_tiktok || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_social_tiktok: e.target.value
                      }))}
                      placeholder="https://tiktok.com/@yourpage"
                    />
                  </div>

                  <hr />

                  {/* Newsletter Section */}
                  <div className="form-group">
                    <h4>Newsletter Section</h4>
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.footer_newsletter_show_section || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_newsletter_show_section: e.target.checked
                        }))}
                      />
                      Show newsletter section
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Newsletter Section Title</label>
                    <input
                      type="text"
                      value={siteSettings.footer_newsletter_title || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_newsletter_title: e.target.value
                      }))}
                      placeholder="Newsletter"
                    />
                  </div>

                  <div className="form-group">
                    <label>Newsletter Description</label>
                    <textarea
                      value={siteSettings.footer_newsletter_description || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_newsletter_description: e.target.value
                      }))}
                      placeholder="Subscribe to get updates about new products and offers."
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email Input Placeholder</label>
                    <input
                      type="text"
                      value={siteSettings.footer_newsletter_placeholder || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_newsletter_placeholder: e.target.value
                      }))}
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div className="form-group">
                    <label>Subscribe Button Text</label>
                    <input
                      type="text"
                      value={siteSettings.footer_newsletter_button_text || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_newsletter_button_text: e.target.value
                      }))}
                      placeholder="Subscribe"
                    />
                  </div>

                  <hr />

                  {/* Legal Links Section */}
                  <div className="form-group">
                    <h4>Legal Links Section</h4>
                    <label>
                      <input
                        type="checkbox"
                        checked={siteSettings.footer_legal_show_section || false}
                        onChange={(e) => setSiteSettings(prev => ({
                          ...prev,
                          footer_legal_show_section: e.target.checked
                        }))}
                      />
                      Show legal links section
                    </label>
                  </div>

                  <div className="form-group">
                    <label>Legal Links Section Title</label>
                    <input
                      type="text"
                      value={siteSettings.footer_legal_title || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_legal_title: e.target.value
                      }))}
                      placeholder="Legal"
                    />
                  </div>

                  {/* Privacy Policy */}
                  <div className="form-group">
                    <label>Privacy Policy Content</label>
                    <textarea
                      value={siteSettings.footer_legal_privacy_policy_content || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_legal_privacy_policy_content: e.target.value
                      }))}
                      placeholder="Enter privacy policy content..."
                      rows="8"
                    />
                  </div>

                  {/* Terms of Service */}
                  <div className="form-group">
                    <label>Terms of Service Content</label>
                    <textarea
                      value={siteSettings.footer_legal_terms_of_service_content || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_legal_terms_of_service_content: e.target.value
                      }))}
                      placeholder="Enter terms of service content..."
                      rows="8"
                    />
                  </div>

                  {/* Return Policy */}
                  <div className="form-group">
                    <label>Return Policy Content</label>
                    <textarea
                      value={siteSettings.footer_legal_return_policy_content || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_legal_return_policy_content: e.target.value
                      }))}
                      placeholder="Enter return policy content..."
                      rows="8"
                    />
                  </div>

                  {/* Shipping Policy */}
                  <div className="form-group">
                    <label>Shipping Policy Content</label>
                    <textarea
                      value={siteSettings.footer_legal_shipping_policy_content || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_legal_shipping_policy_content: e.target.value
                      }))}
                      placeholder="Enter shipping policy content..."
                      rows="8"
                    />
                  </div>

                  {/* Cookie Policy */}
                  <div className="form-group">
                    <label>Cookie Policy Content</label>
                    <textarea
                      value={siteSettings.footer_legal_cookie_policy_content || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_legal_cookie_policy_content: e.target.value
                      }))}
                      placeholder="Enter cookie policy content..."
                      rows="8"
                    />
                  </div>

                  {/* DMCA Notice */}
                  <div className="form-group">
                    <label>DMCA Notice Content</label>
                    <textarea
                      value={siteSettings.footer_legal_dmca_notice_content || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_legal_dmca_notice_content: e.target.value
                      }))}
                      placeholder="Enter DMCA notice content..."
                      rows="8"
                    />
                  </div>

                  {/* Accessibility Statement */}
                  <div className="form-group">
                    <label>Accessibility Statement Content</label>
                    <textarea
                      value={siteSettings.footer_legal_accessibility_statement_content || ''}
                      onChange={(e) => setSiteSettings(prev => ({
                        ...prev,
                        footer_legal_accessibility_statement_content: e.target.value
                      }))}
                      placeholder="Enter accessibility statement content..."
                      rows="8"
                    />
                  </div>

                  
                </div>
              )}

              {/* Google OAuth Tab */}
              {settingsTab === 'google-oauth' && (
                <div className="settings-section">
                  <div className="oauth-header">
                    <div className="oauth-header-content">
                      <h3>🔑 Google OAuth Settings</h3>
                      <p>Configure Google OAuth authentication for your website</p>
                    </div>
                    <div className="oauth-status">
                      <span className={`status-indicator ${siteSettings.google_oauth_enabled ? 'enabled' : 'disabled'}`}>
                        {siteSettings.google_oauth_enabled ? '✅ Enabled' : '❌ Disabled'}
                      </span>
                    </div>
                  </div>

                  {/* Site URL Configuration Card */}
                  <div className="oauth-card">
                    <div className="oauth-card-header">
                      <h4>🌐 Site URL Configuration</h4>
                      <p>Configure your site's URL settings for OAuth redirect URIs</p>
                    </div>
                    
                    <div className="form-group">
                      <label>Site Base URL</label>
                      <input
                        type="url"
                        value={siteSettings.site_base_url || ''}
                        onChange={(e) => {
                          const baseUrl = e.target.value;
                          setSiteSettings(prev => ({
                            ...prev,
                            site_base_url: baseUrl,
                            google_oauth_redirect_uri: generateRedirectURI(baseUrl)
                          }));
                        }}
                        placeholder="https://yourdomain.com"
                        className="url-input"
                      />
                      <small>Your website's base URL (e.g., https://yourdomain.com)</small>
                      <small className="tip">💡 Changing this will automatically update the OAuth redirect URI</small>
                      
                      <div className="quick-setup-buttons" style={{ marginTop: '10px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            const baseUrl = 'http://localhost:3000';
                            setSiteSettings(prev => ({
                              ...prev,
                              site_base_url: baseUrl,
                              google_oauth_redirect_uri: generateRedirectURI(baseUrl),
                              site_is_production: false,
                              site_ssl_enabled: false
                            }));
                          }}
                        >
                          🔧 Development Setup
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-success"
                          onClick={() => {
                            const baseUrl = 'https://yourdomain.com';
                            setSiteSettings(prev => ({
                              ...prev,
                              site_base_url: baseUrl,
                              google_oauth_redirect_uri: generateRedirectURI(baseUrl),
                              site_is_production: true,
                              site_ssl_enabled: true
                            }));
                          }}
                        >
                          🚀 Production Setup
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-info"
                          onClick={() => {
                            const currentUrl = window.location.origin;
                            const isHttps = currentUrl.startsWith('https://');
                            const isProduction = !currentUrl.includes('localhost');
                            
                            setSiteSettings(prev => ({
                              ...prev,
                              site_base_url: currentUrl,
                              google_oauth_redirect_uri: generateRedirectURI(currentUrl),
                              site_is_production: isProduction,
                              site_ssl_enabled: isHttps
                            }));
                          }}
                        >
                          🔍 Auto-Detect Current URL
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.site_is_production}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            site_is_production: e.target.checked
                          }))}
                        />
                        Production Environment
                      </label>
                      <small>Enable this for production deployment</small>
                    </div>

                    <div className="form-group">
                      <label>
                        <input
                          type="checkbox"
                          checked={siteSettings.site_ssl_enabled}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            site_ssl_enabled: e.target.checked
                          }))}
                        />
                        SSL/HTTPS Enabled
                      </label>
                      <small>Enable if your site uses HTTPS</small>
                    </div>
                  </div>

                  {/* OAuth Toggle Card */}
                  <div className="oauth-card toggle-card">
                    <div className="oauth-card-header">
                      <h4>⚙️ OAuth Settings</h4>
                      <p>Enable or disable Google OAuth authentication</p>
                    </div>
                    
                    <div className="toggle-container">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={Boolean(siteSettings.google_oauth_enabled)}
                          onChange={(e) => {
                            console.log('🎯 Google OAuth checkbox clicked:', e.target.checked);
                            setSiteSettings(prev => {
                              const newState = {
                                ...prev,
                                google_oauth_enabled: e.target.checked
                              };
                              console.log('🔄 Google OAuth state updated:', newState.google_oauth_enabled);
                              return newState;
                            });
                          }}
                        />
                        <span className="toggle-slider"></span>
                        <span className="toggle-label">Enable Google OAuth Login</span>
                      </label>
                      <small>Allow users to login with their Google accounts</small>
                      <div style={{fontSize: '10px', color: '#666', marginTop: '5px'}}>
                        Debug: checked={String(Boolean(siteSettings.google_oauth_enabled))}, 
                        value={String(siteSettings.google_oauth_enabled)}, 
                        type={typeof siteSettings.google_oauth_enabled}
                      </div>
                    </div>
                  </div>

                  {Boolean(siteSettings.google_oauth_enabled) && (
                    <>
                      {/* Setup Guide Card */}
                      <div className="oauth-card setup-guide">
                        <div className="oauth-card-header">
                          <h4>📋 How to Setup Google OAuth</h4>
                          <p>Follow these steps to configure Google OAuth for your website</p>
                        </div>
                        
                        <div className="setup-steps">
                          <div className="step">
                            <div className="step-number">1</div>
                            <div className="step-content">
                              <p><strong>Go to Google Cloud Console</strong></p>
                              <p><a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="external-link">Open Google Cloud Console ↗</a></p>
                            </div>
                          </div>
                          
                          <div className="step">
                            <div className="step-number">2</div>
                            <div className="step-content">
                              <p><strong>Create or select a project</strong></p>
                              <p>Create a new project or select an existing one</p>
                            </div>
                          </div>
                          
                          <div className="step">
                            <div className="step-number">3</div>
                            <div className="step-content">
                              <p><strong>Enable Google+ API</strong></p>
                              <p>Go to "APIs & Services" → "Library" and enable Google+ API</p>
                            </div>
                          </div>
                          
                          <div className="step">
                            <div className="step-number">4</div>
                            <div className="step-content">
                              <p><strong>Create OAuth 2.0 Client</strong></p>
                              <p>Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"</p>
                            </div>
                          </div>
                          
                          <div className="step">
                            <div className="step-number">5</div>
                            <div className="step-content">
                              <p><strong>Configure application</strong></p>
                              <p>Select "Web Application" as application type</p>
                            </div>
                          </div>
                          
                          <div className="step">
                            <div className="step-number">6</div>
                            <div className="step-content">
                              <p><strong>Add redirect URI</strong></p>
                              <div className="redirect-uri-display">
                                <code>{siteSettings.google_oauth_redirect_uri}</code>
                                <button 
                                  type="button" 
                                  onClick={() => navigator.clipboard.writeText(siteSettings.google_oauth_redirect_uri)}
                                  className="copy-btn"
                                  title="Copy to clipboard"
                                >
                                  📋
                                </button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="step">
                            <div className="step-number">7</div>
                            <div className="step-content">
                              <p><strong>Copy credentials</strong></p>
                              <p>Copy the Client ID and Client Secret to the fields below</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* OAuth Credentials Card */}
                      <div className="oauth-card credentials">
                        <div className="oauth-card-header">
                          <h4>🔐 OAuth Credentials</h4>
                          <p>Enter your Google OAuth credentials from Google Cloud Console</p>
                        </div>
                        
                        <div className="credentials-grid">
                          <div className="form-group">
                            <label>Google OAuth Client ID</label>
                            <input
                              type="text"
                              value={siteSettings.google_oauth_client_id || ''}
                              onChange={(e) => setSiteSettings(prev => ({
                                ...prev,
                                google_oauth_client_id: e.target.value
                              }))}
                              placeholder="Enter your Google OAuth Client ID"
                              className="credential-input"
                            />
                            <small>Your Google OAuth Client ID from Google Cloud Console</small>
                          </div>

                          <div className="form-group">
                            <label>Google OAuth Client Secret</label>
                            <input
                              type="password"
                              value={siteSettings.google_oauth_client_secret || ''}
                              onChange={(e) => setSiteSettings(prev => ({
                                ...prev,
                                google_oauth_client_secret: e.target.value
                              }))}
                              placeholder="Enter your Google OAuth Client Secret"
                              className="credential-input"
                            />
                            <small>Your Google OAuth Client Secret from Google Cloud Console</small>
                          </div>

                          <div className="form-group">
                            <label>Redirect URI</label>
                            <input
                              type="text"
                              value={siteSettings.google_oauth_redirect_uri || ''}
                              onChange={(e) => setSiteSettings(prev => ({
                                ...prev,
                                google_oauth_redirect_uri: e.target.value
                              }))}
                              placeholder={`${siteSettings.site_base_url}/auth/google/callback`}
                              className="credential-input"
                            />
                            <small>This URL must match the authorized redirect URI in your Google Cloud Console</small>
                            <small className="tip">💡 Tip: This is automatically generated from your Site Base URL, but you can modify it if needed</small>
                          </div>
                        </div>
                      </div>

                      <div className="form-group">
                        <label>OAuth Scope</label>
                        <input
                          type="text"
                          value={siteSettings.google_oauth_scope || ''}
                          onChange={(e) => setSiteSettings(prev => ({
                            ...prev,
                            google_oauth_scope: e.target.value
                          }))}
                          placeholder="profile email"
                        />
                        <small>Permissions requested from Google (default: profile email)</small>
                      </div>

                      <div className="alert alert-warning">
                        <h4>⚠️ Important Notes</h4>
                        <ul>
                          <li>Never share your Client Secret publicly</li>
                          <li>For production, use HTTPS URLs only</li>
                          <li>Update redirect URIs when changing domains</li>
                          <li>Test the OAuth flow after saving settings</li>
                          <li>Current Environment: <strong>{siteSettings.site_is_production ? 'Production' : 'Development'}</strong></li>
                          <li>SSL Status: <strong>{siteSettings.site_ssl_enabled ? 'Enabled' : 'Disabled'}</strong></li>
                        </ul>
                        {siteSettings.site_is_production && !siteSettings.site_ssl_enabled && (
                          <div className="alert alert-danger mt-2">
                            <strong>🚨 Security Warning:</strong> You have enabled production mode but SSL is disabled. This is not recommended for production environments.
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                </div>
              )}
              
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;

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