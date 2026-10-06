import Link from 'next/link'
import { requireRole } from '@/lib/auth/require-role'
import { TeacherQuestionsManager } from '@/features/questions/components/TeacherQuestionsManager'
import type { QuestionItem } from '@/features/questions/types'
import { HelpCircle, ArrowRight, AlertTriangle } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TeacherQuestionsPage() {
  const { user, supabase } = await requireRole('teacher')

  // 1. Fetch lessons owned by this teacher (for question creation & filtering)
  const { data: rawLessons, error: lessonsError } = await supabase
    .from('lessons')
    .select(`
      id,
      title,
      subject_id,
      subject:subjects (
        id,
        name
      )
    `)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  // 2. Fetch questions created by this teacher, including answers and student profiles
  const { data: rawQuestions, error: questionsError } = await supabase
    .from('questions')
    .select(`
      id,
      lesson_id,
      created_by,
      title,
      content,
      created_at,
      updated_at,
      lesson:lessons (
        id,
        title,
        subject:subjects (
          id,
          name
        )
      ),
      author:profiles!questions_created_by_fkey (
        id,
        full_name,
        role
      ),
      question_answers (
        id,
        question_id,
        user_id,
        content,
        created_at,
        updated_at,
        author:profiles!question_answers_user_id_fkey (
          id,
          full_name,
          role
        )
      )
    `)
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  if (lessonsError || questionsError) {
    const errorMsg = lessonsError?.message || questionsError?.message || 'تعذر تحميل بيانات بنك الأسئلة'
    return (
      <div className="container-page py-12 animate-page">
        <div className="card p-8 bg-white border-red-200 text-center max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="font-heading font-bold text-xl text-ink-900 mb-2">
            حدث خطأ أثناء تحميل بنك الأسئلة
          </h2>
          <p className="text-sm text-ink-500 mb-5 leading-relaxed">
            {errorMsg}
          </p>
          <Link href="/teacher" className="btn-primary text-sm inline-flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            <span>العودة للوحة المعلم</span>
          </Link>
        </div>
      </div>
    )
  }

  const lessonsOptions = (rawLessons ?? []).map((l: any) => ({
    id: l.id,
    title: l.title,
    subject_id: l.subject_id,
    subject_name: l.subject?.name,
  }))

  const questions: QuestionItem[] = (rawQuestions ?? []).map((q: any) => ({
    id: q.id,
    lesson_id: q.lesson_id,
    created_by: q.created_by,
    title: q.title,
    content: q.content,
    created_at: q.created_at,
    updated_at: q.updated_at,
    lesson: q.lesson ? {
      id: q.lesson.id,
      title: q.lesson.title,
      subject: q.lesson.subject ? {
        id: q.lesson.subject.id,
        name: q.lesson.subject.name,
      } : undefined,
    } : undefined,
    author: q.author ? {
      id: q.author.id,
      full_name: q.author.full_name,
      role: q.author.role,
    } : undefined,
    answers: (q.question_answers ?? []).map((ans: any) => ({
      id: ans.id,
      question_id: ans.question_id,
      user_id: ans.user_id,
      content: ans.content,
      created_at: ans.created_at,
      updated_at: ans.updated_at,
      author: ans.author ? {
        id: ans.author.id,
        full_name: ans.author.full_name,
        role: ans.author.role,
      } : undefined,
    })),
    answersCount: (q.question_answers ?? []).length,
  }))

  return (
    <div className="container-page py-8 animate-page">
      <TeacherQuestionsManager
        initialQuestions={questions}
        lessons={lessonsOptions}
        currentUserId={user.id}
        currentUserRole="teacher"
      />
    </div>
  )
}
