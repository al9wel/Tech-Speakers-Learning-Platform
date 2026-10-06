import { TableSkeleton } from '@/components/ui/Skeletons'
import { BookOpen } from 'lucide-react'

export default function TeacherSubjectsLoading() {
  return (
    <div className="container-page py-8 animate-page">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent border border-accent/20 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-serif font-bold text-2xl text-ink-primary">
            المواد الدراسية
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted">
            جاري تحميل المواد الدراسية...
          </p>
        </div>
      </div>

      <TableSkeleton rows={5} />
    </div>
  )
}
