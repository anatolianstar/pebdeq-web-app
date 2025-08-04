import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import './BackgroundRemovalModal.css';
import ImageCropModal from './ImageCropModal';
import { getApiUrl } from '../config';

// Desktop App Configuration
const DESKTOP_CONFIG = {
  // Local development
  local: 'http://localhost:8000',
  // Production - Desktop app will run on user's machine
  production: 'http://localhost:8000',
  // Alternative production setup (if desktop app serves on different port)
  // production: 'http://127.0.0.1:8000'
};

const getDesktopUrl = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  return isProduction ? DESKTOP_CONFIG.production : DESKTOP_CONFIG.local;
};

const BackgroundRemovalModal = ({ 
  isOpen, 
  onClose, 
  images, 
  onSaveImages,
  productId = null // Optional productId for upload functionality
}) => {
  const [imageStates, setImageStates] = useState({});
  const [imagePreviews, setImagePreviews] = useState({});
  const [processing, setProcessing] = useState(false);
  const [processingLocation, setProcessingLocation] = useState('web');
  const [speedMode, setSpeedMode] = useState('fast'); // Default to fast mode
  
  // Desktop App states
  const [desktopConnected, setDesktopConnected] = useState(false);
  const [checkingDesktop, setCheckingDesktop] = useState(false);
  const [desktopProcessingStatus, setDesktopProcessingStatus] = useState({});
  const [extensionClientId, setExtensionClientId] = useState(null);
  
  // Crop modal states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [currentCropImageUrl, setCurrentCropImageUrl] = useState('');
  const [currentCropImageIndex, setCurrentCropImageIndex] = useState(null);
  
  // Local images state to track real-time changes
  const [localImages, setLocalImages] = useState(images);
  
  // Update local images when images prop changes
  useEffect(() => {
    setLocalImages(images);
  }, [images]);

  // Desktop App connectivity check + Background polling for incoming images
  useEffect(() => {
    if (isOpen) {
      checkDesktopConnection();
      // Set up periodic connectivity check
      const connectivityInterval = setInterval(checkDesktopConnection, 10000); // Check every 10 seconds
      
      // BACKGROUND POLLING FOR INCOMING PROCESSED IMAGES (like Shopify extension)
      const incomingImagesInterval = setInterval(() => {
        checkForIncomingProcessedImages();
      }, 3000); // Check every 3 seconds for incoming images
      
      return () => {
        clearInterval(connectivityInterval);
        clearInterval(incomingImagesInterval);
        // Cleanup: unregister extension client when modal closes
        unregisterExtensionClient();
      };
    }
  }, [isOpen, extensionClientId]);

  const registerAsExtensionClient = async () => {
    try {
      const desktopUrl = getDesktopUrl();
      const response = await fetch(`${desktopUrl}/api/extension-connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        const result = await response.json();
        setExtensionClientId(result.client_id);
        console.log('🔌 Registered as extension client:', result.client_id);
        console.log(`📊 Total clients: ${result.connected_clients}`);
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to register as extension client:', error);
    }
    return false;
  };

  const unregisterExtensionClient = async () => {
    if (!extensionClientId) return;
    
    try {
      const desktopUrl = getDesktopUrl();
      await fetch(`${desktopUrl}/api/extension-disconnect?client_id=${encodeURIComponent(extensionClientId)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(3000)
      });
      
      console.log('🔌 Unregistered extension client:', extensionClientId);
      setExtensionClientId(null);
    } catch (error) {
      console.error('❌ Failed to unregister extension client:', error);
    }
  };

  // BACKGROUND POLLING FOR INCOMING PROCESSED IMAGES (like Shopify extension)
  const checkForIncomingProcessedImages = async () => {
    if (!desktopConnected) return;
    
    try {
      const desktopUrl = getDesktopUrl();
      const response = await fetch(`${desktopUrl}/api/get-processed-images/pebdeq-web`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(3000)
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // If we have new processed images that we haven't handled yet
        if (data.images && data.images.length > 0) {
          console.log(`📥 BACKGROUND: Found ${data.images.length} incoming processed images!`);
          await handleIncomingProcessedImages(data.images);
        }
      }
    } catch (error) {
      // Silent fail for background polling - don't spam console
      // console.log('🔍 Background polling (silent):', error.message);
    }
  };

  // Handle incoming processed images (like Shopify extension does)
  const handleIncomingProcessedImages = async (images) => {
    console.log(`🎉 AUTO-DETECTED ${images.length} processed images!`);
    
    for (let i = 0; i < images.length; i++) {
      const image = images[i];
      
      if (image.processedData) {
        console.log(`📤 Auto-uploading incoming image: ${image.originalName}`);
        
        // Convert base64 to blob and create file
        const response = await fetch(image.processedData);
        const blob = await response.blob();
        const file = new File([blob], image.originalName, { 
          type: 'image/png',
          lastModified: Date.now()
        });
        
        // Upload to web backend (same as manual processing)
        try {
          const uploadFormData = new FormData();
          uploadFormData.append('image', file);
          if (productId) {
            uploadFormData.append('product_id', productId);
          }
          uploadFormData.append('image_index', i);
          
          const uploadResponse = await fetch('/api/products/upload-cropped-image', {
            method: 'POST',
            body: uploadFormData
          });
          
          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            console.log(`✅ Auto-uploaded incoming image: ${uploadResult.filename}`);
            
            // Update preview immediately
            setImagePreviews(prev => ({
              ...prev,
              [i]: image.processedData
            }));
            
            setImageStates(prev => ({
              ...prev,
              [i]: 'preview'
            }));
            
            // CRITICAL: Clear loading states to remove blurry overlay
            setDesktopProcessingStatus(prev => {
              const newStatus = { ...prev };
              delete newStatus[i];
              return newStatus;
            });
            
            // Update local images for save functionality
            setLocalImages(prev => {
              const newImages = [...prev];
              newImages[i] = {
                ...newImages[i],
                processed: true,
                processedUrl: image.processedData
              };
              return newImages;
            });
            
            toast.success(`🎉 Auto-processed image uploaded: ${image.originalName}`);
          }
        } catch (uploadError) {
          console.error('❌ Failed to auto-upload incoming image:', uploadError);
          
          // Clear loading state even on error to prevent stuck overlay
          setDesktopProcessingStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[i];
            return newStatus;
          });
          
          // Still show preview even if upload failed
          setImagePreviews(prev => ({
            ...prev,
            [i]: image.processedData
          }));
          
          setImageStates(prev => ({
            ...prev,
            [i]: 'preview'
          }));
          
          toast.error(`❌ Failed to upload: ${image.originalName}`, {
            duration: 4000
          });
        }
      }
    }
    
    // Clear processed images from desktop queue after successful handling
    try {
      const desktopUrl = getDesktopUrl();
      await fetch(`${desktopUrl}/api/clear-processed-images`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ platform: 'pebdeq-web' }),
        signal: AbortSignal.timeout(5000)
      });
      
      console.log('🧹 Auto-cleared processed images after handling incoming batch');
    } catch (clearError) {
      console.warn('⚠️ Failed to auto-clear processed images:', clearError);
    }
    
    // Final UI update: Ensure save button is enabled and all loading states are cleared
    console.log('✅ Auto-processing complete - Save button should be active now!');
    toast.success(`🎉 ${images.length} processed images ready to save!`, {
      duration: 3000
    });
  };

  const checkDesktopConnection = async () => {
    setCheckingDesktop(true);
    try {
      const desktopUrl = getDesktopUrl();
      const response = await fetch(`${desktopUrl}/health`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        // Add timeout
        signal: AbortSignal.timeout(3000) // 3 second timeout
      });
      
      if (response.ok) {
        const healthData = await response.json();
        setDesktopConnected(true);
        console.log('✅ Desktop app connected:', healthData);
        
        // Register as extension client for compatibility
        if (!extensionClientId) {
          await registerAsExtensionClient();
        }
      } else {
        setDesktopConnected(false);
      }
    } catch (error) {
      setDesktopConnected(false);
      console.log('📱 Desktop app not available:', error.message);
    } finally {
      setCheckingDesktop(false);
    }
  };

  const imageToBase64 = async (imageUrl) => {
    try {
      const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:5005${imageUrl}`;
      const response = await fetch(fullImageUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          // Desktop app expects raw base64 (like Etsy extension)
          const base64 = reader.result.split(',')[1]; // Remove data:image/... prefix
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      throw new Error(`Failed to convert image to base64: ${error.message}`);
    }
  };

  const pollForProcessedResults = async (platform, imageIndex, modelName) => {
    const maxAttempts = 60; // 3 dakika maksimum (3s interval)
    let attempts = 0;
    
    const poll = async () => {
      attempts++;
      
      try {
        const desktopUrl = getDesktopUrl();
        const response = await fetch(`${desktopUrl}/api/get-processed-images/${platform}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(15000) // 15 saniye timeout
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`📥 Polling attempt ${attempts}: Found ${data.count || 0} processed images`);
          
          if (data.images && data.images.length > 0) {
            // Get the latest processed image
            const latestImage = data.images[data.images.length - 1];
            const imageData = latestImage.processedData || latestImage.data_url || latestImage.base64_data;
            
            // Upload processed image to web backend (like Shopify/Etsy extension)
            try {
              console.log(`📤 Uploading processed image to web backend...`);
              
              // Convert base64 to blob for upload
              const base64Response = await fetch(imageData);
              const blob = await base64Response.blob();
              const file = new File([blob], `processed_${Date.now()}.png`, { type: 'image/png' });
              
              // Upload to web backend
              const uploadFormData = new FormData();
              uploadFormData.append('image', file);
              if (productId) {
                uploadFormData.append('product_id', productId);
              }
              uploadFormData.append('image_index', imageIndex);
              
              const uploadResponse = await fetch(getApiUrl('/api/products/upload-cropped-image'), {
                method: 'POST',
                body: uploadFormData
              });
              
              if (uploadResponse.ok) {
                const uploadResult = await uploadResponse.json();
                console.log(`✅ Successfully uploaded processed image to web backend`);
                
                // Update preview with uploaded image
                setImagePreviews(prev => ({
                  ...prev,
                  [imageIndex]: uploadResult.url
                }));
                
                // Update state to show preview
                setImageStates(prev => ({
                  ...prev,
                  [imageIndex]: 'preview'
                }));
                
                // Clear processing status
                setDesktopProcessingStatus(prev => {
                  const newStatus = { ...prev };
                  delete newStatus[imageIndex];
                  return newStatus;
                });
                
                toast.success(`🎉 ${modelName} completed and uploaded successfully!`);
                
                // Clear processed image from queue AFTER successful upload (like extension does)
                try {
                  const clearResponse = await fetch(`${desktopUrl}/api/clear-processed-images`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ platform }),
                    signal: AbortSignal.timeout(10000) // 10 saniye clear timeout
                  });
                  
                  if (clearResponse.ok) {
                    console.log(`🧹 Auto-cleared processed images for ${platform} after successful upload`);
                  } else {
                    console.warn(`⚠️ Failed to clear processed images: ${clearResponse.statusText}`);
                  }
                } catch (clearError) {
                  console.warn(`⚠️ Error clearing processed images:`, clearError);
                }
                
              } else {
                throw new Error(`Upload failed: ${uploadResponse.statusText}`);
              }
              
            } catch (uploadError) {
              console.error(`❌ Failed to upload processed image:`, uploadError);
              
              // Still show preview even if upload fails
              setImagePreviews(prev => ({
                ...prev,
                [imageIndex]: imageData
              }));
              
              setImageStates(prev => ({
                ...prev,
                [imageIndex]: 'preview'
              }));
              
              // Clear processing status
              setDesktopProcessingStatus(prev => {
                const newStatus = { ...prev };
                delete newStatus[imageIndex];
                return newStatus;
              });
              
              toast.error(`❌ Desktop processing completed but upload failed: ${uploadError.message}`);
            }
            
            return true; // Success, stop polling
          }
        }
        
        // Continue polling if no results yet
        if (attempts < maxAttempts) {
          setTimeout(poll, 3000); // Poll every 3 seconds (HIZLI)
        } else {
          throw new Error('Polling timeout - no results after 3 minutes');
        }
        
      } catch (error) {
        console.error(`❌ Polling error (attempt ${attempts}):`, error);
        
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Retry after error (ORTA HIZ)
        } else {
          // Final failure - try to reconnect to desktop app
          console.log('🔄 Attempting to reconnect to desktop app...');
          const reconnected = await checkDesktopConnection();
          
          // Clear processing status on final failure
          setDesktopProcessingStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[imageIndex];
            return newStatus;
          });
          
          if (reconnected) {
            toast.error(`❌ Desktop processing timeout. Desktop app reconnected, please try again.`);
          } else {
            toast.error(`❌ Desktop processing failed and app is offline. Check if desktop app is running.`);
          }
        }
      }
    };
    
    // Start polling immediately
    poll();
  };

  const handleWebProcessing = async (imageUrl, imageIndex) => {
    // Fetch the image and convert to File object
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:5005${imageUrl}`;
    const response = await fetch(fullImageUrl);
    const blob = await response.blob();
    const file = new File([blob], 'image.jpg', { type: blob.type });

    // Create FormData and send to backend - Smart mode
    const formData = new FormData();
    formData.append('image', file);
    formData.append('model_type', 'smart');
    formData.append('model_preference', speedMode); // fast or premium

    const backgroundRemovalResponse = await fetch(getApiUrl('/api/products/remove-background'), {
      method: 'POST',
      body: formData
    });

    if (backgroundRemovalResponse.ok) {
      const result = await backgroundRemovalResponse.json();
      
      // Update preview
      setImagePreviews(prev => ({
        ...prev,
        [imageIndex]: result.preview
      }));
      
      // Update state to show preview
      setImageStates(prev => ({
        ...prev,
        [imageIndex]: 'preview'
      }));
      
            const modeName = 'Web Standart Model';
      const qualityInfo = '';
      toast.success(`⚡ Background removed using ${modeName}${qualityInfo} in ${result.processing_time}!`);
    } else {
      const error = await backgroundRemovalResponse.json();
      toast.error(`Web processing failed: ${error.error}`);
      
      // Reset state
      setImageStates(prev => ({
        ...prev,
        [imageIndex]: 'none'
      }));
    }
  };

  const handleDesktopProcessing = async (imageUrl, imageIndex) => {
    try {
      // Check desktop connection first
      if (!desktopConnected) {
        toast.error('🖥️ Desktop App not connected! Starting PEBDEQ Desktop App...');
        await checkDesktopConnection();
        
        if (!desktopConnected) {
          const fallbackChoice = window.confirm(
            '🖥️ PEBDEQ Desktop App Required:\n\n' +
            '1. Start PEBDEQ Desktop App\n' +
            '2. Ensure it\'s running on port 8000\n' +
            '3. Try again\n\n' +
            'Click OK to retry connection, or Cancel to use Web Processing instead.'
          );
          
          if (fallbackChoice) {
            await checkDesktopConnection();
            if (!desktopConnected) {
              toast.error('Desktop app still not available!');
              return;
            }
          } else {
            // Fallback to web processing
            setSpeedMode('fast');
            await handleWebProcessing(imageUrl, imageIndex);
            return;
          }
        }
      }

      // Set processing status
      setDesktopProcessingStatus(prev => ({
        ...prev,
        [imageIndex]: 'converting'
      }));

      // Convert image to base64
      toast('📷 Preparing image for desktop processing...');
      const imageBase64 = await imageToBase64(imageUrl);
      
      // Pro Mode always uses BiRefNet (best model)
      const selectedModel = 'birefnet';
      
      // Set processing status
      setDesktopProcessingStatus(prev => ({
        ...prev,
        [imageIndex]: 'processing'
      }));

      const modelName = 'Pebdeq Pro Model';
      toast(`🖥️ Processing with ${modelName}... İşlem sürüyor, işlenmiş resim bekleniyor...`);

      // Send to desktop app using queue system (like Etsy extension)
      const desktopUrl = getDesktopUrl();
      
      console.log('🔍 DEBUG: Sending to desktop queue:', {
        url: `${desktopUrl}/api/receive-photos`,
        model: selectedModel,
        imageSize: imageBase64.length,
        imagePreview: imageBase64.substring(0, 100) + '...'
      });
      
      // Create file data structure like Etsy extension
      const fileData = [{
        name: `web_image_${Date.now()}.jpg`,
        size: imageBase64.length,
        type: 'image/jpeg',
        data: imageBase64,
        targetPlatform: 'pebdeq-web'
      }];
      
      // Send to queue system
      const response = await fetch(`${desktopUrl}/api/receive-photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          files: fileData,
          targetPlatform: 'pebdeq-web',
          timestamp: new Date().toISOString(),
          model: selectedModel
        }),
        // Queue submission timeout  
        signal: AbortSignal.timeout(20000) // 20 saniye timeout (BÜYÜK RESİMLER İÇİN)
      });

      if (response.ok) {
        const result = await response.json();
        console.log('📥 Photos queued for processing:', result);
        
        toast(`📥 Photo queued for processing... Polling for results...`);
        
        // Start polling for processed results (wait 2 seconds first)
        setTimeout(() => {
          pollForProcessedResults('pebdeq-web', imageIndex, modelName);
        }, 2000); // Desktop app'in process etmeye başlaması için bekle
        
      } else {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to queue for processing');
      }
      
    } catch (error) {
      console.error('Desktop processing error:', error);
      
      // Clear processing status
      setDesktopProcessingStatus(prev => {
        const newStatus = { ...prev };
        delete newStatus[imageIndex];
        return newStatus;
      });
      
      // Reset image state
      setImageStates(prev => ({
        ...prev,
        [imageIndex]: 'none'
      }));
      
      if (error.name === 'TimeoutError') {
        toast.error('⏰ Desktop processing timeout! Large images may take longer.');
      } else {
        toast.error(`🖥️ Desktop processing failed: ${error.message}`);
      }
      
      // Offer fallback to web processing
      const fallbackChoice = window.confirm(
        'Desktop processing failed. Would you like to try Web Processing instead?'
      );
      
      if (fallbackChoice) {
        setSpeedMode('fast');
        await handleWebProcessing(imageUrl, imageIndex);
      }
    }
  };





  const handleRemoveBackground = async (imageUrl, imageIndex) => {
    try {
      setProcessing(true);
      
      // Update state to show processing
      setImageStates(prev => ({
        ...prev,
        [imageIndex]: 'processing'
      }));

      // Smart routing based on model selection
      const requiresDesktop = speedMode === 'premium';
      
      if (requiresDesktop) {
        // Pro Mode -> Desktop App (BiRefNet)
        console.log(`🖥️ Routing Pro Mode to desktop app`);
        await handleDesktopProcessing(imageUrl, imageIndex);
      } else {
        // Fast model -> Web Processing (U2Net)
        console.log(`🌐 Routing ${speedMode} model to web processing`);
        await handleWebProcessing(imageUrl, imageIndex);
      }
    } catch (error) {
      console.error('Error removing background:', error);
      toast.error('Error removing background');
      
      // Reset state
      setImageStates(prev => ({
        ...prev,
        [imageIndex]: 'none'
      }));
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveProcessedImage = async (imageIndex) => {
    try {
      const previewData = imagePreviews[imageIndex];
      if (!previewData) {
        toast.error('No preview data found');
        return;
      }

      const response = await fetch('/api/products/save-processed-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_data: previewData
        })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update the image in the list
        const updatedImages = [...localImages];
        updatedImages[imageIndex] = result.image_url;
        
        // Update local images state first
        setLocalImages(updatedImages);
        
        // Clear preview and state
        setImagePreviews(prev => {
          const newPreviews = { ...prev };
          delete newPreviews[imageIndex];
          return newPreviews;
        });
        
        setImageStates(prev => ({
          ...prev,
          [imageIndex]: 'saved'
        }));
        
        // Update parent component
        onSaveImages(updatedImages);
        
        toast.success('Background-removed image saved as PNG!');
      } else {
        const error = await response.json();
        toast.error(`Save failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving processed image:', error);
      toast.error('Error saving processed image');
    }
  };

  const handleDiscardPreview = (imageIndex) => {
    // Clear preview
    setImagePreviews(prev => {
      const newPreviews = { ...prev };
      delete newPreviews[imageIndex];
      return newPreviews;
    });
    
    // Reset state
    setImageStates(prev => ({
      ...prev,
      [imageIndex]: 'none'
    }));
    
    toast('Preview discarded', {
      icon: 'ℹ️',
    });
  };

  const handleOpenCropModal = (imageUrl, imageIndex) => {
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `http://localhost:5005${imageUrl}`;
    setCurrentCropImageUrl(fullImageUrl);
    setCurrentCropImageIndex(imageIndex);
    setCropModalOpen(true);
  };

  const handleCloseCropModal = () => {
    setCropModalOpen(false);
    setCurrentCropImageUrl('');
    setCurrentCropImageIndex(null);
  };

  const handleCropComplete = async (croppedFile) => {
    try {
      const formData = new FormData();
      formData.append('image', croppedFile);

      const response = await fetch('/api/products/upload-cropped-image', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update the image in the list
        const updatedImages = [...localImages];
        updatedImages[currentCropImageIndex] = result.image_url;
        
        // Update local images state first
        setLocalImages(updatedImages);
        
        // Update parent component
        onSaveImages(updatedImages);
        
        // Close crop modal
        handleCloseCropModal();
        
        // Clear any existing state for this image
        setImageStates(prev => ({
          ...prev,
          [currentCropImageIndex]: 'none'
        }));
        
        // Clear any existing preview for this image
        setImagePreviews(prev => {
          const newPreviews = { ...prev };
          delete newPreviews[currentCropImageIndex];
          return newPreviews;
        });
        
        toast.success('Cropped image successfully saved! You can now remove the background.');
      } else {
        const error = await response.json();
        toast.error(`Crop save failed: ${error.error}`);
      }
    } catch (error) {
      console.error('Error saving cropped image:', error);
      toast.error('Cropped image could not be saved');
    }
  };

  const handleCloseModal = () => {
    // Clear all states
    setImageStates({});
    setImagePreviews({});
    setCropModalOpen(false);
    setCurrentCropImageUrl('');
    setCurrentCropImageIndex(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="background-removal-modal-overlay">
      <div className="background-removal-modal">
        <div className="modal-header">
          <h3>🎯 Professional Background Removal - AI Models</h3>
          <div className="header-status">
            <div className={`desktop-status ${desktopConnected ? 'connected' : 'disconnected'}`}>
              {checkingDesktop ? (
                <span>🔄 Checking Desktop App...</span>
              ) : desktopConnected ? (
                <span>✅ Desktop App Connected {extensionClientId ? '(Client Registered)' : '(Registering...)'}</span>
              ) : (
                <span>📱 Desktop App Offline</span>
              )}
            </div>
          </div>
          <button 
            className="close-button"
            onClick={handleCloseModal}
          >
            ×
          </button>
        </div>
        
        {/* TAMAMEN YENİ: İKİ KOLON MODAL CONTENT */}
        <div style={{
          display: 'flex',
          flexDirection: 'row',
          height: 'calc(100vh - 150px)', /* DAHA YÜKSEK MODAL */
          width: '100%'
        }}>
          
          {/* SOL KOLON: SADECE RESİMLER - BEYAZ ARKAPLAN */}
          <div style={{
            flex: '1 1 70%', /* DAHA GENİŞ SOL KOLON */
            backgroundColor: 'white',
            padding: '30px',
            overflowY: 'auto',
            borderRight: '3px solid #ddd'
          }}>
              <div className="images-grid">
            {localImages.map((imageUrl, index) => (
              <div key={`${index}-${imageUrl}`} className="image-card">
                <div className="image-container">
                  <img 
                    src={imagePreviews[index] || `http://localhost:5005${imageUrl}`} 
                    alt={`Product ${index + 1}`}
                    className={`preview-image ${imageStates[index] === 'preview' ? 'has-preview' : ''}`}
                  />
                  
                  {imageStates[index] === 'processing' && (
                    <div className="processing-overlay">
                      <div className="spinner"></div>
                      <span>Processing...</span>
                    </div>
                  )}
                  
                  {desktopProcessingStatus[index] === 'converting' && (
                    <div className="processing-overlay desktop-converting">
                      <div className="spinner"></div>
                      <span>📷 Preparing for desktop...</span>
                    </div>
                  )}
                  
                  {desktopProcessingStatus[index] === 'processing' && (
                    <div className="processing-overlay desktop-processing">
                      <div className="spinner desktop-spinner"></div>
                      <span>🖥️ İşlem sürüyor, işlenmiş resim bekleniyor...</span>
                    </div>
                  )}
                  
                  {imageStates[index] === 'saved' && (
                    <div className="status-indicator saved">
                      <span>✓ Saved as PNG</span>
                    </div>
                  )}
                  
                  {imageStates[index] === 'preview' && (
                    <div className="status-indicator preview">
                      <span>👁️ Preview</span>
                    </div>
                  )}
                </div>
                
                <div className="image-controls">
                  <div className="checkbox-container">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={imageStates[index] === 'preview' || imageStates[index] === 'saved'}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleRemoveBackground(imageUrl, index);
                          } else {
                            handleDiscardPreview(index);
                          }
                        }}
                        disabled={imageStates[index] === 'processing'}
                      />
                      🎯 Remove Background
                    </label>
                  </div>
                  
                  <div className="crop-button-container">
                    <button
                      className="btn btn-crop"
                      onClick={() => handleOpenCropModal(imageUrl, index)}
                      disabled={imageStates[index] === 'processing'}
                    >
                      ✂️ Crop to Square
                    </button>
                  </div>
                  
                  {imageStates[index] === 'preview' && (
                    <div className="action-buttons">
                      <button
                        className="btn btn-success"
                        onClick={() => handleSaveProcessedImage(index)}
                      >
                        💾 Save PNG
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleDiscardPreview(index)}
                      >
                        🗑️ Discard
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
              </div>
          </div>
          
          {/* SAĞ KOLON: MODEL SEÇİMİ - SİYAH ARKAPLAN */}
          <div style={{
            flex: '0 0 30%', /* DAHA DAR SAĞ KOLON */
            backgroundColor: '#2c2c2c',
            padding: '30px',
            color: 'white',
            overflowY: 'auto'
          }}>
            <h4 style={{color: 'white', marginBottom: '20px', fontSize: '18px'}}>
              🎯 Professional Model Selection
            </h4>
            
            <div style={{marginBottom: '25px'}}>
              <select 
                value={speedMode} 
                onChange={(e) => setSpeedMode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '2px solid #555',
                  fontSize: '16px',
                  backgroundColor: '#444',
                  color: 'white'
                }}
              >
                <option value="fast">⚡ Fast Mode - Web Standart</option>
                <option value="premium">🚀 Pro Mode - Pebdeq Desktop App</option>
              </select>
            </div>
            
            <div style={{
              padding: '20px',
              backgroundColor: '#3a3a3a',
              borderRadius: '8px',
              border: '1px solid #555',
              marginBottom: '25px'
            }}>
              <p style={{margin: '0', fontSize: '14px', lineHeight: '1.5', color: '#ccc'}}>
                {speedMode === 'fast' ? 
                  '⚡ Fast Mode: Quick processing on web server. Good quality results in 2-5 seconds.' : 
                  '🚀 Pro Mode: Maximum quality processing using Pebdeq Desktop App. Advanced AI models with sharp edges in 10-30 seconds.'
                }
              </p>
            </div>
            
            {/* TURUNCU BUTON SAĞ KOLONDA */}
            <button 
              onClick={handleCloseModal}
              style={{
                width: '100%',
                padding: '15px 20px',
                backgroundColor: '#ff6b35',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(255, 107, 53, 0.3)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#e55a2b';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = '#ff6b35';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              ✅ Complete Professional Processing
            </button>
          </div>
        </div>
      </div>
      
      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={cropModalOpen}
        onClose={handleCloseCropModal}
        imageUrl={currentCropImageUrl}
        onCropComplete={handleCropComplete}
        title="Crop Image to Square Format"
      />
    </div>
  );
};

export default BackgroundRemovalModal; 