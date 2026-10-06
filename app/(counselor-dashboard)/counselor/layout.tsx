import { CounselorSubNav } from '@/components/CounselorSubNav'

export default function CounselorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
      <CounselorSubNav />
      <main className="flex-1 min-w-0 pb-20 lg:pb-8">{children}</main>
    </div>
  )
}
