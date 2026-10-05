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
    <div className="card flex flex-col items-center justify-center p-8 my-4 text-center border-dashed border-ink-200 bg-cream/30">
      <div className="w-12 h-12 mb-3 flex items-center justify-center rounded-2xl bg-ink-100 text-ink-600">
        <Inbox className="w-6 h-6 stroke-1.5" />
      </div>
      <h3 className="font-heading font-bold text-lg text-ink-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-ink-500 max-w-md mb-4 leading-relaxed">{description}</p>
      )}
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="btn-primary text-sm"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  )
}
