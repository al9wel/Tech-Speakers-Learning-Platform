'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, UserCheck } from 'lucide-react'

const supervisorNavItems = [
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
    href: '/supervisor/profile',
    label: 'الملف الشخصي',
    icon: UserCheck,
    exact: false,
  },
]

export function SupervisorSubNav() {
  const pathname = usePathname()

  return (
    <div className="bg-white/90 backdrop-blur-md border-b border-ink-100 sticky top-16 z-30 shadow-2xs">
      <div className="container-page">
        <nav
          className="flex items-center gap-1.5 sm:gap-2 py-2.5 overflow-x-auto no-scrollbar"
          aria-label="أقسام لوحة الإشراف"
        >
          {supervisorNavItems.map((item) => {
            const Icon = item.icon
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href ||
                (pathname.startsWith(`${item.href}/`) && item.href !== '/supervisor')

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-150 shrink-0 ${
                  isActive
                    ? 'bg-ink-700 text-white shadow-soft'
                    : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-gold' : 'text-ink-400'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
