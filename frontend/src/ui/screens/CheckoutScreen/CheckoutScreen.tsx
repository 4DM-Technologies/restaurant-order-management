import { ArrowLeft, ArrowRight, CreditCard, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/ui/reusables/Navbar/Navbar.tsx';
import { useCheckoutVM } from '@/ui/screens/CheckoutScreen/CheckoutScreen.vm.ts';
import { PaymentMethodENUM } from '@/types/order/PaymentMethodENUM.ts';
import type { CartItemBO } from '@/types/cart/CartItemBO.ts';

function formatPrice(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

// ── Real PhonePe SVG brand logo ──────────────────────────────────────────────
function PhonePeLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const h = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-10' : 'h-8';
  return (
    <svg
      viewBox="0 0 200 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${h} w-auto`}
      aria-label="PhonePe"
    >
      {/* Purple rounded rect bg */}
      <rect width="200" height="56" rx="10" fill="#5F259F" />
      {/* PhonePe "P" icon mark */}
      <rect x="10" y="8" width="36" height="40" rx="8" fill="white" fillOpacity="0.15" />
      <path
        d="M20 16h10c4.4 0 8 3.6 8 8s-3.6 8-8 8H24v8h-4V16zm4 12h6c2.2 0 4-1.8 4-4s-1.8-4-4-4h-6v8z"
        fill="white"
      />
      {/* PhonePe wordmark */}
      <text
        x="56"
        y="37"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="22"
        fontWeight="700"
        fill="white"
        letterSpacing="-0.3"
      >
        PhonePe
      </text>
    </svg>
  );
}

// ── Real Razorpay SVG brand logo ─────────────────────────────────────────────
function RazorpayLogo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const h = size === 'sm' ? 'h-6' : size === 'lg' ? 'h-10' : 'h-8';
  return (
    <svg
      viewBox="0 0 220 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${h} w-auto`}
      aria-label="Razorpay"
    >
      {/* Deep blue bg */}
      <rect width="220" height="56" rx="10" fill="#072654" />
      {/* Razorpay lightning bolt icon */}
      <polygon
        points="22,10 30,10 24,28 32,28 18,46 22,30 14,30"
        fill="#3395FF"
      />
      {/* Razorpay wordmark */}
      <text
        x="44"
        y="37"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontSize="21"
        fontWeight="700"
        fill="white"
        letterSpacing="-0.2"
      >
        Razorpay
      </text>
    </svg>
  );
}

// ── Modern Payment Method Card ───────────────────────────────────────────────
interface PaymentCardProps {
  method: PaymentMethodENUM;
  selected: boolean;
  onSelect: () => void;
}

function PaymentMethodCard({ method, selected, onSelect }: PaymentCardProps) {
  const isPhonePe = method === PaymentMethodENUM.PHONEPE;

  const config = isPhonePe
    ? {
        bg: 'bg-[#5F259F]/8',
        border: selected ? 'border-[#5F259F]' : 'border-soroco-linen hover:border-[#5F259F]/40',
        checkColor: 'text-[#5F259F]',
        tagline: 'UPI · Wallets · Cards',
        logo: <PhonePeLogo />,
      }
    : {
        bg: 'bg-[#072654]/8',
        border: selected ? 'border-[#3395FF]' : 'border-soroco-linen hover:border-[#3395FF]/40',
        checkColor: 'text-[#3395FF]',
        tagline: 'Cards · Net Banking · UPI',
        logo: <RazorpayLogo />,
      };

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={[
        'relative flex-1 flex flex-col gap-3 p-5 rounded-2xl border-2 transition-all duration-200 cursor-pointer text-left',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soroco-amber focus-visible:ring-offset-2',
        config.border,
        selected ? 'shadow-warm-md bg-white' : 'bg-white/60',
      ].join(' ')}
    >
      {/* Selected check */}
      <AnimatePresence>
        {selected && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={`absolute top-3 right-3 ${config.checkColor}`}
          >
            <CheckCircle2 className="w-5 h-5" fill="currentColor" fillOpacity={0.15} />
          </motion.span>
        )}
      </AnimatePresence>

      {/* Logo area */}
      <div className={`w-full flex items-center justify-center py-3 rounded-xl ${config.bg}`}>
        {config.logo}
      </div>

      {/* Label */}
      <div>
        <p className="font-body font-semibold text-sm text-soroco-espresso">
          Pay with {isPhonePe ? 'PhonePe' : 'Razorpay'}
        </p>
        <p className="font-body text-xs text-soroco-tan mt-0.5">{config.tagline}</p>
      </div>
    </motion.button>
  );
}

// ── Form Field ───────────────────────────────────────────────────────────────
interface FormFieldProps {
  id: string;
  name: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

function FormField({
  id, name, label, type = 'text', value, onChange, error, placeholder, required = false,
}: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="input-label">
        {label}
        {required && <span className="text-soroco-amber ml-0.5">*</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className={[
          'input-field',
          error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : '',
        ].join(' ')}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-red-600 font-body">
          {error}
        </p>
      )}
    </div>
  );
}

// ── Order Summary ─────────────────────────────────────────────────────────────
interface CheckoutSummaryProps {
  items: CartItemBO[];
  subtotal: number;
  tax: number;
  total: number;
}

function CheckoutSummary({ items, subtotal, tax, total }: CheckoutSummaryProps) {
  return (
    <div className="bg-white rounded-2xl border border-soroco-linen shadow-warm p-6">
      <h2 className="font-display text-xl font-semibold text-soroco-charcoal mb-5">
        Order Summary
      </h2>
      <ul className="space-y-3 mb-5 max-h-60 overflow-y-auto pr-1 no-scrollbar">
        {items.map((item) => (
          <li key={item.cartItemId} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-soroco-parchment shrink-0">
              {item.image && (
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" loading="lazy" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-body font-medium text-soroco-charcoal truncate">{item.name}</p>
              {item.variant && <p className="text-xs text-soroco-tan truncate">{item.variant}</p>}
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs text-soroco-tan">×{item.quantity}</p>
              <p className="text-sm font-body font-semibold text-soroco-espresso">{formatPrice(item.totalPrice)}</p>
            </div>
          </li>
        ))}
      </ul>
      <div className="divider mb-4" />
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-body text-soroco-mocha">
          <span>Subtotal</span>
          <span className="font-medium text-soroco-charcoal">{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm font-body text-soroco-mocha">
          <span>Tax (5%)</span>
          <span className="font-medium text-soroco-charcoal">{formatPrice(tax)}</span>
        </div>
        <div className="divider" />
        <div className="flex justify-between font-body font-bold text-soroco-charcoal text-lg pt-1">
          <span>Total</span>
          <span className="text-soroco-espresso">{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function CheckoutScreen() {
  const vm = useCheckoutVM();

  return (
    <div className="min-h-screen bg-soroco-cream">
      <Navbar />
      <main className="pt-[var(--nav-height)]">
        <div className="section-container py-8 pb-16">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-10 h-10 rounded-xl bg-soroco-amber/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-soroco-amber" />
            </div>
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-soroco-charcoal leading-none">
                Checkout
              </h1>
              <p className="font-body text-sm text-soroco-tan mt-0.5">Review your order and pay</p>
            </div>
          </motion.div>

          <form onSubmit={vm.handleSubmit} noValidate>
            <div className="flex flex-col lg:flex-row gap-8 items-start">

              {/* Left: Form */}
              <div className="flex-1 w-full space-y-5">

                {/* Customer Info */}
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="bg-white rounded-2xl border border-soroco-linen shadow-warm p-6"
                >
                  <h2 className="font-display text-lg font-semibold text-soroco-charcoal mb-5">
                    Your Details
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField id="tableNumber" name="tableNumber" label="Table Number"
                      value={vm.form.tableNumber} onChange={vm.handleFieldChange}
                      error={vm.errors.tableNumber} placeholder="e.g. T-12" required />
                    <FormField id="customerName" name="customerName" label="Full Name"
                      value={vm.form.customerName} onChange={vm.handleFieldChange}
                      error={vm.errors.customerName} placeholder="Your name" required />
                    <FormField id="phone" name="phone" label="Phone Number" type="tel"
                      value={vm.form.phone} onChange={vm.handleFieldChange}
                      error={vm.errors.phone} placeholder="10-digit mobile number" required />
                    <FormField id="email" name="email" label="Email (optional)" type="email"
                      value={vm.form.email} onChange={vm.handleFieldChange}
                      error={vm.errors.email} placeholder="your@email.com" />
                  </div>
                </motion.section>

                {/* Payment Method */}
                <motion.section
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                  className="bg-white rounded-2xl border border-soroco-linen shadow-warm p-6"
                >
                  <h2 className="font-display text-lg font-semibold text-soroco-charcoal mb-5">
                    Payment Method
                  </h2>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <PaymentMethodCard
                      method={PaymentMethodENUM.PHONEPE}
                      selected={vm.selectedPaymentMethod === PaymentMethodENUM.PHONEPE}
                      onSelect={() => vm.handlePaymentMethodSelect(PaymentMethodENUM.PHONEPE)}
                    />
                    <PaymentMethodCard
                      method={PaymentMethodENUM.RAZORPAY}
                      selected={vm.selectedPaymentMethod === PaymentMethodENUM.RAZORPAY}
                      onSelect={() => vm.handlePaymentMethodSelect(PaymentMethodENUM.RAZORPAY)}
                    />
                  </div>
                  <p className="mt-4 text-xs text-soroco-tan font-body flex items-center gap-1.5">
                    <span className="text-green-500">🔒</span>
                    Secure payment simulation — no real transaction processed
                  </p>
                </motion.section>

                {/* Mobile summary */}
                <div className="lg:hidden">
                  <CheckoutSummary items={vm.items} subtotal={vm.subtotal} tax={vm.tax} total={vm.total} />
                </div>

                {/* Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.2 }}
                  className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 pt-2"
                >
                  <button
                    type="button"
                    onClick={vm.handleBackToCart}
                    className="inline-flex items-center gap-2 text-sm font-body font-medium text-soroco-mocha hover:text-soroco-espresso transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Cart
                  </button>
                  <motion.button
                    type="submit"
                    disabled={vm.isSubmitting}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary w-full sm:w-auto text-base px-8 py-3.5"
                  >
                    {vm.isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing…
                      </>
                    ) : (
                      <>
                        Proceed to Payment
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </div>

              {/* Right: Summary (desktop) */}
              <div className="hidden lg:block w-80 xl:w-96 shrink-0 sticky top-[calc(var(--nav-height)+1.5rem)]">
                <CheckoutSummary items={vm.items} subtotal={vm.subtotal} tax={vm.tax} total={vm.total} />
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
