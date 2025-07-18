
import React, { useState, useEffect } from 'react';
import './instagram-widget.scss';

interface InstagramWidgetProps {
  username: string;
  onClose: () => void;
}

interface InstagramProfile {
  username: string;
  profileUrl: string;
  embedUrl: string;
  isValid: boolean;
}

const generateInstagramData = (username: string): InstagramProfile => {
  // Clean username (remove @ if present)
  const cleanUsername = username.replace(/^@/, '');
  
  return {
    username: cleanUsername,
    profileUrl: `https://www.instagram.com/${cleanUsername}/`,
    embedUrl: `https://www.instagram.com/${cleanUsername}/embed/`,
    isValid: /^[a-zA-Z0-9._]{1,30}$/.test(cleanUsername)
  };
};

export const InstagramWidget: React.FC<InstagramWidgetProps> = ({ username, onClose }) => {
  const [profileData, setProfileData] = useState<InstagramProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!username) return;

      setLoading(true);
      setError(null);

      try {
        const data = generateInstagramData(username);
        
        if (!data.isValid) {
          throw new Error('Invalid Instagram username format');
        }

        setProfileData(data);
      } catch (err) {
        console.error('Failed to load Instagram profile:', err);
        setError('Failed to load Instagram profile. Please check the username and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [username]);

  const openInInstagram = () => {
    if (profileData) {
      window.open(profileData.profileUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="instagram-backdrop" onClick={onClose}>
        <div className="instagram-widget loading" onClick={(e) => e.stopPropagation()}>
          <div className="instagram-header">
            <div className="instagram-title">
              <h2>Instagram</h2>
            </div>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="loading-spinner">
            Loading Instagram profile for "{username}"...
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="instagram-backdrop" onClick={onClose}>
        <div className="instagram-widget error" onClick={(e) => e.stopPropagation()}>
          <div className="instagram-header">
            <div className="instagram-title">
              <h2>Instagram</h2>
            </div>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="error-message">
            {error || 'Failed to load Instagram profile'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="instagram-backdrop" onClick={onClose}>
      <div className="instagram-widget" onClick={(e) => e.stopPropagation()}>
        <div className="instagram-header">
          <div className="instagram-title">
            <h2>Instagram</h2>
            <div className="profile-username">
              @{profileData.username}
            </div>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="instagram-content">
          <div className="profile-container">
            <div className="profile-embed">
              <iframe
                src={profileData.embedUrl}
                width="100%"
                height="500"
                frameBorder="0"
                scrolling="no"
                allowTransparency={true}
                title={`Instagram profile for ${profileData.username}`}
                onError={() => {
                  setError('Unable to load Instagram embed. The profile may be private or unavailable.');
                }}
              />
            </div>
            
            <div className="profile-actions">
              <button 
                className="instagram-button"
                onClick={openInInstagram}
              >
                Open in Instagram
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
