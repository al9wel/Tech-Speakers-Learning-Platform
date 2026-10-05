import { TeacherSubNav } from '@/components/TeacherSubNav'

export default function TeacherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-full">
      <TeacherSubNav />
      <div className="flex-1">{children}</div>
    </div>
  )
}
