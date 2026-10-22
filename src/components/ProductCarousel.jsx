import { useEffect, useRef, useState } from 'react';
import EcommerceCases from './EcommerceCases';
import RenderGallery from './RenderGallery';
import { renderWorks } from '../data/renderWorks';
import './ProductCarousel.css';

const items = [
  { title: '三维渲染', src: '/assets/cover-3d-render.png' },
  { title: '电商视觉案例', src: '/assets/cover-ecommerce-case.png' },
  { title: '渲染海报', src: '/assets/cover-render-poster.png' },
];

// Overlapping covers fan out around the selected category.
export default function ProductCarousel() {
  const [active, setActive] = useState(1);
  const [detail, setDetail] = useState(false);
  const [returning, setReturning] = useState(false);
  function returnToCategories() {
    setReturning(true);
    setDetail(false);
  }
  useEffect(() => {
    if (!detail) return;
    function back(event) {
      if (event.key === 'Escape') {
        const caseGallery = document.querySelector('.ecommerce-gallery-back');
        if (caseGallery) {
          event.preventDefault(); event.stopImmediatePropagation();
          caseGallery.click();
          return;
        }
        const openPoster = document.querySelector('.render-gallery .circular-gallery[data-open]');
        if (openPoster) {
          event.preventDefault();
          event.stopPropagation();
          openPoster.querySelector('[data-gallery-close]')?.click();
          return;
        }
        if (document.querySelector('.render-gallery .flex-carousel')?.dataset.focusOpen) return;
        event.preventDefault(); event.stopPropagation(); document.querySelector('.ecommerce-back, .render-back')?.click();
      }
    }
    document.addEventListener('keydown', back, true);
    return () => { document.removeEventListener('keydown', back, true); requestAnimationFrame(() => document.querySelector('.product-category-card[aria-pressed="true"]')?.focus({ preventScroll: true })); };
  }, [detail]);
  const [drag, setDrag] = useState(0);
  const pointer = useRef(null);
  const wheelAt = useRef(0);
  const suppressClick = useRef(false);
  const select = index => setActive((index + items.length) % items.length);

  function finish(event) {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    pointer.current = null;
    setDrag(0);
    if (event.type === 'pointercancel') { suppressClick.current = true; return; }
    const delta = event.clientX - start.x;
    suppressClick.current = Math.abs(delta) > 8;
    if (Math.abs(delta) > 35) select(active + (delta < 0 ? 1 : -1));
  }

  if (detail === 'ecommerce') return <EcommerceCases onBack={returnToCategories}/>;
  if (detail === 'render' || detail === 'poster') return <RenderGallery key={detail} variant={detail} items={detail === 'render' ? renderWorks : undefined} fit={detail === 'render' ? 'natural' : undefined} onBack={returnToCategories}/>;

  return <div className={`product-carousel${returning ? ' is-returning' : ''}`} role="region" aria-roledescription="轮播" aria-label="3D产品视觉分类" tabIndex={0}
    onKeyDown={event => {
      if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
        event.preventDefault();
        select(event.key === 'Home' ? 0 : event.key === 'End' ? 2 : active + (event.key === 'ArrowRight' ? 1 : -1));
      }
    }}
    onWheel={event => {
      const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (Math.abs(delta) < 8 || Date.now() - wheelAt.current < 500) return;
      wheelAt.current = Date.now(); select(active + (delta > 0 ? 1 : -1));
    }}>
    <div className={`product-carousel-stage${drag ? ' is-dragging' : ''}`}
      onPointerDown={event => {
        if (event.button !== 0) return;
        suppressClick.current = false;
        pointer.current = { x: event.clientX, id: event.pointerId };
      }}
      onPointerMove={event => {
        if (pointer.current?.id !== event.pointerId) return;
        const delta = event.clientX - pointer.current.x;
        if (Math.abs(delta) > 8) event.currentTarget.setPointerCapture(event.pointerId);
        setDrag(Math.max(-90, Math.min(90, delta * .3)));
      }}
      onPointerUp={finish} onPointerCancel={finish}
      style={{ '--drag-offset': `${drag}px` }}>
      {items.map((item, index) => {
        const offset = (index - active + 4) % 3 - 1;
        return <div className={`product-carousel-slot slot-${offset === 0 ? 'center' : offset < 0 ? 'left' : 'right'}`} key={item.title}>
          <button type="button" className="product-category-card" data-index={index} aria-label={`选择${item.title}`} aria-pressed={index === active}
            onClick={() => { if (!suppressClick.current) { if (index === active && index === 1) setDetail('ecommerce'); else if (index === active && index === 0) setDetail('render'); else if (index === active && index === 2) setDetail('poster'); else select(index); } suppressClick.current = false; }}>
            <img src={item.src} alt={item.title} draggable={false}/>
          </button>
          {index === active && <p key={active} className="product-category-caption">{item.title}</p>}
        </div>;
      })}
    </div>
    <div className="product-carousel-controls" aria-label="选择作品分类">
      {items.map((item, index) => <button type="button" key={item.title} className={`carousel-dot${index === active ? ' is-active' : ''}`} aria-label={`切换到${item.title}`} aria-pressed={index === active} onClick={() => select(index)}><span/></button>)}
      <span className="carousel-live" role="status" aria-live="polite">{items[active].title}，{active + 1} / 3</span>
    </div>
  </div>;
}






