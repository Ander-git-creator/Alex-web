import { useEffect, useRef, useState } from 'react';
import './EcommerceCases.css';
import EcommerceGallery from './EcommerceGallery';
import { t3Images } from '../data/ecommerceT3';
import { g1exImages } from '../data/ecommerceG1EX';
import { jx09Images } from '../data/ecommerceJX09';
import { fanImages } from '../data/ecommerceFan';
import { vacuumImages } from '../data/ecommerceVacuum';

// Case covers and their main-image / A+ galleries.
const cases = [
  { src: t3Images.square[0].src, squareImages: t3Images.square, wideImages: t3Images.wide, label: 'T3头盔蓝牙耳机', description: '无限可能x轻量科技x骑行守护', position: 'center' },
  { src: g1exImages.square[0].src, squareImages: g1exImages.square, wideImages: g1exImages.wide, label: 'G1EX头盔蓝牙耳机', description: '无界骑行x智慧互联x沉浸声场', position: 'center' },
  { src: jx09Images.square[0].src, squareImages: jx09Images.square, wideImages: jx09Images.wide, label: 'JX09头盔蓝牙耳机', description: '硬核性能x专业通讯x轻量科技', position: 'center' },
  { src: fanImages.square[0].src, squareImages: fanImages.square, wideImages: fanImages.wide, label: 'MINI手持风扇', description: '静谧风感x随行清凉x从容生活', position: 'center' },
  { src: vacuumImages.square[0].src, squareImages: vacuumImages.square, wideImages: vacuumImages.wide, label: '多功能吸尘器', description: '智能净界x深层吸尘x全屋守护', position: 'center' },
];

export default function EcommerceCases({ onBack }) {
  const [gallery, setGallery] = useState(null);
  const opener = useRef(null);
  function openGallery(event, item, format) {
    opener.current = event.currentTarget;
    setGallery({ item, format });
  }
  function closeGallery() {
    setGallery(null);
    requestAnimationFrame(() => opener.current?.focus({ preventScroll: true }));
  }
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef(null);
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  function returnToCategories() {
    if (closeTimer.current !== null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { onBack(); return; }
    setClosing(true);
    closeTimer.current = setTimeout(onBack, 260);
  }
  const back = useRef(null);
  const viewport = useRef(null);
  const gesture = useRef(null);
  const [active, setActive] = useState(0);
  const [dragging, setDragging] = useState(false);
  useEffect(() => { back.current?.focus({ preventScroll: true }); }, []);
  function getStep() {
    const el = viewport.current;
    return el.querySelector('.ecommerce-slide').offsetHeight + parseFloat(getComputedStyle(el).rowGap);
  }
  function goTo(index) {
    const el = viewport.current;
    const next = Math.max(0, Math.min(cases.length - 1, index));
    el.scrollTo({ top: next * getStep(), behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }
  function finish(event) {
    const start = gesture.current;
    if (!start || start.id !== event.pointerId) return;
    gesture.current = null;
    setDragging(false);
    const el = viewport.current;
    el.style.scrollSnapType = '';
    const delta = start.y - event.clientY;
    const next = Math.abs(delta) > 30 && event.type !== 'pointercancel' ? start.index + (delta > 0 ? 1 : -1) : Math.round(el.scrollTop / getStep());
    goTo(next);
  }
  return <><section hidden={Boolean(gallery)} className={`ecommerce-cases${closing ? ' is-closing' : ''}`} aria-label="电商视觉案例展示">
    <button type="button" ref={back} className="ecommerce-back" onClick={returnToCategories} aria-label="返回3D产品视觉分类">← 返回分类</button>
    <div className={`ecommerce-viewport${dragging ? ' is-dragging' : ''}`} ref={viewport} tabIndex={0} aria-label="上下滚动或拖动浏览五组案例"
      onScroll={event => setActive(Math.max(0, Math.min(cases.length - 1, Math.round(event.currentTarget.scrollTop / getStep()))))}
      onKeyDown={event => {
        if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          goTo(event.key === 'Home' ? 0 : event.key === 'End' ? 4 : active + (['ArrowDown', 'PageDown'].includes(event.key) ? 1 : -1));
        }
      }}
      onPointerDown={event => {
        if (event.target.closest('.ecommerce-case-open')) return;
        if (event.pointerType !== 'mouse' || event.button !== 0) return;
        gesture.current = { id: event.pointerId, y: event.clientY, top: event.currentTarget.scrollTop, index: active };
        event.currentTarget.style.scrollSnapType = 'none';
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(true);
      }}
      onPointerMove={event => {
        const start = gesture.current;
        if (start?.id === event.pointerId) event.currentTarget.scrollTop = start.top + (start.y - event.clientY) * 1.15;
      }} onPointerUp={finish} onPointerCancel={finish}>
      {cases.map((item, index) => <article className={`ecommerce-slide${index === active ? ' is-active' : ''}`} key={item.src} aria-label={`案例 ${index + 1}：${item.label}`}>
        <div className="ecommerce-layout">
          <div className="ecommerce-intro">
            <span className="ecommerce-eyebrow">AMAZON</span>
            <h2>{item.label}</h2>
            <p>{item.description}</p>
          </div>
          <div className="ecommerce-images">
            <button type="button" className="ecommerce-case-open ecommerce-square" aria-label={`查看${item.label}方图画廊`} onClick={event => openGallery(event, item, 'square')}><img src={item.src} alt={`${item.label}方形展示`} draggable={false} style={{ objectPosition: item.position }}/></button>
            <button type="button" className="ecommerce-case-open ecommerce-wide" aria-label={`查看${item.label}横图画廊`} onClick={event => openGallery(event, item, 'wide')}><img src={item.wideImages?.[0]?.src || item.src} alt={`${item.label}横幅展示`} draggable={false}/></button>
          </div>
        </div>
      </article>)}
    </div>
    <nav className="ecommerce-pagination" aria-label="案例分页">
      {cases.map((item, index) => <button type="button" key={item.src} aria-label={`查看第${index + 1}组案例`} aria-current={index === active ? 'true' : undefined} className={index === active ? 'is-active' : ''} onClick={() => goTo(index)}><span/></button>)}
    </nav>
  </section>{gallery && <EcommerceGallery item={gallery.item} format={gallery.format} onBack={closeGallery}/>}</>;
}


