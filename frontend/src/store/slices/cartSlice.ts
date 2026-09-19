import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItemBO } from '@/types/cart/CartItemBO.ts';

interface CartState {
  items: CartItemBO[];
  tableNumber: string;
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  tableNumber: '',
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItemBO>) => {
      const existing = state.items.find(
        (item) =>
          item.menuItemId === action.payload.menuItemId &&
          item.variantId === action.payload.variantId,
      );
      if (existing) {
        existing.quantity += action.payload.quantity;
        existing.totalPrice = existing.unitPrice * existing.quantity;
      } else {
        state.items.push(action.payload);
      }
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((item) => item.cartItemId !== action.payload);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ cartItemId: string; quantity: number }>,
    ) => {
      const item = state.items.find((i) => i.cartItemId === action.payload.cartItemId);
      if (item) {
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i.cartItemId !== action.payload.cartItemId);
        } else {
          item.quantity = action.payload.quantity;
          item.totalPrice = item.unitPrice * item.quantity;
        }
      }
    },
    clearCart: (state) => {
      state.items = [];
    },
    setTableNumber: (state, action: PayloadAction<string>) => {
      state.tableNumber = action.payload;
    },
    setCartOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
  },
});

export const { addItem, removeItem, updateQuantity, clearCart, setTableNumber, setCartOpen } =
  cartSlice.actions;
export const cartReducer = cartSlice.reducer;
