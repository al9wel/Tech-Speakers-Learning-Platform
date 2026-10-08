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
import { getCounselorColumns } from '../tables/columns'
import type { UserItem } from '@/features/users/components/UserDialog'
import { CounselorDialog } from './CounselorDialog'
import { Search, ChevronLeft, ChevronRight, Inbox, Clock } from 'lucide-react'

interface CounselorsTableProps {
  data: UserItem[]
  currentAdminId: string
}

export function CounselorsTable({ data }: CounselorsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending'>('all')

  const pendingCount = useMemo(
    () => data.filter((u) => u.is_approved === false).length,
    [data]
  )
  const approvedCount = useMemo(
    () => data.filter((u) => u.is_approved !== false).length,
    [data]
  )

  const filteredData = useMemo(() => {
    if (statusFilter === 'approved') {
      return data.filter((u) => u.is_approved !== false)
    }
    if (statusFilter === 'pending') {
      return data.filter((u) => u.is_approved === false)
    }
    return data
  }, [data, statusFilter])

  const columns = useMemo(() => getCounselorColumns(), [])

  const table = useReactTable({
    data: filteredData,
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
      {/* Status Filter Pills */}
      <div className="flex items-center gap-2 mb-5 pb-4 border-b border-ink-100/70 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            statusFilter === 'all'
              ? 'bg-ink-900 text-white shadow-2xs'
              : 'bg-ink-100/80 text-ink-600 hover:text-ink-900 hover:bg-ink-200/60'
          }`}
        >
          جميع المستشارين ({data.length})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('approved')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            statusFilter === 'approved'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
          }`}
        >
          المعتمدون ({approvedCount})
        </button>

        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            statusFilter === 'pending'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
          }`}
        >
          <Clock className="w-3.5 h-3.5 text-amber-600" />
          <span>طلبات بانتظار الموافقة</span>
          {pendingCount > 0 && (
            <span
              className={`px-1.5 py-0.2 rounded-full text-[11px] font-black ${
                statusFilter === 'pending'
                  ? 'bg-white text-amber-700'
                  : 'bg-amber-500 text-white'
              }`}
            >
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {/* Top Bar: Search & Add Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="ابحث باسم المستشار أو البريد..."
            className="input-field text-sm pr-10 bg-cream/30"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <CounselorDialog />
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
                <td
                  colSpan={columns.length}
                  className="p-8 text-center text-ink-400"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="w-8 h-8 text-ink-300" />
                    <p className="text-sm font-semibold">
                      {statusFilter === 'pending'
                        ? 'لا توجد طلبات انضمام معلقة حالياً'
                        : 'لا يوجد مستشارون متطابقون'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4 text-xs text-ink-500 font-medium pt-2">
        <div>
          صفحة {table.getState().pagination.pageIndex + 1} من{' '}
          {table.getPageCount() || 1}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="p-1.5 rounded-lg border border-ink-200 hover:bg-cream/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="p-1.5 rounded-lg border border-ink-200 hover:bg-cream/50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
