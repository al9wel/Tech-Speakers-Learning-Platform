import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowLeft, BookOpen } from 'lucide-react';
import { SubjectIcon } from '@/components/SubjectIcon';
import { useData } from '@/context/DataContext';

export default function SubjectsPage() {
  const { subjects } = useData();
  const [query, setQuery] = useState('');

  const filtered = subjects.filter((s) =>
    s.name.includes(query) || s.nameEn.toLowerCase().includes(query.toLowerCase()) || s.description.includes(query)
  );

  return (
    <div className="container-page py-10 animate-page">
      <div className="text-center mb-10">
        <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-ink-900">المواد الدراسية</h1>
        <p className="text-ink-500 mt-3 max-w-xl mx-auto">
          استكشف {subjects.length} مادة دراسية مع الموارد التعليمية: دروس، ملخصات، عروض، ملفات، وفيديوهات.
        </p>
      </div>

      <div className="relative max-w-md mx-auto mb-10">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن مادة..."
          className="input-field pr-10"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((subject) => (
          <Link key={subject.id} to={`/subjects/${subject.id}`} className="card-hover p-6 group">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-ink-50 flex items-center justify-center text-ink-700 shrink-0 group-hover:bg-gold/15 group-hover:text-gold-dark transition-colors">
                <SubjectIcon name={subject.icon} className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-bold text-ink-900 text-lg">{subject.name}</h3>
                <p className="text-sm text-ink-500 mt-1 leading-relaxed">{subject.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="chip bg-ink-50 text-ink-500 text-xs">{subject.resourceCount} مورد</span>
                  <span className="text-xs text-gold-dark font-medium group-hover:underline flex items-center gap-1">
                    عرض المادة <ArrowLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-ink-300 mx-auto mb-4" />
          <p className="text-ink-400 text-lg">لا توجد مواد حاليًا.</p>
        </div>
      )}
    </div>
  );
}
