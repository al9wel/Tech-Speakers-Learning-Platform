import { TableSkeleton } from '@/components/ui/Skeletons'
import { BookOpen } from 'lucide-react'

export default function TeacherSubjectsLoading() {
  return (
    <div className="container-page py-8 animate-page">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold-dark border border-gold/30 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-900">
            المواد الدراسية
          </h1>
          <p className="text-sm text-ink-500">
            جاري تحميل المواد الدراسية...
          </p>
        </div>
      </div>

      <TableSkeleton rows={5} />
    </div>
  )
}
