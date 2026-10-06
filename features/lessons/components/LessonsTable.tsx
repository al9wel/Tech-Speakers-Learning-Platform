'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { getLessonColumns } from '../tables/columns'
import type { LessonItem } from '../types'
import { Search, ChevronLeft, ChevronRight, BookOpen, Plus, Inbox } from 'lucide-react'

interface LessonsTableProps {
  data: LessonItem[]
}

export function LessonsTable({ data }: LessonsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: 'sort_order', desc: false }])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo(() => getLessonColumns(), [])

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      globalFilter,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <div className="bg-bg-surface border border-border-base rounded-lg p-4 sm:p-5 shadow-xs">
      {/* Top Bar: Search & Add Lesson Link */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-5">
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted/70 pointer-events-none" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="ابحث بعنوان الدرس أو المادة..."
            className="w-full pr-9 pl-3 py-1.5 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="text-xs text-ink-muted font-normal hidden sm:block">
            إجمالي دروسك: <span className="font-semibold text-ink-primary">{data.length}</span>
          </div>
          <Link
            href="/teacher/lessons/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-medium shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة درس جديد</span>
          </Link>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-md border border-border-base">
        <table className="w-full text-right border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-bg-alt/70 border-b border-border-base text-xs font-semibold text-ink-muted"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-3 font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border-subtle text-sm">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-bg-alt/40 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3 text-ink-primary">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-10 text-center text-ink-muted">
                  <div className="flex flex-col items-center justify-center gap-2">
                    {globalFilter ? (
                      <>
                        <Inbox className="w-8 h-8 text-ink-muted/50 stroke-1" />
                        <p className="font-serif font-bold text-ink-primary">لا توجد نتائج مطابقة</p>
                        <p className="text-xs text-ink-muted">
                          لم نتمكن من العثور على أي درس يطابق كلمة البحث «{globalFilter}».
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-md bg-bg-alt text-ink-muted border border-border-subtle flex items-center justify-center mb-1">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <p className="font-serif font-bold text-base text-ink-primary">
                          لم تقم بإنشاء أي دروس بعد
                        </p>
                        <p className="text-xs text-ink-muted max-w-sm mb-3">
                          اختر المادة الدراسية وأضف دروسك التعليمية مع الشروحات التمهيدية والأقسام التفصيلية لطلابك.
                        </p>
                        <Link
                          href="/teacher/lessons/new"
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-accent hover:bg-accent-hover text-white text-xs font-medium shadow-xs transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>إنشاء أول درس الآن</span>
                        </Link>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-border-subtle text-xs text-ink-muted">
          <div>
            صفحة <span className="font-semibold text-ink-primary">{table.getState().pagination.pageIndex + 1}</span> من{' '}
            <span className="font-semibold text-ink-primary">{table.getPageCount()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-2.5 py-1 rounded-md border border-border-base bg-bg-surface hover:bg-bg-alt text-xs font-medium text-ink-secondary disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>السابق</span>
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-2.5 py-1 rounded-md border border-border-base bg-bg-surface hover:bg-bg-alt text-xs font-medium text-ink-secondary disabled:opacity-40 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>التالي</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
