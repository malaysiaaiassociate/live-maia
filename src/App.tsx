/**
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useRef, useState } from "react";
import "./App.scss";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";

import { Altair } from "./components/altair/Altair";
import ControlTray from "./components/control-tray/ControlTray";
import { AnimatedBackground } from "./components/animated-background/AnimatedBackground";
import { WeatherWidget } from "./components/weather-widget/WeatherWidget";
import { TrafficWidget } from "./components/traffic-widget/TrafficWidget";
import { MapWidget } from "./components/map-widget/MapWidget";
import { YouTubeWidget } from "./components/youtube-widget/YouTubeWidget";
import { NavigationWidget } from './components/navigation-widget/NavigationWidget';
import { SpotifyWidget } from "./components/spotify-widget/SpotifyWidget";
import { IPTVWidget } from "./components/iptv-widget/IPTVWidget";
import { ImageGenerationWidget } from "./components/image-generation-widget/ImageGenerationWidget";
import { MaiaSocialWidget } from "./components/maia-social-widget/MaiaSocialWidget";
import cn from "classnames";
import { LiveClientOptions } from "./types";


const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}

const apiOptions: LiveClientOptions = {
  apiKey: API_KEY,
};

function App() {
  // this video reference is used for displaying the active stream, whether that is the webcam or screen capture
  // feel free to style as you see fit
  const videoRef = useRef<HTMLVideoElement>(null);
  // either the screen capture, the video or null, if null we hide it
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  // weather widget state
  const [showWeatherWidget, setShowWeatherWidget] = useState<boolean>(false);
  const [weatherLocation, setWeatherLocation] = useState<string>("");
  // traffic widget state
  const [showTrafficWidget, setShowTrafficWidget] = useState<boolean>(false);
  const [trafficLocation, setTrafficLocation] = useState<string>("");
  // map widget state
  const [showMapWidget, setShowMapWidget] = useState<boolean>(false);
  const [mapLocation, setMapLocation] = useState<string>("");
  // youtube widget state
  const [showYouTubeWidget, setShowYouTubeWidget] = useState<boolean>(false);
  const [youTubeQuery, setYouTubeQuery] = useState<string>("");
  // spotify widget state
  const [showSpotifyWidget, setShowSpotifyWidget] = useState<boolean>(false);
  const [spotifyQuery, setSpotifyQuery] = useState<string>("");
  // iptv widget state
  const [showIPTVWidget, setShowIPTVWidget] = useState<boolean>(false);
  const [iptvQuery, setIPTVQuery] = useState<string>("");
  // image generation widget state
  const [showImageWidget, setShowImageWidget] = useState<boolean>(false);
  const [imagePrompt, setImagePrompt] = useState<string>("");
  // maia social widget state
  const [showMaiaSocialWidget, setShowMaiaSocialWidget] = useState<boolean>(false);
    // navigation widget state
  const [showNavigationWidget, setShowNavigationWidget] = useState<boolean>(false);
  const [navigationDestination, setNavigationDestination] = useState<string>("");


  return (
    <div className="App">
      <AnimatedBackground />
      <LiveAPIProvider options={apiOptions}>
        <div className="streaming-console">
          <main>
            <div className="main-app-area">
              {/* APP goes here */}
              <Altair 
                onShowWeather={(location: string) => {
                  setWeatherLocation(location);
                  setShowWeatherWidget(true);
                }}
                onShowTraffic={(location: string) => {
                  setTrafficLocation(location);
                  setShowTrafficWidget(true);
                }}
                onShowMap={(location: string) => {
                  setMapLocation(location);
                  setShowMapWidget(true);
                }}
                onShowYouTube={(query: string) => {
                  setYouTubeQuery(query);
                  setShowYouTubeWidget(true);
                }}
                onNavigationRequest={(destination: string) => {
                  setNavigationDestination(destination);
                  setShowNavigationWidget(true);
                }}
                onShowSpotify={(query: string) => {
                  setSpotifyQuery(query);
                  setShowSpotifyWidget(true);
                }}
                onShowIPTV={(query: string) => {
                  setIPTVQuery(query);
                  setShowIPTVWidget(true);
                }}
                onGenerateImage={(prompt: string) => {
                  setImagePrompt(prompt);
                  setShowImageWidget(true);
                }}
                onShowMaiaSocial={() => {
                  setShowMaiaSocialWidget(true);
                }}

              />
              <video
                className={cn("stream", {
                  hidden: !videoRef.current || !videoStream,
                })}
                ref={videoRef}
                autoPlay
                playsInline
              />
            </div>

            <ControlTray
              videoRef={videoRef}
              supportsVideo={true}
              onVideoStreamChange={setVideoStream}
              enableEditingSettings={false}
            >
              {/* put your own buttons here */}
            </ControlTray>
          </main>
        </div>

        {showWeatherWidget && (
          <WeatherWidget 
            location={weatherLocation}
            onClose={() => setShowWeatherWidget(false)}
          />
        )}

        {showTrafficWidget && (
          <TrafficWidget 
            location={trafficLocation}
            onClose={() => setShowTrafficWidget(false)}
          />
        )}

        {showMapWidget && (
          <MapWidget 
            location={mapLocation}
            onClose={() => setShowMapWidget(false)}
          />
        )}

        {showYouTubeWidget && (
          <YouTubeWidget 
            searchQuery={youTubeQuery}
            onClose={() => {
              setShowYouTubeWidget(false);
              setYouTubeQuery('');
            }}
          />
        )}

        {showNavigationWidget && (
          <NavigationWidget 
            destination={navigationDestination}
            onClose={() => {
              setShowNavigationWidget(false);
              setNavigationDestination('');
            }}
          />
        )}

        {showSpotifyWidget && (
          <SpotifyWidget 
            searchQuery={spotifyQuery}
            onClose={() => setShowSpotifyWidget(false)}
          />
        )}

        {showIPTVWidget && (
          <IPTVWidget 
            searchQuery={iptvQuery}
            onClose={() => setShowIPTVWidget(false)}
          />
        )}

        {showImageWidget && (
          <ImageGenerationWidget 
            prompt={imagePrompt}
            onClose={() => {
              setShowImageWidget(false);
              setImagePrompt('');
            }}
          />
        )}

        {showMaiaSocialWidget && (
          <MaiaSocialWidget 
            onClose={() => setShowMaiaSocialWidget(false)}
          />
        )}


      </LiveAPIProvider>
    </div>
  );
}

export default App;
