import React, { useState, useEffect } from 'react';
import './map-widget.scss';

interface MapWidgetProps {
  location: string;
  onClose: () => void;
}

interface MapData {
  location: string;
  mapUrl: string;
  lastUpdated: string;
}

const isWebView = () => {
  const ua = navigator.userAgent || navigator.vendor || '';
  const standalone = (window.navigator as any).standalone === true;

  const isIOSWebView = /iPhone|iPod|iPad/.test(ua) && !standalone && !/Safari/.test(ua);
  const isAndroidWebView = /\bwv\b/.test(ua) || (/Android.*Version\/[\d.]+.*Chrome/.test(ua) && !/Chrome\/\d{2,}/.test(ua));

  return isIOSWebView || isAndroidWebView;
};

export const MapWidget: React.FC<MapWidgetProps> = ({ location, onClose }) => {
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isHidden, setIsHidden] = useState<boolean>(false);

  useEffect(() => {
    if (isWebView()) {
      setIsHidden(true);
      return;
    }

    const loadMapData = async () => {
      if (!location) return;

      setLoading(true);
      setError(null);

      try {
        const mapHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
    #map { height: 100vh; width: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    function initMap() {
      const map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: { lat: 3.1319, lng: 101.6958 },
        mapTypeId: 'roadmap'
      });

      const geocoder = new google.maps.Geocoder();
      // Check if location is coordinates (lat,lng format)
      const coordMatch = '${location}'.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
      
      if (coordMatch) {
        // Handle coordinate-based location (current location)
        const lat = parseFloat(coordMatch[1]);
        const lng = parseFloat(coordMatch[2]);
        const position = { lat: lat, lng: lng };
        
        map.setCenter(position);
        const marker = new google.maps.Marker({
          position: position,
          map: map,
          title: 'Your Current Location'
        });

        const infoWindow = new google.maps.InfoWindow({
          content: '<div style="padding: 5px;"><strong>Your Current Location</strong><br>Lat: ' + lat.toFixed(6) + '<br>Lng: ' + lng.toFixed(6) + '</div>'
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        infoWindow.open(map, marker);
      } else {
        // Handle address-based location (regular location search)
        geocoder.geocode({ address: '${location}' }, (results, status) => {
          if (status === 'OK' && results[0]) {
            map.setCenter(results[0].geometry.location);
            const marker = new google.maps.Marker({
              position: results[0].geometry.location,
              map: map,
              title: '${location}'
            });

            const infoWindow = new google.maps.InfoWindow({
              content: '<div style="padding: 5px;"><strong>${location}</strong></div>'
            });

            marker.addListener('click', () => {
              infoWindow.open(map, marker);
            });

            infoWindow.open(map, marker);
          }
        });
      }
    }
  </script>
  <script src="https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'demo-key'}&callback=initMap&libraries=geometry"></script>
</body>
</html>`;

        const mapUrl = `data:text/html;charset=utf-8,${encodeURIComponent(mapHtml)}`;

        // Check if this is a current location (coordinates format)
        const coordMatch = location.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
        const displayLocation = coordMatch ? 'Your Current Location' : location;

        setMapData({
          location: displayLocation,
          mapUrl: mapUrl,
          lastUpdated: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })
        });
      } catch (err) {
        console.error('Failed to load map data:', err);
        setError('Failed to load map data. Please try again.');

        setMapData({
          location: location,
          mapUrl: '',
          lastUpdated: new Date().toLocaleTimeString()
        });
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, [location]);

  if (isHidden) return null;

  if (loading || !mapData) {
    return (
      <div className="map-backdrop" onClick={onClose}>
        <div className="map-widget loading" onClick={(e) => e.stopPropagation()}>
          <div className="map-header">
            <h2>Map</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="loading-spinner">
            {loading ? 'Loading map...' : 'No map data available'}
          </div>
        </div>
      </div>
    );
  }

  if (error && !mapData.mapUrl) {
    return (
      <div className="map-backdrop" onClick={onClose}>
        <div className="map-widget error" onClick={(e) => e.stopPropagation()}>
          <div className="map-header">
            <h2>Map</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="map-backdrop" onClick={onClose}>
      <div className="map-widget" onClick={(e) => e.stopPropagation()}>
        <div className="map-header">
          <div className="map-title">
            <h2>Map</h2>
            <div className="map-location">
              {mapData.location}
              <span className="last-updated">Updated: {mapData.lastUpdated}</span>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="map-content">
          {mapData.mapUrl ? (
            <div className="map-container">
              <iframe
                src={mapData.mapUrl}
                className="map-iframe"
                allowFullScreen
                loading="lazy"
                title={`Map for ${mapData.location}`}
              />
            </div>
          ) : (
            <div className="map-fallback">
              <div className="map-icon">🗺️</div>
              <p>Map for {mapData.location} is currently unavailable</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
