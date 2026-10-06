import { requireRole } from '@/lib/auth/require-role'
import { ArticlesFeed } from '@/features/articles/components/ArticlesFeed'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'إدارة الأخبار والمقالات | لوحة الإشراف',
  description: 'نشر وإدارة وتعديل الأخبار والمقالات والتوجيهات التربوية في المنصة',
}

const BUCKET_NAME = 'lesson-media'

export default async function SupervisorArticlesPage() {
  const { user, supabase } = await requireRole('supervisor')

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

      return {
        ...art,
        imageUrl,
        pdfUrl,
      }
    })
  )

  return (
    <div className="container-page py-6 sm:py-8 animate-page">
      <ArticlesFeed
        initialArticles={articles}
        currentUserId={user.id}
        canManage={true}
        bannerTitle="إدارة الأخبار والمقالات"
        bannerDescription="نشر وتعديل وحذف المقالات والأخبار والتوجيهات التربوية لجميع منسوبي المنصة من طلاب ومعلمين."
        badgeText="لوحة الإشراف الإعلامي والتربوي"
      />
    </div>
  )
}
