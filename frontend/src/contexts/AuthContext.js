import { createContext, useContext, useState, useEffect } from 'react';
import { createApiUrl } from '../utils/config';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tokenChecked, setTokenChecked] = useState(false);

  // Check for existing token on app start (only once)
  useEffect(() => {
    if (tokenChecked) return;
    
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
  
          const response = await fetch(createApiUrl('api/auth/profile'), {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setIsAuthenticated(true);
  
          } else {

            // Only remove token if it's clearly invalid (401)
            if (response.status === 401) {
              localStorage.removeItem('token');
              setUser(null);
              setIsAuthenticated(false);
            }
          }
        } catch (error) {
          console.error('❌ Auth check error:', error);
          // Don't remove token on network errors
          if (error.name !== 'TypeError') {
            localStorage.removeItem('token');
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      } else {
  
      }
      
      setLoading(false);
      setTokenChecked(true);
    };

    checkAuth();
  }, [tokenChecked]);

  const login = (token, userData) => {
    console.log('🔑 Login called with:', { token: token ? 'present' : 'missing', user: userData?.email });
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
    console.log('✅ User logged in:', userData.email);

  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('token');
    setTokenChecked(false);
    console.log('✅ User logged out');
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 