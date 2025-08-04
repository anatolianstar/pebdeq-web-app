import { useEffect, useState } from 'react';
import './ImagePreviewModal.css';

const ImagePreviewModal = ({ isOpen, onClose, images = [], currentIndex = 0, altText = "Product Image" }) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  // currentIndex değiştiğinde activeIndex'i güncelle
  useEffect(() => {
    setActiveIndex(currentIndex);
  }, [currentIndex]);

  // ESC tuşu ile modal'ı kapatma ve navigasyon
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;
      
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
        default:
          break;
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Scroll'u engelle
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto'; // Scroll'u geri getir
    };
  }, [isOpen, onClose, activeIndex]);

  const nextImage = () => {
    if (images.length > 1) {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setActiveIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  if (!isOpen) return null;

  const currentImage = images[activeIndex] || images[0];

  return (
    <div className="image-preview-modal-overlay" onClick={onClose}>
      <div className="image-preview-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="image-preview-modal-close" onClick={onClose}>
          ×
        </button>
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button className="image-preview-nav-left" onClick={prevImage}>
              ‹
            </button>
            <button className="image-preview-nav-right" onClick={nextImage}>
              ›
            </button>
          </>
        )}
        
        <div className="image-preview-container">
          <img src={currentImage} alt={altText} className="image-preview-image" />
        </div>
        
        {/* Image Counter */}
        {images.length > 1 && (
          <div className="image-preview-counter">
            {activeIndex + 1} / {images.length}
          </div>
        )}
        
        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="image-preview-thumbnails">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${altText} ${index + 1}`}
                className={`image-preview-thumbnail ${index === activeIndex ? 'active' : ''}`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePreviewModal; 