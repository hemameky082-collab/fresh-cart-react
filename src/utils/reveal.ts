// Replacement for the Angular appScrollReveal directive: use as a ref callback.
export function revealRef(el: HTMLElement | null) {
  if (!el) return;
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('is-visible');
        observer.unobserve(el);
      }
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' },
  );
  observer.observe(el);
}
