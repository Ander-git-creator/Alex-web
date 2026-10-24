import { useEffect, useMemo, useRef, useState } from 'react';
import CircularGallery from './CircularGallery';
import LatticeLoader from './LatticeLoader';
import './RenderGallery.css';
import { renderPosters } from '../data/renderPosters';
const renders = [
  { src: '/assets/work-product-custom.webp', alt: '文具产品三维渲染', title: '产品阵列', subtitle: '三维渲染 / 产品构图' },
  { src: '/assets/work-motion-custom.webp', alt: '登山扣材质光影渲染', title: '材质与光影', subtitle: '三维渲染 / 金属质感' },
  { src: '/assets/work-ai-custom.webp', alt: '扫地机器人空间视觉', title: '产品场景', subtitle: '三维视觉 / 空间表达' },
];

export default function RenderGallery({ onBack, variant = 'render', items, groups, label, backLabel = '返回分类', showBack = true, fit }) {
  const isPoster = variant === 'poster';
  const [activeGroupId, setActiveGroupId] = useState(groups?.[0]?.id);
  const activeGroup = groups?.find(group => group.id === activeGroupId) || groups?.[0];
  const galleryItems = activeGroup?.items || items || (isPoster ? renderPosters : renders);
  const circularItems = useMemo(() => galleryItems.map(item => ({
    image: item.src,
    text: item.title,
    alt: item.alt || item.title,
  })), [galleryItems]);
  const [closing, setClosing] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [prepared, setPrepared] = useState(null);
  const [loadState, setLoadState] = useState(null);
  const mounted = prepared?.items === galleryItems && prepared.attempt === attempt;
  const status = loadState?.items === galleryItems && loadState.attempt === attempt ? loadState.status : 'loading';
  useEffect(() => {
    // Paint the loader before starting shader compilation and image decoding.
    let secondFrame;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => setPrepared({ items: galleryItems, attempt }));
    });
    return () => { cancelAnimationFrame(firstFrame); cancelAnimationFrame(secondFrame); };
  }, [galleryItems, attempt]);
  const timer = useRef(null);
  const back = useRef(null);
  useEffect(() => { back.current?.focus({ preventScroll: true }); return () => clearTimeout(timer.current); }, []);
  useEffect(() => {
    function closeEnlargedImage(event) {
      if (event.key !== 'Escape') return;
      const openGallery = document.querySelector('.render-gallery .circular-gallery[data-open]');
      if (!openGallery) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      openGallery.querySelector('[data-gallery-close]')?.click();
    }
    document.addEventListener('keydown', closeEnlargedImage, true);
    return () => document.removeEventListener('keydown', closeEnlargedImage, true);
  }, []);
  function close() {
    if (timer.current !== null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { onBack(); return; }
    setClosing(true); timer.current = setTimeout(onBack, 260);
  }
  return <section ref={showBack ? undefined : back} tabIndex={showBack ? undefined : -1} className={`render-gallery${closing ? ' is-closing' : ''}`} aria-label={label || (isPoster ? '渲染海报作品展示' : '三维渲染作品展示')}>
    {showBack && <button ref={back} type="button" className="render-back" onClick={close} aria-label={backLabel}>← {backLabel}</button>}
    {groups?.length > 0 && <div className="render-product-filters" role="group" aria-label="按产品分类">{groups.map(group => <button key={group.id} type="button" aria-pressed={group.id === activeGroup.id} onClick={() => setActiveGroupId(group.id)}>
      {group.label}
    </button>)}</div>}
    <div className="render-carousel-stage render-carousel-stage--circular" data-load-state={status} aria-busy={status === 'loading'} aria-label={activeGroup ? `${activeGroup.label}，${galleryItems.length} 张作品` : undefined}>
      {mounted && <CircularGallery
        key={`${activeGroup?.id || 'gallery'}-${attempt}`}
        items={circularItems}
        bend={0.5}
        textColor="#ffffff"
        borderRadius={0.05}
        scrollEase={0.05}
        itemSize={0.8}
        autoScroll={0.5}
        showTitles={false}
        font="14px Rany Medium"
        waitForReady
        inert={status !== 'ready'}
        onLoadStateChange={state => setLoadState({ ...state, items: galleryItems, attempt })}
        aria-label={label || (isPoster ? '渲染海报环形画廊' : '作品环形画廊')}
      />}
      <div className="render-gallery-loader" data-state={status} aria-hidden={status === 'ready'}>
        {status !== 'ready' && <>
          <LatticeLoader status={status === 'error' ? 'error' : 'working'} label="Loading..." errorLabel="作品加载失败，请重试" pattern="dots" cellSize={6} gap={3} fontSize={16} showTimer={false}/>
          {status === 'error' && <button type="button" onClick={() => setAttempt(value => value + 1)}>重新加载</button>}
        </>}
      </div>
    </div>
  </section>;
}


