import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, Sparkles, BookOpen, PenLine, Users, FileText, Check } from 'lucide-react';
import HeroIllustration from '@/components/HeroIllustration';
import { SubjectIcon } from '@/components/SubjectIcon';
import { useData } from '@/context/DataContext';

export default function HomePage() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { subjects, teachers, resources, adminStats } = useData();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const featuredSubjects = subjects.slice(0, 6);
  const featuredTeachers = teachers.slice(0, 4);
  const recentResources = resources.slice(0, 3);

  const stats = adminStats
    ? [
        { icon: BookOpen, label: 'مادة دراسية', value: adminStats.subjects },
        { icon: FileText, label: 'مورد تعليمي', value: adminStats.resources },
        { icon: Users, label: 'معلم متطوع', value: adminStats.teachers },
        { icon: Check, label: 'مساهمة', value: adminStats.contributions },
      ]
    : [
        { icon: BookOpen, label: 'مادة دراسية', value: 0 },
        { icon: FileText, label: 'مورد تعليمي', value: 0 },
        { icon: Users, label: 'معلم متطوع', value: 0 },
        { icon: Check, label: 'مساهمة', value: 0 },
      ];

  return (
    <div className="animate-page">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-parchment to-cream">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #6B4F3A 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="container-page py-12 md:py-20 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-right space-y-6 animate-slide-up">
              <span className="chip bg-gold/15 text-gold-dark text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                منصة تعليمية متكاملة
              </span>
              <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl text-ink-900 leading-tight text-balance">
                مِداد
                <span className="block text-2xl md:text-3xl text-gold-dark mt-2 font-bold">
                  المعرفة تُكتب وتُشارك
                </span>
              </h1>
              <p className="text-ink-600 text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
                منصة تعليمية تجمع الطلاب والمعلمين والمحتوى التعليمي في مساحة واحدة،
                لتجعل الوصول إلى المعرفة أسهل.
              </p>

              {/* Search bar */}
              <form onSubmit={handleSearch} className="relative max-w-lg mx-auto lg:mx-0">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن درس، موضوع، أو مادة..."
                  className="w-full rounded-2xl border border-ink-200 bg-white py-4 pr-12 pl-4 text-base shadow-soft focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all"
                />
                <button type="submit" className="absolute left-2 top-1/2 -translate-y-1/2 btn-primary text-sm py-2.5 px-4">
                  بحث
                </button>
              </form>

              <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
                <Link to="/subjects" className="btn-primary">
                  استكشف المواد
                  <ArrowLeft className="w-4 h-4" />
                </Link>
                <Link to="/contribute" className="btn-outline">
                  <PenLine className="w-4 h-4" />
                  ساهم في بناء المعرفة
                </Link>
              </div>
            </div>

            <div className="hidden lg:flex justify-center animate-fade-in">
              <HeroIllustration className="w-full max-w-md" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-ink-100/60 bg-white/50">
        <div className="container-page py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <stat.icon className="w-5 h-5 text-gold mb-1" />
                <span className="font-heading font-extrabold text-2xl text-ink-900">{stat.value.toLocaleString()}</span>
                <span className="text-sm text-ink-500">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subjects */}
      <section className="container-page py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">المواد الدراسية</h2>
            <p className="text-ink-500 mt-2">استكشف المواد المتاحة على المنصة</p>
          </div>
          <Link to="/subjects" className="btn-ghost text-sm text-gold-dark hidden sm:flex">
            عرض الكل
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredSubjects.length > 0 ? (
            featuredSubjects.map((subject) => (
              <Link
                key={subject.id}
                to={`/subjects/${subject.id}`}
                className="card-hover p-5 flex items-start gap-4 group"
              >
                <div className="w-12 h-12 rounded-xl bg-ink-50 flex items-center justify-center text-ink-700 shrink-0 group-hover:bg-gold/15 group-hover:text-gold-dark transition-colors">
                  <SubjectIcon name={subject.icon} className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-ink-900 text-lg">{subject.name}</h3>
                  <p className="text-sm text-ink-500 leading-relaxed mt-0.5 line-clamp-2">{subject.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-ink-400">{subject.resourceCount} مورد</span>
                    <span className="text-ink-300">•</span>
                    <span className="text-xs text-gold-dark font-medium group-hover:underline">عرض المادة</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <BookOpen className="w-10 h-10 text-ink-300 mx-auto mb-3" />
              <p className="text-ink-400">لا توجد مواد حاليًا.</p>
            </div>
          )}
        </div>
      </section>

      {/* Teachers preview */}
      <section className="bg-parchment py-16">
        <div className="container-page">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="section-title">المعلمون المتطوعون</h2>
              <p className="text-ink-500 mt-2">معلمون متطوعون يشاركون معرفتهم مع الطلاب</p>
            </div>
            <Link to="/teachers" className="btn-ghost text-sm text-gold-dark hidden sm:flex">
              عرض الكل
              <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredTeachers.length > 0 ? (
              featuredTeachers.map((teacher) => (
                <Link key={teacher.id} to={`/teachers/${teacher.id}`} className="card-hover p-5 text-center group">
                  <div className="w-16 h-16 rounded-full bg-ink-100 flex items-center justify-center text-ink-700 font-heading font-bold text-xl mx-auto mb-3 group-hover:bg-gold/20 transition-colors">
                    {teacher.avatarInitials}
                  </div>
                  <h3 className="font-heading font-bold text-ink-900">{teacher.name}</h3>
                  <p className="text-sm text-gold-dark font-medium mt-0.5">{teacher.subjectName}</p>
                  <p className="text-xs text-ink-500 mt-2 leading-relaxed line-clamp-2">{teacher.bio}</p>
                  <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-ink-400">
                    <Users className="w-3.5 h-3.5" />
                    {teacher.followers} متابع
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <Users className="w-10 h-10 text-ink-300 mx-auto mb-3" />
                <p className="text-ink-400">لا يوجد معلمون حاليًا.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Contribute CTA */}
      <section className="container-page py-16">
        <div className="card bg-ink-900 text-white p-8 md:p-12 text-center overflow-hidden relative">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #C69C5D 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
          <div className="relative space-y-4 max-w-2xl mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-gold/20 flex items-center justify-center mx-auto">
              <PenLine className="w-7 h-7 text-gold" />
            </div>
            <h2 className="font-heading font-extrabold text-2xl md:text-3xl">ساهم في بناء المعرفة</h2>
            <p className="text-white/70 text-lg leading-relaxed">
              لديك ملخص مفيد؟ شاركه مع زملائك وساهم في بناء المعرفة.
              كل مساهمة تمر بمراجعة لضمان الجودة قبل نشرها.
            </p>
            <Link to="/contribute" className="btn-gold inline-flex">
              <PenLine className="w-4 h-4" />
              ابدأ المساهمة الآن
            </Link>
          </div>
        </div>
      </section>

      {/* Recent resources */}
      <section className="container-page pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="section-title">أحدث الموارد</h2>
            <p className="text-ink-500 mt-2">محتوى تعليمي تمت إضافته مؤخراً</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentResources.length > 0 ? (
            recentResources.map((r) => (
              <div key={r.id} className="card-hover p-5">
                <span className="chip bg-ink-50 text-ink-600 text-xs mb-3">{r.subjectName}</span>
                <h3 className="font-heading font-bold text-ink-900 text-lg">{r.title}</h3>
                <p className="text-sm text-ink-500 mt-1">{r.lesson}</p>
                <p className="text-sm text-ink-600 mt-2 line-clamp-2">{r.description}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <FileText className="w-10 h-10 text-ink-300 mx-auto mb-3" />
              <p className="text-ink-400">لا توجد موارد حاليًا.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
