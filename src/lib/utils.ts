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

export type GetAudioContextOptions = AudioContextOptions & {
  id?: string;
};

const map: Map<string, AudioContext> = new Map();

export const audioContext: (
  options?: GetAudioContextOptions
) => Promise<AudioContext> = (() => {
  // Detect iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  let userInteracted = false;
  const didInteract = new Promise<void>((res) => {
    const handleInteraction = () => {
      userInteracted = true;
      res();
    };

    window.addEventListener("pointerdown", handleInteraction, { once: true });
    window.addEventListener("keydown", handleInteraction, { once: true });
    window.addEventListener("touchstart", handleInteraction, { once: true });
    window.addEventListener("click", handleInteraction, { once: true });
    window.addEventListener("touchend", handleInteraction, { once: true });
  });

  return async (options?: GetAudioContextOptions) => {
    // Check if we already have a context for this ID
    if (options?.id && map.has(options.id)) {
      const ctx = map.get(options.id);
      if (ctx) {
        // For iOS, ensure we have user interaction before resuming
        if (ctx.state === 'suspended') {
          if (isIOS && !userInteracted) {
            await didInteract;
          }
          try {
            await ctx.resume();
          } catch (error) {
            console.warn('Failed to resume audio context:', error);
          }
        }
        return ctx;
      }
    }

    // For iOS, always wait for user interaction before creating audio context
    if (isIOS && !userInteracted) {
      await didInteract;
    }

    try {
      const ctx = new AudioContext(options);

      // Handle suspended state
      if (ctx.state === 'suspended') {
        if (!userInteracted) {
          await didInteract;
        }
        try {
          await ctx.resume();
        } catch (error) {
          console.warn('Failed to resume audio context:', error);
        }
      }

      if (options?.id) {
        map.set(options.id, ctx);
      }
      return ctx;
    } catch (e) {
      console.error('Failed to create audio context:', e);
      // Fallback: ensure user interaction
      if (!userInteracted) {
        await didInteract;
      }

      const ctx = new AudioContext(options);

      // Ensure context is resumed after user interaction
      if (ctx.state === 'suspended') {
        try {
          await ctx.resume();
        } catch (error) {
          console.warn('Failed to resume audio context in fallback:', error);
        }
      }

      if (options?.id) {
        map.set(options.id, ctx);
      }
      return ctx;
    }
  };
})();

export function base64ToArrayBuffer(base64: string) {
  var binaryString = atob(base64);
  var bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
