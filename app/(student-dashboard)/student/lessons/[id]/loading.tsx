export default function StudentLessonViewLoading() {
  return (
    <div className="container-page py-8 animate-page max-w-4xl mx-auto space-y-6">
      <div className="h-4 w-56 max-w-full bg-ink-100 rounded-md animate-pulse mb-6" />
      <div className="card p-4 sm:p-8 space-y-4 overflow-hidden">
        <div className="h-5 w-28 max-w-full bg-ink-100 rounded-full animate-pulse" />
        <div className="h-8 w-full max-w-xs bg-ink-100 rounded-md animate-pulse" />
        <div className="h-20 bg-ink-50 rounded-xl animate-pulse" />
      </div>

      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="card p-4 sm:p-6 space-y-4 overflow-hidden">
            <div className="h-6 w-48 max-w-full bg-ink-100 rounded-md animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-ink-50 rounded-md animate-pulse" />
              <div className="h-4 w-5/6 bg-ink-50 rounded-md animate-pulse" />
            </div>
            <div className="h-32 bg-ink-50 rounded-xl animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
