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
    <section className="mt-12 rounded-2xl border border-ink-100 bg-white p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-ink-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-ink-900">الأسئلة والنقاشات التفاعلية</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gold/15 text-gold-dark border border-gold/30">
                {questions.length} {questions.length === 1 ? 'سؤال' : 'أسئلة'}
              </span>
            </div>
            <p className="text-sm text-ink-500 mt-0.5">
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
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gold text-white font-medium hover:bg-gold-dark transition shadow-sm text-sm shrink-0"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>إضافة سؤال للدرس</span>
              </button>
            }
          />
        )}
      </div>

      {/* Questions List */}
      <div className="mt-6 space-y-4">
        {questions.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-ink-200 bg-parchment/40">
            <div className="w-12 h-12 rounded-full bg-parchment flex items-center justify-center mx-auto text-ink-400 mb-3">
              <MessageCircleQuestion className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-ink-800 mb-1">لا توجد أسئلة لهذا الدرس حتى الآن</h3>
            <p className="text-sm text-ink-500 max-w-md mx-auto">
              {isTeacherOrAdmin
                ? 'يمكنك كمعلم طرح أسئلة استيعابية أو اختبارات قصيرة هنا لتحفيز الطلاب على الإجابة والتفاعل.'
                : 'لم يقم المعلم بنشر أي أسئلة لهذا الدرس بعد. ترقب الأسئلة التفاعلية قريباً!'}
            </p>
            {isTeacherOrAdmin && (
              <div className="mt-4">
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
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gold/10 text-gold-dark font-medium hover:bg-gold/20 transition text-sm"
                    >
                      <Sparkles className="w-4 h-4" />
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
