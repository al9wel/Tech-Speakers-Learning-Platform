'use client'

import { ColumnDef } from '@tanstack/react-table'
import type { UserItem } from '@/features/users/components/UserDialog'
import { CounselorDialog } from '../components/CounselorDialog'
import { DeleteCounselorDialog } from '../components/DeleteCounselorDialog'
import { ApprovalActions } from '@/features/users/components/ApprovalActions'
import { ArrowUpDown, CheckCircle2, Clock } from 'lucide-react'

export function getCounselorColumns(): ColumnDef<UserItem>[] {
  return [
    {
      accessorKey: 'full_name',
      header: ({ column }) => {
        return (
          <button
            type="button"
            className="flex items-center gap-1.5 font-bold text-ink-800 hover:text-ink-950 transition cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>اسم المستشار</span>
            <ArrowUpDown className="w-3.5 h-3.5 text-ink-400" />
          </button>
        )
      },
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-700 font-bold text-xs flex items-center justify-center shrink-0 border border-rose-200">
              {(u.full_name || u.email).charAt(0).toUpperCase()}
            </div>
            <div className="font-semibold text-ink-900 text-sm">
              {u.full_name || <span className="text-ink-400 italic">بدون اسم</span>}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'email',
      header: ({ column }) => {
        return (
          <button
            type="button"
            className="flex items-center gap-1.5 font-bold text-ink-800 hover:text-ink-950 transition cursor-pointer"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>البريد الإلكتروني</span>
            <ArrowUpDown className="w-3.5 h-3.5 text-ink-400" />
          </button>
        )
      },
      cell: ({ row }) => (
        <span className="text-sm text-ink-700 font-mono text-left inline-block direction-ltr">
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: 'is_approved',
      header: 'الحالة',
      cell: ({ row }) => {
        const isApproved = row.original.is_approved !== false
        return isApproved ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>معتمد</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 animate-pulse">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>بانتظار الموافقة</span>
          </span>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: 'تاريخ الانضمام',
      cell: ({ row }) => {
        const date = row.original.created_at
        if (!date) return <span className="text-xs text-ink-400">-</span>
        const formatted = date.replace('T', ' ').substring(0, 10)
        return <span className="text-xs text-ink-500 font-mono">{formatted}</span>
      },
    },
    {
      id: 'actions',
      header: () => <div className="text-center">العمليات</div>,
      cell: ({ row }) => {
        const u = row.original
        const isApproved = u.is_approved !== false

        if (!isApproved) {
          return (
            <ApprovalActions
              userId={u.id}
              userName={u.full_name}
              roleLabel="المستشار"
            />
          )
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <CounselorDialog counselor={u} />
            <DeleteCounselorDialog counselor={u} />
          </div>
        )
      },
    },
  ]
}
