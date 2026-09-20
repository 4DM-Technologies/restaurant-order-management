import { ArrowLeft, ArrowRight, CreditCard, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/ui/reusables/Navbar/Navbar.tsx';
import { useCheckoutVM } from '@/ui/screens/CheckoutScreen/CheckoutScreen.vm.ts';
import { PaymentMethodENUM } from '@/types/order/PaymentMethodENUM.ts';
import type { CartItemBO } from '@/types/cart/CartItemBO.ts';

function formatPrice(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

// ── Compact payment method row (Swiggy-style) ────────────────────────────────
interface PaymentMethodConfig {
  method: PaymentMethodENUM;
  name: string;
  tagline: string;
  logo: string;
  accent: string;
}

const PAYMENT_METHODS: PaymentMethodConfig[] = [
  {
    method: PaymentMethodENUM.PHONEPE,
    name: 'PhonePe',
    tagline: 'UPI · Wallets · Cards',
    logo: '/brand/phonepay.svg',
    accent: '#5F259F',
  },
  {
    method: PaymentMethodENUM.RAZORPAY,
    name: 'Razorpay',
    tagline: 'Cards · Net Banking · UPI · EMI',
    logo: '/brand/razorpay.svg',
    accent: '#3395FF',
  },
];

interface PaymentMethodOptionProps {
  config: PaymentMethodConfig;
  selected: boolean;
  onSelect: () => void;
}

function PaymentMethodOption({ config, selected, onSelect }: PaymentMethodOptionProps) {
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      whileTap={{ scale: 0.985 }}
      className={[
        'w-full flex items-center gap-3 sm:gap-4 px-3.5 sm:px-4 py-3 rounded-xl border-2 transition-all duration-200 text-left cursor-pointer',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-soroco-amber focus-visible:ring-offset-2',
        selected
          ? ''
          : 'border-soroco-linen bg-white hover:border-soroco-tan/60 hover:bg-soroco-parchment/40',
      ].join(' ')}
      style={
        selected
          ? { borderColor: config.accent, backgroundColor: `${config.accent}0F` }
          : undefined
      }
    >
      {/* Official brand logo */}
      <span className="w-11 sm:w-12 h-9 shrink-0 rounded-lg border border-soroco-linen bg-white flex items-center justify-center px-1.5">
        <img
          src={config.logo}
          alt={config.name}
          loading="lazy"
          className="max-h-6 w-auto object-contain"
        />
      </span>

      {/* Name + tagline */}
      <span className="flex-1 min-w-0">
        <span className="block font-body text-sm font-semibold text-soroco-charcoal leading-tight">
          {config.name}
        </span>
        <span className="block font-body text-xs text-soroco-tan truncate mt-0.5">
          {config.tagline}
        </span>
      </span>

      {/* Radio indicator */}
      <span
        className={[
          'w-5 h-5 shrink-0 rounded-full border-2 flex items-center justify-center transition-colors duration-200',
          selected ? '' : 'border-soroco-linen',
        ].join(' ')}
        style={selected ? { borderColor: config.accent } : undefined}
      >
        {selected && (
          <motion.span
            layoutId="payment-radio"
            className="w-2.5 h-2.5 rounded-full block"
            style={{ backgroundColor: config.accent }}
          />
        )}
      </span>
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

  // Empty cart guard — don't show a ₹0 checkout form
  if (vm.items.length === 0) {
    return (
      <div className="min-h-screen bg-soroco-cream">
        <Navbar />
        <main className="pt-[var(--nav-height)]">
          <div className="section-container py-16">
            <div className="max-w-xl mx-auto rounded-3xl border border-soroco-linen/70 bg-white/60 shadow-warm-sm">
              <div className="flex flex-col items-center justify-center text-center px-6 py-16">
                <div className="w-16 h-16 rounded-full bg-soroco-amber/10 flex items-center justify-center mb-5">
                  <ShoppingBag className="w-8 h-8 text-soroco-amber" />
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-semibold text-soroco-charcoal mb-2 text-balance">
                  Nothing in your cart yet
                </h1>
                <p className="font-body text-soroco-mocha text-sm sm:text-base leading-relaxed max-w-sm mb-8 text-pretty">
                  Your cart is empty. Head over to the menu and pick something
                  freshly brewed.
                </p>
                <Link to="/menu" className="btn-primary gap-2">
                  Explore Menu
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/"
                  className="mt-4 inline-flex items-center gap-1.5 font-body text-sm text-soroco-mocha hover:text-soroco-espresso transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Back to home
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
                    <FormField id="email" name="email" label="Email Address" type="email"
                      value={vm.form.email} onChange={vm.handleFieldChange}
                      error={vm.errors.email} placeholder="your@email.com" required />
                    <FormField id="phone" name="phone" label="Phone Number (optional)" type="tel"
                      value={vm.form.phone} onChange={vm.handleFieldChange}
                      error={vm.errors.phone} placeholder="10-digit mobile number" />
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
                  <div
                    className="space-y-2.5"
                    role="radiogroup"
                    aria-label="Payment method"
                  >
                    {PAYMENT_METHODS.map((config) => (
                      <PaymentMethodOption
                        key={config.method}
                        config={config}
                        selected={vm.selectedPaymentMethod === config.method}
                        onSelect={() => vm.handlePaymentMethodSelect(config.method)}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-xs text-soroco-tan font-body flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
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
