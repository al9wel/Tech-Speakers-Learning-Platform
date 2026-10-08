'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { approveUserAction, rejectUserAction } from '@/features/users/server/actions'

interface ApprovalActionsProps {
  userId: string
  userName: string
  roleLabel?: string
  onApproved?: (userId: string) => void
  onRejected?: (userId: string) => void
}

export function ApprovalActions({
  userId,
  userName,
  roleLabel = 'المستخدم',
  onApproved,
  onRejected,
}: ApprovalActionsProps) {
  const router = useRouter()
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showConfirmReject, setShowConfirmReject] = useState(false)

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      const res = await approveUserAction(userId)
      if (res.success) {
        toast.success(res.message || `تم تفعيل حساب ${roleLabel} بنجاح`)
        if (onApproved) {
          onApproved(userId)
        } else {
          router.refresh()
        }
      } else {
        toast.error(res.message || 'تعذر اعتماد الحساب')
      }
    } catch {
      toast.error('حدث خطأ غير متوقع أثناء الاعتماد')
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    try {
      const res = await rejectUserAction(userId)
      if (res.success) {
        toast.success(res.message || `تم رفض طلب ${roleLabel}`)
        setShowConfirmReject(false)
        if (onRejected) {
          onRejected(userId)
        } else {
          router.refresh()
        }
      } else {
        toast.error(res.message || 'تعذر رفض الطلب')
      }
    } catch {
      toast.error('حدث خطأ أثناء رفض الطلب')
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <div className="flex items-center gap-1.5 justify-center">
      {/* Quick Approve Button */}
      <button
        type="button"
        disabled={isApproving || isRejecting}
        onClick={handleApprove}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
        title={`قبول وتفعيل حساب ${userName || roleLabel}`}
      >
        {isApproving ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Check className="w-3.5 h-3.5" />
        )}
        <span>قبول</span>
      </button>

      {/* Reject Button */}
      {showConfirmReject ? (
        <div className="flex items-center gap-1 bg-red-50 p-1 rounded-lg border border-red-200 animate-in fade-in">
          <button
            type="button"
            disabled={isRejecting}
            onClick={handleReject}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[11px] font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1"
          >
            {isRejecting ? <Loader2 className="w-3 h-3 animate-spin" /> : <span>تأكيد الرفض</span>}
          </button>
          <button
            type="button"
            onClick={() => setShowConfirmReject(false)}
            className="px-1.5 py-1 text-ink-500 hover:text-ink-900 text-[11px] rounded cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={isApproving || isRejecting}
          onClick={() => setShowConfirmReject(true)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 border border-red-200/80 font-bold text-xs transition-all disabled:opacity-50 cursor-pointer"
          title={`رفض طلب ${userName || roleLabel}`}
        >
          <X className="w-3.5 h-3.5" />
          <span>رفض</span>
        </button>
      )}
    </div>
  )
}
