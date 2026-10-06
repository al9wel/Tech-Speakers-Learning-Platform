import { Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { ContinueLearning } from '@/components/ContinueLearning';
import { SubjectIndex } from '@/components/SubjectIndex';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { subjects, activities, getCurrentLesson } from '@/data/mockData';
import type { Lesson } from '@/types';

export function MyLearningPage() {
  const { lesson: currentLesson, subject: currentSubject, unit: currentUnit } = getCurrentLesson();

  return (
    <div className="animate-fade-in">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <PageHeader
          title="تعليمي"
          subtitle="تابع تقدمك في جميع المواد المسجلة وواصل من حيث توقفت."
        />

        <div className="space-y-8">
          <section>
            <ContinueLearning />
          </section>

          {currentLesson && currentSubject && currentUnit && (
            <section>
              <h2 className="font-serif text-lg font-bold text-ink-primary mb-4">تدرس حالياً</h2>
              <div className="border border-border-base rounded-lg bg-bg-surface overflow-hidden">
                <div className="p-5 border-b border-border-subtle">
                  <div className="flex items-center gap-2 text-[11px] font-medium text-ink-muted mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    مادة نشطة
                  </div>
                  <Link
                    to={`/student/subjects/${currentSubject.id}`}
                    className="font-serif text-lg font-bold text-ink-primary hover:text-accent transition-base"
                  >
                    {currentSubject.name}
                  </Link>
                  <p className="text-sm text-ink-secondary mt-1">{currentUnit.title} · {currentUnit.description}</p>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-ink-primary">دروس هذه الوحدة</span>
                    <Link
                      to={`/student/subjects/${currentSubject.id}`}
                      className="text-[12px] text-accent hover:text-accent-light transition-base flex items-center gap-1 font-medium"
                    >
                      عرض المنهج كاملاً
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                  <div className="space-y-0.5">
                    {currentUnit.lessons.map((lesson: Lesson, idx: number) => (
                      <Link
                        key={lesson.id}
                        to={lesson.status !== 'locked' ? `/student/lesson/${lesson.id}` : '#'}
                        onClick={lesson.status === 'locked' ? (e) => e.preventDefault() : undefined}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-base ${
                          lesson.status === 'locked' ? 'opacity-50 cursor-not-allowed' : 'hover:bg-bg-alt/50 group'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                          lesson.status === 'completed'
                            ? 'bg-success-bg border-success/30 text-success'
                            : lesson.status === 'current'
                            ? 'bg-accent border-accent text-white'
                            : lesson.status === 'locked'
                            ? 'bg-bg-base border-border-subtle text-ink-muted'
                            : 'bg-bg-surface border-border-base text-ink-muted'
                        }`}>
                          {lesson.status === 'completed' ? '✓' : lesson.status === 'current' ? '●' : idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm ${lesson.status === 'current' ? 'font-semibold text-ink-primary' : 'font-medium text-ink-secondary group-hover:text-accent'} transition-base`}>
                            {lesson.title}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] text-ink-muted shrink-0">
                          <Clock className="w-3 h-3" />
                          {lesson.estimatedMinutes}د
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          <section>
            <h2 className="font-serif text-lg font-bold text-ink-primary mb-4">كل المواد</h2>
            <div className="space-y-3">
              {subjects.map((subject) => (
                <SubjectIndex key={subject.id} subject={subject} />
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-serif text-lg font-bold text-ink-primary mb-4">النشاط الأخير</h2>
            <div className="border border-border-base rounded-lg bg-bg-surface p-5">
              <ActivityTimeline activities={activities} maxItems={8} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
