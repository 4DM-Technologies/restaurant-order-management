import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleAlert, RefreshCw, ShoppingCart } from 'lucide-react';
import type { CheckoutOrderState } from '@/ui/screens/CheckoutScreen/CheckoutScreen.vm';

/* ── Helpers ── */
function formatPrice(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

/* ── Main Screen ── */
export default function PaymentFailedScreen() {
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-soroco-cream to-soroco-parchment flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="bg-white rounded-3xl shadow-warm-xl border border-red-100 p-8 text-center"
        >
          {/* Animated error icon */}
          <div className="flex items-center justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
              className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: 45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 22, delay: 0.25 }}
              >
                <CircleAlert className="w-12 h-12 text-red-600 stroke-[2]" />
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
              Payment Failed
            </h1>
            <p className="font-body text-soroco-mocha leading-relaxed mb-2">
              We couldn't process your payment.
            </p>
          </motion.div>

          {/* Info cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="mt-5 space-y-3"
          >
            <div className="flex items-center gap-3 px-4 py-3 bg-green-50 rounded-xl border border-green-100">
              <div className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <p className="text-sm font-body text-green-700 text-left">
                No amount was charged to your account.
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 bg-soroco-parchment rounded-xl border border-soroco-linen">
              <ShoppingCart className="w-4 h-4 text-soroco-amber shrink-0" />
              <p className="text-sm font-body text-soroco-mocha text-left">
                Your cart is still saved. Ready when you are.
              </p>
            </div>
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
                Amount
              </p>
              <p className="font-body font-bold text-soroco-espresso text-2xl">
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
