'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  ArrowLeft,
  FileText,
  Search,
  Filter,
  GraduationCap,
  X,
  Layers,
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
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="card p-4 sm:p-5 bg-white border-ink-100 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3.5 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الدرس أو الكلمات المفتاحية..."
              className="w-full pr-10 pl-9 py-2.5 rounded-xl border border-ink-200 bg-cream/10 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 p-1"
                aria-label="مسح البحث"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Teacher Filter Dropdown */}
          <div className="flex items-center gap-2 min-w-[220px]">
            <div className="w-9 h-9 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center shrink-0">
              <GraduationCap className="w-4 h-4" />
            </div>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-ink-200 bg-white text-sm text-ink-800 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition cursor-pointer"
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
        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-ink-100/70 text-xs text-ink-500">
          <div className="flex items-center gap-2">
            <span>
              عرض <strong className="text-ink-900">{filteredLessons.length}</strong> من إجمالي{' '}
              <strong className="text-ink-900">{lessons.length}</strong> درس
            </span>
            {hasActiveFilters && (
              <span className="px-2 py-0.5 rounded-full bg-gold/15 text-gold-dark font-medium text-[11px]">
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
              className="text-gold-dark hover:underline font-semibold"
            >
              إعادة ضبط الفلاتر
            </button>
          )}
        </div>
      </div>

      {/* Lessons List */}
      {filteredLessons.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredLessons.map((lesson, index) => (
            <Link
              key={lesson.id}
              href={`/student/lessons/${lesson.id}`}
              className="card p-5 sm:p-6 card-hover flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group border-ink-100 hover:border-gold transition-all"
            >
              <div className="flex items-start gap-4 flex-1">
                <div className="w-10 h-10 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center font-heading font-bold text-sm shrink-0 mt-0.5">
                  {lesson.sort_order || index + 1}
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-ink-900 group-hover:text-gold-dark transition-colors mb-1.5">
                    {lesson.title}
                  </h3>

                  {lesson.explanation && (
                    <p className="text-xs text-ink-500 line-clamp-2 leading-relaxed mb-2.5">
                      {lesson.explanation}
                    </p>
                  )}

                  {/* Teacher Attribution Badge */}
                  {lesson.teacher?.name && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-ink-50 text-ink-700 text-xs font-medium border border-ink-200/60">
                      <GraduationCap className="w-3.5 h-3.5 text-gold-dark" />
                      <span>إعداد المعلم: أ. {lesson.teacher.name}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3.5 self-end sm:self-center shrink-0">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-ink-50 text-ink-600 text-xs font-medium">
                  <FileText className="w-3.5 h-3.5 text-ink-400" />
                  <span>{lesson.sectionsCount} أقسام</span>
                </span>

                <span className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 group-hover:bg-gold-dark">
                  <span>عرض الدرس</span>
                  <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center max-w-md mx-auto">
          <BookOpen className="w-10 h-10 text-ink-300 stroke-1 mx-auto mb-2" />
          <h3 className="font-heading font-bold text-base text-ink-900 mb-1">
            {hasActiveFilters ? 'لا توجد دروس تطابق خيارات البحث' : 'لا توجد دروس منشورة في هذه المادة بعد'}
          </h3>
          <p className="text-xs text-ink-500 mb-4">
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
