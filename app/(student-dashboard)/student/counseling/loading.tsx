export default function StudentCounselingLoading() {
  return (
    <div className="container-page py-6 sm:py-8 space-y-8 animate-page">
      {/* Banner Skeleton */}
      <div className="h-44 rounded-3xl bg-ink-100/60 animate-pulse" />

      {/* Counselors Grid Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-48 rounded-xl bg-ink-100/60 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="h-36 rounded-2xl bg-ink-100/60 animate-pulse" />
          <div className="h-36 rounded-2xl bg-ink-100/60 animate-pulse" />
          <div className="h-36 rounded-2xl bg-ink-100/60 animate-pulse" />
        </div>
      </div>

      {/* Messages Grid Skeleton */}
      <div className="space-y-4">
        <div className="h-6 w-40 rounded-xl bg-ink-100/60 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 rounded-3xl bg-ink-100/60 animate-pulse" />
          <div className="h-40 rounded-3xl bg-ink-100/60 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
