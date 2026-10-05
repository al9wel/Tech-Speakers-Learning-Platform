'use client'

import Link from 'next/link'
import { ColumnDef } from '@tanstack/react-table'
import type { LessonItem } from '../types'
import { DeleteLessonDialog } from '../components/DeleteLessonDialog'
import { ArrowUpDown, BookOpen, Layers, Pencil, Eye } from 'lucide-react'

export function getLessonColumns(): ColumnDef<LessonItem>[] {
  return [
    {
      accessorKey: 'sort_order',
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-1 font-bold text-ink-800 hover:text-ink-950 transition"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>الترتيب</span>
          <ArrowUpDown className="w-3.5 h-3.5 text-ink-400" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="w-8 h-8 rounded-lg bg-gold/15 text-gold-dark font-heading font-bold text-xs flex items-center justify-center">
          {row.original.sort_order}
        </div>
      ),
    },
    {
      accessorKey: 'title',
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-1.5 font-bold text-ink-800 hover:text-ink-950 transition"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>عنوان الدرس والشرح التمهيدي</span>
          <ArrowUpDown className="w-3.5 h-3.5 text-ink-400" />
        </button>
      ),
      cell: ({ row }) => {
        const lesson = row.original
        return (
          <div className="max-w-md py-1">
            <Link
              href={`/teacher/lessons/${lesson.id}`}
              className="font-heading font-bold text-sm text-ink-900 mb-0.5 block hover:text-gold-dark hover:underline transition"
              title="معاينة الدرس كما يظهر للطالب"
            >
              {lesson.title}
            </Link>
            <p className="text-xs text-ink-500 line-clamp-1">{lesson.explanation}</p>
          </div>
        )
      },
    },
    {
      id: 'subject',
      accessorFn: (row) => row.subject?.name ?? '',
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-1.5 font-bold text-ink-800 hover:text-ink-950 transition"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>المادة الدراسية</span>
          <ArrowUpDown className="w-3.5 h-3.5 text-ink-400" />
        </button>
      ),
      cell: ({ row }) => {
        const subjectName = row.original.subject?.name ?? 'غير محدد'
        return (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cream border border-ink-100/80 text-xs font-semibold text-ink-800">
            <BookOpen className="w-3.5 h-3.5 text-gold-dark" />
            <span>{subjectName}</span>
          </div>
        )
      },
    },
    {
      id: 'sectionsCount',
      header: () => <div className="text-center">الأقسام</div>,
      cell: ({ row }) => {
        const count = row.original.sectionsCount ?? row.original.sections?.length ?? 0
        return (
          <div className="flex items-center justify-center">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-ink-50 text-ink-700 text-xs font-bold">
              <Layers className="w-3 h-3 text-ink-400" />
              <span>{count}</span>
            </span>
          </div>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => (
        <button
          type="button"
          className="flex items-center gap-1 font-bold text-ink-800 hover:text-ink-950 transition"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span>تاريخ الإضافة</span>
          <ArrowUpDown className="w-3.5 h-3.5 text-ink-400" />
        </button>
      ),
      cell: ({ row }) => {
        const date = row.original.created_at
        if (!date) return <span className="text-xs text-ink-400">-</span>
        return <span className="text-xs text-ink-500 font-mono">{date.substring(0, 10)}</span>
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-center">العمليات</div>,
      cell: ({ row }) => {
        const lesson = row.original
        return (
          <div className="flex items-center justify-center gap-2">
            <Link
              href={`/teacher/lessons/${lesson.id}`}
              className="btn-outline text-xs py-1.5 px-2.5 flex items-center gap-1 hover:bg-ink-100/80 hover:text-ink-900"
              title="عرض ومعاينة الدرس"
            >
              <Eye className="w-3.5 h-3.5 text-ink-600" />
              <span>عرض</span>
            </Link>
            <Link
              href={`/teacher/lessons/${lesson.id}/edit`}
              className="btn-outline text-xs py-1.5 px-2.5 flex items-center gap-1 hover:bg-gold/10 hover:border-gold"
              title="تعديل الدرس"
            >
              <Pencil className="w-3.5 h-3.5 text-gold-dark" />
              <span>تعديل</span>
            </Link>
            <DeleteLessonDialog lesson={lesson} />
          </div>
        )
      },
    },
  ]
}
