import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '@/store/hooks.ts';
import { clearCart, removeItem, updateQuantity } from '@/store/slices/cartSlice.ts';
import type { CartItemBO } from '@/types/cart/CartItemBO.ts';
import { TAX_RATE } from '@/constants/cafe.ts';

export interface CartVM {
  items: CartItemBO[];
  itemCount: number;
  subtotal: number;
  tax: number;
  total: number;
  isEmpty: boolean;
  handleClear: () => void;
  handleIncrement: (item: CartItemBO) => (e: MouseEvent<HTMLButtonElement>) => void;
  handleDecrement: (item: CartItemBO) => (e: MouseEvent<HTMLButtonElement>) => void;
  handleRemove: (cartItemId: string) => void;
  handleCheckout: () => void;
  handleContinueShopping: () => void;
}

export function useCartVM(): CartVM {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector((s) => s.cart.items);

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));

  const handleIncrement =
    (item: CartItemBO) => (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      dispatch(updateQuantity({ cartItemId: item.cartItemId, quantity: item.quantity + 1 }));
    };

  const handleDecrement =
    (item: CartItemBO) => (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      const newQty = item.quantity - 1;
      if (newQty <= 0) {
        dispatch(removeItem(item.cartItemId));
      } else {
        dispatch(updateQuantity({ cartItemId: item.cartItemId, quantity: newQty }));
      }
    };

  const handleRemove = (cartItemId: string) => {
    dispatch(removeItem(cartItemId));
  };

  const handleClear = () => {
    dispatch(clearCart());
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/menu');
  };

  return {
    items,
    itemCount,
    subtotal,
    tax,
    total,
    isEmpty: items.length === 0,
    handleClear,
    handleIncrement,
    handleDecrement,
    handleRemove,
    handleCheckout,
    handleContinueShopping,
  };
}
