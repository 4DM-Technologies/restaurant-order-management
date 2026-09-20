import type { MouseEvent } from 'react';
import { Minus, Plus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface QuantityControlProps {
  quantity: number;
  onIncrement: (e: MouseEvent<HTMLButtonElement>) => void;
  onDecrement: (e: MouseEvent<HTMLButtonElement>) => void;
  min?: number;
  size?: 'sm' | 'md';
}

export default function QuantityControl({
  quantity,
  onIncrement,
  onDecrement,
  min = 1,
  size = 'md',
}: QuantityControlProps) {
  const isSmall = size === 'sm';

  const btnClass = [
    'flex items-center justify-center rounded-full font-bold',
    'transition-all duration-150 active:scale-90',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soroco-amber',
    isSmall
      ? 'w-7 h-7 text-xs'
      : 'w-9 h-9 text-sm',
  ].join(' ');

  return (
    <div
      className={[
        'inline-flex items-center rounded-full border-2 border-soroco-amber bg-white overflow-hidden',
        isSmall ? 'h-8' : 'h-10',
      ].join(' ')}
      role="group"
      aria-label="Quantity control"
    >
      {/* Decrement */}
      <button
        type="button"
        onClick={onDecrement}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
        className={[
          btnClass,
          quantity <= min
            ? 'text-soroco-linen cursor-not-allowed'
            : 'text-soroco-amber hover:bg-soroco-amber hover:text-white',
        ].join(' ')}
      >
        <Minus className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
      </button>

      {/* Quantity number with animated transition */}
      <div
        className={[
          'relative overflow-hidden flex items-center justify-center font-body font-bold text-soroco-charcoal',
          isSmall ? 'w-7 text-sm' : 'w-10 text-base',
        ].join(' ')}
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={quantity}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0,  opacity: 1 }}
            exit={{  y: -12, opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="block"
          >
            {quantity}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Increment */}
      <button
        type="button"
        onClick={onIncrement}
        aria-label="Increase quantity"
        className={[
          btnClass,
          'text-soroco-amber hover:bg-soroco-amber hover:text-white',
        ].join(' ')}
      >
        <Plus className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
      </button>
    </div>
  );
}
