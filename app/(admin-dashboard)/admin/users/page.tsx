import Link from 'next/link'
import { requireRole } from '@/lib/auth/require-role'
import { isAppRole, type AppRole } from '@/lib/auth/roles'
import { createAdminClient } from '@/lib/supabase/admin'
import { UsersTable } from '@/features/users/components/UsersTable'
import type { UserItem } from '@/features/users/components/UserDialog'
import { Users, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إدارة المستخدمين',
  description: 'إدارة وتعديل حسابات جميع مستخدمي المنصة وتعيين الصلاحيات',
}

export default async function AdminUsersPage() {
  const { user: currentAdmin } = await requireRole('admin')

  // Fetch all users & profiles in parallel
  const admin = createAdminClient()
  const [authResult, profilesResult] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('profiles').select('id, full_name, role, created_at'),
  ])

  const authUsersData = authResult.data
  const profiles = profilesResult.data

  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  const users: UserItem[] = (authUsersData?.users ?? []).map((u) => {
    const p = profileMap.get(u.id)
    return {
      id: u.id,
      email: u.email ?? '',
      full_name: p?.full_name ?? '',
      role: (p?.role && isAppRole(p.role) ? p.role : 'student') as AppRole,
      created_at: p?.created_at || u.created_at,
    }
  })

  return (
    <div className="container-page py-8 animate-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ink-700 flex items-center justify-center text-white shrink-0 shadow-soft">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-ink-900">
              إدارة المستخدمين
            </h1>
            <p className="text-sm text-ink-500">
              إدارة حسابات المنصة وتعيين الصلاحيات والأدوار
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

      {/* TanStack Users Table with Realtime Filter, Pagination & Modals */}
      <UsersTable data={users} currentAdminId={currentAdmin.id} />
    </div>
  )
}
