export default function AuthLoading() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 animate-page">
      <div className="w-full max-w-md space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-ink-100 mx-auto animate-pulse" />
        <div className="h-6 w-48 rounded bg-ink-100 mx-auto animate-pulse" />
        <div className="card p-7 bg-white border border-ink-100 space-y-4">
          <div className="h-10 rounded-xl bg-ink-50 animate-pulse" />
          <div className="h-10 rounded-xl bg-ink-50 animate-pulse" />
          <div className="h-12 rounded-xl bg-ink-100 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
