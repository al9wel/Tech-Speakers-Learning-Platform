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
  teacher: { label: 'معلم', color: 'bg-gold/20 text-gold-dark border-gold/30', icon: Sparkles },
  student: { label: 'طالب', color: 'bg-ink-100 text-ink-700 border-ink-200', icon: GraduationCap },
  admin: { label: 'إدارة', color: 'bg-red-50 text-red-700 border-red-200', icon: Shield },
  supervisor: { label: 'مشرف', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Shield },
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
    <div className="card p-5 sm:p-6 bg-white border-ink-100/90 shadow-card hover:shadow-soft transition-all">
      {/* Question Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-ink-100/70">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center font-bold text-sm shrink-0">
            <RoleIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-bold text-xs sm:text-sm text-ink-900">
                {question.author?.full_name || 'المعلم'}
              </span>
              <span
                className={`chip text-[10px] py-0.5 px-2 border font-bold ${authorRoleInfo.color}`}
              >
                {authorRoleInfo.label}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-ink-400 mt-0.5">
              <Calendar className="w-3 h-3" />
              <span>{question.created_at?.substring(0, 10)}</span>
              {question.lesson?.title && (
                <>
                  <span>•</span>
                  <span className="text-gold-dark font-medium truncate max-w-[200px]">
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
                  className="btn-outline text-xs py-1 px-2.5 hover:bg-gold/10 hover:border-gold"
                >
                  تعديل
                </button>
              )}
              {onDeleteQuestion && (
                <button
                  type="button"
                  onClick={() => onDeleteQuestion(question)}
                  className="btn-outline text-xs py-1 px-2.5 text-red-600 hover:bg-red-50 border-red-200"
                >
                  حذف
                </button>
              )}
            </>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="btn-outline text-xs py-1 px-3 flex items-center gap-1.5 bg-cream/40 hover:bg-cream"
          >
            <MessageSquare className="w-3.5 h-3.5 text-gold-dark" />
            <span>{answersCount} إجابات</span>
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5 text-ink-400" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-ink-400" />
            )}
          </button>
        </div>
      </div>

      {/* Question Content Body */}
      <div className="pt-3 pb-2">
        <h3 className="font-heading font-extrabold text-base sm:text-lg text-ink-900 mb-2 leading-snug">
          {question.title}
        </h3>
        <p className="text-xs sm:text-sm text-ink-700 leading-relaxed whitespace-pre-line">
          {question.content}
        </p>
      </div>

      {/* Answers / Discussion Thread (Expandable) */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-ink-100 space-y-3 animate-slide-up">
          <div className="flex items-center justify-between text-xs text-ink-500 font-bold mb-2">
            <span>إجابات ومشاركات الطلاب ({answers.length})</span>
          </div>

          {answers.length > 0 ? (
            <div className="space-y-2.5">
              {answers.map((ans) => {
                const ansRole = ans.author?.role || 'student'
                const ansRoleInfo = roleBadgeMap[ansRole] || roleBadgeMap.student
                const canDeleteThisAnswer =
                  currentUserId === ans.user_id || isQuestionOwner || currentUserRole === 'admin'

                return (
                  <div
                    key={ans.id}
                    className={`p-3.5 rounded-xl border text-xs sm:text-sm transition-all ${
                      ansRole === 'teacher'
                        ? 'bg-gold/5 border-gold/30'
                        : 'bg-cream/30 border-ink-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-ink-100 text-ink-800 flex items-center justify-center font-bold text-[10px]">
                          {(ans.author?.full_name || (ans.author?.role === 'teacher' ? 'م' : 'ط')).charAt(0).toUpperCase()}
                        </div>
                        <span className="font-heading font-bold text-xs text-ink-900">
                          {ans.author?.full_name || (ans.author?.role === 'teacher' ? 'المعلم' : 'طالب')}
                        </span>
                        <span
                          className={`chip text-[9px] py-0 px-1.5 border font-semibold ${ansRoleInfo.color}`}
                        >
                          {ansRoleInfo.label}
                        </span>
                        <span className="text-[10px] text-ink-400">
                          {ans.created_at?.substring(0, 10)}
                        </span>
                      </div>

                      {canDeleteThisAnswer && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAnswer(ans.id)}
                          disabled={deletingAnswerId === ans.id}
                          className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition cursor-pointer"
                          title="حذف هذه الإجابة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-ink-800 leading-relaxed whitespace-pre-line pl-2 pr-8">
                      {ans.content}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-cream/30 border border-dashed border-ink-200 text-center text-xs text-ink-500">
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
