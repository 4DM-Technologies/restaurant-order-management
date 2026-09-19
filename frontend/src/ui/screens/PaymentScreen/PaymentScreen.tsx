import { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smartphone, CreditCard, Wallet, QrCode, Shield } from 'lucide-react';
import { PaymentMethodENUM } from '@/types/order/PaymentMethodENUM.ts';
import type { CheckoutOrderState } from '@/ui/screens/CheckoutScreen/CheckoutScreen.vm';

/* ── Helpers ── */
function formatPrice(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

/* ── PhonePe UPI Payment UI ── */
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
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/20">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          <Smartphone className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-white">PhonePe</h2>
          <p className="text-sm text-purple-200">UPI Payment</p>
        </div>
      </div>

      {/* Amount */}
      <div className="text-center mb-8">
        <p className="text-purple-200 text-sm font-body mb-1">Amount to Pay</p>
        <p className="font-display text-4xl font-bold text-white">{formatPrice(total)}</p>
      </div>

      {/* QR Code Placeholder */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-40 h-40 bg-white rounded-2xl p-3 flex items-center justify-center mb-3">
          <div className="w-full h-full rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 flex flex-col items-center justify-center gap-2">
            <QrCode className="w-16 h-16 text-purple-700" />
            <p className="text-xs text-purple-600 font-semibold text-center leading-tight">
              Scan to Pay
            </p>
          </div>
        </div>
        <p className="text-xs text-purple-200 font-body">Scan QR code with PhonePe app</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-px bg-white/20" />
        <span className="text-xs text-purple-200 font-body uppercase tracking-widest">or enter UPI ID</span>
        <div className="flex-1 h-px bg-white/20" />
      </div>

      {/* UPI ID Input */}
      <div className="mb-6">
        <input
          type="text"
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="yourname@paytm / @phonepe"
          className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder:text-purple-300 font-body text-sm focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/20 transition-all"
        />
      </div>

      {/* Pay Button */}
      <button
        type="button"
        onClick={onPay}
        disabled={isProcessing}
        className="w-full bg-white text-purple-700 font-body font-bold py-4 rounded-xl text-lg hover:bg-purple-50 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <span className="w-5 h-5 border-2 border-purple-700/30 border-t-purple-700 rounded-full animate-spin" />
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
        className="w-full mt-3 py-3 text-sm text-purple-200 hover:text-white font-body transition-colors disabled:opacity-50"
      >
        Cancel Payment
      </button>
    </div>
  );
}

/* ── Razorpay Payment UI ── */
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
      <div className="flex items-center gap-3 mb-6 pb-6 border-b border-white/20">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-white">Razorpay</h2>
          <p className="text-sm text-blue-200">Secure Payment Gateway</p>
        </div>
      </div>

      {/* Amount */}
      <div className="text-center mb-6">
        <p className="text-blue-200 text-sm font-body mb-1">Amount to Pay</p>
        <p className="font-display text-4xl font-bold text-white">{formatPrice(total)}</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/10 rounded-xl p-1 mb-6 gap-1">
        {tabs.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setActiveTab(key)}
            className={[
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-body font-semibold transition-all duration-200',
              activeTab === key
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-blue-200 hover:text-white',
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
              <label className="text-xs text-blue-200 font-body font-semibold uppercase tracking-wider mb-1.5 block">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder:text-blue-300/60 font-body text-sm focus:outline-none focus:border-white/60 transition-all"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-blue-200 font-body font-semibold uppercase tracking-wider mb-1.5 block">
                  Expiry
                </label>
                <input
                  type="text"
                  value={expiry}
                  onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                  placeholder="MM/YY"
                  maxLength={5}
                  className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder:text-blue-300/60 font-body text-sm focus:outline-none focus:border-white/60 transition-all"
                />
              </div>
              <div>
                <label className="text-xs text-blue-200 font-body font-semibold uppercase tracking-wider mb-1.5 block">
                  CVV
                </label>
                <input
                  type="password"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="•••"
                  maxLength={4}
                  className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder:text-blue-300/60 font-body text-sm focus:outline-none focus:border-white/60 transition-all"
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
            <label className="text-xs text-blue-200 font-body font-semibold uppercase tracking-wider mb-1.5 block">
              UPI ID
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@bank"
              className="w-full bg-white/10 border border-white/30 rounded-xl px-4 py-3 text-white placeholder:text-blue-300/60 font-body text-sm focus:outline-none focus:border-white/60 transition-all"
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
                  className="py-3 px-4 rounded-xl bg-white/10 border border-white/20 text-blue-100 text-sm font-body font-medium hover:bg-white/20 hover:border-white/40 transition-all"
                >
                  {wallet}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pay Button */}
      <button
        type="button"
        onClick={onPay}
        disabled={isProcessing}
        className="w-full bg-white text-blue-700 font-body font-bold py-4 rounded-xl text-lg hover:bg-blue-50 transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <span className="w-5 h-5 border-2 border-blue-700/30 border-t-blue-700 rounded-full animate-spin" />
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
        className="w-full mt-3 py-3 text-sm text-blue-200 hover:text-white font-body transition-colors disabled:opacity-50"
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
      className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 rounded-3xl z-10 gap-5"
    >
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-white/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-white font-display text-2xl font-bold">Processing Payment</p>
        <p className="text-white/60 font-body text-sm mt-1">{formatPrice(total)}</p>
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

  const handlePay = () => {
    attemptCount.current += 1;
    setIsProcessing(true);

    // Simulate failure: 20% random chance, or after 3rd attempt
    const shouldFail =
      attemptCount.current >= 3 || Math.random() < 0.2;

    setTimeout(() => {
      setIsProcessing(false);
      if (shouldFail) {
        navigate('/payment/failed', { state: orderState });
      } else {
        navigate('/payment/success', { state: orderState });
      }
    }, 1500);
  };

  const handleCancel = () => {
    navigate('/payment/cancelled', { state: orderState });
  };

  const isPhonePe = paymentMethod === PaymentMethodENUM.PHONEPE;

  return (
    <div
      className={[
        'min-h-screen flex items-center justify-center p-4',
        isPhonePe
          ? 'bg-gradient-to-br from-[#5F259F] via-[#7B35C1] to-[#3D1070]'
          : 'bg-gradient-to-br from-[#072654] via-[#0D3680] to-[#0A1F4B]',
      ].join(' ')}
    >
      {/* Cancel button top-right */}
      <button
        type="button"
        onClick={handleCancel}
        className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
        aria-label="Cancel and go back"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Payment card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{
          background: isPhonePe
            ? 'rgba(255,255,255,0.08)'
            : 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="p-6 sm:p-8">
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
        <Shield className="w-4 h-4 text-white/40" />
        <span className="text-white/40 text-xs font-body">Secured by 256-bit SSL encryption</span>
      </div>
    </div>
  );
}
