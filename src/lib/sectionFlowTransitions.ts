import { gsap, ScrollTrigger } from './gsap';

/**
 * Initializes bidirectional exit & enter transitions across all portfolio sections.
 * Excludes #hero section as explicitly required.
 *
 * Uses the existing vertical transition:
 * - Entrance animation: smooth in from bottom to top (y: 28 -> 0, opacity: 0 -> 1, scale: 0.99 -> 1)
 * - Exit animation: smooth out in reverse direction (y: 0 -> 28, opacity: 1 -> 0, scale: 1 -> 0.99)
 */
export function initSectionFlowTransitions(): void {
  if (typeof window === 'undefined') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const sectionIds = [
    'about',
    'skills-ticker',
    'projects',
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

    const isTerminalSection = id === 'contact' || id === 'footer';

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

    const leaveAnimation = (force = false) => {
      if (isTerminalSection && !force) return; // Contact and Footer are at document bottom; cannot exit downwards
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
      start: isTerminalSection ? 'top 95%' : 'top 88%',
      end: isTerminalSection ? 'bottom bottom' : 'bottom 14%',
      onEnter: () => {
        enterAnimation();
      },
      onLeave: () => {
        if (!isTerminalSection) {
          leaveAnimation();
        }
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
      if (isTerminalSection) {
        gsap.set(content, { opacity: 1, y: 0, scale: 1 });
        gsap.set(content, { clearProps: 'transform' });
      } else {
        gsap.set(content, { opacity: 0, y: 28, scale: 0.99 });
      }
    }
  });

  // Recalibrate trigger coordinates after layout stabilizes
  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
  });
}
