export default function StudentArticlesLoading() {
  return (
    <div className="container-page py-6 sm:py-8 space-y-6">
      <div className="h-44 rounded-3xl bg-ink-100/60 animate-pulse" />
      <div className="h-20 rounded-2xl bg-ink-100/60 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        <div className="col-span-1 md:col-span-2 lg:col-span-4 h-[460px] sm:h-[500px] rounded-3xl bg-ink-100/60 animate-pulse" />
        <div className="col-span-1 md:col-span-2 lg:col-span-3 h-[420px] rounded-3xl bg-ink-100/60 animate-pulse" />
        <div className="col-span-1 md:col-span-2 lg:col-span-1 h-[420px] rounded-3xl bg-ink-100/60 animate-pulse" />
        <div className="col-span-1 md:col-span-1 lg:col-span-2 h-[380px] rounded-3xl bg-ink-100/60 animate-pulse" />
        <div className="col-span-1 md:col-span-1 lg:col-span-2 h-[380px] rounded-3xl bg-ink-100/60 animate-pulse" />
      </div>
    </div>
  )
}
