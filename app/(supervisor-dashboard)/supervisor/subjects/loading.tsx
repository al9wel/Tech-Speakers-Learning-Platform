import { TableSkeleton } from '@/components/ui/Skeletons'

export default function SupervisorSubjectsLoading() {
  return (
    <div className="container-page py-8 animate-page">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ink-100 animate-pulse shrink-0" />
          <div className="space-y-2">
            <div className="h-6 w-36 bg-ink-100 rounded-md animate-pulse" />
            <div className="h-4 w-60 bg-ink-50 rounded-md animate-pulse" />
          </div>
        </div>
      </div>
      <TableSkeleton rows={6} />
    </div>
  )
}
