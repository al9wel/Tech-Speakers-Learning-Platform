import { CounselorSubNav } from '@/components/CounselorSubNav'

export default function CounselorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-full">
      <CounselorSubNav />
      <div className="flex-1">{children}</div>
    </div>
  )
}
