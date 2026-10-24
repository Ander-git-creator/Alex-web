import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { strengths } from '../data/portfolio';
import SectionHeading from './SectionHeading';
import FlipCard from './FlipCard';
import './Strengths.css';

function CardHeading({ item, index }) {
  return <>
    <div className="strength-flip-meta">
      <span>0{index + 1}</span><span>{index < 2 ? 'CORE' : 'SYSTEM'}</span>
    </div>
    <h3>{item.title}<span aria-hidden="true">•</span></h3>
  </>;
}

function StrengthCard({ item, index }) {
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    if (!flipped || !window.matchMedia('(max-width: 760px), (hover: none)').matches) return;
    const timer = setTimeout(() => setFlipped(false), 4000);
    return () => clearTimeout(timer);
  }, [flipped]);
  const reduceMotion = useReducedMotion();
  const angles = index === 1 || index === 4 ? [6, -7, 5] : [-6, 6, -3];

  return <FlipCard
    className={`strength-flip strength-flip-${index}`}
    flipped={flipped}
    onFlipChange={setFlipped}
    resetOnPointerLeave
    axis="y"
    tiltMax={5}
    hoverScale={1.015}
    glareOpacity={0.09}
    perspective={1400}
    stiffness={170}
    damping={24}
    radius={28}
    shadow={false}
    ariaLabel={`${item.title}，点击或拖动翻牌查看${flipped ? '简介' : '能力详情'}`}
    front={<div className="strength-flip-content strength-flip-front">
      <CardHeading item={item} index={index} />
      <p>{item.description}</p>
      <div className={`strength-sculpture sculpture-${item.shape}`} aria-hidden="true">
        <i /><i /><i /><i /><span>✦</span>
      </div>
    </div>}
    back={<div className="strength-flip-content strength-flip-back">
      <CardHeading item={item} index={index} />
      <div className="strength-bubbles">
        {item.details.map((detail, bubbleIndex) => <motion.span
          key={detail}
          className={`strength-bubble strength-bubble-${bubbleIndex}`}
          initial={false}
          animate={flipped
            ? { opacity: 1, scale: 1, y: 0, rotate: angles[bubbleIndex] }
            : { opacity: 0, scale: 0.2, y: 35, rotate: 0 }}
          transition={reduceMotion
            ? { duration: 0 }
            : flipped
              ? { duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.2 + bubbleIndex * 0.12 }
              : { duration: 0.12 }}
        >{detail}</motion.span>)}
      </div>
    </div>}
  />;
}

export default function Strengths() {
  return <section id="strengths" className="strengths section container">
    <SectionHeading title="CORE STRENGTHS" subtitle="个人优势" />
    <div className="strengths-grid">
      {strengths.map((item, index) => <div className={`motion-card strength-reveal strength-reveal-${index}`} data-motion-card key={item.title}><StrengthCard item={item} index={index} /></div>)}
    </div>
  </section>;
}

