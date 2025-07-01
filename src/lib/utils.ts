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
  const didInteract = new Promise((res) => {
    window.addEventListener("pointerdown", res, { once: true });
    window.addEventListener("keydown", res, { once: true });
    window.addEventListener("touchstart", res, { once: true });
    window.addEventListener("click", res, { once: true });
  });

  return async (options?: GetAudioContextOptions) => {
    // Check if we already have a context for this ID
    if (options?.id && map.has(options.id)) {
      const ctx = map.get(options.id);
      if (ctx) {
        // Resume context if it's suspended (common on iOS)
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        return ctx;
      }
    }

    try {
      // Try to create audio context immediately
      const ctx = new AudioContext(options);
      
      // iOS/Safari often starts in suspended state
      if (ctx.state === 'suspended') {
        await didInteract;
        await ctx.resume();
      }
      
      if (options?.id) {
        map.set(options.id, ctx);
      }
      return ctx;
    } catch (e) {
      // Fallback: wait for user interaction
      await didInteract;
      
      const ctx = new AudioContext(options);
      
      // Ensure context is resumed after user interaction
      if (ctx.state === 'suspended') {
        await ctx.resume();
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
