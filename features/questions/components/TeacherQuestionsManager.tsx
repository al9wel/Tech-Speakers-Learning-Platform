'use client'

import { useState, useMemo, useEffect } from 'react'
import type { QuestionItem } from '../types'
import { QuestionCard } from './QuestionCard'
import { QuestionDialog } from './QuestionDialog'
import { deleteQuestionAction } from '../server/actions'
import {
  HelpCircle,
  Plus,
  Search,
  Filter,
  BookOpen,
  MessageSquare,
  Sparkles,
  Layers,
  GraduationCap,
} from 'lucide-react'
import { toast } from 'sonner'

interface LessonOption {
  id: string
  title: string
  subject_id: string
  subject_name?: string
}

interface TeacherQuestionsManagerProps {
  initialQuestions: QuestionItem[]
  lessons: LessonOption[]
  currentUserId: string
  currentUserRole: string
}

export function TeacherQuestionsManager({
  initialQuestions,
  lessons,
  currentUserId,
  currentUserRole,
}: TeacherQuestionsManagerProps) {
  const [questions, setQuestions] = useState<QuestionItem[]>(initialQuestions)
  const [selectedLessonId, setSelectedLessonId] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [editingQuestion, setEditingQuestion] = useState<QuestionItem | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    setQuestions(initialQuestions)
  }, [initialQuestions])

  // Filter questions based on selected lesson and search query
  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesLesson = selectedLessonId === 'all' || q.lesson_id === selectedLessonId
      const matchesSearch =
        !searchQuery.trim() ||
        q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (q.lesson?.title && q.lesson.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (q.lesson?.subject?.name && q.lesson.subject.name.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesLesson && matchesSearch
    })
  }, [questions, selectedLessonId, searchQuery])

  // Total answers counter
  const totalAnswersCount = useMemo(() => {
    return questions.reduce((acc, q) => acc + (q.answersCount ?? q.answers?.length ?? 0), 0)
  }, [questions])

  const handleDeleteQuestion = async (question: QuestionItem) => {
    if (!confirm(`هل أنت متأكد من حذف السؤال "${question.title}" وجميع الإجابات التابعة له؟`)) {
      return
    }

    try {
      const res = await deleteQuestionAction(question.id)
      if (res.success) {
        toast.success(res.message)
        setQuestions((prev) => prev.filter((q) => q.id !== question.id))
      } else {
        toast.error(res.message)
      }
    } catch {
      toast.error('حدث خطأ أثناء حذف السؤال')
    }
  }

  const handleEditQuestion = (question: QuestionItem) => {
    setEditingQuestion(question)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Stats */}
      <div className="rounded-lg border border-ink-200/80 bg-paper-light p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-ink-200/60">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-teal/10 text-teal-dark text-xs font-semibold mb-2 border border-teal/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>بنك الأسئلة والتقييمات التفاعلية</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-ink-900 tracking-tight">
              بنك الأسئلة والنقاشات
            </h1>
            <p className="text-sm text-ink-600 mt-1 max-w-2xl leading-relaxed">
              اطرح أسئلة وتطبيقات على دروسك لمتابعة استيعاب الطلاب ومناقشة إجاباتهم واستفساراتهم الأكاديمية.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <QuestionDialog
              lessons={lessons}
              preselectedLessonId={selectedLessonId !== 'all' ? selectedLessonId : undefined}
              onSuccess={(newQ) => {
                if (newQ) {
                  setQuestions((prev) => [newQ, ...prev.filter((q) => q.id !== newQ.id)])
                }
              }}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-teal text-white font-medium hover:bg-teal-dark transition shadow-xs text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>طرح سؤال جديد</span>
                </button>
              }
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6">
          <div className="bg-white rounded-md p-4 border border-ink-200/70 shadow-xs">
            <div className="flex items-center gap-2 text-amber-700 mb-1.5">
              <HelpCircle className="w-4 h-4" />
              <span className="text-xs font-medium text-ink-500">إجمالي الأسئلة</span>
            </div>
            <p className="text-2xl font-serif font-bold text-ink-900">{questions.length}</p>
          </div>

          <div className="bg-white rounded-md p-4 border border-ink-200/70 shadow-xs">
            <div className="flex items-center gap-2 text-teal mb-1.5">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs font-medium text-ink-500">إجابات وتفاعلات الطلاب</span>
            </div>
            <p className="text-2xl font-serif font-bold text-ink-900">{totalAnswersCount}</p>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-white rounded-md p-4 border border-ink-200/70 shadow-xs">
            <div className="flex items-center gap-2 text-ink-700 mb-1.5">
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-medium text-ink-500">الدروس المتاحة</span>
            </div>
            <p className="text-2xl font-serif font-bold text-ink-900">{lessons.length}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث في نصوص الأسئلة، الدروس، أو المواد..."
            className="w-full pr-10 pl-4 py-2 rounded-md border border-ink-200 bg-white text-sm text-ink-800 placeholder-ink-400 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20 transition"
          />
        </div>

        {/* Lesson Filter Dropdown */}
        <div className="flex items-center gap-2 min-w-[240px]">
          <Filter className="w-4 h-4 text-ink-500 shrink-0" />
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="w-full px-3 py-2 rounded-md border border-ink-200 bg-white text-sm text-ink-800 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20 transition cursor-pointer"
          >
            <option value="all">جميع الدروس ({questions.length})</option>
            {lessons.map((lesson) => {
              const count = questions.filter((q) => q.lesson_id === lesson.id).length
              return (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title} {lesson.subject_name ? `(${lesson.subject_name})` : ''} - [{count}]
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* Questions Feed */}
      <div className="space-y-4">
        {filteredQuestions.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-lg border border-dashed border-ink-200 bg-paper-light">
            <div className="w-12 h-12 rounded-full bg-ink-100 flex items-center justify-center mx-auto text-ink-400 mb-3">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-ink-900 mb-1">لم يتم العثور على أي أسئلة</h3>
            <p className="text-xs text-ink-500 max-w-md mx-auto mb-5 leading-relaxed">
              {searchQuery || selectedLessonId !== 'all'
                ? 'لا توجد نتائج تطابق خيارات البحث والفلترة المحددة. جرب اختيار درس آخر أو مسح البحث.'
                : 'لم تقم بإضافة أي أسئلة تفاعلية بعد. ابدأ الآن بطرح أول سؤال لطلابك.'}
            </p>
            <QuestionDialog
              lessons={lessons}
              preselectedLessonId={selectedLessonId !== 'all' ? selectedLessonId : undefined}
              onSuccess={(newQ) => {
                if (newQ) {
                  setQuestions((prev) => [newQ, ...prev.filter((q) => q.id !== newQ.id)])
                }
              }}
              trigger={
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-teal text-white text-xs font-medium hover:bg-teal-dark transition shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>طرح سؤال الآن</span>
                </button>
              }
            />
          </div>
        ) : (
          filteredQuestions.map((question) => (
            <div key={question.id} className="relative group">
              {/* Optional Lesson Badge Above Card if viewing all */}
              {question.lesson && (
                <div className="flex items-center gap-2 mb-1.5 px-1 text-xs text-ink-500 font-medium">
                  <span className="flex items-center gap-1 text-teal font-semibold">
                    <BookOpen className="w-3.5 h-3.5" />
                    {question.lesson.subject?.name || 'المادة'}
                  </span>
                  <span>/</span>
                  <span className="text-ink-700">{question.lesson.title}</span>
                </div>
              )}
              <QuestionCard
                question={question}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
                onEditQuestion={handleEditQuestion}
                onDeleteQuestion={handleDeleteQuestion}
              />
            </div>
          ))
        )}
      </div>

      {/* Edit Dialog Instance */}
      {editingQuestion && (
        <QuestionDialog
          question={editingQuestion}
          lessons={lessons}
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) setEditingQuestion(null)
          }}
          onSuccess={(updatedQ) => {
            if (updatedQ) {
              setQuestions((prev) =>
                prev.map((q) => (q.id === updatedQ.id ? { ...q, ...updatedQ } : q))
              )
            }
          }}
        />
      )}
    </div>
  )
}
