'use client'

import {
  LayoutDashboard,
  BookOpen,
  UserCheck,
  Sparkles,
  MessageSquareText,
  Newspaper,
  HeartHandshake,
} from 'lucide-react'
import { ResponsiveSubNav, type SubNavItem } from './ResponsiveSubNav'

const studentNavItems: SubNavItem[] = [
  {
    href: '/student',
    label: 'لوحة الطالب',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/student/subjects',
    label: 'المواد الدراسية',
    icon: BookOpen,
    exact: false,
  },
  {
    href: '/student/contributions',
    label: 'مساهمات الطلاب',
    icon: Sparkles,
    exact: false,
  },
  {
    href: '/student/suggestions',
    label: 'المقترحات',
    icon: MessageSquareText,
    exact: false,
  },
  {
    href: '/student/counseling',
    label: 'المستشار النفسي',
    icon: HeartHandshake,
    exact: false,
  },
  {
    href: '/student/articles',
    label: 'الأخبار والمقالات',
    icon: Newspaper,
    exact: false,
  },
  {
    href: '/student/profile',
    label: 'الملف الشخصي',
    icon: UserCheck,
    exact: false,
  },
]

export function StudentSubNav() {
  return (
    <ResponsiveSubNav
      items={studentNavItems}
      roleTitle="بوابة الطالب"
      roleBadge="طالب"
      ariaLabel="أقسام واجهة الطالب"
    />
  )
}
