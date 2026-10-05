import { useState } from 'react';
import { Upload, Check, FileText, Image, Video, Presentation, X, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useApp } from '@/context/AppContext';
import { resourceTypeLabels, type ResourceType } from '@/data/sampleData';
import { supabase } from '@/lib/supabase';

const contentTypes: { key: ResourceType; label: string; icon: typeof FileText }[] = [
  { key: 'summary', label: 'ملخص PDF', icon: FileText },
  { key: 'image', label: 'صورة', icon: Image },
  { key: 'video', label: 'فيديو', icon: Video },
  { key: 'presentation', label: 'عرض تقديمي', icon: Presentation },
];

export default function ContributePage() {
  const { subjects, contributions, addContribution } = useData();
  const { user } = useApp();
  const [form, setForm] = useState({
    studentName: user?.name || '',
    email: user?.email || '',
    subjectId: '',
    lesson: '',
    contentType: '' as ResourceType | '',
    description: '',
    confirmed: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const userContributions = contributions.filter(
    (c) => c.studentName === form.studentName || (user && c.studentName === user.name)
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadProgress(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.studentName || !form.email || !form.subjectId || !form.lesson || !form.contentType || !form.description) {
      setError('يرجى ملء جميع الحقول المطلوبة.');
      return;
    }
    if (!form.confirmed) {
      setError('يجب تأكيد أن المحتوى تعليمي ومناسب.');
      return;
    }
    if (!selectedFile) {
      setError('يرجى رفع ملف.');
      return;
    }

    setSubmitting(true);

    const safeName = `${Date.now()}-${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const filePath = `contributions/${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from('files')
      .upload(filePath, selectedFile, {
        contentType: selectedFile.type,
        upsert: false,
      });

    if (uploadError) {
      setSubmitting(false);
      setError('فشل رفع الملف: ' + uploadError.message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from('files')
      .getPublicUrl(filePath);

    const fileUrl = publicUrlData.publicUrl;

    setUploadProgress(100);

    const ok = await addContribution({
      studentName: form.studentName,
      email: form.email,
      subjectId: form.subjectId,
      lesson: form.lesson,
      contentType: form.contentType as ResourceType,
      description: form.description,
      fileName: selectedFile.name,
      fileUrl,
    });
    setSubmitting(false);
    if (ok) {
      setSuccess(true);
      setForm({ studentName: user?.name || '', email: user?.email || '', subjectId: '', lesson: '', contentType: '', description: '', confirmed: false });
      setSelectedFile(null);
      setUploadProgress(0);
      setTimeout(() => setSuccess(false), 5000);
    } else {
      setError('حدث خطأ أثناء إرسال المساهمة. حاول مرة أخرى.');
    }
  };

  return (
    <div className="container-page py-10 animate-page">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gold/15 flex items-center justify-center mx-auto mb-4">
            <Upload className="w-7 h-7 text-gold-dark" />
          </div>
          <h1 className="font-heading font-extrabold text-3xl text-ink-900">ساهم</h1>
          <p className="text-ink-500 mt-2 max-w-lg mx-auto">
            لديك ملخص مفيد؟ شاركه مع زملائك وساهم في بناء المعرفة.
            كل مساهمة تمر بمراجعة من فريق الإشراف قبل نشرها.
          </p>
        </div>

        {/* Info banner */}
        <div className="card bg-sage-50 border-sage-100 p-4 mb-6 flex items-start gap-3">
          <Clock className="w-5 h-5 text-sage-dark shrink-0 mt-0.5" />
          <p className="text-sm text-sage-dark leading-relaxed">
            مساهماتك لا تُنشر فوراً. بعد الإرسال تدخل في حالة <strong>قيد المراجعة</strong> حتى يراجعها المشرف.
          </p>
        </div>

        {success && (
          <div className="card bg-sage-50 border-sage-100 p-4 mb-6 flex items-center gap-3 animate-scale-in">
            <CheckCircle2 className="w-5 h-5 text-sage-dark shrink-0" />
            <p className="text-sm text-sage-dark font-medium">
              تم إرسال مساهمتك بنجاح! ستظهر في لوحة تحكم المشرف للمراجعة.
            </p>
          </div>
        )}

        {error && (
          <div className="card bg-red-50 border-red-100 p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="card p-6 space-y-5">
          {/* Name + Email */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">اسم الطالب *</label>
              <input
                type="text"
                value={form.studentName}
                onChange={(e) => setForm({ ...form, studentName: e.target.value })}
                placeholder="اسمك"
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">البريد الإلكتروني *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                className="input-field"
                dir="ltr"
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">المادة *</label>
            <select
              value={form.subjectId}
              onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
              className="input-field"
            >
              <option value="">اختر المادة</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Lesson */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">الدرس / الموضوع *</label>
            <input
              type="text"
              value={form.lesson}
              onChange={(e) => setForm({ ...form, lesson: e.target.value })}
              placeholder="مثال: قوانين نيوتن"
              className="input-field"
            />
          </div>

          {/* Content type */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">نوع المحتوى *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {contentTypes.map((ct) => (
                <button
                  key={ct.key}
                  type="button"
                  onClick={() => setForm({ ...form, contentType: ct.key })}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                    form.contentType === ct.key
                      ? 'border-gold bg-gold/10 text-gold-dark'
                      : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300'
                  }`}
                >
                  <ct.icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{ct.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">وصف المحتوى *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="صف ما يحتويه الملف وما يفيد الطلاب..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">رفع الملف *</label>
            {!selectedFile ? (
              <label className="flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed border-ink-200 rounded-xl cursor-pointer hover:border-gold hover:bg-gold/5 transition-all">
                <Upload className="w-8 h-8 text-ink-400" />
                <span className="text-sm text-ink-500">اضغط لاختيار ملف أو اسحبه هنا</span>
                <span className="text-xs text-ink-400">PDF, PNG, MP4, PPTX</span>
                <input type="file" className="hidden" onChange={handleFile} accept=".pdf,.png,.jpg,.mp4,.pptx" />
              </label>
            ) : (
              <div className="card p-4 flex items-center gap-3">
                <FileText className="w-8 h-8 text-gold-dark shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-ink-900 truncate">{selectedFile.name}</p>
                  {submitting && uploadProgress < 100 ? (
                    <div className="w-full h-1.5 bg-ink-100 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-gold rounded-full transition-all" style={{ width: '90%' }} />
                    </div>
                  ) : (
                    <p className="text-xs text-sage-dark flex items-center gap-1 mt-1">
                      <Check className="w-3.5 h-3.5" /> تم الرفع
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setUploadProgress(0); }}
                  className="btn-ghost text-sm"
                  aria-label="إزالة الملف"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Confirmation */}
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-ink-50 transition-colors">
            <input
              type="checkbox"
              checked={form.confirmed}
              onChange={(e) => setForm({ ...form, confirmed: e.target.checked })}
              className="mt-0.5 w-5 h-5 rounded border-ink-300 text-gold focus:ring-gold/30 shrink-0"
            />
            <span className="text-sm text-ink-600 leading-relaxed">
              أؤكد أن المحتوى المرفق تعليمي ومناسب، ولا يحتوي على مواد مخالفة أو مسيئة.
            </span>
          </label>

          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'جاري الإرسال...' : 'إرسال المساهمة'}
          </button>
        </form>

        {/* User's contributions status */}
        {userContributions.length > 0 && (
          <div className="mt-8">
            <h2 className="font-heading font-bold text-ink-900 text-lg mb-3">مساهماتي السابقة</h2>
            <div className="space-y-2">
              {userContributions.map((c) => (
                <div key={c.id} className="card p-4 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{c.lesson} — {c.subjectName}</p>
                    <p className="text-xs text-ink-400">{c.date}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; icon: typeof Clock; className: string }> = {
    pending: { label: 'قيد المراجعة', icon: Clock, className: 'bg-gold/15 text-gold-dark' },
    approved: { label: 'تمت الموافقة', icon: CheckCircle2, className: 'bg-sage-50 text-sage-dark' },
    rejected: { label: 'مرفوض', icon: XCircle, className: 'bg-red-50 text-red-600' },
    changes_requested: { label: 'طلب تعديل', icon: AlertCircle, className: 'bg-amber-50 text-amber-700' },
  };
  const s = config[status] || config.pending;
  return (
    <span className={`chip text-xs ${s.className}`}>
      <s.icon className="w-3.5 h-3.5" />
      {s.label}
    </span>
  );
}
