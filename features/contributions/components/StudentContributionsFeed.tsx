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
  Clock,
  CheckCircle2,
  User,
  Globe,
} from 'lucide-react'
import { toast } from 'sonner'
import type { ContributionItem } from '../types'
import { deleteContributionAction, approveContributionAction } from '../server/actions'
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
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [viewScope, setViewScope] = useState<'all' | 'mine'>('all')
  const [myStatusFilter, setMyStatusFilter] = useState<'all' | 'pending' | 'approved'>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Platform approved count
  const approvedPlatformCount = useMemo(
    () => contributions.filter((c) => c.status === 'approved').length,
    [contributions]
  )

  // Supervisor stats
  const pendingCount = useMemo(
    () => contributions.filter((c) => c.status === 'pending').length,
    [contributions]
  )
  const approvedCount = useMemo(
    () => contributions.filter((c) => c.status === 'approved').length,
    [contributions]
  )

  // Student's own contributions stats
  const myContributions = useMemo(
    () => contributions.filter((c) => c.student_id === currentUserId),
    [contributions, currentUserId]
  )
  const myTotalCount = myContributions.length
  const myPendingCount = useMemo(
    () => myContributions.filter((c) => c.status === 'pending').length,
    [myContributions]
  )
  const myApprovedCount = useMemo(
    () => myContributions.filter((c) => c.status === 'approved').length,
    [myContributions]
  )

  const handleContributionCreated = (newContribution: ContributionItem) => {
    setContributions((prev) => [newContribution, ...prev])
    if (!isSupervisorOrAdmin) {
      setViewScope('mine')
      setMyStatusFilter('all')
    }
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

  const handleApproveContribution = async (id: string) => {
    try {
      const res = await approveContributionAction(id)
      if (res.success) {
        toast.success(res.message || 'تم اعتماد ونشر المساهمة بنجاح!')
        setContributions((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: 'approved' } : c))
        )
      } else {
        toast.error(res.message || 'تعذر اعتماد المساهمة')
      }
    } catch {
      toast.error('حدث خطأ أثناء اعتماد المساهمة')
    }
  }

  const filteredContributions = useMemo(() => {
    return contributions.filter((item) => {
      // Filter by scope for student
      if (!isSupervisorOrAdmin) {
        if (viewScope === 'mine') {
          if (item.student_id !== currentUserId) return false
          if (myStatusFilter === 'pending' && item.status !== 'pending') return false
          if (myStatusFilter === 'approved' && item.status !== 'approved') return false
        } else {
          // In the public platform feed, only show approved contributions
          if (item.status !== 'approved') return false
        }
      }

      // Filter by status if supervisor or admin
      if (isSupervisorOrAdmin && statusFilter !== 'all') {
        if (statusFilter === 'pending' && item.status !== 'pending') return false
        if (statusFilter === 'approved' && item.status !== 'approved') return false
      }

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
  }, [
    contributions,
    selectedSubjectId,
    searchQuery,
    statusFilter,
    isSupervisorOrAdmin,
    viewScope,
    myStatusFilter,
    currentUserId,
  ])

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="bg-linear-to-br from-white via-cream/60 to-gold/10 rounded-3xl p-6 sm:p-8 text-ink-900 border border-gold/30 shadow-card relative overflow-hidden">
        <div className="absolute top-0 -left-12 w-64 h-64 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-sage/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold-dark text-xs font-bold border border-gold/30">
              <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
              <span>{customBadge || 'مساحة الإبداع والمشاركة'}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-ink-900">
              {customTitle || 'مساهمات الطلاب'}
            </h1>
            <p className="text-xs sm:text-sm text-ink-600 max-w-xl font-medium leading-relaxed">
              {customDescription ||
                'تصفح إبداعات وملخصات ومشاريع زملائك الطلاب عبر مختلف المواد، وشارك إنجازاتك الخاصة لتفيد الجميع.'}
            </p>
          </div>

          {showCreateButton && (
            <button
              onClick={() => setIsDialogOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gold hover:bg-gold-dark text-white font-bold text-sm shadow-md hover:shadow-lg transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>نشر مساهمة جديدة</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Tabs for Student: [جميع مساهمات المنصة | مساهماتي] */}
      {!isSupervisorOrAdmin && (
        <div className="bg-white rounded-2xl border border-ink-100 p-2 sm:p-2.5 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setViewScope('all')
                setMyStatusFilter('all')
              }}
              className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                viewScope === 'all'
                  ? 'bg-ink-900 text-white shadow-soft'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-ink-50'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>جميع مساهمات المنصة</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  viewScope === 'all' ? 'bg-white/20 text-white' : 'bg-ink-100 text-ink-600'
                }`}
              >
                {approvedPlatformCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setViewScope('mine')}
              className={`flex-1 sm:flex-initial px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                viewScope === 'mine'
                  ? 'bg-gold-dark text-white shadow-soft'
                  : 'text-ink-600 hover:text-ink-900 hover:bg-gold/10'
              }`}
            >
              <User className="w-4 h-4" />
              <span>مساهماتي</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  viewScope === 'mine' ? 'bg-white text-gold-dark' : 'bg-gold/15 text-gold-dark'
                }`}
              >
                {myTotalCount}
              </span>
            </button>
          </div>

          {/* Sub-pills for My Contributions status: [الكل | المعتمدة | قيد المراجعة] */}
          {viewScope === 'mine' && (
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-parchment/60 rounded-xl border border-ink-100/60">
              <button
                type="button"
                onClick={() => setMyStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  myStatusFilter === 'all'
                    ? 'bg-ink-900 text-white shadow-2xs'
                    : 'text-ink-600 hover:text-ink-900'
                }`}
              >
                الكل ({myTotalCount})
              </button>
              <button
                type="button"
                onClick={() => setMyStatusFilter('approved')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  myStatusFilter === 'approved'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-emerald-700 hover:bg-emerald-100/60'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>المعتمدة والمقبولة ({myApprovedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setMyStatusFilter('pending')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  myStatusFilter === 'pending'
                    ? 'bg-amber-600 text-white shadow-2xs'
                    : 'text-amber-800 hover:bg-amber-100/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>قيد المراجعة ({myPendingCount})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Helpful banner for pending contributions in "مساهماتي" */}
      {!isSupervisorOrAdmin && viewScope === 'mine' && myPendingCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90 flex items-center gap-3.5 text-amber-900 shadow-2xs">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 border border-amber-300/60">
            <Clock className="w-4.5 h-4.5 text-amber-600 animate-pulse" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <span className="font-bold block sm:inline">
              لديك {myPendingCount} {myPendingCount === 1 ? 'مساهمة' : 'مساهمات'} بانتظار اعتماد المشرف التربوي:
            </span>
            <span className="text-amber-800/90 sm:mr-1 font-medium block sm:inline mt-0.5 sm:mt-0">
              تظهر لك هنا بحالة «قيد المراجعة» وتُنشر تلقائياً لجميع زملائك في المنصة فور موافقة المشرف عليها.
            </span>
          </div>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-ink-100 p-3.5 sm:p-4 shadow-2xs space-y-3.5">

        {/* Supervisor Status Filter Pills */}
        {isSupervisorOrAdmin && (
          <div className="flex items-center gap-2 pb-3 border-b border-ink-100/70 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-ink-400 pl-1 shrink-0">حالة النشر:</span>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-ink-900 text-white shadow-2xs'
                  : 'bg-parchment/60 text-ink-600 hover:bg-ink-100 border border-ink-200/50'
              }`}
            >
              جميع المساهمات ({contributions.length})
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'pending'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>بانتظار موافقة المشرف</span>
              {pendingCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[11px] font-black ${
                    statusFilter === 'pending'
                      ? 'bg-white text-amber-700'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStatusFilter('approved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'approved'
                  ? 'bg-emerald-700 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>المعتمدة ({approvedCount})</span>
            </button>
          </div>
        )}

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
            جميع المواد
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
              {viewScope === 'mine'
                ? myTotalCount === 0
                  ? 'لم تقم بنشر أي مساهمة بعد'
                  : myStatusFilter === 'pending'
                  ? 'لا توجد مساهمات قيد المراجعة حالياً'
                  : myStatusFilter === 'approved'
                  ? 'لا توجد مساهمات معتمدة لك حتى الآن'
                  : 'لا توجد مساهمات مطابقة'
                : searchQuery || selectedSubjectId !== 'all' || (isSupervisorOrAdmin && statusFilter !== 'all')
                ? 'لا توجد مساهمات مطابقة للبحث أو التصفية'
                : 'لا توجد أي مساهمات حتى الآن'}
            </h3>
            <p className="text-xs sm:text-sm text-ink-500 font-medium">
              {viewScope === 'mine'
                ? myTotalCount === 0
                  ? 'شارك زملاءك ملخصاً، مشروعاً، أو حلاً متميزاً وسيقوم المشرف بمراجعته واعتماده ليظهر للجميع!'
                  : myStatusFilter === 'pending'
                  ? 'رائع! لا توجد لديك أي مساهمات معلقة بانتظار المشرف. جميع مساهماتك معتمدة ومنشورة بنجاح.'
                  : myStatusFilter === 'approved'
                  ? 'المساهمات التي تقوم بنشرها تخضع لمراجعة المشرف وستظهر هنا بمجرد الموافقة عليها.'
                  : 'جرب اختيار خيار تصفية آخر أو اختيار "الكل" لعرض كافة مساهماتك.'
                : searchQuery || selectedSubjectId !== 'all' || (isSupervisorOrAdmin && statusFilter !== 'all')
                ? 'جرب تغيير خيارات التصفية أو البحث بكلمات أخرى.'
                : 'كن أول من يشارك ملخصاً أو حلاً مميزاً مع زملائك الطلاب!'}
            </p>
          </div>
          {showCreateButton && (
            <button
              onClick={() => setIsDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-900 hover:bg-ink-800 text-white font-bold text-xs shadow-soft transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-gold" />
              <span>{viewScope === 'mine' ? 'نشر أول مساهمة لي' : 'نشر أول مساهمة'}</span>
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
              onApprove={handleApproveContribution}
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
