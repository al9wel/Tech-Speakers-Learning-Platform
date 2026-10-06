import React from 'react'

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="border border-border-base rounded-lg p-4 sm:p-5 bg-bg-surface animate-pulse max-w-full overflow-hidden">
      {/* Top Search & Button Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-5">
        <div className="h-9 bg-bg-alt rounded-md w-full sm:w-72"></div>
        <div className="h-9 bg-bg-alt rounded-md w-full sm:w-32"></div>
      </div>

      {/* Table Skeleton with scroll containment */}
      <div className="overflow-x-auto rounded-md border border-border-base max-w-full">
        <div className="min-w-[500px]">
          <div className="h-10 bg-bg-alt/70 border-b border-border-base flex items-center px-4 gap-4">
            <div className="h-3.5 bg-border-base rounded flex-1"></div>
            <div className="h-3.5 bg-border-base rounded flex-1"></div>
            <div className="h-3.5 bg-border-base rounded w-16"></div>
            <div className="h-3.5 bg-border-base rounded w-16"></div>
            <div className="h-3.5 bg-border-base rounded w-16"></div>
          </div>
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="h-12 border-b border-border-subtle flex items-center px-4 gap-4 bg-bg-surface"
            >
              <div className="h-3.5 bg-bg-alt rounded flex-1"></div>
              <div className="h-3.5 bg-bg-alt rounded flex-1"></div>
              <div className="h-5 bg-bg-alt rounded-md w-16"></div>
              <div className="h-3.5 bg-bg-alt rounded w-16"></div>
              <div className="h-6 bg-bg-alt rounded-md w-16"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <div className="container-page py-6 sm:py-8 animate-pulse">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-md bg-bg-alt"></div>
        <div className="space-y-1.5">
          <div className="h-5 bg-bg-alt rounded w-44"></div>
          <div className="h-3.5 bg-border-subtle rounded w-56"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="border border-border-base rounded-lg p-4 bg-bg-surface">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-md bg-bg-alt"></div>
              <div className="w-10 h-4 rounded bg-bg-alt"></div>
            </div>
            <div className="h-6 bg-border-base rounded w-14 mb-1.5"></div>
            <div className="h-3 bg-bg-alt rounded w-20"></div>
          </div>
        ))}
      </div>

      <div className="border border-border-base rounded-lg p-5 bg-bg-surface h-56"></div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="container-page py-8 animate-pulse max-w-2xl">
      <div className="border border-border-base rounded-lg p-6 bg-bg-surface text-center mb-5">
        <div className="w-16 h-16 rounded-full bg-bg-alt mx-auto mb-3"></div>
        <div className="h-5 bg-border-base rounded w-32 mx-auto mb-2"></div>
        <div className="h-5 bg-bg-alt rounded-md w-20 mx-auto"></div>
      </div>

      <div className="border border-border-base rounded-lg p-5 bg-bg-surface space-y-3.5 mb-5">
        <div className="h-4 bg-border-base rounded w-28 mb-3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="h-9 bg-bg-alt rounded-md"></div>
          <div className="h-9 bg-bg-alt rounded-md"></div>
        </div>
        <div className="h-9 bg-border-base rounded-md w-28"></div>
      </div>

      <div className="border border-border-base rounded-lg p-5 bg-bg-surface space-y-3.5">
        <div className="h-4 bg-border-base rounded w-28 mb-3"></div>
        <div className="h-9 bg-bg-alt rounded-md max-w-sm"></div>
        <div className="h-9 bg-border-base rounded-md w-28"></div>
      </div>
    </div>
  )
}

export function AuthSkeleton() {
  return (
    <div className="container-page py-12 flex items-center justify-center animate-pulse">
      <div className="border border-border-base rounded-lg p-6 sm:p-8 bg-bg-surface w-full max-w-md space-y-4 shadow-sm">
        <div className="w-10 h-10 rounded-md bg-bg-alt mx-auto mb-3"></div>
        <div className="h-5 bg-border-base rounded w-36 mx-auto mb-1.5"></div>
        <div className="h-3.5 bg-bg-alt rounded w-48 mx-auto mb-5"></div>
        <div className="space-y-2.5">
          <div className="h-9 bg-bg-alt rounded-md"></div>
          <div className="h-9 bg-bg-alt rounded-md"></div>
          <div className="h-9 bg-border-base rounded-md"></div>
        </div>
      </div>
    </div>
  )
}
