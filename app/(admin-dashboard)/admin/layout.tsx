import { AdminSubNav } from '@/components/AdminSubNav'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-full">
      <AdminSubNav />
      <div className="flex-1">{children}</div>
    </div>
  )
}
