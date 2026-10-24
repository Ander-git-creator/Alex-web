import { useRef, useEffect, useState } from 'react';
import CircularGallery from './CircularGallery';
import { profile, galleryItems } from '../data/portfolio';

const scenes = profile.hero.videos;

export default function Hero() {
  const background = useRef(null);
  const videos = useRef([]);
  const scene = useRef(0);
  const [phase, setPhase] = useState('intro');
  const [galleryReady, setGalleryReady] = useState(false);
  const [mobileVideo, setMobileVideo] = useState(() => window.matchMedia('(max-width: 760px)').matches);
  const poster = mobileVideo ? '/assets/hero-poster.webp' : '/assets/hero-poster-desktop.webp';
  const [videoEnabled] = useState(() => !navigator.connection?.saveData &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  useEffect(() => {
    const viewport = window.matchMedia('(max-width: 760px)');
    const update = () => setMobileVideo(viewport.matches);
    viewport.addEventListener('change', update);
    update();
    return () => viewport.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const root = background.current?.closest('.portfolio-root');
    if (!root) return undefined;
    const ready = () => {
      if (root.dataset.preloading === 'true' || root.dataset.sceneReady === 'true') {
        setGalleryReady(true);
        observer.disconnect();
      }
    };
    const observer = new MutationObserver(ready);
    observer.observe(root, { attributes: true, attributeFilter: ['data-scene-ready', 'data-preloading'] });
    ready();
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const players = [...videos.current];
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let switching = false;
    let frameCallback;
    let fallbackFrame;
    let revealOnPlaying;
    let nextPlayer;
    let pendingScene = null;
    let switchVersion = 0;
    const recoveryTimers = new Set();
    const clearRecovery = () => {
      recoveryTimers.forEach(clearTimeout);
      recoveryTimers.clear();
    };

    const cancelSwitch = () => {
      switchVersion += 1;
      if (frameCallback !== undefined) nextPlayer?.cancelVideoFrameCallback(frameCallback);
      if (fallbackFrame !== undefined) cancelAnimationFrame(fallbackFrame);
      if (revealOnPlaying) nextPlayer?.removeEventListener('playing', revealOnPlaying);
      frameCallback = fallbackFrame = revealOnPlaying = undefined;
      nextPlayer = null;
      pendingScene = null;
      switching = false;
    };

    const reveal = index => {
      if (disposed) return;
      // Keep the outgoing video's final frame visible until the incoming
      // decoder submits a real frame. Both layers change in the same paint.
      players[index].style.opacity = '1';
      players.forEach((player, i) => {
        if (i !== index) {
          player.style.opacity = '0';
          player.pause();
        }
      });
      scene.current = index;
      pendingScene = null;
      switching = false;
      setPhase(['intro', 'night'][index]);
    };

    const start = () => {
      if (disposed) return;
      if (background.current?.closest('.portfolio-root')?.dataset.sceneReady !== 'true') return;
      syncMotion();
    };

    const changeScene = index => {
      if (switching || disposed || motion.matches || !videoEnabled) return;
      switching = true;
      const version = ++switchVersion;
      pendingScene = index;
      nextPlayer = players[index];
      // Each clip has its own preloaded decoder; never replace src at a cut.
      if (nextPlayer.requestVideoFrameCallback) {
        frameCallback = nextPlayer.requestVideoFrameCallback(() => {
          if (version === switchVersion) reveal(index);
        });
      } else {
        revealOnPlaying = () => {
          fallbackFrame = requestAnimationFrame(() => {
            fallbackFrame = requestAnimationFrame(() => {
              if (version === switchVersion) reveal(index);
            });
          });
        };
        nextPlayer.addEventListener('playing', revealOnPlaying, { once: true });
      }
      nextPlayer.play().catch(() => {
        // Leave the outgoing frame on screen if playback cannot start.
        if (version === switchVersion) cancelSwitch();
      });
    };

    const ended = () => {
      if (scene.current === 0) changeScene(1);
    };
    const syncMotion = () => {
      if (disposed) return;
      if (!videoEnabled) return;
      if (motion.matches) {
        cancelSwitch();
        players.forEach(player => player.pause());
        return;
      }
      // Do not pause a running clip when a browser tab becomes hidden.
      // The browser may suspend media itself; recover when it becomes visible.
      if (document.hidden) return;
      if (background.current?.closest('.portfolio-root')?.dataset.sceneReady !== 'true') return;
      if (switching) return;
      const player = players[scene.current];
      if (player.ended && scene.current === 0) changeScene(1);
      else player.play().catch(() => {});
    };
    const resume = () => {
      if (disposed || document.hidden) return;
      // Background tabs and the back/forward cache can suspend a decoder
      // during a cut. Re-register its frame callback when the page returns.
      const target = pendingScene;
      cancelSwitch();
      if (target !== null) players[target].pause();
      syncMotion();
    };
    const recover = () => {
      clearRecovery();
      if (disposed || document.hidden) return;
      resume();
      // Embedded browsers may restore their media pipeline after visibility
      // and focus events. Retry without seeking or reloading the source.
      [250, 1000, 2500].forEach(delay => {
        const timer = setTimeout(() => {
          recoveryTimers.delete(timer);
          if (!disposed && !document.hidden) syncMotion();
        }, delay);
        recoveryTimers.add(timer);
      });
    };
    const onVisibility = () => document.hidden ? clearRecovery() : recover();
    const onPause = event => {
      if (disposed || document.hidden || motion.matches || !videoEnabled) return;
      if (event.target === players[scene.current] && !event.target.ended) recover();
    };
    const readyObserver = new MutationObserver(syncMotion);
    readyObserver.observe(background.current.closest('.portfolio-root'), {
      attributes: true, attributeFilter: ['data-scene-ready'],
    });
    players.forEach(player => {
      player.addEventListener('ended', ended);
      player.addEventListener('pause', onPause);
      player.addEventListener('canplay', start);
    });
    players[0].addEventListener('loadeddata', start);
    motion.addEventListener('change', syncMotion);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', clearRecovery);
    window.addEventListener('pageshow', recover);
    window.addEventListener('focus', recover);
    window.addEventListener('pointerdown', recover, { passive: true });
    document.addEventListener('resume', recover);
    scene.current = 0;
    setPhase('intro');
    players.forEach((player, index) => {
      player.style.opacity = index === 0 ? '1' : '0';
      player.muted = true;
      player.loop = index === 1;
    });
    if (players[0].readyState >= 2) start();

    return () => {
      disposed = true;
      clearRecovery();
      readyObserver.disconnect();
      cancelSwitch();
      players.forEach(player => {
        player.removeEventListener('ended', ended);
        player.removeEventListener('pause', onPause);
        player.removeEventListener('canplay', start);
        player.pause();
      });
      players[0].removeEventListener('loadeddata', start);
      motion.removeEventListener('change', syncMotion);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', clearRecovery);
      window.removeEventListener('pageshow', recover);
      window.removeEventListener('focus', recover);
      window.removeEventListener('pointerdown', recover);
      document.removeEventListener('resume', recover);
    };
  }, [videoEnabled, mobileVideo]);

  return <section id="home" className="hero" data-scene={phase}>
    <div className="hero-scene">
    <div ref={background} className="hero-background" aria-label="云端创作空间动态背景">
      <img className="hero-poster" src={poster} alt="" fetchPriority="high" decoding="async" aria-hidden="true"/>
      {scenes.map((src, index) => <video key={`${src}-${mobileVideo}`}
        ref={element => { videos.current[index] = element; }}
        src={videoEnabled ? (mobileVideo ? src.replace('.mp4', '-mobile-hq.mp4') : src) : undefined}
        muted playsInline preload="none"
        poster={index === 0 ? poster : undefined}
        style={{ opacity: index === 0 ? 1 : 0 }} aria-hidden="true"/>)}
    </div>
    </div>
    <div className="hero-shade"/>
    <div className="hero-copy container">
      <h1 aria-label={`${profile.name} PORTFOLIO`}>
        <span className="hero-title-mask" aria-hidden="true"><span className="hero-title-line">{profile.name}<sup className="hero-stars"/></span></span>
        <span className="hero-title-mask hero-portfolio-mask" aria-hidden="true"><span className="hero-title-line portfolio-word">PORTFOLIO<span className="signature">XiaoFeng</span></span></span>
      </h1>
      <p className="hero-description"><span>用视觉系统与 AI 工作流</span><span>让品牌内容更快、更准、更有辨识度</span></p>
    </div>
    <div className="hero-gallery">{galleryReady && <CircularGallery
      waitForReady
      onLoadStateChange={({ status }) => {
        const root = background.current?.closest('.portfolio-root');
        if (root) root.dataset.galleryReady = status;
      }}
      items={galleryItems}
      dpr={1.5}
      bend={2.5}
      itemSize={0.4}
      fadeEdges={0.3}
      autoScroll={2}
      showTitles={false}
      openOnClick
      textColor="#ffffff"
      borderRadius={0.05}
      scrollEase={0.05}
      font="14px Krona One"
      aria-label="首页作品画廊，可拖动浏览，点击作品展开"
    />}</div>
  </section>;
}
