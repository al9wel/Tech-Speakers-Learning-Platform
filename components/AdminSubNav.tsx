'use client'

import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  Heart,
  ShieldCheck,
} from 'lucide-react'
import { ResponsiveSubNav, type SubNavItem } from './ResponsiveSubNav'

const adminNavItems: SubNavItem[] = [
  {
    href: '/admin',
    label: 'لوحة التحكم',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/admin/users',
    label: 'المستخدمون',
    icon: Users,
    exact: false,
  },
  {
    href: '/admin/students',
    label: 'الطلاب',
    icon: GraduationCap,
    exact: false,
  },
  {
    href: '/admin/teachers',
    label: 'المعلمون',
    icon: BookOpen,
    exact: false,
  },
  {
    href: '/admin/counselors',
    label: 'المستشارون',
    icon: Heart,
    exact: false,
  },
  {
    href: '/admin/supervisors',
    label: 'المشرفون',
    icon: ShieldCheck,
    exact: false,
  },
]

export function AdminSubNav() {
  return (
    <ResponsiveSubNav
      items={adminNavItems}
      roleTitle="الإدارة العامة"
      roleBadge="مشرف عام"
      ariaLabel="أقسام لوحة الإدارة"
    />
  )
}
