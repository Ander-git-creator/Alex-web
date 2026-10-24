import { useRef } from 'react';
import Hero from './components/Hero';
import About from './components/About';
import Works from './components/Works';
import Strengths from './components/Strengths';
import Contact from './components/Contact';
import Navigation from './components/Navigation';
import DeferredGrainient from './components/DeferredGrainient';
import usePortfolioMotion from './motion/usePortfolioMotion';
import PortfolioLoader from './components/PortfolioLoader';


export default function App() {
  const root = useRef(null);
  usePortfolioMotion(root);
  return <div ref={root} className="portfolio-root">
    <PortfolioLoader rootRef={root}/>
    <a className="skip-link" href="#about">跳至个人介绍</a>
    <Navigation/>
    <main>
      <Hero/>
      <div className="content-background site-glow">
        <div className="grainient-backdrop" aria-hidden="true">
            <DeferredGrainient
              dpr={1}
              colors={['#120f17', '#0f1901', '#060802', '#11020b', '#041c20']}
              angle={162}
              flow={1.15}
              silk={0.75}
              grainAmount={0.08}
              speed={2.45}
              grainSize={0.5}
              interactive={false}
              stir={1.65}
              clickSwirl={false}
            />
        </div>
        <About/>
        <Works/>
        <Strengths/>
        <Contact/>
      </div>
    </main>
  </div>;
}



