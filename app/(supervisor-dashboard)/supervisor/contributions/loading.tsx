export default function SupervisorContributionsLoading() {
  return (
    <div className="container-page py-6 sm:py-8 space-y-6">
      <div className="h-44 rounded-3xl bg-ink-100/60 animate-pulse" />
      <div className="h-20 rounded-2xl bg-ink-100/60 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        <div className="h-64 rounded-3xl bg-ink-100/60 animate-pulse" />
        <div className="h-64 rounded-3xl bg-ink-100/60 animate-pulse" />
      </div>
    </div>
  )
}
