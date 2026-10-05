import React from 'react'

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="card p-6 bg-white shadow-card border-ink-100/80 animate-pulse">
      {/* Top Search & Button Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="h-10 bg-ink-100/80 rounded-xl w-full sm:w-80"></div>
        <div className="h-10 bg-ink-100/80 rounded-xl w-36"></div>
      </div>

      {/* Table Skeleton */}
      <div className="overflow-hidden rounded-xl border border-ink-100">
        <div className="h-12 bg-cream/70 border-b border-ink-100 flex items-center px-4 gap-4">
          <div className="h-4 bg-ink-200/60 rounded w-1/4"></div>
          <div className="h-4 bg-ink-200/60 rounded w-1/4"></div>
          <div className="h-4 bg-ink-200/60 rounded w-1/6"></div>
          <div className="h-4 bg-ink-200/60 rounded w-1/6"></div>
          <div className="h-4 bg-ink-200/60 rounded w-1/6"></div>
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-14 border-b border-ink-100/60 flex items-center px-4 gap-4 bg-white"
          >
            <div className="h-4 bg-ink-100 rounded w-1/4"></div>
            <div className="h-4 bg-ink-100 rounded w-1/4"></div>
            <div className="h-6 bg-ink-100/70 rounded-full w-20"></div>
            <div className="h-4 bg-ink-100 rounded w-1/6"></div>
            <div className="h-7 bg-ink-100 rounded-lg w-24"></div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="container-page py-8 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-ink-200/70"></div>
        <div className="space-y-2">
          <div className="h-6 bg-ink-200/70 rounded-md w-48"></div>
          <div className="h-4 bg-ink-100 rounded-md w-64"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5 bg-white border-ink-100/80">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-ink-100"></div>
              <div className="w-12 h-6 rounded bg-ink-100"></div>
            </div>
            <div className="h-7 bg-ink-200/70 rounded w-16 mb-2"></div>
            <div className="h-4 bg-ink-100 rounded w-24"></div>
          </div>
        ))}
      </div>

      <div className="card p-6 bg-white border-ink-100/80 h-64"></div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="container-page py-10 animate-pulse max-w-2xl">
      <div className="card p-8 bg-white border-ink-100/80 text-center mb-6">
        <div className="w-20 h-20 rounded-full bg-ink-100 mx-auto mb-4"></div>
        <div className="h-6 bg-ink-200/70 rounded w-36 mx-auto mb-3"></div>
        <div className="h-6 bg-ink-100 rounded-full w-24 mx-auto"></div>
      </div>

      <div className="card p-6 bg-white border-ink-100/80 space-y-4 mb-6">
        <div className="h-5 bg-ink-200/70 rounded w-32 mb-4"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="h-10 bg-ink-100 rounded-xl"></div>
          <div className="h-10 bg-ink-100 rounded-xl"></div>
        </div>
        <div className="h-10 bg-ink-200/70 rounded-xl w-32"></div>
      </div>

      <div className="card p-6 bg-white border-ink-100/80 space-y-4">
        <div className="h-5 bg-ink-200/70 rounded w-32 mb-4"></div>
        <div className="h-10 bg-ink-100 rounded-xl max-w-sm"></div>
        <div className="h-10 bg-ink-200/70 rounded-xl w-32"></div>
      </div>
    </div>
  )
}

export function AuthSkeleton() {
  return (
    <div className="container-page py-16 flex items-center justify-center animate-pulse">
      <div className="card p-8 bg-white border-ink-100/80 w-full max-w-md space-y-4">
        <div className="w-12 h-12 rounded-xl bg-ink-100 mx-auto mb-4"></div>
        <div className="h-6 bg-ink-200/70 rounded w-40 mx-auto mb-2"></div>
        <div className="h-4 bg-ink-100 rounded w-56 mx-auto mb-6"></div>
        <div className="space-y-3">
          <div className="h-10 bg-ink-100 rounded-xl"></div>
          <div className="h-10 bg-ink-100 rounded-xl"></div>
          <div className="h-11 bg-ink-200/80 rounded-xl"></div>
        </div>
      </div>
    </div>
  )
}
