import { useState, useEffect, type ReactNode } from 'react';
import BrandLoader from '@/ui/reusables/BrandLoader/BrandLoader.tsx';
import LoadingSkeleton from '@/ui/reusables/LoadingSkeleton/LoadingSkeleton.tsx';

interface DelayedLoaderProps {
  /** ms of loading before the branded coffee loader appears (default 2000) */
  delay?: number;
  variant?: 'full' | 'inline';
  /** Shown during the grace period instead of the default skeleton */
  fallback?: ReactNode;
  className?: string;
}

export default function DelayedLoader({
  delay = 2000,
  variant = 'full',
  fallback,
  className = '',
}: DelayedLoaderProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  if (show) {
    return <BrandLoader variant={variant} className={className} />;
  }

  if (fallback !== undefined) return <>{fallback}</>;
  return variant === 'full' ? <LoadingSkeleton variant="page" /> : <div className={className} />;
}