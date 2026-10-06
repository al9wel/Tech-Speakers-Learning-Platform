'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userFormSchema, type UserFormValues } from '../schemas/user.schema'
import { createUserAction, updateUserAction } from '../server/actions'
import { UserPlus, Pencil, X, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react'
import type { AppRole } from '@/lib/auth/roles'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export type UserItem = {
  id: string
  email: string
  full_name: string
  role: AppRole
  created_at?: string
}

interface UserDialogProps {
  user?: UserItem // If provided, mode is EDIT. If undefined, mode is CREATE.
  trigger?: React.ReactNode
}

const ROLES: { value: AppRole; label: string }[] = [
  { value: 'student', label: 'طالب' },
  { value: 'teacher', label: 'معلم' },
  { value: 'admin', label: 'مشرف عام (Admin)' },
  { value: 'supervisor', label: 'مشرف تربوي' },
  { value: 'counselor', label: 'مستشار نفسي' },
]

export function UserDialog({ user, trigger }: UserDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [serverSuccess, setServerSuccess] = useState<string | null>(null)
  const isEdit = Boolean(user)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      user_id: user?.id,
      full_name: user?.full_name || '',
      email: user?.email || '',
      role: user?.role || 'student',
    },
  })

  const onSubmit = async (data: UserFormValues) => {
    setServerError(null)
    setServerSuccess(null)

    if (isEdit && user) {
      const res = await updateUserAction({
        user_id: user.id,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
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
      const res = await createUserAction({
        full_name: data.full_name,
        email: data.email,
        role: data.role,
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
      user_id: user?.id,
      full_name: user?.full_name || '',
      email: user?.email || '',
      role: user?.role || 'student',
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
          className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 hover:bg-teal/5 hover:border-teal rounded-md"
        >
          <Pencil className="w-3.5 h-3.5 text-teal" />
          <span>تعديل</span>
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-teal text-white text-xs sm:text-sm font-medium hover:bg-teal-dark transition shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          <span>إضافة مستخدم جديد</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-950/40 backdrop-blur-xs animate-page overflow-y-auto">
          <div className="card w-full max-w-lg max-h-[92vh] overflow-y-auto p-5 sm:p-6 bg-paper-light shadow-xl border border-ink-200/80 rounded-lg animate-scale-in my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-ink-200/60">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-md bg-teal/10 text-teal flex items-center justify-center">
                  {isEdit ? <Pencil className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-ink-900">
                    {isEdit ? 'تعديل بيانات المستخدم' : 'إضافة مستخدم جديد'}
                  </h3>
                  <p className="text-xs text-ink-500">
                    {isEdit ? user?.email : 'سيتم إنشاء الحساب بكلمة مرور مؤقتة: 123456789'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-md flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Messages */}
            {serverError && (
              <div className="p-3 mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{serverError}</span>
              </div>
            )}

            {serverSuccess && (
              <div className="p-3 mb-4 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{serverSuccess}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  الاسم الكامل:
                </label>
                <input
                  type="text"
                  placeholder="مثال: علي أحمد سالم"
                  {...register('full_name')}
                  className="w-full px-3 py-2 rounded-md border border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20"
                />
                {errors.full_name && (
                  <p className="text-red-600 text-xs mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  البريد الإلكتروني:
                </label>
                <input
                  type="email"
                  placeholder="user@example.com"
                  {...register('email')}
                  className="w-full px-3 py-2 rounded-md border border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20"
                />
                {errors.email && (
                  <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  الدور في المنصة:
                </label>
                <select
                  {...register('role')}
                  className="w-full px-3 py-2 rounded-md border border-ink-200 bg-white text-sm text-ink-900 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-red-600 text-xs mt-1">{errors.role.message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 mt-6 border-t border-ink-200/60">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={isSubmitting}
                  className="btn-outline text-xs sm:text-sm py-2 px-4 rounded-md"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-teal text-white text-xs sm:text-sm font-medium hover:bg-teal-dark transition shadow-xs min-w-28"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>{isEdit ? 'حفظ التعديلات' : 'إضافة المستخدم'}</span>
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
