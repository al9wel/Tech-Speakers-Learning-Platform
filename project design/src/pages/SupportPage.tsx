import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Search, GraduationCap, Award, Briefcase } from 'lucide-react';
import { useData } from '@/context/DataContext';

const statusLabels: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'معتمد',
  rejected: 'مرفوض',
  suspended: 'موقوف',
};

export default function SupportPage() {
  const { counselors, loading } = useData();
  const [query, setQuery] = useState('');

  const filtered = counselors.filter((c) => {
    if (!query) return true;
    return c.name.includes(query) || c.specialization.includes(query) || c.supportAreas.includes(query);
  });

  return (
    <div className="container-page py-8 animate-page">
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-rose-50 mb-4">
          <Heart className="w-8 h-8 text-rose-600" />
        </div>
        <h1 className="font-heading font-extrabold text-3xl text-ink-900 mb-2">الدعم النفسي</h1>
        <p className="text-ink-500 max-w-2xl mx-auto">
          مجموعة من المستشارين النفسيين المعتمدين لتقديم الدعم والمساعدة للطلاب في رحلتهم التعليمية
        </p>
      </div>

      <div className="relative max-w-md mx-auto mb-8">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ابحث عن مستشار أو تخصص..."
          className="input-field pr-10 text-sm"
        />
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Heart className="w-10 h-10 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500">لا يوجد مستشارون متاحون حالياً.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((c) => (
            <div key={c.id} className="card p-5 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                {c.photoUrl ? (
                  <img src={c.photoUrl} alt={c.name} className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-lg">
                    {c.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-ink-900 truncate">{c.name}</h3>
                  <p className="text-sm text-ink-500 truncate">{c.specialization}</p>
                </div>
                <span className="chip bg-sage-50 text-sage-dark text-xs shrink-0">معتمد</span>
              </div>

              {c.bio && <p className="text-sm text-ink-600 leading-relaxed mb-3 line-clamp-2">{c.bio}</p>}

              <div className="space-y-1.5 mb-4 text-sm text-ink-500">
                {c.experience > 0 && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-ink-400" />
                    <span>{c.experience} سنوات خبرة</span>
                  </div>
                )}
                {c.supportAreas && (
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-ink-400" />
                    <span className="truncate">{c.supportAreas}</span>
                  </div>
                )}
                {c.qualifications && (
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-ink-400" />
                    <span className="truncate">{c.qualifications}</span>
                  </div>
                )}
              </div>

              <Link to={`/counselors/${c.id}`} className="btn-outline text-sm mt-auto">
                عرض الملف
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
