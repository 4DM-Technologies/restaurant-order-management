import { configureStore } from '@reduxjs/toolkit';
import { cartReducer } from '@/store/slices/cartSlice.ts';
import { authReducer } from '@/store/slices/authSlice.ts';
import { getAccessToken, getSavedUser } from '@/services/apiClient.ts';
import type { UserBO } from '@/types/user/UserBO.ts';

// Restore the persisted session on boot so a browser refresh keeps you logged
// in until the token expires (sign-out from localStorage is the only logout).
const savedUser = getSavedUser<UserBO>();
const preloadedState = {
  auth: {
    user: savedUser,
    isAuthenticated: Boolean(getAccessToken() && savedUser),
    isLoading: false,
  },
};

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
  },
  preloadedState,
  devTools: import.meta.env.MODE !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
