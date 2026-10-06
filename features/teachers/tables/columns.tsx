'use client'

import { ColumnDef } from '@tanstack/react-table'
import type { UserItem } from '@/features/users/components/UserDialog'
import { TeacherDialog } from '../components/TeacherDialog'
import { DeleteTeacherDialog } from '../components/DeleteTeacherDialog'
import { ArrowUpDown } from 'lucide-react'

export function getTeacherColumns(): ColumnDef<UserItem>[] {
  return [
    {
      accessorKey: 'full_name',
      header: ({ column }) => {
        return (
          <button
            type="button"
            className="flex items-center gap-1.5 font-bold text-ink-800 hover:text-ink-950 transition"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>اسم المعلم</span>
            <ArrowUpDown className="w-3.5 h-3.5 text-ink-400" />
          </button>
        )
      },
      cell: ({ row }) => {
        const u = row.original
        return (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent-bg text-accent font-semibold text-xs flex items-center justify-center shrink-0 border border-accent/20">
              {(u.full_name || u.email).charAt(0).toUpperCase()}
            </div>
            <div className="font-semibold text-ink-primary text-sm">
              {u.full_name || <span className="text-ink-muted italic">بدون اسم</span>}
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
            className="flex items-center gap-1.5 font-bold text-ink-800 hover:text-ink-950 transition"
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
        return (
          <div className="flex items-center justify-center gap-2">
            <TeacherDialog teacher={u} />
            <DeleteTeacherDialog teacher={u} />
          </div>
        )
      },
    },
  ]
}
