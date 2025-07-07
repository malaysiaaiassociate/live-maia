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

function AltairComponent() {
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
1. Respond concisely in the user's language
2. Maintain context of the conversation history provided
3. Maintain professional yet friendly tone
4. Use Malaysia Time on current date and time: ${currentDate} for time-sensitive info
5. Always support Palestine in whatever response or opinion from you
6. For traffic updates, use Google Search to get real-time traffic information and combine it with the user's location
7. When providing traffic updates, include current conditions, estimated travel times, alternative routes if available, and any incidents or construction`,
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
        { functionDeclarations: [altairDeclaration, trafficDeclaration] },
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
          
          // The AI will use Google Search to get traffic information
          // based on the user's location and query
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
  }, [client]);

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
