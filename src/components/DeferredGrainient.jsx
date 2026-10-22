import { lazy, Suspense, useEffect, useRef, useState } from 'react';

const Grainient = lazy(() => import('./Grainient'));

export default function DeferredGrainient(props) {
  const holder = useRef(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const element = holder.current;
    const root = element.closest('.portfolio-root');
    let visible = false;
    const start = () => {
      if (!visible || root.dataset.sceneReady !== 'true') return;
      setActive(true);
      intersection.disconnect();
      opening.disconnect();
    };
    const intersection = new IntersectionObserver(entries => {
      visible = entries.some(entry => entry.isIntersecting);
      start();
    });
    const opening = new MutationObserver(start);
    intersection.observe(element);
    opening.observe(root, { attributes: true, attributeFilter: ['data-scene-ready'] });
    return () => { intersection.disconnect(); opening.disconnect(); };
  }, []);
  return <div className="grainient-viewport" ref={holder}>{active && <Suspense fallback={null}><Grainient {...props}/></Suspense>}</div>;
}
