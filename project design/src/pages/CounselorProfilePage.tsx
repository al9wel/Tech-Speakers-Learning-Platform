import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Heart, Send, ArrowRight, Award, Briefcase, GraduationCap, MessageSquare, Lock } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useApp } from '@/context/AppContext';
import type { Counselor } from '@/data/sampleData';

export default function CounselorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { fetchCounselor, startOrJoinConversation, sendMsg } = useData();
  const { user } = useApp();
  const navigate = useNavigate();
  const [counselor, setCounselor] = useState<Counselor | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMsg, setShowMsg] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const c = await fetchCounselor(id);
      setCounselor(c);
      setLoading(false);
    })();
  }, [id, fetchCounselor]);

  const canMessage = counselor?.status === 'approved' && counselor?.isVisible;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!counselor || !message.trim()) return;
    setBusy(true);
    setError('');
    const { conversationId, error: convError } = await startOrJoinConversation(
      user.id, user.name, counselor.id
    );
    if (convError || !conversationId) {
      setError(convError || 'فشل بدء المحادثة');
      setBusy(false);
      return;
    }
    const { error: sendError } = await sendMsg(conversationId, user.id, 'student', message);
    if (sendError) {
      setError(sendError);
      setBusy(false);
      return;
    }
    setSuccess(true);
    setBusy(false);
    setMessage('');
    setTimeout(() => {
      setShowMsg(false);
      setSuccess(false);
    }, 2500);
  };

  if (loading) {
    return (
      <div className="container-page py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!counselor || counselor.status !== 'approved' || !counselor.isVisible) {
    return (
      <div className="container-page py-16 text-center">
        <Heart className="w-12 h-12 text-ink-300 mx-auto mb-4" />
        <h1 className="font-heading font-bold text-xl text-ink-900 mb-2">المستشار غير متاح</h1>
        <p className="text-ink-500 mb-6">هذا المستشار غير متاح حالياً أو لم يتم اعتماده بعد.</p>
        <Link to="/support" className="btn-primary text-sm">العودة إلى الدعم النفسي</Link>
      </div>
    );
  }

  return (
    <div className="container-page py-8 animate-page max-w-3xl">
      <Link to="/support" className="flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700 mb-6">
        <ArrowRight className="w-4 h-4" />
        العودة إلى الدعم النفسي
      </Link>

      <div className="card p-8">
        <div className="flex items-start gap-5 mb-6">
          {counselor.photoUrl ? (
            <img src={counselor.photoUrl} alt={counselor.name} className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 font-bold text-2xl">
              {counselor.name.charAt(0)}
            </div>
          )}
          <div className="flex-1">
            <h1 className="font-heading font-extrabold text-2xl text-ink-900">{counselor.name}</h1>
            <p className="text-ink-500 mt-1">{counselor.specialization}</p>
            <span className="chip bg-sage-50 text-sage-dark text-xs mt-2">معتمد</span>
          </div>
        </div>

        {counselor.bio && (
          <div className="mb-6">
            <h3 className="font-heading font-bold text-ink-900 mb-2">نبذة تعريفية</h3>
            <p className="text-ink-600 leading-relaxed">{counselor.bio}</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {counselor.qualifications && (
            <div className="card bg-ink-50/50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-ink-400" />
                <h4 className="text-sm font-medium text-ink-700">المؤهلات</h4>
              </div>
              <p className="text-sm text-ink-600">{counselor.qualifications}</p>
            </div>
          )}
          {counselor.experience > 0 && (
            <div className="card bg-ink-50/50 p-4">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-4 h-4 text-ink-400" />
                <h4 className="text-sm font-medium text-ink-700">سنوات الخبرة</h4>
              </div>
              <p className="text-sm text-ink-600">{counselor.experience} سنة</p>
            </div>
          )}
          {counselor.supportAreas && (
            <div className="card bg-ink-50/50 p-4 sm:col-span-2">
              <div className="flex items-center gap-2 mb-1">
                <GraduationCap className="w-4 h-4 text-ink-400" />
                <h4 className="text-sm font-medium text-ink-700">مجالات الدعم</h4>
              </div>
              <p className="text-sm text-ink-600">{counselor.supportAreas}</p>
            </div>
          )}
        </div>

        {canMessage && (
          <div>
            {!showMsg ? (
              <button onClick={() => setShowMsg(true)} className="btn-primary w-full">
                <MessageSquare className="w-4 h-4" />
                إرسال رسالة
              </button>
            ) : success ? (
              <div className="card bg-sage-50 border-sage-100 p-4 text-center animate-scale-in">
                <p className="text-sage-dark font-medium">تم إرسال رسالتك بنجاح. سيطلع عليها المستشار.</p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-3 animate-scale-in">
                {!user && (
                  <div className="card bg-amber-50 border-amber-100 p-3 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <p className="text-sm text-amber-700">يجب تسجيل الدخول لإرسال رسالة.</p>
                  </div>
                )}
                {error && (
                  <div className="card bg-red-50 border-red-100 p-3 text-sm text-red-700">{error}</div>
                )}
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="اكتب رسالتك هنا..."
                  rows={4}
                  className="input-field resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button type="submit" disabled={busy || !message.trim()} className="btn-primary text-sm">
                    <Send className="w-4 h-4" />
                    {busy ? 'جاري الإرسال...' : 'إرسال'}
                  </button>
                  <button type="button" onClick={() => setShowMsg(false)} className="btn-ghost text-sm">إلغاء</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
