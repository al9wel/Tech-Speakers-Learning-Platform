export default function Loading() {
  return (
    <div className="container-page py-8 animate-pulse max-w-5xl mx-auto space-y-8">
      {/* Header skeleton */}
      <div className="rounded-3xl border border-ink-100 bg-white p-4 sm:p-8 space-y-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="space-y-2">
            <div className="h-5 w-40 max-w-full rounded-full bg-ink-100" />
            <div className="h-8 w-64 max-w-full rounded-xl bg-ink-200/70" />
            <div className="h-4 w-full max-w-sm rounded-md bg-ink-100" />
          </div>
          <div className="h-12 w-44 max-w-full rounded-2xl bg-ink-200" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-ink-100">
          <div className="h-20 rounded-2xl bg-ink-100" />
          <div className="h-20 rounded-2xl bg-ink-100" />
          <div className="h-20 rounded-2xl bg-ink-100" />
        </div>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="h-11 flex-1 rounded-2xl bg-ink-100" />
        <div className="h-11 w-full sm:w-64 rounded-2xl bg-ink-100" />
      </div>

      {/* Questions list */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 rounded-2xl w-full bg-ink-100" />
        ))}
      </div>
    </div>
  )
}
