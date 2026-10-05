'use client'

import { useState, useMemo } from 'react'
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import { getColumns } from '../tables/columns'
import type { UserItem } from './UserDialog'
import { UserDialog } from './UserDialog'
import { Search, ChevronLeft, ChevronRight, Users, Inbox } from 'lucide-react'

interface UsersTableProps {
  data: UserItem[]
  currentAdminId: string
}

export function UsersTable({ data, currentAdminId }: UsersTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const columns = useMemo(() => getColumns(currentAdminId), [currentAdminId])

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
        pageSize: 8,
      },
    },
  })

  return (
    <div className="card p-4 sm:p-6 bg-white shadow-card border-ink-100/80">
      {/* Top Bar: Search & Add Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="ابحث بالاسم أو البريد..."
            className="input-field text-sm pr-10 bg-cream/30"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="text-xs text-ink-500 font-medium hidden sm:block">
            إجمالي المستخدمين: <span className="font-bold text-ink-900">{data.length}</span>
          </div>
          <UserDialog />
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-xl border border-ink-100">
        <table className="w-full text-right border-collapse">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="bg-cream/60 border-b border-ink-100 text-xs font-bold text-ink-700"
              >
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="p-3.5 font-bold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-ink-100/60 text-sm">
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="hover:bg-cream/20 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-3.5 text-ink-900">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="p-12 text-center text-ink-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="w-10 h-10 text-ink-300 stroke-1" />
                    <p className="font-bold text-ink-700">لا توجد بيانات مطابقة</p>
                    <p className="text-xs text-ink-500">
                      {globalFilter
                        ? 'لم يتم العثور على أي مستخدم يطابق كلمة البحث.'
                        : 'لم تتم إضافة أي مستخدمين حتى الآن.'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-ink-100/60 text-xs text-ink-600">
          <div>
            صفحة <span className="font-bold text-ink-900">{table.getState().pagination.pageIndex + 1}</span> من{' '}
            <span className="font-bold text-ink-900">{table.getPageCount()}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="btn-outline py-1 px-2.5 text-xs flex items-center gap-1 disabled:opacity-40"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>السابق</span>
            </button>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="btn-outline py-1 px-2.5 text-xs flex items-center gap-1 disabled:opacity-40"
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
