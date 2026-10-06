import React from 'react'
import Link from 'next/link'
import { Inbox } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description?: string
  actionLabel?: string
  actionHref?: string
}

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="border border-dashed border-border-base rounded-lg bg-bg-surface p-8 sm:p-10 my-4 text-center flex flex-col items-center justify-center">
      <div className="w-10 h-10 mb-3 flex items-center justify-center rounded-md bg-bg-alt text-ink-muted border border-border-subtle">
        <Inbox className="w-5 h-5 stroke-[1.6]" />
      </div>
      <h3 className="font-serif font-bold text-base sm:text-lg text-ink-primary mb-1">{title}</h3>
      {description && (
        <p className="text-xs sm:text-sm text-ink-secondary max-w-sm mb-4 leading-relaxed">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="btn-primary text-xs py-2 px-3.5"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
