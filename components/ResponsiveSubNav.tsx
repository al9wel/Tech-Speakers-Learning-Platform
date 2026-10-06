'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'

export interface SubNavItem {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

interface ResponsiveSubNavProps {
  items: SubNavItem[]
  roleTitle: string
  roleBadge?: string
  ariaLabel?: string
}

export function ResponsiveSubNav({
  items,
  roleTitle,
  roleBadge,
  ariaLabel = 'أقسام الواجهة',
}: ResponsiveSubNavProps) {
  const pathname = usePathname()
  const activeTabRef = useRef<HTMLAnchorElement>(null)

  // Smooth scroll active item into view on mobile bottom bar
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: 'smooth',
        inline: 'center',
        block: 'nearest',
      })
    }
  }, [pathname])

  return (
    <>
      {/* ========================================================
         1. DESKTOP SIDEBAR (الشاشات الكبيرة: سايدبار جانبي أنيق)
         ======================================================== */}
      <aside
        className="hidden lg:flex w-60 xl:w-64 shrink-0 bg-bg-surface border-l border-border-base sticky top-14 sm:top-16 h-[calc(100vh-4rem)] overflow-y-auto flex-col justify-between p-4 z-30 select-none"
        aria-label={ariaLabel}
      >
        <div className="space-y-4">
          {/* Sidebar Header Title */}
          <div className="px-2.5 py-1.5 border-b border-border-subtle flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-ink-primary">
              {roleTitle}
            </span>
            {roleBadge && (
              <span className="chip text-[10px] bg-accent-bg text-accent border-accent/20 font-semibold">
                {roleBadge}
              </span>
            )}
          </div>

          {/* Navigation Items (Vertical Stack) */}
          <nav className="flex flex-col gap-1" aria-label={`${ariaLabel} - القائمة الجانبية`}>
            {items.map((item) => {
              const Icon = item.icon
              const isActive = item.exact
                ? pathname === item.href
                : pathname === item.href ||
                  (pathname.startsWith(`${item.href}/`) && item.href.split('/').length > 2) ||
                  (pathname.startsWith(`${item.href}/`) && item.href !== items[0]?.href)

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-accent-bg text-accent font-semibold border border-accent/25 shadow-2xs'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-bg-alt/70'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-accent' : 'text-ink-muted group-hover:text-ink-primary'
                    }`}
                    strokeWidth={isActive ? 2 : 1.75}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer Academic Watermark */}
        <div className="pt-3 border-t border-border-subtle px-2.5 text-[11px] text-ink-muted/70 flex items-center justify-between">
          <span>منصة مِداد التعليمية</span>
          <span className="font-mono text-[10px]">1448هـ</span>
        </div>
      </aside>

      {/* ========================================================
         2. MOBILE BOTTOM BAR (الشاشات الصغيرة: شريط تحكم سفلي قابل للتمرير)
         ======================================================== */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-bg-surface/95 backdrop-blur-md border-t border-border-base shadow-lg pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]"
        role="navigation"
        aria-label={`${ariaLabel} - شريط التنقل السفلي`}
      >
        <nav
          className="flex items-center gap-1.5 px-3 py-2 overflow-x-auto no-scrollbar touch-pan-x"
        >
          {items.map((item) => {
            const Icon = item.icon
            const isActive = item.exact
              ? pathname === item.href
              : pathname === item.href ||
                (pathname.startsWith(`${item.href}/`) && item.href.split('/').length > 2) ||
                (pathname.startsWith(`${item.href}/`) && item.href !== items[0]?.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                ref={isActive ? activeTabRef : undefined}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shrink-0 transition-all duration-150 ${
                  isActive
                    ? 'bg-accent text-white font-semibold shadow-xs'
                    : 'bg-bg-alt/80 text-ink-secondary hover:text-ink-primary border border-border-subtle active:scale-95'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-ink-muted'}`}
                  strokeWidth={isActive ? 2 : 1.75}
                />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
