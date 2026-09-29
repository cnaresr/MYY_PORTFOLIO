import { gsap, ScrollTrigger } from './gsap';

/**
 * Initializes bidirectional exit & enter transitions across all portfolio sections.
 * Excludes #hero section as explicitly required.
 *
 * Uses the existing vertical transition:
 * - Animasi masuk: smooth in dari bawah ke atas (y: 28 -> 0, opacity: 0 -> 1, scale: 0.99 -> 1)
 * - Animasi keluar: smooth out arah sebaliknya (y: 0 -> 28, opacity: 1 -> 0, scale: 1 -> 0.99)
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

    const triggerId = `flow-${id}`;
    const existing = ScrollTrigger.getById(triggerId);
    if (existing) {
      existing.kill();
    }

    const isFooter = id === 'footer';

    const enterAnimation = () => {
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
    };

    const leaveAnimation = () => {
      if (isFooter) return; // Footer is at document bottom; cannot exit downwards
      gsap.to(content, {
        y: 28,
        opacity: 0,
        scale: 0.99,
        duration: 0.45,
        ease: 'power2.inOut',
        overwrite: 'auto',
      });
    };

    const st = ScrollTrigger.create({
      id: triggerId,
      trigger: section,
      start: isFooter ? 'top 95%' : 'top 88%',
      end: isFooter ? 'bottom bottom' : 'bottom 14%',
      onEnter: () => {
        enterAnimation();
      },
      onLeave: () => {
        leaveAnimation();
      },
      onEnterBack: () => {
        enterAnimation();
      },
      onLeaveBack: () => {
        leaveAnimation();
      },
    });

    // Sync initial DOM visibility with current scroll position
    if (st.isActive) {
      gsap.set(content, { opacity: 1, y: 0, scale: 1 });
      gsap.set(content, { clearProps: 'transform' });
    } else if (st.progress === 0) {
      gsap.set(content, { opacity: 0, y: 28, scale: 0.99 });
    } else if (st.progress === 1) {
      gsap.set(content, { opacity: 0, y: 28, scale: 0.99 });
    }
  });

  // Recalibrate trigger coordinates after layout stabilizes
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
}
