import { useEffect, useRef, useState } from 'react';
import { galleryItems, profile, projects } from '../data/portfolio';
import './PortfolioLoader.css';

export default function PortfolioLoader({ rootRef }) {
  const [progress, setProgress] = useState(1);
  const [state, setState] = useState('loading');
  const [errorDetail, setErrorDetail] = useState('');
  const retainedUrls = useRef([]);

  useEffect(() => () => retainedUrls.current.forEach(URL.revokeObjectURL), []);
  useEffect(() => {
    const root = rootRef.current;
    const controller = new AbortController();
    const { signal } = controller;
    let observer;
    let loadTimeout;
    let displayedProgress = 1;
    let targetProgress = 1;
    let assetsReady = false;
    root.dataset.preloading = 'true';
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    setState('loading');
    setProgress(1);
    // Advance one percentage point per tick, even when cached resources
    // complete together. Reaching 100 still requires every resource ready.
    const progressTimer = setInterval(() => {
      if (signal.aborted || displayedProgress >= targetProgress) return;
      displayedProgress = Math.min(targetProgress, displayedProgress + Math.max(1, Math.ceil((targetProgress - displayedProgress) * .12)));
      setProgress(displayedProgress);
      if (displayedProgress === 100 && assetsReady) {
        clearInterval(progressTimer);
          root.dataset.sceneReady = 'true';
          root.dataset.opening = 'complete';
          setState('complete');
          document.body.style.overflow = previousOverflow;
      }
    }, 16);
    const values = new Map();
    const describePending = () => [...values].filter(([, value]) => value < 1).map(([key]) =>
      key === 'gallery' ? '首页画廊' : key === 'fonts' ? '字体' : key.includes('.mp4') ? '视频' : '图片'
    ).filter((value, index, all) => all.indexOf(value) === index).join('、');
    loadTimeout = setTimeout(() => {
      if (assetsReady || signal.aborted) return;
      setErrorDetail(`${describePending()}加载超时`);
      setState('error');
    }, 30000);
    const update = (key, value) => {
      if (signal.aborted) return;
      values.set(key, value);
      root.dataset.loadingPending = describePending();
      targetProgress = Math.max(targetProgress, Math.min(99, Math.floor([...values.values()].reduce((a, b) => a + b, 0) / values.size * 99)));
    };
    const mobile = window.matchMedia('(max-width: 760px)').matches;
    const videosEnabled = !navigator.connection?.saveData && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const images = [...new Set([
      mobile ? '/assets/hero-poster.webp' : '/assets/hero-poster-desktop.webp',
      '/assets/header-logo.png', profile.avatar.src,
      ...galleryItems.map(item => item.image), ...projects.map(item => item.media.src),
    ])];
    const videoUrls = videosEnabled ? profile.hero.videos.map(url => mobile ? url.replace('.mp4', '-mobile-hq.mp4') : url) : [];
    [...images, ...videoUrls, 'fonts', 'gallery'].forEach(key => values.set(key, 0));

    async function cacheVideo(url, index) {
      const response = await fetch(url, { signal, cache: 'force-cache' });
      if (!response.ok) throw new Error('Video unavailable');
      const size = Number(response.headers.get('content-length'));
      const reader = response.body.getReader();
      const chunks = []; let loaded = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value); loaded += value.byteLength;
        if (size) update(url, Math.min(.95, loaded / size * .95));
      }
      if (signal.aborted) return;
      const blobUrl = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
      retainedUrls.current.push(blobUrl);
      const player = root.querySelectorAll('.hero-background video')[index];
      await new Promise((resolve, reject) => {
        const clean = () => {
          player.removeEventListener('loadeddata', ready);
          player.removeEventListener('error', fail);
          signal.removeEventListener('abort', fail);
        };
        const ready = () => { clean(); resolve(); };
        const fail = () => { clean(); reject(new Error('Video decode interrupted')); };
        player.addEventListener('loadeddata', ready);
        player.addEventListener('error', fail);
        signal.addEventListener('abort', fail, { once: true });
        player.preload = 'auto';
        player.src = blobUrl;
        player.load();
      });
      update(url, 1);
    }
    const gallery = new Promise((resolve, reject) => {
      const check = () => {
        if (root.dataset.galleryReady === 'ready') { observer.disconnect(); update('gallery', 1); resolve(); }
        if (root.dataset.galleryReady === 'error') { observer.disconnect(); reject(new Error('Gallery unavailable')); }
      };
      observer = new MutationObserver(check);
      observer.observe(root, { attributes: true, attributeFilter: ['data-gallery-ready'] });
      signal.addEventListener('abort', () => reject(new Error('Aborted')), { once: true });
      check();
    });
    const jobs = images.map(url => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = async () => {
        try { await image.decode(); if (!signal.aborted) update(url, 1); resolve(); }
        catch (error) { reject(error); }
      };
      image.onerror = reject;
      image.src = url;
    }));
    jobs.push(...videoUrls.map(cacheVideo));
    jobs.push(Promise.all([
      document.fonts.load('500 32px "Rany Medium"'),
      document.fonts.load('400 16px "HarmonyOS Sans SC"', '个人作品集'),
      document.fonts.load('600 120px "HarmonyOS Loader"', '0123456789%LOADING PORTFOLIO'),
      document.fonts.ready,
    ]).then(() => update('fonts', 1)), gallery);
    Promise.all(jobs).then(() => {
      if (signal.aborted) return;
      assetsReady = true;
      clearTimeout(loadTimeout);
      setState('loading');
      delete root.dataset.loadingPending;
      targetProgress = 100;
    }).catch(() => {
      if (!signal.aborted) {
        clearInterval(progressTimer);
        clearTimeout(loadTimeout);
        setErrorDetail(`${describePending()}加载失败`);
        setState('error');
      }
    });
    return () => {
      controller.abort();
      clearInterval(progressTimer);
      clearTimeout(loadTimeout);
      observer?.disconnect();
      document.body.style.overflow = previousOverflow;
    };
  }, [rootRef]);

  if (state === 'complete') return null;
  return <div className="portfolio-loader" role="dialog" aria-modal="true" aria-label="正在加载作品集">
    <div className="portfolio-loader-ripples" aria-hidden="true"><i/><i/><i/><i/></div>
    <div className="portfolio-loader-content">
      <p>LOADING PORTFOLIO</p>
      <div className="portfolio-loader-number" role="progressbar" aria-valuemin={1} aria-valuemax={100} aria-valuenow={progress}>{progress}%</div>
      {state === 'error' && <button onClick={() => window.location.reload()}>{errorDetail}，点击重试</button>}
    </div>
  </div>;
}
