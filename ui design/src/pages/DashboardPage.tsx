import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, BookText, PenLine, Video, MessageCircle, FileCheck } from 'lucide-react';
import { ContinueLearning } from '@/components/ContinueLearning';
import { ActivityTimeline } from '@/components/ActivityTimeline';
import { SubjectIndex } from '@/components/SubjectIndex';
import { UpNext } from '@/components/UpNext';
import { StudyStreak } from '@/components/StudyStreak';
import { subjects, activities, getTodaysLessons, getNextLesson, getCurrentLesson } from '@/data/mockData';
import type { LessonType } from '@/types';

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

export function DashboardPage() {
  const todaysLessons = getTodaysLessons();
  const { lesson: currentLesson, subject: currentSubject, unit: currentUnit } = getCurrentLesson();
  const next = currentLesson && currentSubject ? getNextLesson(currentSubject.id, currentLesson.id) : { lesson: undefined, unit: undefined };

  return (
    <div className="animate-fade-in">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] font-medium text-ink-muted mb-1.5">
              الأربعاء، 6 أكتوبر
            </div>
            <h1 className="font-serif text-2xl sm:text-[28px] font-bold text-ink-primary leading-tight">
              منهجك الدراسي في لمحة
            </h1>
          </div>
          <Link
            to="/student/learning"
            className="text-sm font-medium text-accent hover:text-accent-light transition-base flex items-center gap-1"
          >
            عرض كل التعلم
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 lg:gap-6">
          <div className="space-y-6 min-w-0">
            <ContinueLearning />

            <section>
              <div className="flex items-end justify-between mb-4">
                <h2 className="font-serif text-lg font-bold text-ink-primary">تعلم اليوم</h2>
                <span className="text-[11px] text-ink-muted">{todaysLessons.length} أنشطة</span>
              </div>
              <div className="border border-border-base rounded-lg bg-bg-surface overflow-hidden">
                {todaysLessons.map((item, idx) => {
                  const Icon = typeIcons[item.lesson.type];
                  const isLast = idx === todaysLessons.length - 1;
                  return (
                    <Link
                      key={`${item.subject.id}-${item.lesson.id}`}
                      to={`/student/lesson/${item.lesson.id}`}
                      className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 transition-base hover:bg-bg-alt/50 group ${isLast ? '' : 'border-b border-border-subtle'}`}
                    >
                      <div
                        className="shrink-0 w-9 h-9 rounded-md flex items-center justify-center border"
                        style={{ backgroundColor: item.subject.colorBg, borderColor: item.subject.colorBorder }}
                      >
                        <Icon className="w-[17px] h-[17px]" strokeWidth={1.8} style={{ color: item.subject.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-medium text-ink-muted mb-0.5">
                          {item.subject.name} · {item.unit.title}
                        </div>
                        <h3 className="text-sm font-medium text-ink-primary group-hover:text-accent transition-base">
                          {item.lesson.title}
                        </h3>
                        <p className="text-[13px] text-ink-secondary mt-0.5 line-clamp-1">{item.lesson.description}</p>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="flex items-center gap-1 text-[11px] text-ink-muted">
                            <Clock className="w-3 h-3" />
                            {item.lesson.estimatedMinutes} دقيقة
                          </span>
                          <span className="text-[11px] text-ink-muted">{typeLabels[item.lesson.type]}</span>
                          {item.lesson.status === 'current' && (
                            <span className="text-[11px] font-medium text-accent">قيد التقدم</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            <section>
              <div className="flex items-end justify-between mb-4">
                <h2 className="font-serif text-lg font-bold text-ink-primary">موادك</h2>
                <Link
                  to="/student/subjects"
                  className="text-sm font-medium text-accent hover:text-accent-light transition-base flex items-center gap-1"
                >
                  كل المواد
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
              <div className="space-y-3">
                {subjects.slice(0, 4).map((subject) => (
                  <SubjectIndex key={subject.id} subject={subject} compact />
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-serif text-lg font-bold text-ink-primary mb-4">النشاط الأخير</h2>
              <div className="border border-border-base rounded-lg bg-bg-surface p-5">
                <ActivityTimeline activities={activities} maxItems={6} />
              </div>
            </section>
          </div>

          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            {next.lesson && next.unit && currentSubject && (
              <UpNext lesson={next.lesson} subject={currentSubject} unit={next.unit} />
            )}
            <StudyStreak />

            <div className="border border-border-base rounded-lg bg-bg-surface p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-medium text-ink-muted">
                  نقاشات نشطة
                </span>
                <Link to="/student/discussions" className="text-[11px] text-accent hover:text-accent-light transition-base font-medium">
                  عرض الكل
                </Link>
              </div>
              <div className="space-y-3">
                {[
                  { q: 'لماذا يعمل القانون العام دائماً حتى عندما يفشل التحليل؟', subject: 'الرياضيات', id: 'disc-1' },
                  { q: 'كيف تعمل أزواج الفعل ورد الفعل في قانون نيوتن الثالث؟', subject: 'الفيزياء', id: 'disc-2' },
                ].map((d) => (
                  <Link
                    key={d.id}
                    to="/student/discussions"
                    className="block text-[13px] text-ink-primary hover:text-accent transition-base leading-snug"
                  >
                    {d.q}
                    <span className="block text-[11px] text-ink-muted mt-0.5">{d.subject}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
