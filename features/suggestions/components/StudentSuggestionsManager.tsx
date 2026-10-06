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
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            تم التنفيذ
          </span>
        )
      case 'reviewed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-800 border border-blue-200/60">
            <Eye className="w-3 h-3 text-blue-600" />
            تم الاطلاع
          </span>
        )
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/60">
            <Clock className="w-3 h-3 text-amber-600" />
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
      {/* Top Header & Action */}
      <div className="bg-bg-surface border border-border-base rounded-lg p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-accent/10 text-accent text-[11px] font-medium border border-accent/20">
            <Sparkles className="w-3 h-3 text-accent" />
            <span>صوتك مسموع</span>
          </div>
          <h1 className="font-serif text-2xl font-bold text-ink-primary">
            مقترحاتي للإدارة
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted max-w-xl font-normal leading-relaxed">
            أهلاً بك يا <span className="text-accent font-semibold">{currentUserName}</span>. يمكنك هنا مشاركة أفكارك ومقترحاتك البناءة لتطوير المنصة والمتابعة حتى تنفيذها.
          </p>
        </div>

        <button
          onClick={() => setIsDialogOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-accent hover:bg-accent-hover text-white font-medium text-xs sm:text-sm shadow-xs transition-colors shrink-0"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span>تقديم مقترح جديد</span>
        </button>
      </div>

      {/* Suggestions List */}
      {suggestions.length === 0 ? (
        <div className="bg-bg-surface rounded-lg border border-dashed border-border-base p-10 sm:p-14 text-center space-y-4">
          <div className="w-12 h-12 rounded-md bg-bg-alt text-ink-muted flex items-center justify-center mx-auto border border-border-subtle">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-serif text-lg font-bold text-ink-primary">
              لم تقدم أي مقترحات حتى الآن
            </h3>
            <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
              لديك فكرة لتسهيل التعلّم أو تحسين ميزة معينة؟ شاركنا مقترحك وسيقوم فريق الإدارة بمراجعته بكل اهتمام.
            </p>
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white font-medium text-xs shadow-xs transition-colors"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            <span>كتابة أول مقترح</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="bg-bg-surface rounded-lg border border-border-base p-5 hover:border-accent/40 transition-colors relative"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-3 border-b border-border-subtle">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-bg-alt text-ink-secondary text-[11px] font-medium border border-border-subtle">
                    {suggestion.category || 'عام'}
                  </span>
                  {getStatusBadge(suggestion.status)}
                </div>

                <div className="flex items-center gap-3 text-xs text-ink-muted font-normal self-end sm:self-auto">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-ink-muted/70" />
                    {formatDate(suggestion.created_at)}
                  </span>

                  {/* Delete Button */}
                  <button
                    onClick={() => setConfirmDeleteId(suggestion.id)}
                    className="p-1 text-ink-muted hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    title="حذف المقترح"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Title & Content */}
              <div className="mt-3 space-y-1.5">
                <h3 className="font-serif text-base sm:text-lg font-bold text-ink-primary leading-snug">
                  {suggestion.title}
                </h3>
                <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed whitespace-pre-line font-normal">
                  {suggestion.content}
                </p>
              </div>

              {/* Admin reply if available */}
              {suggestion.admin_reply && (
                <div className="mt-4 p-3 rounded-md bg-bg-alt/70 border-r-2 border-r-accent border-y border-l border-border-subtle text-xs text-ink-primary space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-accent">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>رد الإدارة والمشرف:</span>
                  </div>
                  <p className="leading-relaxed pr-5 text-ink-secondary">{suggestion.admin_reply}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/40 backdrop-blur-xs">
          <div className="bg-bg-surface rounded-lg max-w-sm w-full p-5 text-center space-y-4 border border-border-base shadow-xl">
            <div className="w-10 h-10 rounded-md bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-ink-primary text-base">حذف المقترح</h4>
              <p className="text-xs text-ink-muted">
                هل أنت متأكد من رغبتك في حذف هذا المقترح؟ لا يمكن التراجع عن هذا الإجراء.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                disabled={Boolean(deletingId)}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium text-ink-secondary hover:bg-bg-alt border border-border-base transition-colors"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteId)}
                disabled={Boolean(deletingId)}
                className="px-3.5 py-1.5 rounded-md text-xs font-medium bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 transition-colors"
              >
                {deletingId ? (
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

      {/* Dialog for adding new suggestion */}
      <SuggestionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSuggestionCreated={handleSuggestionCreated}
      />
    </div>
  )
}
