export default function StudentSubjectsLoading() {
  return (
    <div className="container-page py-8 animate-page">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-ink-100 animate-pulse" />
        <div className="space-y-2">
          <div className="h-6 w-36 bg-ink-100 rounded-md animate-pulse" />
          <div className="h-4 w-60 bg-ink-50 rounded-md animate-pulse" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="card overflow-hidden">
            <div className="h-44 bg-ink-100 animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-5 w-32 bg-ink-100 rounded-md animate-pulse" />
              <div className="h-4 w-48 bg-ink-50 rounded-md animate-pulse" />
              <div className="h-4 w-24 bg-ink-50 rounded-md animate-pulse pt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
