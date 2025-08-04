import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const Profile = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState([]);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  // New address form state
  const [newAddress, setNewAddress] = useState({
    title: '',
    first_name: '',
    last_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: 'Turkey',
    is_default: false
  });

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
      fetchUserData();
    }
  }, [user]);

  const getAuthHeaders = () => ({
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  });

  const fetchUserData = async () => {
    try {
      // Fetch user addresses
      const addressesResponse = await fetch('/api/users/addresses', {
        headers: getAuthHeaders()
      });
      if (addressesResponse.ok) {
        const addressesData = await addressesResponse.json();
        setAddresses(addressesData.addresses || []);
      }

    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(profileForm)
      });

      if (response.ok) {
        toast.success('Profile updated successfully!');
        // Update user context with new data
        const updatedUser = await response.json();
        // You might need to update the auth context here
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password
        })
      });

      if (response.ok) {
        toast.success('Password changed successfully!');
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
        setShowPasswordForm(false);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error('Error changing password');
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/users/addresses', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newAddress)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Address added successfully!');
        setNewAddress({
          title: '',
          first_name: '',
          last_name: '',
          address_line1: '',
          address_line2: '',
          city: '',
          postal_code: '',
          country: 'Turkey',
          is_default: false
        });
        setShowAddressForm(false);
        fetchUserData(); // Refresh addresses
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add address');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Error adding address');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  if (!user) {
    return (
      <div className="profile fade-in">
        <div className="container">
          <div className="text-center">
            <h2>Please log in to view your profile</h2>
            <a href="/login" className="btn btn-primary">Login</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile fade-in">
      <div className="container">
        {/* User Navigation */}
        <div className="user-navigation">
          <Link to={user?.is_admin ? "/admin" : "/user-dashboard"} className="nav-link">
            📊 Dashboard
          </Link>
          <Link to="/profile" className="nav-link active">
            👤 Profile
          </Link>
          <Link to="/user-settings" className="nav-link">
            ⚙️ Settings
          </Link>
        </div>

        <div className="profile-header">
          <div className="profile-welcome">
                            <h1>Welcome back, {user?.first_name || 'User'}!</h1>
            <p>Manage your account and address information</p>
          </div>
          <div className="profile-avatar">
            <div className="avatar-circle">
              {user?.first_name ? user.first_name.charAt(0).toUpperCase() : 'U'}
            </div>
          </div>
        </div>

        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile Info
          </button>
          <button
            className={`tab-btn ${activeTab === 'addresses' ? 'active' : ''}`}
            onClick={() => setActiveTab('addresses')}
          >
            Addresses
          </button>
          <button
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>

        <div className="profile-content">
          {/* Profile Info Tab */}
          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>Profile Information</h2>
              <form onSubmit={handleProfileSubmit} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>First Name</label>
                    <input
                      type="text"
                      value={profileForm.first_name}
                      onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input
                      type="text"
                      value={profileForm.last_name}
                      onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                    placeholder="+90 555 123 4567"
                  />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                    rows="3"
                    placeholder="Your address"
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </form>
            </div>
          )}

          {/* Addresses Tab */}
          {activeTab === 'addresses' && (
            <div className="profile-section">
              <div className="section-header">
                <h2>Saved Addresses</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => setShowAddressForm(true)}
                >
                  Add New Address
                </button>
              </div>

              {showAddressForm && (
                <div className="address-form-modal">
                  <div className="modal-content">
                    <h3>Add New Address</h3>
                    <form onSubmit={handleAddressSubmit}>
                      <div className="form-group">
                        <label>Address Title</label>
                        <input
                          type="text"
                          value={newAddress.title}
                          onChange={(e) => setNewAddress({...newAddress, title: e.target.value})}
                          placeholder="Home, Work, etc."
                          required
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>First Name</label>
                          <input
                            type="text"
                            value={newAddress.first_name}
                            onChange={(e) => setNewAddress({...newAddress, first_name: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Last Name</label>
                          <input
                            type="text"
                            value={newAddress.last_name}
                            onChange={(e) => setNewAddress({...newAddress, last_name: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Address Line 1</label>
                        <input
                          type="text"
                          value={newAddress.address_line1}
                          onChange={(e) => setNewAddress({...newAddress, address_line1: e.target.value})}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Address Line 2 (Optional)</label>
                        <input
                          type="text"
                          value={newAddress.address_line2}
                          onChange={(e) => setNewAddress({...newAddress, address_line2: e.target.value})}
                        />
                      </div>
                      <div className="form-row">
                        <div className="form-group">
                          <label>City</label>
                          <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Postal Code</label>
                          <input
                            type="text"
                            value={newAddress.postal_code}
                            onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})}
                            required
                          />
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Country</label>
                        <select
                          value={newAddress.country}
                          onChange={(e) => setNewAddress({...newAddress, country: e.target.value})}
                          required
                        >
                          <option value="Turkey">Turkey</option>
                          <option value="USA">USA</option>
                          <option value="Germany">Germany</option>
                          <option value="UK">UK</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>
                          <input
                            type="checkbox"
                            checked={newAddress.is_default}
                            onChange={(e) => setNewAddress({...newAddress, is_default: e.target.checked})}
                          />
                          Set as default address
                        </label>
                      </div>
                      <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                          {loading ? 'Adding...' : 'Add Address'}
                        </button>
                        <button 
                          type="button" 
                          className="btn btn-outline"
                          onClick={() => setShowAddressForm(false)}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="addresses-list">
                {addresses.length > 0 ? (
                  addresses.map(address => (
                    <div key={address.id} className="address-card">
                      <div className="address-header">
                        <h3>
                          {address.title}
                          {address.is_default && <span className="default-badge">Default</span>}
                        </h3>
                      </div>
                      <div className="address-details">
                        <p><strong>{address?.first_name || 'N/A'} {address?.last_name || 'N/A'}</strong></p>
                        <p>{address.address_line1}</p>
                        {address.address_line2 && <p>{address.address_line2}</p>}
                        <p>{address.city}, {address.postal_code}</p>
                        <p>{address.country}</p>
                        {address.phone && <p>Phone: {address.phone}</p>}
                      </div>
                      <div className="address-actions">
                        <button className="btn btn-outline btn-sm">Edit</button>
                        <button className="btn btn-outline btn-sm">Delete</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No saved addresses yet.</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowAddressForm(true)}
                    >
                      Add Your First Address
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="profile-section">
              <h2>Security Settings</h2>
              
              <div className="security-actions">
                <div className="security-item">
                  <h3>Change Password</h3>
                  <p>Keep your account secure with a strong password</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                  >
                    {showPasswordForm ? 'Cancel' : 'Change Password'}
                  </button>
                </div>
                
                <div className="security-item">
                  <h3>Account Status</h3>
                  <p>Your account is active and secure</p>
                  <span className="status-badge active">Active</span>
                </div>
                
                <div className="security-item">
                  <h3>Logout</h3>
                  <p>Sign out of your account on this device</p>
                  <button className="btn btn-outline" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              </div>

              {showPasswordForm && (
                <div className="password-form-section">
                  <h3>Change Password</h3>
                  <form onSubmit={handlePasswordSubmit} className="password-form">
                    <div className="form-group">
                      <label>Current Password</label>
                      <input
                        type="password"
                        value={passwordForm.current_password}
                        onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>New Password</label>
                      <input
                        type="password"
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style jsx="true">{`
        .profile {
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

        .profile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .profile-welcome h1 {
          color: #2c3e50;
          margin-bottom: 0.5rem;
        }

        .profile-welcome p {
          color: #6c757d;
          margin: 0;
        }

        .profile-avatar {
          display: flex;
          align-items: center;
        }

        .avatar-circle {
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background: #007bff;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: bold;
        }

        .profile-tabs {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          background: white;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .tab-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          background: transparent;
          color: #6c757d;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .tab-btn:hover {
          color: #007bff;
          background: #e7f1ff;
        }

        .tab-btn.active {
          color: #007bff;
          background: #e7f1ff;
          border: 1px solid #007bff;
        }

        .profile-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .profile-section h2 {
          color: #2c3e50;
          margin-bottom: 1.5rem;
        }

        .profile-form {
          max-width: 600px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #2c3e50;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .address-form-modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          padding: 2rem;
          max-width: 500px;
          width: 90%;
          max-height: 80vh;
          overflow-y: auto;
        }

        .modal-content h3 {
          margin-bottom: 1.5rem;
          color: #2c3e50;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        .addresses-list {
          display: grid;
          gap: 1rem;
        }

        .address-card {
          border: 1px solid #e9ecef;
          border-radius: 8px;
          padding: 1.5rem;
          background: #f8f9fa;
        }

        .address-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .address-header h3 {
          margin: 0;
          color: #2c3e50;
        }

        .default-badge {
          background: #28a745;
          color: white;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.7rem;
          margin-left: 0.5rem;
        }

        .address-details p {
          margin: 0.25rem 0;
          color: #6c757d;
        }

        .address-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .security-actions {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .security-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }

        .security-item h3 {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
        }

        .security-item p {
          margin: 0;
          color: #6c757d;
          font-size: 0.9rem;
        }

        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-badge.active {
          background: #d4edda;
          color: #155724;
        }

        .password-form-section {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e9ecef;
        }

        .password-form {
          max-width: 400px;
        }

        .empty-state {
          text-align: center;
          padding: 3rem;
          color: #6c757d;
        }

        .empty-state p {
          margin-bottom: 1rem;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          display: inline-block;
          text-align: center;
        }

        .btn-primary {
          background: #007bff;
          color: white;
        }

        .btn-primary:hover {
          background: #0056b3;
        }

        .btn-outline {
          background: transparent;
          color: #007bff;
          border: 2px solid #007bff;
        }

        .btn-outline:hover {
          background: #007bff;
          color: white;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.8rem;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .profile-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .profile-tabs {
            flex-direction: column;
            gap: 0.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .security-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }

          .address-card {
            padding: 1rem;
          }

          .address-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .address-actions {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile; 