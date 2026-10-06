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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-ink-100 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-ink-100 flex items-center justify-between bg-parchment/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-ink-900 text-lg">إرسال مقترح للإدارة</h3>
              <p className="text-xs text-ink-500 font-medium">شاركنا أفكارك وملاحظاتك لتطوير المنصة والعملية التعليمية</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-ink-400 hover:text-ink-700 hover:bg-ink-100 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4.5">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-ink-700 mb-1.5">
              تصنيف المقترح
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <label
                  key={cat}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-ink-200 text-xs font-semibold cursor-pointer transition-all hover:border-gold has-checked:border-gold has-checked:bg-gold/10 has-checked:text-gold"
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
            <label className="block text-xs font-bold text-ink-700 mb-1.5">
              عنوان المقترح <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="مثال: إضافة اختبارات قصيرة بعد نهاية كل درس"
              {...register('title')}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-gold/30 transition-all ${
                errors.title ? 'border-red-400 bg-red-50/20' : 'border-ink-200 focus:border-gold'
              }`}
            />
            {errors.title && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-bold text-ink-700 mb-1.5">
              تفاصيل وشرح المقترح <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="اكتب شرحاً وافياً ومقنعاً لمقترحك وكيف سيساعد الطلاب أو الإدارة..."
              {...register('content')}
              className={`w-full px-4 py-3 rounded-xl border text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:ring-2 focus:ring-gold/30 resize-none transition-all ${
                errors.content ? 'border-red-400 bg-red-50/20' : 'border-ink-200 focus:border-gold'
              }`}
            />
            {errors.content && (
              <p className="text-xs text-red-500 mt-1 font-medium">{errors.content.message}</p>
            )}
          </div>

          <div className="rounded-xl bg-amber-50/70 border border-amber-200/60 p-3 text-xs text-amber-800 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              مقترحك سيصل مباشرة إلى إدارة المنصة والمشرفين لمراجعته مع إبراز اسمك الكريم لمتابعة الملاحظات.
            </p>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-ink-600 hover:bg-ink-100 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl text-sm font-bold bg-gold hover:bg-gold-600 text-white shadow-soft transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جارٍ الإرسال...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
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
