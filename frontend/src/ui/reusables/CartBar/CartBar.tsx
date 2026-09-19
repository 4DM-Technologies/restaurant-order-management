import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAppSelector } from '@/store/hooks.ts';

export default function CartBar() {
  const navigate  = useNavigate();
  const cartItems = useAppSelector((s) => s.cart.items);

  const itemCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const total     = cartItems.reduce((acc, i) => acc + i.totalPrice, 0);

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          key="cart-bar"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{  y: '100%', opacity: 0 }}
          transition={{ type: 'tween', duration: 0.32, ease: [0.32, 0.72, 0, 1] }}
          className="sticky-cart-bar"
        >
          <button
            type="button"
            onClick={() => navigate('/cart')}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-soroco-mocha/20 transition-colors active:bg-soroco-mocha/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soroco-cream focus-visible:ring-inset"
            aria-label={`View cart — ${itemCount} item${itemCount !== 1 ? 's' : ''}, ₹${total.toFixed(2)}`}
          >
            {/* Left: bag + item count */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingBag className="w-6 h-6 text-soroco-cream" aria-hidden="true" />
                <span
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-soroco-amber rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                  aria-hidden="true"
                >
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              </div>
              <span className="font-body font-semibold text-soroco-cream text-sm">
                {itemCount} item{itemCount !== 1 ? 's' : ''} in cart
              </span>
            </div>

            {/* Right: total + arrow */}
            <div className="flex items-center gap-2">
              <span className="font-body font-bold text-soroco-cream text-base">
                ₹{total.toFixed(2)}
              </span>
              <ArrowRight className="w-5 h-5 text-soroco-cream/70" aria-hidden="true" />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
