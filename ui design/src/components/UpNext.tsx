import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import * as Icons from 'lucide-react';
import type { Lesson, Subject, Unit } from '@/types';

interface UpNextProps {
  lesson: Lesson;
  subject: Subject;
  unit: Unit;
}

const lessonTypeLabels: Record<string, string> = {
  reading: 'قراءة',
  exercise: 'تمرين',
  video: 'فيديو',
  discussion: 'نقاش',
  assessment: 'تقييم',
};

export function UpNext({ lesson, subject, unit }: UpNextProps) {
  const Icon = (Icons as any)[subject.icon] || Icons.BookOpen;

  return (
    <div className="border border-border-base rounded-lg bg-bg-surface p-4">
      <div className="flex items-center gap-2 text-[11px] font-medium text-ink-muted mb-3">
        الدرس التالي
      </div>

      <div className="flex items-center gap-2.5 mb-3">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
          style={{ backgroundColor: subject.colorBg, border: `1px solid ${subject.colorBorder}` }}
        >
          <Icon className="w-4 h-4" strokeWidth={1.8} style={{ color: subject.color }} />
        </div>
        <div className="text-[11px] text-ink-muted">
          {subject.name} · {unit.title}
        </div>
      </div>

      <h4 className="text-sm font-semibold text-ink-primary mb-1.5">{lesson.title}</h4>
      <p className="text-[12px] text-ink-secondary leading-relaxed mb-3 line-clamp-2">{lesson.description}</p>

      <div className="flex items-center gap-3 mb-3">
        <span className="flex items-center gap-1 text-[11px] text-ink-muted">
          <Clock className="w-3 h-3" />
          {lesson.estimatedMinutes} دقيقة
        </span>
        <span className="text-[11px] text-ink-muted">{lessonTypeLabels[lesson.type]}</span>
      </div>

      <Link
        to={`/student/lesson/${lesson.id}`}
        className="flex items-center justify-between px-3 py-2 text-sm font-medium text-accent border border-accent/30 rounded-md hover:bg-accent-bg transition-base group"
      >
        ابدأ الدرس
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
}
