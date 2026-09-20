import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PHRASES = [
  'Brewing fresh coffee…',
  'Grinding the beans…',
  'Pouring your order…',
  'Warming the cups…',
  'Almost ready…',
];

interface BrandLoaderProps {
  variant?: 'full' | 'inline';
  message?: string;
  className?: string;
}

export default function BrandLoader({
  variant = 'full',
  message,
  className = '',
}: BrandLoaderProps) {
  const [phraseIdx, setPhraseIdx] = useState(0);

  useEffect(() => {
    if (variant !== 'full') return;
    const t = setInterval(() => setPhraseIdx((i) => (i + 1) % PHRASES.length), 1900);
    return () => clearInterval(t);
  }, [variant]);

  const large = variant === 'full';

  const cup = (
    <div
      className={`relative ${large ? 'w-28 h-28' : 'w-16 h-16'}`}
      role="status"
      aria-label="Loading, please wait"
    >
      {/* Steam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-2.5" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-1 rounded-full bg-soroco-tan/70 animate-steam ${
              large ? 'h-7' : 'h-4'
            }`}
            style={{ animationDelay: `${i * 0.45}s`, filter: 'blur(0.5px)' }}
          />
        ))}
      </div>

      {/* Aroma rings */}
      <div
        className="absolute inset-0 rounded-full border-2 border-soroco-amber/40 animate-ring"
        aria-hidden="true"
      />

      {/* Cup body */}
      <div className="absolute inset-x-0 bottom-0 h-[70%]" aria-hidden="true">
        {/* Handle */}
        <div
          className={`absolute -right-2 top-[18%] rounded-full border-2 border-soroco-sienna/70 ${
            large ? 'w-7 h-7' : 'w-4 h-4'
          }`}
        />
        {/* Bowl */}
        <div className="absolute inset-x-0 top-3 bottom-0 rounded-b-[1.6rem] rounded-t-md bg-gradient-to-b from-soroco-espresso to-soroco-charcoal shadow-warm-md overflow-hidden">
          {/* Rim */}
          <div className="absolute inset-x-0 top-0 h-2 bg-soroco-mocha/80 rounded-t-sm" />
          {/* Coffee surface */}
          <div className="absolute inset-x-1.5 bottom-1 top-4 rounded-b-[1.4rem] bg-gradient-to-b from-soroco-amber to-soroco-sienna/90">
            <div
              className={`absolute inset-x-0 top-0 h-1.5 rounded-full bg-gradient-to-r from-soroco-tan to-soroco-amber animate-surface ${
                large ? 'h-2' : 'h-1'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === 'inline') {
    return (
      <div
        className={`w-full flex flex-col items-center justify-center gap-4 ${className}`}
      >
        {cup}
        <p className="font-body text-soroco-mocha text-sm font-medium">
          {message ?? 'Brewing the menu…'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soroco-cream flex flex-col items-center justify-center gap-7 px-6">
      <div className="relative">
        {cup}
        <div
          className="absolute inset-0 rounded-full border border-soroco-amber/20 animate-ring"
          aria-hidden="true"
          style={{ animationDelay: '1.1s' }}
        />
      </div>

      <div className="text-center">
        <p className="font-display text-2xl sm:text-3xl font-bold text-soroco-espresso tracking-tight">
          Soroco House
        </p>
        <div className="h-6 mt-2.5 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.p
              key={phraseIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="font-body text-soroco-mocha text-sm"
            >
              {message ?? PHRASES[phraseIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}