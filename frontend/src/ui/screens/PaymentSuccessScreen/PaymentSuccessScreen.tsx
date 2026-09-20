import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShoppingBag, X } from 'lucide-react';
import { useAppDispatch } from '@/store/hooks.ts';
import { clearCart } from '@/store/slices/cartSlice.ts';
import type { CheckoutOrderState } from '@/ui/screens/CheckoutScreen/CheckoutScreen.vm';

/* ── Helpers ── */
function formatPrice(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

/* ── Confetti particle ── */
interface ConfettiDotProps {
  color: string;
  x: number;
  delay: number;
  duration: number;
}

function ConfettiDot({ color, x, delay, duration }: ConfettiDotProps) {
  return (
    <motion.div
      className="absolute top-0 rounded-full"
      style={{
        left: `${x}%`,
        width: Math.random() * 8 + 4,
        height: Math.random() * 8 + 4,
        backgroundColor: color,
      }}
      initial={{ y: -20, opacity: 1, rotate: 0 }}
      animate={{
        y: ['0%', '120vh'],
        opacity: [1, 1, 0],
        rotate: [0, Math.random() * 360 * (Math.random() > 0.5 ? 1 : -1)],
        x: [0, (Math.random() - 0.5) * 80],
      }}
      transition={{
        duration,
        delay,
        ease: 'easeIn',
        repeat: Infinity,
        repeatDelay: 3,
      }}
    />
  );
}

const CONFETTI_COLORS = [
  '#C8956C', // soroco-amber
  '#FFD700', // gold
  '#6EE7B7', // green
  '#93C5FD', // blue
  '#F9A8D4', // pink
  '#FCD34D', // yellow
  '#A78BFA', // purple
  '#34D399', // emerald
];

function ConfettiRain() {
  const dots = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    x: Math.random() * 100,
    delay: Math.random() * 2,
    duration: Math.random() * 2 + 2,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {dots.map((dot) => (
        <ConfettiDot key={dot.id} {...dot} />
      ))}
    </div>
  );
}

/* ── Order Details Modal ── */
interface OrderDetailsModalProps {
  order: CheckoutOrderState;
  onClose: () => void;
}

function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        {/* Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: 'spring', stiffness: 380, damping: 28 }}
          className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-soroco-linen">
            <h2 className="font-display text-xl font-semibold text-soroco-charcoal">
              Order Details
            </h2>
            <button
              onClick={onClose}
              className="btn-icon"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-soroco-mocha" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-6 max-h-[70vh] overflow-y-auto no-scrollbar">
            {/* Meta */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-soroco-parchment rounded-xl p-3">
                <p className="text-xs text-soroco-tan font-body uppercase tracking-wider mb-0.5">Order</p>
                <p className="font-body font-semibold text-soroco-espresso text-sm">{order.orderNumber}</p>
              </div>
              <div className="bg-soroco-parchment rounded-xl p-3">
                <p className="text-xs text-soroco-tan font-body uppercase tracking-wider mb-0.5">Table</p>
                <p className="font-body font-semibold text-soroco-espresso text-sm">{order.tableNumber}</p>
              </div>
              <div className="bg-soroco-parchment rounded-xl p-3">
                <p className="text-xs text-soroco-tan font-body uppercase tracking-wider mb-0.5">Name</p>
                <p className="font-body font-semibold text-soroco-espresso text-sm truncate">{order.customerName}</p>
              </div>
              <div className="bg-soroco-parchment rounded-xl p-3">
                <p className="text-xs text-soroco-tan font-body uppercase tracking-wider mb-0.5">Payment</p>
                <p className="font-body font-semibold text-soroco-espresso text-sm">{order.paymentMethod}</p>
              </div>
            </div>

            {/* Items */}
            <h3 className="font-display text-base font-semibold text-soroco-charcoal mb-3">
              Items Ordered
            </h3>
            <ul className="space-y-2 mb-5">
              {order.items.map((item) => (
                <li key={item.cartItemId} className="flex items-center gap-3 py-2 border-b border-soroco-linen last:border-0">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-body font-medium text-soroco-charcoal truncate">{item.name}</p>
                    {item.variant && (
                      <p className="text-xs text-soroco-tan">{item.variant}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-soroco-tan">×{item.quantity}</p>
                    <p className="text-sm font-semibold text-soroco-espresso">{formatPrice(item.totalPrice)}</p>
                  </div>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="space-y-2 bg-soroco-parchment rounded-xl p-4">
              <div className="flex justify-between text-sm font-body text-soroco-mocha">
                <span>Subtotal</span>
                <span className="font-medium">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-body text-soroco-mocha">
                <span>Tax (5%)</span>
                <span className="font-medium">{formatPrice(order.tax)}</span>
              </div>
              <div className="border-t border-soroco-linen pt-2 flex justify-between font-body font-bold text-soroco-charcoal">
                <span>Total Paid</span>
                <span className="text-soroco-espresso">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ── Main Screen ── */
export default function PaymentSuccessScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const order = location.state as CheckoutOrderState | null;

  const [showModal, setShowModal] = useState(false);

  const handleBackToMenu = () => {
    dispatch(clearCart());
    navigate('/menu');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-soroco-cream via-soroco-parchment to-soroco-linen flex items-center justify-center p-4 relative overflow-hidden">
      <ConfettiRain />

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="bg-white rounded-3xl shadow-warm-xl border border-soroco-linen p-8 text-center"
        >
          {/* Animated checkmark */}
          <div className="flex items-center justify-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.15 }}
              className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.3 }}
              >
                <Check className="w-12 h-12 text-green-600 stroke-[2.5]" />
              </motion.div>
            </motion.div>
          </div>

          {/* Texts */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
          >
            <h1 className="font-display text-3xl font-bold text-soroco-charcoal mb-2">
              Payment Successful!
            </h1>
            <p className="font-body text-soroco-mocha text-sm leading-relaxed">
              Your order has been placed. Our kitchen is getting started!
            </p>
          </motion.div>

          {/* Order info cards */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="mt-6 grid grid-cols-3 gap-3"
          >
            <div className="bg-soroco-parchment rounded-2xl p-3">
              <p className="text-xs text-soroco-tan font-body uppercase tracking-wider mb-1">Order</p>
              <p className="font-body font-bold text-soroco-espresso text-sm">
                {order?.orderNumber ?? '—'}
              </p>
            </div>
            <div className="bg-soroco-parchment rounded-2xl p-3">
              <p className="text-xs text-soroco-tan font-body uppercase tracking-wider mb-1">Table</p>
              <p className="font-body font-bold text-soroco-espresso text-sm">
                {order?.tableNumber ?? '—'}
              </p>
            </div>
            <div className="bg-soroco-parchment rounded-2xl p-3">
              <p className="text-xs text-soroco-tan font-body uppercase tracking-wider mb-1">Total</p>
              <p className="font-body font-bold text-soroco-espresso text-sm">
                {order ? formatPrice(order.total) : '—'}
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75, duration: 0.4 }}
            className="mt-8 flex flex-col gap-3"
          >
            {order && (
              <button
                type="button"
                onClick={() => setShowModal(true)}
                className="btn-secondary w-full gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                View Order Details
              </button>
            )}
            <button
              type="button"
              onClick={handleBackToMenu}
              className="btn-primary w-full"
            >
              Back to Menu
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Order details modal */}
      {showModal && order && (
        <OrderDetailsModal order={order} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
}
