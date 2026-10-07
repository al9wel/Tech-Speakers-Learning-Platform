import Link from 'next/link'
import { requireRole } from '@/lib/auth/require-role'
import { createAdminClient } from '@/lib/supabase/admin'
import { SupervisorsTable } from '@/features/supervisors/components/SupervisorsTable'
import type { UserItem } from '@/features/users/components/UserDialog'
import { ShieldCheck, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إدارة المشرفين التربويين',
  description: 'إدارة ومتابعة حسابات المشرفين التربويين في المنصة',
}

export default async function AdminSupervisorsPage() {
  const { user: currentAdmin } = await requireRole('admin')

  // Direct role query for supervisors
  const admin = createAdminClient()
  const [authResult, profilesResult] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('profiles').select('id, full_name, role, created_at').eq('role', 'supervisor'),
  ])

  const authUserMap = new Map((authResult.data?.users ?? []).map((u) => [u.id, u]))
  const supervisorProfiles = profilesResult.data ?? []

  const supervisors: UserItem[] = supervisorProfiles.map((p) => {
    const authUser = authUserMap.get(p.id)
    return {
      id: p.id,
      email: authUser?.email ?? '',
      full_name: p.full_name ?? '',
      role: 'supervisor',
      created_at: p.created_at || authUser?.created_at,
    }
  })

  return (
    <div className="container-page py-8 animate-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 flex items-center justify-center shrink-0 shadow-soft">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-ink-900">
              إدارة المشرفين
            </h1>
            <p className="text-sm text-ink-500">
              قائمة المشرفين التربويين وتدقيق المناهج الدراسية
            </p>
          </div>
        </div>

        <Link
          href="/admin"
          className="btn-outline text-sm flex items-center gap-2 hover:bg-ink-50"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للوحة التحكم</span>
        </Link>
      </div>

      {/* TanStack Supervisors Table */}
      <SupervisorsTable data={supervisors} currentAdminId={currentAdmin.id} />
    </div>
  )
}
