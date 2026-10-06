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
          className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 hover:bg-teal/5 hover:border-teal rounded-md"
        >
          <Pencil className="w-3.5 h-3.5 text-teal" />
          <span>تعديل</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="btn-primary text-xs sm:text-sm font-medium py-2 px-4 flex items-center gap-2 rounded-md shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة سؤال جديد</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-xs animate-fade-in">
          <div className="card p-6 sm:p-7 bg-paper-light shadow-lg border border-ink-200/80 rounded-lg w-full max-w-lg relative animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-ink-200/70 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-md bg-teal/10 text-teal flex items-center justify-center font-bold">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-ink-900">
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
                className="p-1 rounded-md text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Select Lesson (if not already locked to a preselected lesson and not edit) */}
              {!preselectedLessonId && !isEdit && lessons.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1">
                    الدرس المستهدف: <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register('lesson_id')}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 rounded-md border border-ink-200 bg-white text-xs sm:text-sm text-ink-900 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20"
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
                <label className="block text-xs font-semibold text-ink-700 mb-1">
                  عنوان السؤال أو النشاط: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="مثال: مسألة تطبيقية على قوانين الحركة"
                  {...register('title')}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 rounded-md border border-ink-200 bg-white text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20"
                />
                {errors.title && (
                  <p className="text-red-600 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>

              {/* Content / Details */}
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1">
                  نص وتفاصيل السؤال: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  placeholder="اكتب نص السؤال بالتفصيل، والتعليمات المطلوبة من الطلاب للحل والمشاركة..."
                  {...register('content')}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 rounded-md border border-ink-200 bg-white text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20 resize-y leading-relaxed"
                />
                {errors.content && (
                  <p className="text-red-600 text-xs mt-1">{errors.content.message}</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-ink-200/70">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="btn-outline text-xs sm:text-sm py-2 px-4 rounded-md"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-teal text-white text-xs sm:text-sm font-medium hover:bg-teal-dark transition shadow-xs"
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
