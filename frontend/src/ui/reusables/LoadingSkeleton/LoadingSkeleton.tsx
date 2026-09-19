type SkeletonVariant = 'card' | 'row' | 'text' | 'page';

interface LoadingSkeletonProps {
  variant: SkeletonVariant;
  /** How many repetitions to render (default: 1) */
  count?: number;
}

/* ── Individual skeletons ── */

function CardSkeleton() {
  return (
    <div className="card overflow-hidden" aria-hidden="true">
      {/* Image area */}
      <div className="skeleton aspect-[4/3] w-full rounded-none" />
      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="skeleton w-4 h-4 rounded-sm shrink-0" />
          <div className="skeleton h-4 w-2/3 rounded" />
        </div>
        <div className="skeleton h-3 w-full rounded" />
        <div className="skeleton h-3 w-4/5 rounded" />
        <div className="flex items-center justify-between mt-1">
          <div className="skeleton h-5 w-16 rounded" />
          <div className="skeleton h-8 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3 border-b border-soroco-linen"
      aria-hidden="true"
    >
      <div className="skeleton w-12 h-12 rounded-xl shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="skeleton h-4 w-1/3 rounded" />
        <div className="skeleton h-3 w-1/2 rounded" />
      </div>
      <div className="skeleton h-6 w-20 rounded-full shrink-0" />
    </div>
  );
}

function TextSkeleton() {
  return (
    <div className="space-y-2" aria-hidden="true">
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-11/12 rounded" />
      <div className="skeleton h-4 w-3/4 rounded" />
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-soroco-cream" aria-hidden="true">
      {/* Fake nav */}
      <div className="h-18 bg-white border-b border-soroco-linen flex items-center px-6">
        <div className="skeleton h-6 w-32 rounded" />
      </div>

      {/* Hero */}
      <div className="skeleton h-64 md:h-80 w-full rounded-none" />

      {/* Content grid */}
      <div className="section-container py-12">
        <div className="skeleton h-8 w-48 rounded mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main export ── */

export default function LoadingSkeleton({
  variant,
  count = 1,
}: LoadingSkeletonProps) {
  if (variant === 'page') return <PageSkeleton />;

  const items = Array.from({ length: count });

  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (variant === 'row') {
    return (
      <div className="rounded-2xl overflow-hidden bg-white border border-soroco-linen">
        {items.map((_, i) => <RowSkeleton key={i} />)}
      </div>
    );
  }

  /* text */
  return (
    <div className="space-y-4">
      {items.map((_, i) => <TextSkeleton key={i} />)}
    </div>
  );
}
