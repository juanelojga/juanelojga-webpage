/* ================================================================== */
/*  Portrait Frame Sequence                                            */
/*  Manages lazy-loading and playback of portrait transformation       */
/*  frames for the theme toggle animation.                             */
/* ================================================================== */

import { PORTRAIT_FRAME_INTERVAL, PORTRAIT_FRAME_COUNT } from './animation';

const FRAME_BASE = '/images/portrait-frames/frame-';

function frameSrc(index: number): string {
  const padded = String(index).padStart(2, '0');
  return `${FRAME_BASE}${padded}.jpg`;
}

/** All frame URLs in order (1-based). */
export function getFrameUrls(): string[] {
  return Array.from({ length: PORTRAIT_FRAME_COUNT }, (_, i) => frameSrc(i + 1));
}

// ── Preloading ────────────────────────────────────────────────────────

let preloaded = false;
const imageCache: HTMLImageElement[] = [];

/** Preload all portrait frame images. Resolves when every frame is ready. */
export async function preloadFrames(): Promise<void> {
  if (preloaded) return;
  const urls = getFrameUrls();
  await Promise.all(
    urls.map(
      src =>
        new Promise<void>(resolve => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve();
          img.onerror = () => resolve(); // don't block on missing placeholders
          imageCache.push(img);
        })
    )
  );
  preloaded = true;
}

// ── Playback ──────────────────────────────────────────────────────────

/**
 * Play the portrait frame sequence on a container element.
 *
 * - `direction: 'forward'`  → frame 1 → frame N (build → after-hours)
 * - `direction: 'reverse'`  → frame N → frame 1 (after-hours → build)
 *
 * Returns a cleanup function that cancels any pending frame.
 */
export function playSequence(
  container: HTMLElement,
  direction: 'forward' | 'reverse',
  onComplete?: () => void
): () => void {
  const urls = getFrameUrls();
  const frames = direction === 'forward' ? urls : [...urls].reverse();
  let currentFrame = 0;
  let timerId: ReturnType<typeof setTimeout> | undefined;

  // Ensure the container shows the portrait-slot background image
  function showFrame(src: string) {
    container.style.backgroundImage = `url(${src})`;
    container.style.backgroundSize = 'cover';
    container.style.backgroundPosition = 'center';
  }

  function tick() {
    if (currentFrame >= frames.length) {
      onComplete?.();
      return;
    }
    showFrame(frames[currentFrame]);
    currentFrame++;
    timerId = setTimeout(tick, PORTRAIT_FRAME_INTERVAL);
  }

  tick();

  return () => {
    if (timerId !== undefined) clearTimeout(timerId);
  };
}
