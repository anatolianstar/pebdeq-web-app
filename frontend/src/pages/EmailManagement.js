import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createApiUrl } from '../utils/config';

const EmailManagement = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [emailQueue, setEmailQueue] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [emailSettings, setEmailSettings] = useState({});
  const [emailAnalytics, setEmailAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Template edit/preview states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', 'preview'
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState({
    name: '',
    subject: '',
    html_content: '',
    text_content: '',
    template_type: 'transactional'
  });

  useEffect(() => {
    if (isAuthenticated && user?.is_admin) {
      fetchEmailData();
    }
  }, [isAuthenticated, user, activeTab]);

  const fetchEmailData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch different data based on active tab
      if (activeTab === 'overview' || activeTab === 'analytics') {
        const analyticsResponse = await fetch(createApiUrl('api/admin/email/analytics'), { headers });
        if (analyticsResponse.ok) {
          const analytics = await analyticsResponse.json();
          setEmailAnalytics(analytics);
        }
      }

      if (activeTab === 'queue') {
        const queueResponse = await fetch(createApiUrl('api/admin/email/queue'), { headers });
        if (queueResponse.ok) {
          const queue = await queueResponse.json();
          setEmailQueue(queue.emails || []);
        }
      }

      if (activeTab === 'templates') {
        const templatesResponse = await fetch(createApiUrl('api/admin/email/templates'), { headers });
        if (templatesResponse.ok) {
          const templates = await templatesResponse.json();
          setEmailTemplates(templates);
        }
      }

      if (activeTab === 'settings') {
        const settingsResponse = await fetch(createApiUrl('api/admin/email/settings'), { headers });
        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          setEmailSettings(settings);
        }
      }

    } catch (err) {
      setError('Failed to fetch email data: ' + err.message);
    }
    setLoading(false);
  };

  const sendTestEmail = async () => {
    try {
      console.log('🔍 Starting test email send...');
      
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No authentication token found. Please login again.');
        return;
      }
      
      if (!user || !user.email) {
        alert('User email not available. Please ensure you are logged in.');
        return;
      }
      
      console.log('🔍 Sending test email to:', user.email);
      
      const response = await fetch(createApiUrl('api/admin/email/test'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_email: user.email,
          subject: 'Test Email from PEBDEQ',
          html_content: '<h1>Test Email</h1><p>This is a test email from PEBDEQ email system.</p>'
        })
      });

      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Success result:', result);
        alert('Test email sent successfully!');
      } else {
        const error = await response.json();
        console.log('❌ Error response:', error);
        alert('Failed to send test email: ' + (error.error || 'Unknown error'));
      }
    } catch (err) {
      console.log('❌ Fetch error:', err);
      alert('Error sending test email: ' + err.message + '\n\nCheck the browser console for more details.');
    }
  };

  const processEmailQueue = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(createApiUrl('api/admin/email/queue/process'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ batch_size: 10 })
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Processed ${result.results.length} emails`);
        fetchEmailData(); // Refresh data
      } else {
        const error = await response.json();
        alert('Failed to process queue: ' + error.error);
      }
    } catch (err) {
      alert('Error processing queue: ' + err.message);
    }
  };

  const updateEmailSettings = async (newSettings) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(createApiUrl('api/admin/email/settings'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newSettings)
      });

      if (response.ok) {
        alert('Email settings updated successfully!');
        fetchEmailData();
      } else {
        const error = await response.json();
        alert('Failed to update settings: ' + error.error);
      }
    } catch (err) {
      alert('Error updating settings: ' + err.message);
    }
  };

  // Template management functions
  const handleEditTemplate = async (template) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(createApiUrl(`api/admin/email/templates/${template.id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const fullTemplate = await response.json();
        setSelectedTemplate(fullTemplate);
        setEditingTemplate({
          name: fullTemplate.name,
          subject: fullTemplate.subject,
          html_content: fullTemplate.html_content || '',
          text_content: fullTemplate.text_content || '',
          template_type: fullTemplate.template_type
        });
        setModalMode('edit');
        setShowTemplateModal(true);
      } else {
        alert('Failed to load template details');
      }
    } catch (err) {
      alert('Error loading template: ' + err.message);
    }
  };

  const handlePreviewTemplate = async (template) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(createApiUrl(`api/admin/email/templates/${template.id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const fullTemplate = await response.json();
        setSelectedTemplate(fullTemplate);
        setModalMode('preview');
        setShowTemplateModal(true);
      } else {
        alert('Failed to load template details');
      }
    } catch (err) {
      alert('Error loading template: ' + err.message);
    }
  };

  const handleNewTemplate = () => {
    setSelectedTemplate(null);
    setEditingTemplate({
      name: '',
      subject: '',
      html_content: '',
      text_content: '',
      template_type: 'transactional'
    });
    setModalMode('edit');
    setShowTemplateModal(true);
  };

  const handleSaveTemplate = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // If selectedTemplate is null, we're creating a new template
      const isCreating = !selectedTemplate;
      const url = isCreating 
        ? createApiUrl('api/admin/email/templates')
        : createApiUrl(`api/admin/email/templates/${selectedTemplate.id}`);
      const method = isCreating ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editingTemplate)
      });

      if (response.ok) {
        alert(isCreating ? 'Template created successfully!' : 'Template updated successfully!');
        setShowTemplateModal(false);
        fetchEmailData();
      } else {
        const error = await response.json();
        alert(`Failed to ${isCreating ? 'create' : 'update'} template: ` + error.error);
      }
    } catch (err) {
      alert(`Error ${selectedTemplate ? 'updating' : 'creating'} template: ` + err.message);
    }
  };

  const handleDeleteTemplate = async (template) => {
    if (template.category !== 'custom') {
      alert('Standard templates cannot be deleted. Clone to create a custom version.');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete the template "${template.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(createApiUrl(`api/admin/email/templates/${template.id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        alert('Template deleted successfully!');
        fetchEmailData();
      } else {
        const error = await response.json();
        alert('Failed to delete template: ' + error.error);
      }
    } catch (err) {
      alert('Error deleting template: ' + err.message);
    }
  };

  const handleCloneTemplate = (template) => {
    setSelectedTemplate(null);
    setEditingTemplate({
      name: `${template.name}_copy`,
      subject: template.subject,
      html_content: template.html_content || '',
      text_content: template.text_content || '',
      template_type: template.template_type
    });
    setModalMode('edit');
    setShowTemplateModal(true);
  };

  if (!isAuthenticated || !user?.is_admin) {
    return <div className="admin-container">Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>📧 Email Management</h1>
        <p>Manage email templates, settings, and monitor email performance</p>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-nav">
        <button
          className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={`nav-btn ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          📤 Email Queue
        </button>
        <button
          className={`nav-btn ${activeTab === 'templates' ? 'active' : ''}`}
          onClick={() => setActiveTab('templates')}
        >
          📝 Templates
        </button>
        <button
          className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
        <button
          className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          📈 Analytics
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Loading email data...</div>
      ) : (
        <div className="admin-content">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2>Email System Overview</h2>
              
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Sent (30 days)</h3>
                  <div className="stat-number">{emailAnalytics.summary?.total_sent || 0}</div>
                </div>
                <div className="stat-card">
                  <h3>Total Opened</h3>
                  <div className="stat-number">{emailAnalytics.summary?.total_opened || 0}</div>
                </div>
                <div className="stat-card">
                  <h3>Open Rate</h3>
                  <div className="stat-number">{emailAnalytics.summary?.open_rate || 0}%</div>
                </div>
                <div className="stat-card">
                  <h3>Click Rate</h3>
                  <div className="stat-number">{emailAnalytics.summary?.click_rate || 0}%</div>
                </div>
              </div>

              <div className="action-buttons">
                <button className="btn btn-primary" onClick={sendTestEmail}>
                  📧 Send Test Email
                </button>
                <button className="btn btn-secondary" onClick={processEmailQueue}>
                  🔄 Process Email Queue
                </button>
              </div>

              <div className="email-types">
                <h3>Email Types Distribution</h3>
                {emailAnalytics.email_types?.map(type => (
                  <div key={type.type} className="type-stat">
                    <span className="type-name">{type.type}</span>
                    <span className="type-count">{type.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Email Queue Tab */}
          {activeTab === 'queue' && (
            <div className="queue-section">
              <div className="section-header">
                <h2>Email Queue</h2>
                <button className="btn btn-primary" onClick={processEmailQueue}>
                  🔄 Process Queue
                </button>
              </div>

              <div className="queue-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Recipient</th>
                      <th>Subject</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emailQueue.map(email => (
                      <tr key={email.id}>
                        <td>{email.id}</td>
                        <td>{email.recipient_email}</td>
                        <td title={email.subject}>
                          {email.subject.length > 30 ? `${email.subject.substring(0, 30)}...` : email.subject}
                        </td>
                        <td>
                          <span className={`badge badge-${email.email_type}`}>
                            {email.email_type}
                          </span>
                        </td>
                        <td>
                          <span className={`status status-${email.status}`}>
                            {email.status}
                          </span>
                        </td>
                        <td>{new Date(email.created_at).toLocaleDateString()}</td>
                        <td>
                          {email.status === 'failed' && (
                            <button className="btn btn-sm btn-warning">Retry</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {emailQueue.length === 0 && (
                  <div className="empty-state">
                    <p>No emails in queue</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Email Templates Tab */}
          {activeTab === 'templates' && (
            <div className="templates-section">
              <div className="section-header">
                <h2>Email Templates</h2>
                <button className="btn btn-primary" onClick={handleNewTemplate}>
                  ➕ New Template
                </button>
              </div>

              <div className="templates-grid">
                {emailTemplates.map(template => (
                  <div key={template.id} className={`template-card ${template.category}`}>
                    <div className="template-header">
                      <h3>{template.name}</h3>
                      <span className={`badge badge-${template.template_type}`}>
                        {template.template_type}
                      </span>
                      <span className={`badge badge-${template.category}`}>
                        {template.category}
                      </span>
                    </div>
                    <p className="template-subject">{template.subject}</p>
                    {template.description && (
                      <p className="template-description">{template.description}</p>
                    )}
                    <div className="template-actions">
                      {template.category === 'custom' ? (
                        <>
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleEditTemplate(template)}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            className="btn btn-sm btn-info"
                            onClick={() => handlePreviewTemplate(template)}
                          >
                            👁️ Preview
                          </button>
                          <button 
                            className="btn btn-sm btn-danger"
                            onClick={() => handleDeleteTemplate(template)}
                          >
                            🗑️ Delete
                          </button>
                        </>
                      ) : (
                        <>
                          <button 
                            className="btn btn-sm btn-info"
                            onClick={() => handlePreviewTemplate(template)}
                          >
                            👁️ Preview
                          </button>
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={() => handleCloneTemplate(template)}
                          >
                            📋 Clone
                          </button>
                          <span className="template-note">Standard template - clone to customize</span>
                        </>
                      )}
                    </div>
                    <div className="template-status">
                      <span className={`status ${template.is_active ? 'active' : 'inactive'}`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="template-source">
                        {template.source === 'static' ? '📁 File' : '🗄️ Database'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {emailTemplates.length === 0 && (
                <div className="empty-state">
                  <p>No email templates found</p>
                  <p>Create your first template to get started</p>
                </div>
              )}
            </div>
          )}

          {/* Email Settings Tab */}
          {activeTab === 'settings' && (
            <div className="settings-section">
              <h2>Email Settings</h2>
              
              <div className="settings-form">
                <div className="form-group">
                  <label>SMTP Server</label>
                  <input
                    type="text"
                    value={emailSettings.smtp_server || ''}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings,
                      smtp_server: e.target.value
                    })}
                    placeholder="smtp.gmail.com"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>SMTP Port</label>
                    <input
                      type="number"
                      value={emailSettings.smtp_port || 587}
                      onChange={(e) => setEmailSettings({
                        ...emailSettings,
                        smtp_port: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={emailSettings.smtp_use_tls || false}
                        onChange={(e) => setEmailSettings({
                          ...emailSettings,
                          smtp_use_tls: e.target.checked
                        })}
                      />
                      Use TLS
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>SMTP Username (Gmail Email)</label>
                  <input
                    type="email"
                    value={emailSettings.smtp_username || ''}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings,
                      smtp_username: e.target.value
                    })}
                    placeholder="your-email@gmail.com"
                  />
                </div>

                <div className="form-group">
                  <label>SMTP Password (Gmail App Password)</label>
                  <input
                    type="password"
                    value={emailSettings.smtp_password || ''}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings,
                      smtp_password: e.target.value
                    })}
                    placeholder={
                      emailSettings.smtp_password_set 
                        ? "Password is set - enter new password to change" 
                        : "Gmail App Password (16 characters)"
                    }
                  />
                  <small style={{color: '#666', fontSize: '12px', display: 'block', marginTop: '4px'}}>
                    {emailSettings.smtp_password_set && (
                      <span style={{color: '#28a745'}}>✅ Password is configured. </span>
                    )}
                    Create App Password: Gmail → Google Account → Security → App passwords
                    <br />
                    <strong>Alternative for testing:</strong> Use Outlook.com or Yahoo Mail SMTP instead
                  </small>
                </div>

                <div className="form-group">
                  <label>From Email</label>
                  <input
                    type="email"
                    value={emailSettings.from_email || ''}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings,
                      from_email: e.target.value
                    })}
                    placeholder="noreply@pebdeq.com"
                  />
                </div>

                <div className="form-group">
                  <label>From Name</label>
                  <input
                    type="text"
                    value={emailSettings.from_name || ''}
                    onChange={(e) => setEmailSettings({
                      ...emailSettings,
                      from_name: e.target.value
                    })}
                    placeholder="PEBDEQ"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Daily Limit</label>
                    <input
                      type="number"
                      value={emailSettings.daily_limit || 1000}
                      onChange={(e) => setEmailSettings({
                        ...emailSettings,
                        daily_limit: parseInt(e.target.value)
                      })}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Hourly Limit</label>
                    <input
                      type="number"
                      value={emailSettings.hourly_limit || 100}
                      onChange={(e) => setEmailSettings({
                        ...emailSettings,
                        hourly_limit: parseInt(e.target.value)
                      })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={emailSettings.is_enabled || false}
                      onChange={(e) => setEmailSettings({
                        ...emailSettings,
                        is_enabled: e.target.checked
                      })}
                    />
                    Enable Email System
                  </label>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={emailSettings.test_mode || false}
                      onChange={(e) => setEmailSettings({
                        ...emailSettings,
                        test_mode: e.target.checked
                      })}
                    />
                    Test Mode (emails won't be sent)
                  </label>
                </div>

                <h3>📧 Auto-Send Email Notifications</h3>
                <p>Control which emails are automatically sent to customers:</p>
                
                <div className="email-notifications-grid">
                  <div className="notification-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={emailSettings.auto_send_welcome || false}
                        onChange={(e) => setEmailSettings({
                          ...emailSettings,
                          auto_send_welcome: e.target.checked
                        })}
                      />
                      🎉 Welcome Email (New Users)
                    </label>
                    <small>Send welcome email when users register</small>
                  </div>

                  <div className="notification-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={emailSettings.auto_send_order_confirmation || false}
                        onChange={(e) => setEmailSettings({
                          ...emailSettings,
                          auto_send_order_confirmation: e.target.checked
                        })}
                      />
                      📋 Order Confirmation
                    </label>
                    <small>Send confirmation when order is placed</small>
                  </div>

                  <div className="notification-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={emailSettings.auto_send_payment_confirmation || false}
                        onChange={(e) => setEmailSettings({
                          ...emailSettings,
                          auto_send_payment_confirmation: e.target.checked
                        })}
                      />
                      💳 Payment Confirmation
                    </label>
                    <small>Send email when payment is received</small>
                  </div>

                  <div className="notification-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={emailSettings.auto_send_shipping_notification || false}
                        onChange={(e) => setEmailSettings({
                          ...emailSettings,
                          auto_send_shipping_notification: e.target.checked
                        })}
                      />
                      📦 Shipping Notification
                    </label>
                    <small>Send email when order is shipped</small>
                  </div>

                  <div className="notification-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={emailSettings.auto_send_order_status_update || false}
                        onChange={(e) => setEmailSettings({
                          ...emailSettings,
                          auto_send_order_status_update: e.target.checked
                        })}
                      />
                      📊 Order Status Updates
                    </label>
                    <small>Send email for manual order status changes</small>
                  </div>

                  <div className="notification-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={emailSettings.auto_send_invoice || false}
                        onChange={(e) => setEmailSettings({
                          ...emailSettings,
                          auto_send_invoice: e.target.checked
                        })}
                      />
                      🧾 Invoice Emails
                    </label>
                    <small>Send invoices automatically</small>
                  </div>

                  <div className="notification-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={emailSettings.auto_send_newsletter || false}
                        onChange={(e) => setEmailSettings({
                          ...emailSettings,
                          auto_send_newsletter: e.target.checked
                        })}
                      />
                      📮 Newsletter & Marketing
                    </label>
                    <small>Enable marketing email campaigns</small>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={emailSettings.test_mode || false}
                      onChange={(e) => setEmailSettings({
                        ...emailSettings,
                        test_mode: e.target.checked
                      })}
                    />
                    Test Mode (Don't actually send emails)
                  </label>
                </div>

                <button 
                  className="btn btn-primary"
                  onClick={() => updateEmailSettings(emailSettings)}
                >
                  💾 Save Settings
                </button>
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="analytics-section">
              <h2>Email Analytics</h2>
              
              <div className="analytics-summary">
                <h3>Performance Summary (Last 30 Days)</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="label">Total Sent:</span>
                    <span className="value">{emailAnalytics.summary?.total_sent || 0}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Total Delivered:</span>
                    <span className="value">{emailAnalytics.summary?.total_delivered || 0}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Total Opened:</span>
                    <span className="value">{emailAnalytics.summary?.total_opened || 0}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Total Clicked:</span>
                    <span className="value">{emailAnalytics.summary?.total_clicked || 0}</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Open Rate:</span>
                    <span className="value">{emailAnalytics.summary?.open_rate || 0}%</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Click Rate:</span>
                    <span className="value">{emailAnalytics.summary?.click_rate || 0}%</span>
                  </div>
                  <div className="summary-item">
                    <span className="label">Bounce Rate:</span>
                    <span className="value">{emailAnalytics.summary?.bounce_rate || 0}%</span>
                  </div>
                </div>
              </div>

              <div className="email-types-chart">
                <h3>Email Types Distribution</h3>
                {emailAnalytics.email_types?.map(type => (
                  <div key={type.type} className="type-bar">
                    <span className="type-label">{type.type}</span>
                    <div className="bar-container">
                      <div 
                        className="bar" 
                        style={{
                          width: `${(type.count / Math.max(...emailAnalytics.email_types.map(t => t.count), 1)) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="type-count">{type.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Template Edit/Preview Modal */}
      {showTemplateModal && (
        <div className="modal-overlay" onClick={() => setShowTemplateModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {selectedTemplate 
                  ? (modalMode === 'edit' ? '✏️ Edit Template' : '👁️ Preview Template') + ': ' + selectedTemplate.name
                  : '➕ New Template'
                }
              </h2>
              <button 
                className="close-btn" 
                onClick={() => setShowTemplateModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              {modalMode === 'edit' || !selectedTemplate ? (
                <div className="template-edit-form">
                  <div className="form-group">
                    <label>Template Name:</label>
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        name: e.target.value
                      })}
                      disabled={!!selectedTemplate}
                      placeholder="Enter template name (lowercase, no spaces)"
                    />
                    {selectedTemplate ? (
                      <small>Template name cannot be changed</small>
                    ) : (
                      <small>Use lowercase letters, numbers, and underscores only</small>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Template Type:</label>
                    <select
                      value={editingTemplate.template_type}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        template_type: e.target.value
                      })}
                    >
                      <option value="transactional">Transactional</option>
                      <option value="marketing">Marketing</option>
                      <option value="notification">Notification</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Subject:</label>
                    <input
                      type="text"
                      value={editingTemplate.subject}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        subject: e.target.value
                      })}
                      placeholder="Email subject with variables like {{user_name}}"
                    />
                  </div>

                  <div className="form-group">
                    <label>HTML Content:</label>
                    <textarea
                      value={editingTemplate.html_content}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        html_content: e.target.value
                      })}
                      rows="15"
                      placeholder="HTML email content with variables like {{user_name}}, {{order_id}}"
                    />
                  </div>

                  <div className="form-group">
                    <label>Text Content (fallback):</label>
                    <textarea
                      value={editingTemplate.text_content}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        text_content: e.target.value
                      })}
                      rows="10"
                      placeholder="Plain text version of the email"
                    />
                  </div>

                  <div className="variable-help">
                    <h4>Available Variables:</h4>
                    <p><strong>Order Templates:</strong> {'{{user_name}}'}, {'{{order_id}}'}, {'{{order_total}}'}, {'{{order_date}}'}, {'{{order_status}}'}, {'{{payment_status}}'}, {'{{tracking_url}}'}</p>
                    <p><strong>General:</strong> {'{{site_name}}'}, {'{{from_name}}'}, {'{{custom_message}}'}</p>
                  </div>
                </div>
              ) : (
                <div className="template-preview">
                  <h3>Subject Preview:</h3>
                  <div className="preview-subject">
                    {selectedTemplate.subject}
                  </div>
                  
                  <h3>Email Preview:</h3>
                  <div className="preview-content">
                    <iframe
                      srcDoc={selectedTemplate.html_content || '<p>No HTML content available</p>'}
                      style={{
                        width: '100%',
                        height: '400px',
                        border: '1px solid #ddd',
                        borderRadius: '4px'
                      }}
                    />
                  </div>
                  
                  {selectedTemplate.text_content && (
                    <>
                      <h3>Text Version:</h3>
                      <div className="preview-text">
                        <pre style={{
                          backgroundColor: '#f8f9fa',
                          padding: '15px',
                          borderRadius: '4px',
                          overflow: 'auto',
                          maxHeight: '200px'
                        }}>
                          {selectedTemplate.text_content}
                        </pre>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
            
            <div className="modal-footer">
              {modalMode === 'edit' ? (
                <>
                  <button 
                    className="btn btn-primary"
                    onClick={handleSaveTemplate}
                  >
                    💾 Save Template
                  </button>
                  <button 
                    className="btn btn-secondary"
                    onClick={() => setShowTemplateModal(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button 
                  className="btn btn-secondary"
                  onClick={() => setShowTemplateModal(false)}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailManagement; 