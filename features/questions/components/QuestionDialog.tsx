'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { questionFormSchema, type QuestionFormValues } from '../schemas/question.schema'
import { createQuestionAction, updateQuestionAction } from '../server/actions'
import type { QuestionItem } from '../types'
import { Plus, Pencil, X, Loader2, HelpCircle } from 'lucide-react'
import { toast } from 'sonner'

interface LessonOption {
  id: string
  title: string
  subject_id: string
  subject_name?: string
}

interface QuestionDialogProps {
  question?: QuestionItem // If provided -> EDIT mode
  preselectedLessonId?: string
  lessons?: LessonOption[]
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: (savedQuestion?: QuestionItem) => void
}

export function QuestionDialog({
  question,
  preselectedLessonId,
  lessons = [],
  trigger,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
  onSuccess,
}: QuestionDialogProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const setIsOpen = isControlled ? setControlledOpen! : setInternalOpen

  const isEdit = Boolean(question)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      id: question?.id,
      lesson_id: question?.lesson_id || preselectedLessonId || lessons[0]?.id || '',
      title: question?.title || '',
      content: question?.content || '',
    },
  })

  useEffect(() => {
    if (question) {
      reset({
        id: question.id,
        lesson_id: question.lesson_id,
        title: question.title,
        content: question.content,
      })
    } else if (preselectedLessonId) {
      setValue('lesson_id', preselectedLessonId)
    }
  }, [question, preselectedLessonId, reset, setValue])

  const onSubmit = async (data: QuestionFormValues) => {
    try {
      if (isEdit && question) {
        const res = await updateQuestionAction({
          id: question.id,
          title: data.title,
          content: data.content,
        })
        if (res.success) {
          toast.success(res.message)
          setIsOpen(false)
          onSuccess?.(res.data)
          router.refresh()
        } else {
          toast.error(res.message)
        }
      } else {
        const res = await createQuestionAction({
          lesson_id: data.lesson_id,
          title: data.title,
          content: data.content,
        })
        if (res.success) {
          toast.success(res.message)
          reset()
          setIsOpen(false)
          onSuccess?.(res.data)
          router.refresh()
        } else {
          toast.error(res.message)
        }
      }
    } catch {
      toast.error('حدث خطأ أثناء حفظ السؤال')
    }
  }

  return (
    <>
      {trigger ? (
        <span onClick={() => setIsOpen(true)} className="cursor-pointer inline-flex">
          {trigger}
        </span>
      ) : isEdit ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 hover:bg-gold/10 hover:border-gold"
        >
          <Pencil className="w-3.5 h-3.5 text-gold-dark" />
          <span>تعديل</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn-gold text-xs sm:text-sm font-bold py-2 px-4 flex items-center gap-2 shadow-soft"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة سؤال جديد</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-xs animate-fade-in">
          <div className="card p-6 sm:p-7 bg-white shadow-card border-ink-100 w-full max-w-lg relative animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-ink-100 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base sm:text-lg text-ink-900">
                    {isEdit ? 'تعديل السؤال' : 'إضافة سؤال وتطبيق جديد للدرس'}
                  </h3>
                  <p className="text-xs text-ink-500">
                    {isEdit
                      ? 'قم بتحديث عنوان وتفاصيل السؤال'
                      : 'اطرح سؤالاً أو واجباً ليقوم الطلاب بالمشاركة بالإجابة عليه'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Select Lesson (if not already locked to a preselected lesson and not edit) */}
              {!preselectedLessonId && !isEdit && lessons.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-ink-700 mb-1">
                    الدرس المستهدف: <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('lesson_id')}
                    disabled={isSubmitting}
                    className="input-field text-xs sm:text-sm bg-white"
                  >
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.subject_name ? `[${l.subject_name}] ` : ''}
                        {l.title}
                      </option>
                    ))}
                  </select>
                  {errors.lesson_id && (
                    <p className="text-red-600 text-xs mt-1">{errors.lesson_id.message}</p>
                  )}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-ink-700 mb-1">
                  عنوان السؤال أو النشاط: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: مسألة تطبيقية على قوانين الحركة"
                  {...register('title')}
                  disabled={isSubmitting}
                  className="input-field text-sm"
                />
                {errors.title && (
                  <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Content / Details */}
              <div>
                <label className="block text-xs font-bold text-ink-700 mb-1">
                  نص وتفاصيل السؤال: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="اكتب نص السؤال بالتفصيل، والتعليمات المطلوبة من الطلاب للحل والمشاركة..."
                  {...register('content')}
                  disabled={isSubmitting}
                  className="input-field text-sm resize-y leading-relaxed"
                />
                {errors.content && (
                  <p className="text-red-600 text-xs mt-1">{errors.content.message}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-ink-100">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="btn-outline text-xs sm:text-sm py-2 px-4"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-gold text-xs sm:text-sm font-bold py-2 px-5 flex items-center gap-2 shadow-soft"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>{isEdit ? 'حفظ التعديلات' : 'نشر السؤال للدرس'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
