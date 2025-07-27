
import React, { useState, useEffect } from 'react';
import { getCurrentLocation, LocationData } from '../../lib/location';
import './navigation-widget.scss';

interface NavigationWidgetProps {
  destination: string;
  onClose: () => void;
}

interface NavigationData {
  destination: string;
  mapUrl: string;
  lastUpdated: string;
  currentLocation?: LocationData;
}

const isWebView = () => {
  const ua = navigator.userAgent || navigator.vendor || '';
  const standalone = (window.navigator as any).standalone === true;

  const isIOSWebView = /iPhone|iPod|iPad/.test(ua) && !standalone && !/Safari/.test(ua);
  const isAndroidWebView = /\bwv\b/.test(ua) || (/Android.*Version\/[\d.]+.*Chrome/.test(ua) && !/Chrome\/\d{2,}/.test(ua));

  return isIOSWebView || isAndroidWebView;
};

export const NavigationWidget: React.FC<NavigationWidgetProps> = ({ destination, onClose }) => {
  const [navigationData, setNavigationData] = useState<NavigationData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isHidden, setIsHidden] = useState<boolean>(false);

  useEffect(() => {
    if (isWebView()) {
      setIsHidden(true);
      return;
    }

    const loadNavigationData = async () => {
      if (!destination) return;

      setLoading(true);
      setError(null);

      try {
        // Get current location
        let currentLocation: LocationData | undefined;
        try {
          currentLocation = await getCurrentLocation();
          console.log('Current location obtained for navigation:', currentLocation);
        } catch (locationError) {
          console.warn('Could not get current location:', locationError);
          // Continue without current location
        }

        // Create Google Maps embed URL
        const encodedDestination = encodeURIComponent(destination);
        let mapUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'demo-key'}&q=${encodedDestination}`;

        // If we have current location, use directions instead of place
        if (currentLocation) {
          const origin = `${currentLocation.latitude},${currentLocation.longitude}`;
          mapUrl = `https://www.google.com/maps/embed/v1/directions?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'demo-key'}&origin=${origin}&destination=${encodedDestination}&mode=driving`;
        }

        setNavigationData({
          destination: destination,
          mapUrl: mapUrl,
          currentLocation: currentLocation,
          lastUpdated: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })
        });
      } catch (err) {
        console.error('Failed to load navigation data:', err);
        setError('Failed to load navigation data. Please try again.');

        setNavigationData({
          destination: destination,
          mapUrl: '',
          lastUpdated: new Date().toLocaleTimeString()
        });
      } finally {
        setLoading(false);
      }
    };

    loadNavigationData();
  }, [destination]);

  const openInGoogleMaps = () => {
    if (navigationData?.currentLocation) {
      const origin = `${navigationData.currentLocation.latitude},${navigationData.currentLocation.longitude}`;
      const url = `https://www.google.com/maps/dir/${origin}/${encodeURIComponent(destination)}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/${encodeURIComponent(destination)}`;
      window.open(url, '_blank');
    }
  };

  if (isHidden) return null;

  if (loading || !navigationData) {
    return (
      <div className="navigation-backdrop" onClick={onClose}>
        <div className="navigation-widget loading" onClick={(e) => e.stopPropagation()}>
          <div className="navigation-header">
            <h2>Navigation</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="loading-spinner">
            {loading ? 'Loading navigation...' : 'No navigation data available'}
          </div>
        </div>
      </div>
    );
  }

  if (error && !navigationData.mapUrl) {
    return (
      <div className="navigation-backdrop" onClick={onClose}>
        <div className="navigation-widget error" onClick={(e) => e.stopPropagation()}>
          <div className="navigation-header">
            <h2>Navigation</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="navigation-backdrop" onClick={onClose}>
      <div className="navigation-widget" onClick={(e) => e.stopPropagation()}>
        <div className="navigation-header">
          <div className="navigation-title">
            <h2>Navigation</h2>
            <div className="navigation-destination">
              To: {navigationData.destination}
              <span className="last-updated">Updated: {navigationData.lastUpdated}</span>
            </div>
            <button className="open-maps-button" onClick={openInGoogleMaps}>
              Open in Google Maps
            </button>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="navigation-content">
          {navigationData.mapUrl ? (
            <div className="navigation-container">
              <iframe
                src={navigationData.mapUrl}
                className="navigation-iframe"
                allowFullScreen
                loading="lazy"
                title={`Navigation to ${navigationData.destination}`}
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          ) : (
            <div className="navigation-fallback">
              <div className="navigation-icon">🗺️</div>
              <p>Navigation to {navigationData.destination} is currently unavailable</p>
              <button className="fallback-button" onClick={openInGoogleMaps}>
                Open in Google Maps
              </button>
            </div>
          )}
        </div>

        {navigationData.currentLocation && (
          <div className="location-info">
            <span className="location-accuracy">
              Location accuracy: {Math.round(navigationData.currentLocation.accuracy)}m
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
