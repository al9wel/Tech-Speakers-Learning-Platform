import { useParams, Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { Check, Lock, Play, Circle, Clock, ArrowLeft, ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { getSubjectById, getSubjectProgress, getUnitProgress } from '@/data/mockData';
import { useState } from 'react';
import type { LessonStatus } from '@/types';

const statusConfig: Record<LessonStatus, { icon: typeof Check; label: string }> = {
  completed: { icon: Check, label: 'مكتمل' },
  current: { icon: Play, label: 'حالي' },
  upcoming: { icon: Circle, label: 'قادم' },
  locked: { icon: Lock, label: 'مقفل' },
};

export function SubjectDetailPage() {
  const { subject: subjectId } = useParams();
  const subject = getSubjectById(subjectId || '');
  const [expandedUnits, setExpandedUnits] = useState<Set<string>>(new Set());

  if (!subject) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-16 text-center">
        <h1 className="font-serif text-xl font-bold text-ink-primary mb-2">المادة غير موجودة</h1>
        <p className="text-sm text-ink-secondary mb-4">المادة التي تبحث عنها غير موجودة.</p>
        <Link to="/student/subjects" className="text-sm font-medium text-accent hover:text-accent-light">
          → العودة إلى المواد
        </Link>
      </div>
    );
  }

  const progress = getSubjectProgress(subject);
  const Icon = (Icons as any)[subject.icon] || Icons.BookOpen;

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => {
      const next = new Set(prev);
      if (next.has(unitId)) next.delete(unitId);
      else next.add(unitId);
      return next;
    });
  };

  const unitsWithCurrent = subject.units.filter((u) => u.lessons.some((l) => l.status === 'current'));
  const effectiveExpanded = expandedUnits.size > 0
    ? expandedUnits
    : new Set(unitsWithCurrent.map((u) => u.id));

  return (
    <div className="animate-fade-in">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <PageHeader
          title={subject.name}
          subtitle={subject.description}
          breadcrumbs={[
            { label: 'المواد', path: '/student/subjects' },
            { label: subject.name },
          ]}
        />

        <div className="border border-border-base rounded-lg bg-bg-surface overflow-hidden mb-6">
          <div className="flex items-stretch">
            <div className="w-1.5 shrink-0" style={{ backgroundColor: subject.color }} />
            <div className="flex-1 p-5">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className="w-10 h-10 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: subject.colorBg, border: `1px solid ${subject.colorBorder}` }}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.8} style={{ color: subject.color }} />
                </div>
                <div className="flex-1">
                  <h2 className="font-serif text-lg font-bold text-ink-primary">{subject.name}</h2>
                  <p className="text-[13px] text-ink-muted">{subject.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex-1">
                  <div className="h-1.5 rounded-full bg-bg-alt overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress.percent}%`, backgroundColor: subject.color }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5 text-[11px] text-ink-muted">
                    <span>{progress.completed} من {progress.total} دروس مكتملة</span>
                    <span className="font-medium" style={{ color: subject.color }}>{progress.percent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {subject.units.map((unit, unitIdx) => {
            const unitProgress = getUnitProgress(unit);
            const isExpanded = effectiveExpanded.has(unit.id);

            return (
              <div key={unit.id} className="border border-border-base rounded-lg bg-bg-surface overflow-hidden">
                <button
                  onClick={() => toggleUnit(unit.id)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-right transition-base hover:bg-bg-alt/30"
                >
                  <div className="shrink-0 w-8 h-8 rounded-md border border-border-base bg-bg-alt flex items-center justify-center text-[12px] font-semibold text-ink-secondary">
                    {unitIdx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-ink-primary">{unit.title}</h3>
                    <p className="text-[12px] text-ink-secondary mt-0.5 line-clamp-1">{unit.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-left">
                      <div className="text-[11px] text-ink-muted">{unitProgress.completed}/{unitProgress.total} دروس</div>
                      <div className="text-[11px] font-medium" style={{ color: subject.color }}>{unitProgress.percent}%</div>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-ink-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border-subtle">
                    {unit.lessons.map((lesson, lessonIdx) => {
                      const config = statusConfig[lesson.status];
                      const StatusIcon = config.icon;
                      const isLocked = lesson.status === 'locked';
                      const isLast = lessonIdx === unit.lessons.length - 1;

                      return (
                        <Link
                          key={lesson.id}
                          to={isLocked ? '#' : `/student/lesson/${lesson.id}`}
                          onClick={isLocked ? (e) => e.preventDefault() : undefined}
                          className={`flex items-center gap-3 px-5 py-3 transition-base group ${
                            isLocked ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bg-alt/40'
                          } ${isLast ? '' : 'border-b border-border-subtle'}`}
                        >
                          <div
                            className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              lesson.status === 'completed'
                                ? 'bg-success-bg border-success/40'
                                : lesson.status === 'current'
                                ? 'bg-accent border-accent'
                                : lesson.status === 'locked'
                                ? 'bg-bg-base border-border-subtle'
                                : 'bg-bg-surface border-border-base'
                            }`}
                          >
                            <StatusIcon
                              className={`w-3 h-3 ${
                                lesson.status === 'completed'
                                  ? 'text-success'
                                  : lesson.status === 'current'
                                  ? 'text-white'
                                  : 'text-ink-muted'
                              }`}
                              strokeWidth={2.5}
                              fill={lesson.status === 'completed' ? 'currentColor' : 'none'}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className={`text-sm transition-base ${
                              lesson.status === 'current'
                                ? 'font-semibold text-ink-primary'
                                : isLocked
                                ? 'font-medium text-ink-muted'
                                : 'font-medium text-ink-secondary group-hover:text-accent'
                            }`}>
                              {lesson.title}
                            </h4>
                            <p className="text-[12px] text-ink-muted mt-0.5 line-clamp-1">{lesson.description}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="flex items-center gap-1 text-[11px] text-ink-muted">
                              <Clock className="w-3 h-3" />
                              {lesson.estimatedMinutes}د
                            </span>
                            {lesson.status === 'current' && (
                              <span className="text-[10px] font-semibold text-accent">الآن</span>
                            )}
                            {!isLocked && lesson.status !== 'current' && (
                              <ArrowLeft className="w-3.5 h-3.5 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
