'use client'

import { useState, useMemo } from 'react'
import {
  Search,
  BookOpen,
  Plus,
  Sparkles,
  Inbox,
  Filter,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import type { ContributionItem } from '../types'
import { deleteContributionAction } from '../server/actions'
import { ContributionCard } from './ContributionCard'
import { CreateContributionDialog } from './CreateContributionDialog'

interface SubjectOption {
  id: string
  name: string
}

interface StudentContributionsFeedProps {
  initialContributions: ContributionItem[]
  subjects: SubjectOption[]
  currentUserId: string
  currentUserName: string
  isSupervisorOrAdmin?: boolean
  showCreateButton?: boolean
  customTitle?: string
  customDescription?: string
  customBadge?: string
}

export function StudentContributionsFeed({
  initialContributions,
  subjects,
  currentUserId,
  currentUserName,
  isSupervisorOrAdmin = false,
  showCreateButton = true,
  customTitle,
  customDescription,
  customBadge,
}: StudentContributionsFeedProps) {
  const [contributions, setContributions] = useState<ContributionItem[]>(initialContributions)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleContributionCreated = (newContribution: ContributionItem) => {
    setContributions((prev) => [newContribution, ...prev])
  }

  const handleDeleteContribution = async (id: string) => {
    try {
      const res = await deleteContributionAction(id)
      if (res.success) {
        toast.success(res.message || 'تم حذف المساهمة بنجاح')
        setContributions((prev) => prev.filter((c) => c.id !== id))
      } else {
        toast.error(res.message || 'تعذر حذف المساهمة')
      }
    } catch {
      toast.error('حدث خطأ أثناء حذف المساهمة')
    }
  }

  const filteredContributions = useMemo(() => {
    return contributions.filter((item) => {
      // Filter by subject
      if (selectedSubjectId !== 'all' && item.subject_id !== selectedSubjectId) {
        return false
      }

      // Filter by search query (title or content or author)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchTitle = item.title.toLowerCase().includes(query)
        const matchContent = item.content.toLowerCase().includes(query)
        const matchAuthor = item.student?.full_name?.toLowerCase().includes(query)
        return matchTitle || matchContent || matchAuthor
      }

      return true
    })
  }, [contributions, selectedSubjectId, searchQuery])

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-ink-900 to-ink-800 rounded-3xl p-6 sm:p-8 text-white shadow-soft relative overflow-hidden">
        <div className="absolute top-0 -left-12 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gold-200 text-xs font-bold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>{customBadge || 'مساحة الإبداع والمشاركة'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {customTitle || 'مساهمات الطلاب'}
            </h1>
            <p className="text-xs sm:text-sm text-ink-200 max-w-xl font-medium">
              {customDescription ||
                'تصفح إبداعات وملخصات ومشاريع زملائك الطلاب عبر مختلف المواد، وشارك إنجازاتك الخاصة لتفيد الجميع.'}
            </p>
          </div>

          {showCreateButton && (
            <button
              onClick={() => setIsDialogOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gold hover:bg-gold-600 text-white font-bold text-sm shadow-md transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>نشر مساهمة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-ink-100 p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم المساهمة أو الموضوع أو اسم الطالب..."
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

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs font-bold text-ink-400 flex items-center gap-1 pl-1 shrink-0">
            <Filter className="w-3 h-3" /> المادة:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSubjectId('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              selectedSubjectId === 'all'
                ? 'bg-ink-900 text-white shadow-2xs'
                : 'bg-parchment/60 text-ink-600 hover:bg-ink-100 border border-ink-200/50'
            }`}
          >
            جميع المواد ({contributions.length})
          </button>
          {subjects.map((s) => {
            const count = contributions.filter((c) => c.subject_id === s.id).length
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSubjectId(s.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedSubjectId === s.id
                    ? 'bg-ink-900 text-white shadow-2xs'
                    : 'bg-parchment/60 text-ink-600 hover:bg-ink-100 border border-ink-200/50'
                }`}
              >
                {s.name} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Contributions Feed / Grid */}
      {filteredContributions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-ink-100 p-12 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mx-auto shadow-inner">
            <Inbox className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-ink-900">
              {searchQuery || selectedSubjectId !== 'all'
                ? 'لا توجد مساهمات مطابقة للبحث'
                : 'لا توجد أي مساهمات حتى الآن'}
            </h3>
            <p className="text-xs sm:text-sm text-ink-500 font-medium">
              {searchQuery || selectedSubjectId !== 'all'
                ? 'جرب البحث بكلمات أخرى أو اختر مادة دراسية مختلفة.'
                : 'كن أول من يشارك ملخصاً أو حلاً مميزاً مع زملائك الطلاب!'}
            </p>
          </div>
          {showCreateButton && (
            <button
              onClick={() => setIsDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-900 hover:bg-ink-800 text-white font-bold text-xs shadow-soft transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-gold" />
              <span>نشر أول مساهمة</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filteredContributions.map((contribution) => (
            <ContributionCard
              key={contribution.id}
              contribution={contribution}
              currentUserId={currentUserId}
              isSupervisorOrAdmin={isSupervisorOrAdmin}
              onDelete={handleDeleteContribution}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <CreateContributionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        subjects={subjects}
        currentUserId={currentUserId}
        onContributionCreated={handleContributionCreated}
      />
    </div>
  )
}
