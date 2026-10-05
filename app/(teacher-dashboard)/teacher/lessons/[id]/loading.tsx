export default function TeacherLessonLoading() {
  return (
    <div className="container-page py-8 animate-page max-w-4xl mx-auto space-y-6">
      {/* Banner Skeleton */}
      <div className="h-16 rounded-2xl bg-ink-100/70 animate-pulse" />

      {/* Breadcrumb Skeleton */}
      <div className="h-4 w-60 rounded bg-ink-100 animate-pulse" />

      {/* Main Card Skeleton */}
      <div className="card p-6 sm:p-8 bg-white border-ink-100 space-y-4">
        <div className="h-6 w-28 rounded-full bg-ink-100 animate-pulse" />
        <div className="h-8 w-2/3 rounded-lg bg-ink-100 animate-pulse" />
        <div className="h-24 rounded-2xl bg-ink-50 animate-pulse" />
      </div>

      {/* Sections Skeleton */}
      <div className="space-y-4 pt-4">
        <div className="h-6 w-40 rounded bg-ink-100 animate-pulse" />
        <div className="card p-6 bg-white border-ink-100 space-y-3">
          <div className="h-6 w-1/3 rounded bg-ink-100 animate-pulse" />
          <div className="h-16 rounded bg-ink-50 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
