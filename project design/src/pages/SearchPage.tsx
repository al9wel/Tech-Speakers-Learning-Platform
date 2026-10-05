import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, X, FileX, ArrowRight } from 'lucide-react';
import ResourceCard from '@/components/ResourceCard';
import { SubjectIcon } from '@/components/SubjectIcon';
import { useData } from '@/context/DataContext';
import { resourceTypeLabels, type ResourceType } from '@/data/sampleData';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const { subjects, resources } = useData();
  const [searchInput, setSearchInput] = useState(query);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

  const results = useMemo(() => {
    let r = resources;
    if (query) {
      const q = query.trim();
      r = r.filter(
        (res) =>
          res.title.includes(q) ||
          res.lesson.includes(q) ||
          res.description.includes(q) ||
          res.subjectName.includes(q) ||
          res.author.includes(q)
      );
    }
    if (subjectFilter !== 'all') r = r.filter((res) => res.subjectId === subjectFilter);
    if (typeFilter !== 'all') r = r.filter((res) => res.type === typeFilter);
    return r;
  }, [resources, query, subjectFilter, typeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setParams(searchInput.trim() ? { q: searchInput.trim() } : {});
  };

  const hasActiveFilters = subjectFilter !== 'all' || typeFilter !== 'all';

  return (
    <div className="container-page py-10 animate-page">
      {/* Search header */}
      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ابحث عن درس، موضوع، أو مادة..."
            className="w-full rounded-2xl border border-ink-200 bg-white py-4 pr-12 pl-4 text-base shadow-soft focus:border-gold focus:ring-2 focus:ring-gold/20"
            autoFocus
          />
        </form>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-ink-900 text-xl">
            نتائج البحث: <span className="text-gold-dark">"{query}"</span>
          </h1>
          <p className="text-sm text-ink-500 mt-1">{results.length} نتيجة</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-outline text-sm lg:hidden"
        >
          <Filter className="w-4 h-4" />
          فلترة
        </button>
      </div>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        {/* Filters sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block space-y-5`}>
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-heading font-bold text-ink-900 text-sm">الفلاتر</h3>
              {hasActiveFilters && (
                <button
                  onClick={() => { setSubjectFilter('all'); setTypeFilter('all'); }}
                  className="text-xs text-gold-dark hover:underline"
                >
                  مسح الكل
                </button>
              )}
            </div>

            <div className="mb-4">
              <p className="text-xs font-medium text-ink-500 mb-2">المادة</p>
              <div className="space-y-1">
                <button
                  onClick={() => setSubjectFilter('all')}
                  className={`w-full text-right px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                    subjectFilter === 'all' ? 'bg-ink-100 text-ink-900 font-medium' : 'text-ink-600 hover:bg-ink-50'
                  }`}
                >
                  كل المواد
                </button>
                {subjects.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSubjectFilter(s.id)}
                    className={`w-full text-right px-2.5 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      subjectFilter === s.id ? 'bg-ink-100 text-ink-900 font-medium' : 'text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    <SubjectIcon name={s.icon} className="w-4 h-4 shrink-0" />
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-ink-500 mb-2">نوع المحتوى</p>
              <div className="space-y-1">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`w-full text-right px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                    typeFilter === 'all' ? 'bg-ink-100 text-ink-900 font-medium' : 'text-ink-600 hover:bg-ink-50'
                  }`}
                >
                  كل الأنواع
                </button>
                {(Object.keys(resourceTypeLabels) as ResourceType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`w-full text-right px-2.5 py-1.5 rounded-lg text-sm transition-colors ${
                      typeFilter === t ? 'bg-ink-100 text-ink-900 font-medium' : 'text-ink-600 hover:bg-ink-50'
                    }`}
                  >
                    {resourceTypeLabels[t]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Results */}
        <div>
          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((r) => (
                <ResourceCard key={r.id} resource={r} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-ink-50 flex items-center justify-center mx-auto mb-4">
                <FileX className="w-8 h-8 text-ink-400" />
              </div>
              <h3 className="font-heading font-bold text-ink-700 text-lg">لا توجد نتائج</h3>
              <p className="text-ink-500 mt-1">لم نجد ما يطابق بحثك. جرّب كلمات أخرى أو ساهم بمحتوى جديد.</p>
              <Link to="/contribute" className="btn-gold mt-4">ساهم الآن</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
