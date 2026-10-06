import { requireRole } from '@/lib/auth/require-role'
import { StudentContributionsFeed } from '@/features/contributions/components/StudentContributionsFeed'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'مساهمات الطلاب | منصة التعلّم',
  description: 'استعراض ونشر مساهمات ومشاريع الطلاب عبر مختلف المواد',
}

const BUCKET_NAME = 'lesson-media'

export default async function StudentContributionsPage() {
  const { user, supabase } = await requireRole('student')

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

  const studentName = userProfile?.full_name || 'طالب مسجل'

  return (
    <div className="container-page py-6 sm:py-8 animate-page">
      <StudentContributionsFeed
        initialContributions={contributions}
        subjects={subjects || []}
        currentUserId={user.id}
        currentUserName={studentName}
      />
    </div>
  )
}
