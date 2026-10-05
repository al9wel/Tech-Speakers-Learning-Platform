'use client'

import { useState } from 'react'
import { deleteSubjectAction } from '../server/actions'
import type { SubjectItem } from '../types'
import { Trash2, AlertTriangle, Loader2, X, CheckCircle2, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface DeleteSubjectDialogProps {
  subject: SubjectItem
  trigger?: React.ReactNode
}

export function DeleteSubjectDialog({ subject, trigger }: DeleteSubjectDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [serverSuccess, setServerSuccess] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsLoading(true)
    setServerError(null)
    setServerSuccess(null)

    const res = await deleteSubjectAction(subject.id)
    setIsLoading(false)

    if (!res.success) {
      setServerError(res.message)
      toast.error(res.message)
    } else {
      setServerSuccess(res.message)
      toast.success(res.message)
      router.refresh()
      setTimeout(() => {
        setOpen(false)
      }, 700)
    }
  }

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)} className="inline-block cursor-pointer">
          {trigger}
        </span>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          title="حذف المادة الدراسية"
          className="btn-outline text-xs py-1.5 px-3 flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>حذف</span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-900/50 backdrop-blur-xs animate-page overflow-y-auto">
          <div className="card w-full max-w-md max-h-[92vh] overflow-y-auto p-4 sm:p-6 bg-white shadow-card-hover border-ink-200 animate-scale-in my-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-ink-100">
              <div className="flex items-center gap-2.5 text-red-600">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-heading font-bold text-lg text-ink-900">
                  تأكيد حذف المادة
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-sm text-ink-700 leading-relaxed mb-4">
              هل أنت متأكد من رغبتك في حذف مادة{' '}
              <strong className="text-ink-900 font-bold">«{subject.name}»</strong>؟
              هذا الإجراء سيقوم بحذف المادة ومحتوياتها نهائياً من حسابك.
            </p>

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

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-4 mt-2 border-t border-ink-100">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isLoading}
                className="btn-outline text-sm"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isLoading}
                className="btn text-sm bg-red-600 text-white hover:bg-red-700 px-5 py-2.5 min-w-24 shadow-soft"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الحذف...</span>
                  </span>
                ) : (
                  <span>حذف المادة</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
