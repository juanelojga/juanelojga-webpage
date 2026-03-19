export type ScrollCallback = (sectionId: string) => void;

/**
 * Observe sections and fire a callback when one becomes active.
 * Returns a cleanup function that disconnects the observer.
 */
export function observeSections(sectionIds: string[], onActivate: ScrollCallback): () => void {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return () => {};
  }

  const observer = new IntersectionObserver(
    entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          onActivate(entry.target.id);
        }
      }
    },
    {
      threshold: 0.3,
      rootMargin: '-10% 0px -10% 0px',
    }
  );

  for (const id of sectionIds) {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  }

  return () => observer.disconnect();
}
