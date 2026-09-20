import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  x?: number;
  className?: string;
}

export default function Reveal({ children, delay = 0, y = 36, x = 0, className }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y, x, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: false, margin: '-10% 0px -10% 0px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}