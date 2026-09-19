import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks.ts';
import { PaymentMethodENUM } from '@/types/order/PaymentMethodENUM.ts';
import type { CartItemBO } from '@/types/cart/CartItemBO.ts';

/* ── Form fields ── */
export interface CheckoutFormFields {
  tableNumber: string;
  customerName: string;
  phone: string;
  email: string;
}

/* ── Field-level errors ── */
export interface CheckoutFormErrors {
  tableNumber?: string;
  customerName?: string;
  phone?: string;
  email?: string;
}

/* ── Order data passed via location.state to /payment ── */
export interface CheckoutOrderState {
  tableNumber: string;
  customerName: string;
  phone: string;
  email: string;
  paymentMethod: PaymentMethodENUM;
  items: CartItemBO[];
  subtotal: number;
  tax: number;
  total: number;
  orderNumber: string;
}

/* ── Validators ── */
function validatePhone(phone: string): string | undefined {
  const stripped = phone.replace(/\D/g, '');
  if (!phone.trim()) return 'Phone number is required.';
  if (stripped.length !== 10) return 'Enter a valid 10-digit phone number.';
  return undefined;
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return undefined; // optional
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Enter a valid email address.';
  return undefined;
}

function generateOrderNumber(): string {
  const num = Math.floor(100 + Math.random() * 900);
  return `ROM-${num}`;
}

/* ── ViewModel ── */
export interface CheckoutVM {
  form: CheckoutFormFields;
  errors: CheckoutFormErrors;
  selectedPaymentMethod: PaymentMethodENUM;
  items: CartItemBO[];
  subtotal: number;
  tax: number;
  total: number;
  isSubmitting: boolean;
  handleFieldChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handlePaymentMethodSelect: (method: PaymentMethodENUM) => void;
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  handleBackToCart: () => void;
}

export function useCheckoutVM(): CheckoutVM {
  const navigate = useNavigate();
  const items = useAppSelector((s) => s.cart.items);

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = parseFloat((subtotal * 0.05).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));

  const [form, setForm] = useState<CheckoutFormFields>({
    tableNumber: '',
    customerName: '',
    phone: '',
    email: '',
  });

  const [errors, setErrors] = useState<CheckoutFormErrors>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodENUM>(
    PaymentMethodENUM.PHONEPE,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Clear error on change
    if (errors[name as keyof CheckoutFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePaymentMethodSelect = (method: PaymentMethodENUM) => {
    setSelectedPaymentMethod(method);
  };

  const validate = (): CheckoutFormErrors => {
    const errs: CheckoutFormErrors = {};
    if (!form.tableNumber.trim()) errs.tableNumber = 'Table number is required.';
    if (!form.customerName.trim()) errs.customerName = 'Customer name is required.';
    const phoneErr = validatePhone(form.phone);
    if (phoneErr) errs.phone = phoneErr;
    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;
    return errs;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    const orderState: CheckoutOrderState = {
      ...form,
      paymentMethod: selectedPaymentMethod,
      items,
      subtotal,
      tax,
      total,
      orderNumber: generateOrderNumber(),
    };

    navigate('/payment', { state: orderState });
  };

  const handleBackToCart = () => {
    navigate('/cart');
  };

  return {
    form,
    errors,
    selectedPaymentMethod,
    items,
    subtotal,
    tax,
    total,
    isSubmitting,
    handleFieldChange,
    handlePaymentMethodSelect,
    handleSubmit,
    handleBackToCart,
  };
}
