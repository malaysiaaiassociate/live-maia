import React, { useState, useEffect } from 'react';
import './spotify-widget.scss';

interface SpotifyWidgetProps {
  searchQuery: string;
  onClose: () => void;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  image: string;
  preview_url: string | null;
  external_url: string;
  duration_ms: number;
}

const SPOTIFY_CLIENT_ID = process.env.REACT_APP_SPOTIFY_CLIENT_ID || 'demo-client-id';
const SPOTIFY_CLIENT_SECRET = process.env.REACT_APP_SPOTIFY_CLIENT_SECRET || 'demo-client-secret';

const getSpotifyToken = async (): Promise<string> => {
  if (SPOTIFY_CLIENT_ID === 'demo-client-id') {
    return 'demo-token';
  }

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`)}`
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting Spotify token:', error);
    throw error;
  }
};

const fetchSpotifyTracks = async (query: string): Promise<SpotifyTrack[]> => {
  try {
    if (SPOTIFY_CLIENT_ID === 'demo-client-id') {
      // Return mock data for demo purposes
      return [
        {
          id: '1',
          name: `${query} - First Track`,
          artist: 'Demo Artist',
          album: 'Demo Album',
          image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Spotify',
          preview_url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
          external_url: 'https://open.spotify.com/track/demo1',
          duration_ms: 210000
        },
        {
          id: '2',
          name: `${query} - Second Track`,
          artist: 'Another Artist',
          album: 'Another Album',
          image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Spotify',
          preview_url: null,
          external_url: 'https://open.spotify.com/track/demo2',
          duration_ms: 180000
        },
        {
          id: '3',
          name: `${query} - Third Track`,
          artist: 'Third Artist',
          album: 'Third Album',
          image: 'https://via.placeholder.com/300x300/1db954/ffffff?text=Spotify',
          preview_url: 'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3',
          external_url: 'https://open.spotify.com/track/demo3',
          duration_ms: 195000
        }
      ];
    }

    const token = await getSpotifyToken();
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch Spotify tracks');
    }

    const data = await response.json();

    return data.tracks.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0].name,
      album: track.album.name,
      image: track.album.images[0]?.url || 'https://via.placeholder.com/300x300/1db954/ffffff?text=Spotify',
      preview_url: track.preview_url,
      external_url: track.external_urls.spotify,
      duration_ms: track.duration_ms
    }));
  } catch (error) {
    console.error('Error fetching Spotify tracks:', error);
    throw error;
  }
};

const formatDuration = (ms: number): string => {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const SpotifyWidget: React.FC<SpotifyWidgetProps> = ({ searchQuery, onClose }) => {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    const loadTracks = async () => {
      if (!searchQuery) return;

      setLoading(true);
      setError(null);

      try {
        const trackData = await fetchSpotifyTracks(searchQuery);
        setTracks(trackData);
        // Auto-select the first track
        if (trackData.length > 0) {
          setSelectedTrack(trackData[0]);
        }
      } catch (err) {
        console.error('Failed to fetch Spotify tracks:', err);
        setError('Failed to load Spotify tracks. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadTracks();
  }, [searchQuery]);

  const playPreview = (track: SpotifyTrack) => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlaying(false);
    }

    if (track.preview_url) {
      const audio = new Audio(track.preview_url);
      audio.play().catch((error) => {
        console.error('Error playing preview:', error);
        alert('Unable to play preview. Please try opening in Spotify.');
      });
      setCurrentAudio(audio);
      setIsPlaying(true);

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      });

      audio.addEventListener('error', () => {
        setIsPlaying(false);
        setCurrentAudio(null);
        alert('Preview not available for this track.');
      });
    } else {
      alert('No preview available for this track. Click "Open in Spotify" to listen to the full song.');
    }
  };

  const stopPreview = () => {
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlaying(false);
    }
  };

  const openInSpotify = (track: SpotifyTrack) => {
    window.open(track.external_url, '_blank');
  };

  if (loading) {
    return (
      <div className="spotify-backdrop" onClick={onClose}>
        <div className="spotify-widget loading" onClick={(e) => e.stopPropagation()}>
          <div className="spotify-header">
            <div className="spotify-title">
              <h2>Spotify</h2>
            </div>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="loading-spinner">
            Searching Spotify for "{searchQuery}"...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="spotify-backdrop" onClick={onClose}>
        <div className="spotify-widget error" onClick={(e) => e.stopPropagation()}>
          <div className="spotify-header">
            <div className="spotify-title">
              <h2>Spotify</h2>
            </div>
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
    <div className="spotify-backdrop" onClick={onClose}>
      <div className="spotify-widget" onClick={(e) => e.stopPropagation()}>
        <div className="spotify-header">
          <div className="spotify-title">
            <h2>Spotify</h2>
            <div className="search-query">
              Results for: "{searchQuery}"
            </div>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="spotify-content">
          {selectedTrack && (
            <div className="track-player">
              <div className="track-artwork">
                <img src={selectedTrack.image} alt={selectedTrack.album} />
                <div className="play-controls">
                  {selectedTrack.preview_url && (
                    <button 
                      className="play-button"
                      onClick={() => isPlaying ? stopPreview() : playPreview(selectedTrack)}
                    >
                      {isPlaying ? '⏸️' : '▶️'}
                    </button>
                  )}
                  <button 
                    className="spotify-button"
                    onClick={() => openInSpotify(selectedTrack)}
                  >
                    Open in Spotify
                  </button>
                </div>
              </div>
              <div className="track-info">
                <h3>{selectedTrack.name}</h3>
                <p className="artist">by {selectedTrack.artist}</p>
                <p className="album">{selectedTrack.album}</p>
                <p className="duration">{formatDuration(selectedTrack.duration_ms)}</p>
              </div>
            </div>
          )}

          <div className="track-list">
            <h4>Search Results</h4>
            {tracks.map((track) => (
              <div
                key={track.id}
                className={`track-item ${selectedTrack?.id === track.id ? 'active' : ''}`}
                onClick={() => setSelectedTrack(track)}
              >
                <img src={track.image} alt={track.album} className="track-thumbnail" />
                <div className="track-details">
                  <h5>{track.name}</h5>
                  <p className="artist">{track.artist}</p>
                  <p className="album">{track.album}</p>
                </div>
                <div className="track-actions">
                  <span className="duration">{formatDuration(track.duration_ms)}</span>
                  {track.preview_url && (
                    <button 
                      className="preview-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        playPreview(track);
                      }}
                    >
                      🎵
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
