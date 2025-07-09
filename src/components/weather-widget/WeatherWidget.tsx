
import React, { useState, useEffect } from 'react';
import './weather-widget.scss';

interface WeatherData {
  location: string;
  current: {
    temperature: number;
    condition: string;
    precipitation: number;
    humidity: number;
    wind: number;
    pressure: number;
    icon: string;
    iconUrl: string;
  };
  hourly: Array<{
    time: string;
    temperature: number;
    precipitation: number;
    windSpeed: number;
  }>;
  daily: Array<{
    day: string;
    icon: string;
    iconUrl: string;
    high: number;
    low: number;
  }>;
}

interface WeatherAPIForecastResponse {
  location: {
    name: string;
    country: string;
  };
  current: {
    temp_c: number;
    condition: {
      text: string;
      icon: string;
    };
    humidity: number;
    wind_kph: number;
    precip_mm: number;
    pressure_mb: number;
  };
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        condition: {
          text: string;
          icon: string;
        };
      };
      hour: Array<{
        time: string;
        temp_c: number;
        precip_mm: number;
        wind_kph: number;
        condition: {
          text: string;
          icon: string;
        };
      }>;
    }>;
  };
}

interface WeatherWidgetProps {
  location: string;
  onClose: () => void;
}

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY || 'demo-key'; // Use environment variable
const BASE_URL = 'https://api.weatherapi.com/v1';

const getWeatherIconUrl = (iconUrl: string): string => {
  // WeatherAPI provides icon URLs like //cdn.weatherapi.com/weather/64x64/day/116.png
  // Ensure it has https protocol
  return iconUrl.startsWith('//') ? `https:${iconUrl}` : iconUrl;
};

const getWeatherEmoji = (iconUrl: string): string => {
  // Fallback emoji for cases where image fails to load
  const conditionMap: { [key: string]: string } = {
    'day': '☀️',
    'night': '🌙',
    '116': '🌤️', // Partly cloudy
    '119': '☁️', // Cloudy
    '122': '☁️', // Overcast
    '143': '🌫️', // Mist
    '176': '🌦️', // Patchy rain possible
    '200': '⛈️', // Thundery outbreaks possible
    '296': '🌧️', // Light rain
    '302': '🌧️', // Moderate rain
    '308': '🌧️', // Heavy rain
    '227': '❄️', // Blowing snow
    '230': '🌨️'  // Blizzard
  };
  
  // Extract condition code from icon URL
  const match = iconUrl.match(/\/(\d+)\.png/);
  const code = match ? match[1] : '';
  const timeOfDay = iconUrl.includes('/day/') ? 'day' : 'night';
  
  return conditionMap[code] || conditionMap[timeOfDay] || '🌤️';
};

const fetchWeatherData = async (location: string): Promise<WeatherData> => {
  try {
    // Fetch current weather and 3-day forecast
    const response = await fetch(
      `${BASE_URL}/forecast.json?key=${API_KEY}&q=${encodeURIComponent(location)}&days=8&aqi=no&alerts=no`
    );
    
    if (!response.ok) {
      throw new Error(`WeatherAPI error: ${response.status}`);
    }
    
    const data: WeatherAPIForecastResponse = await response.json();
    
    // Process hourly data (next 8 hours)
    const now = new Date();
    const currentHour = now.getHours();
    const todayForecast = data.forecast.forecastday[0];
    const tomorrowForecast = data.forecast.forecastday[1] || todayForecast;
    
    let hourlyData: Array<{ time: string; temperature: number; precipitation: number; windSpeed: number }> = [];
    
    // Get remaining hours from today
    const todayHours = todayForecast.hour.slice(currentHour);
    // Get hours from tomorrow if needed
    const tomorrowHours = tomorrowForecast.hour;
    
    const allHours = [...todayHours, ...tomorrowHours];
    
    hourlyData = allHours.slice(0, 8).map(hour => {
      const time = new Date(hour.time);
      return {
        time: time.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          hour12: true 
        }),
        temperature: Math.round(hour.temp_c),
        precipitation: hour.precip_mm || 0,
        windSpeed: hour.wind_kph || 0
      };
    });
    
    // Process daily data
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dailyData = data.forecast.forecastday.map(day => {
      const date = new Date(day.date);
      return {
        day: days[date.getDay()],
        icon: getWeatherEmoji(day.day.condition.icon),
        iconUrl: getWeatherIconUrl(day.day.condition.icon),
        high: Math.round(day.day.maxtemp_c),
        low: Math.round(day.day.mintemp_c)
      };
    });
    
    return {
      location: `${data.location.name}, ${data.location.country}`,
      current: {
        temperature: Math.round(data.current.temp_c),
        condition: data.current.condition.text,
        precipitation: Math.round(data.current.precip_mm),
        humidity: data.current.humidity,
        wind: Math.round(data.current.wind_kph),
        pressure: Math.round(data.current.pressure_mb),
        icon: getWeatherEmoji(data.current.condition.icon),
        iconUrl: getWeatherIconUrl(data.current.condition.icon)
      },
      hourly: hourlyData,
      daily: dailyData
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    // Fallback to mock data if API fails
    throw error;
  }
};

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ location, onClose }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'temperature' | 'precipitation' | 'wind'>('temperature');

  useEffect(() => {
    const loadWeatherData = async () => {
      if (!location) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const data = await fetchWeatherData(location);
        setWeatherData(data);
      } catch (err) {
        console.error('Failed to fetch weather data:', err);
        setError('Failed to load weather data. Please try again.');
        
        // Fallback to a simple mock for demo purposes
        setWeatherData({
          location: location,
          current: {
            temperature: 25,
            condition: 'Weather data unavailable',
            precipitation: 0,
            humidity: 50,
            wind: 10,
            pressure: 1013,
            icon: '🌤️',
            iconUrl: ''
          },
          hourly: Array.from({ length: 8 }, (_, i) => ({
            time: `${6 + i * 3}:00`,
            temperature: 25 + (i % 3) - 1,
            precipitation: Math.random() * 3,
            windSpeed: 10 + Math.random() * 20
          })),
          daily: Array.from({ length: 8 }, (_, i) => ({
            day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i],
            icon: '🌤️',
            iconUrl: '',
            high: 28,
            low: 22
          }))
        });
      } finally {
        setLoading(false);
      }
    };

    loadWeatherData();
  }, [location]);

  if (loading || !weatherData) {
    return (
      <div className="weather-backdrop" onClick={onClose}>
        <div className="weather-widget loading" onClick={(e) => e.stopPropagation()}>
          <div className="weather-header">
            <h2>Weather</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="loading-spinner">
            {loading ? 'Loading weather data...' : 'No weather data available'}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="weather-backdrop" onClick={onClose}>
        <div className="weather-widget error" onClick={(e) => e.stopPropagation()}>
          <div className="weather-header">
            <h2>Weather</h2>
            <button className="close-button" onClick={onClose}>×</button>
          </div>
          <div className="error-message">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const maxTemp = Math.max(...weatherData.hourly.map(h => h.temperature));
  const minTemp = Math.min(...weatherData.hourly.map(h => h.temperature));

  return (
    <div className="weather-backdrop" onClick={onClose}>
      <div className="weather-widget" onClick={(e) => e.stopPropagation()}>
        <div className="weather-header">
          <div className="weather-title">
            <h2>Weather</h2>
            <div className="weather-day">
              Tuesday<br />
              <span className="weather-condition">{weatherData.current.condition}</span>
            </div>
          </div>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="weather-current">
          <div className="current-temp">
            <div className="temp-icon">
              {weatherData.current.iconUrl ? (
                <img 
                  src={weatherData.current.iconUrl} 
                  alt={weatherData.current.condition}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'inline';
                  }}
                />
              ) : null}
              <span style={{ display: weatherData.current.iconUrl ? 'none' : 'inline' }}>
                {weatherData.current.icon}
              </span>
            </div>
            <span className="temp-value">{weatherData.current.temperature}°C</span>
          </div>
          <div className="current-details">
            <div>Wind: {weatherData.current.wind} kmph</div>
            <div>Precip: {weatherData.current.precipitation} mm</div>
            <div>Pressure: {weatherData.current.pressure} mb</div>
          </div>
        </div>

        <div className="weather-tabs">
          <button 
            className={`tab ${activeTab === 'temperature' ? 'active' : ''}`}
            onClick={() => setActiveTab('temperature')}
          >
            Temperature
          </button>
          <button 
            className={`tab ${activeTab === 'precipitation' ? 'active' : ''}`}
            onClick={() => setActiveTab('precipitation')}
          >
            Precipitation
          </button>
          <button 
            className={`tab ${activeTab === 'wind' ? 'active' : ''}`}
            onClick={() => setActiveTab('wind')}
          >
            Wind
          </button>
        </div>

        <div className="weather-chart">
          {activeTab === 'temperature' && (
            <>
              <svg viewBox="0 0 400 100" className="temperature-chart">
                <defs>
                  <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffd700" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#ffd700" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                <path
                  d={weatherData.hourly.map((point, index) => {
                    const x = (index / (weatherData.hourly.length - 1)) * 380 + 10;
                    const y = 80 - ((point.temperature - minTemp) / (maxTemp - minTemp)) * 60;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  stroke="#ffd700"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d={weatherData.hourly.map((point, index) => {
                    const x = (index / (weatherData.hourly.length - 1)) * 380 + 10;
                    const y = 80 - ((point.temperature - minTemp) / (maxTemp - minTemp)) * 60;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ') + ' L 390 80 L 10 80 Z'}
                  fill="url(#tempGradient)"
                />
                {weatherData.hourly.map((point, index) => {
                  const x = (index / (weatherData.hourly.length - 1)) * 380 + 10;
                  const y = 80 - ((point.temperature - minTemp) / (maxTemp - minTemp)) * 60;
                  return (
                    <g key={index}>
                      <circle cx={x} cy={y} r="2" fill="#ffd700" />
                      <text x={x} y={y - 8} textAnchor="middle" fontSize="10" fill="#fff">
                        {point.temperature}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="chart-labels">
                {weatherData.hourly.map((point, index) => (
                  <span key={index}>{point.time}</span>
                ))}
              </div>
            </>
          )}

          {activeTab === 'precipitation' && (
            <>
              <svg viewBox="0 0 400 100" className="precipitation-chart">
                <defs>
                  <linearGradient id="precipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#4FC3F7" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#4FC3F7" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                {weatherData.hourly.map((point, index) => {
                  const x = (index / weatherData.hourly.length) * 380 + 10;
                  const precipValue = point.precipitation;
                  const maxPrecip = Math.max(...weatherData.hourly.map(h => h.precipitation), 5);
                  const barHeight = (precipValue / maxPrecip) * 60;
                  return (
                    <g key={index}>
                      <rect
                        x={x - 10}
                        y={80 - barHeight}
                        width="20"
                        height={barHeight}
                        fill="url(#precipGradient)"
                        stroke="#4FC3F7"
                        strokeWidth="1"
                      />
                      <text x={x} y={75 - barHeight} textAnchor="middle" fontSize="10" fill="#fff">
                        {precipValue.toFixed(1)}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="chart-labels">
                {weatherData.hourly.map((point, index) => (
                  <span key={index}>{point.time}</span>
                ))}
              </div>
            </>
          )}

          {activeTab === 'wind' && (
            <>
              <svg viewBox="0 0 400 100" className="wind-chart">
                <defs>
                  <linearGradient id="windGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#81C784" stopOpacity="0.8"/>
                    <stop offset="100%" stopColor="#81C784" stopOpacity="0.1"/>
                  </linearGradient>
                </defs>
                <path
                  d={weatherData.hourly.map((point, index) => {
                    const x = (index / (weatherData.hourly.length - 1)) * 380 + 10;
                    const maxWind = Math.max(...weatherData.hourly.map(h => h.windSpeed), 35);
                    const y = 80 - (point.windSpeed / maxWind) * 60;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ')}
                  stroke="#81C784"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d={weatherData.hourly.map((point, index) => {
                    const x = (index / (weatherData.hourly.length - 1)) * 380 + 10;
                    const maxWind = Math.max(...weatherData.hourly.map(h => h.windSpeed), 35);
                    const y = 80 - (point.windSpeed / maxWind) * 60;
                    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                  }).join(' ') + ' L 390 80 L 10 80 Z'}
                  fill="url(#windGradient)"
                />
                {weatherData.hourly.map((point, index) => {
                  const x = (index / (weatherData.hourly.length - 1)) * 380 + 10;
                  const maxWind = Math.max(...weatherData.hourly.map(h => h.windSpeed), 35);
                  const y = 80 - (point.windSpeed / maxWind) * 60;
                  return (
                    <g key={index}>
                      <circle cx={x} cy={y} r="2" fill="#81C784" />
                      <text x={x} y={y - 8} textAnchor="middle" fontSize="10" fill="#fff">
                        {point.windSpeed.toFixed(0)}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="chart-labels">
                {weatherData.hourly.map((point, index) => (
                  <span key={index}>{point.time}</span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="weather-forecast">
          {weatherData.daily.map((day, index) => (
            <div key={index} className="forecast-day">
              <div className="day-name">{day.day}</div>
              <div className="day-icon">
                {day.iconUrl ? (
                  <img 
                    src={day.iconUrl} 
                    alt="Weather icon"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'inline';
                    }}
                  />
                ) : null}
                <span style={{ display: day.iconUrl ? 'none' : 'inline' }}>
                  {day.icon}
                </span>
              </div>
              <div className="day-temps">
                <span className="high">{day.high}°</span>
                <span className="low">{day.low}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
