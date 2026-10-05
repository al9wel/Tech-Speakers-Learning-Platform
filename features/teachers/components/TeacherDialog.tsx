'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { teacherFormSchema, type TeacherFormValues } from '../schemas/teacher.schema'
import { createTeacherAction, updateTeacherAction } from '../server/actions'
import { Users, Pencil, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { UserItem } from '@/features/users/components/UserDialog'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface TeacherDialogProps {
  teacher?: UserItem // If provided, mode is EDIT. If undefined, mode is CREATE.
  trigger?: React.ReactNode
}

export function TeacherDialog({ teacher, trigger }: TeacherDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [serverSuccess, setServerSuccess] = useState<string | null>(null)
  const isEdit = Boolean(teacher)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherFormSchema),
    defaultValues: {
      user_id: teacher?.id,
      full_name: teacher?.full_name || '',
      email: teacher?.email || '',
    },
  })

  const onSubmit = async (data: TeacherFormValues) => {
    setServerError(null)
    setServerSuccess(null)

    if (isEdit && teacher) {
      const res = await updateTeacherAction({
        user_id: teacher.id,
        full_name: data.full_name,
        email: data.email,
      })

      if (!res.success) {
        setServerError(res.message)
        toast.error(res.message)
      } else {
        setServerSuccess(res.message)
        toast.success(res.message)
        router.refresh()
        setTimeout(() => {
          setOpen(false)
          setServerSuccess(null)
        }, 800)
      }
    } else {
      const res = await createTeacherAction({
        full_name: data.full_name,
        email: data.email,
      })

      if (!res.success) {
        setServerError(res.message)
        toast.error(res.message)
      } else {
        setServerSuccess(res.message)
        toast.success(res.message)
        reset()
        router.refresh()
        setTimeout(() => {
          setOpen(false)
          setServerSuccess(null)
        }, 800)
      }
    }
  }

  const handleOpen = () => {
    reset({
      user_id: teacher?.id,
      full_name: teacher?.full_name || '',
      email: teacher?.email || '',
    })
    setServerError(null)
    setServerSuccess(null)
    setOpen(true)
  }

  return (
    <>
      {trigger ? (
        <span onClick={handleOpen} className="inline-block cursor-pointer">
          {trigger}
        </span>
      ) : isEdit ? (
        <button
          type="button"
          onClick={handleOpen}
          className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 hover:bg-gold/10 hover:border-gold"
        >
          <Pencil className="w-3.5 h-3.5 text-gold-dark" />
          <span>تعديل</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="btn-primary text-sm flex items-center gap-2"
        >
          <Users className="w-4 h-4" />
          <span>إضافة معلم جديد</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-900/50 backdrop-blur-xs animate-page overflow-y-auto">
          <div className="card w-full max-w-lg max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-white shadow-card-hover border-ink-200 animate-scale-in my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-ink-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center">
                  {isEdit ? <Pencil className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-ink-900">
                    {isEdit ? 'تعديل بيانات المعلم' : 'إضافة معلم جديد'}
                  </h3>
                  <p className="text-xs text-ink-500">
                    {isEdit ? teacher?.email : 'سيتم إنشاء الحساب بكلمة مرور مؤقتة: 123456789'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Messages */}
            {serverError && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{serverError}</span>
              </div>
            )}

            {serverSuccess && (
              <div className="p-3 mb-4 rounded-xl bg-sage-50 border border-sage-100 text-sage-dark text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-sage-dark" />
                <span>{serverSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-700 mb-1.5">
                  الاسم الكامل للمعلم:
                </label>
                <input
                  type="text"
                  placeholder="مثال: أستاذ عبد الله محمد"
                  {...register('full_name')}
                  className="input-field text-sm"
                />
                {errors.full_name && (
                  <p className="text-red-600 text-xs mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-700 mb-1.5">
                  البريد الإلكتروني:
                </label>
                <input
                  type="email"
                  placeholder="teacher@example.com"
                  {...register('email')}
                  className="input-field text-sm"
                  dir="ltr"
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 mt-6 border-t border-ink-100">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                  className="btn-outline text-sm"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-sm min-w-28 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>{isEdit ? 'حفظ التعديلات' : 'إضافة المعلم'}</span>
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
