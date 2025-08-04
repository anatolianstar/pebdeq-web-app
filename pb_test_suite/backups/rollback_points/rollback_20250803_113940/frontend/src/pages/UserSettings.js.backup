import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const UserSettings = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('preferences');
  
  // Settings state
  const [settings, setSettings] = useState({
    // Account Preferences
    language: 'en',
    currency: 'USD',
    timezone: 'UTC',
    theme: 'light',
    
    // Notification Settings
    emailNotifications: true,
    orderUpdates: true,
    promotionalEmails: false,
    weeklyNewsletter: false,
    smsNotifications: false,
    pushNotifications: true,
    
    // Privacy Settings
    profileVisibility: 'private',
    dataSharing: false,
    analyticsTracking: true,
    cookiesAccepted: true,
    
    // Display Settings
    productsPerPage: 12,
    defaultView: 'grid',
    showPrices: true,
    showStockStatus: true
  });

  useEffect(() => {
    fetchUserSettings();
  }, []);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const fetchUserSettings = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching user settings...');
      
      const response = await fetch('/api/users/settings', {
        headers: getAuthHeaders()
      });
      
      console.log('📡 Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Settings loaded successfully:', data);
        setSettings(data.settings);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch user settings:', response.status, errorText);
        toast.error('Failed to load settings');
      }
      
    } catch (error) {
      console.error('❌ Error fetching user settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (section, key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/users/settings', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          settings: settings
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        toast.success('Settings saved successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save settings');
      }
      
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    // Ask for password confirmation
    const password = prompt('Please enter your password to confirm account deletion:');
    if (!password) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch('/api/users/account', {
        method: 'DELETE',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          password: password
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        toast.success('Account deleted successfully');
        
        // Log out user and redirect to home
        localStorage.removeItem('token');
        window.location.href = '/';
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete account');
      }
      
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete account');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/users/export', {
        headers: getAuthHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Create download link
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const link = document.createElement('a');
        link.href = url;
        link.download = `user-data-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        toast.success('Data exported successfully!');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to export data');
      }
      
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="user-settings fade-in">
        <div className="container">
          <div className="text-center">
            <h2>Please log in to access settings</h2>
            <a href="/login" className="btn btn-primary">Login</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="user-settings fade-in">
      <div className="container">
        {/* User Navigation */}
        <div className="user-navigation">
          <Link to="/user-dashboard" className="nav-link">
            📊 Dashboard
          </Link>
          <Link to="/profile" className="nav-link">
            👤 Profile
          </Link>
          <Link to="/user-settings" className="nav-link active">
            ⚙️ Settings
          </Link>
        </div>

        {/* Settings Header */}
        <div className="settings-header">
          <div className="settings-welcome">
            <h1>Account Settings</h1>
            <p>Manage your account preferences and privacy settings</p>
          </div>
          <div className="settings-actions">
            <button 
              onClick={handleSaveSettings} 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>

        {/* Settings Navigation */}
        <div className="settings-tabs">
          <button
            className={`tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            Preferences
          </button>
          <button
            className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            Notifications
          </button>
          <button
            className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy
          </button>
          <button
            className={`tab-btn ${activeTab === 'display' ? 'active' : ''}`}
            onClick={() => setActiveTab('display')}
          >
            Display
          </button>
          <button
            className={`tab-btn ${activeTab === 'account' ? 'active' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            Account
          </button>
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {activeTab === 'preferences' && (
            <div className="settings-section">
              <h2>Account Preferences</h2>
              <div className="settings-grid">
                <div className="setting-item">
                  <label>Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="tr">Türkçe</option>
                    <option value="fr">Français</option>
                    <option value="es">Español</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('preferences', 'currency', e.target.value)}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="TRY">TRY (₺)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('preferences', 'timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="Europe/Istanbul">Turkey Time</option>
                    <option value="Europe/London">London Time</option>
                    <option value="America/New_York">Eastern Time</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Theme</label>
                  <select
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h2>Notification Settings</h2>
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Email Notifications</label>
                    <p>Receive general email notifications</p>
                  </div>
                  <div className="setting-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Order Updates</label>
                    <p>Get notified about order status changes</p>
                  </div>
                  <div className="setting-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.orderUpdates}
                        onChange={(e) => handleSettingChange('notifications', 'orderUpdates', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Promotional Emails</label>
                    <p>Receive promotional offers and discounts</p>
                  </div>
                  <div className="setting-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.promotionalEmails}
                        onChange={(e) => handleSettingChange('notifications', 'promotionalEmails', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Weekly Newsletter</label>
                    <p>Get weekly updates about new products</p>
                  </div>
                  <div className="setting-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.weeklyNewsletter}
                        onChange={(e) => handleSettingChange('notifications', 'weeklyNewsletter', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>SMS Notifications</label>
                    <p>Receive SMS notifications for important updates</p>
                  </div>
                  <div className="setting-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.smsNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Push Notifications</label>
                    <p>Receive browser push notifications</p>
                  </div>
                  <div className="setting-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="settings-section">
              <h2>Privacy Settings</h2>
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Profile Visibility</label>
                    <p>Control who can see your profile information</p>
                  </div>
                  <div className="setting-control">
                    <select
                      value={settings.profileVisibility}
                      onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                    >
                      <option value="private">Private</option>
                      <option value="friends">Friends Only</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Data Sharing</label>
                    <p>Allow sharing of anonymized data for research</p>
                  </div>
                  <div className="setting-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.dataSharing}
                        onChange={(e) => handleSettingChange('privacy', 'dataSharing', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Analytics Tracking</label>
                    <p>Help improve our service by sharing usage data</p>
                  </div>
                  <div className="setting-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.analyticsTracking}
                        onChange={(e) => handleSettingChange('privacy', 'analyticsTracking', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Cookie Preferences</label>
                    <p>Accept cookies for better experience</p>
                  </div>
                  <div className="setting-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.cookiesAccepted}
                        onChange={(e) => handleSettingChange('privacy', 'cookiesAccepted', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="settings-section">
              <h2>Display Settings</h2>
              <div className="settings-grid">
                <div className="setting-item">
                  <label>Products Per Page</label>
                  <select
                    value={settings.productsPerPage}
                    onChange={(e) => handleSettingChange('display', 'productsPerPage', parseInt(e.target.value))}
                  >
                    <option value={6}>6 products</option>
                    <option value={12}>12 products</option>
                    <option value={24}>24 products</option>
                    <option value={48}>48 products</option>
                  </select>
                </div>
                <div className="setting-item">
                  <label>Default View</label>
                  <select
                    value={settings.defaultView}
                    onChange={(e) => handleSettingChange('display', 'defaultView', e.target.value)}
                  >
                    <option value="grid">Grid View</option>
                    <option value="list">List View</option>
                    <option value="compact">Compact View</option>
                  </select>
                </div>
              </div>
              <div className="settings-list">
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Show Prices</label>
                    <p>Display product prices in listings</p>
                  </div>
                  <div className="setting-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.showPrices}
                        onChange={(e) => handleSettingChange('display', 'showPrices', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Show Stock Status</label>
                    <p>Display stock availability information</p>
                  </div>
                  <div className="setting-control">
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={settings.showStockStatus}
                        onChange={(e) => handleSettingChange('display', 'showStockStatus', e.target.checked)}
                      />
                      <span className="slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="settings-section">
              <h2>Account Actions</h2>
              <div className="account-actions">
                <div className="action-item">
                  <div className="action-info">
                    <h3>Export Data</h3>
                    <p>Download a copy of your account data</p>
                  </div>
                  <button 
                    onClick={handleExportData}
                    className="btn btn-outline"
                    disabled={loading}
                  >
                    Export Data
                  </button>
                </div>
                <div className="action-item">
                  <div className="action-info">
                    <h3>Delete Account</h3>
                    <p>Permanently delete your account and all data</p>
                  </div>
                  <button 
                    onClick={handleDeleteAccount}
                    className="btn btn-danger"
                    disabled={loading}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx="true">{`
        .user-settings {
          padding: 2rem 0;
          min-height: 80vh;
          background: #f8f9fa;
        }

        .user-navigation {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          padding: 1rem;
          background: #ffffff;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .user-navigation .nav-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          text-decoration: none;
          color: #6c757d;
          font-weight: 500;
          border-radius: 6px;
          transition: all 0.3s ease;
          background: transparent;
          border: 1px solid transparent;
        }

        .user-navigation .nav-link:hover {
          color: #007bff;
          background: #e7f1ff;
          border-color: #bde1ff;
          text-decoration: none;
        }

        .user-navigation .nav-link.active {
          color: #007bff;
          background: #f8f9ff;
          border-color: #007bff;
          box-shadow: 0 2px 4px rgba(0, 123, 255, 0.1);
        }

        .user-navigation .nav-link.active:hover {
          color: #0056b3;
          border-color: #0056b3;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .settings-welcome h1 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .settings-welcome p {
          color: #6c757d;
          margin: 0;
        }

        .settings-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 2rem;
          background: white;
          padding: 1rem;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow-x: auto;
        }

        .tab-btn {
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
          color: #6c757d;
        }

        .tab-btn:hover {
          background: #f8f9fa;
          color: #2c3e50;
        }

        .tab-btn.active {
          background: #007bff;
          color: white;
        }

        .settings-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 2rem;
        }

        .settings-section h2 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #e9ecef;
        }

        .settings-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .settings-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          background: #f8f9fa;
        }

        .setting-item label {
          font-weight: 500;
          color: #2c3e50;
          margin-bottom: 0.25rem;
        }

        .setting-info {
          flex: 1;
        }

        .setting-info p {
          margin: 0;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .setting-control {
          margin-left: 1rem;
        }

        .setting-control select {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .settings-grid .setting-item {
          flex-direction: column;
          align-items: flex-start;
        }

        .settings-grid .setting-item select {
          width: 100%;
          margin-top: 0.5rem;
        }

        /* Toggle Switch */
        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: #ccc;
          transition: .4s;
          border-radius: 24px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: #007bff;
        }

        input:checked + .slider:before {
          transform: translateX(26px);
        }

        /* Account Actions */
        .account-actions {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .action-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border: 1px solid #e9ecef;
          border-radius: 8px;
          background: #f8f9fa;
        }

        .action-info h3 {
          color: #2c3e50;
          margin: 0 0 0.5rem 0;
        }

        .action-info p {
          color: #6c757d;
          margin: 0;
          font-size: 0.9rem;
        }

        /* Buttons */
        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #0056b3;
        }

        .btn-outline {
          background: transparent;
          color: #007bff;
          border: 2px solid #007bff;
        }

        .btn-outline:hover:not(:disabled) {
          background: #007bff;
          color: white;
        }

        .btn-danger {
          background: #dc3545;
          color: white;
        }

        .btn-danger:hover:not(:disabled) {
          background: #c82333;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .settings-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .settings-tabs {
            flex-direction: column;
            gap: 0.5rem;
          }

          .tab-btn {
            width: 100%;
            text-align: center;
          }

          .settings-grid {
            grid-template-columns: 1fr;
          }

          .setting-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .setting-control {
            margin-left: 0;
            margin-top: 0.5rem;
          }

          .action-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default UserSettings; 