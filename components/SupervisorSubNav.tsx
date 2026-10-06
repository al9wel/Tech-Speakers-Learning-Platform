'use client'

import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Sparkles,
  Inbox,
  Newspaper,
  UserCheck,
} from 'lucide-react'
import { ResponsiveSubNav, type SubNavItem } from './ResponsiveSubNav'

const supervisorNavItems: SubNavItem[] = [
  {
    href: '/supervisor',
    label: 'لوحة الإشراف',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    href: '/supervisor/subjects',
    label: 'المواد الدراسية',
    icon: BookOpen,
    exact: false,
  },
  {
    href: '/supervisor/lessons',
    label: 'الدروس',
    icon: Layers,
    exact: false,
  },
  {
    href: '/supervisor/contributions',
    label: 'مساهمات الطلاب',
    icon: Sparkles,
    exact: false,
  },
  {
    href: '/supervisor/suggestions',
    label: 'مقترحات الطلاب',
    icon: Inbox,
    exact: false,
  },
  {
    href: '/supervisor/articles',
    label: 'الأخبار والمقالات',
    icon: Newspaper,
    exact: false,
  },
  {
    href: '/supervisor/profile',
    label: 'الملف الشخصي',
    icon: UserCheck,
    exact: false,
  },
]

export function SupervisorSubNav() {
  return (
    <ResponsiveSubNav
      items={supervisorNavItems}
      roleTitle="بوابة الإشراف"
      roleBadge="مشرف تربوي"
      ariaLabel="أقسام لوحة الإشراف"
    />
  )
}
