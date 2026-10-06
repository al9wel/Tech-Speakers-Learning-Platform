'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  X,
  Send,
  Loader2,
  Sparkles,
  HelpCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  suggestionFormSchema,
  type SuggestionFormValues,
} from '../schemas/suggestion.schema'
import { createSuggestionAction } from '../server/actions'
import type { SuggestionItem } from '../types'

interface SuggestionDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuggestionCreated: (newSuggestion: SuggestionItem) => void
}

const CATEGORIES = [
  'عام',
  'تحسين دراسي',
  'مشكلة تقنية',
  'فعاليات وأنشطة',
]

export function SuggestionDialog({
  isOpen,
  onClose,
  onSuggestionCreated,
}: SuggestionDialogProps) {
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SuggestionFormValues>({
    resolver: zodResolver(suggestionFormSchema),
    defaultValues: {
      title: '',
      content: '',
      category: 'عام',
    },
  })

  if (!isOpen) return null

  const onSubmit = async (values: SuggestionFormValues) => {
    setSubmitting(true)
    try {
      const res = await createSuggestionAction(values)
      if (res.success && res.suggestion) {
        toast.success(res.message || 'تم إرسال مقترحك بنجاح للادارة')
        onSuggestionCreated(res.suggestion)
        reset()
        onClose()
      } else {
        toast.error(res.message || 'تعذر إرسال المقترح')
      }
    } catch {
      toast.error('حدث خطأ أثناء إرسال المقترح')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-primary/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-bg-surface rounded-lg max-w-lg w-full border border-border-base shadow-xl overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-base flex items-center justify-between bg-bg-alt/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-accent/10 text-accent flex items-center justify-center border border-accent/20">
              <Sparkles className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-ink-primary text-base sm:text-lg">إرسال مقترح للإدارة</h3>
              <p className="text-xs text-ink-muted font-normal">شاركنا أفكارك وملاحظاتك لتطوير المنصة والعملية التعليمية</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-ink-muted hover:text-ink-primary hover:bg-bg-alt rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1.5">
              تصنيف المقترح
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-md border border-border-base text-xs font-medium cursor-pointer transition-colors hover:border-accent has-checked:border-accent has-checked:bg-accent/10 has-checked:text-accent"
                >
                  <input
                    type="radio"
                    value={cat}
                    {...register('category')}
                    className="sr-only"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1.5">
              عنوان المقترح <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="مثال: إضافة اختبارات قصيرة بعد نهاية كل درس"
              {...register('title')}
              className={`w-full px-3.5 py-2 rounded-md border text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors ${
                errors.title ? 'border-red-400 bg-red-50/20' : 'border-border-base bg-bg-surface'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1 font-normal">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-ink-primary mb-1.5">
              تفاصيل وشرح المقترح <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="اكتب شرحاً وافياً ومقنعاً لمقترحك وكيف سيساعد الطلاب أو الإدارة..."
              {...register('content')}
              className={`w-full px-3.5 py-2 rounded-md border text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none transition-colors ${
                errors.content ? 'border-red-400 bg-red-50/20' : 'border-border-base bg-bg-surface'
              }`}
            />
            {errors.content && (
              <p className="text-xs text-red-500 mt-1 font-normal">{errors.content.message}</p>
            )}
          </div>

          <div className="rounded-md bg-bg-alt/70 border border-border-subtle p-3 text-xs text-ink-secondary flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-ink-muted shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              مقترحك سيصل مباشرة إلى إدارة المنصة والمشرفين لمراجعته مع إبراز اسمك الكريم لمتابعة الملاحظات.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-md text-xs sm:text-sm font-medium text-ink-secondary hover:bg-bg-alt border border-border-base transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 rounded-md text-xs sm:text-sm font-medium bg-accent hover:bg-accent-hover text-white shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ الإرسال...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال المقترح</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
