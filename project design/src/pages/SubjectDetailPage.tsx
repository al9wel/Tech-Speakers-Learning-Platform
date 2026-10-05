import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Search, ArrowRight, FileX } from 'lucide-react';
import { SubjectIcon } from '@/components/SubjectIcon';
import ResourceCard from '@/components/ResourceCard';
import { useData } from '@/context/DataContext';
import { resourceTypeLabels, type ResourceType } from '@/data/sampleData';

const filters: { key: ResourceType | 'all'; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'lesson', label: 'الدروس' },
  { key: 'summary', label: 'الملخصات' },
  { key: 'presentation', label: 'العروض' },
  { key: 'file', label: 'الملفات' },
  { key: 'video', label: 'الفيديوهات' },
];

export default function SubjectDetailPage() {
  const { id } = useParams();
  const { subjects, resources } = useData();
  const subject = subjects.find((s) => s.id === id);
  const [activeFilter, setActiveFilter] = useState<ResourceType | 'all'>('all');
  const [query, setQuery] = useState('');

  const subjectResources = useMemo(() => {
    if (!subject) return [];
    return resources.filter((r) => r.subjectId === subject.id);
  }, [subject, resources]);

  const filtered = useMemo(() => {
    let result = subjectResources;
    if (activeFilter !== 'all') result = result.filter((r) => r.type === activeFilter);
    if (query.trim()) {
      const q = query.trim();
      result = result.filter((r) => r.title.includes(q) || r.lesson.includes(q) || r.description.includes(q));
    }
    return result;
  }, [subjectResources, activeFilter, query]);

  if (!subject) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-ink-500 text-lg">المادة غير موجودة.</p>
        <Link to="/subjects" className="btn-outline mt-4">العودة للمواد</Link>
      </div>
    );
  }

  return (
    <div className="animate-page">
      {/* Header */}
      <div className="bg-parchment border-b border-ink-100/60">
        <div className="container-page py-10">
          <Link to="/subjects" className="text-sm text-ink-500 hover:text-ink-700 flex items-center gap-1 mb-4">
            <ArrowRight className="w-4 h-4" />
            المواد الدراسية
          </Link>
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-ink-700 shadow-soft shrink-0">
              <SubjectIcon name={subject.icon} className="w-8 h-8" />
            </div>
            <div>
              <h1 className="font-heading font-extrabold text-3xl text-ink-900">{subject.name}</h1>
              <p className="text-ink-500 mt-1 max-w-xl">{subject.description}</p>
              <span className="chip bg-gold/15 text-gold-dark text-xs mt-3">{subjectResources.length} مورد متاح</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-8">
        {/* Search within subject */}
        <div className="relative max-w-md mb-6">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في هذه المادة..."
            className="input-field pr-10"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`chip transition-all ${
                activeFilter === f.key
                  ? 'bg-ink-700 text-white'
                  : 'bg-white text-ink-600 border border-ink-200 hover:border-ink-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-ink-500 mb-4">{filtered.length} نتيجة</p>

        {/* Resources */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-ink-50 flex items-center justify-center mx-auto mb-4">
              <FileX className="w-8 h-8 text-ink-400" />
            </div>
            <h3 className="font-heading font-bold text-ink-700 text-lg">لا توجد موارد بعد</h3>
            <p className="text-ink-500 mt-1">كن أول من يساهم بملخص أو ملف مفيد.</p>
            <Link to="/contribute" className="btn-gold mt-4">ساهم الآن</Link>
          </div>
        )}
      </div>
    </div>
  );
}
