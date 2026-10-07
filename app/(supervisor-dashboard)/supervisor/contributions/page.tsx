import { requireRole } from '@/lib/auth/require-role'
import { StudentContributionsFeed } from '@/features/contributions/components/StudentContributionsFeed'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'المساهمات الطلابية',
  description: 'إدارة ومتابعة مساهمات الطلاب والمشاريع وتصفيتها وحذفها',
}

const BUCKET_NAME = 'lesson-media'

export default async function SupervisorContributionsPage() {
  const { user, profile, supabase } = await requireRole('supervisor')

  // Fetch subjects and raw contributions concurrently in parallel
  const [
    { data: subjects },
    { data: rawContributions },
  ] = await Promise.all([
    supabase
      .from('subjects')
      .select('id, name')
      .order('name', { ascending: true }),
    supabase
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
      .order('created_at', { ascending: false }),
  ])

  // Generate signed URLs in parallel for media
  const contributions = await Promise.all(
    (rawContributions ?? []).map(async (c) => {
      const [signedImg, signedPdf, signedVid] = await Promise.all([
        c.image_path
          ? supabase.storage.from(BUCKET_NAME).createSignedUrl(c.image_path, 3600 * 24)
          : Promise.resolve({ data: null }),
        c.pdf_path
          ? supabase.storage.from(BUCKET_NAME).createSignedUrl(c.pdf_path, 3600 * 24)
          : Promise.resolve({ data: null }),
        c.video_path
          ? supabase.storage.from(BUCKET_NAME).createSignedUrl(c.video_path, 3600 * 24)
          : Promise.resolve({ data: null }),
      ])

      return {
        ...c,
        imageUrl: signedImg.data?.signedUrl ?? null,
        pdfUrl: signedPdf.data?.signedUrl ?? null,
        videoUrl: signedVid.data?.signedUrl ?? null,
      }
    })
  )

  const supervisorName = profile?.full_name || 'المشرف التربوي'

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
