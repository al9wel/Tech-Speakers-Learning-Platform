'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  ArrowLeft,
  FileText,
  Search,
  GraduationCap,
  X,
  ChevronLeft,
} from 'lucide-react'

export interface SubjectLessonItem {
  id: string
  title: string
  explanation: string
  sort_order: number
  sectionsCount: number
  teacher?: {
    id: string
    name: string
  } | null
}

interface SubjectLessonsExplorerProps {
  lessons: SubjectLessonItem[]
  subjectName: string
}

export function SubjectLessonsExplorer({
  lessons,
  subjectName,
}: SubjectLessonsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('all')

  // Extract unique teachers from the lessons list
  const teachers = useMemo(() => {
    const map = new Map<string, string>()
    lessons.forEach((l) => {
      if (l.teacher?.id && l.teacher?.name) {
        map.set(l.teacher.id, l.teacher.name)
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [lessons])

  // Filter lessons based on teacher and search query
  const filteredLessons = useMemo(() => {
    return lessons.filter((lesson) => {
      const matchesTeacher =
        selectedTeacherId === 'all' || lesson.teacher?.id === selectedTeacherId

      const matchesSearch =
        !searchQuery.trim() ||
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lesson.explanation &&
          lesson.explanation.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesTeacher && matchesSearch
    })
  }, [lessons, selectedTeacherId, searchQuery])

  const hasActiveFilters = searchQuery.trim() !== '' || selectedTeacherId !== 'all'

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="border border-border-base rounded-lg p-3.5 sm:p-4 bg-bg-surface">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الدرس أو الكلمات المفتاحية..."
              className="w-full pr-9 pl-8 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary p-1"
                aria-label="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Teacher Filter Dropdown */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <div className="w-8 h-8 rounded-md bg-bg-alt text-ink-secondary border border-border-subtle flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-2.5 py-2 rounded-md border border-border-base bg-bg-surface text-xs sm:text-sm text-ink-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition cursor-pointer"
            >
              <option value="all">جميع المعلمين ({teachers.length})</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  أ. {teacher.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-border-subtle text-xs text-ink-secondary">
          <div className="flex items-center gap-2">
            <span>
              عرض <strong className="text-ink-primary font-bold">{filteredLessons.length}</strong> من إجمالي{' '}
              <strong className="text-ink-primary font-bold">{lessons.length}</strong> درس
            </span>
            {hasActiveFilters && (
              <span className="chip bg-accent-bg text-accent border-accent/20 text-[10px]">
                مُفلتر
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedTeacherId('all')
              }}
              className="text-accent hover:underline font-medium text-xs"
            >
              إعادة ضبط الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Lessons List in Structured Editorial Container */}
      {filteredLessons.length > 0 ? (
        <div className="border border-border-base rounded-lg bg-bg-surface overflow-hidden">
          {filteredLessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={`/student/lessons/${lesson.id}`}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-border-subtle last:border-b-0 hover:bg-bg-alt/50 transition-colors group"
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <div className="w-7 h-7 rounded-md bg-bg-alt text-ink-secondary flex items-center justify-center font-mono text-xs font-semibold shrink-0 mt-0.5 border border-border-subtle group-hover:border-accent/40 group-hover:text-accent transition-colors">
                  {lesson.sort_order || index + 1}
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-base text-ink-primary group-hover:text-accent transition-colors mb-1 truncate">
                    {lesson.title}
                  </h3>

                  {lesson.explanation && (
                    <p className="text-xs text-ink-secondary line-clamp-1 leading-relaxed mb-2">
                      {lesson.explanation}
                    </p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap">
                    {lesson.teacher?.name && (
                      <span className="chip text-[11px]">
                        أ. {lesson.teacher.name}
                      </span>
                    )}
                    <span className="flex items-center gap-1 text-[11px] text-ink-muted">
                      <FileText className="w-3 h-3" />
                      <span>{lesson.sectionsCount} أقسام</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0 text-xs font-medium text-ink-muted group-hover:text-accent transition-colors">
                <span className="hidden sm:inline">بدء الدرس</span>
                <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-border-base rounded-lg p-10 text-center max-w-md mx-auto bg-bg-surface">
          <BookOpen className="w-8 h-8 text-ink-muted stroke-[1.5] mx-auto mb-2" />
          <h3 className="font-serif font-bold text-base text-ink-primary mb-1">
            {hasActiveFilters ? 'لا توجد دروس تطابق خيارات البحث' : 'لا توجد دروس منشورة في هذه المادة بعد'}
          </h3>
          <p className="text-xs text-ink-secondary mb-4">
            {hasActiveFilters
              ? 'جرّب تغيير كلمات البحث أو اختيار معلم آخر لعرض الدروس.'
              : 'يقوم المعلمون حالياً بإعداد المحتوى التعليمي وسيتم نشره قريباً.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setSelectedTeacherId('all')
              }}
              className="btn-outline text-xs py-1.5 px-3 mx-auto"
            >
              عرض جميع دروس المادة
            </button>
          )}
        </div>
      )}
    </div>
  )
}
