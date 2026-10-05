import { SupervisorSubNav } from '@/components/SupervisorSubNav'

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-full">
      <SupervisorSubNav />
      <div className="flex-1">{children}</div>
    </div>
  )
}
