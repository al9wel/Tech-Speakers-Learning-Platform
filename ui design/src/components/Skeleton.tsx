export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton rounded ${className}`} />;
}

export function LessonRowSkeleton() {
  return (
    <div className="flex items-start gap-4 px-5 py-4 border-b border-border-subtle">
      <Skeleton className="w-9 h-9 shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <div className="flex gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function SubjectIndexSkeleton() {
  return (
    <div className="border border-border-base rounded-lg bg-bg-surface overflow-hidden">
      <div className="flex items-stretch">
        <Skeleton className="w-1.5 shrink-0" />
        <div className="flex-1 p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <Skeleton className="w-8 h-8" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-1 w-full mt-4" />
        </div>
      </div>
    </div>
  );
}
