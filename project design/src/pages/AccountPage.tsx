import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, Users, Shield, ShieldCheck, LogOut, Bell, Bookmark,
  MessageSquare, HelpCircle, Clock, CheckCircle2, Loader2,
} from 'lucide-react';
import type { TeacherQuestion } from '@/lib/dataAccess';

export default function AccountPage() {
  const { user, logout, followedTeachers, notificationEnabled } = useApp();
  const { getStudentQuestions } = useData();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<TeacherQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    getStudentQuestions(user.id).then((qs) => {
      setQuestions(qs);
      setLoading(false);
    });
  }, [user?.id, getStudentQuestions]);

  if (!user) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-ink-500 text-lg">يرجى تسجيل الدخول أولاً.</p>
        <Link to="/login" className="btn-primary mt-4">تسجيل الدخول</Link>
      </div>
    );
  }

  const roleLabels: Record<string, { label: string; icon: typeof GraduationCap }> = {
    student: { label: 'طالب', icon: GraduationCap },
    teacher: { label: 'معلم', icon: Users },
    moderator: { label: 'مراقب', icon: ShieldCheck },
    admin: { label: 'مشرف', icon: Shield },
  };
  const roleInfo = roleLabels[user.role || 'student'];

  return (
    <div className="container-page py-10 animate-page max-w-2xl">
      <div className="card p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-ink-100 flex items-center justify-center text-ink-700 font-heading font-bold text-2xl mx-auto mb-4">
          {user.name.charAt(0)}
        </div>
        <h1 className="font-heading font-extrabold text-2xl text-ink-900">{user.name}</h1>
        <span className="chip bg-gold/15 text-gold-dark text-sm mt-2">
          <roleInfo.icon className="w-4 h-4" />
          {roleInfo.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="card p-5 text-center">
          <Bookmark className="w-6 h-6 text-gold-dark mx-auto mb-2" />
          <p className="font-heading font-extrabold text-2xl text-ink-900">{followedTeachers.size}</p>
          <p className="text-sm text-ink-500">معلمون متابَعون</p>
        </div>
        <div className="card p-5 text-center">
          <Bell className="w-6 h-6 text-gold-dark mx-auto mb-2" />
          <p className="font-heading font-extrabold text-2xl text-ink-900">{notificationEnabled.size}</p>
          <p className="text-sm text-ink-500">إشعارات مفعّلة</p>
        </div>
      </div>

      {user.role === 'admin' && (
        <Link to="/admin" className="btn-primary w-full mt-4">
          <Shield className="w-4 h-4" />
          الذهاب إلى لوحة التحكم
        </Link>
      )}
      {user.role === 'moderator' && (
        <Link to="/moderator" className="btn-primary w-full mt-4">
          <ShieldCheck className="w-4 h-4" />
          الذهاب إلى لوحة المراجعة
        </Link>
      )}
      {user.role === 'teacher' && (
        <Link to="/teacher" className="btn-primary w-full mt-4">
          <Users className="w-4 h-4" />
          الذهاب إلى واجهة المعلم
        </Link>
      )}

      {/* My questions section */}
      <div className="mt-6">
        <h2 className="font-heading font-bold text-ink-900 text-lg mb-3 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-gold-dark" />
          أسئلتي الخاصة
        </h2>

        {loading ? (
          <div className="card p-8 text-center">
            <Loader2 className="w-6 h-6 text-ink-400 animate-spin mx-auto" />
            <p className="text-sm text-ink-500 mt-2">جاري تحميل أسئلتك...</p>
          </div>
        ) : questions.length > 0 ? (
          <div className="space-y-3">
            {questions.map((q) => (
              <div key={q.id} className="card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="chip bg-ink-50 text-ink-500 text-xs">سؤال خاص</span>
                  {q.status === 'answered' ? (
                    <span className="chip bg-sage-50 text-sage-dark text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      تمت الإجابة
                    </span>
                  ) : (
                    <span className="chip bg-amber-50 text-amber-600 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      بانتظار الإجابة
                    </span>
                  )}
                </div>
                <div className="border-r-2 border-ink-100 pr-3 mb-3">
                  <p className="text-xs text-ink-400 mb-1">سؤالك للمعلم: {q.teacherName}</p>
                  <p className="text-sm text-ink-700 leading-relaxed">{q.question}</p>
                </div>
                {q.answer && (
                  <div className="border-r-2 border-gold/40 pr-3">
                    <p className="text-xs text-gold-dark mb-1">إجابة المعلم</p>
                    <p className="text-sm text-ink-700 leading-relaxed">{q.answer}</p>
                    {q.answeredAt && (
                      <p className="text-xs text-ink-400 mt-1">
                        {new Date(q.answeredAt).toLocaleDateString('ar-SA')}
                      </p>
                    )}
                  </div>
                )}
                <p className="text-xs text-ink-400 mt-2">
                  أُرسل في {new Date(q.createdAt).toLocaleDateString('ar-SA')}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <MessageSquare className="w-10 h-10 text-ink-400 mx-auto mb-3" />
            <p className="text-ink-500">لم ترسل أي أسئلة بعد.</p>
            <p className="text-sm text-ink-400 mt-1">تصفح المعلمين واطرح سؤالاً لأحد المعلمين.</p>
            <Link to="/teachers" className="btn-outline text-sm mt-3">تصفح المعلمين</Link>
          </div>
        )}
      </div>

      <button onClick={() => void logout().then(() => navigate('/'))} className="btn-outline w-full mt-6 text-red-600 border-red-100 hover:bg-red-50">
        <LogOut className="w-4 h-4" />
        تسجيل الخروج
      </button>
    </div>
  );
}
