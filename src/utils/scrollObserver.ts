export type ScrollCallback = (sectionId: string) => void;

export const SECTION_OBSERVER_OPTIONS = {
  threshold: 0.15,
  rootMargin: '0px 0px -10% 0px',
} as const;

const ACTIVATION_DEBOUNCE_MS = 150;

/**
 * Observe sections and fire a callback when one becomes active.
 *
 * Activation uses a single source of truth: the section whose centre is
 * closest to the viewport centre among all currently-visible sections.
 * IntersectionObserver handles `is-visible` class toggling for CSS reveal
 * animations but does **not** call `onActivate` directly — that avoids
 * competing activation calls that cause the rail to flicker.
 *
 * Scroll / resize events schedule a debounced activation check so the
 * callback only fires once the user has settled (~150 ms).
 *
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
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;
  let currentActiveId: string | null = null;

  const runActivation = () => {
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

    if (activeSectionId && activeSectionId !== currentActiveId) {
      currentActiveId = activeSectionId;
      onActivate(activeSectionId);
    }
  };

  const scheduleActivation = () => {
    if (debounceTimer !== null) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runActivation, ACTIVATION_DEBOUNCE_MS);
  };

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    }
    scheduleActivation();
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
      // Initial activation on page load — run immediately via rAF
      window.requestAnimationFrame(runActivation);
      onReady?.();
      return;
    }

    if (missingIds > 0) {
      rafId = window.requestAnimationFrame(connectSections);
    }
  };

  connectSections();
  window.addEventListener('scroll', scheduleActivation, { passive: true });
  window.addEventListener('resize', scheduleActivation);

  return () => {
    if (rafId !== null) {
      window.cancelAnimationFrame(rafId);
    }
    if (debounceTimer !== null) {
      clearTimeout(debounceTimer);
    }
    window.removeEventListener('scroll', scheduleActivation);
    window.removeEventListener('resize', scheduleActivation);
    observer.disconnect();
  };
}
