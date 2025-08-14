
import React, { useState, useEffect } from 'react';
import { getCurrentLocation, LocationData } from '../../lib/location';
import './maia-social-widget.scss';

interface MaiaSocialWidgetProps {
  onClose: () => void;
}

export const MaiaSocialWidget: React.FC<MaiaSocialWidgetProps> = ({ onClose }) => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [iframeUrl, setIframeUrl] = useState<string>("https://social-maia.onrender.com/");

  useEffect(() => {
    // Try to get location and pass it to the iframe
    getCurrentLocation()
      .then((locationData) => {
        setLocation(locationData);
        const urlWithLocation = `https://social-maia.onrender.com/?lat=${locationData.latitude}&lng=${locationData.longitude}&accuracy=${locationData.accuracy}`;
        setIframeUrl(urlWithLocation);
        console.log('Location passed to MAiA Social:', locationData);
      })
      .catch((error) => {
        console.log('Could not get location for MAiA Social:', error);
        setLocationError(error.message);
        // Keep default URL if location fails
      });
  }, []);

  return (
    <div className="maia-social-backdrop" onClick={onClose}>
      <div className="maia-social-widget" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        <div className="maia-social-content">
          <iframe
            src={iframeUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            title="MAiA Social"
            allowFullScreen
            allow="geolocation"
          />

          
        </div>
      </div>
    </div>
  );
};
