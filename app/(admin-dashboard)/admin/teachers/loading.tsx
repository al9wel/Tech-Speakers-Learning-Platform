import { TableSkeleton } from '@/components/ui/Skeletons'
import { Users } from 'lucide-react'

export default function AdminTeachersLoading() {
  return (
    <div className="container-page py-8 animate-page">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent border border-accent/20 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-serif font-bold text-2xl text-ink-primary">
            إدارة المعلمين
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            جاري تحميل قائمة المعلمين...
          </p>
        </div>
      </div>

      <TableSkeleton rows={6} />
    </div>
  )
}
