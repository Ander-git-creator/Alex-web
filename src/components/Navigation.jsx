import { useState, useEffect } from 'react';
import GooeyNav from './GooeyNav';
import BellToggle from './BellToggle';
export function Brand() { return <span className="brand"><img className="brand-avatar" src="/assets/header-logo.png" alt=""/><span className="brand-word">xiaoF</span></span>; }
const navItems = [['about', '工作经历'], ['works', '精选作品'], ['strengths', '个人优势']];
export default function Navigation() {
  const [active, setActive] = useState('home');
  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) setActive(entry.target.id); }), { rootMargin: '-20% 0px -55% 0px' });
    document.querySelectorAll('main section[id]').forEach(section => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  const activeIndex = Math.max(0, navItems.findIndex(([id]) => id === active));
  const neutralNav = !navItems.some(([id]) => id === active);
  const gooeyProps = { theme: 'dark', color: '#c4ff24', activeTextColor: '#101700', colors: ['#c4ff24', '#b7ef38', '#8fbe1f'], size: 'md', frame: false, particleCount: 12, spread: 48, animationTime: 560, timeVariance: 220, gooeyness: 0.56, wobble: 0.45, hoverEffect: true };
  return <header className={`navigation${neutralNav ? ' nav-neutral' : ''}${active === 'contact' ? ' contact-active' : ''}`}><a href="#home" aria-label="XiaoF 首页" onClick={() => setActive('home')}><Brand/></a><GooeyNav {...gooeyProps} items={navItems.map(([id, label]) => ({ label, href: `#${id}` }))} activeIndex={activeIndex} onChange={(_, item) => setActive(item.href.slice(1))} initialActiveIndex={0}/><BellToggle offLabel="联系我" onLabel="联系我" label="联系我" color="#f5f5f5" background="rgba(255, 255, 255, 0.12)" onColor="#101700" onBackground="#c4ff24" badge={false} pressed={active === 'contact'} onChange={() => { setActive('contact'); if (window.location.hash !== '#contact') window.history.pushState(null, '', '#contact'); document.getElementById('contact')?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' }); }} /></header>;
}







