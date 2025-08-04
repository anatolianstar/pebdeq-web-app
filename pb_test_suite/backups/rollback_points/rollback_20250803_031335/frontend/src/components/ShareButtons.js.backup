import React from 'react';

const ShareButtons = ({ url, title, description, image }) => {
  const currentUrl = url || window.location.href;
  const shareTitle = title || document.title;
  const shareDescription = description || 'Check out this amazing content from PEBDEQ!';
  const shareImage = image || '';
  
  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}&quote=${encodeURIComponent(shareTitle)}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
  };
  
  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(shareTitle)}&hashtags=pebdeq`;
    window.open(twitterUrl, '_blank', 'width=600,height=400');
  };
  
  const handleLinkedInShare = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(linkedinUrl, '_blank', 'width=600,height=400');
  };
  
  const handleWhatsAppShare = () => {
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + currentUrl)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleEmailShare = () => {
    const emailUrl = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareDescription + '\n\n' + currentUrl)}`;
    window.location.href = emailUrl;
  };
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      alert('Link copied to clipboard!');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = currentUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Link copied to clipboard!');
    });
  };
  
  return (
    <div className="share-buttons">
      <div className="share-title">Share:</div>
      <div className="share-buttons-container">
        <button 
          onClick={handleFacebookShare}
          className="share-button facebook"
          title="Share on Facebook"
        >
          <i className="fab fa-facebook-f"></i>
        </button>
        
        <button 
          onClick={handleTwitterShare}
          className="share-button twitter"
          title="Share on Twitter"
        >
          <i className="fab fa-twitter"></i>
        </button>
        
        <button 
          onClick={handleLinkedInShare}
          className="share-button linkedin"
          title="Share on LinkedIn"
        >
          <i className="fab fa-linkedin-in"></i>
        </button>
        
        <button 
          onClick={handleWhatsAppShare}
          className="share-button whatsapp"
          title="Share on WhatsApp"
        >
          <i className="fab fa-whatsapp"></i>
        </button>
        
        <button 
          onClick={handleEmailShare}
          className="share-button email"
          title="Share via Email"
        >
          <i className="fas fa-envelope"></i>
        </button>
        
        <button 
          onClick={handleCopyLink}
          className="share-button copy"
          title="Copy Link"
        >
          <i className="fas fa-copy"></i>
        </button>
      </div>
      
      <style jsx="true">{`
        .share-buttons {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1rem 0;
          padding: 1rem;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #e9ecef;
        }
        
        .share-title {
          font-weight: 600;
          color: #495057;
          white-space: nowrap;
        }
        
        .share-buttons-container {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        
        .share-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          color: white;
          font-size: 16px;
        }
        
        .share-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .share-button.facebook {
          background: #1877f2;
        }
        
        .share-button.facebook:hover {
          background: #166fe5;
        }
        
        .share-button.twitter {
          background: #1da1f2;
        }
        
        .share-button.twitter:hover {
          background: #0d8bd9;
        }
        
        .share-button.linkedin {
          background: #0077b5;
        }
        
        .share-button.linkedin:hover {
          background: #006399;
        }
        
        .share-button.whatsapp {
          background: #25d366;
        }
        
        .share-button.whatsapp:hover {
          background: #20ba5a;
        }
        
        .share-button.email {
          background: #6c757d;
        }
        
        .share-button.email:hover {
          background: #5a6268;
        }
        
        .share-button.copy {
          background: #007bff;
        }
        
        .share-button.copy:hover {
          background: #0056b3;
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .share-buttons {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .share-title {
            margin-bottom: 0.5rem;
          }
          
          .share-buttons-container {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  );
};

export default ShareButtons; 