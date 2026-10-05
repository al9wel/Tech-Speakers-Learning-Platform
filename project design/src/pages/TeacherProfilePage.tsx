import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Users, Bell, BellOff, Send, MessageCircle, ExternalLink,
  Lock, Plus, Check, XCircle, AlertCircle, GraduationCap, BookCopy, Clock,
  BookOpen, FileText, Video, File, Image as ImageIcon, Link as LinkIcon,
  Loader2, MessageSquare, HelpCircle,
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useApp } from '@/context/AppContext';
import type { Resource } from '@/data/sampleData';
import { resourceTypeLabels } from '@/data/sampleData';
import type { TeacherQuestion } from '@/lib/dataAccess';

export default function TeacherProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { teachers, announcements, loading, subscribe, unsubscribe, checkSubscribed, getSubscriberCount, getTeacherContent, sendQuestion, getPublicQAs } = useData();
  const teacher = teachers.find((t) => t.id === id);
  const { notificationEnabled, toggleNotification, user } = useApp();
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [question, setQuestion] = useState('');
  const [questionSent, setQuestionSent] = useState(false);

  const [subscribed, setSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subLoading, setSubLoading] = useState(false);
  const [subError, setSubError] = useState('');
  const [teacherContent, setTeacherContent] = useState<Resource[]>([]);
  const [publicQAs, setPublicQAs] = useState<TeacherQuestion[]>([]);
  const [questionSending, setQuestionSending] = useState(false);
  const [questionError, setQuestionError] = useState('');

  useEffect(() => {
    if (!teacher) return;
    getSubscriberCount(teacher.id).then(setSubscriberCount);
    if (user?.email) {
      checkSubscribed(teacher.id, user.email).then(setSubscribed);
    } else {
      setSubscribed(false);
    }
    getTeacherContent(teacher.id).then(setTeacherContent);
    getPublicQAs(teacher.id).then(setPublicQAs);
  }, [teacher, user?.email, getSubscriberCount, checkSubscribed, getTeacherContent, getPublicQAs]);

  if (loading) {
    return (
      <div className="container-page py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="container-page py-20 text-center">
        <p className="text-ink-500 text-lg">المعلم غير موجود.</p>
        <Link to="/teachers" className="btn-outline mt-4">العودة للمعلمين</Link>
      </div>
    );
  }

  const hasNotification = notificationEnabled.has(teacher.id);
  const questionsAreOpen = !!teacher.questionsOpen;
  const teacherAnnouncements = announcements.filter((a) => a.teacherId === teacher.id);
  const isTeacherOwner = user?.role === 'teacher' && user.name === teacher.name;

  const handleSubscribe = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (!user.email) {
      setSubError('يرجى تحديث بريدك الإلكتروني في حسابك.');
      return;
    }
    setSubLoading(true);
    setSubError('');
    const result = await subscribe(teacher.id, user.name || 'مستخدم', user.email);
    setSubLoading(false);
    if (result.ok) {
      setSubscribed(true);
      const count = await getSubscriberCount(teacher.id);
      setSubscriberCount(count);
    } else {
      setSubError(result.error || 'حدث خطأ أثناء الاشتراك.');
    }
  };

  const handleUnsubscribe = async () => {
    if (!user?.email) return;
    setSubLoading(true);
    setSubError('');
    const ok = await unsubscribe(teacher.id, user.email);
    setSubLoading(false);
    if (ok) {
      setSubscribed(false);
      const count = await getSubscriberCount(teacher.id);
      setSubscriberCount(count);
    } else {
      setSubError('حدث خطأ أثناء إلغاء الاشتراك.');
    }
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setQuestionSending(true);
    setQuestionError('');
    const ok = await sendQuestion({
      teacherId: teacher.id,
      studentId: user.id,
      studentName: user.name || 'طالب',
      question: question.trim(),
    });
    setQuestionSending(false);
    if (ok) {
      setQuestionSent(true);
      setQuestion('');
      setTimeout(() => { setQuestionSent(false); setShowQuestionForm(false); }, 2500);
    } else {
      setQuestionError('حدث خطأ أثناء إرسال السؤال. حاول مرة أخرى.');
    }
  };

  return (
    <div className="animate-page">
      {/* Header */}
      <div className="bg-parchment border-b border-ink-100/60">
        <div className="container-page py-8">
          <Link to="/teachers" className="text-sm text-ink-500 hover:text-ink-700 flex items-center gap-1 mb-6">
            <ArrowRight className="w-4 h-4" />
            المعلمون
          </Link>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {teacher.avatarUrl ? (
              <img src={teacher.avatarUrl} alt={teacher.name} className="w-24 h-24 rounded-full object-cover border-2 border-ink-100 shrink-0" />
            ) : (
              <div className="w-24 h-24 rounded-full bg-ink-100 flex items-center justify-center text-ink-700 font-heading font-bold text-3xl shrink-0">
                {teacher.avatarInitials}
              </div>
            )}
            <div className="flex-1">
              <h1 className="font-heading font-extrabold text-2xl md:text-3xl text-ink-900">{teacher.name}</h1>
              {teacher.specialization && (
                <p className="text-gold-dark font-medium mt-1">{teacher.specialization}</p>
              )}
              {!teacher.specialization && (
                <p className="text-gold-dark font-medium mt-1">{teacher.subjectName}</p>
              )}
              <p className="text-ink-600 mt-2 leading-relaxed max-w-xl">{teacher.bio}</p>

              <div className="flex flex-wrap items-center gap-4 mt-3">
                <span className="flex items-center gap-1.5 text-sm text-ink-500">
                  <Users className="w-4 h-4" />
                  عدد الطلاب المشتركين: {subscriberCount}
                </span>
                {teacher.yearsExperience > 0 && (
                  <span className="flex items-center gap-1.5 text-sm text-ink-500">
                    <Clock className="w-4 h-4" />
                    {teacher.yearsExperience} سنوات خبرة
                  </span>
                )}
                {questionsAreOpen ? (
                  <span className="chip bg-sage-50 text-sage-dark text-xs">
                    <span className="w-2 h-2 rounded-full bg-sage-dark" />
                    الأسئلة مفتوحة
                  </span>
                ) : (
                  <span className="chip bg-ink-50 text-ink-400 text-xs">
                    <Lock className="w-3.5 h-3.5" />
                    الأسئلة مغلقة
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info cards */}
          {(teacher.subjects || teacher.yearsExperience > 0) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 max-w-xl">
              {teacher.subjects && (
                <div className="card p-3 flex items-center gap-2">
                  <BookCopy className="w-4 h-4 text-gold-dark shrink-0" />
                  <div>
                    <p className="text-xs text-ink-400">المواد</p>
                    <p className="text-sm font-medium text-ink-900">{teacher.subjects}</p>
                  </div>
                </div>
              )}
              {teacher.yearsExperience > 0 && (
                <div className="card p-3 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-gold-dark shrink-0" />
                  <div>
                    <p className="text-xs text-ink-400">سنوات الخبرة</p>
                    <p className="text-sm font-medium text-ink-900">{teacher.yearsExperience} سنة</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-6">
            {subscribed ? (
              <>
                <button onClick={handleUnsubscribe} disabled={subLoading} className="btn-outline">
                  <Check className="w-4 h-4" />
                  {subLoading ? '...' : 'مشترك'}
                </button>
                <button onClick={handleUnsubscribe} disabled={subLoading} className="btn-ghost text-sm text-red-600">
                  <XCircle className="w-4 h-4" />
                  {subLoading ? '...' : 'إلغاء الاشتراك'}
                </button>
              </>
            ) : (
              <button onClick={handleSubscribe} disabled={subLoading} className="btn-primary">
                <Plus className="w-4 h-4" />
                {subLoading ? '...' : 'اشتراك'}
              </button>
            )}
            {subscribed && (
              <button
                onClick={() => toggleNotification(teacher.id)}
                className={hasNotification ? 'btn-gold' : 'btn-outline'}
              >
                {hasNotification ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                {hasNotification ? 'الإشعارات مفعّلة' : 'تفعيل الإشعارات'}
              </button>
            )}
            {isTeacherOwner && (
              <Link to="/teacher" className="btn-outline text-sm">
                <GraduationCap className="w-4 h-4" />
                واجهة المعلم
              </Link>
            )}
          </div>

          {subError && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
              <AlertCircle className="w-4 h-4" />
              {subError}
            </div>
          )}
        </div>
      </div>

      <div className="container-page py-8 space-y-8">
        {/* External links */}
        {teacher.links && teacher.links.length > 0 && (
          <div>
            <h2 className="font-heading font-bold text-ink-900 text-xl mb-3">روابط المعلم</h2>
            <div className="flex flex-wrap gap-2">
              {teacher.links.map((link) => (
                <a
                  key={link.label}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline text-sm"
                >
                  {link.type === 'telegram' ? <Send className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                  {link.label}
                  <ExternalLink className="w-3.5 h-3.5 opacity-50" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Announcements */}
        <div>
          <h2 className="font-heading font-bold text-ink-900 text-xl mb-4">الإعلانات</h2>
          {teacherAnnouncements.length > 0 ? (
            <div className="space-y-3">
              {teacherAnnouncements.map((ann) => (
                <div key={ann.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="font-heading font-bold text-ink-900">{ann.title}</h3>
                    <span className="text-xs text-ink-400 shrink-0">{ann.date} — {ann.time}</span>
                  </div>
                  <p className="text-sm text-ink-600 leading-relaxed">{ann.body}</p>
                  {ann.link && (
                    <a
                      href={ann.link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-gold text-sm mt-3"
                    >
                      {ann.link.label}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-ink-400">لا توجد إعلانات حالياً.</p>
          )}
        </div>

        {/* Teacher content */}
        <div>
          <h2 className="font-heading font-bold text-ink-900 text-xl mb-4">محتوى المعلم</h2>
          {teacherContent.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teacherContent.map((r) => (
                <div key={r.id} className="card-hover p-4 flex flex-col gap-2 group">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center text-gold-dark shrink-0">
                      {r.type === 'pdf' || r.type === 'file' ? <File className="w-4 h-4" /> :
                       r.type === 'video' ? <Video className="w-4 h-4" /> :
                       r.type === 'image' ? <ImageIcon className="w-4 h-4" /> :
                       r.type === 'link' ? <LinkIcon className="w-4 h-4" /> :
                       <FileText className="w-4 h-4" />}
                    </div>
                    <span className="chip bg-sage-50 text-sage-dark text-xs">محتوى المعلم</span>
                  </div>
                  <h3 className="font-heading font-bold text-ink-900 leading-snug">{r.title}</h3>
                  <p className="text-sm text-ink-500">{r.subjectName} — {r.lesson}</p>
                  <p className="text-sm text-ink-600 line-clamp-2">{r.description}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-ink-100/60">
                    <span className="chip bg-ink-50 text-ink-500 text-xs">{resourceTypeLabels[r.type]}</span>
                    {r.fileUrl && (
                      <a
                        href={r.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-ghost text-sm text-gold-dark hover:bg-gold/10"
                      >
                        عرض
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <BookOpen className="w-10 h-10 text-ink-400 mx-auto mb-3" />
              <p className="text-ink-500">لا يوجد محتوى تعليمي لهذا المعلم حالياً.</p>
            </div>
          )}
        </div>

        {/* Public Q&As from this teacher */}
        <div>
          <h2 className="font-heading font-bold text-ink-900 text-xl mb-4">أسئلة وأجوبة منشورة</h2>
          {publicQAs.length > 0 ? (
            <div className="space-y-3">
              {publicQAs.map((qa) => (
                <div key={qa.id} className="card p-5">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-lg bg-gold/10 flex items-center justify-center text-gold-dark shrink-0">
                      <HelpCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-ink-900 leading-snug">{qa.title || qa.question}</h3>
                      <span className="chip bg-sage-50 text-sage-dark text-xs mt-1">سؤال وأجوبة منشور</span>
                    </div>
                  </div>
                  <div className="space-y-2 pl-2">
                    <div className="border-r-2 border-ink-100 pr-3">
                      <p className="text-xs text-ink-400 mb-1">السؤال</p>
                      <p className="text-sm text-ink-700 leading-relaxed">{qa.question}</p>
                    </div>
                    <div className="border-r-2 border-gold/40 pr-3">
                      <p className="text-xs text-gold-dark mb-1">الإجابة</p>
                      <p className="text-sm text-ink-700 leading-relaxed">{qa.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <MessageSquare className="w-10 h-10 text-ink-400 mx-auto mb-3" />
              <p className="text-ink-500">لا توجد أسئلة وأجوبة منشورة حالياً.</p>
            </div>
          )}
        </div>

        {/* Private question form */}
        <div>
          <h2 className="font-heading font-bold text-ink-900 text-xl mb-4">طرح سؤال خاص</h2>
          {questionsAreOpen ? (
            <div className="card p-6">
              {!showQuestionForm ? (
                <div className="text-center">
                  <p className="text-ink-600 mb-4">الأسئلة مفتوحة الآن. يمكنك طرح سؤالك الخاص للمعلم.</p>
                  <button onClick={() => setShowQuestionForm(true)} className="btn-primary">
                    <Plus className="w-4 h-4" />
                    طرح سؤال
                  </button>
                </div>
              ) : questionSent ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-sage-50 flex items-center justify-center mx-auto mb-3">
                    <Check className="w-6 h-6 text-sage-dark" />
                  </div>
                  <p className="text-ink-700 font-medium">تم إرسال سؤالك بنجاح!</p>
                  <p className="text-sm text-ink-500 mt-1">سيظهر الرد في صفحة حسابك عندما يجيب المعلم.</p>
                </div>
              ) : (
                <form onSubmit={handleQuestionSubmit} className="space-y-3">
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="اكتب سؤالك هنا..."
                    rows={4}
                    className="input-field resize-none"
                    autoFocus
                  />
                  <p className="text-xs text-ink-400">
                    ملاحظة: لا يتم عرض رقمك أو معلوماتك الخاصة للمعلم. سيظهر الرد في صفحة حسابك.
                  </p>
                  {questionError && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {questionError}
                    </p>
                  )}
                  <div className="flex gap-2">
                    <button type="submit" disabled={questionSending} className="btn-primary">
                      {questionSending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {questionSending ? 'جاري الإرسال...' : 'إرسال السؤال'}
                    </button>
                    <button type="button" onClick={() => setShowQuestionForm(false)} className="btn-ghost">إلغاء</button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="card p-6 text-center">
              <Lock className="w-8 h-8 text-ink-400 mx-auto mb-2" />
              <p className="text-ink-500">الأسئلة مغلقة حالياً من قبل المعلم.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
