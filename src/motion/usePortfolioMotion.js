import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './portfolio-motion.css';

gsap.registerPlugin(ScrollTrigger);

const OPEN = 'inset(0% 0% 0% 0%)';
const CLOSED = 'inset(0% 0% 100% 0%)';
const RELEASE = 'transform,clipPath,willChange';

export default function usePortfolioMotion(rootRef) {
  const opened = useRef(false);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const media = gsap.matchMedia(root);
    const revealed = new WeakSet();
    const headingsPlayed = new WeakSet();
    let disposed = false;

    media.add('(prefers-reduced-motion: no-preference)', context => {
      const select = gsap.utils.selector(root);
      // Register asynchronous callbacks with the same React cleanup context.
      const safe = fn => (...args) => context.add(() => fn(...args));
      const headingTimelines = new Map();
      let openingCancelled = false;
      let openingFrame = 0;
      const release = targets => gsap.set(targets, { clearProps: RELEASE });
      const deepLink = location.hash && location.hash !== '#home';
      const opening = gsap.timeline({
        paused: true,
        defaults: { ease: 'expo.out' },
        onComplete: () => {
          opened.current = true;
          root.dataset.opening = 'complete';
          root.dataset.sceneReady = 'true';
        },
      });

      if (!opened.current && !deepLink && window.scrollY < window.innerHeight * 0.4) {
        root.dataset.opening = 'playing';
        gsap.set('.opening-curtain', { autoAlpha: 1 });
        opening
          .from('.opening-char', { yPercent: 115, force3D: true, duration: 1.2, stagger: 0.035 }, 0.08)
          .from('.opening-rule', { scaleX: 0, transformOrigin: 'left', duration: 1.25, ease: 'power3.inOut' }, 0.15)
          .to('.opening-char', { yPercent: -115, stagger: 0.018, duration: 0.7, ease: 'power3.in' }, 1.08)
          .to('.opening-curtain', { yPercent: -100, duration: 1.5, ease: 'expo.inOut' }, 1.12)
          .set('.opening-curtain', { autoAlpha: 0 }, 2.65)
          .call(() => { root.dataset.sceneReady = 'true'; }, [], 2.65)
          .from('.hero-background', { scale: 1.18, duration: 2.6, onComplete: () => release(select('.hero-background')) }, 1.1)
          .from('.hero-title-line', {
            yPercent: 140, x: -32, scaleY: 1.65, scaleX: 0.84,
            skewY: 5, rotation: -2, transformOrigin: '0% 100%',
            duration: 1.9, stagger: 0.22,
            onComplete: () => release(select('.hero-title-line')),
          }, 1.55)
          .from('.hero-description > span', {
            yPercent: 110, clipPath: CLOSED, duration: 1.3, stagger: 0.12,
            onComplete: () => release(select('.hero-description > span')),
          }, 2.15)
          .from('.hero-gallery', {
            y: 150, scale: 0.92, clipPath: CLOSED, duration: 1.85,
            onComplete: () => release(select('.hero-gallery')),
          }, 1.9)
          .from('.navigation', {
            y: -110, duration: 1.5,
            onComplete: () => release(select('.navigation')),
          }, 1.9);
        // Avoid swapping the large font or compiling the gallery mid-word.
        const fontReady = document.fonts?.load('500 100px "Rany Medium"') || Promise.resolve();
        fontReady.catch(() => {}).then(() => {
          if (openingCancelled || opened.current) return;
          openingFrame = requestAnimationFrame(() => {
            openingFrame = requestAnimationFrame(() => {
              if (!openingCancelled && !opened.current) opening.play();
            });
          });
        });
      } else {
        gsap.set('.opening-curtain', { autoAlpha: 0 });
        root.dataset.opening = 'complete';
        root.dataset.sceneReady = 'true';
      }

      // Scrolling and navigation finish the opening without locking the page.
      const finishOpening = () => {
        if (root.dataset.opening === 'playing') opening.progress(1).pause();
      };
      const onKey = event => {
        if (['Tab', 'Escape', 'ArrowDown', 'PageDown', 'End', ' '].includes(event.key)) finishOpening();
      };
      const onNavigation = event => {
        if (event.target.closest('a[href^="#"]')) finishOpening();
      };
      window.addEventListener('wheel', finishOpening, { passive: true });
      window.addEventListener('touchstart', finishOpening, { passive: true });
      window.addEventListener('keydown', onKey);
      root.addEventListener('click', onNavigation);

      select('.section-heading').forEach(heading => {
        if (headingsPlayed.has(heading)) return;
        const title = heading.querySelector('.heading-text');
        const arrow = heading.querySelector('.heading-arrow');
        const subtitle = heading.querySelector('p');
        const timeline = gsap.timeline({
          scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
          defaults: { ease: 'expo.out' },
          onComplete: () => {
            headingsPlayed.add(heading);
            release([title, arrow, subtitle]);
          },
        });
        timeline.from(title, {
          yPercent: 125, x: -70, skewY: 6, scaleY: 1.55,
          transformOrigin: 'left bottom', duration: 1.7,
        }, 0)
          .from(arrow, { yPercent: 160, rotation: -70, duration: 1.4 }, 0.22)
          .from(subtitle, { y: 30, clipPath: CLOSED, duration: 1.1 }, 0.5);
        headingTimelines.set(heading.closest('section'), timeline);
      });

      const contactTitle = select('.contact-headline h2')[0];
      if (contactTitle && !headingsPlayed.has(contactTitle)) {
        const lines = contactTitle.querySelectorAll('.contact-line-content');
        const card = select('.contact-reveal')[0];
        const entryTargets = [...lines, ...(card ? [card] : [])];
        const contactTimeline = gsap.timeline({
          scrollTrigger: { trigger: contactTitle, start: 'top 88%', once: true },
          onComplete: () => {
            headingsPlayed.add(contactTitle);
            if (card) revealed.add(card);
            gsap.set(entryTargets, { clearProps: 'transform,opacity,willChange' });
          },
        }).from(lines, {
          yPercent: 105, opacity: 0,
          stagger: 0.12, duration: 0.85, ease: 'power3.out',
        }, 0);
        if (card) contactTimeline.from(card, {
          y: 36, opacity: 0, duration: 1, ease: 'power3.out',
        }, 0.15);
        headingTimelines.set(contactTitle.closest('section'), contactTimeline);
      }

      const cards = select('[data-motion-card]').filter(card => !card.matches('.contact-reveal') && !revealed.has(card));
      const isFloatingCard = card => card.matches('.work-reveal, .portrait-reveal');
      const releaseCard = card => {
        release(card);
        if (isFloatingCard(card)) gsap.set(card, { clearProps: 'opacity' });
      };
      gsap.set(cards, {
        // Reveal the complete silhouette, including glow and tilted corners.
        // A clip-path flattens the 3D portrait and clips the glow until cleanup.
        y: (_, card) => isFloatingCard(card) ? 36 : window.innerWidth < 761 ? 65 : 100,
        opacity: (_, card) => isFloatingCard(card) ? 0 : 1,
        scale: (_, card) => isFloatingCard(card) ? 1 : 0.94,
        clipPath: (_, card) => isFloatingCard(card) ? 'none' : CLOSED,
        transformOrigin: '50% 100%',
      });
      // Each visible row owns its stagger; mobile cards below the fold wait.
      ScrollTrigger.batch(cards, {
        start: 'top 96%', once: true, interval: 0.12, batchMax: 3,
        onEnter: safe(batch => {
          batch.filter(card => !revealed.has(card)).forEach((card, index) => {
            revealed.add(card);
            const title = headingTimelines.get(card.closest('section'));
            const delay = (title ? Math.max(0, Math.min(0.65, 0.8 - title.time())) : 0) + index * 0.2;
            const floating = isFloatingCard(card);
            gsap.to(card, {
              y: 0, scale: 1, opacity: 1, clipPath: floating ? 'none' : OPEN,
              duration: floating ? 1.15 : 1.65, delay, ease: floating ? 'power3.out' : 'expo.out',
              onStart: () => gsap.set(card, { willChange: floating ? 'transform,opacity' : 'transform,clip-path' }),
              onComplete: () => releaseCard(card),
            });
            const image = card.querySelector('.project-image-reveal');
            if (image) gsap.from(image, {
              scale: 1.22, duration: 2.2, delay, ease: 'power3.out',
              onComplete: () => release(image),
            });
            const caption = card.querySelector('.project-caption');
            if (caption) gsap.from(caption, {
              y: 18, opacity: 0, duration: 0.85, delay: delay + 0.15,
              ease: 'power3.out', onComplete: () => {
                release(caption);
                gsap.set(caption, { clearProps: 'opacity' });
              },
            });
          });
        }),
      });

      ['.about-copy'].forEach(selector => {
        const group = select(selector)[0];
        if (!group || revealed.has(group)) return;
        const children = [...group.children];
        gsap.from(children, {
          y: 55, clipPath: CLOSED, stagger: 0.12, duration: 1.4, ease: 'expo.out',
          scrollTrigger: { trigger: group, start: 'top 88%', once: true },
          onComplete: () => { revealed.add(group); release(children); },
        });
      });

      // Timeline markers sit outside each article's border box. A clip reveal
      // hides them until its cleanup, so fade the complete entry instead.
      select('.career article').forEach(article => {
        if (revealed.has(article)) return;
        gsap.from(article, {
          opacity: 0, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: article, start: 'top 92%', once: true },
          onComplete: () => {
            revealed.add(article);
            gsap.set(article, { clearProps: 'opacity' });
          },
        });
      });

      // Keyboard focus must never land inside an unrevealed card.
      const onFocus = safe(event => {
        const card = event.target.closest('[data-motion-card]');
        if (!card) return;
        revealed.add(card);
        const targets = [card, ...card.querySelectorAll('.project-caption, .project-image-reveal')];
        gsap.killTweensOf(targets);
        release(targets);
        gsap.set(targets, { clearProps: 'opacity' });
        if (card.matches('.contact-reveal')) gsap.set(card, { clearProps: 'opacity' });
      });
      root.addEventListener('focusin', onFocus);
      return () => {
        openingCancelled = true;
        cancelAnimationFrame(openingFrame);
        window.removeEventListener('wheel', finishOpening);
        window.removeEventListener('touchstart', finishOpening);
        window.removeEventListener('keydown', onKey);
        root.removeEventListener('click', onNavigation);
        root.removeEventListener('focusin', onFocus);
      };
    });

    media.add('(prefers-reduced-motion: reduce)', () => {
      root.dataset.opening = 'complete';
      root.dataset.sceneReady = 'true';
    });

    // Nest movement separately from reveal, image zoom and card interactions.
    media.add('(min-width: 761px) and (prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray('.project-image-drift', root).forEach(image => {
        gsap.fromTo(image, { yPercent: -5 }, {
          yPercent: 5, ease: 'none',
          scrollTrigger: { trigger: image.closest('.work-reveal'), start: 'top bottom', end: 'bottom top', scrub: 0.9 },
        });
      });
      gsap.to('.hero-scene', {
        yPercent: 7, ease: 'none',
        scrollTrigger: { trigger: root.querySelector('.hero'), start: 'top top', end: 'bottom top', scrub: 1 },
      });
    });

    document.fonts?.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
    return () => {
      disposed = true;
      media.revert();
      delete root.dataset.opening;
      delete root.dataset.sceneReady;
    };
  }, [rootRef]);
}
