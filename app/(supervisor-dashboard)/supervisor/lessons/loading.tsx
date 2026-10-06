export default function SupervisorLessonsLoading() {
  return (
    <div className="container-page py-6 sm:py-8 space-y-6">
      <div className="h-44 rounded-3xl bg-ink-100/60 animate-pulse" />
      <div className="h-20 rounded-2xl bg-ink-100/60 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="h-60 rounded-3xl bg-ink-100/60 animate-pulse" />
        <div className="h-60 rounded-3xl bg-ink-100/60 animate-pulse" />
        <div className="h-60 rounded-3xl bg-ink-100/60 animate-pulse" />
      </div>
    </div>
  )
}
