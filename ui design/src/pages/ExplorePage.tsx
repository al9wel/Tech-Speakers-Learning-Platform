import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, TrendingUp, Sparkles } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { subjects, getSubjectProgress } from '@/data/mockData';

const exploreCategories = [
  {
    title: 'مواد رائجة',
    description: 'ما يدرسه الطلاب الآخرون الآن',
    items: subjects.slice(0, 3),
  },
  {
    title: 'جديد هذا الأسبوع',
    description: 'دروس ووحدات مضافة حديثاً',
    items: subjects.slice(2, 5),
  },
];

export function ExplorePage() {
  return (
    <div className="animate-fade-in">
      <div className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <PageHeader
          title="استكشاف"
          subtitle="اكتشف مواد ودروساً ومسارات تعلم جديدة خارج منهجك الحالي."
        />

        <section className="mb-8">
          <div className="border border-border-base rounded-lg bg-bg-surface overflow-hidden">
            <div className="p-5 sm:p-6">
              <div className="flex items-center gap-2 text-[11px] font-medium text-accent mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                مميز
              </div>
              <h2 className="font-serif text-xl font-bold text-ink-primary mb-2">
                مقدمة في علوم الحاسوب
              </h2>
              <p className="text-sm text-ink-secondary leading-relaxed max-w-2xl mb-4">
                استكشف أساسيات الحوسبة والخوارزميات وحل المشكلات. مادة اختيارية جديدة متاحة لجميع الطلاب هذا الفصل.
              </p>
              <div className="flex items-center gap-3">
                <Link
                  to="/student/subjects"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-md hover:bg-accent-light transition-base group"
                >
                  اعرف المزيد
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                </Link>
                <span className="text-[12px] text-ink-muted">5 وحدات · 22 درساً</span>
              </div>
            </div>
          </div>
        </section>

        {exploreCategories.map((category, catIdx) => (
          <section key={catIdx} className="mb-8">
            <div className="flex items-end justify-between mb-4">
              <div>
                <h2 className="font-serif text-lg font-bold text-ink-primary flex items-center gap-2">
                  {catIdx === 0 && <TrendingUp className="w-4 h-4 text-ink-muted" strokeWidth={1.8} />}
                  {category.title}
                </h2>
                <p className="text-[12px] text-ink-muted mt-0.5">{category.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {category.items.map((subject) => {
                const progress = getSubjectProgress(subject);
                return (
                  <Link
                    key={subject.id}
                    to={`/student/subjects/${subject.id}`}
                    className="border border-border-base rounded-lg bg-bg-surface p-4 transition-base hover:border-ink-muted/30 group"
                  >
                    <div className="flex items-center gap-2.5 mb-3">
                      <div
                        className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                        style={{ backgroundColor: subject.colorBg, border: `1px solid ${subject.colorBorder}` }}
                      >
                        <Compass className="w-4 h-4" strokeWidth={1.8} style={{ color: subject.color }} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-ink-primary group-hover:text-accent transition-base truncate">
                          {subject.name}
                        </h3>
                        <p className="text-[11px] text-ink-muted truncate">{subject.subtitle}</p>
                      </div>
                    </div>
                    <p className="text-[12px] text-ink-secondary leading-relaxed line-clamp-2 mb-3">
                      {subject.description}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-ink-muted">
                      <span>{subject.units.length} وحدات</span>
                      <span>{progress.total} دروس</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}

        <section>
          <h2 className="font-serif text-lg font-bold text-ink-primary mb-4">تصفح كل المواد</h2>
          <div className="border border-border-base rounded-lg bg-bg-surface overflow-hidden">
            {subjects.map((subject, idx) => {
              const progress = getSubjectProgress(subject);
              const isLast = idx === subjects.length - 1;
              return (
                <Link
                  key={subject.id}
                  to={`/student/subjects/${subject.id}`}
                  className={`flex items-center gap-4 px-5 py-4 transition-base hover:bg-bg-alt/40 group ${isLast ? '' : 'border-b border-border-subtle'}`}
                >
                  <div
                    className="w-1 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: subject.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-ink-primary group-hover:text-accent transition-base">
                      {subject.name}
                    </h3>
                    <p className="text-[12px] text-ink-muted">{subject.subtitle}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 shrink-0">
                    <div className="w-20 h-1 rounded-full bg-bg-alt overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${progress.percent}%`, backgroundColor: subject.color }}
                      />
                    </div>
                    <span className="text-[11px] font-medium text-ink-muted w-8 text-right">{progress.percent}%</span>
                  </div>
                  <ArrowLeft className="w-4 h-4 text-ink-muted group-hover:text-accent transition-base shrink-0" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
