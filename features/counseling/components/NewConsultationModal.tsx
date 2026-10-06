'use client'

import { useState, useTransition } from 'react'
import {
  X,
  Send,
  User,
  HeartHandshake,
  Loader2,
  Search,
  MessageSquare,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import type { CounselingProfile, CounselingMessageItem } from '../types'
import { createCounselingMessageAction } from '../server/actions'

interface NewConsultationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newItem: CounselingMessageItem) => void
  mode: 'student' | 'counselor'
  counselors?: CounselingProfile[]
  initialCounselorId?: string
  initialStudentId?: string
  allStudents?: CounselingProfile[]
}

export function NewConsultationModal({
  isOpen,
  onClose,
  onSuccess,
  mode,
  counselors = [],
  initialCounselorId,
  initialStudentId,
  allStudents = [],
}: NewConsultationModalProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [selectedCounselorId, setSelectedCounselorId] = useState<string>(
    initialCounselorId || (counselors.length > 0 ? counselors[0].id : '')
  )
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    initialStudentId || (allStudents.length > 0 ? allStudents[0].id : '')
  )
  const [studentSearch, setStudentSearch] = useState('')

  if (!isOpen) return null

  const filteredStudents = allStudents.filter((s) =>
    (s.full_name || '').toLowerCase().includes(studentSearch.toLowerCase().trim())
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || title.trim().length < 3) {
      toast.error('عنوان الاستشارة يجب أن يتكون من 3 أحرف على الأقل')
      return
    }

    if (!content.trim() || content.trim().length < 5) {
      toast.error('يرجى كتابة نص الرسالة أو الاستشارة بوضوح (5 أحرف على الأقل)')
      return
    }

    if (mode === 'student' && !selectedCounselorId) {
      toast.error('يرجى اختيار المستشار النفسي')
      return
    }

    if (mode === 'counselor' && !selectedStudentId) {
      toast.error('يرجى اختيار الطالب المراد مراسلته')
      return
    }

    startTransition(async () => {
      const res = await createCounselingMessageAction({
        title: title.trim(),
        content: content.trim(),
        counselor_id: mode === 'student' ? selectedCounselorId : undefined,
        student_id: mode === 'counselor' ? selectedStudentId : undefined,
      })

      if (res.success && res.item) {
        toast.success(res.message || 'تم إرسال الرسالة بنجاح')
        onSuccess(res.item)
        onClose()
      } else {
        toast.error(res.message || 'تعذر إرسال الرسالة')
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-bg-surface rounded-lg p-5 sm:p-6 shadow-xl border border-border-base space-y-4 animate-in zoom-in-95 duration-150 cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-base">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
              <HeartHandshake className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-serif text-base sm:text-lg font-bold text-ink-primary">
                {mode === 'student' ? 'طلب استشارة نفسية جديدة' : 'إرسال رسالة توجيهية لطالب'}
              </h3>
              <p className="text-xs text-ink-muted">
                {mode === 'student'
                  ? 'محادثة خاصة وسرية مع المستشار التربوي والنفسي'
                  : 'تواصل مباشر مع الطالب لمتابعته وتقديم النصح'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-ink-muted hover:text-ink-primary hover:bg-bg-alt transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Target Selector */}
          {mode === 'student' ? (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink-primary">المستشار النفسي المطلوب:</label>
              <select
                value={selectedCounselorId}
                onChange={(e) => setSelectedCounselorId(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors cursor-pointer"
                disabled={isPending}
              >
                {counselors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name || 'مستشار نفسي'}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-ink-primary">اختيار الطالب المستهدف:</label>
              {allStudents.length > 5 && (
                <div className="relative mb-2">
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="ابحث باسم الطالب..."
                    className="w-full pl-3 pr-8 py-1.5 rounded-md border border-border-base bg-bg-surface text-xs text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent"
                  />
                  <Search className="w-3.5 h-3.5 text-ink-muted/70 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
              )}
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary focus:outline-none focus:border-accent transition-colors cursor-pointer"
                disabled={isPending}
              >
                {filteredStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name || 'طالب بدون اسم'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink-primary">موضوع أو عنوان الاستشارة:</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: قلق الامتحانات، تنظيم الوقت، استفسار خاص..."
              className="w-full px-3 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent transition-colors"
              disabled={isPending}
            />
          </div>

          {/* Content */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-ink-primary">نص الرسالة أو الاستشارة بالتفصيل:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              placeholder="اكتب رسالتك أو استفسارك هنا بكل حرية، الرسالة سرية تماماً ولن يراها إلا المستشار..."
              className="w-full px-3 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent transition-colors resize-none leading-relaxed"
              disabled={isPending}
            />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="px-3.5 py-1.5 rounded-md text-xs font-medium text-ink-secondary hover:bg-bg-alt border border-border-base transition-colors cursor-pointer"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white font-medium text-xs sm:text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  <span>جارٍ الإرسال...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>إرسال الاستشارة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
