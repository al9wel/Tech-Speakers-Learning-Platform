'use client'

import { useState } from 'react'
import {
  MessageSquarePlus,
  Trash2,
  Clock,
  CheckCircle2,
  Eye,
  AlertCircle,
  Lightbulb,
  Sparkles,
  Loader2,
  Calendar,
  MessageCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import type { SuggestionItem } from '../types'
import { deleteSuggestionAction } from '../server/actions'
import { SuggestionDialog } from './SuggestionDialog'

interface StudentSuggestionsManagerProps {
  initialSuggestions: SuggestionItem[]
  currentUserName: string
}

export function StudentSuggestionsManager({
  initialSuggestions,
  currentUserName,
}: StudentSuggestionsManagerProps) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>(initialSuggestions)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const handleSuggestionCreated = (newSuggestion: SuggestionItem) => {
    setSuggestions((prev) => [newSuggestion, ...prev])
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const res = await deleteSuggestionAction(id)
      if (res.success) {
        toast.success(res.message || 'تم حذف المقترح بنجاح')
        setSuggestions((prev) => prev.filter((s) => s.id !== id))
        setConfirmDeleteId(null)
      } else {
        toast.error(res.message || 'تعذر حذف المقترح')
      }
    } catch {
      toast.error('حدث خطأ أثناء حذف المقترح')
    } finally {
      setDeletingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resolved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            تم التنفيذ
          </span>
        )
      case 'reviewed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Eye className="w-3.5 h-3.5" />
            تم الاطلاع
          </span>
        )
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            قيد المراجعة
          </span>
        )
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-gradient-to-r from-ink-900 to-ink-800 rounded-3xl p-6 sm:p-8 text-white shadow-soft relative overflow-hidden">
        <div className="absolute top-0 -left-12 w-64 h-64 bg-gold/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-gold-200 text-xs font-bold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span>صوتك مسموع</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              مقترحاتي للإدارة
            </h1>
            <p className="text-xs sm:text-sm text-ink-200 max-w-xl font-medium">
              أهلاً بك يا <span className="text-gold font-bold">{currentUserName}</span>. يمكنك هنا مشاركة أفكارك ومقترحاتك البناءة لتطوير المنصة والمتابعة حتى تنفيذها.
            </p>
          </div>

          <button
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gold hover:bg-gold-600 text-white font-bold text-sm shadow-md transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
          >
            <MessageSquarePlus className="w-4.5 h-4.5" />
            <span>تقديم مقترح جديد</span>
          </button>
        </div>
      </div>

      {/* Suggestions List */}
      {suggestions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-ink-100 p-10 sm:p-14 text-center space-y-4 shadow-2xs">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mx-auto shadow-inner">
            <Lightbulb className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-ink-900">
              لم تقدم أي مقترحات حتى الآن
            </h3>
            <p className="text-xs sm:text-sm text-ink-500 font-medium">
              لديك فكرة لتسهيل التعلّم أو تحسين ميزة معينة؟ شاركنا مقترحك وسيقوم فريق الإدارة بمراجعته بكل اهتمام.
            </p>
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-ink-900 hover:bg-ink-800 text-white font-bold text-xs shadow-soft transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4 text-gold" />
            <span>كتابة أول مقترح</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-white rounded-2xl border border-ink-100 p-5 sm:p-6 shadow-2xs hover:shadow-soft transition-all duration-200 relative group"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-ink-100/70">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-xl bg-parchment text-ink-700 text-xs font-bold border border-ink-200/60">
                    {suggestion.category || 'عام'}
                  </span>
                  {getStatusBadge(suggestion.status)}
                </div>

                <div className="flex items-center gap-3 text-xs text-ink-400 font-medium self-end sm:self-auto">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-ink-300" />
                    {formatDate(suggestion.created_at)}
                  </span>

                  {/* Delete Button */}
                  <button
                    onClick={() => setConfirmDeleteId(suggestion.id)}
                    className="p-1.5 text-ink-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="حذف المقترح"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title & Content */}
              <div className="mt-3.5 space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-ink-900 leading-snug">
                  {suggestion.title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-600 leading-relaxed whitespace-pre-line font-normal">
                  {suggestion.content}
                </p>
              </div>

              {/* Admin reply if available */}
              {suggestion.admin_reply && (
                <div className="mt-4 p-3.5 rounded-xl bg-gold/10 border border-gold/25 text-xs text-ink-800 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-gold">
                    <MessageCircle className="w-4 h-4" />
                    <span>رد الإدارة والمشرف:</span>
                  </div>
                  <p className="leading-relaxed pr-5">{suggestion.admin_reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 border border-ink-100 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-ink-900">حذف المقترح</h4>
              <p className="text-xs text-ink-500">
                هل أنت متأكد من رغبتك في حذف هذا المقترح؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-600 hover:bg-ink-100"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5"
              >
                {deletingId ? (
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

      {/* Dialog for adding new suggestion */}
      <SuggestionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuggestionCreated={handleSuggestionCreated}
      />
    </div>
  )
}
