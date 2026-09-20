import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center px-6 py-16 min-h-[320px]">
      <div className="w-20 h-20 rounded-full bg-soroco-linen flex items-center justify-center mb-6">
        <Icon className="w-9 h-9 text-soroco-tan" aria-hidden="true" />
      </div>

      <h3 className="font-display text-xl sm:text-2xl font-semibold text-soroco-charcoal mb-2 text-balance">
        {title}
      </h3>

      <p className="font-body text-soroco-mocha text-sm sm:text-base leading-relaxed max-w-xs mb-8 text-pretty">
        {description}
      </p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="btn-primary"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
