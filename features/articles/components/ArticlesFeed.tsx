'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  Filter,
  Plus,
  Sparkles,
  Inbox,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import type { ArticleItem, ArticleCategory } from '../types'
import { deleteArticleAction } from '../server/actions'
import { ArticleCard } from './ArticleCard'
import { ArticleDialog } from './ArticleDialog'

const CATEGORY_TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'جميع المنشورات' },
  { key: 'خبر', label: 'أخبار' },
  { key: 'مقال', label: 'مقالات' },
  { key: 'إعلان', label: 'إعلانات' },
  { key: 'توجيه تربوي', label: 'توجيهات تربوية' },
]

interface ArticlesFeedProps {
  initialArticles: ArticleItem[]
  currentUserId: string
  canManage?: boolean
  bannerTitle?: string
  bannerDescription?: string
  badgeText?: string
}


export function ArticlesFeed({
  initialArticles,
  currentUserId,
  canManage = false,
  bannerTitle,
  bannerDescription,
  badgeText,
}: ArticlesFeedProps) {
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null)

  const handleArticleSaved = (savedArticle: ArticleItem) => {
    setArticles((prev) => {
      const exists = prev.some((a) => a.id === savedArticle.id)
      if (exists) {
        return prev.map((a) => (a.id === savedArticle.id ? savedArticle : a))
      }
      return [savedArticle, ...prev]
    })
    setEditingArticle(null)
  }

  const handleDeleteArticle = async (id: string) => {
    try {
      const res = await deleteArticleAction(id)
      if (res.success) {
        toast.success(res.message || 'تم حذف المنشور بنجاح')
        setArticles((prev) => prev.filter((a) => a.id !== id))
      } else {
        toast.error(res.message || 'تعذر حذف المنشور')
      }
    } catch {
      toast.error('حدث خطأ أثناء حذف المنشور')
    }
  }

  const handleOpenEdit = (article: ArticleItem) => {
    setEditingArticle(article)
    setIsDialogOpen(true)
  }

  const filteredArticles = useMemo(() => {
    return articles.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false
      }

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchTitle = item.title.toLowerCase().includes(query)
        const matchContent = item.content.toLowerCase().includes(query)
        const matchAuthor = item.author?.full_name?.toLowerCase().includes(query)
        return matchTitle || matchContent || matchAuthor
      }

      return true
    })
  }, [articles, selectedCategory, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-bg-surface border border-border-base rounded-lg p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[11px] font-medium border border-accent/20">
            <Sparkles className="w-3.5 h-3.5 text-accent" />
            <span>{badgeText || 'المركز الإعلامي والتربوي'}</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-ink-primary">
            {bannerTitle || 'الأخبار والمقالات'}
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted max-w-xl font-normal leading-relaxed">
            {bannerDescription ||
              'تابع آخر الأخبار الرسمية والمقالات الإثرائية والإعلانات والتوجيهات الصادرة من الإشراف التربوي.'}
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setEditingArticle(null)
              setIsDialogOpen(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-white font-medium text-xs sm:text-sm shadow-xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>نشر خبر أو مقال جديد</span>
          </button>
        )}
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-bg-surface rounded-lg border border-border-base p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بعنوان الخبر أو المقال أو الكاتب..."
              className="w-full pl-9 pr-9 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent transition-colors"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted/70 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink-primary rounded-md cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
          <span className="text-xs font-semibold text-ink-muted flex items-center gap-1 pl-1 shrink-0">
            <Filter className="w-3 h-3" /> التصنيف:
          </span>
          {CATEGORY_TABS.map((tab) => {
            const count =
              tab.key === 'all'
                ? articles.length
                : articles.filter((a) => a.category === tab.key).length

            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedCategory(tab.key)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === tab.key
                    ? 'bg-accent text-white shadow-xs'
                    : 'bg-bg-alt text-ink-secondary hover:bg-bg-alt/80 border border-border-subtle'
                }`}
              >
                {tab.label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Feed Grid */}
      {filteredArticles.length === 0 ? (
        <div className="bg-bg-surface rounded-lg border border-dashed border-border-base p-10 sm:p-14 text-center space-y-3">
          <div className="w-12 h-12 rounded-md bg-bg-alt text-ink-muted flex items-center justify-center mx-auto border border-border-subtle">
            <Inbox className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-serif text-lg font-bold text-ink-primary">
              {searchQuery || selectedCategory !== 'all'
                ? 'لا توجد منشورات مطابقة لبحثك'
                : 'لا توجد أي أخبار أو مقالات منشورة بعد'}
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              {searchQuery || selectedCategory !== 'all'
                ? 'جرب البحث بكلمات أخرى أو اختر تصنيفاً آخر.'
                : 'سيتم نشر الإعلانات والأخبار التربوية الهامة هنا فور اعتمادها.'}
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => {
                setEditingArticle(null)
                setIsDialogOpen(true)
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>نشر أول خبر أو مقال</span>
            </button>
          )}
        </div>
      ) : (
        <div className="border border-border-base rounded-lg bg-bg-surface overflow-hidden divide-y divide-border-subtle shadow-xs">
          {filteredArticles.map((article, idx) => (
            <ArticleCard
              key={article.id}
              article={article}
              isFeatured={idx === 0}
              variant={idx === 0 ? 'hero' : 'standard'}
              canManage={canManage}
              onEdit={handleOpenEdit}
              onDelete={handleDeleteArticle}
            />
          ))}
        </div>
      )}

      {/* Dialog for create / edit */}
      {canManage && (
        <ArticleDialog
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false)
            setEditingArticle(null)
          }}
          currentUserId={currentUserId}
          initialArticle={editingArticle}
          onArticleSaved={handleArticleSaved}
        />
      )}
    </div>
  )
}
