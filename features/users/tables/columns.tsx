'use client'

import { ColumnDef } from '@tanstack/react-table'
import type { UserItem } from '../components/UserDialog'
import { UserDialog } from '../components/UserDialog'
import { DeleteUserDialog } from '../components/DeleteUserDialog'
import { ApprovalActions } from '../components/ApprovalActions'
import { ArrowUpDown, Shield, GraduationCap, Users, Heart, ShieldCheck, CheckCircle2, Clock, type LucideIcon } from 'lucide-react'
import type { AppRole } from '@/lib/auth/roles'

const roleBadgeMap: Record<AppRole, { label: string; className: string; icon: LucideIcon }> = {
  admin: { label: 'مشرف عام', className: 'bg-gold/20 text-gold-dark border-gold/30', icon: Shield },
  teacher: { label: 'معلم', className: 'bg-sage-50 text-sage-dark border-sage/30', icon: Users },
  student: { label: 'طالب', className: 'bg-ink-100 text-ink-800 border-ink-200', icon: GraduationCap },
  supervisor: { label: 'مشرف تربوي', className: 'bg-amber-50 text-amber-800 border-amber-200', icon: ShieldCheck },
  counselor: { label: 'مستشار نفسي', className: 'bg-rose-50 text-rose-800 border-rose-200', icon: Heart },
}

export function getColumns(currentAdminId: string): ColumnDef<UserItem>[] {
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
            <span>الاسم الكامل</span>
            <ArrowUpDown className="w-3.5 h-3.5 text-ink-400" />
          </button>
        )
      },
      cell: ({ row }) => {
        const u = row.original
        const isCurrentAdmin = u.id === currentAdminId
        return (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-ink-100 text-ink-700 font-bold text-xs flex items-center justify-center shrink-0">
              {(u.full_name || u.email).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-ink-900 text-sm">
                {u.full_name || <span className="text-ink-400 italic">بدون اسم</span>}
                {isCurrentAdmin && (
                  <span className="mr-2 text-[10px] bg-gold/20 text-gold-dark px-2 py-0.5 rounded-full font-bold">
                    حسابك الحالي
                  </span>
                )}
              </div>
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
      accessorKey: 'role',
      header: 'الدور',
      cell: ({ row }) => {
        const role = row.original.role
        const badge = roleBadgeMap[role] || {
          label: role,
          className: 'bg-ink-100 text-ink-700 border-ink-200',
          icon: Shield,
        }
        const Icon = badge.icon
        return (
          <span
            className={`chip text-xs py-1 px-2.5 border ${badge.className} inline-flex items-center gap-1.5`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{badge.label}</span>
          </span>
        )
      },
    },
    {
      accessorKey: 'is_approved',
      header: 'حالة الحساب',
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
      header: 'تاريخ الإنشاء',
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
              roleLabel={roleBadgeMap[u.role]?.label || 'المستخدم'}
            />
          )
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <UserDialog user={u} />
            <DeleteUserDialog user={u} currentAdminId={currentAdminId} />
          </div>
        )
      },
    },
  ]
}
