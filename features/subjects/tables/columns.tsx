'use client'

import { ColumnDef } from '@tanstack/react-table'
import Image from 'next/image'
import type { SubjectItem } from '../types'
import { SubjectDialog } from '../components/SubjectDialog'
import { DeleteSubjectDialog } from '../components/DeleteSubjectDialog'
import { ArrowUpDown, BookOpen } from 'lucide-react'

export function getSubjectColumns(currentUserId?: string, canManage: boolean = true): ColumnDef<SubjectItem>[] {
  const columns: ColumnDef<SubjectItem>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <button
            type="button"
            className="flex items-center gap-1.5 font-bold text-ink-800 hover:text-ink-950 transition"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>اسم المادة الدراسية</span>
            <ArrowUpDown className="w-3.5 h-3.5 text-ink-400" />
          </button>
        )
      },
      cell: ({ row }) => {
        const s = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 relative rounded-xl overflow-hidden bg-cream/80 border border-ink-100 flex items-center justify-center shrink-0">
              {s.imageUrl ? (
                <Image
                  src={s.imageUrl}
                  alt={s.name}
                  fill
                  loading="lazy"
                  sizes="44px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gold/15 text-gold-dark flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
              )}
            </div>
            <div>
              <p className="font-heading font-bold text-sm text-ink-900">{s.name}</p>
              <p className="text-xs text-ink-400">مادة تعليمية معتمدة</p>
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'created_at',
      header: ({ column }) => {
        return (
          <button
            type="button"
            className="flex items-center gap-1.5 font-bold text-ink-800 hover:text-ink-950 transition"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            <span>تاريخ الإضافة</span>
            <ArrowUpDown className="w-3.5 h-3.5 text-ink-400" />
          </button>
        )
      },
      cell: ({ row }) => {
        const date = row.original.created_at
        if (!date) return <span className="text-xs text-ink-400">-</span>
        const formatted = date.replace('T', ' ').substring(0, 10)
        return <span className="text-xs text-ink-500 font-mono">{formatted}</span>
      },
    },
  ]

  if (canManage) {
    columns.push({
      id: 'actions',
      header: () => <div className="text-center">العمليات</div>,
      cell: ({ row }) => {
        const s = row.original
        return (
          <div className="flex items-center justify-center gap-2">
            <SubjectDialog subject={s} currentUserId={currentUserId} />
            <DeleteSubjectDialog subject={s} />
          </div>
        )
      },
    })
  }

  return columns
}
