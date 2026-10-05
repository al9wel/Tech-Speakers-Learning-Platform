import { Link } from 'react-router-dom';
import { Sparkles, BookOpen, Users, Shield, Bot, PenLine, Search, Bell } from 'lucide-react';
import { LogoMark } from '@/components/Logo';

export default function AboutPage() {
  const features = [
    { icon: BookOpen, title: '12 مادة دراسية', desc: 'موارد تعليمية متنوعة: دروس، ملخصات، عروض، ملفات، وفيديوهات.' },
    { icon: Users, title: 'معلمون متطوعون', desc: 'معلمون يشاركون معرفتهم مع الطلاب عبر إعلانات وجلسات مباشرة.' },
    { icon: PenLine, title: 'ساهم بمحتوى', desc: 'شارك ملخصاتك ومواردك مع زملائك، مع نظام مراجعة لضمان الجودة.' },
    { icon: Search, title: 'بحث ذكي', desc: 'ابحث عن أي درس أو موضوع، مع بنية تدعم البحث الدلالي بالذكاء الاصطناعي.' },
    { icon: Bot, title: 'مساعد مِداد', desc: 'مساعد ذكي يشرح المفاهيم ويولّد أسئلة تمارين، مرتبط بالمحتوى المعتمد.' },
    { icon: Bell, title: 'إشعارات', desc: 'تابع معلميك وتلقّ إشعارات عند بدء الدروس ونشر المحتوى الجديد.' },
  ];

  return (
    <div className="animate-page">
      <section className="bg-parchment border-b border-ink-100/60">
        <div className="container-page py-16 text-center">
          <div className="flex justify-center mb-6">
            <LogoMark className="w-16 h-16" />
          </div>
          <h1 className="font-heading font-extrabold text-3xl md:text-4xl text-ink-900">من نحن</h1>
          <p className="text-ink-500 mt-3 max-w-2xl mx-auto text-lg leading-relaxed">
            مِداد منصة تعليمية تجمع الطلاب والمعلمين والمحتوى التعليمي في مساحة واحدة،
            لتجعل الوصول إلى المعرفة أسهل. مشروع تعليمي لأولمبياد اللغة الإنجليزية حول دور الذكاء الاصطناعي في التعليم.
          </p>
          <span className="chip bg-gold/15 text-gold-dark text-sm mt-4">
            <Sparkles className="w-4 h-4" />
            المعرفة تُكتب وتُشارك
          </span>
        </div>
      </section>

      <section className="container-page py-16">
        <h2 className="section-title text-center mb-10">مميزات المنصة</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => (
            <div key={f.title} className="card p-6">
              <div className="w-12 h-12 rounded-xl bg-ink-50 flex items-center justify-center text-ink-700 mb-4">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading font-bold text-ink-900 text-lg">{f.title}</h3>
              <p className="text-sm text-ink-500 mt-1 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-16">
        <div className="card bg-ink-900 text-white p-8 md:p-10 text-center">
          <h2 className="font-heading font-extrabold text-2xl mb-3">جاهز لتبدأ التعلم؟</h2>
          <p className="text-white/70 max-w-lg mx-auto mb-5">
            استكشف المواد، تابع المعلمين، وساهم في بناء المعرفة.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link to="/subjects" className="btn-gold">استكشف المواد</Link>
            <Link to="/assistant" className="btn-outline text-white border-white/20 hover:bg-white/10">جرّب مساعد مِداد</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
