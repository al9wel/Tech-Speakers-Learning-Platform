import Link from 'next/link'
import { requireRole } from '@/lib/auth/require-role'
import { createAdminClient } from '@/lib/supabase/admin'
import { StudentsTable } from '@/features/students/components/StudentsTable'
import type { UserItem } from '@/features/users/components/UserDialog'
import { GraduationCap, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'إدارة الطلاب',
  description: 'إدارة ومتابعة حسابات الطلاب المسجلين في المنصة',
}

export default async function AdminStudentsPage() {
  const { user: currentAdmin } = await requireRole('admin')

  // Direct role query for students
  const admin = createAdminClient()
  const [authResult, profilesResult] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('profiles').select('id, full_name, role, created_at').eq('role', 'student'),
  ])

  const authUserMap = new Map((authResult.data?.users ?? []).map((u) => [u.id, u]))
  const studentProfiles = profilesResult.data ?? []

  const students: UserItem[] = studentProfiles.map((p) => {
    const authUser = authUserMap.get(p.id)
    return {
      id: p.id,
      email: authUser?.email ?? '',
      full_name: p.full_name ?? '',
      role: 'student',
      created_at: p.created_at || authUser?.created_at,
    }
  })

  return (
    <div className="container-page py-8 animate-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sage-50 text-sage-dark border border-sage-100 flex items-center justify-center shrink-0 shadow-soft">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-ink-900">
              إدارة الطلاب
            </h1>
            <p className="text-sm text-ink-500">
              قائمة الطلاب المسجلين وإدارة بياناتهم الأكاديمية
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

      {/* TanStack Students Table */}
      <StudentsTable data={students} currentAdminId={currentAdmin.id} />
    </div>
  )
}
