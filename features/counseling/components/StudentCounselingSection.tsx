'use client'

import { useState, useMemo } from 'react'
import {
  HeartHandshake,
  User,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock3,
  Calendar,
  MessageSquare,
  Sparkles,
  Inbox,
  ShieldCheck,
  ChevronLeft,
  Trash2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { CounselingMessageItem, CounselingProfile, CounselingReplyItem } from '../types'
import { deleteCounselingMessageAction } from '../server/actions'
import { NewConsultationModal } from './NewConsultationModal'
import { ConsultationThreadModal } from './ConsultationThreadModal'

interface StudentCounselingSectionProps {
  initialMessages: CounselingMessageItem[]
  counselors: CounselingProfile[]
  currentUserId: string
}

export function StudentCounselingSection({
  initialMessages,
  counselors,
  currentUserId,
}: StudentCounselingSectionProps) {
  const [messages, setMessages] = useState<CounselingMessageItem[]>(initialMessages)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [selectedCounselorId, setSelectedCounselorId] = useState<string | undefined>()

  const [activeMessage, setActiveMessage] = useState<CounselingMessageItem | null>(null)
  const [isThreadOpen, setIsThreadOpen] = useState(false)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleOpenNewForCounselor = (counselorId: string) => {
    setSelectedCounselorId(counselorId)
    setIsNewModalOpen(true)
  }

  const handleCreated = (newItem: CounselingMessageItem) => {
    setMessages((prev) => [newItem, ...prev])
  }

  const handleReplyAdded = (messageId: string, reply: CounselingReplyItem) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === messageId) {
          const currentReplies = msg.replies || []
          return {
            ...msg,
            status: 'answered',
            updated_at: new Date().toISOString(),
            replies: [...currentReplies, reply],
          }
        }
        return msg
      })
    )

    if (activeMessage && activeMessage.id === messageId) {
      setActiveMessage((prev) => {
        if (!prev) return null
        const currentReplies = prev.replies || []
        return {
          ...prev,
          status: 'answered',
          updated_at: new Date().toISOString(),
          replies: [...currentReplies, reply],
        }
      })
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    try {
      const res = await deleteCounselingMessageAction(id)
      if (res.success) {
        toast.success(res.message || 'تم حذف الاستشارة بنجاح')
        setMessages((prev) => prev.filter((m) => m.id !== id))
        setDeletingId(null)
      } else {
        toast.error(res.message || 'تعذر حذف الاستشارة')
      }
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      if (selectedStatus !== 'all' && msg.status !== selectedStatus) {
        return false
      }
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchTitle = msg.title.toLowerCase().includes(query)
        const matchContent = msg.content.toLowerCase().includes(query)
        const matchCounselor = (msg.counselor?.full_name || '').toLowerCase().includes(query)
        return matchTitle || matchContent || matchCounselor
      }
      return true
    })
  }, [messages, selectedStatus, searchQuery])

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-bg-surface border border-border-base rounded-lg p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[11px] font-medium border border-accent/20">
            <ShieldCheck className="w-3.5 h-3.5 text-accent" />
            <span>خصوصية تامة وسرية معتمدة</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-ink-primary">
            قسم المستشار النفسي والتربوي
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted max-w-xl font-normal leading-relaxed">
            تواصل مباشرة مع المستشار النفسي والتربوي لمساعدتك في مواجهة أي قلق دراسي، ضغوط نفسية، أو تنظيم وقتك والتغلب على التحديات.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCounselorId(undefined)
            setIsNewModalOpen(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-white font-medium text-xs sm:text-sm shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>طلب استشارة جديدة</span>
        </button>
      </div>

      {/* Available Counselors Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-ink-primary flex items-center gap-2">
              <HeartHandshake className="w-4.5 h-4.5 text-accent" />
              <span>المستشارون المتاحون للإرشاد</span>
            </h2>
            <p className="text-xs text-ink-muted">اختر المستشار المناسب وأرسل له رسالتك أو استفسارك مباشرة</p>
          </div>
        </div>

        {counselors.length === 0 ? (
          <div className="bg-bg-surface rounded-lg border border-border-base p-6 text-center text-xs text-ink-muted">
            لا يوجد مستشارون مسجلون حالياً في النظام.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {counselors.map((counselor) => (
              <div
                key={counselor.id}
                className="bg-bg-surface rounded-lg border border-border-base p-4.5 hover:border-accent/40 transition-colors flex flex-col justify-between group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-md bg-bg-alt text-ink-secondary border border-border-subtle flex items-center justify-center font-bold text-sm shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif font-bold text-sm text-ink-primary group-hover:text-accent transition-colors">
                      {counselor.full_name || 'مستشار تربوي ونفسي'}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-medium border border-emerald-200/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                      <span>متاح للاستشارة</span>
                    </div>
                    <p className="text-[11px] text-ink-muted font-normal">
                      متخصص في التوجيه النفسي والتحصيل الدراسي
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle">
                  <button
                    onClick={() => handleOpenNewForCounselor(counselor.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-bg-alt hover:bg-accent hover:text-white text-ink-secondary text-xs font-medium border border-border-subtle transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>مراسلة هذا المستشار</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Consultations List & Filter Bar */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg font-bold text-ink-primary flex items-center gap-2">
              <MessageSquare className="w-4.5 h-4.5 text-accent" />
              <span>استشاراتي ورسائلي السابقة</span>
            </h2>
            <p className="text-xs text-ink-muted">تابع ردود المستشارين ورد عليهم في محادثاتك الخاصة</p>
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { key: 'all', label: 'الكل' },
              { key: 'pending', label: 'قيد المراجعة' },
              { key: 'answered', label: 'تم الرد' },
            ].map((tab) => {
              const count =
                tab.key === 'all'
                  ? messages.length
                  : messages.filter((m) => m.status === tab.key).length
              return (
                <button
                  key={tab.key}
                  onClick={() => setSelectedStatus(tab.key)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    selectedStatus === tab.key
                      ? 'bg-accent text-white shadow-xs'
                      : 'bg-bg-surface border border-border-base text-ink-secondary hover:bg-bg-alt'
                  }`}
                >
                  {tab.label} ({count})
                </button>
              )
            })}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بعنوان الاستشارة أو اسم المستشار..."
            className="w-full pl-9 pr-9 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent transition-colors"
          />
          <Search className="w-4 h-4 text-ink-muted/70 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Messages List */}
        {filteredMessages.length === 0 ? (
          <div className="bg-bg-surface rounded-lg border border-dashed border-border-base p-10 sm:p-14 text-center space-y-3">
            <div className="w-12 h-12 rounded-md bg-bg-alt text-ink-muted flex items-center justify-center mx-auto border border-border-subtle">
              <Inbox className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="font-serif text-base font-bold text-ink-primary">
                {searchQuery || selectedStatus !== 'all'
                  ? 'لا توجد استشارات مطابقة لبحثك'
                  : 'لم ترسل أي استشارة نفسية بعد'}
              </h3>
              <p className="text-xs text-ink-muted leading-relaxed">
                {searchQuery || selectedStatus !== 'all'
                  ? 'جرب البحث بكلمات أخرى أو تغيير الفلتر.'
                  : 'اختر أحد المستشارين بالأعلى أو اضغط على طلب استشارة لبدء التواصل.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  setActiveMessage(msg)
                  setIsThreadOpen(true)
                }}
                className="bg-bg-surface rounded-lg border border-border-base p-5 hover:border-accent/40 transition-colors flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-3">
                  {/* Top Row: Counselor & Status */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-md bg-bg-alt text-ink-secondary border border-border-subtle flex items-center justify-center font-bold text-xs shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-serif font-bold text-xs text-ink-primary block truncate">
                          {msg.counselor?.full_name || 'المستشار النفسي'}
                        </span>
                        <span className="text-[10px] text-ink-muted font-normal">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          msg.status === 'answered'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                            : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                        }`}
                      >
                        {msg.status === 'answered' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>تم الرد</span>
                          </>
                        ) : (
                          <>
                            <Clock3 className="w-3 h-3 text-amber-600" />
                            <span>قيد المراجعة</span>
                          </>
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          setDeletingId(msg.id)
                        }}
                        className="p-1 text-ink-muted hover:text-red-700 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                        title="حذف الاستشارة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Preview */}
                  <div className="space-y-1">
                    <h3 className="font-serif text-sm font-bold text-ink-primary group-hover:text-accent transition-colors line-clamp-1">
                      {msg.title}
                    </h3>
                    <p className="text-xs text-ink-secondary line-clamp-2 leading-relaxed">
                      {msg.content}
                    </p>
                  </div>

                  {/* Reply Snippet if exists */}
                  {(msg.response || (msg.replies && msg.replies.length > 0)) && (
                    <div className="p-3 rounded-md bg-bg-alt/70 border border-border-subtle text-xs text-ink-primary space-y-1">
                      <div className="flex items-center gap-1 font-semibold text-accent text-[11px]">
                        <HeartHandshake className="w-3 h-3" />
                        <span>آخر رد من المستشار:</span>
                      </div>
                      <p className="line-clamp-2 text-ink-secondary">
                        {msg.replies && msg.replies.length > 0
                          ? msg.replies[msg.replies.length - 1].content
                          : msg.response}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-accent font-medium">
                  <span>فتح المحادثة والمتابعة</span>
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Consultation Modal */}
      <NewConsultationModal
        isOpen={isNewModalOpen}
        onClose={() => {
          setIsNewModalOpen(false)
          setSelectedCounselorId(undefined)
        }}
        onSuccess={handleCreated}
        mode="student"
        counselors={counselors}
        initialCounselorId={selectedCounselorId}
      />

      {/* Consultation Thread Modal */}
      <ConsultationThreadModal
        isOpen={isThreadOpen}
        onClose={() => {
          setIsThreadOpen(false)
          setActiveMessage(null)
        }}
        item={activeMessage}
        currentUserId={currentUserId}
        currentUserRole="student"
        onReplyAdded={handleReplyAdded}
      />

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-ink-primary/40 backdrop-blur-xs">
          <div className="bg-bg-surface rounded-lg max-w-sm w-full p-5 text-center space-y-4 border border-border-base shadow-xl">
            <div className="w-10 h-10 rounded-md bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-ink-primary text-base">حذف الاستشارة</h4>
              <p className="text-xs text-ink-muted">
                هل أنت متأكد من حذف هذه الاستشارة؟ سيتم إزالتها وكافة ردودها نهائياً.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium text-ink-secondary hover:bg-bg-alt border border-border-base transition-colors cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={() => deletingId && handleDelete(deletingId)}
                disabled={isDeleting}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>جارٍ الحذف...</span>
                  </>
                ) : (
                  <span>نعم، حذف</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
