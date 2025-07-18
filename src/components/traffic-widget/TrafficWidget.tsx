import React, { useState, useEffect } from 'react';
import './traffic-widget.scss';

interface TrafficWidgetProps {
  location: string;
  onClose: () => void;
}

interface TrafficData {
  location: string;
  mapUrl: string;
  trafficSummary: string;
  lastUpdated: string;
}

// Helper to detect if running in WebView
const isWebView = (): boolean => {
  const ua = navigator.userAgent || '';
  const standalone = (window.navigator as any).standalone;
  const isIOSWebView = /\b(iPhone|iPod|iPad)\b/.test(ua) && !/Safari/.test(ua);
  const isAndroidWebView = /\bwv\b/.test(ua) || /; wv/.test(ua) || (/\bVersion\/[\d.]+/.test(ua) && /Chrome\/[.0-9]* Mobile/.test(ua));
  return standalone || isIOSWebView || isAndroidWebView;
};

export const TrafficWidget: React.FC<TrafficWidgetProps> = ({ location, onClose }) => {
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [skipRender, setSkipRender] = useState<boolean>(false);

  useEffect(() => {
    if (isWebView()) {
      setSkipRender(true); // Prevent render in WebView
      return;
    }

    const loadTrafficData = async () => {
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
        zoom: 12,
        center: { lat: 3.1319, lng: 101.6958 },
        mapTypeId: 'roadmap'
      });

      const trafficLayer = new google.maps.TrafficLayer();
      trafficLayer.setMap(map);

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: '${location}' }, (results, status) => {
        if (status === 'OK' && results[0]) {
          map.setCenter(results[0].geometry.location);
          new google.maps.Marker({
            position: results[0].geometry.location,
            map: map,
            title: '${location}'
          });
        }
      });
    }
  </script>
  <script src="https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'demo-key'}&callback=initMap&libraries=geometry"></script>
</body>
</html>`;

        const mapUrl = `data:text/html;charset=utf-8,${encodeURIComponent(mapHtml)}`;

        const data: TrafficData = {
          location,
          mapUrl,
          trafficSummary: `Real-time traffic conditions for ${location}`,
          lastUpdated: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
          })
        };

        setTrafficData(data);
      } catch (err) {
        console.error('Failed to load traffic data:', err);
        setError('Failed to load traffic data. Please try again.');
        setTrafficData({
          location,
          mapUrl: '',
          trafficSummary: `Traffic data for ${location} is currently unavailable`,
          lastUpdated: new Date().toLocaleTimeString()
        });
      } finally {
        setLoading(false);
      }
    };

    loadTrafficData();
  }, [location]);

  // ✅ Skip render if in WebView
  if (skipRender) return null;

  if (loading || !trafficData) {
    return (
      <div className="traffic-backdrop" onClick={onClose}>
        <div className="traffic-widget loading" onClick={(e) => e.stopPropagation()}>
          <div className="traffic-header">
            <h2>Traffic Update</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="loading-spinner">
            {loading ? 'Loading traffic data...' : 'No traffic data available'}
          </div>
        </div>
      </div>
    );
  }

  if (error && !trafficData.mapUrl) {
    return (
      <div className="traffic-backdrop" onClick={onClose}>
        <div className="traffic-widget error" onClick={(e) => e.stopPropagation()}>
          <div className="traffic-header">
            <h2>Traffic Update</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="error-message">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="traffic-backdrop" onClick={onClose}>
      <div className="traffic-widget" onClick={(e) => e.stopPropagation()}>
        <div className="traffic-header">
          <div className="traffic-title">
            <h2>Traffic Update</h2>
            <div className="traffic-location">
              {trafficData.location}
              <span className="last-updated">Updated: {trafficData.lastUpdated}</span>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="traffic-content">
          {trafficData.mapUrl ? (
            <div className="traffic-map-container">
              <iframe
                src={trafficData.mapUrl}
                className="traffic-map"
                allowFullScreen
                loading="lazy"
                title={`Traffic map for ${trafficData.location}`}
              />
            </div>
          ) : (
            <div className="traffic-fallback">
              <div className="traffic-icon">🚗</div>
              <p>{trafficData.trafficSummary}</p>
              <div className="traffic-legend">
                <div className="legend-item"><span className="color-indicator green"></span>Light Traffic</div>
                <div className="legend-item"><span className="color-indicator yellow"></span>Moderate Traffic</div>
                <div className="legend-item"><span className="color-indicator red"></span>Heavy Traffic</div>
                <div className="legend-item"><span className="color-indicator dark-red"></span>Very Heavy Traffic</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
