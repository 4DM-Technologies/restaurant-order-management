import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/platform/authService/AuthService.ts';
import { setUser } from '@/store/slices/authSlice.ts';
import { useAppDispatch } from '@/store/hooks.ts';
import { UserRoleENUM } from '@/types/user/UserRoleENUM.ts';

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export type PasswordStrength = 'weak' | 'medium' | 'strong';

function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 6) return 'weak';
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const score = [hasUpper, hasLower, hasNumber, hasSpecial, password.length >= 10].filter(Boolean).length;
  if (score <= 2) return 'weak';
  if (score <= 3) return 'medium';
  return 'strong';
}

interface AccountStatus {
  exists: boolean;
  hasPassword: boolean;
}

export function useSignupVM() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<AccountStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordStrength: PasswordStrength = getPasswordStrength(password);
  const canSetPassword = status !== null && status.exists && !status.hasPassword;

  function validateEmailInput(emailValue: string): string | null {
    if (!emailValue.trim()) return 'Email is required.';
    if (!validateEmail(emailValue)) return 'Please enter a valid email address.';
    return null;
  }

  async function handleCheckEmail(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validateEmailInput(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsChecking(true);
    try {
      const result = await authService.checkEmail(email.trim());
      setStatus({ exists: result.exists, hasPassword: result.has_password });
      setPassword('');
      setConfirmPassword('');
      if (!result.exists) {
        setError('No account found for this email — ask the admin to add you first.');
      } else if (result.has_password) {
        setError('This account is already active. Please sign in instead.');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not check this email. Please try again.');
    } finally {
      setIsChecking(false);
    }
  }

  function validateActivation(): string | null {
    if (!validateEmailInput(email)) return validateEmailInput(email);
    if (!password) return 'Password is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return null;
  }

  async function handleActivate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const validationError = validateActivation();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsActivating(true);
    try {
      const user = await authService.signup(email.trim(), password);
      dispatch(setUser(user));
      if (user.role === UserRoleENUM.ADMIN) {
        navigate('/admin');
      } else {
        navigate('/orders');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Activation failed. Please try again.');
    } finally {
      setIsActivating(false);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    passwordStrength,
    status,
    canSetPassword,
    isLoading: isChecking || isActivating,
    error,
    handleCheckEmail,
    handleActivate,
  };
}