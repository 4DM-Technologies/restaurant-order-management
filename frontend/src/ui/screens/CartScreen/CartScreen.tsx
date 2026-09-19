import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '@/ui/reusables/Navbar/Navbar';
import EmptyState from '@/ui/reusables/EmptyState/EmptyState';
import QuantityControl from '@/ui/reusables/QuantityControl/QuantityControl';
import { useCartVM } from '@/ui/screens/CartScreen/CartScreen.vm';
import type { CartItemBO } from '@/types/cart/CartItemBO.ts';

/* ── Helpers ── */
function formatPrice(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

/* ── Cart Item Row ── */
interface CartItemRowProps {
  item: CartItemBO;
  onIncrement: ReturnType<ReturnType<typeof useCartVM>['handleIncrement']>;
  onDecrement: ReturnType<ReturnType<typeof useCartVM>['handleDecrement']>;
  onRemove: () => void;
}

function CartItemRow({ item, onIncrement, onDecrement, onRemove }: CartItemRowProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-warm border border-soroco-linen"
    >
      {/* Image */}
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden shrink-0 bg-soroco-parchment">
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-soroco-tan">
            <ShoppingCart className="w-8 h-8 opacity-30" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            {/* Veg/Non-veg indicator */}
            <span
              className={[
                'inline-block w-3 h-3 border-2 rounded-sm mr-1.5 align-middle',
                item.isVeg ? 'border-green-600' : 'border-red-600',
              ].join(' ')}
              aria-label={item.isVeg ? 'Vegetarian' : 'Non-vegetarian'}
            >
              <span
                className={[
                  'block w-1.5 h-1.5 rounded-full m-auto mt-[1px]',
                  item.isVeg ? 'bg-green-600' : 'bg-red-600',
                ].join(' ')}
              />
            </span>
            <h3 className="inline font-display text-base font-semibold text-soroco-charcoal truncate">
              {item.name}
            </h3>
            {item.variant && (
              <p className="text-xs font-body text-soroco-tan mt-0.5">{item.variant}</p>
            )}
            {item.addons && item.addons.length > 0 && (
              <p className="text-xs font-body text-soroco-mocha/70 mt-0.5">
                + {item.addons.join(', ')}
              </p>
            )}
          </div>

          {/* Remove button */}
          <button
            type="button"
            onClick={onRemove}
            className="btn-icon w-8 h-8 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom row: qty + price */}
        <div className="flex items-center justify-between mt-3 gap-2 flex-wrap">
          <QuantityControl
            quantity={item.quantity}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            min={0}
            size="sm"
          />
          <div className="text-right">
            <p className="text-xs text-soroco-tan font-body">
              {formatPrice(item.unitPrice)} × {item.quantity}
            </p>
            <p className="font-body font-bold text-soroco-espresso text-base">
              {formatPrice(item.totalPrice)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Order Summary ── */
interface OrderSummaryProps {
  subtotal: number;
  tax: number;
  total: number;
  onCheckout: () => void;
  onContinueShopping: () => void;
  sticky?: boolean;
}

function OrderSummary({
  subtotal,
  tax,
  total,
  onCheckout,
  onContinueShopping,
  sticky = false,
}: OrderSummaryProps) {
  return (
    <div
      className={[
        'bg-white rounded-2xl border border-soroco-linen shadow-warm',
        sticky ? 'p-4' : 'p-6',
      ].join(' ')}
    >
      {!sticky && (
        <h2 className="font-display text-xl font-semibold text-soroco-charcoal mb-5">
          Order Summary
        </h2>
      )}

      <div className="space-y-3">
        <div className="flex justify-between font-body text-sm text-soroco-mocha">
          <span>Subtotal</span>
          <span className="font-medium text-soroco-charcoal">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between font-body text-sm text-soroco-mocha">
          <span>Tax (5%)</span>
          <span className="font-medium text-soroco-charcoal">{formatPrice(tax)}</span>
        </div>
        <div className="divider" />
        <div className="flex justify-between font-body font-bold text-soroco-charcoal text-lg">
          <span>Total</span>
          <span className="text-soroco-espresso">{formatPrice(total)}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onCheckout}
        className="btn-primary w-full mt-5 gap-2"
      >
        Proceed to Checkout
        <ArrowRight className="w-4 h-4" />
      </button>

      <button
        type="button"
        onClick={onContinueShopping}
        className="w-full mt-3 font-body text-sm text-soroco-mocha hover:text-soroco-espresso transition-colors flex items-center justify-center gap-1.5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Continue Shopping
      </button>
    </div>
  );
}

/* ── Main Screen ── */
export default function CartScreen() {
  const vm = useCartVM();

  return (
    <div className="min-h-screen bg-soroco-cream">
      <Navbar />

      <main className="pt-[var(--nav-height)]">
        {/* Header */}
        <div className="section-container py-8">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-7 h-7 text-soroco-amber" />
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-soroco-charcoal">
              Your Cart
            </h1>
          </div>
          {!vm.isEmpty && (
            <p className="font-body text-soroco-mocha text-sm">
              {vm.items.length} {vm.items.length === 1 ? 'item' : 'items'} in your cart
            </p>
          )}
        </div>

        {vm.isEmpty ? (
          /* Empty state */
          <div className="section-container pb-16">
            <EmptyState
              icon={ShoppingCart}
              title="Your cart is empty"
              description="Looks like you haven't added anything yet. Browse our menu to discover delicious dishes."
              actionLabel="Explore Menu"
              onAction={vm.handleContinueShopping}
            />
          </div>
        ) : (
          /* Cart content */
          <div className="section-container pb-32 md:pb-16">
            <div className="flex flex-col lg:flex-row gap-8 items-start">

              {/* ── Item list ── */}
              <div className="flex-1 w-full min-w-0">
                <AnimatePresence initial={false}>
                  <div className="space-y-4">
                    {vm.items.map((item) => (
                      <AnimatePresence key={item.cartItemId} mode="popLayout">
                        <CartItemRow
                          key={item.cartItemId}
                          item={item}
                          onIncrement={vm.handleIncrement(item)}
                          onDecrement={vm.handleDecrement(item)}
                          onRemove={() => vm.handleRemove(item.cartItemId)}
                        />
                      </AnimatePresence>
                    ))}
                  </div>
                </AnimatePresence>

                {/* Continue shopping – desktop inline */}
                <div className="mt-6 hidden lg:block">
                  <Link
                    to="/menu"
                    className="inline-flex items-center gap-1.5 text-sm font-body text-soroco-mocha hover:text-soroco-espresso transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* ── Desktop Order Summary sidebar ── */}
              <div className="hidden lg:block w-80 xl:w-96 shrink-0 sticky top-[calc(var(--nav-height)+1.5rem)]">
                <OrderSummary
                  subtotal={vm.subtotal}
                  tax={vm.tax}
                  total={vm.total}
                  onCheckout={vm.handleCheckout}
                  onContinueShopping={vm.handleContinueShopping}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Mobile sticky bottom checkout bar ── */}
        {!vm.isEmpty && (
          <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white border-t border-soroco-linen shadow-warm-xl px-4 py-3 safe-area-pb">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-body text-xs text-soroco-tan">Total</p>
                <p className="font-display font-bold text-soroco-espresso text-xl">
                  {formatPrice(vm.total)}
                </p>
                <p className="font-body text-xs text-soroco-mocha/70">
                  incl. ₹{vm.tax.toFixed(2)} tax
                </p>
              </div>
              <button
                type="button"
                onClick={vm.handleCheckout}
                className="btn-primary flex-1 max-w-[200px] gap-2"
              >
                Checkout
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
