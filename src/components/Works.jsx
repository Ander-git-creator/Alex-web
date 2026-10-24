import { lazy, Suspense, useRef, useState, useEffect } from 'react';
import { projects } from '../data/portfolio';
import Artwork from './Artwork';
import TiltedCard from './WorksTiltedCard';
import GlareHover from './GlareHover';
import './ProductCarousel.css';

import SectionHeading from './SectionHeading';
const ProductCarousel = lazy(() => import('./ProductCarousel'));
const RenderGallery = lazy(() => import('./RenderGallery'));
const MotionGallery = lazy(() => import('./MotionGallery'));
import { aiWorkGroups } from '../data/aiWorks';

const projectGalleryItems = projects.map(item => ({ src: item.media.src, alt: item.title, title: item.title }));
export default function Works() {
  const [project,setProject] = useState(null);
  const dialog = useRef(null);
  useEffect(() => { if (project) { dialog.current.showModal(); document.body.style.overflow='hidden'; } return () => { document.body.style.overflow=''; }; }, [project]);
  const closeTimer = useRef(null);
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  function close() {
    const panel = dialog.current;
    if (!panel?.open || closeTimer.current !== null) return;
    const finish = () => {
      panel.close();
      panel.classList.remove('is-closing');
      closeTimer.current = null;
      setProject(null);
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { finish(); return; }
    panel.classList.add('is-closing');
    closeTimer.current = setTimeout(finish, 280);
  }
  return <section id="works" className="works section container"><SectionHeading title="SELECTED WORKS" subtitle="精选视觉作品"/><div className="works-grid">{projects.map((item,i) => <div className={`motion-card work-reveal project-${i}`} data-motion-card key={item.id}><TiltedCard className="work-tilt" containerWidth="100%" containerHeight="100%" imageWidth="100%" imageHeight="100%" altText={item.title} rotateAmplitude={8} scaleOnHover={1.05} glare={0} shadow={0.5} radius={28} showTooltip={false} intro={false} gyroscope={false} onClick={() => setProject(item)}><GlareHover className="project-card" width="100%" height="100%" borderRadius="28px" mode="follow" variant="sheen" glareColor="#ffffff" glareOpacity={0.5} glareSize={30} softness={0.6} glareAngle={-45} blendMode="soft-light" rimGlint={false} transitionDuration={650}><div className="project-image"><div className="project-image-reveal"><div className="project-image-drift"><Artwork media={item.media} alt={item.title}/></div></div></div><div className="project-tint"/><div className="project-caption"><div><h3>{item.title}</h3><p>{item.tags}</p></div></div></GlareHover></TiltedCard></div>)}</div><dialog ref={dialog} className="project-dialog product-dialog" aria-label={project?.title || '作品详情'} onCancel={event => { event.preventDefault(); close(); }} onClick={event => { if(event.target === dialog.current) close(); }}><button className="dialog-close" onClick={close} aria-label="关闭作品详情">×</button><Suspense fallback={<div className="project-dialog-loading" role="status">作品加载中…</div>}>{project?.id === 'product' ? <><h2>3D产品视觉</h2><ProductCarousel/></> : project?.id === 'brand' ? <MotionGallery/> : project && <RenderGallery key={project.id} label={`${project.title}作品展示`} showBack={false} fit={project.id === 'space' ? 'natural' : 'portrait'} groups={project.id === 'space' ? aiWorkGroups : undefined} items={project.id === 'space' ? undefined : [projectGalleryItems[projects.indexOf(project)], ...projectGalleryItems.filter(item => item.src !== project.media.src)]} onBack={close}/>}</Suspense></dialog></section>;
}




