import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock, Check, Lock, Circle, BookText, PenLine, Video, MessageCircle, FileCheck, Lightbulb, Info, AlertCircle, ChevronLeft } from 'lucide-react';
import { getLessonById, getNextLesson, getPrevLesson } from '@/data/mockData';
import type { LessonContent, LessonType, Lesson } from '@/types';

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

const calloutConfig = {
  info: { icon: Info, bg: 'bg-accent-bg', border: 'border-accent/30', text: 'text-accent', label: 'ملاحظة' },
  warning: { icon: AlertCircle, bg: 'bg-amber-bg', border: 'border-amber/30', text: 'text-amber', label: 'مهم' },
  tip: { icon: Lightbulb, bg: 'bg-success-bg', border: 'border-success/30', text: 'text-success', label: 'نصيحة' },
};

function LessonContentBlock({ content }: { content: LessonContent }) {
  switch (content.type) {
    case 'heading':
      return <h2>{content.text}</h2>;
    case 'subheading':
      return <h3>{content.text}</h3>;
    case 'paragraph':
      return <p>{content.text}</p>;
    case 'list':
      return (
        <ul>
          {content.items?.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    case 'blockquote':
      return <blockquote>{content.text}</blockquote>;
    case 'callout': {
      const config = calloutConfig[content.variant || 'info'];
      const Icon = config.icon;
      return (
        <div className={`my-5 p-4 rounded-md border ${config.bg} ${config.border}`}>
          <div className={`flex items-center gap-2 mb-1.5 ${config.text}`}>
            <Icon className="w-4 h-4" strokeWidth={2} />
            <span className="text-[11px] font-semibold">{config.label}</span>
          </div>
          <p className="text-[14px] text-ink-primary leading-relaxed m-0">{content.text}</p>
        </div>
      );
    }
    case 'image':
      return (
        <figure className="my-5">
          <div className="aspect-[16/9] rounded-md border border-border-base bg-bg-alt flex items-center justify-center">
            <span className="text-ink-muted text-sm">{content.caption || 'شكل توضيحي'}</span>
          </div>
          {content.caption && (
            <figcaption className="text-center text-[12px] text-ink-muted mt-2">{content.caption}</figcaption>
          )}
        </figure>
      );
    default:
      return null;
  }
}

export function LessonPage() {
  const { lesson: lessonId } = useParams();
  const { lesson, subject, unit } = getLessonById(lessonId || '');

  if (!lesson || !subject || !unit) {
    return (
      <div className="max-w-[800px] mx-auto px-6 py-16 text-center">
        <h1 className="font-serif text-xl font-bold text-ink-primary mb-2">الدرس غير موجود</h1>
        <p className="text-sm text-ink-secondary mb-4">هذا الدرس غير موجود أو تمت إزالته.</p>
        <Link to="/student/subjects" className="text-sm font-medium text-accent hover:text-accent-light">
          → تصفح المواد
        </Link>
      </div>
    );
  }

  const next = getNextLesson(subject.id, lesson.id);
  const prev = getPrevLesson(subject.id, lesson.id);
  const TypeIcon = typeIcons[lesson.type];
  const isLocked = lesson.status === 'locked';

  const lessonIdx = unit.lessons.findIndex((l: Lesson) => l.id === lesson.id);
  const lessonProgress = ((lessonIdx + 1) / unit.lessons.length) * 100;

  return (
    <div className="animate-fade-in">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <nav className="flex items-center gap-1.5 text-[12px] mb-5 flex-wrap">
          <Link to="/student/subjects" className="text-ink-secondary hover:text-accent transition-base font-medium">المواد</Link>
          <ChevronLeft className="w-3 h-3 text-ink-muted" />
          <Link to={`/student/subjects/${subject.id}`} className="text-ink-secondary hover:text-accent transition-base font-medium">{subject.name}</Link>
          <ChevronLeft className="w-3 h-3 text-ink-muted" />
          <span className="text-ink-secondary font-medium">{unit.title}</span>
          <ChevronLeft className="w-3 h-3 text-ink-muted" />
          <span className="text-ink-primary font-medium">{lesson.title}</span>
        </nav>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: subject.colorBg, border: `1px solid ${subject.colorBorder}` }}
            >
              <TypeIcon className="w-4 h-4" strokeWidth={1.8} style={{ color: subject.color }} />
            </div>
            <span className="text-[11px] font-medium text-ink-muted">
              {subject.name} · {unit.title}
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink-primary leading-tight mb-3">
            {lesson.title}
          </h1>
          <p className="text-base text-ink-secondary leading-relaxed max-w-2xl">{lesson.description}</p>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border-subtle">
            <span className="flex items-center gap-1.5 text-[12px] text-ink-muted">
              <Clock className="w-3.5 h-3.5" />
              {lesson.estimatedMinutes} دقيقة
            </span>
            <span className="text-[12px] text-ink-muted">{typeLabels[lesson.type]}</span>
            <span className="text-[12px] text-ink-muted">الدرس {lessonIdx + 1} من {unit.lessons.length}</span>
          </div>

          <div className="mt-3 h-1 rounded-full bg-bg-alt overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${lessonProgress}%`, backgroundColor: subject.color }}
            />
          </div>
        </div>

        {isLocked ? (
          <div className="border border-border-base rounded-lg bg-bg-surface p-12 text-center">
            <div className="w-10 h-10 rounded-full bg-bg-alt border border-border-subtle flex items-center justify-center mx-auto mb-3">
              <Lock className="w-4 h-4 text-ink-muted" strokeWidth={2} />
            </div>
            <h3 className="font-serif text-lg font-bold text-ink-primary mb-1">هذا الدرس مقفل</h3>
            <p className="text-sm text-ink-secondary max-w-sm mx-auto">
              أكمل الدروس السابقة في هذه الوحدة لفتح هذا المحتوى.
            </p>
          </div>
        ) : (
          <>
            {lesson.content && lesson.content.length > 0 ? (
              <article className="prose-lesson text-[15px] text-ink-primary">
                {lesson.content.map((block: LessonContent, idx: number) => (
                  <LessonContentBlock key={idx} content={block} />
                ))}
              </article>
            ) : (
              <div className="border border-border-base rounded-lg bg-bg-surface p-8 text-center">
                <p className="text-sm text-ink-muted">محتوى الدرس قيد الإعداد.</p>
              </div>
            )}

            {lesson.keyTerms && lesson.keyTerms.length > 0 && (
              <section className="mt-8 pt-6 border-t border-border-base">
                <h3 className="font-serif text-base font-bold text-ink-primary mb-4">المصطلحات الأساسية</h3>
                <dl className="space-y-3">
                  {lesson.keyTerms.map((term: { term: string; definition: string }, idx: number) => (
                    <div key={idx} className="flex flex-col sm:flex-row gap-1 sm:gap-4">
                      <dt className="text-sm font-semibold text-ink-primary sm:w-40 shrink-0">{term.term}</dt>
                      <dd className="text-[14px] text-ink-secondary leading-relaxed">{term.definition}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {lesson.practiceQuestions && lesson.practiceQuestions.length > 0 && (
              <section className="mt-8 pt-6 border-t border-border-base">
                <h3 className="font-serif text-base font-bold text-ink-primary mb-4">تمارين</h3>
                <div className="space-y-4">
                  {lesson.practiceQuestions.map((q: { question: string; answer: string }, idx: number) => (
                    <div key={idx} className="border border-border-base rounded-md bg-bg-surface p-4">
                      <p className="text-sm font-medium text-ink-primary mb-2">{q.question}</p>
                      <details className="group">
                        <summary className="text-[12px] font-medium text-accent cursor-pointer hover:text-accent-light transition-base select-none">
                          إظهار الإجابة
                        </summary>
                        <p className="text-[13px] text-ink-secondary mt-2 pr-3 border-r-2 border-accent/30">{q.answer}</p>
                      </details>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section className="mt-8 pt-6 border-t border-border-base">
              <div className="border border-border-base rounded-md bg-bg-surface p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-md bg-accent-bg border border-accent/20 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-4 h-4 text-accent" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-ink-primary mb-1">اسأل عن هذا الدرس</h4>
                    <p className="text-[13px] text-ink-secondary mb-3">
                      هل لديك سؤال عن {lesson.title}؟ احصل على شرح مخصص لمستوى فهمك.
                    </p>
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-bg-alt rounded-md border border-border-subtle">
                      <input
                        type="text"
                        placeholder="اكتب سؤالاً عن هذا الدرس..."
                        className="flex-1 bg-transparent text-sm text-ink-primary placeholder:text-ink-muted outline-none"
                        disabled
                      />
                      <button
                        disabled
                        className="text-[12px] font-medium text-ink-muted px-3 py-1.5 rounded border border-border-base cursor-not-allowed"
                      >
                        اسأل
                      </button>
                    </div>
                    <p className="text-[11px] text-ink-muted mt-2">المساعد الذكي قريباً</p>
                  </div>
                </div>
              </div>
            </section>
          </>
        )}

        <nav className="mt-8 pt-6 border-t border-border-base flex items-center justify-between gap-4">
          {prev.lesson ? (
            <Link
              to={`/student/lesson/${prev.lesson.id}`}
              className="flex items-center gap-3 px-4 py-3 border border-border-base rounded-md hover:bg-bg-alt/50 transition-base group flex-1 min-w-0 max-w-[48%]"
            >
              <ArrowRight className="w-4 h-4 text-ink-muted group-hover:text-accent transition-base shrink-0" />
              <div className="min-w-0 text-right">
                <div className="text-[10px] text-ink-muted font-medium">السابق</div>
                <div className="text-sm font-medium text-ink-primary truncate group-hover:text-accent transition-base">
                  {prev.lesson.title}
                </div>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}

          {next.lesson ? (
            <Link
              to={`/student/lesson/${next.lesson.id}`}
              className="flex items-center gap-3 px-4 py-3 border border-border-base rounded-md hover:bg-bg-alt/50 transition-base group flex-1 min-w-0 max-w-[48%] justify-end"
            >
              <div className="min-w-0 text-left">
                <div className="text-[10px] text-ink-muted font-medium">التالي</div>
                <div className="text-sm font-medium text-ink-primary truncate group-hover:text-accent transition-base">
                  {next.lesson.title}
                </div>
              </div>
              <ArrowLeft className="w-4 h-4 text-ink-muted group-hover:text-accent transition-base shrink-0" />
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </nav>

        <div className="mt-6 text-center">
          <Link
            to={`/student/subjects/${subject.id}`}
            className="text-[13px] font-medium text-ink-secondary hover:text-accent transition-base"
          >
            العودة إلى {subject.name}
          </Link>
        </div>
      </div>
    </div>
  );
}
