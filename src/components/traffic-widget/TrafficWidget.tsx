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

export const TrafficWidget: React.FC<TrafficWidgetProps> = ({ location, onClose }) => {
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrafficData = async () => {
      if (!location) return;

      setLoading(true);
      setError(null);

      try {
        const encodedLocation = encodeURIComponent(location);
        const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${
          process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'demo-key'
        }&q=${encodedLocation}&zoom=13`;

        const data: TrafficData = {
          location,
          mapUrl,
          trafficSummary: `Map centered on ${location}`,
          lastUpdated: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
          }),
        };

        setTrafficData(data);
      } catch (err) {
        console.error('Failed to load traffic data:', err);
        setError('Failed to load map. Please try again.');
        setTrafficData({
          location,
          mapUrl: '',
          trafficSummary: `Traffic data for ${location} is currently unavailable`,
          lastUpdated: new Date().toLocaleTimeString(),
        });
      } finally {
        setLoading(false);
      }
    };

    loadTrafficData();
  }, [location]);

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
          <div className="error-message">
            {error}
          </div>
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
                <div className="legend-item">
                  <span className="color-indicator green"></span>
                  <span>Light Traffic</span>
                </div>
                <div className="legend-item">
                  <span className="color-indicator yellow"></span>
                  <span>Moderate Traffic</span>
                </div>
                <div className="legend-item">
                  <span className="color-indicator red"></span>
                  <span>Heavy Traffic</span>
                </div>
                <div className="legend-item">
                  <span className="color-indicator dark-red"></span>
                  <span>Very Heavy Traffic</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="traffic-info" />
      </div>
    </div>
  );
};
