import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, Users, FileText, CheckCircle2, XCircle, Clock,
  Save, User as UserIcon, Calendar, AlertCircle, Check,
  Upload, Loader2, Image as ImageIcon, BookOpen, Plus, Pencil,
  Trash2, Eye, X, Link as LinkIcon, Video, File,
  MessageSquare, HelpCircle, Send, Lock,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import type { TeacherRow, SubscriptionRow, ResourceRow, TeacherQuestion } from '@/lib/dataAccess';
import { supabase } from '@/lib/supabase';
import type { Resource, ResourceType } from '@/data/sampleData';
import { resourceTypeLabels } from '@/data/sampleData';
import FilePreview from '@/components/FilePreview';

type Tab = 'profile' | 'content' | 'questions' | 'stats' | 'subscribers';

const CONTENT_TYPES: { value: ResourceType; label: string }[] = [
  { value: 'pdf', label: 'ملف PDF' },
  { value: 'video', label: 'فيديو' },
  { value: 'image', label: 'صورة' },
  { value: 'link', label: 'رابط' },
  { value: 'lesson', label: 'درس' },
  { value: 'summary', label: 'ملخص' },
  { value: 'presentation', label: 'عرض' },
  { value: 'file', label: 'ملف' },
];

export default function TeacherDashboardPage() {
  const { user } = useApp();
  const {
    subjects, editTeacher, getTeacherByUserId, getSubscribers, getSubscriberCount,
    contributions, createTeacherContent, editTeacherContent, deleteTeacherContent,
    getTeacherContent, uploadFile, uploadThumbnail,
  adminResources,
    getTeacherQuestions, replyToQuestion, getPublicQAs, createPublicQA, editPublicQA, removePublicQA,
  } = useData();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('profile');
  const [teacher, setTeacher] = useState<TeacherRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [subscribers, setSubscribers] = useState<SubscriptionRow[]>([]);
  const [subscriberCount, setSubscriberCount] = useState(0);

  // Content management state
  const [teacherContent, setTeacherContent] = useState<Resource[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [showContentForm, setShowContentForm] = useState(false);
  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [contentForm, setContentForm] = useState({
    title: '', description: '', subject_id: '', lesson: '', type: 'pdf' as ResourceType,
    fileUrl: '', thumbnailUrl: '',
  });
  const [fileUploading, setFileUploading] = useState(false);
  const [thumbUploading, setThumbUploading] = useState(false);
  const [fileError, setFileError] = useState('');
  const [contentError, setContentError] = useState('');
  const [contentSuccess, setContentSuccess] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);

  // Questions state
  const [privateQuestions, setPrivateQuestions] = useState<TeacherQuestion[]>([]);
  const [publicQAList, setPublicQAList] = useState<TeacherQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionTab, setQuestionTab] = useState<'inbox' | 'public'>('inbox');
  const [openQuestion, setOpenQuestion] = useState<TeacherQuestion | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [answering, setAnswering] = useState(false);
  const [answerError, setAnswerError] = useState('');
  const [qaForm, setQAForm] = useState({ title: '', question: '', answer: '' });
  const [editingQAId, setEditingQAId] = useState<string | null>(null);
  const [qaSaving, setQASaving] = useState(false);
  const [qaError, setQAError] = useState('');
  const [qaSuccess, setQASuccess] = useState('');
  const [confirmDeleteQA, setConfirmDeleteQA] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    subject_id: '',
    bio: '',
    specialization: '',
    subjects: '',
    years_experience: 0,
    avatar_initials: '',
    avatar_url: '',
  });
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setAvatarError('');

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setAvatarError('صيغة الصورة غير مدعومة. يرجى استخدام JPG أو PNG أو WebP.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setAvatarError('حجم الصورة كبير جداً. الحد الأقصى 5 ميجابايت.');
      return;
    }

    setAvatarUploading(true);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;
    const filePath = `avatars/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setAvatarUploading(false);
      setAvatarError('فشل رفع الصورة. حاول مرة أخرى.');
      console.error('Avatar upload error:', uploadError);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('files')
      .getPublicUrl(filePath);

    setAvatarUploading(false);
    setForm((prev) => ({ ...prev, avatar_url: publicUrlData.publicUrl }));
  };

  const loadTeacherContent = useCallback(async (teacherId: string) => {
    setContentLoading(true);
    const content = await getTeacherContent(teacherId);
    setTeacherContent(content);
    setContentLoading(false);
  }, [getTeacherContent]);

  const loadQuestions = useCallback(async (teacherId: string) => {
    setQuestionsLoading(true);
    const [priv, pub] = await Promise.all([
      getTeacherQuestions(teacherId),
      getPublicQAs(teacherId),
    ]);
    setPrivateQuestions(priv);
    setPublicQAList(pub);
    setQuestionsLoading(false);
  }, [getTeacherQuestions, getPublicQAs]);

  const loadTeacher = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    const t = await getTeacherByUserId(user.id);
    setTeacher(t);
    if (t) {
      setForm({
        name: t.name,
        subject_id: t.subject_id,
        bio: t.bio,
        specialization: t.specialization || '',
        subjects: t.subjects || '',
        years_experience: t.years_experience || 0,
        avatar_initials: t.avatar_initials,
        avatar_url: t.avatar_url || '',
      });
      const [subs, count] = await Promise.all([
        getSubscribers(t.id),
        getSubscriberCount(t.id),
      ]);
      setSubscribers(subs);
      setSubscriberCount(count);
      await loadTeacherContent(t.id);
      await loadQuestions(t.id);
    }
    setLoading(false);
  }, [user?.id, getTeacherByUserId, getSubscribers, getSubscriberCount, loadTeacherContent, loadQuestions]);

  useEffect(() => {
    if (!user || user.role !== 'teacher') {
      navigate('/login');
      return;
    }
    loadTeacher();
  }, [user, navigate, loadTeacher]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;
    setError('');
    setSaving(true);
    const ok = await editTeacher(teacher.id, {
      name: form.name,
      subject_id: form.subject_id,
      bio: form.bio,
      specialization: form.specialization,
      subjects: form.subjects,
      years_experience: Number(form.years_experience) || 0,
      avatar_initials: form.avatar_initials,
      avatar_url: form.avatar_url || null,
    });
    setSaving(false);
    if (ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      await loadTeacher();
    } else {
      setError('حدث خطأ أثناء حفظ التعديلات.');
    }
  };

  // ---- Content management handlers ----

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setFileError('');

    if (file.size > 50 * 1024 * 1024) {
      setFileError('حجم الملف كبير جداً. الحد الأقصى 50 ميجابايت.');
      return;
    }

    setFileUploading(true);
    const result = await uploadFile(file);
    setFileUploading(false);
    if (result.url) {
      setContentForm((prev) => ({ ...prev, fileUrl: result.url! }));
    } else {
      setFileError(result.error || 'فشل رفع الملف.');
    }
  };

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setFileError('صيغة الصورة المصغرة غير مدعومة. JPG، PNG، WebP.');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setFileError('حجم الصورة المصغرة كبير جداً. الحد الأقصى 5 ميجابايت.');
      return;
    }

    setThumbUploading(true);
    const result = await uploadThumbnail(file);
    setThumbUploading(false);
    if (result.url) {
      setContentForm((prev) => ({ ...prev, thumbnailUrl: result.url! }));
    } else {
      setFileError(result.error || 'فشل رفع الصورة المصغرة.');
    }
  };

  const resetContentForm = () => {
    setShowContentForm(false);
    setEditingContentId(null);
    setContentForm({ title: '', description: '', subject_id: '', lesson: '', type: 'pdf', fileUrl: '', thumbnailUrl: '' });
    setFileError('');
    setContentError('');
  };

  const startAddContent = () => {
    resetContentForm();
    setShowContentForm(true);
    if (teacher) {
      setContentForm((prev) => ({ ...prev, subject_id: teacher.subject_id }));
    }
  };

  const startEditContent = (r: Resource) => {
    resetContentForm();
    setEditingContentId(r.id);
    setContentForm({
      title: r.title,
      description: r.description,
      subject_id: r.subjectId,
      lesson: r.lesson,
      type: r.type,
      fileUrl: r.fileUrl || '',
      thumbnailUrl: r.thumbnailUrl || '',
    });
    setShowContentForm(true);
  };

  const handleContentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacher) return;
    setContentError('');

    if (!contentForm.title.trim() || !contentForm.subject_id || !contentForm.lesson.trim()) {
      setContentError('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }

    const isLink = contentForm.type === 'link';
    if (!isLink && !contentForm.fileUrl) {
      setContentError('يرجى رفع ملف أو إدخال رابط الملف.');
      return;
    }
    if (isLink && !contentForm.fileUrl) {
      setContentError('يرجى إدخال الرابط الخارجي.');
      return;
    }

    setSaving(true);
    const payload = {
      teacherId: teacher.id,
      subjectId: contentForm.subject_id,
      title: contentForm.title.trim(),
      lesson: contentForm.lesson.trim(),
      type: contentForm.type,
      author: teacher.name,
      description: contentForm.description.trim(),
      fileUrl: contentForm.fileUrl || null,
      thumbnailUrl: contentForm.thumbnailUrl || null,
    };

    let ok: boolean;
    if (editingContentId) {
      ok = await editTeacherContent(editingContentId, teacher.id, {
        title: payload.title,
        lesson: payload.lesson,
        type: payload.type,
        description: payload.description,
        subject_id: payload.subjectId,
        file_url: payload.fileUrl,
        thumbnail_url: payload.thumbnailUrl,
      });
    } else {
      ok = await createTeacherContent(payload);
    }

    setSaving(false);

    if (ok) {
      setContentSuccess(editingContentId ? 'تم تحديث المحتوى بنجاح' : 'تم إضافة المحتوى بنجاح');
      setTimeout(() => setContentSuccess(''), 4000);
      resetContentForm();
      await loadTeacherContent(teacher.id);
    } else {
      setContentError('حدث خطأ أثناء حفظ المحتوى.');
    }
  };

  const handleDeleteContent = async () => {
    if (!confirmDeleteId || !teacher) return;
    const ok = await deleteTeacherContent(confirmDeleteId, teacher.id);
    setConfirmDeleteId(null);
    if (ok) {
      setContentSuccess('تم حذف المحتوى بنجاح');
      setTimeout(() => setContentSuccess(''), 4000);
      await loadTeacherContent(teacher.id);
    } else {
      setContentError('حدث خطأ أثناء حذف المحتوى.');
      setTimeout(() => setContentError(''), 4000);
    }
  };

  if (loading) {
    return (
      <div className="container-page py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
        <p className="text-ink-500 mt-3">جاري التحميل...</p>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="container-page py-20 text-center">
        <AlertCircle className="w-12 h-12 text-ink-400 mx-auto mb-4" />
        <h1 className="font-heading font-bold text-ink-700 text-xl">لم يتم العثور على ملف معلم</h1>
        <p className="text-ink-500 mt-2">يرجى التواصل مع المشرف لربط حسابك بملف معلم.</p>
        <Link to="/" className="btn-outline mt-4">العودة للرئيسية</Link>
      </div>
    );
  }

  const teacherContributions = contributions.filter((c) => c.studentName === user?.name);

  const tabs: { key: Tab; label: string; icon: typeof GraduationCap }[] = [
    { key: 'profile', label: 'الملف الشخصي', icon: UserIcon },
    { key: 'content', label: 'محتواي', icon: BookOpen },
    { key: 'questions', label: 'الأسئلة', icon: MessageSquare },
    { key: 'stats', label: 'الإحصائيات', icon: FileText },
    { key: 'subscribers', label: 'الطلاب المشتركين', icon: Users },
  ];

  return (
    <div className="container-page py-8 animate-page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center text-gold-dark">
          <GraduationCap className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-900">واجهة المعلم</h1>
          <p className="text-sm text-ink-500">إدارة ملفك الشخصي ومتابعة طلابك</p>
        </div>
      </div>

      {/* Approval status banner */}
      {!teacher.is_approved && (
        <div className="card bg-amber-50 border-amber-100 p-4 mb-6 flex items-center gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-amber-700">
            حسابك قيد المراجعة. لن يظهر ملفك للجمهور حتى يعتمده المشرف.
          </p>
        </div>
      )}
      {teacher.is_hidden && (
        <div className="card bg-red-50 border-red-100 p-4 mb-4 flex items-center gap-3">
          <XCircle className="w-5 h-5 text-red-600 shrink-0" />
          <p className="text-sm text-red-700">
            ملفك مخفي حالياً من قبل المشرف. لن يظهر للجمهور.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide border-b border-ink-100">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              tab === t.key
                ? 'border-gold text-ink-900'
                : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {tab === 'profile' && (
        <div className="max-w-2xl">
          {saved && (
            <div className="card bg-sage-50 border-sage-100 p-3 mb-4 flex items-center gap-2 animate-scale-in">
              <Check className="w-4 h-4 text-sage-dark" />
              <p className="text-sm text-sage-dark">تم حفظ التعديلات بنجاح.</p>
            </div>
          )}
          {error && (
            <div className="card bg-red-50 border-red-100 p-3 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          <form onSubmit={handleSave} className="card p-6 space-y-5">
            <h2 className="font-heading font-bold text-ink-900 text-lg">تعديل الملف الشخصي</h2>

            {/* Avatar preview */}
            <div className="flex items-start gap-4">
              {form.avatar_url ? (
                <img src={form.avatar_url} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-ink-100 shrink-0" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-ink-100 flex items-center justify-center text-ink-700 font-heading font-bold text-2xl shrink-0">
                  {form.avatar_initials || '؟'}
                </div>
              )}
              <div className="flex-1 space-y-2">
                <label className="block text-sm font-medium text-ink-700">الصورة الشخصية</label>
                <div className="flex flex-wrap gap-2">
                  <label className={`btn-outline text-sm cursor-pointer ${avatarUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                    {avatarUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        جاري الرفع...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        رفع صورة من الجهاز
                      </>
                    )}
                    <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/jpeg,image/png,image/webp" />
                  </label>
                  {form.avatar_url && (
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, avatar_url: '' })}
                      className="btn-ghost text-sm text-red-600"
                    >
                      إزالة الصورة
                    </button>
                  )}
                </div>
                {avatarError && (
                  <p className="text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {avatarError}
                  </p>
                )}
                <details className="text-xs text-ink-400">
                  <summary className="cursor-pointer hover:text-ink-600">أو أدخل رابط صورة يدوًا</summary>
                  <input
                    type="url"
                    value={form.avatar_url}
                    onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
                    placeholder="https://example.com/photo.jpg"
                    className="input-field mt-2"
                    dir="ltr"
                  />
                </details>
                <p className="text-xs text-ink-400 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5" />
                  JPG, PNG, WebP — حد أقصى 5 ميجابايت
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">الاسم *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">الأحرف الأولى للصورة</label>
                <input
                  type="text"
                  value={form.avatar_initials}
                  onChange={(e) => setForm({ ...form, avatar_initials: e.target.value })}
                  placeholder="أم"
                  className="input-field max-w-[120px]"
                  maxLength={3}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">المادة الرئيسية *</label>
              <select
                value={form.subject_id}
                onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                className="input-field"
                required
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">التخصص</label>
              <input
                type="text"
                value={form.specialization}
                onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                placeholder="مثال: معلم رياضيات"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">المواد التي تدرسها</label>
              <input
                type="text"
                value={form.subjects}
                onChange={(e) => setForm({ ...form, subjects: e.target.value })}
                placeholder="مثال: الجبر، الهندسة، التفاضل"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">نبذة / الوصف</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                placeholder="نبذة عنك وعن أسلوبك في التدريس..."
                rows={3}
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">سنوات الخبرة</label>
              <input
                type="number"
                value={form.years_experience}
                onChange={(e) => setForm({ ...form, years_experience: Number(e.target.value) })}
                min={0}
                max={50}
                className="input-field max-w-[120px]"
              />
            </div>

            <button type="submit" disabled={saving} className="btn-primary">
              <Save className="w-4 h-4" />
              {saving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
            </button>
          </form>
        </div>
      )}

      {/* Content tab — محتواي */}
      {tab === 'content' && (
        <div className="max-w-3xl">
          {contentSuccess && (
            <div className="card bg-sage-50 border-sage-100 p-3 mb-4 flex items-center gap-2 animate-scale-in">
              <CheckCircle2 className="w-4 h-4 text-sage-dark" />
              <p className="text-sm text-sage-dark">{contentSuccess}</p>
            </div>
          )}
          {contentError && !showContentForm && (
            <div className="card bg-red-50 border-red-100 p-3 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{contentError}</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-ink-900 text-lg">محتواي التعليمي</h2>
            {!showContentForm && (
              <button onClick={startAddContent} className="btn-primary text-sm">
                <Plus className="w-4 h-4" />
                إضافة محتوى
              </button>
            )}
          </div>

          {/* Add/Edit content form */}
          {showContentForm && (
            <form onSubmit={handleContentSubmit} className="card p-6 space-y-5 animate-scale-in mb-4">
              <h3 className="font-heading font-bold text-ink-900">
                {editingContentId ? 'تعديل المحتوى' : 'إضافة محتوى جديد'}
              </h3>

              {contentError && (
                <div className="card bg-red-50 border-red-100 p-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-700">{contentError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">عنوان المحتوى *</label>
                <input
                  type="text"
                  value={contentForm.title}
                  onChange={(e) => setContentForm({ ...contentForm, title: e.target.value })}
                  className="input-field"
                  placeholder="مثال: شرح المعادلات"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">المادة *</label>
                  <select
                    value={contentForm.subject_id}
                    onChange={(e) => setContentForm({ ...contentForm, subject_id: e.target.value })}
                    className="input-field"
                    required
                  >
                    <option value="">اختر المادة</option>
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">الموضوع *</label>
                  <input
                    type="text"
                    value={contentForm.lesson}
                    onChange={(e) => setContentForm({ ...contentForm, lesson: e.target.value })}
                    className="input-field"
                    placeholder="مثال: المعادلات"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">نوع المحتوى *</label>
                <div className="flex flex-wrap gap-2">
                  {CONTENT_TYPES.map((ct) => (
                    <button
                      key={ct.value}
                      type="button"
                      onClick={() => setContentForm({ ...contentForm, type: ct.value })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        contentForm.type === ct.value
                          ? 'bg-gold/15 border-gold text-gold-dark'
                          : 'bg-white border-ink-100 text-ink-600 hover:border-ink-200'
                      }`}
                    >
                      {ct.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">الوصف</label>
                <textarea
                  value={contentForm.description}
                  onChange={(e) => setContentForm({ ...contentForm, description: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="وصف موجز للمحتوى..."
                />
              </div>

              {/* File upload / URL input */}
              {contentForm.type === 'link' ? (
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">الرابط الخارجي *</label>
                  <input
                    type="url"
                    value={contentForm.fileUrl}
                    onChange={(e) => setContentForm({ ...contentForm, fileUrl: e.target.value })}
                    className="input-field"
                    dir="ltr"
                    placeholder="https://..."
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">
                    {contentForm.type === 'pdf' || contentForm.type === 'file' ? 'الملف *' :
                     contentForm.type === 'video' ? 'ملف الفيديو أو الرابط *' :
                     contentForm.type === 'image' ? 'الصورة *' : 'الملف'}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <label className={`btn-outline text-sm cursor-pointer ${fileUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      {fileUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جاري الرفع...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          رفع من الجهاز
                        </>
                      )}
                      <input type="file" className="hidden" onChange={handleFileUpload} />
                    </label>
                    {contentForm.fileUrl && (
                      <button
                        type="button"
                        onClick={() => setContentForm({ ...contentForm, fileUrl: '' })}
                        className="btn-ghost text-sm text-red-600"
                      >
                        إزالة
                      </button>
                    )}
                  </div>
                  <details className="text-xs text-ink-400 mt-2">
                    <summary className="cursor-pointer hover:text-ink-600">أو أدخل رابط مباشر</summary>
                    <input
                      type="url"
                      value={contentForm.fileUrl}
                      onChange={(e) => setContentForm({ ...contentForm, fileUrl: e.target.value })}
                      className="input-field mt-2"
                      dir="ltr"
                      placeholder="https://..."
                    />
                  </details>
                </div>
              )}

              {/* Thumbnail upload (optional, for video/image) */}
              {(contentForm.type === 'video' || contentForm.type === 'image') && (
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">صورة مصغرة (اختياري)</label>
                  <div className="flex flex-wrap gap-2">
                    <label className={`btn-outline text-sm cursor-pointer ${thumbUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                      {thumbUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          جاري الرفع...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          رفع صورة مصغرة
                        </>
                      )}
                      <input type="file" className="hidden" onChange={handleThumbUpload} accept="image/jpeg,image/png,image/webp" />
                    </label>
                    {contentForm.thumbnailUrl && (
                      <button
                        type="button"
                        onClick={() => setContentForm({ ...contentForm, thumbnailUrl: '' })}
                        className="btn-ghost text-sm text-red-600"
                      >
                        إزالة
                      </button>
                    )}
                  </div>
                </div>
              )}

              {fileError && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {fileError}
                </p>
              )}

              <div className="flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="btn-primary text-sm">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? 'جاري الحفظ...' : 'حفظ المحتوى'}
                </button>
                <button type="button" onClick={resetContentForm} className="btn-ghost text-sm">
                  إلغاء
                </button>
              </div>
            </form>
          )}

          {/* Content list */}
          {contentLoading ? (
            <div className="card p-8 text-center">
              <Loader2 className="w-6 h-6 text-ink-400 animate-spin mx-auto" />
              <p className="text-sm text-ink-500 mt-2">جاري تحميل المحتوى...</p>
            </div>
          ) : teacherContent.length > 0 ? (
            <div className="space-y-2">
              {teacherContent.map((r) => (
                <div key={r.id} className="card p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold-dark shrink-0">
                      {r.type === 'pdf' || r.type === 'file' ? <File className="w-5 h-5" /> :
                       r.type === 'video' ? <Video className="w-5 h-5" /> :
                       r.type === 'image' ? <ImageIcon className="w-5 h-5" /> :
                       r.type === 'link' ? <LinkIcon className="w-5 h-5" /> :
                       <FileText className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-ink-900 truncate">{r.title}</h3>
                      <p className="text-sm text-ink-500 truncate">{r.subjectName} — {r.lesson}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="chip bg-gold/10 text-gold-dark text-xs">{resourceTypeLabels[r.type]}</span>
                        <span className="chip bg-ink-50 text-ink-500 text-xs">محتوى المعلم</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setPreviewResource(r)} className="btn-ghost p-2" title="معاينة">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => startEditContent(r)} className="btn-ghost p-2" title="تعديل">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmDeleteId(r.id)} className="btn-ghost p-2 text-red-600" title="حذف">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : !showContentForm ? (
            <div className="card p-8 text-center">
              <BookOpen className="w-10 h-10 text-ink-400 mx-auto mb-3" />
              <p className="text-ink-500">لا يوجد محتوى بعد. ابدأ بإضافة أول محتوى تعليمي.</p>
            </div>
          ) : null}

          {/* Delete confirmation dialog */}
          {confirmDeleteId && (
            <div className="fixed inset-0 bg-ink-900/40 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDeleteId(null)}>
              <div className="card p-6 max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-ink-900 text-lg">تأكيد الحذف</h3>
                    <p className="text-sm text-ink-500 mt-1">هل أنت متأكد من حذف هذا المحتوى؟ لا يمكن التراجع عن هذا الإجراء.</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleDeleteContent} className="btn-primary text-sm bg-red-600 hover:bg-red-700">
                    <Trash2 className="w-4 h-4" />
                    حذف
                  </button>
                  <button onClick={() => setConfirmDeleteId(null)} className="btn-ghost text-sm">إلغاء</button>
                </div>
              </div>
            </div>
          )}

          {/* Preview modal */}
          {previewResource && (
            <div className="fixed inset-0 bg-ink-900/40 flex items-center justify-center z-50 p-4" onClick={() => setPreviewResource(null)}>
              <div className="card p-6 max-w-2xl w-full animate-scale-in max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between mb-4">
                  <div className="min-w-0">
                    <h3 className="font-heading font-bold text-ink-900 text-lg truncate">{previewResource.title}</h3>
                    <p className="text-sm text-ink-500 mt-0.5">{previewResource.lesson} — {previewResource.subjectName}</p>
                  </div>
                  <button onClick={() => setPreviewResource(null)} className="btn-ghost p-1 shrink-0">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-sm text-ink-600 leading-relaxed mb-4">{previewResource.description}</p>
                {previewResource.fileUrl ? (
                  previewResource.type === 'link' ? (
                    <a href={previewResource.fileUrl} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
                      <LinkIcon className="w-4 h-4" />
                      فتح الرابط
                    </a>
                  ) : (
                    <FilePreview url={previewResource.fileUrl} fileName={previewResource.title} />
                  )
                ) : (
                  <p className="text-sm text-ink-400 text-center py-4">لا يوجد ملف مرفق.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Questions tab */}
      {tab === 'questions' && (
        <div className="max-w-3xl">
          {qaSuccess && (
            <div className="card bg-sage-50 border-sage-100 p-3 mb-4 flex items-center gap-2 animate-scale-in">
              <CheckCircle2 className="w-4 h-4 text-sage-dark" />
              <p className="text-sm text-sage-dark">{qaSuccess}</p>
            </div>
          )}

          {/* Sub-tabs: inbox vs public Q&A */}
          <div className="flex gap-1 mb-4 border-b border-ink-100">
            <button
              onClick={() => setQuestionTab('inbox')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                questionTab === 'inbox' ? 'border-gold text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              أسئلة الطلاب
              {privateQuestions.length > 0 && (
                <span className="chip bg-gold/15 text-gold-dark text-xs">{privateQuestions.length}</span>
              )}
            </button>
            <button
              onClick={() => setQuestionTab('public')}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                questionTab === 'public' ? 'border-gold text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-700'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              أسئلة وأجوبة منشورة
              {publicQAList.length > 0 && (
                <span className="chip bg-sage-50 text-sage-dark text-xs">{publicQAList.length}</span>
              )}
            </button>
          </div>

          {/* Inbox: private student questions */}
          {questionTab === 'inbox' && (
            <div>
              {openQuestion ? (
                <div className="card p-6 space-y-4 animate-scale-in">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="chip bg-ink-50 text-ink-500 text-xs mb-2">سؤال خاص</span>
                      <h3 className="font-heading font-bold text-ink-900 text-lg">سؤال من {openQuestion.studentName}</h3>
                      <p className="text-xs text-ink-400 mt-1">
                        {new Date(openQuestion.createdAt).toLocaleDateString('ar-SA')} —
                        {openQuestion.status === 'answered' ? ' تمت الإجابة' : ' بانتظار الإجابة'}
                      </p>
                    </div>
                    <button onClick={() => { setOpenQuestion(null); setAnswerText(''); setAnswerError(''); }} className="btn-ghost p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="border-r-2 border-ink-100 pr-3">
                    <p className="text-xs text-ink-400 mb-1">السؤال</p>
                    <p className="text-sm text-ink-700 leading-relaxed">{openQuestion.question}</p>
                  </div>
                  {openQuestion.answer && (
                    <div className="border-r-2 border-gold/40 pr-3">
                      <p className="text-xs text-gold-dark mb-1">الإجابة الحالية</p>
                      <p className="text-sm text-ink-700 leading-relaxed">{openQuestion.answer}</p>
                    </div>
                  )}
                  {answerError && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {answerError}
                    </p>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">
                      {openQuestion.answer ? 'تعديل الإجابة' : 'اكتب الإجابة'}
                    </label>
                    <textarea
                      value={answerText}
                      onChange={(e) => setAnswerText(e.target.value)}
                      rows={4}
                      className="input-field resize-none"
                      placeholder="اكتب إجابتك هنا..."
                    />
                  </div>
                  <button
                    onClick={async () => {
                      if (!teacher || !answerText.trim()) return;
                      setAnswering(true);
                      setAnswerError('');
                      const ok = await replyToQuestion(openQuestion.id, answerText.trim());
                      setAnswering(false);
                      if (ok) {
                        setQASuccess('تم إرسال الإجابة بنجاح');
                        setTimeout(() => setQASuccess(''), 4000);
                        setOpenQuestion(null);
                        setAnswerText('');
                        await loadQuestions(teacher.id);
                      } else {
                        setAnswerError('حدث خطأ أثناء إرسال الإجابة.');
                      }
                    }}
                    disabled={answering || !answerText.trim()}
                    className="btn-primary text-sm"
                  >
                    {answering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {answering ? 'جاري الإرسال...' : 'إرسال الإجابة'}
                  </button>
                </div>
              ) : questionsLoading ? (
                <div className="card p-8 text-center">
                  <Loader2 className="w-6 h-6 text-ink-400 animate-spin mx-auto" />
                  <p className="text-sm text-ink-500 mt-2">جاري تحميل الأسئلة...</p>
                </div>
              ) : privateQuestions.length > 0 ? (
                <div className="space-y-2">
                  {privateQuestions.map((q) => (
                    <button
                      key={q.id}
                      onClick={() => { setOpenQuestion(q); setAnswerText(q.answer || ''); setAnswerError(''); }}
                      className="card p-4 flex items-center justify-between gap-3 text-right w-full hover:border-gold/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="chip bg-ink-50 text-ink-500 text-xs">سؤال خاص</span>
                          {q.status === 'answered' ? (
                            <span className="chip bg-sage-50 text-sage-dark text-xs">تمت الإجابة</span>
                          ) : (
                            <span className="chip bg-amber-50 text-amber-600 text-xs">بانتظار الإجابة</span>
                          )}
                        </div>
                        <p className="font-medium text-ink-900 truncate">{q.question}</p>
                        <p className="text-xs text-ink-400 mt-0.5">{q.studentName} — {new Date(q.createdAt).toLocaleDateString('ar-SA')}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <MessageSquare className="w-10 h-10 text-ink-400 mx-auto mb-3" />
                  <p className="text-ink-500">لا توجد أسئلة من الطلاب حالياً.</p>
                </div>
              )}
            </div>
          )}

          {/* Public Q&A management */}
          {questionTab === 'public' && (
            <div>
              {/* Create/Edit form */}
              <div className="card p-5 space-y-4 mb-4">
                <h3 className="font-heading font-bold text-ink-900">
                  {editingQAId ? 'تعديل سؤال وأجوبة منشور' : 'إنشاء سؤال وأجوبة منشور'}
                </h3>
                {qaError && (
                  <div className="card bg-red-50 border-red-100 p-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-600" />
                    <p className="text-sm text-red-700">{qaError}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">عنوان السؤال *</label>
                  <input
                    type="text"
                    value={qaForm.title}
                    onChange={(e) => setQAForm({ ...qaForm, title: e.target.value })}
                    className="input-field"
                    placeholder="مثال: كيف أحل المعادلات الخطية؟"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">نص السؤال *</label>
                  <textarea
                    value={qaForm.question}
                    onChange={(e) => setQAForm({ ...qaForm, question: e.target.value })}
                    rows={2}
                    className="input-field resize-none"
                    placeholder="اكتب السؤال هنا..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">الإجابة *</label>
                  <textarea
                    value={qaForm.answer}
                    onChange={(e) => setQAForm({ ...qaForm, answer: e.target.value })}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="اكتب الإجابة هنا..."
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      if (!teacher) return;
                      if (!qaForm.title.trim() || !qaForm.question.trim() || !qaForm.answer.trim()) {
                        setQAError('يرجى ملء جميع الحقول.');
                        return;
                      }
                      setQASaving(true);
                      setQAError('');
                      let ok: boolean;
                      if (editingQAId) {
                        ok = await editPublicQA(editingQAId, {
                          title: qaForm.title.trim(),
                          question: qaForm.question.trim(),
                          answer: qaForm.answer.trim(),
                        });
                      } else {
                        ok = await createPublicQA({
                          teacherId: teacher.id,
                          title: qaForm.title.trim(),
                          question: qaForm.question.trim(),
                          answer: qaForm.answer.trim(),
                        });
                      }
                      setQASaving(false);
                      if (ok) {
                        setQASuccess(editingQAId ? 'تم تحديث السؤال والأجوبة بنجاح' : 'تم نشر السؤال والأجوبة بنجاح');
                        setTimeout(() => setQASuccess(''), 4000);
                        setQAForm({ title: '', question: '', answer: '' });
                        setEditingQAId(null);
                        await loadQuestions(teacher.id);
                      } else {
                        setQAError('حدث خطأ أثناء الحفظ.');
                      }
                    }}
                    disabled={qaSaving}
                    className="btn-primary text-sm"
                  >
                    {qaSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {qaSaving ? 'جاري الحفظ...' : editingQAId ? 'حفظ التعديل' : 'نشر السؤال والأجوبة'}
                  </button>
                  {editingQAId && (
                    <button
                      onClick={() => { setEditingQAId(null); setQAForm({ title: '', question: '', answer: '' }); setQAError(''); }}
                      className="btn-ghost text-sm"
                    >
                      إلغاء التعديل
                    </button>
                  )}
                </div>
              </div>

              {/* Public Q&A list */}
              {questionsLoading ? (
                <div className="card p-8 text-center">
                  <Loader2 className="w-6 h-6 text-ink-400 animate-spin mx-auto" />
                  <p className="text-sm text-ink-500 mt-2">جاري التحميل...</p>
                </div>
              ) : publicQAList.length > 0 ? (
                <div className="space-y-2">
                  {publicQAList.map((qa) => (
                    <div key={qa.id} className="card p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="chip bg-sage-50 text-sage-dark text-xs">سؤال وأجوبة منشور</span>
                          </div>
                          <h3 className="font-heading font-bold text-ink-900 truncate">{qa.title || qa.question}</h3>
                          <p className="text-sm text-ink-500 truncate mt-0.5">{qa.question}</p>
                          <p className="text-xs text-ink-400 mt-1">{new Date(qa.createdAt).toLocaleDateString('ar-SA')}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => {
                              setEditingQAId(qa.id);
                              setQAForm({ title: qa.title || '', question: qa.question, answer: qa.answer || '' });
                              setQAError('');
                            }}
                            className="btn-ghost p-2"
                            title="تعديل"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteQA(qa.id)}
                            className="btn-ghost p-2 text-red-600"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card p-8 text-center">
                  <HelpCircle className="w-10 h-10 text-ink-400 mx-auto mb-3" />
                  <p className="text-ink-500">لا توجد أسئلة وأجوبة منشورة حالياً.</p>
                </div>
              )}

              {/* Delete confirmation */}
              {confirmDeleteQA && (
                <div className="fixed inset-0 bg-ink-900/40 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDeleteQA(null)}>
                  <div className="card p-6 max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-ink-900 text-lg">تأكيد الحذف</h3>
                        <p className="text-sm text-ink-500 mt-1">هل أنت متأكد من حذف هذا السؤال والأجوبة؟</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          if (!teacher || !confirmDeleteQA) return;
                          const ok = await removePublicQA(confirmDeleteQA);
                          setConfirmDeleteQA(null);
                          if (ok) {
                            setQASuccess('تم حذف السؤال والأجوبة بنجاح');
                            setTimeout(() => setQASuccess(''), 4000);
                            await loadQuestions(teacher.id);
                          } else {
                            setQAError('حدث خطأ أثناء الحذف.');
                            setTimeout(() => setQAError(''), 4000);
                          }
                        }}
                        className="btn-primary text-sm bg-red-600 hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                        حذف
                      </button>
                      <button onClick={() => setConfirmDeleteQA(null)} className="btn-ghost text-sm">إلغاء</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Stats tab */}
      {tab === 'stats' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl">
          <div className="card p-5">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-3 text-gold-dark">
              <Users className="w-5 h-5" />
            </div>
            <p className="font-heading font-extrabold text-2xl text-ink-900">{subscriberCount}</p>
            <p className="text-sm text-ink-500 mt-0.5">عدد الطلاب المشتركين</p>
          </div>

          <div className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${teacher.is_approved ? 'bg-sage-50 text-sage-dark' : 'bg-amber-50 text-amber-600'}`}>
              {teacher.is_approved ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
            </div>
            <p className="font-heading font-extrabold text-lg text-ink-900">
              {teacher.is_approved ? 'معتمد' : 'قيد المراجعة'}
            </p>
            <p className="text-sm text-ink-500 mt-0.5">حالة الحساب</p>
          </div>

          <div className="card p-5">
            <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mb-3 text-gold-dark">
              <BookOpen className="w-5 h-5" />
            </div>
            <p className="font-heading font-extrabold text-2xl text-ink-900">{teacherContent.length}</p>
            <p className="text-sm text-ink-500 mt-0.5">عدد المحتوى التعليمي</p>
          </div>

          <div className="card p-5">
            <div className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center mb-3 text-ink-700">
              <FileText className="w-5 h-5" />
            </div>
            <p className="font-heading font-extrabold text-2xl text-ink-900">{teacherContributions.length}</p>
            <p className="text-sm text-ink-500 mt-0.5">عدد المساهمات</p>
          </div>
        </div>
      )}

      {/* Subscribers tab */}
      {tab === 'subscribers' && (
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-ink-900 text-lg">الطلاب المشتركين</h2>
            <span className="chip bg-gold/15 text-gold-dark text-sm">{subscriberCount} مشترك</span>
          </div>

          {subscribers.length > 0 ? (
            <div className="space-y-2">
              {subscribers.map((sub) => (
                <div key={sub.id} className="card p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center text-ink-700 text-xs font-bold shrink-0">
                    {sub.student_name ? sub.student_name.charAt(0) : '؟'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink-900 truncate">{sub.student_name || 'مستخدم مجهول'}</p>
                    <div className="flex items-center gap-1.5 text-xs text-ink-400 mt-0.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {sub.created_at ? new Date(sub.created_at).toLocaleDateString('ar-SA') : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card p-8 text-center">
              <Users className="w-10 h-10 text-ink-400 mx-auto mb-3" />
              <p className="text-ink-500">لا يوجد طلاب مشتركون حالياً.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
