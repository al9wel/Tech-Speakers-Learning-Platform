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
      <div className="bg-gradient-to-r from-ink-900 to-ink-800 rounded-3xl p-6 sm:p-8 text-white shadow-soft relative overflow-hidden">
        <div className="absolute top-0 -left-12 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gold-200 text-xs font-bold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>لوحة الإشراف والمتابعة</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              صندوق مقترحات الطلاب
            </h1>
            <p className="text-xs sm:text-sm text-ink-200 max-w-xl font-medium">
              استعراض ومتابعة كافة المقترحات والأفكار الواردة من الطلاب مع أسماء المرسلين وتحديث حالات معالجتها.
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <span className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md text-xs font-bold text-gold-200 border border-white/10">
              إجمالي المقترحات: {suggestions.length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-xs font-bold text-ink-500 flex items-center gap-1.5 pl-2">
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              filterStatus === tab.key
                ? 'bg-ink-900 text-white shadow-2xs'
                : 'bg-white text-ink-600 hover:bg-ink-100 border border-ink-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Suggestions List */}
      {filteredSuggestions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-ink-100 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-ink-100 text-ink-400 flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-ink-800 text-base">لا توجد مقترحات في هذا القسم</h3>
          <p className="text-xs text-ink-500 font-medium">لم يتم إرسال أي مقترحات مطابقة للمحددات المحددة حالياً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSuggestions.map((suggestion) => {
            const authorName = suggestion.author?.full_name || 'طالب مسجل'

            return (
              <div
                key={suggestion.id}
                className="bg-white rounded-2xl border border-ink-100 p-5 sm:p-6 shadow-2xs hover:shadow-soft transition-all duration-200 space-y-4"
              >
                {/* Header row: Author + Date + Category */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-ink-100/70">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center font-bold text-sm shadow-2xs">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-ink-900">
                          {authorName}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-gold/10 text-gold text-[11px] font-bold">
                          طالب
                        </span>
                      </div>
                      <span className="flex items-center gap-1.5 text-xs text-ink-400 mt-0.5 font-medium">
                        <Calendar className="w-3 h-3 text-ink-300" />
                        {formatDate(suggestion.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span className="px-3 py-1 rounded-xl bg-parchment text-ink-700 text-xs font-bold border border-ink-200/60">
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
                        className={`text-xs font-bold rounded-xl px-3 py-1.5 border appearance-none cursor-pointer focus:outline-none transition-colors ${
                          suggestion.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : suggestion.status === 'reviewed'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
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
                <div className="space-y-2">
                  <h3 className="text-base sm:text-lg font-bold text-ink-900">
                    {suggestion.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-ink-600 leading-relaxed whitespace-pre-line font-normal">
                    {suggestion.content}
                  </p>
                </div>

                {/* Admin Reply Section */}
                {suggestion.admin_reply ? (
                  <div className="p-3.5 rounded-xl bg-gold/10 border border-gold/25 text-xs text-ink-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-bold text-gold">
                        <MessageCircle className="w-4 h-4" />
                        <span>ردك المسجل للطالب:</span>
                      </div>
                      <button
                        onClick={() => {
                          setActiveReplyId(suggestion.id)
                          setReplyText(suggestion.admin_reply || '')
                        }}
                        className="text-[11px] text-ink-500 hover:text-ink-800 font-semibold underline"
                      >
                        تعديل الرد
                      </button>
                    </div>
                    <p className="leading-relaxed pr-5">{suggestion.admin_reply}</p>
                  </div>
                ) : (
                  <div className="pt-1">
                    {activeReplyId === suggestion.id ? (
                      <div className="space-y-2 p-3 bg-parchment/60 rounded-xl border border-ink-100">
                        <textarea
                          rows={2}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="اكتب رداً أو توجيهاً للطالب حول هذا المقترح..."
                          className="w-full text-xs p-2.5 rounded-lg border border-ink-200 bg-white text-ink-900 focus:outline-none focus:border-gold resize-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveReplyId(null)
                              setReplyText('')
                            }}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-ink-600 hover:bg-ink-100"
                          >
                            إلغاء
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSendReply(suggestion.id)}
                            disabled={updatingId === suggestion.id || !replyText.trim()}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gold hover:bg-gold-600 text-white flex items-center gap-1"
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
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-gold hover:text-gold-600 transition-colors"
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
