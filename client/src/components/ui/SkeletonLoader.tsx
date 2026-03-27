import { cn } from "@/lib/utils";

function SkeletonLoader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("pnsp-skeleton rounded-md", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

function ProfileCardSkeleton() {
  return (
    <div className="pnsp-profile-card p-0 overflow-hidden animate-pulse">
      <div className="aspect-square pnsp-skeleton" />
      <div className="p-4 space-y-2">
        <SkeletonLoader className="h-4 w-3/4" />
        <SkeletonLoader className="h-3 w-1/2" />
        <SkeletonLoader className="h-3 w-2/3" />
        <div className="flex gap-2 mt-3">
          <SkeletonLoader className="h-5 w-16 rounded-full" />
          <SkeletonLoader className="h-5 w-20 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function ProfileHeroSkeleton() {
  return (
    <div className="animate-pulse">
      <SkeletonLoader className="w-full h-80" />
      <div className="container">
        <div className="flex items-end gap-4 -mt-16 pb-6">
          <SkeletonLoader className="w-32 h-32 rounded-2xl flex-shrink-0" />
          <div className="flex-1 pb-2 space-y-2">
            <SkeletonLoader className="h-8 w-64" />
            <SkeletonLoader className="h-5 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="pnsp-card p-5 animate-pulse space-y-3">
      <SkeletonLoader className="h-4 w-3/4" />
      <SkeletonLoader className="h-3 w-full" />
      <SkeletonLoader className="h-3 w-2/3" />
      <SkeletonLoader className="h-8 w-full rounded-lg mt-4" />
    </div>
  );
}

export { SkeletonLoader, ProfileCardSkeleton, ProfileHeroSkeleton, CardSkeleton };
