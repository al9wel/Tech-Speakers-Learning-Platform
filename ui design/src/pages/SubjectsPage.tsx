import { PageHeader } from '@/components/PageHeader';
import { SubjectIndex } from '@/components/SubjectIndex';
import { subjects, getSubjectProgress } from '@/data/mockData';

export function SubjectsPage() {
  const totalLessons = subjects.reduce((acc, s) => acc + getSubjectProgress(s).total, 0);
  const totalCompleted = subjects.reduce((acc, s) => acc + getSubjectProgress(s).completed, 0);
  const overallPercent = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return (
    <div className="animate-fade-in">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <PageHeader
          title="المواد"
          subtitle="منهجك الكامل، منظم حسب المادة والوحدة والدرس."
        />

        <div className="flex items-center gap-6 py-4 px-5 mb-6 border border-border-base rounded-lg bg-bg-surface">
          <div>
            <div className="text-[11px] text-ink-muted font-medium">المواد</div>
            <div className="font-serif text-2xl font-bold text-ink-primary">{subjects.length}</div>
          </div>
          <div className="h-8 w-px bg-border-subtle" />
          <div>
            <div className="text-[11px] text-ink-muted font-medium">إجمالي الدروس</div>
            <div className="font-serif text-2xl font-bold text-ink-primary">{totalLessons}</div>
          </div>
          <div className="h-8 w-px bg-border-subtle" />
          <div>
            <div className="text-[11px] text-ink-muted font-medium">مكتمل</div>
            <div className="font-serif text-2xl font-bold text-ink-primary">{totalCompleted}</div>
          </div>
          <div className="h-8 w-px bg-border-subtle hidden sm:block" />
          <div className="hidden sm:block">
            <div className="text-[11px] text-ink-muted font-medium">الإجمالي</div>
            <div className="font-serif text-2xl font-bold text-accent">{overallPercent}%</div>
          </div>
        </div>

        <div className="space-y-3">
          {subjects.map((subject) => (
            <SubjectIndex key={subject.id} subject={subject} />
          ))}
        </div>
      </div>
    </div>
  );
}
