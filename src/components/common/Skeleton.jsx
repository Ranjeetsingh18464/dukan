export function SkeletonLine({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export function SkeletonCircle({ className = '' }) {
  return <div className={`animate-pulse bg-gray-200 rounded-full ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <SkeletonLine className="h-48 w-full" />
      <SkeletonLine className="h-4 w-3/4" />
      <SkeletonLine className="h-4 w-1/2" />
    </div>
  );
}

export function SkeletonProductCard() {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-4 space-y-3">
      <SkeletonLine className="h-40 w-full !rounded-lg" />
      <SkeletonLine className="h-4 w-3/4" />
      <SkeletonLine className="h-4 w-1/2" />
      <SkeletonLine className="h-8 w-full !rounded-lg" />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b">
      <SkeletonCircle className="h-10 w-10" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-4 w-1/3" />
        <SkeletonLine className="h-3 w-1/4" />
      </div>
      <SkeletonLine className="h-6 w-20" />
    </div>
  );
}

export function SkeletonDashboardCard() {
  return (
    <div className="card space-y-3">
      <SkeletonCircle className="h-10 w-10" />
      <SkeletonLine className="h-6 w-1/2" />
      <SkeletonLine className="h-4 w-3/4" />
    </div>
  );
}
