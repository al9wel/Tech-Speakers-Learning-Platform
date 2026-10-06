import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, BookText, PenLine, Video, MessageCircle, FileCheck, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { savedLessons, subjects } from '@/data/mockData';
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

export function SavedPage() {
  const [saved, setSaved] = useState(savedLessons);
  const [filterSubject, setFilterSubject] = useState<string>('all');

  const filtered = filterSubject === 'all' ? saved : saved.filter((s) => s.subjectId === filterSubject);

  const handleRemove = (id: string) => {
    setSaved((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="animate-fade-in">
      <div className="max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <PageHeader
          title="الدروس المحفوظة"
          subtitle="الدروس التي حفظتها للمراجعة لاحقاً."
        />

        {saved.length > 0 && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            <button
              onClick={() => setFilterSubject('all')}
              className={`px-3 py-1.5 text-[12px] font-medium rounded-md border transition-base ${
                filterSubject === 'all'
                  ? 'bg-accent text-white border-accent'
                  : 'bg-bg-surface text-ink-secondary border-border-base hover:border-ink-muted/30'
              }`}
            >
              الكل
            </button>
            {subjects.map((subject) => (
              <button
                key={subject.id}
                onClick={() => setFilterSubject(subject.id)}
                className={`px-3 py-1.5 text-[12px] font-medium rounded-md border transition-base ${
                  filterSubject === subject.id
                    ? 'text-white border-transparent'
                    : 'bg-bg-surface text-ink-secondary border-border-base hover:border-ink-muted/30'
                }`}
                style={filterSubject === subject.id ? { backgroundColor: subject.color, borderColor: subject.color } : {}}
              >
                {subject.name}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="border border-border-base rounded-lg bg-bg-surface">
            <EmptyState
              icon={Bookmark}
              title={saved.length === 0 ? "لا توجد دروس محفوظة بعد" : "لا توجد دروس محفوظة في هذه المادة"}
              description={saved.length === 0
                ? "احفظ الدروس أثناء التعلم لتجدها بسرعة هنا للمراجعة."
                : "جرّب اختيار مرشح مادة مختلف."}
              action={
                <Link
                  to="/student/subjects"
                  className="text-sm font-medium text-accent hover:text-accent-light transition-base"
                >
                  تصفح الدروس ←
                </Link>
              }
            />
          </div>
        ) : (
          <div className="border border-border-base rounded-lg bg-bg-surface overflow-hidden">
            {filtered.map((saved, idx) => {
              const Icon = typeIcons[saved.type];
              const subject = subjects.find((s) => s.id === saved.subjectId);
              const isLast = idx === filtered.length - 1;

              return (
                <div
                  key={saved.id}
                  className={`flex items-start gap-3 sm:gap-4 px-4 sm:px-5 py-4 transition-base group ${isLast ? '' : 'border-b border-border-subtle'} hover:bg-bg-alt/40`}
                >
                  <Link
                    to={`/student/lesson/${saved.lessonId}`}
                    className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0"
                  >
                    <div
                      className="shrink-0 w-9 h-9 rounded-md flex items-center justify-center border"
                      style={{ backgroundColor: subject?.colorBg, borderColor: subject?.colorBorder }}
                    >
                      <Icon className="w-[17px] h-[17px]" strokeWidth={1.8} style={{ color: subject?.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium text-ink-muted mb-0.5">
                        {saved.subject} · {saved.unitTitle}
                      </div>
                      <h3 className="text-sm font-medium text-ink-primary group-hover:text-accent transition-base">
                        {saved.lessonTitle}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-[11px] text-ink-muted">{typeLabels[saved.type]}</span>
                        <span className="text-ink-muted text-[11px]">·</span>
                        <span className="text-[11px] text-ink-muted">حُفظ {saved.savedAt}</span>
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemove(saved.id)}
                    className="shrink-0 p-1.5 rounded-md text-ink-muted hover:text-error hover:bg-error-bg/50 transition-base opacity-0 group-hover:opacity-100"
                    title="إزالة من المحفوظات"
                  >
                    <Trash2 className="w-4 h-4" strokeWidth={1.8} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
