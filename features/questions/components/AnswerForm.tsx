'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { answerFormSchema, type AnswerFormValues } from '../schemas/question.schema'
import { createAnswerAction } from '../server/actions'
import { Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface AnswerFormProps {
  questionId: string
  onAnswerAdded?: (newAnswer?: any) => void
}

export function AnswerForm({ questionId, onAnswerAdded }: AnswerFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AnswerFormValues>({
    resolver: zodResolver(answerFormSchema),
    defaultValues: {
      question_id: questionId,
      content: '',
    },
  })

  const onSubmit = async (data: AnswerFormValues) => {
    setIsSubmitting(true)
    try {
      const res = await createAnswerAction(data)
      if (!res.success) {
        toast.error(res.message)
      } else {
        toast.success('تم إرسال مشاركتك بنجاح')
        reset()
        onAnswerAdded?.(res.data)
        router.refresh()
      }
    } catch {
      toast.error('حدث خطأ أثناء الإرسال')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-4 pt-3 border-t border-ink-100/70">
      <label className="block text-xs font-bold text-ink-700 mb-1.5">
        أضف إجابتك أو تعليقك:
      </label>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
        <div className="flex-1">
          <textarea
            rows={2}
            placeholder="اكتب إجابتك أو استفسارك هنا لمناقشته مع المعلم والزملاء..."
            {...register('content')}
            disabled={isSubmitting}
            className="input-field text-xs sm:text-sm resize-none bg-cream/30 focus:bg-white py-2.5"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary text-xs sm:text-sm px-5 py-2.5 sm:min-h-[46px] shrink-0 flex items-center justify-center gap-2 shadow-soft sm:self-center cursor-pointer transition-all rounded-xl"
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
          <span>{isSubmitting ? 'جاري الإرسال...' : 'إرسال الإجابة'}</span>
        </button>
      </div>
      {errors.content && (
        <p className="text-red-600 text-xs mt-1.5">{errors.content.message}</p>
      )}
    </form>
  )
}
