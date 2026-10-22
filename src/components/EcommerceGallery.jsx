import { useEffect, useRef, useState } from 'react';
import './EcommerceGallery.css';

export default function EcommerceGallery({ item, format, onBack, showBack = true, imageScale = 1 }) {
  // Temporary empty slots demonstrate scrolling until case images are supplied.
  // Replace with squareImages / wideImages on each case; dots follow their length.
  const images = item[`${format}Images`]?.length ? item[`${format}Images`] : Array.from({ length: 5 }, () => ({ src: null }));
  const [active, setActive] = useState(0);
  const [imageRatios, setImageRatios] = useState({});
  const viewport = useRef(null);
  const back = useRef(null);
  const gesture = useRef(null);
  const suppressClick = useRef(false);
  const imageButtons = useRef([]);
  const title = `${item.label} · ${format === 'square' ? '方图' : '横图'}`;

  function getStep() { return viewport.current.querySelector('.ecommerce-gallery-slide').offsetHeight; }
  function updateStack() {
    const el = viewport.current;
    const progress = el.scrollTop / getStep();
    setActive(Math.max(0, Math.min(images.length - 1, Math.round(progress))));
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    imageButtons.current.forEach((button, index) => {
      if (!button) return;
      const offset = Math.max(-2, Math.min(2, index - progress));
      const distance = Math.abs(offset);
      button.style.transform = reduced ? 'none' : `translateZ(${-distance * 140}px) rotateX(${offset * -34}deg) scale(${1 - distance * .06})`;
      button.style.filter = `brightness(${1 - Math.min(distance, 2) * .2})`;
      button.parentElement.style.zIndex = String(100 - Math.round(distance * 30));
    });
  }
  useEffect(() => {
    const el = viewport.current;
    const measure = () => {
      const oldStep = parseFloat(el.style.getPropertyValue('--gallery-step'));
      const index = oldStep ? Math.round(el.scrollTop / oldStep) : 0;
      const ratios = images.map((image, index) => image.cardAspectRatio || imageRatios[index] || image.aspectRatio || (format === 'square' ? 1 : 2.44));
      // Use one width for the stack, allowing taller A+ artwork to fill the viewport.
      const width = Math.min(el.clientWidth - 40, format === 'square' ? 800 : 1200, el.clientHeight * (format === 'square' ? .62 : .94) * Math.min(...ratios)) * imageScale;
      imageButtons.current.forEach((button, index) => {
        if (!button) return;
        const ratio = ratios[index];
        button.style.setProperty('--gallery-card-width', `${width}px`);
        button.style.setProperty('--gallery-card-height', `${width / ratio}px`);
      });
      // Keep the original overlap based on the shorter cards, even with a tall cover.
      el.style.setProperty('--gallery-step', `${Math.round(width / Math.max(...ratios) * .68)}px`);
      el.scrollTop = index * getStep();
      updateStack();
    };
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    measure();
    return () => observer.disconnect();
  }, [format, images.length, imageRatios, imageScale]);

  useEffect(() => { (showBack ? back.current : viewport.current)?.focus({ preventScroll: true }); }, [showBack]);

  function goTo(index) {
    const next = Math.max(0, Math.min(images.length - 1, index));
    const el = viewport.current;
    el.scrollTo({ top: next * getStep(), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  function finish(event) {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    gesture.current = null;
    const el = viewport.current;
    el.style.scrollSnapType = '';
    const delta = start.y - event.clientY;
    suppressClick.current = Math.abs(delta) > 8 || event.type === 'pointercancel';
    goTo(Math.abs(delta) > 30 && event.type !== 'pointercancel' ? start.index + (delta > 0 ? 1 : -1) : Math.round(el.scrollTop / getStep()));
  }

  return <section className={`ecommerce-gallery ecommerce-gallery--${format}`} aria-label={title}>
    {showBack && <button type="button" ref={back} className="ecommerce-gallery-back" onClick={onBack}>← 返回案例</button>}
    <div className="ecommerce-gallery-viewport" ref={viewport} tabIndex={0} aria-label={`${title}，上下滑动浏览`}
      onScroll={updateStack}
      onKeyDown={event => {
        if (!['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        goTo(event.key === 'Home' ? 0 : event.key === 'End' ? images.length - 1 : active + (['ArrowDown', 'PageDown'].includes(event.key) ? 1 : -1));
      }}
      onPointerDown={event => {
        suppressClick.current = false;
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        gesture.current = { id: event.pointerId, y: event.clientY, top: event.currentTarget.scrollTop, index: active };
      }}
      onPointerMove={event => {
        const start = gesture.current;
        if (start?.id !== event.pointerId || Math.abs(start.y - event.clientY) <= 8) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        event.currentTarget.style.scrollSnapType = 'none';
        event.currentTarget.scrollTop = start.top + start.y - event.clientY;
      }} onPointerUp={finish} onPointerCancel={finish}>
      {images.map((image, index) => <div className="ecommerce-gallery-slide" key={`${image.src}-${index}`}>
        <button type="button" className="ecommerce-gallery-image" ref={el => { imageButtons.current[index] = el; }} aria-label={`查看${item.label}第${index + 1}张图片`}
          onClick={() => { if (!suppressClick.current && index !== active) goTo(index); }}>
          {image.src ? <img src={image.src} alt={image.alt || item.label} draggable={false} onLoad={event => { const ratio = event.currentTarget.naturalWidth / event.currentTarget.naturalHeight; setImageRatios(previous => previous[index] === ratio ? previous : { ...previous, [index]: ratio }); }}/> : <span className="ecommerce-gallery-placeholder" aria-label="图片待添加"/>}
        </button>
      </div>)}
    </div>
    <nav className="ecommerce-pagination ecommerce-gallery-pagination" aria-label="画廊分页">
      {images.map((image, index) => <button type="button" key={`${image.src}-${index}`} aria-label={`查看第${index + 1}张图片`} aria-current={active === index ? 'true' : undefined} className={active === index ? 'is-active' : ''} onClick={() => goTo(index)}><span/></button>)}
    </nav>
  </section>;
}
