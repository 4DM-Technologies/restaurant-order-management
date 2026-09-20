import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Trash2, ArrowRight, ArrowLeft, Home, ShoppingBag } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from '@/ui/reusables/Navbar/Navbar';
import QuantityControl from '@/ui/reusables/QuantityControl/QuantityControl';
import { useCartVM } from '@/ui/screens/CartScreen/CartScreen.vm';
import type { CartItemBO } from '@/types/cart/CartItemBO.ts';

/* ── Helpers ── */
function formatPrice(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

const rowVariants = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, x: -32, scale: 0.96 },
};

/* ── Veg/Non-veg badge ── */
function VegDot({ isVeg }: { isVeg: boolean }) {
  const color = isVeg ? 'border-green-600' : 'border-red-600';
  const dot = isVeg ? 'bg-green-600' : 'bg-red-600';
  return (
    <span
      className={`inline-block w-3 h-3 border-2 ${color} rounded-sm mr-1.5 align-middle`}
      aria-label={isVeg ? 'Vegetarian' : 'Non-vegetarian'}
    >
      <span className={`block w-1.5 h-1.5 rounded-full m-auto mt-[1px] ${dot}`} />
    </span>
  );
}

/* ── Image tile (branded fallback when no photo) ── */
function ItemImage({ item }: { item: CartItemBO }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const initials = item.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

  return (
    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden shrink-0 bg-soroco-espresso shadow-warm-sm">
      {item.image ? (
        <>
          {!imgLoaded && <div className="absolute inset-0 skeleton" aria-hidden="true" />}
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            className={[
              'w-full h-full object-cover transition-all duration-500 img-fade group-hover:scale-105',
              imgLoaded ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-soroco-espresso via-soroco-mocha to-soroco-sienna">
          <span className="sr-only">{item.name}</span>
          <span className="font-display italic text-soroco-cream/90 text-2xl sm:text-3xl tracking-tight">
            {initials}
          </span>
          <Coffee
            className="absolute -bottom-2 -right-2 w-10 h-10 text-soroco-cream/10 rotate-12"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Veg/non-veg chip */}
      <span
        className="absolute top-2 left-2 w-4 h-4 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-sm"
        aria-hidden="true"
      >
        <span
          className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`}
        />
      </span>
    </div>
  );
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
      variants={rowVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ type: 'spring', stiffness: 320, damping: 30 }}
      className="group flex items-start gap-4 sm:gap-5 p-3 sm:p-4 bg-white rounded-3xl border border-soroco-linen/70 shadow-warm-sm hover:shadow-warm transition-shadow"
    >
      <ItemImage item={item} />

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col self-stretch">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-display text-base sm:text-lg font-semibold text-soroco-charcoal leading-snug text-balance">
              <VegDot isVeg={item.isVeg} />
              {item.name}
            </h3>

            {(item.variant || (item.addons && item.addons.length > 0)) && (
              <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                {item.variant && (
                  <span className="px-2 py-0.5 rounded-full bg-soroco-parchment text-soroco-mocha text-[11px] font-semibold">
                    {item.variant}
                  </span>
                )}
                {item.addons?.map((addon) => (
                  <span
                    key={addon}
                    className="px-2 py-0.5 rounded-full bg-soroco-parchment text-soroco-mocha/80 text-[11px] font-body"
                  >
                    + {addon}
                  </span>
                ))}
              </div>
            )}

            <p className="font-body text-xs text-soroco-tan mt-1.5">
              {formatPrice(item.unitPrice)}
              <span className="mx-1 text-soroco-linen">·</span>
              {item.quantity} {item.quantity === 1 ? 'item' : 'items'}
            </p>
          </div>

          {/* Remove */}
          <button
            type="button"
            onClick={onRemove}
            className="btn-icon w-8 h-8 shrink-0 text-soroco-tan opacity-70 hover:opacity-100 hover:text-red-500 hover:bg-red-50"
            aria-label={`Remove ${item.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between gap-3 mt-auto pt-3">
          <QuantityControl
            quantity={item.quantity}
            onIncrement={onIncrement}
            onDecrement={onDecrement}
            min={0}
            size="sm"
          />
          <p className="font-body font-bold text-soroco-espresso text-base sm:text-lg shrink-0">
            {formatPrice(item.totalPrice)}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

/* ── Order Summary (dark espresso card) ── */
interface OrderSummaryProps {
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  onCheckout: () => void;
  onClear: () => void;
  onContinueShopping: () => void;
}

function OrderSummary({
  itemCount,
  subtotal,
  tax,
  total,
  onCheckout,
  onClear,
  onContinueShopping,
}: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-2xl border border-soroco-linen shadow-warm-sm p-5 sm:p-6">
      <h2 className="font-display text-lg font-semibold text-soroco-charcoal mb-4">
        Bill Details
      </h2>

      <div className="space-y-2.5 font-body text-sm">
        <div className="flex justify-between text-soroco-mocha">
          <span>Item total ({itemCount})</span>
          <span className="font-medium text-soroco-charcoal tabular-nums">
            {formatPrice(subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-soroco-mocha">
          <span>GST (5%)</span>
          <span className="font-medium text-soroco-charcoal tabular-nums">
            {formatPrice(tax)}
          </span>
        </div>

        <div className="border-t border-dashed border-soroco-linen my-3" />

        <div className="flex items-center justify-between">
          <span className="font-body font-semibold text-soroco-charcoal text-base">To Pay</span>
          <span className="font-body font-bold text-soroco-espresso text-2xl tabular-nums">
            {formatPrice(total)}
          </span>
        </div>
      </div>

      <button type="button" onClick={onCheckout} className="btn-primary w-full mt-5 gap-2">
        Proceed to Checkout
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="flex items-center justify-between gap-2 mt-4">
        <button
          type="button"
          onClick={onContinueShopping}
          className="inline-flex items-center gap-1.5 font-body text-sm text-soroco-mocha hover:text-soroco-espresso transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Keep browsing
        </button>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 font-body text-sm text-soroco-tan hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear cart
        </button>
      </div>
    </div>
  );
}

/* ── Empty state (branded illustration) ── */
function EmptyCart({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16 min-h-[380px]">
      <div className="relative w-36 h-36 mb-7">
        <div
          className="absolute inset-0 rounded-full bg-soroco-linen/80"
          aria-hidden="true"
        />
        <div
          className="absolute inset-3 rounded-full border-2 border-dashed border-soroco-tan/40"
          aria-hidden="true"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            viewBox="0 0 96 96"
            className="w-24 h-24"
            fill="none"
            aria-hidden="true"
          >
            {/* steam */}
            <path
              d="M36 22c-2 5 2 8 0 13"
              stroke="#C8956C"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
            />
            <path
              d="M46 18c-2 5 2 8 0 13"
              stroke="#C8956C"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M56 22c-2 5 2 8 0 13"
              stroke="#C8956C"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
            />
            {/* cup body */}
            <path
              d="M28 42h34v16a10 10 0 0 1-10 10H38a10 10 0 0 1-10-10V42Z"
              fill="#6B3F2A"
            />
            {/* handle */}
            <path
              d="M62 46h6a6 6 0 0 1 0 12h-7"
              stroke="#6B3F2A"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* cream line */}
            <path d="M30 42h30" stroke="#C8956C" strokeWidth="2" />
            {/* saucer */}
            <ellipse cx="47" cy="68" rx="26" ry="5" fill="#A0653A" />
            <ellipse cx="47" cy="67" rx="18" ry="3" fill="#C8956C" opacity="0.5" />
          </svg>
        </div>
      </div>

      <h2 className="font-display text-2xl sm:text-3xl font-semibold text-soroco-charcoal mb-2 text-balance">
        Nothing brewing yet
      </h2>
      <p className="font-body text-soroco-mocha text-sm sm:text-base leading-relaxed max-w-sm mb-8 text-pretty">
        Your order slot is empty — scan a menu or head over to browse our coffees,
        cold brews and teas. Freshly brewed, always.
      </p>
      <button type="button" onClick={onExplore} className="btn-primary gap-2">
        Explore Menu
        <ArrowRight className="w-4 h-4" />
      </button>
      <Link
        to="/"
        className="mt-4 inline-flex items-center gap-1.5 font-body text-sm text-soroco-mocha hover:text-soroco-espresso transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
        Back to home
      </Link>
    </div>
  );
}

/* ── Main Screen ── */
export default function CartScreen() {
  const vm = useCartVM();

  return (
    <div className="min-h-screen bg-soroco-cream relative">
      {/* Decorative background washes */}
      <div
        className="pointer-events-none fixed -top-32 right-[-10rem] w-[28rem] h-[28rem] rounded-full bg-soroco-amber/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none fixed top-1/3 left-[-12rem] w-[24rem] h-[24rem] rounded-full bg-soroco-sienna/10 blur-3xl"
        aria-hidden="true"
      />

      <Navbar />

      <main className="relative pt-[var(--nav-height)]">
        {/* Header */}
        <header className="section-container pt-10 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <p className="eyebrow mb-1.5">Your table order</p>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-soroco-charcoal">
                Your Cart
              </h1>
            </div>
            {!vm.isEmpty && (
              <span className="inline-flex items-center gap-2 self-start sm:self-auto px-4 py-1.5 rounded-full bg-soroco-espresso text-soroco-cream text-sm font-body font-medium shadow-warm-sm">
                <ShoppingBag className="w-4 h-4 text-soroco-amber" />
                {vm.itemCount} {vm.itemCount === 1 ? 'item' : 'items'} ready
              </span>
            )}
          </div>
        </header>

        {vm.isEmpty ? (
          <div className="section-container">
            <div className="max-w-xl mx-auto rounded-3xl border border-soroco-linen/70 bg-white/60 shadow-warm-sm">
              <EmptyCart onExplore={vm.handleContinueShopping} />
            </div>
          </div>
        ) : (
          /* Cart content */
          <div className="section-container pb-36 md:pb-16">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* ── Item list ── */}
              <div className="flex-1 w-full min-w-0">
                <div className="space-y-4">
                  <AnimatePresence initial={false} mode="popLayout">
                    {vm.items.map((item) => (
                      <CartItemRow
                        key={item.cartItemId}
                        item={item}
                        onIncrement={vm.handleIncrement(item)}
                        onDecrement={vm.handleDecrement(item)}
                        onRemove={() => vm.handleRemove(item.cartItemId)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {/* Continue shopping */}
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

              {/* ── Desktop summary sidebar ── */}
              <aside className="hidden lg:block w-80 xl:w-96 shrink-0 sticky top-[calc(var(--nav-height)+1.5rem)]">
                <OrderSummary
                  itemCount={vm.itemCount}
                  subtotal={vm.subtotal}
                  tax={vm.tax}
                  total={vm.total}
                  onCheckout={vm.handleCheckout}
                  onClear={vm.handleClear}
                  onContinueShopping={vm.handleContinueShopping}
                />
              </aside>
            </div>
          </div>
        )}

        {/* ── Mobile sticky bottom checkout bar ── */}
        {!vm.isEmpty && (
          <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden bg-white/95 backdrop-blur-md border-t border-soroco-linen px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-warm-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-body text-[11px] text-soroco-tan">
                  {vm.itemCount} {vm.itemCount === 1 ? 'item' : 'items'} · incl. GST
                </p>
                <p className="font-body font-bold text-soroco-charcoal text-2xl tabular-nums">
                  {formatPrice(vm.total)}
                </p>
              </div>
              <button
                type="button"
                onClick={vm.handleCheckout}
                className="btn-primary flex-1 max-w-[220px] gap-2"
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