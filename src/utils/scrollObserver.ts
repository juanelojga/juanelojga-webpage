export type ScrollCallback = (sectionId: string) => void;

export const SECTION_OBSERVER_OPTIONS = {
  threshold: 0.15,
  rootMargin: '0px 0px -10% 0px',
} as const;

/**
 * Observe sections and fire a callback when one becomes active.
 * Returns a cleanup function that disconnects the observer.
 */
export function observeSections(
  sectionIds: string[],
  onActivate: ScrollCallback,
  onReady?: () => void
): () => void {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    onReady?.();
    return () => {};
  }

  const observedIds = new Set<string>();
  const observedElements = new Map<string, HTMLElement>();
  let rafId: number | null = null;
  let readyDispatched = false;
  let fallbackFrameId: number | null = null;

  const runFallbackActivation = () => {
    fallbackFrameId = null;

    const viewportHeight = window.innerHeight;
    let activeSectionId: string | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;

    for (const [id, el] of observedElements) {
      const rect = el.getBoundingClientRect();
      const isVisible = rect.top < viewportHeight * 0.85 && rect.bottom > viewportHeight * 0.15;

      if (!isVisible) continue;

      el.classList.add('is-visible');

      const sectionCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const distance = Math.abs(sectionCenter - viewportCenter);

      if (distance < bestDistance) {
        bestDistance = distance;
        activeSectionId = id;
      }
    }

    if (activeSectionId) {
      onActivate(activeSectionId);
    }
  };

  const scheduleFallbackActivation = () => {
    if (fallbackFrameId !== null) return;
    fallbackFrameId = window.requestAnimationFrame(runFallbackActivation);
  };

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        onActivate(entry.target.id);
      }
    }

    scheduleFallbackActivation();
  }, SECTION_OBSERVER_OPTIONS);

  const connectSections = () => {
    let missingIds = 0;

    for (const id of sectionIds) {
      if (observedIds.has(id)) continue;

      const el = document.getElementById(id);
      if (el) {
        observer.observe(el);
        observedIds.add(id);
        observedElements.set(id, el);
      } else {
        missingIds += 1;
      }
    }

    if (missingIds === 0 && !readyDispatched) {
      readyDispatched = true;
      scheduleFallbackActivation();
      onReady?.();
      return;
    }

    if (missingIds > 0) {
      rafId = window.requestAnimationFrame(connectSections);
    }
  };

  connectSections();
  window.addEventListener('scroll', scheduleFallbackActivation, { passive: true });
  window.addEventListener('resize', scheduleFallbackActivation);

  return () => {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
    }
    if (fallbackFrameId !== null) {
      window.cancelAnimationFrame(fallbackFrameId);
    }
    window.removeEventListener('scroll', scheduleFallbackActivation);
    window.removeEventListener('resize', scheduleFallbackActivation);
    observer.disconnect();
  };
}
