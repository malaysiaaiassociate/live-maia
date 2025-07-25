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

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GenAILiveClient } from "../lib/genai-live-client";
import { LiveClientOptions } from "../types";
import { AudioStreamer } from "../lib/audio-streamer";
import { audioContext } from "../lib/utils";
import VolMeterWorket from "../lib/worklets/vol-meter";
import { LiveConnectConfig } from "@google/genai";

const AI_INACTIVITY_TIMEOUT = 3 * 60 * 1000; // 3 minutes in milliseconds

export type UseLiveAPIResults = {
  client: GenAILiveClient;
  setConfig: (config: LiveConnectConfig) => void;
  config: LiveConnectConfig;
  model: string;
  setModel: (model: string) => void;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  volume: number;
};

export function useLiveAPI(options: LiveClientOptions): UseLiveAPIResults {
  const client = useMemo(() => new GenAILiveClient(options), [options]);
  const audioStreamerRef = useRef<AudioStreamer | null>(null);
  const inactivityTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [model, setModel] = useState<string>("models/gemini-2.0-flash-exp");
  const [config, setConfig] = useState<LiveConnectConfig>({});
  const [connected, setConnected] = useState(false);
  const [volume, setVolume] = useState(0);

  // Inactivity timeout management
  const startInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
    }
    
    inactivityTimeoutRef.current = setTimeout(() => {
      console.log("AI inactivity timeout reached - disconnecting");
      client.disconnect();
      setConnected(false);
    }, AI_INACTIVITY_TIMEOUT);
  }, [client]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimeoutRef.current) {
      clearTimeout(inactivityTimeoutRef.current);
      inactivityTimeoutRef.current = null;
    }
  }, []);

  // register audio for streaming server -> speakers
  useEffect(() => {
    if (!audioStreamerRef.current) {
      audioContext({ id: "audio-out" }).then((audioCtx: AudioContext) => {
        audioStreamerRef.current = new AudioStreamer(audioCtx);
        audioStreamerRef.current
          .addWorklet<any>("vumeter-out", VolMeterWorket, (ev: any) => {
            setVolume(ev.data.volume);
          })
          .then(() => {
            // Successfully added worklet
          });
      });
    }
  }, [audioStreamerRef]);

  useEffect(() => {
    const onOpen = () => {
      setConnected(true);
      startInactivityTimer(); // Start timer when connection opens
    };

    const onClose = () => {
      setConnected(false);
      resetInactivityTimer(); // Clear timer when connection closes
    };

    const onError = (error: ErrorEvent) => {
      console.error("error", error);
      resetInactivityTimer(); // Clear timer on error
    };

    const stopAudioStreamer = () => {
      audioStreamerRef.current?.stop();
      resetInactivityTimer(); // Reset timer when interrupted
      startInactivityTimer(); // Start new timer after interruption
    };

    const onAudio = (data: ArrayBuffer) => {
      audioStreamerRef.current?.addPCM16(new Uint8Array(data));
      resetInactivityTimer(); // Reset timer on AI audio activity
      startInactivityTimer(); // Start new timer
    };

    const onContent = () => {
      resetInactivityTimer(); // Reset timer on AI content activity
      startInactivityTimer(); // Start new timer
    };

    const onSetupComplete = () => {
      resetInactivityTimer(); // Reset timer on setup complete
      startInactivityTimer(); // Start new timer
    };

    const onTurnComplete = () => {
      resetInactivityTimer(); // Reset timer when AI turn completes
      startInactivityTimer(); // Start new timer for next response
    };

    client
      .on("error", onError)
      .on("open", onOpen)
      .on("close", onClose)
      .on("interrupted", stopAudioStreamer)
      .on("audio", onAudio)
      .on("content", onContent)
      .on("setupcomplete", onSetupComplete)
      .on("turncomplete", onTurnComplete);

    return () => {
      resetInactivityTimer(); // Clear timer on cleanup
      client
        .off("error", onError)
        .off("open", onOpen)
        .off("close", onClose)
        .off("interrupted", stopAudioStreamer)
        .off("audio", onAudio)
        .off("content", onContent)
        .off("setupcomplete", onSetupComplete)
        .off("turncomplete", onTurnComplete)
        .disconnect();
    };
  }, [client, startInactivityTimer, resetInactivityTimer]);

  const connect = useCallback(async () => {
    if (!config) {
      throw new Error("config has not been set");
    }
    resetInactivityTimer(); // Clear any existing timer
    client.disconnect();
    await client.connect(model, config);
  }, [client, config, model, resetInactivityTimer]);

  const disconnect = useCallback(async () => {
    resetInactivityTimer(); // Clear timer when manually disconnecting
    client.disconnect();
    setConnected(false);
  }, [setConnected, client, resetInactivityTimer]);

  return {
    client,
    config,
    setConfig,
    model,
    setModel,
    connected,
    connect,
    disconnect,
    volume,
  };
}
