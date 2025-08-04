import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const LikeButton = ({ type, itemId, className = '' }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const apiEndpoint = type === 'blog' ? `/api/blog/${itemId}` : `/api/products/${itemId}`;

  useEffect(() => {
    fetchLikeStatus();
  }, [itemId]);

  const fetchLikeStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Add authorization header if token exists
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      
      const response = await fetch(`${apiEndpoint}/like-status`, {
        headers: headers
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.is_liked);
        setLikeCount(data.like_count);
      }
    } catch (error) {
      console.error('Error fetching like status:', error);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like this item');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiEndpoint}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.is_liked);
        setLikeCount(data.like_count);
        
        if (data.action === 'liked') {
          toast.success('Added to favorites!');
        } else {
          toast.success('Removed from favorites!');
        }
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update like status');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className={`like-button ${isLiked ? 'liked' : ''} ${className}`}
      title={isLiked ? 'Remove from favorites' : 'Add to favorites'}
    >
      <i className={`${isLiked ? 'fas' : 'far'} fa-heart`}></i>
      <span className="like-count">{likeCount}</span>
      
      <style jsx="true">{`
        .like-button {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          width: 40px !important;
          height: 40px !important;
          min-width: 40px !important;
          min-height: 40px !important;
          padding: 0 !important;
          border: 2px solid #ff6b6b !important;
          border-radius: 50% !important;
          background: transparent !important;
          color: #ff6b6b !important;
          cursor: pointer !important;
          transition: all 0.3s ease !important;
          position: relative !important;
        }
        
        .like-button:hover {
          border-color: #ff5252 !important;
          color: #ff5252 !important;
          transform: scale(1.05) !important;
          background: rgba(255, 107, 107, 0.1) !important;
        }
        
        .like-button.liked {
          border-color: #ff6b6b !important;
          background: #ff6b6b !important;
          color: white !important;
        }
        
        .like-button.liked:hover {
          background: #ff5252 !important;
          border-color: #ff5252 !important;
          transform: scale(1.05) !important;
        }
        
        .like-button:disabled {
          opacity: 0.6 !important;
          cursor: not-allowed !important;
          transform: none !important;
        }
        
        .like-button i {
          font-size: 18px !important;
          line-height: 1 !important;
          margin: 0 !important;
        }
        
        .like-count {
          display: none !important; /* Product card'larda sayıyı gizle */
        }
        
        /* Animation for heart icon */
        .like-button.liked i {
          animation: heartBeat 0.4s ease !important;
        }
        
        @keyframes heartBeat {
          0% { transform: scale(1); }
          50% { transform: scale(1.3); }
          100% { transform: scale(1); }
        }
        
        /* Product Card içinde özel düzenleme */
        .favorite-btn-like {
          position: absolute !important;
          top: 8px !important;
          right: 8px !important;
          z-index: 10 !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .like-button {
            width: 36px !important;
            height: 36px !important;
            min-width: 36px !important;
            min-height: 36px !important;
          }
          
          .like-button i {
            font-size: 16px !important;
          }
        }
      `}</style>
    </button>
  );
};

export default LikeButton; 