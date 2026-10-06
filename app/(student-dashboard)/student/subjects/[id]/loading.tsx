export default function StudentSubjectLessonsLoading() {
  return (
    <div className="container-page py-8 animate-page">
      <div className="h-4 w-48 bg-ink-100 rounded-md animate-pulse mb-6" />
      <div className="card p-4 sm:p-8 mb-8 flex flex-col sm:flex-row items-center gap-6 overflow-hidden">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-ink-100 animate-pulse shrink-0" />
        <div className="space-y-3 flex-1 w-full text-center sm:text-right">
          <div className="h-6 w-48 max-w-full bg-ink-100 rounded-md animate-pulse mx-auto sm:mx-0" />
          <div className="h-4 w-full max-w-sm bg-ink-50 rounded-md animate-pulse mx-auto sm:mx-0" />
        </div>
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 overflow-hidden">
            <div className="flex items-start sm:items-center gap-4 w-full">
              <div className="w-10 h-10 rounded-xl bg-ink-100 animate-pulse shrink-0 mt-0.5 sm:mt-0" />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="h-5 w-40 max-w-full bg-ink-100 rounded-md animate-pulse" />
                <div className="h-4 w-full max-w-xs bg-ink-50 rounded-md animate-pulse" />
              </div>
            </div>
            <div className="h-9 w-24 bg-ink-100 rounded-lg animate-pulse self-end sm:self-auto shrink-0" />
          </div>
        ))}
      </div>
    </div>
  )
}
