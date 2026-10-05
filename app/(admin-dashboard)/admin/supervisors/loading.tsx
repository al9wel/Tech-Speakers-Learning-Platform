import { TableSkeleton } from '@/components/ui/Skeletons'
import { ShieldCheck } from 'lucide-react'

export default function AdminSupervisorsLoading() {
  return (
    <div className="container-page py-8 animate-page">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-900">
            إدارة المشرفين
          </h1>
          <p className="text-sm text-ink-500">
            جاري تحميل قائمة المشرفين...
          </p>
        </div>
      </div>

      <TableSkeleton rows={6} />
    </div>
  )
}
