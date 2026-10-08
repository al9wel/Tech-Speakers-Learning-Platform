import Link from 'next/link'
import { requireRole } from '@/lib/auth/require-role'
import { createAdminClient } from '@/lib/supabase/admin'
import { CounselorsTable } from '@/features/counselors/components/CounselorsTable'
import type { UserItem } from '@/features/users/components/UserDialog'
import { Heart, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'إدارة المستشارين',
  description: 'إدارة ومتابعة حسابات المستشارين النفسيين والتربويين في المنصة',
}

export default async function AdminCounselorsPage() {
  const { user: currentAdmin } = await requireRole('admin')

  // Direct role query for counselors
  const admin = createAdminClient()
  const [authResult, profilesResult] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
    admin.from('profiles').select('id, full_name, role, created_at, is_approved').eq('role', 'counselor').order('created_at', { ascending: false }),
  ])

  const authUserMap = new Map((authResult.data?.users ?? []).map((u) => [u.id, u]))
  const counselorProfiles = profilesResult.data ?? []

  const counselors: UserItem[] = counselorProfiles.map((p) => {
    const authUser = authUserMap.get(p.id)
    return {
      id: p.id,
      email: authUser?.email ?? '',
      full_name: p.full_name ?? '',
      role: 'counselor',
      created_at: p.created_at || authUser?.created_at,
      is_approved: p.is_approved !== false,
    }
  })

  return (
    <div className="container-page py-8 animate-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center shrink-0 shadow-soft">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-ink-900">
              إدارة المستشارين
            </h1>
            <p className="text-sm text-ink-500">
              قائمة المستشارين النفسيين والتربويين وإدارة حساباتهم
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

      {/* TanStack Counselors Table */}
      <CounselorsTable data={counselors} currentAdminId={currentAdmin.id} />
    </div>
  )
}
