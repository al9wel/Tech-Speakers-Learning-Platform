import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Users, Mail, Lock, User as UserIcon, BookOpen, Heart } from 'lucide-react';
import { useApp, type UserRole } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { getHomeForRole } from '@/App';
import Logo, { LogoMark } from '@/components/Logo';

export default function LoginPage() {
  const { login, signup, user, authLoading } = useApp();
  const { subjects } = useData();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [role, setRole] = useState<UserRole>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [username, setUsername] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (role === 'teacher' && subjects.length > 0 && !subjectId) {
      setSubjectId(subjects[0].id);
    }
  }, [role, subjects, subjectId]);

  const roles: { key: UserRole; label: string; icon: typeof GraduationCap; desc: string }[] = [
    { key: 'student', label: 'طالب', icon: GraduationCap, desc: 'تصفح المواد والموارد' },
    { key: 'teacher', label: 'معلم', icon: Users, desc: 'نشر الإعلانات والإجابة على الأسئلة' },
    { key: 'counselor', label: 'مستشار نفسي', icon: Heart, desc: 'تقديم الدعم النفسي للطلاب' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup' && !name.trim()) {
      setError('يرجى إدخال الاسم.');
      return;
    }
    if (!email.trim() || !password) {
      setError('يرجى إدخال البريد وكلمة المرور.');
      return;
    }
    if (password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }
    if (mode === 'signup' && role === 'teacher' && !subjectId) {
      setError('يرجى اختيار المادة.');
      return;
    }
    if (mode === 'signup' && role === 'counselor' && !username.trim()) {
      setError('يرجى إدخال اسم المستخدم.');
      return;
    }

    setBusy(true);
    let result: { error?: string };
    if (mode === 'login') {
      result = await login(email.trim(), password);
    } else {
      result = await signup({
        email: email.trim(),
        password,
        name: name.trim(),
        role,
        subjectId: role === 'teacher' ? subjectId : undefined,
        username: role === 'counselor' ? username.trim() : undefined,
        specialization: role === 'counselor' ? specialization.trim() : undefined,
      });
    }
    setBusy(false);

    if (result.error) {
      setError(result.error);
      return;
    }

    // Navigate based on the resolved role (read fresh from context)
  };

  // After successful login/signup, the AppContext user state updates.
  // Use an effect to redirect when user becomes available.
  useEffect(() => {
    if (!authLoading && user) {
      navigate(getHomeForRole(user.role), { replace: true });
    }
  }, [user, authLoading, navigate]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 animate-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <LogoMark />
          </div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-900">
            {mode === 'login' ? 'تسجيل الدخول' : 'إنشاء حساب'}
          </h1>
          <p className="text-sm text-ink-500 mt-1">
            {mode === 'login' ? 'مرحباً بعودتك إلى مِداد' : 'انضم إلى منصة مِداد التعليمية'}
          </p>
        </div>

        {/* Role selector - only for signup */}
        {mode === 'signup' && (
          <div className="grid grid-cols-3 gap-2 mb-5">
            {roles.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                  role === r.key
                    ? 'border-gold bg-gold/10 text-gold-dark'
                    : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
                }`}
              >
                <r.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{r.label}</span>
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="card bg-red-50 border-red-100 p-3 mb-4 text-sm text-red-700 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">الاسم</label>
              <div className="relative">
                <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="اسمك"
                  className="input-field pr-10"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && role === 'teacher' && (
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">المادة الرئيسية</label>
              <div className="relative">
                <BookOpen className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  className="input-field pr-10"
                  required
                >
                  {subjects.length === 0 && <option value="">لا توجد مواد</option>}
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-ink-400 mt-1.5">
                سيتم إنشاء حساب معلم بحالة "قيد المراجعة" حتى يعتمده المشرف.
              </p>
            </div>
          )}

          {mode === 'signup' && role === 'counselor' && (
            <>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">اسم المستخدم *</label>
                <div className="relative">
                  <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="مثال: counselor_ahmad"
                    className="input-field pr-10"
                    dir="ltr"
                    required
                  />
                </div>
                <p className="text-xs text-ink-400 mt-1.5">سيظهر هذا الاسم للطلاب في الرسائل.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">التخصص</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="مثال: علم نفس إكلينيكي"
                  className="input-field"
                />
              </div>
              <div className="card bg-amber-50 border-amber-100 p-3">
                <p className="text-xs text-amber-700">
                  سيتم إنشاء حساب مستشار نفسي بحالة "قيد المراجعة". لن يظهر ملفك للجمهور حتى يعتمده المشرف.
                </p>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="input-field pr-10"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-field pr-10"
                dir="ltr"
              />
            </div>
          </div>

          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'جاري المعالجة...' : mode === 'login' ? 'تسجيل الدخول' : 'إنشاء الحساب'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-500 mt-4">
          {mode === 'login' ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}{' '}
          <button
            type="button"
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-gold-dark font-medium hover:underline"
          >
            {mode === 'login' ? 'إنشاء حساب' : 'تسجيل الدخول'}
          </button>
        </p>
      </div>
    </div>
  );
}
