import { TableSkeleton } from '@/components/ui/Skeletons'
import { Heart } from 'lucide-react'

export default function AdminCounselorsLoading() {
  return (
    <div className="container-page py-8 animate-page">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0">
          <Heart className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-900">
            إدارة المستشارين
          </h1>
          <p className="text-sm text-ink-500">
            جاري تحميل قائمة المستشارين...
          </p>
        </div>
      </div>

      <TableSkeleton rows={6} />
    </div>
  )
}
