import { Link } from 'react-router-dom';
import { Send } from 'lucide-react';
import Logo, { LogoMark } from '@/components/Logo';

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-cream mt-20">
      <div className="container-page py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <LogoMark variant="white" />
              <div className="flex flex-col leading-none">
                <span className="font-heading font-extrabold text-xl text-white">مِداد</span>
                <span className="text-[11px] text-white/60 mt-0.5">المعرفة تُكتب وتُشارك</span>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-md">
              منصة تعليمية تجمع الطلاب والمعلمين والمحتوى التعليمي في مساحة واحدة،
              لتجعل الوصول إلى المعرفة أسهل.
            </p>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-3">روابط سريعة</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/subjects" className="text-white/70 hover:text-gold transition-colors">المواد الدراسية</Link></li>
              <li><Link to="/teachers" className="text-white/70 hover:text-gold transition-colors">المعلمون</Link></li>
              <li><Link to="/contribute" className="text-white/70 hover:text-gold transition-colors">ساهم</Link></li>
              <li><Link to="/suggestions" className="text-white/70 hover:text-gold transition-colors">الاقتراحات</Link></li>
              <li><Link to="/assistant" className="text-white/70 hover:text-gold transition-colors">مساعد مِداد</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-bold text-white mb-3">عن المنصة</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-white/70 hover:text-gold transition-colors">من نحن</Link></li>
              <li><Link to="/login" className="text-white/70 hover:text-gold transition-colors">تسجيل الدخول</Link></li>
              <li><Link to="/admin" className="text-white/70 hover:text-gold transition-colors">لوحة التحكم</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/50 text-xs">
            © {new Date().getFullYear()} مِداد | MIDAD — مشروع تعليمي لأولمبياد اللغة الإنجليزية. جميع البيانات تجريبية.
          </p>
          <div className="flex items-center gap-1.5 text-white/40 text-xs">
            <Send className="w-3.5 h-3.5" />
            <span>صُنع بشغف من قبل الطلاب</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
