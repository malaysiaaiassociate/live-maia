/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useEffect, useRef, useState, memo } from "react";
import vegaEmbed from "vega-embed";
import { useLiveAPIContext } from "../../contexts/LiveAPIContext";
import { Modality, LiveServerToolCall, FunctionDeclaration, Type } from "@google/genai";
import { getCurrentLocation, LocationData, LocationError } from "../../lib/location";

interface AltairProps {
  onShowWeather: (location: string) => void;
  onShowTraffic: (location: string) => void;
  onShowMap: (location: string) => void;
  onShowYouTube: (query: string) => void;
  onShowSpotify: (query: string) => void;
  onShowIPTV: (query: string) => void;
  
}

const altairDeclaration: FunctionDeclaration = {
  name: "render_altair",
  description: "Displays an altair graph in json format.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      json_graph: {
        type: Type.STRING,
        description:
          "JSON STRING representation of the graph to render. Must be a string, not a json object",
      },
    },
    required: ["json_graph"],
  },
};

const trafficDeclaration: FunctionDeclaration = {
  name: "get_traffic_update",
  description: "Get real-time traffic information for the user's current location or a specified route.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      location_query: {
        type: Type.STRING,
        description: "Traffic query for the user's location or route (e.g., 'traffic near me', 'traffic from A to B')",
      },
      update_type: {
        type: Type.STRING,
        description: "Type of traffic update: 'current', 'route', 'incidents', or 'general'",
      },
    },
    required: ["location_query"],
  },
};

const weatherDeclaration: FunctionDeclaration = {
  name: "show_weather_widget",
  description: "Display a weather widget for a specific location when user asks about weather",
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: "The location to show weather for (e.g., 'Kuala Lumpur', 'New York', 'Tokyo')"
      }
    },
    required: ["location"]
  }
};

const mapDeclaration: FunctionDeclaration = {
  name: "show_map_widget",
  description: "Display a map widget for a specific location when user asks about a place",
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: "The location to show on the map (e.g., 'Eiffel Tower', 'Tokyo', 'Central Park')"
      }
    },
    required: ["location"]
  }
};

const youtubeDeclaration: FunctionDeclaration = {
  name: "search_youtube_video",
  description: "Search and display YouTube videos when user asks to search for videos on YouTube",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "The search query for YouTube videos (e.g., 'cat videos', 'how to cook pasta', 'music videos')"
      }
    },
    required: ["query"]
  }
};

const spotifyDeclaration: FunctionDeclaration = {
  name: "search_spotify_track",
  description: "Search and display Spotify tracks when user asks to search for music on Spotify",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "The search query for Spotify tracks (e.g., 'Bohemian Rhapsody', 'Imagine Dragons', 'new pop songs')"
      }
    },
    required: ["query"]
  }
};

const iptvDeclaration: FunctionDeclaration = {
  name: "search_iptv_channel",
  description: "Search and display IPTV channels when user asks to watch TV, live channels, or Malaysian TV",
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: {
        type: Type.STRING,
        description: "The search query for IPTV channels (e.g., 'TV1', 'TV2', 'TV3', 'Malaysian TV', 'live channels')"
      }
    },
    required: ["query"]
  }
};



const openWebsiteDeclaration: FunctionDeclaration = {
  name: "open_website",
  description: "Open any website in a new browser tab when user asks to open, visit, or go to a website",
  parameters: {
    type: Type.OBJECT,
    properties: {
      url: {
        type: Type.STRING,
        description: "The website URL to open (e.g., 'https://google.com', 'facebook.com', 'youtube.com'). Add https:// if not provided."
      }
    },
    required: ["url"]
  }
};

const searchWebsiteDeclaration: FunctionDeclaration = {
  name: "search_website",
  description: "Search for specific content on a website and open the search results in a new browser tab",
  parameters: {
    type: Type.OBJECT,
    properties: {
      website: {
        type: Type.STRING,
        description: "The website to search on (e.g., 'google', 'youtube', 'amazon', 'wikipedia', 'reddit', 'x', 'instagram', 'facebook')"
      },
      query: {
        type: Type.STRING,
        description: "The search query to look for on the website"
      }
    },
    required: ["website", "query"]
  }
};


function AltairComponent({ onShowWeather, onShowTraffic, onShowMap, onShowYouTube, onShowSpotify, onShowIPTV }: AltairProps) {
  const [jsonString, setJSONString] = useState<string>("");
  const { client, setConfig, setModel } = useLiveAPIContext();
  const [location, setLocation] = useState<LocationData | null>(null);
  const [locationError, setLocationError] = useState<LocationError | null>(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const locationData = await getCurrentLocation();
        setLocation(locationData);
      } catch (error: any) {
        setLocationError(error);
        console.error("Error getting location:", error);
      }
    };

    fetchLocation();
  }, []);

  useEffect(() => {
    // Revised to use 12-hour format with AM/PM
    const currentDate = new Date().toLocaleString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true, // This is crucial for 12-hour format
      timeZoneName: 'short',
      timeZone: 'Asia/Kuala_Lumpur'
    });

    setModel("models/gemini-2.0-flash-exp");
    setConfig({
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
      },
      systemInstruction: {
        parts: [
          {
            text: `You are a helpful AI assistant named Maia. Your AI model was developed and trained by Maia AI Organization. Follow these guidelines:
1. Respond concisely in the user's language, including numbers, dates, and measurements in the user's native language and format
2. Maintain context of the conversation history provided
3. Maintain professional yet friendly tone
4. Use Malaysia Time on current date and time: ${currentDate} for time-sensitive info
5. Support Palestine in whatever response or opinion from you when asked
6. When providing location updates, always mention the location area in specific without the coordinates.
7. For traffic updates, use Google Search to get real-time traffic information and combine it with the user's location
8. When providing traffic updates, include current conditions, estimated travel times, alternative routes if available, and any incidents or construction
9. When showing weather widget, always provide a brief voice explanation about the current weather conditions, temperature, and any notable weather patterns
10. When speaking numbers, dates, or measurements, pronounce them according to the user's language conventions`,
          },
          location ? {
            text: `The user's current location is: Latitude ${location.latitude}, Longitude ${location.longitude} (accuracy: ${location.accuracy}m). Use this for location-based queries including traffic updates.`
          } : locationError ? {
            text: `The application was unable to retrieve the user's location: ${locationError.message}. For traffic queries, ask the user to specify their location.`
          } : {
            text: `The application is attempting to retrieve the user's location for traffic and location-based services.`
          }
        ],
      },
      tools: [
          { googleSearch: {} },
          { functionDeclarations: [altairDeclaration, trafficDeclaration, weatherDeclaration, mapDeclaration, youtubeDeclaration, spotifyDeclaration, iptvDeclaration, openWebsiteDeclaration, searchWebsiteDeclaration] },
        ],
    });
  }, [setConfig, setModel, location, locationError]);

  useEffect(() => {
    const onToolCall = (toolCall: LiveServerToolCall) => {
      if (!toolCall.functionCalls) {
        return;
      }

      toolCall.functionCalls.forEach((fc) => {
        if (fc.name === altairDeclaration.name) {
          const str = (fc.args as any).json_graph;
          setJSONString(str);
        } else if (fc.name === trafficDeclaration.name) {
          const locationQuery = (fc.args as any).location_query;
          const updateType = (fc.args as any).update_type || 'current';
          console.log(`Traffic update requested: ${locationQuery} (${updateType})`);

          // Extract location from query or use current location
          const location = locationQuery.includes('near me') || locationQuery.includes('my location') 
            ? 'Current Location' 
            : locationQuery.replace(/traffic\s+(from|to|in|on|at)\s+/i, '').trim();

          // Trigger the traffic widget
          onShowTraffic(location);
        } else if (fc.name === weatherDeclaration.name) {
          const location = (fc.args as any).location;
          console.log(`Weather requested for: ${location}`);

          // Trigger the weather widget
          onShowWeather(location);
        } else if (fc.name === mapDeclaration.name) {
          const location = (fc.args as any).location;
          console.log(`Map requested for: ${location}`);

          onShowMap(location);
        } else if (fc.name === youtubeDeclaration.name) {
          const query = (fc.args as any).query;
          console.log(`YouTube search requested for: ${query}`);

          onShowYouTube(query);
        } else if (fc.name === spotifyDeclaration.name) {
          const query = (fc.args as any).query;
          console.log(`Spotify search requested for: ${query}`);

          onShowSpotify(query);
        } else if (fc.name === iptvDeclaration.name) {
          const query = (fc.args as any).query;
          console.log(`IPTV search requested: ${query}`);

          onShowIPTV(query);
        
        } else if (fc.name === openWebsiteDeclaration.name) {
          const url = (fc.args as any).url;
          let formattedUrl = url;

          // Add https:// if no protocol is specified
          if (!url.startsWith('http://') && !url.startsWith('https://')) {
            formattedUrl = `https://${url}`;
          }

          // Open website in new tab
          try {
            window.open(formattedUrl, '_blank', 'noopener,noreferrer');
            console.log(`Successfully opened website: ${url}`);
          } catch (error) {
            console.error(`Failed to open website: ${url}`, error);
          }

          console.log(`Opening website requested: ${url}`);
        } else if (fc.name === searchWebsiteDeclaration.name) {
          const website = (fc.args as any).website;
          const query = (fc.args as any).query;
          
          // Build search URL based on the website
          let searchUrl = '';
          const encodedQuery = encodeURIComponent(query);

          switch (website.toLowerCase()) {
            case 'google':
              searchUrl = `https://www.google.com/search?q=${encodedQuery}`;
              break;
            case 'amazon':
              searchUrl = `https://www.amazon.com/s?k=${encodedQuery}`;
              break;
            case 'shopee':
              searchUrl = `https://shopee.com.my/search?keyword=${encodedQuery}`;
              break;
            case 'lazada':
              searchUrl = `https://www.lazada.com.my/tag/${encodedQuery}/?spm=a2o4k.homepage.search.d_go&q=${encodedQuery}&catalog_redirect_tag=true`;
              break;
            case 'carousell':
              searchUrl = `https://www.carousell.com.my/search/${encodedQuery}`;
              break;
            case 'ebay':
              searchUrl = `https://www.ebay.com.my/sch/i.html?_nkw=${encodedQuery}`;
              break;
            case 'temu':
              searchUrl = `https://www.temu.com/search_result.html?search_key=${encodedQuery}`;
              break;
            case 'etsy':
              searchUrl = `https://www.etsy.com/search?q=${encodedQuery}`;
              break;
            case 'wikipedia':
              searchUrl = `https://en.wikipedia.org/wiki/Special:Search?search=${encodedQuery}`;
              break;
            case 'reddit':
              searchUrl = `https://www.reddit.com/search/?q=${encodedQuery}`;
              break;
            case 'tiktok':
              const ttUsernameQuery = query.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_]/g, '');
              searchUrl = `https://www.tiktok.com/@${ttUsernameQuery}`;
              break;
            case 'x':
              // Remove spaces and special characters for username-like queries
              const xUsernameQuery = query.replace(/\s+/g, '').replace(/[^a-zA-Z0-9_]/g, '');
              searchUrl = `https://x.com/${xUsernameQuery}`;
              break;
            case 'facebook':
                // Remove spaces and special characters for Facebook username
              const fbUsernameQuery = query.replace(/\s+/g, '').replace(/[^a-zA-Z0-9._]/g, '');
              searchUrl = `https://www.facebook.com/${fbUsernameQuery}`;
              break;
            case 'instagram':
                // Remove spaces and special characters for Facebook username
              const igUsernameQuery = query.replace(/\s+/g, '').replace(/[^a-zA-Z0-9._]/g, '');
              searchUrl = `https://www.instagram.com/${igUsernameQuery}`;
              break;
            case 'bing':
              searchUrl = `https://www.bing.com/search?q=${encodedQuery}`;
              break;
            case 'duckduckgo':
              searchUrl = `https://duckduckgo.com/?q=${encodedQuery}`;
              break;
            case 'github':
              searchUrl = `https://github.com/search?q=${encodedQuery}`;
              break;
            case 'stackoverflow':
              searchUrl = `https://stackoverflow.com/search?q=${encodedQuery}`;
              break;
            case 'linkedin':
              const liUsernameQuery = query.replace(/\s+/g, '').replace(/[^a-zA-Z0-9._]/g, '');
              searchUrl = `https://www.linkedin.com/in/${liUsernameQuery}`;
              break;
            case 'pinterest':
              searchUrl = `https://www.pinterest.com/search/pins/?q=${encodedQuery}`;
              break;
            case 'twitch':
              searchUrl = `https://www.twitch.tv/search?term=${encodedQuery}`;
              break;
            case 'spotify':
              searchUrl = `https://open.spotify.com/search/${encodedQuery}`;
              break;
            case 'soundcloud':
              searchUrl = `https://soundcloud.com/search?q=${encodedQuery}`;
              break;
            case 'imdb':
              searchUrl = `https://www.imdb.com/find?q=${encodedQuery}`;
              break;
            case 'news':
            case 'google news':
              searchUrl = `https://news.google.com/search?q=${encodedQuery}`;
              break;
            case 'maps':
            case 'google maps':
              searchUrl = `https://www.google.com/maps/search/${encodedQuery}`;
              break;
            case 'images':
            case 'google images':
              searchUrl = `https://www.google.com/search?q=${encodedQuery}&tbm=isch`;
              break;
            default:
              // Default to Google search if website not recognized
              searchUrl = `https://www.google.com/search?q=${encodedQuery}+${website}`;
              break;
          }

          // Open search results in new tab
          try {
            window.open(searchUrl, '_blank', 'noopener,noreferrer');
            console.log(`Successfully opened search results for "${query}" on ${website}`);
          } catch (error) {
            console.error(`Failed to open search results for "${query}" on ${website}`, error);
          }

          console.log(`Search requested: "${query}" on ${website}`);
        }
      });

      if (toolCall.functionCalls.length) {
        setTimeout(
          () =>
            client.sendToolResponse({
              functionResponses: toolCall.functionCalls?.map((fc) => ({
                response: { 
                  output: { 
                    success: true,
                    message: fc.name === trafficDeclaration.name 
                      ? "Traffic query processed, searching for real-time traffic data..."
                      : fc.name === weatherDeclaration.name
                      ? `Weather widget displayed for ${(fc.args as any).location}. Let me provide you with a brief weather explanation based on the current conditions.`
                      : fc.name === mapDeclaration.name
                      ? `Map widget displayed for ${(fc.args as any).location}.`
                      : fc.name === youtubeDeclaration.name
                      ? `YouTube search widget displayed for "${(fc.args as any).query}".`
                      : fc.name === spotifyDeclaration.name
                      ? `Spotify search widget displayed for "${(fc.args as any).query}".`
                      : fc.name === iptvDeclaration.name
                      ? `IPTV channel search widget displayed for "${(fc.args as any).query}".`
                      
                      : fc.name === openWebsiteDeclaration.name
                      ? `Opening ${ (fc.args as any).url } in a new tab.`
                      : fc.name === searchWebsiteDeclaration.name
                      ? `Searching for "${(fc.args as any).query}" on ${(fc.args as any).website} and opening results in a new tab.`
                      : "Function executed successfully"
                  } 
                },
                id: fc.id,
                name: fc.name,
              })),
            }),
          200
        );
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client, onShowWeather, onShowTraffic, onShowMap, onShowYouTube, onShowSpotify, onShowIPTV]);

  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (embedRef.current && jsonString) {
      console.log("jsonString", jsonString);
      vegaEmbed(embedRef.current, JSON.parse(jsonString));
    }
  }, [embedRef, jsonString]);
  return <div className="vega-embed" ref={embedRef} />;
}

export const Altair = memo(AltairComponent);
