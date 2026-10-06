'use client'

import { useState, useMemo } from 'react'
import {
  HeartHandshake,
  User,
  Plus,
  Search,
  CheckCircle2,
  Clock3,
  Calendar,
  MessageSquare,
  Inbox,
  ChevronLeft,
  Trash2,
  AlertCircle,
  Loader2,
  Users,
} from 'lucide-react'
import { toast } from 'sonner'
import type { CounselingMessageItem, CounselingProfile, CounselingReplyItem } from '../types'
import { deleteCounselingMessageAction } from '../server/actions'
import { NewConsultationModal } from './NewConsultationModal'
import { ConsultationThreadModal } from './ConsultationThreadModal'

interface CounselorCommunicationsManagerProps {
  initialMessages: CounselingMessageItem[]
  allStudents: CounselingProfile[]
  currentUserId: string
}

export function CounselorCommunicationsManager({
  initialMessages,
  allStudents,
  currentUserId,
}: CounselorCommunicationsManagerProps) {
  const [messages, setMessages] = useState<CounselingMessageItem[]>(initialMessages)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [activeMessage, setActiveMessage] = useState<CounselingMessageItem | null>(null)
  const [isThreadOpen, setIsThreadOpen] = useState(false)

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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
            response: reply.content,
            response_at: reply.created_at,
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
          response: reply.content,
          response_at: reply.created_at,
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

  const pendingCount = useMemo(
    () => messages.filter((m) => m.status === 'pending').length,
    [messages]
  )
  const answeredCount = useMemo(
    () => messages.filter((m) => m.status === 'answered').length,
    [messages]
  )

  const filteredMessages = useMemo(() => {
    return messages.filter((msg) => {
      if (selectedStatus !== 'all' && msg.status !== selectedStatus) {
        return false
      }
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchTitle = msg.title.toLowerCase().includes(query)
        const matchContent = msg.content.toLowerCase().includes(query)
        const matchStudent = (msg.student?.full_name || '').toLowerCase().includes(query)
        return matchTitle || matchContent || matchStudent
      }
      return true
    })
  }, [messages, selectedStatus, searchQuery])

  return (
    <div className="space-y-8 animate-page">
      {/* Banner */}
      <div className="bg-gradient-to-r from-ink-900 to-ink-800 rounded-3xl p-6 sm:p-8 text-white shadow-soft relative overflow-hidden">
        <div className="absolute top-0 -left-12 w-72 h-72 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 -right-12 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gold-200 text-xs font-bold backdrop-blur-xs">
              <HeartHandshake className="w-3.5 h-3.5 text-gold" />
              <span>لوحة الإرشاد والتوجيه الطلابي</span>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white">
              مركز التواصل والاستشارات الطلابية
            </h1>
            <p className="text-xs sm:text-sm text-ink-200 max-w-xl font-medium leading-relaxed">
              استقبال استشارات الطلاب والرد عليها لتقديم الدعم النفسي والتربوي، أو البحث عن أي طالب ومراسلته مباشرة لمتابعته.
            </p>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gold hover:bg-gold-600 text-white font-bold text-sm shadow-md transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>مراسلة طالب جديد</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-ink-100 p-5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs font-bold text-ink-400">
            <span>إجمالي الاستشارات</span>
            <MessageSquare className="w-4 h-4 text-ink-400" />
          </div>
          <div className="text-2xl font-black text-ink-900">{messages.length}</div>
          <p className="text-[11px] text-ink-400">كافة الرسائل والمحادثات المتبادلة</p>
        </div>

        <div className="bg-white rounded-2xl border border-amber-100 p-5 shadow-2xs space-y-1 bg-amber-50/20">
          <div className="flex items-center justify-between text-xs font-bold text-amber-700">
            <span>بانتظار الرد</span>
            <Clock3 className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-950">{pendingCount}</div>
          <p className="text-[11px] text-amber-700">استشارات تحتاج إلى توجيه وإجابة منك</p>
        </div>

        <div className="bg-white rounded-2xl border border-emerald-100 p-5 shadow-2xs space-y-1 bg-emerald-50/20">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
            <span>تم الرد عليها</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-950">{answeredCount}</div>
          <p className="text-[11px] text-emerald-700">استشارات تم تقديم المشورة فيها</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h2 className="text-lg sm:text-xl font-bold text-ink-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-gold" />
              <span>رسائل واستشارات الطلاب</span>
            </h2>
            <p className="text-xs text-ink-500">انقر على أي استشارة لعرض تفاصيلها وكتابة ردك المباشر</p>
          </div>

          {/* Status Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { key: 'all', label: 'الكل' },
              { key: 'pending', label: 'بانتظار الرد' },
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
            placeholder="ابحث باسم الطالب أو عنوان الاستشارة أو محتواها..."
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
                  ? 'لا توجد استشارات مطابقة للبحث'
                  : 'لا توجد أي استشارات طلابية واردة بعد'}
              </h3>
              <p className="text-xs text-ink-500">
                {searchQuery || selectedStatus !== 'all'
                  ? 'جرب البحث بكلمات أخرى أو اختر تبويباً مختلفاً.'
                  : 'فور إرسال أي طالب لاستشارة ستظهر هنا مباشرة للرد عليها، أو يمكنك المبادرة بمراسلة أي طالب بالزر بالأعلى.'}
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
                  {/* Top Row: Student & Status */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-xs text-ink-900 block truncate">
                          {msg.student?.full_name || 'طالب'}
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
                            <span>بانتظار الرد</span>
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
                        <CheckCircle2 className="w-3 h-3" />
                        <span>ردك المسجل:</span>
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
                  <span>{msg.status === 'answered' ? 'عرض المحادثة والردود' : 'الرد على الاستشارة'}</span>
                  <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* New Consultation Modal (Counselor mode) */}
      <NewConsultationModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={handleCreated}
        mode="counselor"
        allStudents={allStudents}
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
        currentUserRole="counselor"
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
                هل أنت متأكد من حذف هذه الاستشارة؟ سيتم إزالتها نهائياً من سجل التواصل.
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
