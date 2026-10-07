import { requireRole } from '@/lib/auth/require-role'
import { ArticlesFeed } from '@/features/articles/components/ArticlesFeed'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'الأخبار والمقالات والتعاميم',
  description: 'متابعة وقراءة آخر الأخبار والتعاميم والمقالات التربوية',
}

const BUCKET_NAME = 'lesson-media'

export default async function TeacherArticlesPage() {
  const { user, supabase } = await requireRole('teacher')

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
    .limit(50)

  const articles = await Promise.all(
    (rawArticles ?? []).map(async (art) => {
      const [signedImg, signedPdf, signedVideo] = await Promise.all([
        art.image_path
          ? supabase.storage.from(BUCKET_NAME).createSignedUrl(art.image_path, 3600 * 24)
          : Promise.resolve({ data: null }),
        art.pdf_path
          ? supabase.storage.from(BUCKET_NAME).createSignedUrl(art.pdf_path, 3600 * 24)
          : Promise.resolve({ data: null }),
        art.video_path
          ? supabase.storage.from(BUCKET_NAME).createSignedUrl(art.video_path, 3600 * 24)
          : Promise.resolve({ data: null }),
      ])

      return {
        ...art,
        imageUrl: signedImg.data?.signedUrl ?? null,
        pdfUrl: signedPdf.data?.signedUrl ?? null,
        videoUrl: signedVideo.data?.signedUrl ?? null,
      }
    })
  )

  return (
    <div className="container-page py-6 sm:py-8 animate-page">
      <ArticlesFeed
        initialArticles={articles}
        currentUserId={user.id}
        canManage={false}
        bannerTitle="الأخبار والمقالات والتعاميم"
        bannerDescription="اطلع على أحدث التوجيهات التربوية، والتعاميم الإدارية، والمقالات المنشورة من قبل المشرفين."
        badgeText="لوحة المعلمين"
      />
    </div>
  )
}
