import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { createApiUrl } from '../utils/config';

const GoogleSignIn = ({ text = 'Sign in with Google', className = '' }) => {
  const { login } = useAuth();
  const { siteSettings } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    // Google OAuth ayarlarını kontrol et
    if (!siteSettings || !siteSettings.google_oauth_enabled) {
      return;
    }

    if (!siteSettings.google_oauth_client_id) {
      return;
    }

    if (window.google && window.google.accounts) {
      initializeGoogleSignIn();
    } else {
      // Google script'i yüklenmediyse bekle ve tekrar dene
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(checkGoogle);
          initializeGoogleSignIn();
        }
      }, 100);

      // 10 saniye sonra timeout
      setTimeout(() => {
        clearInterval(checkGoogle);
      }, 10000);
    }
  }, [siteSettings]);

  const initializeGoogleSignIn = () => {
    const clientId = siteSettings.google_oauth_client_id;
    
    if (!clientId) {

      return;
    }
    

    
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: handleCredentialResponse,
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    window.google.accounts.id.renderButton(
      document.getElementById('google-signin-button'),
      {
        theme: 'outline',
        size: 'large',
        width: '300',
        type: 'standard',
        text: 'signin_with'
      }
    );
  };

  const handleCredentialResponse = async (response) => {
    try {
      const googleToken = response.credential;
      
      const res = await fetch(createApiUrl('api/auth/google'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: googleToken }),
      });

      const data = await res.json();

      if (res.ok) {
        // AuthContext'e login bilgilerini gönder
        login(data.token, data.user);
        toast.success('Google ile giriş başarılı!');
        
        // React Router ile yönlendirme
        setTimeout(() => {
          navigate('/');
        }, 100);
      } else {
        throw new Error(data.error || 'Google ile giriş başarısız');
      }
    } catch (error) {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Google ile giriş sırasında hata oluştu');
    }
  };

  // Google OAuth devre dışıysa hiçbir şey render etme
  if (!siteSettings || !siteSettings.google_oauth_enabled) {
    return null;
  }

  return (
    <div className={`google-signin-container ${className}`}>
      <div id="google-signin-button"></div>
      <style jsx="true">{`
        .google-signin-container {
          display: flex;
          justify-content: center;
          margin: 20px 0;
        }
        
        #google-signin-button {
          display: flex;
          justify-content: center;
        }
        
        /* Google Button Styling Override */
        .google-signin-container iframe {
          border-radius: 8px !important;
        }
      `}</style>
    </div>
  );
};

export default GoogleSignIn; 