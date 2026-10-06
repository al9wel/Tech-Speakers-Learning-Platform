'use client'

import {
  LayoutDashboard,
  Newspaper,
  UserCheck,
  MessageSquareText,
} from 'lucide-react'
import { ResponsiveSubNav, type SubNavItem } from './ResponsiveSubNav'

const counselorNavItems: SubNavItem[] = [
  {
    href: '/counselor',
    label: 'لوحة المستشار',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/counselor/students',
    label: 'التواصل مع الطلاب',
    icon: MessageSquareText,
    exact: false,
  },
  {
    href: '/counselor/articles',
    label: 'الأخبار والمقالات',
    icon: Newspaper,
    exact: false,
  },
  {
    href: '/counselor/profile',
    label: 'الملف الشخصي',
    icon: UserCheck,
    exact: false,
  },
]

export function CounselorSubNav() {
  return (
    <ResponsiveSubNav
      items={counselorNavItems}
      roleTitle="بوابة الإرشاد النفسي"
      roleBadge="مستشار"
      ariaLabel="أقسام لوحة المستشار"
    />
  )
}
