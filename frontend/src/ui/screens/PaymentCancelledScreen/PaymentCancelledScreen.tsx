import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, ShoppingCart } from 'lucide-react';
import type { CheckoutOrderState } from '@/ui/screens/CheckoutScreen/CheckoutScreen.vm';

/* ── Helpers ── */
function formatPrice(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

/* ── Main Screen ── */
export default function PaymentCancelledScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const order = location.state as CheckoutOrderState | null;

  const handleTryAgain = () => {
    navigate('/payment', { state: order });
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-soroco-cream to-soroco-parchment flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="bg-white rounded-3xl shadow-warm-xl border border-amber-100 p-8 text-center"
        >
          {/* Animated warning icon */}
          <div className="flex items-center justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
              className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22, delay: 0.25 }}
              >
                <AlertTriangle className="w-12 h-12 text-amber-500 stroke-[2]" />
              </motion.div>
            </motion.div>
          </div>

          {/* Title & messages */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <h1 className="font-display text-3xl font-bold text-soroco-charcoal mb-3">
              Payment Cancelled
            </h1>
            <p className="font-body text-soroco-mocha leading-relaxed">
              You cancelled the payment. No worries — you can try again anytime.
            </p>
          </motion.div>

          {/* Info card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="mt-6 flex items-center gap-3 px-4 py-3 bg-soroco-parchment rounded-xl border border-soroco-linen"
          >
            <ShoppingCart className="w-4 h-4 text-soroco-amber shrink-0" />
            <p className="text-sm font-body text-soroco-mocha text-left">
              Your items are still in your cart and ready to order.
            </p>
          </motion.div>

          {/* Amount display */}
          {order && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.4 }}
              className="mt-5 py-4 border border-soroco-linen rounded-2xl bg-soroco-parchment/50"
            >
              <p className="text-xs text-soroco-tan font-body uppercase tracking-wider mb-1">
                Amount (not charged)
              </p>
              <p className="font-display font-bold text-soroco-espresso text-2xl">
                {formatPrice(order.total)}
              </p>
            </motion.div>
          )}

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.4 }}
            className="mt-8 flex flex-col gap-3"
          >
            <button
              type="button"
              onClick={handleTryAgain}
              className="btn-primary w-full gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
            <button
              type="button"
              onClick={handleBackToCart}
              className="btn-secondary w-full gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Back to Cart
            </button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
