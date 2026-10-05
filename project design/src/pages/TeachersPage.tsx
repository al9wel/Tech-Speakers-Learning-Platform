import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function TeachersPage() {
  const { teachers, subjects } = useData();
  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const filtered = teachers.filter((t) => {
    const matchesQuery = !query || t.name.includes(query) || t.bio.includes(query) || t.subjectName.includes(query);
    const matchesSubject = subjectFilter === 'all' || t.subjectId === subjectFilter;
    return matchesQuery && matchesSubject;
  });

  return (
    <div className="container-page py-10 animate-page">
      <div className="text-center mb-10">
        <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-ink-900">المعلمون</h1>
        <p className="text-ink-500 mt-3 max-w-xl mx-auto">
          معلمون متطوعون يشاركون معرفتهم وخبرتهم مع الطلاب مجاناً.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-8">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن معلم..."
            className="input-field pr-10"
          />
        </div>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="input-field sm:w-48"
        >
          <option value="all">كل المواد</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((teacher) => (
          <Link key={teacher.id} to={`/teachers/${teacher.id}`} className="card-hover p-6 group">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-ink-100 flex items-center justify-center text-ink-700 font-heading font-bold text-xl shrink-0 group-hover:bg-gold/20 transition-colors">
                {teacher.avatarInitials}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-ink-900 text-lg">{teacher.name}</h3>
                <p className="text-sm text-gold-dark font-medium">{teacher.subjectName}</p>
                <p className="text-sm text-ink-500 mt-2 leading-relaxed line-clamp-2">{teacher.bio}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="flex items-center gap-1 text-xs text-ink-400">
                    <Users className="w-3.5 h-3.5" />
                    {teacher.followers} متابع
                  </span>
                  {teacher.questionsOpen ? (
                    <span className="chip bg-sage-50 text-sage-dark text-xs">الأسئلة مفتوحة</span>
                  ) : (
                    <span className="chip bg-ink-50 text-ink-400 text-xs">الأسئلة مغلقة</span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-ink-300 mx-auto mb-4" />
          <p className="text-ink-400 text-lg">لا يوجد معلمون حاليًا.</p>
        </div>
      )}
    </div>
  );
}
