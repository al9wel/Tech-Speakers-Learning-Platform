'use client'

import { useState, useEffect } from 'react'
import type { QuestionItem } from '../types'
import { QuestionCard } from './QuestionCard'
import { QuestionDialog } from './QuestionDialog'
import { HelpCircle, MessageSquarePlus, Sparkles, MessageCircleQuestion } from 'lucide-react'

interface LessonQuestionsSectionProps {
  lessonId: string
  lessonTitle: string
  initialQuestions: QuestionItem[]
  currentUserId?: string
  currentUserRole?: string
}

export function LessonQuestionsSection({
  lessonId,
  lessonTitle,
  initialQuestions = [],
  currentUserId,
  currentUserRole,
}: LessonQuestionsSectionProps) {
  const [questions, setQuestions] = useState<QuestionItem[]>(initialQuestions)
  const isTeacherOrAdmin = currentUserRole === 'teacher' || currentUserRole === 'admin' || currentUserRole === 'supervisor'

  useEffect(() => {
    setQuestions(initialQuestions)
  }, [initialQuestions])

  return (
    <section className="mt-8 rounded-lg border border-border-base bg-bg-surface p-5 sm:p-7">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-accent-bg text-accent border border-accent/20 flex items-center justify-center shrink-0">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold text-ink-primary">الأسئلة والنقاشات التفاعلية</h2>
              <span className="chip text-[11px] font-semibold text-accent border-accent/20 bg-accent-bg">
                {questions.length} {questions.length === 1 ? 'سؤال' : 'أسئلة'}
              </span>
            </div>
            <p className="text-xs text-ink-secondary mt-0.5">
              أسئلة المعلم الموجهة للدرس ومشاركات وإجابات الطلاب
            </p>
          </div>
        </div>

        {/* Teacher Actions */}
        {isTeacherOrAdmin && (
          <QuestionDialog
            preselectedLessonId={lessonId}
            lessons={[{ id: lessonId, title: lessonTitle, subject_id: '' }]}
            onSuccess={(newQ) => {
              if (newQ) {
                setQuestions((prev) => [newQ, ...prev.filter((q) => q.id !== newQ.id)])
              }
            }}
            trigger={
              <button
                type="button"
                className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 shrink-0"
              >
                <MessageSquarePlus className="w-3.5 h-3.5" />
                <span>إضافة سؤال للدرس</span>
              </button>
            }
          />
        )}
      </div>

      {/* Questions List */}
      <div className="mt-5 space-y-3.5">
        {questions.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-md border border-dashed border-border-base bg-bg-alt/30">
            <div className="w-9 h-9 rounded-md bg-bg-alt border border-border-subtle flex items-center justify-center mx-auto text-ink-muted mb-2.5">
              <MessageCircleQuestion className="w-5 h-5 stroke-[1.6]" />
            </div>
            <h3 className="font-serif font-bold text-sm sm:text-base text-ink-primary mb-1">لا توجد أسئلة لهذا الدرس حتى الآن</h3>
            <p className="text-xs text-ink-secondary max-w-md mx-auto">
              {isTeacherOrAdmin
                ? 'يمكنك كمعلم طرح أسئلة استيعابية أو اختبارات قصيرة هنا لتحفيز الطلاب على الإجابة والتفاعل.'
                : 'لم يقم المعلم بنشر أي أسئلة لهذا الدرس بعد. ترقب الأسئلة التفاعلية قريباً!'}
            </p>
            {isTeacherOrAdmin && (
              <div className="mt-3.5">
                <QuestionDialog
                  preselectedLessonId={lessonId}
                  lessons={[{ id: lessonId, title: lessonTitle, subject_id: '' }]}
                  onSuccess={(newQ) => {
                    if (newQ) {
                      setQuestions((prev) => [newQ, ...prev.filter((q) => q.id !== newQ.id)])
                    }
                  }}
                  trigger={
                    <button
                      type="button"
                      className="btn-outline text-xs py-1.5 px-3 mx-auto"
                    >
                      <span>طرح أول سؤال الآن</span>
                    </button>
                  }
                />
              </div>
            )}
          </div>
        ) : (
          questions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              onDeleteQuestion={(deleted) => {
                setQuestions((prev) => prev.filter((q) => q.id !== deleted.id))
              }}
            />
          ))
        )}
      </div>
    </section>
  )
}
