'use client'

import {
  LayoutDashboard,
  BookOpen,
  HelpCircle,
  Newspaper,
  UserCheck,
} from 'lucide-react'
import { ResponsiveSubNav, type SubNavItem } from './ResponsiveSubNav'

const teacherNavItems: SubNavItem[] = [
  {
    href: '/teacher',
    label: 'لوحة التحكم',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/teacher/lessons',
    label: 'دروسي التعليمية',
    icon: BookOpen,
    exact: false,
  },
  {
    href: '/teacher/questions',
    label: 'بنك الأسئلة',
    icon: HelpCircle,
    exact: false,
  },
  {
    href: '/teacher/articles',
    label: 'الأخبار والمقالات',
    icon: Newspaper,
    exact: false,
  },
  {
    href: '/teacher/profile',
    label: 'الملف الشخصي',
    icon: UserCheck,
    exact: false,
  },
]

export function TeacherSubNav() {
  return (
    <ResponsiveSubNav
      items={teacherNavItems}
      roleTitle="بوابة المعلم"
      roleBadge="معلم"
      ariaLabel="أقسام واجهة المعلم"
    />
  )
}
