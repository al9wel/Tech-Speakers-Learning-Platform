'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteLessonAction } from '../server/actions'
import type { LessonItem } from '../types'
import { Trash2, AlertTriangle, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'

interface DeleteLessonDialogProps {
  lesson: LessonItem
}

export function DeleteLessonDialog({ lesson }: DeleteLessonDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteLessonAction(lesson.id)
      if (!res.success) {
        toast.error(res.message)
      } else {
        toast.success(res.message)
        router.refresh()
        setOpen(false)
      }
    } catch {
      toast.error('حدث خطأ غير متوقع أثناء محاولة حذف الدرس')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-outline text-xs py-1.5 px-2.5 flex items-center gap-1 text-red-600 hover:bg-red-50 hover:border-red-200"
        title="حذف الدرس"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>حذف</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-ink-900/50 backdrop-blur-xs animate-page">
          <div className="card w-full max-w-md p-6 bg-white shadow-card-hover border-ink-200 animate-scale-in">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-ink-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-base text-ink-900">
                  تأكيد حذف الدرس
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isDeleting}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-400 hover:text-ink-700 hover:bg-ink-50 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-ink-600 mb-2 leading-relaxed">
              هل أنت متأكد من رغبتك في حذف الدرس:
            </p>
            <div className="p-3 rounded-xl bg-cream/40 border border-ink-100 text-sm font-bold text-ink-900 mb-4">
              «{lesson.title}»
            </div>
            <p className="text-xs text-red-600 mb-6 leading-relaxed">
              سيتم حذف جميع أقسام الدرس والملفات والصور التوضيحية المرفقة به نهائياً من النظام.
            </p>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isDeleting}
                className="btn-outline text-sm"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white font-medium text-sm py-2 px-4 rounded-xl transition flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <span>تأكيد الحذف</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
