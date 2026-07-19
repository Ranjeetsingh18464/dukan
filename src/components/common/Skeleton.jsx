export function SkeletonLine({ className = '' }) {
  return <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-lg ${className}`} />;
}

export function SkeletonCircle({ className = '' }) {
  return <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded-full ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="card space-y-3">
      <SkeletonLine className="h-48 w-full !rounded-2xl" />
      <SkeletonLine className="h-5 w-3/4" />
      <SkeletonLine className="h-4 w-1/2" />
    </div>
  );
}

export function SkeletonProductCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 space-y-3">
      <SkeletonLine className="h-40 w-full !rounded-xl" />
      <SkeletonLine className="h-5 w-3/4" />
      <SkeletonLine className="h-4 w-1/2" />
      <SkeletonLine className="h-10 w-full !rounded-xl" />
    </div>
  );
}

export function SkeletonTableRow() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-gray-50">
      <SkeletonCircle className="h-10 w-10" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-4 w-1/3" />
        <SkeletonLine className="h-3 w-1/4" />
      </div>
      <SkeletonLine className="h-6 w-20 !rounded-lg" />
    </div>
  );
}

export function SkeletonDashboardCard() {
  return (
    <div className="stat-card space-y-3">
      <SkeletonCircle className="h-12 w-12" />
      <SkeletonLine className="h-6 w-1/2" />
      <SkeletonLine className="h-4 w-3/4" />
    </div>
  );
}
