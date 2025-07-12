
import React, { useState } from 'react';
import './iptv-widget.scss';

interface IPTVWidgetProps {
  searchQuery: string;
  onClose: () => void;
}

interface IPTVChannel {
  id: string;
  name: string;
  url: string;
  logo: string;
  category: string;
  language: string;
  description: string;
}

const malaysianChannels: IPTVChannel[] = [
  {
    id: 'tv1',
    name: 'TV1',
    url: 'https://www.tvmalaysia.live/channel/tv1',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/03/TV1-Live-Streaming-HD-Now.webp',
    category: 'General',
    language: 'Malay',
    description: 'Malaysia\'s first television channel offering news, entertainment, and educational content.'
  },
  {
    id: 'tv2',
    name: 'TV2',
    url: 'https://www.tvmalaysia.live/channel/tv2',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/03/TV2-Malaysia-Live-Streaming-HD-Now.webp',
    category: 'General',
    language: 'Malay',
    description: 'Malaysia\'s second television channel with diverse programming including dramas and variety shows.'
  },
  {
    id: 'tv3',
    name: 'TV3',
    url: 'https://www.tvmalaysia.live/channel/tv3live',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/03/TV3-Live-Streaming-HD-Now-3.webp',
    category: 'Commercial',
    language: 'Malay',
    description: 'Malaysia\'s first commercial television station featuring entertainment and news programs.'
  },
  {
    id: 'tv8',
    name: 'TV8',
    url: 'https://www.tvmalaysia.live/channel/tv8live',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/04/8TV-Live-Malaysia-TV-Streaming-HD-Free.webp',
    category: 'Entertainment',
    language: 'Chinese/Malay',
    description: 'Television channel focusing on Chinese and Malay entertainment content.'
  },
  {
    id: 'tv9',
    name: 'TV9',
    url: 'https://www.tvmalaysia.live/channel/tv9live',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/03/TV9-Live-Streaming-HD-Now.webp',
    category: 'Entertainment',
    language: 'Malay',
    description: 'Malaysian television channel offering variety shows, dramas, and entertainment programs.'
  },
  {
    id: 'tvalhijrah',
    name: 'TV Al Hijrah',
    url: 'https://www.tvmalaysia.live/channel/alhijrah',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/03/Al-Hijrah-TV-Live-Streaming-HD-Now.webp',
    category: 'Islamic',
    language: 'Malay',
    description: 'Malaysian television channel offering variety Islamic shows, dramas, and entertainment programs.'
  },
  {
    id: 'didiktv',
    name: 'Didik TV',
    url: 'https://www.tvmalaysia.live/channel/didiktvlive',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/03/Didik-TV-Live-Streaming-HD-Now.webp',
    category: 'Education',
    language: 'Malay / English',
    description: 'Television channel focusing on educational entertainment content.'
  },
  {
    id: 'astroria',
    name: 'Astro Ria TV',
    url: 'https://www.tvmalaysia.live/channel/ria',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/03/Astro-Ria-Live-Streaming-Free-HD.webp',
    category: 'Entertainment',
    language: 'Malay',
    description: 'Malaysian private television channel offering variety shows, dramas, and entertainment programs.'
  },
  {
    id: 'astroprima',
    name: 'Astro Prima TV',
    url: 'https://www.tvmalaysia.live/channel/prima',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/04/Astro-Prima-Live-Streaming-Malaysia-HD-Free.webp',
    category: 'Entertainment',
    language: 'Malay',
    description: 'Malaysian private television channel offering variety shows, dramas, and entertainment programs.'
  },
  {
    id: 'astrooasis',
    name: 'Astro Oasis TV',
    url: 'https://www.tvmalaysia.live/channel/oasis',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/04/Astro-Oasis-Live-Streaming-Malaysia-HD-Free.webp',
    category: 'Islamic',
    language: 'Malay / English',
    description: 'Malaysian private television channel offering variety Islamic shows, dramas, and entertainment programs.'
  },
  {
    id: 'astroawani',
    name: 'Astro Awani TV',
    url: 'https://www.tvmalaysia.live/channel/awani',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/03/Astro-Awani-Live-Streaming-HD-Now.webp',
    category: 'News',
    language: 'Malay',
    description: 'Malaysian private television channel offering news programs.'
  },
  {
    id: 'astroceria',
    name: 'Astro Ceria TV',
    url: 'https://www.tvmalaysia.live/channel/ceria',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/03/Astro-Ceria-Live-Streaming-Free-HD.webp',
    category: 'Entertainment',
    language: 'Malay',
    description: 'Malaysian private television channel offering variety kids shows and entertainment programs.'
  },
  {
    id: 'astrocitra',
    name: 'Astro Citra TV',
    url: 'https://www.tvmalaysia.live/channel/citra',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/04/Astro-Citra-Live-Streaming-Malaysia-HD-Free.webp',
    category: 'Entertainment',
    language: 'Malay',
    description: 'Malaysian private television channel offering variety shows, dramas, and entertainment programs.'
  },
  {
    id: 'astroarena',
    name: 'Astro Arena TV',
    url: 'https://www.tvmalaysia.live/channel/arena',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/04/Astro-Arena-Live-Streaming-HD-Free.webp',
    category: 'Sports',
    language: 'Malay / English',
    description: 'Malaysian private television channel offering variety sports shows and entertainment programs.'
  },
  {
    id: 'astroarena2',
    name: 'Astro Arena 2 TV',
    url: 'https://www.tvmalaysia.live/channel/arena-2',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/04/Astro-Arena-Live-Streaming-HD-Free.webp',
    category: 'Sports',
    language: 'Malay / English',
    description: 'Malaysian private television channel offering variety sports shows and entertainment programs.'
  },
  {
    id: 'astroarenabola',
    name: 'Astro Arena Bola TV',
    url: 'https://www.tvmalaysia.live/channel/astro-arena-bola',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/04/Astro-Arena-2-Live-Streaming-HD-Free.webp',
    category: 'Sports',
    language: 'Malay / English',
    description: 'Malaysian private television channel offering variety sports shows and entertainment programs.'
  },
  {
    id: 'astroarenabola2',
    name: 'Astro Arena Bola 2 TV',
    url: 'https://www.tvmalaysia.live/channel/astro-arena-bola-2',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/04/Astro-Bola-2-Live-Streaming-HD-Free.webp',
    category: 'Sports',
    language: 'Malay / English',
    description: 'Malaysian private television channel offering variety sports shows and entertainment programs.'
  },
  {
    id: 'astrosportsuhd',
    name: 'Astro Sports UHD TV',
    url: 'https://www.tvmalaysia.live/channel/sportsuhd',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/04/Astro-Arena-Live-Streaming-HD-Free.webp',
    category: 'Sports',
    language: 'English',
    description: 'Malaysian private television channel offering variety sports shows and entertainment programs.'
  },
  {
    id: 'astrograndstand',
    name: 'Astro Grandstand TV',
    url: 'https://www.tvmalaysia.live/channel/grandstand',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/04/Astro-Arena-Live-Streaming-HD-Free.webp',
    category: 'Sports',
    language: 'English',
    description: 'Malaysian private television channel offering variety sports shows and entertainment programs.'
  },
  {
    id: 'astropremierleague',
    name: 'Astro Premier League TV',
    url: 'https://www.tvmalaysia.live/channel/premierleague',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/04/Astro-Football-Live-Streaming-HD-Free.webp',
    category: 'Sports',
    language: 'English',
    description: 'Malaysian private television channel offering variety sports shows and entertainment programs.'
  },
  {
    id: 'astropremierleague2',
    name: 'Astro Premier League 2 TV',
    url: 'https://www.tvmalaysia.live/channel/premierleague2',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/04/Astro-Football-Live-Streaming-HD-Free.webp',
    category: 'Sports',
    language: 'English',
    description: 'Malaysian private television channel offering variety sports shows and entertainment programs.'
  },
  {
    id: 'astrofootball',
    name: 'Astro Football TV',
    url: 'https://www.tvmalaysia.live/channel/football',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/04/Astro-Football-Live-Streaming-HD-Free.webp',
    category: 'Sports',
    language: 'English',
    description: 'Malaysian private television channel offering variety sports shows and entertainment programs.'
  },
  {
    id: 'astrobadminton',
    name: 'Astro Badminton TV',
    url: 'https://www.tvmalaysia.live/channel/badminton',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/04/Astro-Badminton-Live-Streaming-HD-Free.webp',
    category: 'Sports',
    language: 'English',
    description: 'Malaysian private television channel offering variety sports shows and entertainment programs.'
  },
  {
    id: 'astrosportsplus',
    name: 'Astro Sports Plus TV',
    url: 'https://www.tvmalaysia.live/channel/sportsplus',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/04/Astro-Arena-Live-Streaming-HD-Free.webp',
    category: 'Sports',
    language: 'English',
    description: 'Malaysian private television channel offering variety sports shows and entertainment programs.'
  },
  {
    id: 'astrocricket',
    name: 'Astro Cricket TV',
    url: 'https://www.tvmalaysia.live/channel/astro-cricket',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/04/Astro-Cricket-Live-Streaming-HD-Free.webp',
    category: 'Sports',
    language: 'English',
    description: 'Malaysian private television channel offering variety sports shows and entertainment programs.'
  },
  {
    id: 'mutv',
    name: 'MUTV',
    url: 'https://www.tvmalaysia.live/channel/mutv',
    logo: 'https://malaysia-tv.net/wp-content/uploads/2025/04/MUTV-Live-Streaming-HD-Free.webp',
    category: 'Sports',
    language: 'English',
    description: 'Malaysian private television channel offering variety sports shows and entertainment programs.'
  },
  {
    id: 'hbo',
    name: 'HBO TV',
    url: 'https://www.tvmalaysia.live/channel/hbo',
    logo: 'https://blob.panzoid.com/creation-thumbnails/665579.jpg',
    category: 'Movies',
    language: 'English',
    description: 'Malaysian private television channel offering variety movies shows and entertainment programs.'
  },
  {
    id: 'hbohits',
    name: 'HBO Hits TV',
    url: 'https://www.tvmalaysia.live/channel/hbo-hits',
    logo: 'https://i.pinimg.com/736x/a4/88/ee/a488ee2e8b3586bd0fcd5bd81f42b842.jpg',
    category: 'Movies',
    language: 'English',
    description: 'Malaysian private television channel offering variety movies shows and entertainment programs.'
  },
  {
    id: 'hbosignature',
    name: 'HBO Signature TV',
    url: 'https://www.tvmalaysia.live/channel/hbo-signature',
    logo: 'https://www.velvet.de/wordpress/wp-content/uploads/2005/design/hbo_signature/projekt_images/velvet_HBO_08-x500.jpg',
    category: 'Movies',
    language: 'English',
    description: 'Malaysian private television channel offering variety movies shows and entertainment programs.'
  },
  {
    id: 'hbofamily',
    name: 'HBO Family TV',
    url: 'https://www.tvmalaysia.live/channel/hbo-family',
    logo: 'https://dj7fdt04hl8tv.cloudfront.net/acm/media/njoi/njoi-apps-acmmasthead-_njoi-acmasthead-hbofamily-656x388.jpg',
    category: 'Movies',
    language: 'English',
    description: 'Malaysian private television channel offering variety movies shows and entertainment programs.'
  },
  {
    id: 'cinemax',
    name: 'Cinemax TV',
    url: 'https://www.tvmalaysia.live/channel/cinemax',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo-cinemax.jpg',
    category: 'Movies',
    language: 'English',
    description: 'Malaysian private television channel offering variety movies shows and entertainment programs.'
  },
  {
    id: 'axn',
    name: 'AXN TV',
    url: 'https://www.tvmalaysia.live/channel/axn',
    logo: 'https://www.axn-asia.com/sites/axn-asia.com/files/ct_custom_page_f_primary_image/AXN_LOGO-620x348.jpg',
    category: 'Movies',
    language: 'English',
    description: 'Malaysian private television channel offering variety movies shows and entertainment programs.'
  },
  {
    id: 'warner',
    name: 'Warner Bros TV',
    url: 'https://www.tvmalaysia.live/channel/warner',
    logo: 'https://orangemagazine.ph/wp-content/uploads/2019/01/Warner-TV.jpg',
    category: 'Movies',
    language: 'English',
    description: 'Malaysian private television channel offering variety movies shows and entertainment programs.'
  },
  {
    id: 'mtv',
    name: 'MTV Live',
    url: 'https://www.tvmalaysia.live/channel/mtv-live-hd',
    logo: 'https://content.osn.com/bob/745x419/MTL.jpg',
    category: 'Musics',
    language: 'English',
    description: 'Malaysian private television channel offering variety musics shows and entertainment programs.'
  }
];

const searchChannels = (query: string): IPTVChannel[] => {
  if (!query || query.trim() === '') {
    return malaysianChannels;
  }

  const searchTerm = query.toLowerCase();
  return malaysianChannels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm) ||
    channel.category.toLowerCase().includes(searchTerm) ||
    channel.language.toLowerCase().includes(searchTerm) ||
    channel.description.toLowerCase().includes(searchTerm)
  );
};

export const IPTVWidget: React.FC<IPTVWidgetProps> = ({ searchQuery, onClose }) => {
  const [channels] = useState<IPTVChannel[]>(searchChannels(searchQuery));
  const [selectedChannel, setSelectedChannel] = useState<IPTVChannel | null>(
    channels.length > 0 ? channels[0] : null
  );
  const [streamingMode, setStreamingMode] = useState<'iframe' | 'newTab'>('iframe');
  const [iframeError, setIframeError] = useState<boolean>(false);

  const openChannel = (channel: IPTVChannel) => {
    window.open(channel.url, '_blank');
  };

  const handleIframeError = () => {
    setIframeError(true);
  };

  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.target as HTMLImageElement;
    const channel = channels.find(ch => img.alt === ch.name);
    if (channel && !img.src.includes('placeholder.com')) {
      // First fallback: try a different logo source
      const fallbackLogos: { [key: string]: string } = {
        'tv1': 'https://i.imgur.com/tv1logo.png',
        'tv2': 'https://i.imgur.com/tv2logo.png',
        'tv3': 'https://i.imgur.com/tv3logo.png',
        'tv8': 'https://i.imgur.com/tv8logo.png',
        'tv9': 'https://i.imgur.com/tv9logo.png'
      };
      
      if (fallbackLogos[channel.id] && !img.src.includes('imgur.com')) {
        img.src = fallbackLogos[channel.id];
      } else {
        // Final fallback: colored placeholder with channel name
        img.src = `https://via.placeholder.com/200x120/${getChannelColor(channel.id)}/ffffff?text=${encodeURIComponent(channel.name)}`;
      }
    }
  };

  const getChannelColor = (channelId: string): string => {
    const colors: { [key: string]: string } = {
      'tv1': 'FF0000',
      'tv2': '0066CC', 
      'tv3': 'FF6600',
      'tv8': '9900CC',
      'tv9': '00CC66'
    };
    return colors[channelId] || '666666';
  };

  return (
    <div className="iptv-backdrop" onClick={onClose}>
      <div className="iptv-widget" onClick={(e) => e.stopPropagation()}>
        <div className="iptv-header">
          <div className="iptv-title">
            <h2>Live TV</h2>
            <div className="search-query">
              {searchQuery ? `Results for: "${searchQuery}"` : 'Malaysian TV Channels'}
            </div>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="iptv-content">
          {selectedChannel && (
            <div className="channel-player">
              <div className="streaming-controls">
                <button 
                  className={`mode-button ${streamingMode === 'iframe' ? 'active' : ''}`}
                  onClick={() => {
                    setStreamingMode('iframe');
                    setIframeError(false);
                  }}
                >
                  🔴 Live Stream
                </button>
                <button 
                  className={`mode-button ${streamingMode === 'newTab' ? 'active' : ''}`}
                  onClick={() => setStreamingMode('newTab')}
                >
                  🌐 Open in Browser
                </button>
              </div>

              {streamingMode === 'iframe' ? (
                <div className="iframe-container">
                  {iframeError ? (
                    <div className="iframe-error">
                      <div className="error-content">
                        <h4>⚠️ Streaming Blocked</h4>
                        <p>This channel cannot be embedded due to CORS restrictions.</p>
                        <button 
                          className="fallback-button"
                          onClick={() => openChannel(selectedChannel)}
                        >
                          📺 Open in New Tab Instead
                        </button>
                      </div>
                    </div>
                  ) : (
                    <iframe
                      src={selectedChannel.url}
                      title={`${selectedChannel.name} Live Stream`}
                      className="stream-iframe"
                      onError={handleIframeError}
                      onLoad={(e) => {
                        // Check if iframe loaded successfully
                        try {
                          const iframe = e.target as HTMLIFrameElement;
                          if (!iframe.contentDocument && !iframe.contentWindow) {
                            handleIframeError();
                          }
                        } catch (error) {
                          handleIframeError();
                        }
                      }}
                      allow="fullscreen; autoplay; encrypted-media"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  )}
                </div>
              ) : (
                <div className="channel-preview">
                  <img 
                    src={selectedChannel.logo} 
                    alt={selectedChannel.name}
                    onError={handleLogoError}
                  />
                  <div className="channel-overlay">
                    <h3>{selectedChannel.name}</h3>
                    <div className="channel-meta">
                      <span className="category">{selectedChannel.category}</span>
                      <span className="language">{selectedChannel.language}</span>
                    </div>
                    <button 
                      className="watch-button"
                      onClick={() => openChannel(selectedChannel)}
                    >
                      📺 Watch Live
                    </button>
                  </div>
                </div>
              )}

              <div className="channel-info">
                <h3>{selectedChannel.name}</h3>
                <p className="category">Category: {selectedChannel.category}</p>
                <p className="language">Language: {selectedChannel.language}</p>
                <p className="description">{selectedChannel.description}</p>
                {streamingMode === 'iframe' && !iframeError && (
                  <p className="streaming-note">
                    🔴 Live streaming directly in widget. If content doesn't load, try "Open in Browser" mode.
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="channel-list">
            <h4>Available Channels</h4>
            {channels.length === 0 ? (
              <div className="no-results">
                No channels found for "{searchQuery}". Try searching for TV1, TV2, TV3, TV8, or TV9.
              </div>
            ) : (
              channels.map((channel) => (
                <div
                  key={channel.id}
                  className={`channel-item ${selectedChannel?.id === channel.id ? 'active' : ''}`}
                  onClick={() => setSelectedChannel(channel)}
                >
                  <img 
                    src={channel.logo} 
                    alt={channel.name} 
                    className="channel-thumbnail"
                    onError={handleLogoError}
                  />
                  <div className="channel-details">
                    <h5>{channel.name}</h5>
                    <p className="category">{channel.category}</p>
                    <p className="language">{channel.language}</p>
                  </div>
                  <div className="channel-actions">
                    <button 
                      className="live-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openChannel(channel);
                      }}
                    >
                      🔴 Live
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
