'use client'

import { useState, useTransition, useRef, useEffect } from 'react'
import {
  X,
  Send,
  User,
  HeartHandshake,
  Calendar,
  Clock,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'sonner'
import type { CounselingMessageItem, CounselingReplyItem } from '../types'
import { replyCounselingMessageAction } from '../server/actions'

interface ConsultationThreadModalProps {
  isOpen: boolean
  onClose: () => void
  item: CounselingMessageItem | null
  currentUserId: string
  currentUserRole: 'student' | 'counselor' | 'admin'
  onReplyAdded: (messageId: string, reply: CounselingReplyItem) => void
}

export function ConsultationThreadModal({
  isOpen,
  onClose,
  item,
  currentUserId,
  currentUserRole,
  onReplyAdded,
}: ConsultationThreadModalProps) {
  const [replyContent, setReplyContent] = useState('')
  const [isPending, startTransition] = useTransition()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isOpen, item?.replies])

  if (!isOpen || !item) return null

  const studentName = item.student?.full_name || 'الطالب'
  const counselorName = item.counselor?.full_name || 'المستشار النفسي'

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault()

    if (!replyContent.trim() || replyContent.trim().length < 2) {
      toast.error('يرجى كتابة نص الرد بوضوح')
      return
    }

    startTransition(async () => {
      const res = await replyCounselingMessageAction({
        message_id: item.id,
        content: replyContent.trim(),
      })

      if (res.success && res.reply) {
        toast.success(res.message || 'تم إرسال الرد بنجاح')
        onReplyAdded(item.id, res.reply)
        setReplyContent('')
      } else {
        toast.error(res.message || 'تعذر إرسال الرد')
      }
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-ink-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col border border-ink-100 cursor-default animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-parchment/60 border-b border-ink-100 flex items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  item.status === 'answered'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                {item.status === 'answered' ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>تم الرد</span>
                  </>
                ) : (
                  <>
                    <Clock3 className="w-3 h-3 text-amber-600" />
                    <span>قيد المراجعة</span>
                  </>
                )}
              </span>

              <span className="text-xs text-ink-400 flex items-center gap-1 font-medium">
                <Calendar className="w-3 h-3" />
                {formatDate(item.created_at)}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-black text-ink-900 leading-snug">
              {item.title}
            </h3>

            <div className="flex items-center gap-3 text-xs text-ink-500 pt-0.5">
              <span>
                <strong className="text-ink-700">الطالب:</strong> {studentName}
              </span>
              <span>•</span>
              <span>
                <strong className="text-ink-700">المستشار:</strong> {counselorName}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl text-ink-400 hover:text-ink-800 hover:bg-ink-100 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-ink-50/25">
          {/* Privacy Note */}
          <div className="p-3 rounded-2xl bg-gold/10 border border-gold/20 flex items-center gap-2.5 text-xs text-ink-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
            <span>هذه المحادثة سرية وخاصة بين الطالب والمستشار التربوي والنفسي.</span>
          </div>

          {/* Initial Message (By Sender) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-ink-500 px-1">
              <span className="font-bold text-ink-900 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-gold" />
                {item.sender?.full_name || (item.sender_id === item.student_id ? studentName : counselorName)}
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-ink-100 font-normal">
                  {item.sender_id === item.student_id ? 'طالب' : 'مستشار نفسي'}
                </span>
              </span>
              <span className="text-[11px] text-ink-400">{formatDate(item.created_at)}</span>
            </div>

            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-ink-100 shadow-2xs text-sm sm:text-base text-ink-800 whitespace-pre-line leading-relaxed">
              {item.content}
            </div>
          </div>

          {/* Legacy Response (if replies is empty and response exists) */}
          {(!item.replies || item.replies.length === 0) && item.response && (
            <div className="space-y-1.5 mr-4 sm:mr-8">
              <div className="flex items-center justify-between text-xs text-ink-500 px-1">
                <span className="font-bold text-ink-900 flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                  {counselorName}
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    رد المستشار
                  </span>
                </span>
                {item.response_at && (
                  <span className="text-[11px] text-ink-400">{formatDate(item.response_at)}</span>
                )}
              </div>

              <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 text-sm sm:text-base text-ink-900 whitespace-pre-line leading-relaxed shadow-2xs">
                {item.response}
              </div>
            </div>
          )}

          {/* Chronological Replies Thread */}
          {item.replies &&
            item.replies.map((reply) => {
              const isCounselorReply = reply.sender_id === item.counselor_id
              return (
                <div
                  key={reply.id}
                  className={`space-y-1.5 ${isCounselorReply ? 'mr-3 sm:mr-6' : 'ml-3 sm:ml-6'}`}
                >
                  <div className="flex items-center justify-between text-xs text-ink-500 px-1">
                    <span className="font-bold text-ink-900 flex items-center gap-1.5">
                      {isCounselorReply ? (
                        <>
                          <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{reply.author?.full_name || counselorName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                            مستشار
                          </span>
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5 text-gold" />
                          <span>{reply.author?.full_name || studentName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-ink-100 font-normal">
                            طالب
                          </span>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] text-ink-400">{formatDate(reply.created_at)}</span>
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-sm sm:text-base whitespace-pre-line leading-relaxed shadow-2xs ${
                      isCounselorReply
                        ? 'bg-emerald-50/70 border border-emerald-200 text-ink-900'
                        : 'bg-white border border-ink-100 text-ink-800'
                    }`}
                  >
                    {reply.content}
                  </div>
                </div>
              )
            })}

          <div ref={messagesEndRef} />
        </div>

        {/* Reply Input Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-ink-100 shrink-0">
          <form onSubmit={handleSendReply} className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                rows={2}
                placeholder={
                  currentUserRole === 'counselor'
                    ? 'اكتب ردك وتوجيهك الإرشادي للطالب...'
                    : 'اكتب رسالتك أو تعقيبك للمستشار النفسي...'
                }
                className="w-full px-4 py-3 rounded-2xl border border-ink-200 bg-ink-50/40 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-gold focus:bg-white transition-all resize-none leading-relaxed"
                disabled={isPending}
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !replyContent.trim()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-ink-900 hover:bg-ink-800 text-white font-bold text-xs shadow-soft transition-all shrink-0 cursor-pointer disabled:opacity-50 h-[50px]"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-gold" />
              ) : (
                <>
                  <Send className="w-4 h-4 text-gold" />
                  <span>إرسال الرد</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
