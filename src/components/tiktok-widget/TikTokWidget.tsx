
import React, { useState, useEffect } from 'react';
import './tiktok-widget.scss';

interface TikTokWidgetProps {
  username: string;
  onClose: () => void;
}

interface TikTokProfile {
  username: string;
  profileUrl: string;
  embedUrl: string;
  isValid: boolean;
}

const generateTikTokData = (username: string): TikTokProfile => {
  // Clean username (remove @ if present)
  const cleanUsername = username.replace(/^@/, '');
  
  return {
    username: cleanUsername,
    profileUrl: `https://www.tiktok.com/@${cleanUsername}`,
    embedUrl: `https://www.tiktok.com/embed/@${cleanUsername}`,
    isValid: /^[a-zA-Z0-9._]{1,24}$/.test(cleanUsername)
  };
};

export const TikTokWidget: React.FC<TikTokWidgetProps> = ({ username, onClose }) => {
  const [profileData, setProfileData] = useState<TikTokProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!username) return;

      setLoading(true);
      setError(null);

      try {
        const data = generateTikTokData(username);
        
        if (!data.isValid) {
          throw new Error('Invalid TikTok username format');
        }

        setProfileData(data);
      } catch (err) {
        console.error('Failed to load TikTok profile:', err);
        setError('Failed to load TikTok profile. Please check the username and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [username]);

  const openInTikTok = () => {
    if (profileData) {
      window.open(profileData.profileUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="tiktok-backdrop" onClick={onClose}>
        <div className="tiktok-widget loading" onClick={(e) => e.stopPropagation()}>
          <div className="tiktok-header">
            <div className="tiktok-title">
              <h2>TikTok</h2>
            </div>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="loading-spinner">
            Loading TikTok profile for "{username}"...
          </div>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="tiktok-backdrop" onClick={onClose}>
        <div className="tiktok-widget error" onClick={(e) => e.stopPropagation()}>
          <div className="tiktok-header">
            <div className="tiktok-title">
              <h2>TikTok</h2>
            </div>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="error-message">
            {error || 'Failed to load TikTok profile'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="tiktok-backdrop" onClick={onClose}>
      <div className="tiktok-widget" onClick={(e) => e.stopPropagation()}>
        <div className="tiktok-header">
          <div className="tiktok-title">
            <h2>TikTok</h2>
            <div className="profile-username">
              @{profileData.username}
            </div>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="tiktok-content">
          <div className="profile-container">
            <div className="profile-embed">
              <iframe
                src={profileData.embedUrl}
                width="100%"
                height="500"
                frameBorder="0"
                scrolling="no"
                allowTransparency={true}
                title={`TikTok profile for ${profileData.username}`}
                onError={() => {
                  setError('Unable to load TikTok embed. The profile may be private or unavailable.');
                }}
              />
            </div>
            
            <div className="profile-actions">
              <button 
                className="tiktok-button"
                onClick={openInTikTok}
              >
                Open in TikTok
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
