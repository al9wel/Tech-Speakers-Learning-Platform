import { TableSkeleton } from '@/components/ui/Skeletons'
import { GraduationCap } from 'lucide-react'

export default function AdminStudentsLoading() {
  return (
    <div className="container-page py-8 animate-page">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-sage-50 text-sage-dark border border-sage-100 flex items-center justify-center shrink-0">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-900">
            إدارة الطلاب
          </h1>
          <p className="text-sm text-ink-500">
            جاري تحميل قائمة الطلاب...
          </p>
        </div>
      </div>

      <TableSkeleton rows={6} />
    </div>
  )
}
