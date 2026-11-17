'use client';

// Lightweight fade + rise entrance (Framer Motion with the small domAnimation feature set).
import { LazyMotion, domAnimation, m, useReducedMotion } from 'framer-motion';

export default function Reveal({ children, delay = 0, className = '', as = 'div' }) {
  const reduce = useReducedMotion();
  const Comp = m[as] || m.div;
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <LazyMotion features={domAnimation} strict>
      <Comp
        className={className}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </Comp>
    </LazyMotion>
  );
}
