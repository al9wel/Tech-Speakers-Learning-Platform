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
    <div className="space-y-8 animate-page">
      {/* Banner */}
      <div className="bg-gradient-to-r from-ink-900 to-ink-800 rounded-3xl p-6 sm:p-8 text-white shadow-soft relative overflow-hidden">
        <div className="absolute top-0 -left-12 w-72 h-72 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-12 w-72 h-72 bg-sage/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gold-200 text-xs font-bold backdrop-blur-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              <span>خصوصية تامة وسرية معتمدة</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
              قسم المستشار النفسي والتربوي
            </h1>
            <p className="text-xs sm:text-sm text-ink-200 max-w-xl font-medium leading-relaxed">
              تواصل مباشرة مع المستشار النفسي والتربوي لمساعدتك في مواجهة أي قلق دراسي، ضغوط نفسية، أو تنظيم وقتك والتغلب على التحديات.
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedCounselorId(undefined)
              setIsNewModalOpen(true)
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gold hover:bg-gold-600 text-white font-bold text-sm shadow-md transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>طلب استشارة جديدة</span>
          </button>
        </div>
      </div>

      {/* Available Counselors Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-bold text-ink-900 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-gold" />
              <span>المستشارون المتاحون للإرشاد</span>
            </h2>
            <p className="text-xs text-ink-500">اختر المستشار المناسب وأرسل له رسالتك أو استفسارك مباشرة</p>
          </div>
        </div>

        {counselors.length === 0 ? (
          <div className="bg-white rounded-2xl border border-ink-100 p-6 text-center text-xs text-ink-400">
            لا يوجد مستشارون مسجلون حالياً في النظام.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {counselors.map((counselor) => (
              <div
                key={counselor.id}
                className="bg-white rounded-2xl border border-ink-100 p-5 shadow-2xs hover:shadow-soft transition-all duration-200 flex flex-col justify-between group"
              >
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gold/15 text-gold flex items-center justify-center font-bold text-base shadow-2xs shrink-0 group-hover:scale-105 transition-transform">
                    <User className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm text-ink-900 group-hover:text-gold transition-colors">
                      {counselor.full_name || 'مستشار تربوي ونفسي'}
                    </h3>
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>متاح للاستشارة</span>
                    </div>
                    <p className="text-[11px] text-ink-400 font-medium">
                      متخصص في التوجيه النفسي والتحصيل الدراسي
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-ink-100/70">
                  <button
                    onClick={() => handleOpenNewForCounselor(counselor.id)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-ink-50 hover:bg-ink-900 hover:text-white text-ink-700 text-xs font-bold transition-all cursor-pointer group-hover:bg-ink-900 group-hover:text-white"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-gold" />
                    <span>مراسلة هذا المستشار</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Consultations List & Filter Bar */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-bold text-ink-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-gold" />
              <span>استشاراتي ورسائلي السابقة</span>
            </h2>
            <p className="text-xs text-ink-500">تابع ردود المستشارين ورد عليهم في محادثاتك الخاصة</p>
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedStatus === tab.key
                      ? 'bg-ink-900 text-white shadow-2xs'
                      : 'bg-white border border-ink-100 text-ink-600 hover:bg-ink-50'
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
            className="w-full pl-9 pr-10 py-2.5 rounded-2xl border border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-gold shadow-2xs"
          />
          <Search className="w-4 h-4 text-ink-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Messages List */}
        {filteredMessages.length === 0 ? (
          <div className="bg-white rounded-3xl border border-ink-100 p-12 text-center space-y-3 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mx-auto shadow-inner">
              <Inbox className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-ink-900">
                {searchQuery || selectedStatus !== 'all'
                  ? 'لا توجد استشارات مطابقة لبحثك'
                  : 'لم ترسل أي استشارة نفسية بعد'}
              </h3>
              <p className="text-xs text-ink-500">
                {searchQuery || selectedStatus !== 'all'
                  ? 'جرب البحث بكلمات أخرى أو تغيير الفلتر.'
                  : 'اختر أحد المستشارين بالأعلى أو اضغط على طلب استشارة لبدء التواصل.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMessages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => {
                  setActiveMessage(msg)
                  setIsThreadOpen(true)
                }}
                className="bg-white rounded-3xl border border-ink-100 p-5 shadow-2xs hover:shadow-soft transition-all duration-200 flex flex-col justify-between group cursor-pointer"
              >
                <div className="space-y-3">
                  {/* Top Row: Counselor & Status */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-ink-900 block truncate">
                          {msg.counselor?.full_name || 'المستشار النفسي'}
                        </span>
                        <span className="text-[10px] text-ink-400 font-medium">
                          {formatDate(msg.created_at)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          msg.status === 'answered'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
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
                        className="p-1.5 text-ink-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="حذف الاستشارة"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Preview */}
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-ink-900 group-hover:text-gold transition-colors line-clamp-1">
                      {msg.title}
                    </h3>
                    <p className="text-xs text-ink-600 line-clamp-2 leading-relaxed">
                      {msg.content}
                    </p>
                  </div>

                  {/* Reply Snippet if exists */}
                  {(msg.response || (msg.replies && msg.replies.length > 0)) && (
                    <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-950 space-y-1">
                      <div className="flex items-center gap-1 font-bold text-emerald-800 text-[11px]">
                        <HeartHandshake className="w-3 h-3" />
                        <span>آخر رد من المستشار:</span>
                      </div>
                      <p className="line-clamp-2 text-ink-700">
                        {msg.replies && msg.replies.length > 0
                          ? msg.replies[msg.replies.length - 1].content
                          : msg.response}
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-ink-100/70 flex items-center justify-between text-xs text-gold font-bold">
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
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 border border-ink-100 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-ink-900">حذف الاستشارة</h4>
              <p className="text-xs text-ink-500">
                هل أنت متأكد من حذف هذه الاستشارة؟ سيتم إزالتها وكافة ردودها نهائياً.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-600 hover:bg-ink-100 cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={() => deletingId && handleDelete(deletingId)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
