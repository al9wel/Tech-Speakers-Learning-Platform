import { TableSkeleton } from '@/components/ui/Skeletons'
import { Users } from 'lucide-react'

export default function AdminUsersLoading() {
  return (
    <div className="container-page py-8 animate-page">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-ink-700 flex items-center justify-center text-white shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-900">
            إدارة المستخدمين
          </h1>
          <p className="text-sm text-ink-500">
            جاري تحميل قائمة المستخدمين...
          </p>
        </div>
      </div>

      <TableSkeleton rows={6} />
    </div>
  )
}
