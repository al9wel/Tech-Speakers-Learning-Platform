import { requireRole } from '@/lib/auth/require-role'
import { StudentContributionsFeed } from '@/features/contributions/components/StudentContributionsFeed'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'مساهمات الطلاب | لوحة الإشراف',
  description: 'إدارة ومتابعة مساهمات الطلاب والمشاريع وتصفيتها وحذفها',
}

const BUCKET_NAME = 'lesson-media'

export default async function SupervisorContributionsPage() {
  const { user, supabase } = await requireRole('supervisor')

  const { data: userProfile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const { data: subjects } = await supabase
    .from('subjects')
    .select('id, name')
    .order('name', { ascending: true })

  const { data: rawContributions } = await supabase
    .from('student_contributions')
    .select(`
      *,
      student:profiles (
        id,
        full_name,
        role
      ),
      subject:subjects (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false })

  // Generate signed URLs in parallel for media
  const contributions = await Promise.all(
    (rawContributions ?? []).map(async (c) => {
      let imageUrl: string | null = null
      let pdfUrl: string | null = null

      if (c.image_path) {
        const { data: signedImg } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(c.image_path, 3600 * 24)
        imageUrl = signedImg?.signedUrl ?? null
      }

      if (c.pdf_path) {
        const { data: signedPdf } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(c.pdf_path, 3600 * 24)
        pdfUrl = signedPdf?.signedUrl ?? null
      }

      return {
        ...c,
        imageUrl,
        pdfUrl,
      }
    })
  )

  const supervisorName = userProfile?.full_name || 'المشرف التربوي'

  return (
    <div className="container-page py-6 sm:py-8 animate-page">
      <StudentContributionsFeed
        initialContributions={contributions}
        subjects={subjects || []}
        currentUserId={user.id}
        currentUserName={supervisorName}
        isSupervisorOrAdmin={true}
        showCreateButton={false}
        customTitle="إدارة مساهمات الطلاب"
        customDescription="استعراض والبحث في كافة مساهمات ومشاريع الطلاب عبر المواد مع إمكانية حذف أي مساهمة مخالفة."
        customBadge="لوحة الإشراف والمتابعة"
      />
    </div>
  )
}
