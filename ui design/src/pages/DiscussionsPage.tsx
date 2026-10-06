import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareText, ChevronLeft, CheckCircle2, Circle, Search } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import { discussions, subjects } from '@/data/mockData';

export function DiscussionsPage() {
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [filterAnswered, setFilterAnswered] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  let filtered = discussions;
  if (filterSubject !== 'all') filtered = filtered.filter((d) => d.subjectId === filterSubject);
  if (filterAnswered === 'answered') filtered = filtered.filter((d) => d.answered);
  if (filterAnswered === 'open') filtered = filtered.filter((d) => !d.answered);
  if (searchQuery) filtered = filtered.filter((d) =>
    d.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <PageHeader
          title="النقاشات"
          subtitle="الأسئلة والحوارات من مجتمعك التعليمي."
        />

        <div className="flex items-center gap-2 px-3 py-2.5 bg-bg-surface border border-border-base rounded-md mb-4">
          <Search className="w-4 h-4 text-ink-muted shrink-0" />
          <input
            type="text"
            placeholder="ابحث في النقاشات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-ink-primary placeholder:text-ink-muted outline-none"
          />
        </div>

        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <button
            onClick={() => setFilterSubject('all')}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-md border transition-base ${
              filterSubject === 'all'
                ? 'bg-accent text-white border-accent'
                : 'bg-bg-surface text-ink-secondary border-border-base hover:border-ink-muted/30'
            }`}
          >
            كل المواد
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
          <div className="h-5 w-px bg-border-base mx-1" />
          <button
            onClick={() => setFilterAnswered('all')}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-md border transition-base ${
              filterAnswered === 'all' ? 'bg-ink-primary text-white border-ink-primary' : 'bg-bg-surface text-ink-secondary border-border-base hover:border-ink-muted/30'
            }`}
          >
            الكل
          </button>
          <button
            onClick={() => setFilterAnswered('answered')}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-md border transition-base ${
              filterAnswered === 'answered' ? 'bg-success text-white border-success' : 'bg-bg-surface text-ink-secondary border-border-base hover:border-ink-muted/30'
            }`}
          >
            تمت الإجابة
          </button>
          <button
            onClick={() => setFilterAnswered('open')}
            className={`px-3 py-1.5 text-[12px] font-medium rounded-md border transition-base ${
              filterAnswered === 'open' ? 'bg-amber text-white border-amber' : 'bg-bg-surface text-ink-secondary border-border-base hover:border-ink-muted/30'
            }`}
          >
            مفتوح
          </button>
        </div>

        {filtered.length === 0 ? (
          <div className="border border-border-base rounded-lg bg-bg-surface">
            <EmptyState
              icon={MessageSquareText}
              title="لا توجد نقاشات"
              description="لا توجد نقاشات تطابق مرشحاتك الحالية. جرّب تعديل البحث أو المرشحات."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((disc) => {
              const subject = subjects.find((s) => s.id === disc.subjectId);
              return (
                <Link
                  key={disc.id}
                  to={`/student/subjects/${disc.subjectId}`}
                  className="block border border-border-base rounded-lg bg-bg-surface p-4 sm:p-5 transition-base hover:border-ink-muted/30 group"
                >
                  <div className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5">
                      {disc.answered ? (
                        <CheckCircle2 className="w-4 h-4 text-success" strokeWidth={2} />
                      ) : (
                        <Circle className="w-4 h-4 text-amber" strokeWidth={2} />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm sm:text-[15px] font-semibold text-ink-primary group-hover:text-accent transition-base leading-snug mb-1">
                        {disc.question}
                      </h3>
                      <p className="text-[13px] text-ink-secondary leading-relaxed mb-3 line-clamp-2">{disc.excerpt}</p>

                      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                        {disc.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-medium px-2 py-0.5 rounded bg-bg-alt text-ink-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-ink-muted">
                        <span className="font-medium" style={{ color: subject?.color }}>{disc.subject}</span>
                        <span>·</span>
                        <span>{disc.author}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <MessageSquareText className="w-3 h-3" />
                          {disc.replies} ردود
                        </span>
                        <span>·</span>
                        <span>{disc.lastActivity}</span>
                      </div>
                    </div>

                    <ChevronLeft className="w-4 h-4 text-ink-muted shrink-0 mt-1 group-hover:text-accent group-hover:-translate-x-0.5 transition-all" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
