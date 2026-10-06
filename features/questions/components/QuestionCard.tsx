'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { QuestionItem, AnswerItem } from '../types'
import { AnswerForm } from './AnswerForm'
import { deleteAnswerAction } from '../server/actions'
import {
  MessageSquare,
  ChevronDown,
  ChevronUp,
  User,
  GraduationCap,
  Shield,
  Trash2,
  Calendar,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'

interface QuestionCardProps {
  question: QuestionItem
  currentUserId?: string
  currentUserRole?: string
  onEditQuestion?: (question: QuestionItem) => void
  onDeleteQuestion?: (question: QuestionItem) => void
  defaultExpanded?: boolean
}

const roleBadgeMap: Record<string, { label: string; color: string; icon: any }> = {
  teacher: { label: 'معلم', color: 'bg-amber-bg text-amber border-amber/30', icon: Sparkles },
  student: { label: 'طالب', color: 'bg-accent-bg text-accent border-accent/30', icon: GraduationCap },
  admin: { label: 'إدارة', color: 'bg-ink-primary text-white border-transparent', icon: Shield },
  supervisor: { label: 'مشرف', color: 'bg-[#eef3f7] text-[#2c5270] border-[#c8d8e5]', icon: Shield },
}

export function QuestionCard({
  question,
  currentUserId,
  currentUserRole,
  onEditQuestion,
  onDeleteQuestion,
  defaultExpanded = false,
}: QuestionCardProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const [deletingAnswerId, setDeletingAnswerId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<AnswerItem[]>(question.answers ?? [])

  useEffect(() => {
    setAnswers(question.answers ?? [])
  }, [question.answers])

  const answersCount = answers.length

  const isQuestionOwner = currentUserId === question.created_by || currentUserRole === 'admin'

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المشاركة؟')) return

    setDeletingAnswerId(answerId)
    try {
      const res = await deleteAnswerAction(answerId)
      if (res.success) {
        toast.success(res.message)
        setAnswers((prev) => prev.filter((a) => a.id !== answerId))
        router.refresh()
      } else {
        toast.error(res.message)
      }
    } catch {
      toast.error('حدث خطأ أثناء حذف المشاركة')
    } finally {
      setDeletingAnswerId(null)
    }
  }

  const authorRoleInfo = roleBadgeMap[question.author?.role ?? 'teacher'] || roleBadgeMap.teacher
  const RoleIcon = authorRoleInfo.icon

  return (
    <div className="border border-border-base rounded-lg p-4 sm:p-5 bg-bg-surface hover:border-[#c8c4bc] transition-all">
      {/* Question Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-accent-bg text-accent flex items-center justify-center font-bold text-xs shrink-0 border border-accent/20">
            <RoleIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-serif font-bold text-xs sm:text-sm text-ink-primary">
                {question.author?.full_name || 'المعلم'}
              </span>
              <span
                className={`chip text-[10px] py-0 px-1.5 border font-medium ${authorRoleInfo.color}`}
              >
                {authorRoleInfo.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-ink-muted mt-0.5">
              <Calendar className="w-3 h-3" />
              <span>{question.created_at?.substring(0, 10)}</span>
              {question.lesson?.title && (
                <>
                  <span>•</span>
                  <span className="text-accent font-medium truncate max-w-[200px]">
                    الدرس: {question.lesson.title}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls for Question Author / Teacher */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          {isQuestionOwner && (
            <>
              {onEditQuestion && (
                <button
                  type="button"
                  onClick={() => onEditQuestion(question)}
                  className="btn-outline text-xs py-1 px-2.5"
                >
                  تعديل
                </button>
              )}
              {onDeleteQuestion && (
                <button
                  type="button"
                  onClick={() => onDeleteQuestion(question)}
                  className="btn-outline text-xs py-1 px-2.5 text-error hover:bg-error-bg/60 border-error/30"
                >
                  حذف
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-outline text-xs py-1 px-2.5 flex items-center gap-1.5 bg-bg-alt/50"
          >
            <MessageSquare className="w-3.5 h-3.5 text-accent" />
            <span>{answersCount} إجابات</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-ink-muted" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
            )}
          </button>
        </div>
      </div>

      {/* Question Content Body */}
      <div className="pt-3 pb-2">
        <h3 className="font-serif font-bold text-base text-ink-primary mb-1.5 leading-snug">
          {question.title}
        </h3>
        <p className="text-xs sm:text-sm text-ink-primary leading-relaxed whitespace-pre-line">
          {question.content}
        </p>
      </div>

      {/* Answers / Discussion Thread (Expandable) */}
      {isExpanded && (
        <div className="mt-3.5 pt-3.5 border-t border-border-subtle space-y-3 animate-fade-in">
          <div className="flex items-center justify-between text-xs text-ink-secondary font-medium mb-1">
            <span>إجابات ومشاركات الطلاب ({answers.length})</span>
          </div>

          {answers.length > 0 ? (
            <div className="space-y-2">
              {answers.map((ans) => {
                const ansRole = ans.author?.role || 'student'
                const ansRoleInfo = roleBadgeMap[ansRole] || roleBadgeMap.student
                const canDeleteThisAnswer =
                  currentUserId === ans.user_id || isQuestionOwner || currentUserRole === 'admin'

                return (
                  <div
                    key={ans.id}
                    className="p-3 rounded-md border text-xs sm:text-sm bg-bg-alt/40 border-border-subtle"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-bg-alt text-ink-primary flex items-center justify-center font-bold text-[9px] border border-border-subtle">
                          {(ans.author?.full_name || (ans.author?.role === 'teacher' ? 'م' : 'ط')).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-serif font-bold text-xs text-ink-primary">
                          {ans.author?.full_name || (ans.author?.role === 'teacher' ? 'المعلم' : 'طالب')}
                        </span>
                        <span
                          className={`chip text-[9px] py-0 px-1 border font-medium ${ansRoleInfo.color}`}
                        >
                          {ansRoleInfo.label}
                        </span>
                        <span className="text-[10px] text-ink-muted">
                          {ans.created_at?.substring(0, 10)}
                        </span>
                      </div>

                      {canDeleteThisAnswer && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAnswer(ans.id)}
                          disabled={deletingAnswerId === ans.id}
                          className="text-error hover:bg-error-bg/60 p-1 rounded transition cursor-pointer"
                          title="حذف هذه الإجابة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-ink-primary leading-relaxed whitespace-pre-line pl-2 pr-7">
                      {ans.content}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-3.5 rounded-md bg-bg-alt/30 border border-dashed border-border-base text-center text-xs text-ink-muted">
              لا توجد إجابات بعد على هذا السؤال. كن أول من يشارك بإجابته!
            </div>
          )}

          {/* Form to submit answer */}
          <AnswerForm
            questionId={question.id}
            onAnswerAdded={(newAnswer) => {
              if (newAnswer) {
                setAnswers((prev) => [...prev, newAnswer])
              }
              setIsExpanded(true)
            }}
          />
        </div>
      )}
    </div>
  )
}
