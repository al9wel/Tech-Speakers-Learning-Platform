'use client'

import { useState } from 'react'
import {
  Inbox,
  Clock,
  CheckCircle2,
  Eye,
  User,
  Calendar,
  MessageCircle,
  Filter,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import type { SuggestionItem, SuggestionStatus } from '../types'
import { updateSuggestionStatusAction } from '../server/actions'

interface SupervisorSuggestionsManagerProps {
  initialSuggestions: SuggestionItem[]
}

export function SupervisorSuggestionsManager({
  initialSuggestions,
}: SupervisorSuggestionsManagerProps) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(initialSuggestions)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<string>('')

  const filteredSuggestions = suggestions.filter((s) => {
    if (filterStatus === 'all') return true
    return s.status === filterStatus
  })

  const handleStatusChange = async (id: string, newStatus: SuggestionStatus) => {
    setUpdatingId(id)
    try {
      const res = await updateSuggestionStatusAction(id, newStatus)
      if (res.success && res.suggestion) {
        toast.success(res.message || 'تم تحديث حالة المقترح')
        setSuggestions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
        )
      } else {
        toast.error(res.message || 'تعذر تحديث الحالة')
      }
    } catch {
      toast.error('حدث خطأ أثناء التحديث')
    } finally {
      setUpdatingId(null)
    }
  }

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return
    setUpdatingId(id)
    try {
      const current = suggestions.find((s) => s.id === id)
      const res = await updateSuggestionStatusAction(
        id,
        current?.status || 'reviewed',
        replyText
      )
      if (res.success && res.suggestion) {
        toast.success('تم إرسال الرد للطالب')
        setSuggestions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, admin_reply: replyText } : s))
        )
        setActiveReplyId(null)
        setReplyText('')
      } else {
        toast.error(res.message || 'تعذر إرسال الرد')
      }
    } catch {
      toast.error('حدث خطأ أثناء إرسال الرد')
    } finally {
      setUpdatingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="rounded-lg border border-ink-200/80 bg-paper-light p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-teal/10 text-teal-dark text-xs font-semibold border border-teal/20">
              <Sparkles className="w-3.5 h-3.5 text-teal" />
              <span>لوحة الإشراف والمتابعة</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-ink-900">
              صندوق مقترحات الطلاب
            </h1>
            <p className="text-xs sm:text-sm text-ink-600 max-w-xl leading-relaxed">
              استعراض ومتابعة كافة المقترحات والأفكار الواردة من الطلاب مع أسماء المرسلين وتحديث حالات معالجتها.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <span className="px-3 py-1.5 rounded-md bg-white text-xs font-medium text-ink-700 border border-ink-200 shadow-xs">
              إجمالي المقترحات: <span className="font-serif font-bold text-ink-900">{suggestions.length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-xs font-semibold text-ink-500 flex items-center gap-1.5 pl-2">
          <Filter className="w-3.5 h-3.5" /> تصفية:
        </span>
        {[
          { key: 'all', label: 'الكل' },
          { key: 'pending', label: 'قيد المراجعة' },
          { key: 'reviewed', label: 'تم الاطلاع' },
          { key: 'resolved', label: 'تم التنفيذ' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
              filterStatus === tab.key
                ? 'bg-ink-900 text-white shadow-xs'
                : 'bg-white text-ink-700 hover:bg-paper-mid border border-ink-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Suggestions List */}
      {filteredSuggestions.length === 0 ? (
        <div className="bg-paper-light rounded-lg border border-dashed border-ink-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-ink-100 text-ink-400 flex items-center justify-center mx-auto">
            <Inbox className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-ink-900 text-base">لا توجد مقترحات في هذا القسم</h3>
          <p className="text-xs text-ink-500 leading-relaxed">لم يتم إرسال أي مقترحات مطابقة للمحددات المحددة حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSuggestions.map((suggestion) => {
            const authorName = suggestion.author?.full_name || 'طالب مسجل'

            return (
              <div
                key={suggestion.id}
                className="bg-paper-light rounded-lg border border-ink-200/80 p-5 sm:p-6 shadow-xs hover:border-teal/50 transition-colors space-y-4"
              >
                {/* Header row: Author + Date + Category */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-ink-200/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-md bg-teal/10 text-teal flex items-center justify-center font-bold text-sm">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-ink-900">
                          {authorName}
                        </span>
                        <span className="px-1.5 py-0.5 rounded-sm bg-teal/10 text-teal text-[11px] font-semibold border border-teal/20">
                          طالب
                        </span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-ink-400 mt-0.5">
                        <Calendar className="w-3 h-3 text-ink-400" />
                        {formatDate(suggestion.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="px-2.5 py-0.5 rounded-sm bg-white text-ink-700 text-xs font-medium border border-ink-200">
                      {suggestion.category || 'عام'}
                    </span>

                    {/* Status selector */}
                    <div className="relative inline-block">
                      <select
                        value={suggestion.status}
                        onChange={(e) =>
                          handleStatusChange(
                            suggestion.id,
                            e.target.value as SuggestionStatus
                          )
                        }
                        disabled={updatingId === suggestion.id}
                        className={`text-xs font-medium rounded-md px-2.5 py-1 border cursor-pointer focus:outline-none transition-colors ${
                          suggestion.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : suggestion.status === 'reviewed'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        <option value="pending">قيد المراجعة</option>
                        <option value="reviewed">تم الاطلاع</option>
                        <option value="resolved">تم التنفيذ</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Body: Title & Content */}
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-serif font-bold text-ink-900">
                    {suggestion.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-700 leading-relaxed whitespace-pre-line">
                    {suggestion.content}
                  </p>
                </div>

                {/* Admin Reply Section */}
                {suggestion.admin_reply ? (
                  <div className="p-3.5 rounded-md bg-paper-mid border border-ink-200/80 text-xs text-ink-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-amber-800">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>ردك المسجل للطالب:</span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveReplyId(suggestion.id)
                          setReplyText(suggestion.admin_reply || '')
                        }}
                        className="text-[11px] text-ink-500 hover:text-ink-800 font-medium underline"
                      >
                        تعديل الرد
                      </button>
                    </div>
                    <p className="leading-relaxed pr-5">{suggestion.admin_reply}</p>
                  </div>
                ) : (
                  <div className="pt-1">
                    {activeReplyId === suggestion.id ? (
                      <div className="space-y-2 p-3 bg-paper-mid rounded-md border border-ink-200">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="اكتب رداً أو توجيهاً للطالب حول هذا المقترح..."
                          className="w-full text-xs p-2.5 rounded-md border border-ink-200 bg-white text-ink-900 focus:outline-none focus:border-teal resize-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReplyId(null)
                              setReplyText('')
                            }}
                            className="px-3 py-1.5 rounded-md text-xs font-medium text-ink-700 hover:bg-ink-100 border border-ink-200"
                          >
                            إلغاء
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendReply(suggestion.id)}
                            disabled={updatingId === suggestion.id || !replyText.trim()}
                            className="px-3 py-1.5 rounded-md text-xs font-medium bg-teal hover:bg-teal-dark text-white flex items-center gap-1 shadow-xs"
                          >
                            {updatingId === suggestion.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            <span>حفظ الرد</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveReplyId(suggestion.id)
                          setReplyText('')
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-teal hover:text-teal-dark transition-colors"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>إضافة رد أو توجيه للطالب</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
