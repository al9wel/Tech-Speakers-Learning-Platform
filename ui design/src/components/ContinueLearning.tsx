import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { getCurrentLesson } from '@/data/mockData';
import type { Lesson } from '@/types';

export function ContinueLearning() {
  const { lesson, subject, unit } = getCurrentLesson();

  if (!lesson || !subject || !unit) {
    return null;
  }

  const pathSteps = [
    { label: subject.name, link: `/student/subjects/${subject.id}` },
    { label: unit.title, link: `/student/subjects/${subject.id}` },
  ];

  const lessonIdx = unit.lessons.findIndex((l) => l.id === lesson.id);
  const completedInUnit = unit.lessons.filter((l: Lesson) => l.status === 'completed').length;

  return (
    <div className="border border-border-base rounded-lg bg-bg-surface overflow-hidden">
      <div className="p-5 sm:p-6">
        <div className="flex items-center gap-2 text-[11px] font-medium text-ink-muted mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          متابعة التعلم
        </div>

        {/* Breadcrumb path */}
        <div className="flex items-center gap-1.5 text-[13px] mb-3 flex-wrap">
          {pathSteps.map((step, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              <Link
                to={step.link}
                className="text-ink-secondary hover:text-accent transition-base font-medium"
              >
                {step.label}
              </Link>
              <span className="text-ink-muted">←</span>
            </span>
          ))}
          <span className="text-ink-primary font-semibold">{lesson.title}</span>
        </div>

        <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink-primary mb-2">
          {lesson.title}
        </h2>
        <p className="text-sm text-ink-secondary leading-relaxed mb-5 max-w-2xl">
          {lesson.description}
        </p>

        {/* Progress timeline */}
        <div className="mb-5">
          <div className="flex items-center gap-1.5 mb-2">
            {unit.lessons.map((l: Lesson, idx: number) => (
              <Link
                key={l.id}
                to={l.status !== 'locked' ? `/student/lesson/${l.id}` : '#'}
                className={`h-1.5 rounded-full transition-all relative group ${
                  l.status === 'completed'
                    ? 'bg-success flex-1'
                    : l.status === 'current'
                    ? 'bg-accent flex-[2]'
                    : l.status === 'upcoming'
                    ? 'bg-border-base flex-1'
                    : 'bg-border-subtle flex-1'
                }`}
                title={l.title}
              >
                {l.status === 'current' && (
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-accent whitespace-nowrap">
                    أنت هنا
                  </span>
                )}
              </Link>
            ))}
          </div>
          <div className="flex items-center justify-between text-[11px] text-ink-muted">
            <span>{completedInUnit} من {unit.lessons.length} دروس مكتملة</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {lesson.estimatedMinutes} دقيقة متبقية
            </span>
          </div>
        </div>

        {/* CTA */}
        <Link
          to={`/student/lesson/${lesson.id}`}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-light transition-base group"
        >
          متابعة الدرس
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
