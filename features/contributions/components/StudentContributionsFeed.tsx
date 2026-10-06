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
    <div className="space-y-5">
      {/* Header Panel */}
      <div className="border border-border-base rounded-lg p-5 sm:p-6 bg-bg-surface flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="chip text-[11px] font-semibold text-accent border-accent/20 bg-accent-bg">
              <Sparkles className="w-3 h-3 text-accent inline ml-1" />
              {customBadge || 'مساحة الإبداع والمشاركة'}
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-primary">
            {customTitle || 'مساهمات الطلاب'}
          </h1>
          <p className="text-xs sm:text-sm text-ink-secondary max-w-xl mt-1 leading-relaxed">
            {customDescription ||
              'تصفح إبداعات وملخصات ومشاريع زملائك الطلاب عبر مختلف المواد، وشارك إنجازاتك الخاصة لتفيد الجميع.'}
          </p>
        </div>

        {showCreateButton && (
          <button
            onClick={() => setIsDialogOpen(true)}
            className="btn-primary text-xs sm:text-sm py-2 px-3.5 flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>نشر مساهمة جديدة</span>
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="border border-border-base rounded-lg p-3.5 sm:p-4 bg-bg-surface space-y-3">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المساهمة أو الموضوع أو اسم الطالب..."
            className="w-full pl-8 pr-9 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 p-1 text-ink-muted hover:text-ink-primary"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs font-medium text-ink-muted flex items-center gap-1 pl-1 shrink-0">
            <Filter className="w-3 h-3" /> المادة:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSubjectId('all')}
            className={`chip text-xs transition cursor-pointer whitespace-nowrap shrink-0 ${
              selectedSubjectId === 'all'
                ? 'bg-accent text-white border-accent'
                : 'hover:bg-bg-alt/80'
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
                className={`chip text-xs transition cursor-pointer whitespace-nowrap shrink-0 ${
                  selectedSubjectId === s.id
                    ? 'bg-accent text-white border-accent'
                    : 'hover:bg-bg-alt/80'
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
        <div className="border border-dashed border-border-base rounded-lg p-10 text-center bg-bg-surface space-y-3">
          <div className="w-10 h-10 rounded-md bg-bg-alt text-ink-muted border border-border-subtle flex items-center justify-center mx-auto">
            <Inbox className="w-5 h-5 stroke-[1.6]" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-serif font-bold text-base sm:text-lg text-ink-primary">
              {searchQuery || selectedSubjectId !== 'all'
                ? 'لا توجد مساهمات مطابقة للبحث'
                : 'لا توجد أي مساهمات حتى الآن'}
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              {searchQuery || selectedSubjectId !== 'all'
                ? 'جرب البحث بكلمات أخرى أو اختر مادة دراسية مختلفة.'
                : 'كن أول من يشارك ملخصاً أو حلاً مميزاً مع زملائك الطلاب!'}
            </p>
          </div>
          {showCreateButton && (
            <button
              onClick={() => setIsDialogOpen(true)}
              className="btn-primary text-xs py-1.5 px-3 mx-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>نشر أول مساهمة</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
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
