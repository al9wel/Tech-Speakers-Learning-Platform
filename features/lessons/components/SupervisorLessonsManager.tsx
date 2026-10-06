'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  Search,
  BookOpen,
  Filter,
  Layers,
  Eye,
  Trash2,
  Calendar,
  User,
  AlertCircle,
  Loader2,
  Sparkles,
  Inbox,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import type { LessonItem } from '../types'
import { deleteLessonAction } from '../server/actions'

interface SupervisorLessonItem extends LessonItem {
  teacher?: {
    id: string
    full_name: string | null
  } | null
}

interface SubjectOption {
  id: string
  name: string
}

interface SupervisorLessonsManagerProps {
  initialLessons: SupervisorLessonItem[]
  subjects: SubjectOption[]
}

export function SupervisorLessonsManager({
  initialLessons,
  subjects,
}: SupervisorLessonsManagerProps) {
  const [lessons, setLessons] = useState<SupervisorLessonItem[]>(initialLessons)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteLesson, setConfirmDeleteLesson] = useState<SupervisorLessonItem | null>(null)

  const filteredLessons = useMemo(() => {
    return lessons.filter((item) => {
      // Subject filter
      if (selectedSubjectId !== 'all' && item.subject_id !== selectedSubjectId) {
        return false
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase()
        const matchTitle = item.title.toLowerCase().includes(query)
        const matchExpl = item.explanation.toLowerCase().includes(query)
        const matchTeacher = item.teacher?.full_name?.toLowerCase().includes(query)
        const matchSubject = item.subject?.name?.toLowerCase().includes(query)
        return matchTitle || matchExpl || matchTeacher || matchSubject
      }

      return true
    })
  }, [lessons, selectedSubjectId, searchQuery])

  const handleDelete = async (lessonId: string) => {
    setDeletingId(lessonId)
    try {
      const res = await deleteLessonAction(lessonId)
      if (res.success) {
        toast.success(res.message || 'تم حذف الدرس بنجاح')
        setLessons((prev) => prev.filter((l) => l.id !== lessonId))
        setConfirmDeleteLesson(null)
      } else {
        toast.error(res.message || 'تعذر حذف الدرس')
      }
    } catch {
      toast.error('حدث خطأ أثناء حذف الدرس')
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    try {
      return new Date(dateString).toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-br from-white via-cream/60 to-gold/10 rounded-3xl p-6 sm:p-8 text-ink-900 border border-gold/30 shadow-card relative overflow-hidden">
        <div className="absolute top-0 -left-12 w-64 h-64 bg-gold/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-sage/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/15 text-gold-dark text-xs font-bold border border-gold/30">
              <Sparkles className="w-3.5 h-3.5 text-gold-dark" />
              <span>الإشراف التربوي على المناهج</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-ink-900">
              إدارة ومتابعة الدروس
            </h1>
            <p className="text-xs sm:text-sm text-ink-600 max-w-xl font-medium leading-relaxed">
              استعراض كافة الدروس المضافة من قبل المعلمين عبر المواد، والبحث والفلترة ومراجعة المحتوى مع إمكانية الحذف.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md text-xs font-bold text-ink-800 border border-ink-200 shadow-2xs">
              إجمالي الدروس: {lessons.length}
            </span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-ink-100 p-3.5 sm:p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بعنوان الدرس أو الشرح أو اسم المعلم..."
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-ink-200 bg-ink-50/30 text-sm text-ink-900 placeholder:text-ink-300 focus:outline-none focus:border-gold focus:bg-white transition-all"
            />
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-1 text-ink-400 hover:text-ink-700 rounded-md cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Subject Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          <span className="text-xs font-bold text-ink-400 flex items-center gap-1 pl-1 shrink-0">
            <Filter className="w-3 h-3" /> المادة:
          </span>
          <button
            type="button"
            onClick={() => setSelectedSubjectId('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              selectedSubjectId === 'all'
                ? 'bg-ink-900 text-white shadow-2xs'
                : 'bg-parchment/60 text-ink-600 hover:bg-ink-100 border border-ink-200/50'
            }`}
          >
            جميع المواد ({lessons.length})
          </button>
          {subjects.map((s) => {
            const count = lessons.filter((l) => l.subject_id === s.id).length
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSubjectId(s.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedSubjectId === s.id
                    ? 'bg-ink-900 text-white shadow-2xs'
                    : 'bg-parchment/60 text-ink-600 hover:bg-ink-100 border border-ink-200/50'
                }`}
              >
                {s.name} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {/* Lessons Grid */}
      {filteredLessons.length === 0 ? (
        <div className="bg-white rounded-3xl border border-ink-100 p-12 text-center space-y-3 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-ink-100 text-ink-400 flex items-center justify-center mx-auto">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-ink-800 text-base">لا توجد دروس مطابقة</h3>
          <p className="text-xs text-ink-500 font-medium">
            {searchQuery || selectedSubjectId !== 'all'
              ? 'جرب البحث بكلمات أخرى أو اختر مادة دراسية مختلفة.'
              : 'لم يتم إضافة أي دروس في المنصة بعد.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLessons.map((lesson) => {
            const teacherName = lesson.teacher?.full_name || 'معلم معتمد'
            const subjectName = lesson.subject?.name || 'مادة دراسية'
            const sectionsCount = lesson.sectionsCount ?? 0

            return (
              <div
                key={lesson.id}
                className="bg-white rounded-3xl border border-ink-100 p-5 shadow-2xs hover:shadow-soft transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-ink-100/70">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-parchment text-ink-700 text-xs font-bold border border-ink-200/60">
                      <BookOpen className="w-3.5 h-3.5 text-gold" />
                      <span>{subjectName}</span>
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-ink-50 text-ink-600 text-xs font-bold">
                      <Layers className="w-3 h-3 text-ink-400" />
                      <span>{sectionsCount} أقسام</span>
                    </span>
                  </div>

                  {/* Title & Explanation */}
                  <div className="mt-3.5 space-y-1.5">
                    <h3 className="text-base font-bold text-ink-900 group-hover:text-gold-600 transition-colors line-clamp-2">
                      {lesson.title}
                    </h3>
                    <p className="text-xs text-ink-500 line-clamp-2 leading-relaxed">
                      {lesson.explanation}
                    </p>
                  </div>

                  {/* Teacher & Date */}
                  <div className="mt-4 pt-3 border-t border-ink-100/60 flex items-center justify-between text-xs text-ink-400">
                    <span className="flex items-center gap-1.5 text-ink-700 font-semibold truncate">
                      <User className="w-3.5 h-3.5 text-gold shrink-0" />
                      <span className="truncate">{teacherName}</span>
                    </span>

                    <span className="flex items-center gap-1 shrink-0">
                      <Calendar className="w-3 h-3 text-ink-300" />
                      {formatDate(lesson.created_at)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-ink-100/70 flex items-center justify-between gap-2">
                  <Link
                    href={`/supervisor/lessons/${lesson.id}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-ink-100 hover:bg-ink-200/80 text-ink-800 text-xs font-bold transition-colors cursor-pointer flex-1 justify-center"
                  >
                    <Eye className="w-3.5 h-3.5 text-ink-600" />
                    <span>معاينة الدرس</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => setConfirmDeleteLesson(lesson)}
                    className="p-2 text-ink-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
                    title="حذف الدرس"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDeleteLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 border border-ink-100 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-ink-900">حذف الدرس</h4>
              <p className="text-xs text-ink-500">
                هل أنت متأكد من رغبتك في حذف درس &quot;{confirmDeleteLesson.title}&quot;؟ سيتم حذف جميع أقسامه وملفاته وأسئلته المرتبطة.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteLesson(null)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-ink-600 hover:bg-ink-100 cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmDeleteLesson.id)}
                disabled={Boolean(deletingId)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white flex items-center gap-1.5 cursor-pointer"
              >
                {deletingId ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جارٍ الحذف...</span>
                  </>
                ) : (
                  <span>نعم، حذف الدرس</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
