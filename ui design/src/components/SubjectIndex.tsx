import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { Subject } from '@/types';
import { getSubjectProgress, getLastStudiedLesson } from '@/data/mockData';

interface SubjectIndexProps {
  subject: Subject;
  compact?: boolean;
}

export function SubjectIndex({ subject, compact = false }: SubjectIndexProps) {
  const progress = getSubjectProgress(subject);
  const lastStudied = getLastStudiedLesson(subject.id);
  const Icon = (Icons as any)[subject.icon] || Icons.BookOpen;

  return (
    <Link
      to={`/student/subjects/${subject.id}`}
      className="block border border-border-base rounded-lg bg-bg-surface overflow-hidden transition-base hover:border-ink-muted/30 group"
    >
      <div className="flex items-stretch">
        {/* Visual identity strip */}
        <div
          className="w-1.5 shrink-0"
          style={{ backgroundColor: subject.color }}
        />

        <div className="flex-1 p-4 sm:p-5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                style={{ backgroundColor: subject.colorBg, border: `1px solid ${subject.colorBorder}` }}
              >
                <Icon className="w-[17px] h-[17px]" strokeWidth={1.8} style={{ color: subject.color }} />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-ink-primary group-hover:text-accent transition-base truncate">
                  {subject.name}
                </h3>
                <p className="text-[11px] text-ink-muted truncate">{subject.subtitle}</p>
              </div>
            </div>
            <ChevronLeft className="w-4 h-4 text-ink-muted shrink-0 mt-1 group-hover:text-accent group-hover:-translate-x-0.5 transition-all" />
          </div>

          {!compact && (
            <p className="text-[13px] text-ink-secondary leading-relaxed mb-4 line-clamp-2">
              {subject.description}
            </p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 text-[11px] text-ink-muted">
            <span>{subject.units.length} وحدات</span>
            <span className="text-border-base">·</span>
            <span>{progress.total} دروس</span>
            <span className="text-border-base">·</span>
            <span>{progress.completed} مكتمل</span>
          </div>

          {/* Progress bar */}
          <div className="mt-3">
            <div className="h-1 rounded-full bg-bg-alt overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress.percent}%`, backgroundColor: subject.color }}
              />
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className="text-[11px] text-ink-muted">
                {lastStudied.lesson ? `آخر درس: ${lastStudied.lesson.title}` : 'لم يبدأ'}
              </span>
              <span className="text-[11px] font-medium" style={{ color: subject.color }}>
                {progress.percent}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
