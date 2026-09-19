import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/platform/authService/AuthService.ts';
import { setUser } from '@/store/slices/authSlice.ts';
import { useAppDispatch } from '@/store/hooks.ts';
import { UserRoleENUM } from '@/types/user/UserRoleENUM.ts';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function useLoginVM() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function validate(): string | null {
    if (!email.trim()) return 'Email is required.';
    if (!validateEmail(email)) return 'Please enter a valid email address.';
    if (!password.trim()) return 'Password is required.';
    return null;
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const user = await authService.login(email.trim(), password);
      dispatch(setUser(user));
      if (user.role === UserRoleENUM.ADMIN) {
        navigate('/admin');
      } else {
        navigate('/orders');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    handleLogin,
  };
}
