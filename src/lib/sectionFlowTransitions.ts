import { gsap, ScrollTrigger } from './gsap';

/**
 * Initializes bidirectional exit & enter transitions across all portfolio sections.
 * Excludes #hero section as required.
 *
 * Lifecycle:
 * - Scrolling DOWN:
 *   - onEnter: Section enters from below (y: 28 -> 0, opacity: 0 -> 1)
 *   - onLeave: Section exits to above (y: 0 -> -28, opacity: 1 -> 0)
 * - Scrolling UP:
 *   - onEnterBack: Section enters from above (y: -28 -> 0, opacity: 0 -> 1)
 *   - onLeaveBack: Section exits to below (y: 0 -> 28, opacity: 1 -> 0)
 */
export function initSectionFlowTransitions(): void {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const sectionIds = [
    'skills-ticker',
    'about',
    'skills',
    'projects',
    'certificates',
    'contact',
    'footer',
  ];

  sectionIds.forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;

    const content = section.querySelector<HTMLElement>('.section-content-flow');
    if (!content) return;

    const isFooter = id === 'footer';

    const st = ScrollTrigger.create({
      trigger: section,
      start: isFooter ? 'top 92%' : 'top 88%',
      end: isFooter ? 'bottom bottom' : 'bottom 14%',
      onEnter: () => {
        gsap.fromTo(
          content,
          { y: 28, opacity: 0, scale: 0.99 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.65,
            ease: 'power2.out',
            overwrite: 'auto',
            onComplete: () => {
              gsap.set(content, { clearProps: 'transform' });
            },
          }
        );
      },
      onLeave: () => {
        if (isFooter) return; // Footer is at document bottom; cannot exit downwards
        gsap.to(content, {
          y: -28,
          opacity: 0,
          scale: 0.99,
          duration: 0.45,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
      },
      onEnterBack: () => {
        gsap.fromTo(
          content,
          { y: -28, opacity: 0, scale: 0.99 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.65,
            ease: 'power2.out',
            overwrite: 'auto',
            onComplete: () => {
              gsap.set(content, { clearProps: 'transform' });
            },
          }
        );
      },
      onLeaveBack: () => {
        gsap.to(content, {
          y: 28,
          opacity: 0,
          scale: 0.99,
          duration: 0.45,
          ease: 'power2.inOut',
          overwrite: 'auto',
        });
      },
    });

    // Sync initial DOM visibility with current scroll position
    if (st.isActive) {
      gsap.set(content, { opacity: 1, y: 0, scale: 1 });
      gsap.set(content, { clearProps: 'transform' });
    } else if (st.progress === 0) {
      gsap.set(content, { opacity: 0, y: 28, scale: 0.99 });
    } else if (st.progress === 1) {
      gsap.set(content, { opacity: 0, y: -28, scale: 0.99 });
    }
  });

  // Recalibrate trigger coordinates after layout stabilizes
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
}
