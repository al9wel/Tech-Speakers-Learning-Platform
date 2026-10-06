import { Link } from 'react-router-dom';
import { Clock, BookText, PenLine, Video, MessageCircle, FileCheck, Check, Lock, Circle } from 'lucide-react';
import type { Lesson, Subject, Unit, LessonType } from '@/types';

interface LessonRowProps {
  lesson: Lesson;
  subject: Subject;
  unit: Unit;
  showSubject?: boolean;
}

const typeIcons: Record<LessonType, typeof BookText> = {
  reading: BookText,
  exercise: PenLine,
  video: Video,
  discussion: MessageCircle,
  assessment: FileCheck,
};

const typeLabels: Record<LessonType, string> = {
  reading: 'قراءة',
  exercise: 'تمرين',
  video: 'فيديو',
  discussion: 'نقاش',
  assessment: 'تقييم',
};

const statusLabels = {
  completed: 'مكتمل',
  current: 'قيد التقدم',
  upcoming: 'قادم',
  locked: 'مقفل',
};

export function LessonRow({ lesson, subject, unit, showSubject = false }: LessonRowProps) {
  const Icon = typeIcons[lesson.type];
  const isLocked = lesson.status === 'locked';

  const StatusIcon = lesson.status === 'completed' ? Check : lesson.status === 'locked' ? Lock : Circle;

  return (
    <Link
      to={isLocked ? '#' : `/student/lesson/${lesson.id}`}
      className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 border-b border-border-subtle last:border-b-0 transition-base group ${
        isLocked ? 'cursor-not-allowed opacity-60' : 'hover:bg-bg-alt/50'
      }`}
      onClick={isLocked ? (e) => e.preventDefault() : undefined}
    >
      {/* Type icon */}
      <div className={`shrink-0 w-9 h-9 rounded-md flex items-center justify-center border ${isLocked ? 'bg-bg-base border-border-subtle' : ''}`} style={!isLocked ? { backgroundColor: subject.colorBg, borderColor: subject.colorBorder } : {}}>
        <Icon className="w-[17px] h-[17px]" strokeWidth={1.8} style={{ color: isLocked ? undefined : subject.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {showSubject && (
              <div className="text-[11px] font-medium text-ink-muted mb-0.5">
                {subject.name} · {unit.title}
              </div>
            )}
            <h3 className={`text-sm font-medium ${isLocked ? 'text-ink-muted' : 'text-ink-primary group-hover:text-accent'} transition-base`}>
              {lesson.title}
            </h3>
            <p className="text-[13px] text-ink-secondary mt-0.5 line-clamp-1">{lesson.description}</p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center gap-3 mt-2">
          <span className="flex items-center gap-1 text-[11px] text-ink-muted">
            <Clock className="w-3 h-3" />
            {lesson.estimatedMinutes} دقيقة
          </span>
          <span className="flex items-center gap-1 text-[11px]" style={{ color: lesson.status === 'current' ? subject.color : undefined }}>
            <StatusIcon
              className="w-3 h-3"
              strokeWidth={2}
              fill={lesson.status === 'completed' ? 'currentColor' : 'none'}
              style={{ color: lesson.status === 'completed' ? 'var(--success)' : undefined }}
            />
            {statusLabels[lesson.status]}
          </span>
        </div>
      </div>
    </Link>
  );
}
