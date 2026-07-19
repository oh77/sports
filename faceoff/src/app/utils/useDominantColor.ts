'use client';

import { useEffect, useState } from 'react';

export type RGB = { r: number; g: number; b: number };

/** CSS `rgba()` string for a color at the given alpha. */
export const rgba = (c: RGB, a: number) => `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;

/** Mix a color toward white by `t` (0..1). */
export const lighten = (c: RGB, t: number): RGB => ({
  r: Math.round(c.r + (255 - c.r) * t),
  g: Math.round(c.g + (255 - c.g) * t),
  b: Math.round(c.b + (255 - c.b) * t),
});

// Extraction is idempotent per URL: cache results and de-dupe in-flight loads so
// re-renders and repeated logos don't re-sample.
const cache = new Map<string, RGB | null>();
const inflight = new Map<string, Promise<RGB | null>>();

/**
 * Route the sample through Next's image optimizer, which is same-origin. That
 * keeps the canvas untainted regardless of the logo host's CORS headers.
 */
function sampleUrl(url: string): string {
  return `/_next/image?url=${encodeURIComponent(url)}&w=64&q=75`;
}

/** Pick the most prominent vibrant color from an image, or null if it has none. */
function extractColor(img: HTMLImageElement): RGB | null {
  const size = 32;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, size, size);

  let data: Uint8ClampedArray;
  try {
    data = ctx.getImageData(0, 0, size, size).data;
  } catch {
    return null; // tainted canvas (shouldn't happen via the optimizer)
  }

  // Bucket colors into coarse bins, skipping transparent / near-white / near-
  // black / low-saturation pixels so backgrounds and outlines don't dominate.
  const buckets = new Map<
    string,
    { r: number; g: number; b: number; n: number }
  >();
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < 128) continue;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const light = (max + min) / 510; // 0..1
    if (light > 0.92 || light < 0.08) continue;
    const sat = max === 0 ? 0 : (max - min) / max;
    if (sat < 0.18) continue;
    const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
    const bucket = buckets.get(key) ?? { r: 0, g: 0, b: 0, n: 0 };
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    bucket.n += 1;
    buckets.set(key, bucket);
  }

  let best: RGB | null = null;
  let bestWeight = -1;
  for (const bucket of buckets.values()) {
    const r = bucket.r / bucket.n;
    const g = bucket.g / bucket.n;
    const b = bucket.b / bucket.n;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max === 0 ? 0 : (max - min) / max;
    // Favour both frequency and saturation.
    const weight = bucket.n * (0.5 + sat);
    if (weight > bestWeight) {
      bestWeight = weight;
      best = { r: Math.round(r), g: Math.round(g), b: Math.round(b) };
    }
  }
  return best;
}

function load(url: string): Promise<RGB | null> {
  const cached = cache.get(url);
  if (cached !== undefined) return Promise.resolve(cached);
  const existing = inflight.get(url);
  if (existing) return existing;

  const promise = new Promise<RGB | null>((resolve) => {
    const img = new Image();
    img.onload = () => {
      const color = extractColor(img);
      cache.set(url, color);
      inflight.delete(url);
      resolve(color);
    };
    img.onerror = () => {
      cache.set(url, null);
      inflight.delete(url);
      resolve(null);
    };
    img.src = sampleUrl(url);
  });
  inflight.set(url, promise);
  return promise;
}

/**
 * The dominant vibrant color of a logo, extracted in the browser. Returns null
 * until loaded, and null if the logo has no vibrant color or fails to load.
 */
export function useDominantColor(url?: string | null): RGB | null {
  const [color, setColor] = useState<RGB | null>(() =>
    url ? (cache.get(url) ?? null) : null,
  );

  useEffect(() => {
    if (!url) {
      setColor(null);
      return;
    }
    const cached = cache.get(url);
    if (cached !== undefined) {
      setColor(cached);
      return;
    }
    let active = true;
    load(url).then((c) => {
      if (active) setColor(c);
    });
    return () => {
      active = false;
    };
  }, [url]);

  return color;
}
