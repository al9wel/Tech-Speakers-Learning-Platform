export default function StudentSubjectLessonsLoading() {
  return (
    <div className="container-page py-8 animate-page">
      <div className="h-4 w-48 bg-ink-100 rounded-md animate-pulse mb-6" />
      <div className="card p-8 mb-8 flex items-center gap-6">
        <div className="w-24 h-24 rounded-2xl bg-ink-100 animate-pulse shrink-0" />
        <div className="space-y-3 flex-1">
          <div className="h-6 w-48 bg-ink-100 rounded-md animate-pulse" />
          <div className="h-4 w-96 bg-ink-50 rounded-md animate-pulse" />
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-ink-100 animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-40 bg-ink-100 rounded-md animate-pulse" />
                <div className="h-4 w-72 bg-ink-50 rounded-md animate-pulse" />
              </div>
            </div>
            <div className="h-9 w-24 bg-ink-100 rounded-lg animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
