import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Smartphone, Wallet, QrCode, Shield } from 'lucide-react';
import { PaymentMethodENUM } from '@/types/order/PaymentMethodENUM.ts';
import { paymentService } from '@/services/screens/paymentScreenService/PaymentService.ts';
import type { CheckoutOrderState } from '@/ui/screens/CheckoutScreen/CheckoutScreen.vm';

/* ── Helpers ── */
function formatPrice(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

const PHONEPE_COLOR  = '#5F259F';
const RAZORPAY_COLOR = '#3395FF';

/* ── PhonePe UPI Payment UI (light) ── */
interface PhonePeUIProps {
  total: number;
  onPay: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

function PhonePeUI({ total, onPay, onCancel, isProcessing }: PhonePeUIProps) {
  const [upiId, setUpiId] = useState('');

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-soroco-linen">
        <span className="w-12 h-12 rounded-xl bg-white border border-soroco-linen shadow-warm-sm flex items-center justify-center px-1.5">
          <img
            src="/brand/phonepay.svg"
            alt="PhonePe"
            className="max-h-7 w-auto object-contain"
          />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-soroco-charcoal">PhonePe</h2>
          <p className="text-sm font-body font-medium" style={{ color: PHONEPE_COLOR }}>
            UPI Payment
          </p>
        </div>
      </div>

      {/* Amount */}
      <div
        className="rounded-2xl py-5 mb-6 text-center"
        style={{
          backgroundColor: `${PHONEPE_COLOR}0D`,
          border: `1px solid ${PHONEPE_COLOR}26`,
        }}
      >
        <p className="text-sm font-body text-soroco-tan mb-1">Amount to Pay</p>
        <p
          className="font-body text-4xl font-bold tabular-nums"
          style={{ color: PHONEPE_COLOR }}
        >
          {formatPrice(total)}
        </p>
      </div>

      {/* QR code placeholder */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-40 h-40 bg-white border border-soroco-linen rounded-2xl p-3 flex items-center justify-center mb-3 shadow-warm-sm">
          <div
            className="w-full h-full rounded-xl flex flex-col items-center justify-center gap-2"
            style={{ backgroundColor: `${PHONEPE_COLOR}0A` }}
          >
            <QrCode className="w-16 h-16" style={{ color: PHONEPE_COLOR }} />
            <p
              className="text-xs font-semibold text-center leading-tight"
              style={{ color: PHONEPE_COLOR }}
            >
              Scan to Pay
            </p>
          </div>
        </div>
        <p className="text-xs text-soroco-tan font-body">Scan QR code with PhonePe app</p>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-soroco-linen" />
        <span className="text-xs text-soroco-tan font-body uppercase tracking-widest">
          or enter UPI ID
        </span>
        <div className="flex-1 h-px bg-soroco-linen" />
      </div>

      <div className="mb-6">
        <input
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="yourname@paytm / @phonepe"
          className="input-field"
        />
      </div>

      <button
        type="button"
        onClick={onPay}
        disabled={isProcessing}
        className="w-full text-white font-body font-bold py-4 rounded-xl text-lg transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110 flex items-center justify-center gap-2"
        style={{ backgroundColor: PHONEPE_COLOR }}
      >
        {isProcessing ? (
          <>
            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Processing…
          </>
        ) : (
          `Pay ${formatPrice(total)}`
        )}
      </button>

      <button
        type="button"
        onClick={onCancel}
        disabled={isProcessing}
        className="w-full mt-3 py-3 text-sm text-soroco-tan hover:text-soroco-espresso font-body transition-colors disabled:opacity-50"
      >
        Cancel Payment
      </button>
    </div>
  );
}

/* ── Razorpay Payment UI (light) ── */
type RazorpayTab = 'card' | 'upi' | 'wallet';

interface RazorpayUIProps {
  total: number;
  onPay: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

function RazorpayUI({ total, onPay, onCancel, isProcessing }: RazorpayUIProps) {
  const [activeTab, setActiveTab] = useState<RazorpayTab>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  const tabs: { key: RazorpayTab; label: string; icon: typeof CreditCard }[] = [
    { key: 'card', label: 'Card', icon: CreditCard },
    { key: 'upi', label: 'UPI', icon: Smartphone },
    { key: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-soroco-linen">
        <span className="w-12 h-12 rounded-xl bg-white border border-soroco-linen shadow-warm-sm flex items-center justify-center px-1.5">
          <img
            src="/brand/razorpay.svg"
            alt="Razorpay"
            className="max-h-7 w-auto object-contain"
          />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-soroco-charcoal">Razorpay</h2>
          <p className="text-sm font-body font-medium" style={{ color: RAZORPAY_COLOR }}>
            Secure Payment Gateway
          </p>
        </div>
      </div>

      {/* Amount */}
      <div
        className="rounded-2xl py-4 mb-6 text-center"
        style={{
          backgroundColor: `${RAZORPAY_COLOR}0D`,
          border: `1px solid ${RAZORPAY_COLOR}26`,
        }}
      >
        <p className="text-sm font-body text-soroco-tan mb-1">Amount to Pay</p>
        <p
          className="font-body text-4xl font-bold tabular-nums"
          style={{ color: '#0A3D7C' }}
        >
          {formatPrice(total)}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-soroco-parchment rounded-xl p-1 mb-6 gap-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={[
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-body font-semibold transition-all duration-200',
              activeTab === key
                ? 'bg-white text-[#0A3D7C] shadow-sm border border-soroco-linen'
                : 'text-soroco-mocha hover:text-soroco-charcoal',
            ].join(' ')}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        {activeTab === 'card' && (
          <motion.div
            key="card"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 mb-6"
          >
            <div>
              <label className="text-xs text-soroco-tan font-body font-semibold uppercase tracking-wider mb-1.5 block">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-soroco-tan font-body font-semibold uppercase tracking-wider mb-1.5 block">
                  Expiry
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs text-soroco-tan font-body font-semibold uppercase tracking-wider mb-1.5 block">
                  CVV
                </label>
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="•••"
                  maxLength={4}
                  className="input-field"
                />
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'upi' && (
          <motion.div
            key="upi"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <label className="text-xs text-soroco-tan font-body font-semibold uppercase tracking-wider mb-1.5 block">
              UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@bank"
              className="input-field"
            />
          </motion.div>
        )}

        {activeTab === 'wallet' && (
          <motion.div
            key="wallet"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <div className="grid grid-cols-2 gap-3">
              {['Paytm', 'Amazon Pay', 'Mobikwik', 'Freecharge'].map((wallet) => (
                <button
                  key={wallet}
                  type="button"
                  className="py-3 px-4 rounded-xl bg-white border border-soroco-linen text-soroco-charcoal text-sm font-body font-medium hover:border-soroco-tan/60 transition-all"
                >
                  {wallet}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={onPay}
        disabled={isProcessing}
        className="w-full text-white font-body font-bold py-4 rounded-xl text-lg transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed hover:brightness-110 flex items-center justify-center gap-2"
        style={{ backgroundColor: RAZORPAY_COLOR }}
      >
        {isProcessing ? (
          <>
            <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            Processing…
          </>
        ) : (
          `Pay ${formatPrice(total)}`
        )}
      </button>

      <button
        type="button"
        onClick={onCancel}
        disabled={isProcessing}
        className="w-full mt-3 py-3 text-sm text-soroco-tan hover:text-soroco-espresso font-body transition-colors disabled:opacity-50"
      >
        Cancel Payment
      </button>
    </div>
  );
}

/* ── Processing Overlay ── */
function ProcessingOverlay({ total }: { total: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md rounded-3xl z-10 gap-5"
    >
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-soroco-linen" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-soroco-sienna animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-soroco-charcoal font-display text-2xl font-bold">
          Processing Payment
        </p>
        <p className="text-soroco-mocha font-body text-sm mt-1">
          {formatPrice(total)}
        </p>
      </div>
    </motion.div>
  );
}

/* ── Main PaymentScreen ── */
export default function PaymentScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderState = location.state as CheckoutOrderState | null;

  const paymentMethod = orderState?.paymentMethod ?? PaymentMethodENUM.PHONEPE;
  const total = orderState?.total ?? 0;

  const attemptCount = useRef(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handlePay = async () => {
    if (!orderState) return;
    attemptCount.current += 1;
    setIsProcessing(true);
    setPaymentError(null);

    try {
      const items = orderState.items.map((it) => ({
        menu_uuid: it.menuItemId,
        quantity: it.quantity,
        selected_size:
          it.variantId === 'small' || it.variantId === 'large' || it.variantId === 'standard'
            ? (it.variantId as 'small' | 'large' | 'standard')
            : null,
      }));

      const result = await paymentService.createPayment({
        order_ref: `rom-${Date.now()}-${attemptCount.current}`,
        gateway_status: 'success',
        payment_method: isPhonePe ? 'phonepay' : 'razorpay',
        transaction_id: `txn-${Date.now()}`,
        table_name: orderState.tableNumber,
        customer_name: orderState.customerName,
        phone_number: orderState.phone.replace(/\D/g, ''),
        customer_email: orderState.email.trim() || null,
        items,
      });

      setIsProcessing(false);
      if (result.payment_status === 'success') {
        navigate('/payment/success', {
          state: {
            ...orderState,
            orderNumber: String(result.order_number ?? orderState.orderNumber),
          },
        });
      } else if (result.payment_status === 'cancelled') {
        navigate('/payment/cancelled', { state: orderState });
      } else {
        navigate('/payment/failed', { state: orderState });
      }
    } catch (err) {
      setIsProcessing(false);
      setPaymentError(err instanceof Error ? err.message : 'Payment failed. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/payment/cancelled', { state: orderState });
  };

  const isPhonePe = paymentMethod === PaymentMethodENUM.PHONEPE;

  return (
    <div
      className={[
        'min-h-screen flex items-center justify-center p-4 relative',
        isPhonePe
          ? 'bg-gradient-to-br from-[#F3ECFB] via-white to-[#E9DFF7]'
          : 'bg-gradient-to-br from-[#EAF2FE] via-white to-[#DFECFB]',
      ].join(' ')}
    >
      {/* Cancel button top-right */}
      <button
        type="button"
        onClick={handleCancel}
        className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-soroco-linen shadow-warm-sm flex items-center justify-center text-soroco-espresso transition-all"
        aria-label="Cancel and go back"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Payment card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-md rounded-3xl bg-white shadow-warm-xl border border-soroco-linen overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          {paymentError && (
            <div
              role="alert"
              className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 font-body text-sm"
            >
              {paymentError}
            </div>
          )}
          {isPhonePe ? (
            <PhonePeUI
              total={total}
              onPay={handlePay}
              onCancel={handleCancel}
              isProcessing={isProcessing}
            />
          ) : (
            <RazorpayUI
              total={total}
              onPay={handlePay}
              onCancel={handleCancel}
              isProcessing={isProcessing}
            />
          )}
        </div>

        {/* Processing overlay */}
        <AnimatePresence>
          {isProcessing && <ProcessingOverlay total={total} />}
        </AnimatePresence>
      </motion.div>

      {/* Security badge */}
      <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-2">
        <Shield className="w-4 h-4 text-soroco-tan" />
        <span className="text-soroco-tan text-xs font-body">
          Secured by 256-bit SSL encryption (mock payment)
        </span>
      </div>
    </div>
  );
}