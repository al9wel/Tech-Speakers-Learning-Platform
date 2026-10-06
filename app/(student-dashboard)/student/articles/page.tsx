import { requireRole } from '@/lib/auth/require-role'
import { ArticlesFeed } from '@/features/articles/components/ArticlesFeed'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'الأخبار والمقالات',
  description: 'متابعة وقراءة آخر الأخبار والمقالات والإعلانات التربوية',
}

const BUCKET_NAME = 'lesson-media'

export default async function StudentArticlesPage() {
  const { user, supabase } = await requireRole('student')

  const { data: rawArticles } = await supabase
    .from('articles')
    .select(`
      *,
      author:profiles!articles_author_id_fkey (
        id,
        full_name,
        role
      )
    `)
    .order('created_at', { ascending: false })

  const articles = await Promise.all(
    (rawArticles ?? []).map(async (art) => {
      let imageUrl: string | null = null
      let pdfUrl: string | null = null
      let videoUrl: string | null = null

      if (art.image_path) {
        const { data: signedImg } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(art.image_path, 3600 * 24)
        imageUrl = signedImg?.signedUrl ?? null
      }

      if (art.pdf_path) {
        const { data: signedPdf } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(art.pdf_path, 3600 * 24)
        pdfUrl = signedPdf?.signedUrl ?? null
      }

      if (art.video_path) {
        const { data: signedVideo } = await supabase.storage
          .from(BUCKET_NAME)
          .createSignedUrl(art.video_path, 3600 * 24)
        videoUrl = signedVideo?.signedUrl ?? null
      }

      return {
        ...art,
        imageUrl,
        pdfUrl,
        videoUrl,
      }
    })
  )

  return (
    <div className="container-page py-6 sm:py-8 animate-page">
      <ArticlesFeed
        initialArticles={articles}
        currentUserId={user.id}
        canManage={false}
        bannerTitle="الأخبار والمقالات التربوية"
        bannerDescription="تابع أحدث الإعلانات والأنشطة والمقالات والتوجيهات المنشورة من قبل المشرفين التربويين."
        badgeText="لوحة إعلانات وأخبار الطلاب"
      />
    </div>
  )
}
