import { configureStore } from '@reduxjs/toolkit';
import { cartReducer } from '@/store/slices/cartSlice.ts';
import { authReducer } from '@/store/slices/authSlice.ts';

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
  },
  devTools: import.meta.env.MODE !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
