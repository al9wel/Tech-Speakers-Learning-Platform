import { StudentSubNav } from '@/components/StudentSubNav'

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-full">
      <StudentSubNav />
      <div className="flex-1">{children}</div>
    </div>
  )
}
