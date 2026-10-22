import { useRef } from 'react';
import { motion, useReducedMotion, useSpring } from 'motion/react';
import './TiltedCard.css';

// Adapted from the supplied React Bits TiltedCard to host live card content.
const springValues = { damping: 30, stiffness: 100, mass: 2 };

export default function TiltedCard({ children, rotateAmplitude = 12, scaleOnHover = 1.03 }) {
  const ref = useRef(null);
  const reduceMotion = useReducedMotion();
  const rotateX = useSpring(0, springValues);
  const rotateY = useSpring(0, springValues);
  const scale = useSpring(1, springValues);

  function reset() {
    rotateX.set(0);
    rotateY.set(0);
    scale.set(1);
  }

  function handlePointerMove(event) {
    if (reduceMotion || event.pointerType !== 'mouse' || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const offsetX = Math.max(-1, Math.min(1, (event.clientX - rect.left - rect.width / 2) / (rect.width / 2)));
    const offsetY = Math.max(-1, Math.min(1, (event.clientY - rect.top - rect.height / 2) / (rect.height / 2)));
    rotateX.set(-offsetY * rotateAmplitude);
    rotateY.set(offsetX * rotateAmplitude);
    scale.set(scaleOnHover);
  }

  return <div ref={ref} className="tilted-card-figure"
    onPointerMove={handlePointerMove} onPointerLeave={reset} onPointerCancel={reset}>
    <motion.div className="tilted-card-inner"
      style={reduceMotion ? undefined : { rotateX, rotateY, scale }}>
      {children}
    </motion.div>
  </div>;
}
