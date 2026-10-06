import { Link } from 'react-router-dom';
import { Check, Lock, Circle, Play } from 'lucide-react';
import type { Lesson, Unit, Subject } from '@/types';

interface CurriculumPathProps {
  subject: Subject;
  unit: Unit;
  currentLessonId?: string;
  compact?: boolean;
}

const statusConfig = {
  completed: { icon: Check, color: 'text-success', bg: 'bg-success', border: 'border-success' },
  current: { icon: Play, color: 'text-accent', bg: 'bg-accent', border: 'border-accent' },
  upcoming: { icon: Circle, color: 'text-ink-muted', bg: 'bg-ink-muted', border: 'border-border-base' },
  locked: { icon: Lock, color: 'text-locked', bg: 'bg-locked', border: 'border-border-subtle' },
};

export function CurriculumPath({ subject, unit, currentLessonId, compact = false }: CurriculumPathProps) {
  return (
    <div className="space-y-0">
      {unit.lessons.map((lesson, idx) => {
        const config = statusConfig[lesson.status];
        const isCurrent = currentLessonId ? lesson.id === currentLessonId : lesson.status === 'current';
        const isLast = idx === unit.lessons.length - 1;
        const Icon = config.icon;

        return (
          <div key={lesson.id} className="flex gap-3 group">
            {/* Timeline rail */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`relative z-10 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-base ${
                  isCurrent
                    ? 'bg-accent border-accent shadow-[0_0_0_4px_var(--accent-bg)]'
                    : lesson.status === 'completed'
                    ? 'bg-success-bg border-success'
                    : lesson.status === 'locked'
                    ? 'bg-bg-base border-border-subtle'
                    : 'bg-bg-surface border-border-base'
                } group-hover:border-accent-light`}
              >
                <Icon
                  className={`w-3 h-3 ${
                    isCurrent
                      ? 'text-white'
                      : lesson.status === 'completed'
                      ? 'text-success'
                      : lesson.status === 'locked'
                      ? 'text-locked'
                      : 'text-ink-muted'
                  }`}
                  strokeWidth={2.5}
                  fill={lesson.status === 'completed' ? 'currentColor' : 'none'}
                />
              </div>
              {!isLast && (
                <div
                  className={`w-px flex-1 min-h-[20px] my-1 ${
                    lesson.status === 'completed' ? 'bg-success/40' : 'bg-border-base'
                  }`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 ${isLast ? '' : 'pb-5'} ${compact ? '' : ''}`}>
              <Link
                to={`/student/lesson/${lesson.id}`}
                className={`block ${lesson.status === 'locked' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className={`flex items-baseline justify-between gap-2 ${isCurrent ? '' : ''}`}>
                  <h4
                    className={`text-sm ${
                      isCurrent
                        ? 'font-semibold text-ink-primary'
                        : lesson.status === 'completed'
                        ? 'font-medium text-ink-secondary'
                        : lesson.status === 'locked'
                        ? 'font-medium text-ink-muted'
                        : 'font-medium text-ink-primary'
                    } group-hover:text-accent transition-base`}
                  >
                    {lesson.title}
                  </h4>
                  {isCurrent && (
                    <span className="text-[10px] font-semibold text-accent shrink-0">
                      الحالي
                    </span>
                  )}
                </div>
                {!compact && (
                  <p className={`text-[13px] mt-0.5 ${
                    lesson.status === 'locked' ? 'text-ink-muted' : 'text-ink-secondary'
                  }`}>
                    {lesson.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[11px] text-ink-muted">{lessonTypeLabels[lesson.type]}</span>
                  <span className="text-ink-muted text-[11px]">·</span>
                  <span className="text-[11px] text-ink-muted">{lesson.estimatedMinutes} دقيقة</span>
                </div>
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const lessonTypeLabels: Record<string, string> = {
  reading: 'قراءة',
  exercise: 'تمرين',
  video: 'فيديو',
  discussion: 'نقاش',
  assessment: 'تقييم',
};
