
import React, { useState, useEffect, useCallback } from 'react';
import './image-generation-widget.scss';

interface ImageGenerationWidgetProps {
  prompt: string;
  onClose: () => void;
}

export const ImageGenerationWidget: React.FC<ImageGenerationWidgetProps> = ({ prompt, onClose }) => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const generateImage = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Using Pollinations.ai - free and no auth required, with no watermark
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&seed=${Math.floor(Math.random() * 1000000)}&nologo=true&enhance=true`;
      
      // Test if the image loads successfully
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
      });
      
      setImageUrl(imageUrl);
      
    } catch (err) {
      console.error('Error generating image:', err);
      setError('Failed to generate image. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  useEffect(() => {
    generateImage();
  }, [generateImage]);

  // No cleanup needed for Pollinations.ai URLs as they are direct image URLs
  useEffect(() => {
    return () => {
      // Pollinations.ai provides direct image URLs, no cleanup needed
    };
  }, [imageUrl]);

  const downloadImage = async () => {
    if (!imageUrl) return;
    
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `pollinations-generated-image-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading image:', error);
    }
  };

  const regenerateImage = () => {
    generateImage();
  };

  return (
    <div className="image-generation-backdrop" onClick={onClose}>
      <div className="image-generation-widget" onClick={(e) => e.stopPropagation()}>
        <div className="image-header">
          <div className="image-title">
            <h2>Creative Workspace</h2>
            <div className="image-prompt">
              "{prompt}"
            </div>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="image-content">
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Generating your image...</p>
              <p className="loading-subtext">This may take 10-20 seconds</p>
            </div>
          ) : imageUrl ? (
            <div className="image-display-container">
              <div className="generated-image-wrapper">
                <img 
                  src={imageUrl} 
                  alt={`Generated image: ${prompt}`}
                  className="generated-image"
                />
              </div>
              <div className="image-actions">
                <button className="download-button" onClick={downloadImage}>
                  Download
                </button>
                <button className="regenerate-button" onClick={regenerateImage}>
                  Regenerate
                </button>
              </div>
            </div>
          ) : (
            <div className="error-container">
              <div className="error-icon">⚠️</div>
              <p className="error-message">{error || 'Failed to generate image'}</p>
              <button className="retry-button" onClick={regenerateImage}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
