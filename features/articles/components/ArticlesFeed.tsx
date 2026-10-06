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

function getArticleLayout(index: number, total: number): {
  colSpanClass: string
  variant: 'hero' | 'wide' | 'compact' | 'standard'
  isFeatured: boolean
} {
  // If only 1 article total, full width hero
  if (total === 1) {
    return {
      colSpanClass: 'col-span-1 md:col-span-2 lg:col-span-4',
      variant: 'hero',
      isFeatured: true,
    }
  }

  // Row 1: First article always takes full row width (100%)
  if (index === 0) {
    return {
      colSpanClass: 'col-span-1 md:col-span-2 lg:col-span-4',
      variant: 'hero',
      isFeatured: true,
    }
  }

  // If exactly 2 articles, 2nd is also full width
  if (total === 2 && index === 1) {
    return {
      colSpanClass: 'col-span-1 md:col-span-2 lg:col-span-4',
      variant: 'wide',
      isFeatured: false,
    }
  }

  // Creative rhythmic pattern for remaining articles (cycles of 6):
  // 0: Row 2 - 3/4 (75%)
  // 1: Row 2 - 1/4 (25%)
  // 2: Row 3 - 2/4 (50%)
  // 3: Row 3 - 2/4 (50%)
  // 4: Row 4 - 1/4 (25% flipped)
  // 5: Row 4 - 3/4 (75% flipped)
  const cycleIndex = (index - 1) % 6

  switch (cycleIndex) {
    case 0:
      return {
        colSpanClass: 'col-span-1 md:col-span-2 lg:col-span-3',
        variant: 'wide',
        isFeatured: false,
      }
    case 1:
      return {
        colSpanClass: 'col-span-1 md:col-span-2 lg:col-span-1',
        variant: 'compact',
        isFeatured: false,
      }
    case 2:
      return {
        colSpanClass: 'col-span-1 md:col-span-1 lg:col-span-2',
        variant: 'standard',
        isFeatured: false,
      }
    case 3:
      return {
        colSpanClass: 'col-span-1 md:col-span-1 lg:col-span-2',
        variant: 'standard',
        isFeatured: false,
      }
    case 4:
      return {
        colSpanClass: 'col-span-1 md:col-span-2 lg:col-span-1',
        variant: 'compact',
        isFeatured: false,
      }
    case 5:
      return {
        colSpanClass: 'col-span-1 md:col-span-2 lg:col-span-3',
        variant: 'wide',
        isFeatured: false,
      }
    default:
      return {
        colSpanClass: 'col-span-1 md:col-span-1 lg:col-span-2',
        variant: 'standard',
        isFeatured: false,
      }
  }
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
      {/* Banner */}
      <div className="bg-gradient-to-r from-ink-900 to-ink-800 rounded-3xl p-6 sm:p-8 text-white shadow-soft relative overflow-hidden">
        <div className="absolute top-0 -left-12 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gold-200 text-xs font-bold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>{badgeText || 'المركز الإعلامي والتربوي'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {bannerTitle || 'الأخبار والمقالات'}
            </h1>
            <p className="text-xs sm:text-sm text-ink-200 max-w-xl font-medium">
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
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gold hover:bg-gold-600 text-white font-bold text-sm shadow-md transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>نشر خبر أو مقال جديد</span>
            </button>
          )}
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white rounded-2xl border border-ink-100 p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بعنوان الخبر أو المقال أو الكاتب..."
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-ink-200 bg-ink-50/30 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-gold focus:bg-white transition-all"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-ink-400 hover:text-ink-700 rounded-md cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs font-bold text-ink-400 flex items-center gap-1 pl-1 shrink-0">
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
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === tab.key
                    ? 'bg-ink-900 text-white shadow-2xs'
                    : 'bg-parchment/60 text-ink-600 hover:bg-ink-100 border border-ink-200/50'
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
        <div className="bg-white rounded-3xl border border-ink-100 p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mx-auto shadow-inner">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-ink-900">
              {searchQuery || selectedCategory !== 'all'
                ? 'لا توجد منشورات مطابقة لبحثك'
                : 'لا توجد أي أخبار أو مقالات منشورة بعد'}
            </h3>
            <p className="text-xs sm:text-sm text-ink-500 font-medium">
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
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-900 hover:bg-ink-800 text-white font-bold text-xs shadow-soft transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-gold" />
              <span>نشر أول خبر أو مقال</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {filteredArticles.map((article, idx) => {
            const layout = getArticleLayout(idx, filteredArticles.length)
            return (
              <div key={article.id} className={layout.colSpanClass}>
                <ArticleCard
                  article={article}
                  variant={layout.variant}
                  isFeatured={layout.isFeatured}
                  canManage={canManage}
                  onEdit={handleOpenEdit}
                  onDelete={handleDeleteArticle}
                />
              </div>
            )
          })}
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
