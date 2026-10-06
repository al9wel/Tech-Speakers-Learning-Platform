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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-ink-primary/40 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] bg-bg-surface rounded-lg overflow-hidden shadow-xl flex flex-col border border-border-base cursor-default animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-bg-alt/50 border-b border-border-base flex items-center justify-between gap-4 shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${
                  item.status === 'answered'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
                    : 'bg-amber-50 text-amber-800 border border-amber-200/60'
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

              <span className="text-xs text-ink-muted flex items-center gap-1 font-normal">
                <Calendar className="w-3 h-3" />
                {formatDate(item.created_at)}
              </span>
            </div>

            <h3 className="font-serif text-base sm:text-lg font-bold text-ink-primary leading-snug">
              {item.title}
            </h3>

            <div className="flex items-center gap-2 text-xs text-ink-muted pt-0.5">
              <span>
                <strong className="text-ink-secondary font-medium">الطالب:</strong> {studentName}
              </span>
              <span>•</span>
              <span>
                <strong className="text-ink-secondary font-medium">المستشار:</strong> {counselorName}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-ink-muted hover:text-ink-primary hover:bg-bg-alt transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Conversation Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 bg-bg-base/40">
          {/* Privacy Note */}
          <div className="p-2.5 rounded-md bg-bg-alt border border-border-subtle flex items-center gap-2 text-xs text-ink-secondary font-normal">
            <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
            <span>هذه المحادثة سرية وخاصة بين الطالب والمستشار التربوي والنفسي.</span>
          </div>

          {/* Initial Message (By Sender) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-ink-muted px-1">
              <span className="font-medium text-ink-primary flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-accent" />
                {item.sender?.full_name || (item.sender_id === item.student_id ? studentName : counselorName)}
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-bg-alt text-ink-muted font-normal border border-border-subtle">
                  {item.sender_id === item.student_id ? 'طالب' : 'مستشار نفسي'}
                </span>
              </span>
              <span className="text-[11px] text-ink-muted">{formatDate(item.created_at)}</span>
            </div>

            <div className="p-4 rounded-md bg-bg-surface border border-border-base text-sm text-ink-primary whitespace-pre-line leading-relaxed">
              {item.content}
            </div>
          </div>

          {/* Legacy Response (if replies is empty and response exists) */}
          {(!item.replies || item.replies.length === 0) && item.response && (
            <div className="space-y-1 mr-4 sm:mr-6">
              <div className="flex items-center justify-between text-xs text-ink-muted px-1">
                <span className="font-medium text-ink-primary flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                  {counselorName}
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-200/60">
                    رد المستشار
                  </span>
                </span>
                {item.response_at && (
                  <span className="text-[11px] text-ink-muted">{formatDate(item.response_at)}</span>
                )}
              </div>

              <div className="p-4 rounded-md bg-bg-alt/70 border-r-2 border-r-accent border-y border-l border-border-subtle text-sm text-ink-primary whitespace-pre-line leading-relaxed">
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
                  className={`space-y-1 ${isCounselorReply ? 'mr-3 sm:mr-6' : 'ml-3 sm:ml-6'}`}
                >
                  <div className="flex items-center justify-between text-xs text-ink-muted px-1">
                    <span className="font-medium text-ink-primary flex items-center gap-1.5">
                      {isCounselorReply ? (
                        <>
                          <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{reply.author?.full_name || counselorName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-800 font-medium border border-emerald-200/60">
                            مستشار
                          </span>
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5 text-accent" />
                          <span>{reply.author?.full_name || studentName}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-bg-alt text-ink-muted font-normal border border-border-subtle">
                            طالب
                          </span>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] text-ink-muted">{formatDate(reply.created_at)}</span>
                  </div>

                  <div
                    className={`p-4 rounded-md text-sm whitespace-pre-line leading-relaxed ${
                      isCounselorReply
                        ? 'bg-bg-alt/70 border-r-2 border-r-accent border-y border-l border-border-subtle text-ink-primary'
                        : 'bg-bg-surface border border-border-base text-ink-primary'
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
        <div className="p-4 bg-bg-surface border-t border-border-base shrink-0">
          <form onSubmit={handleSendReply} className="flex items-end gap-2.5">
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
                className="w-full px-3 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors resize-none leading-relaxed"
                disabled={isPending}
              />
            </div>

            <button
              type="submit"
              disabled={isPending || !replyContent.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white font-medium text-xs sm:text-sm shadow-xs transition-colors shrink-0 cursor-pointer disabled:opacity-50 h-[42px]"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-white" />
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
