import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, FileText, BookOpen, Clock, Lightbulb,
  CheckCircle2, XCircle, AlertCircle, Trash2, Eye, X,
  Megaphone, GraduationCap, BookCopy, Plus, Pencil, EyeOff, Eye as EyeIcon,
  Search, ShieldCheck, Mail, Lock, User as UserIcon, Heart, Upload, Loader2, Link as LinkIcon,
  HelpCircle, Calendar, Sparkles,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { resourceTypeLabels, type ResourceType } from '@/data/sampleData';
import { SubjectIcon } from '@/components/SubjectIcon';
import FilePreview from '@/components/FilePreview';
import type { SubjectRow, TeacherRow, ResourceRow, ContributionRow, SuggestionRow, CounselorRow, DeleteResult, TeacherQuestion } from '@/lib/dataAccess';

type Tab = 'overview' | 'subjects' | 'topics' | 'teachers' | 'contributions' | 'suggestions' | 'announcements' | 'moderators' | 'counselors' | 'answers' | 'ai-sources';

const iconOptions = ['BookOpen', 'Moon', 'PenLine', 'Sigma', 'Atom', 'Dna', 'FlaskConical', 'Cpu', 'Globe2', 'ScrollText', 'Users', 'Languages'];
const colorOptions = ['ink', 'gold', 'sage'];

export default function AdminDashboardPage() {
  const { user, createModerator } = useApp();
  const data = useData();
  const [tab, setTab] = useState<Tab>('overview');
  const [previewContribution, setPreviewContribution] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string; action: () => Promise<boolean | DeleteResult> } | null>(null);
  const [deleteResult, setDeleteResult] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Load admin data on mount
  useEffect(() => {
    data.refreshAdmin();
  }, []);

  const pendingContributions = data.adminContributions.filter((c) => c.status === 'pending');
  const newSuggestions = data.adminSuggestions.filter((s) => s.status === 'new');

  const stats = data.adminStats;
  const statCards = [
    { icon: BookOpen, label: 'المواد', value: stats?.subjects ?? 0, color: 'text-ink-700 bg-ink-50' },
    { icon: Users, label: 'المعلمون', value: stats?.teachers ?? 0, color: 'text-gold-dark bg-gold/10' },
    { icon: FileText, label: 'الموارد', value: stats?.resources ?? 0, color: 'text-sage-dark bg-sage-50' },
    { icon: Clock, label: 'قيد المراجعة', value: stats?.pendingContributions ?? 0, color: 'text-amber-700 bg-amber-50' },
  ];
  const pendingCounselors = data.adminCounselors.filter((c) => c.status === 'pending');

  const tabs: { key: Tab; label: string; icon: typeof LayoutDashboard; badge?: number }[] = [
    { key: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
    { key: 'subjects', label: 'إدارة المواد', icon: BookOpen },
    { key: 'topics', label: 'إدارة الموضوعات', icon: BookCopy },
    { key: 'teachers', label: 'إدارة المعلمين', icon: Users },
    { key: 'contributions', label: 'المساهمات', icon: FileText, badge: pendingContributions.length },
    { key: 'suggestions', label: 'الاقتراحات', icon: Lightbulb, badge: newSuggestions.length },
    { key: 'announcements', label: 'الإعلانات', icon: Megaphone },
    { key: 'counselors', label: 'المستشارون النفسيون', icon: Heart, badge: pendingCounselors.length },
    { key: 'answers', label: 'الإجابات', icon: HelpCircle },
    { key: 'ai-sources', label: 'مصادر مساعد مِداد', icon: Sparkles },
    { key: 'moderators', label: 'المراقبون', icon: ShieldCheck },
  ];

  const handleDelete = async () => {
    if (!confirmDelete) return;
    const result = await confirmDelete.action();
    if (typeof result === 'boolean') {
      if (result) {
        setDeleteResult({ text: 'تم الحذف بنجاح.', type: 'success' });
      } else {
        setDeleteResult({ text: 'تعذر حذف الموضوع.', type: 'error' });
      }
    } else if (result.ok) {
      setDeleteResult({ text: 'تم الحذف بنجاح.', type: 'success' });
    } else if (result.errorKind === 'foreign_key') {
      setDeleteResult({ text: 'لا يمكن حذف هذا الموضوع لأنه مرتبط ببيانات أخرى.', type: 'error' });
    } else if (result.errorKind === 'permission') {
      setDeleteResult({ text: 'ليس لديك صلاحية حذف هذا الموضوع.', type: 'error' });
    } else {
      setDeleteResult({ text: 'تعذر حذف الموضوع.', type: 'error' });
    }
    setConfirmDelete(null);
    setTimeout(() => setDeleteResult(null), 4000);
  };

  return (
    <div className="container-page py-8 animate-page">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-ink-700 flex items-center justify-center text-white">
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-900">لوحة التحكم</h1>
          <p className="text-sm text-ink-500">إدارة المنصة والمحتوى والمستخدمين</p>
        </div>
      </div>

      {deleteResult && (
        <div className={`card p-3 mb-4 flex items-center gap-2 animate-scale-in ${deleteResult.type === 'success' ? 'bg-sage-50 border-sage-100' : 'bg-red-50 border-red-100'}`}>
          {deleteResult.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 text-sage-dark" />
            : <AlertCircle className="w-4 h-4 text-red-600" />}
          <p className={`text-sm ${deleteResult.type === 'success' ? 'text-sage-dark' : 'text-red-700'}`}>{deleteResult.text}</p>
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
            {t.badge ? (
              <span className="chip bg-gold/15 text-gold-dark text-xs px-2 py-0.5">{t.badge}</span>
            ) : null}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((s) => (
              <div key={s.label} className="card p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <p className="font-heading font-extrabold text-2xl text-ink-900">{s.value.toLocaleString()}</p>
                <p className="text-sm text-ink-500 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="card p-5">
              <h3 className="font-heading font-bold text-ink-900 mb-3">إحصائيات سريعة</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'المواد الدراسية', value: stats?.subjects ?? 0, icon: BookOpen },
                  { label: 'الموارد', value: stats?.resources ?? 0, icon: BookCopy },
                  { label: 'الاقتراحات', value: stats?.suggestions ?? 0, icon: Lightbulb },
                  { label: 'الإعلانات', value: stats?.announcements ?? 0, icon: Megaphone },
                  { label: 'المساهمات', value: stats?.contributions ?? 0, icon: FileText },
                  { label: 'المستشارون النفسيون', value: stats?.counselors ?? 0, icon: Heart },
                  { label: 'طلبات مستشارين قيد المراجعة', value: stats?.pendingCounselors ?? 0, icon: Clock },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-ink-50 last:border-0">
                    <span className="text-sm text-ink-600 flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-ink-400" />
                      {item.label}
                    </span>
                    <span className="font-heading font-bold text-ink-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-5">
              <h3 className="font-heading font-bold text-ink-900 mb-3">المعلمون الأكثر متابعة</h3>
              <div className="space-y-2">
                {data.teachers.length > 0 ? (
                  [...data.teachers].sort((a, b) => b.followers - a.followers).slice(0, 5).map((t, i) => (
                    <div key={t.id} className="flex items-center gap-3 py-2 border-b border-ink-50 last:border-0">
                      <span className="text-sm text-ink-400 font-bold w-5">{i + 1}</span>
                      <div className="w-8 h-8 rounded-full bg-ink-100 flex items-center justify-center text-ink-700 text-xs font-bold">
                        {t.avatarInitials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-ink-900 truncate">{t.name}</p>
                        <p className="text-xs text-ink-400">{t.subjectName}</p>
                      </div>
                      <span className="text-sm text-ink-600 font-medium">{t.followers}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-ink-400 text-center py-4">لا يوجد معلمون.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subjects Management */}
      {tab === 'subjects' && (
        <SubjectsManager
          subjects={data.adminSubjects}
          onCreate={data.createSubject}
          onEdit={data.editSubject}
          onDelete={(id) => setConfirmDelete({ id, label: 'هذه المادة', action: () => data.removeSubject(id) })}
          onToggleHidden={data.hideSubject}
        />
      )}

      {/* Topics Management */}
      {tab === 'topics' && (
        <TopicsManager
          resources={data.adminResources}
          subjects={data.adminSubjects}
          onCreate={data.createResource}
          onEdit={data.editResource}
          onDelete={(id) => setConfirmDelete({ id, label: 'هذا المورد', action: () => data.removeResource(id) })}
          onToggleHidden={data.hideResource}
          onUploadFile={data.uploadFile}
          onUploadThumbnail={data.uploadThumbnail}
        />
      )}

      {/* Teachers Management */}
      {tab === 'teachers' && (
        <TeachersManager
          teachers={data.adminTeachers}
          subjects={data.adminSubjects}
          onCreate={data.createTeacher}
          onEdit={data.editTeacher}
          onDelete={(id) => setConfirmDelete({ id, label: 'هذا المعلم', action: () => data.removeTeacher(id) })}
          onToggleHidden={data.hideTeacher}
          onApprove={data.approveTeacher}
          getSubscriberCount={data.getSubscriberCount}
        />
      )}

      {/* Contributions */}
      {tab === 'contributions' && (
        <ContributionsManager
          contributions={data.adminContributions}
          subjects={data.adminSubjects}
          onStatusChange={data.setContributionStatus}
          onEdit={data.editContribution}
          onDelete={(id) => setConfirmDelete({ id, label: 'هذه المساهمة', action: () => data.removeContribution(id) })}
          onPreview={setPreviewContribution}
          onReject={(id) => { setRejectId(id); setRejectReason(''); }}
        />
      )}

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-ink-900/40 flex items-center justify-center z-50 p-4" onClick={() => setRejectId(null)}>
          <div className="card p-6 max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-ink-900 text-lg mb-2">سبب الرفض</h3>
            <p className="text-sm text-ink-500 mb-3">أدخل سبب رفض المساهمة ليصل للطالب.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="مثال: المحتوى لا يتوافق مع الموضوع المحدد."
              rows={3}
              className="input-field resize-none"
              autoFocus
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={async () => {
                  await data.setContributionStatus(rejectId, 'rejected', rejectReason || 'لم يحدد سبب.');
                  setRejectId(null);
                }}
                className="btn-primary text-sm"
              >
                تأكيد الرفض
              </button>
              <button onClick={() => setRejectId(null)} className="btn-ghost text-sm">إلغاء</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview modal */}
      {previewContribution && (() => {
        const c = data.adminContributions.find((c) => c.id === previewContribution);
        if (!c) return null;
        return (
          <div className="fixed inset-0 bg-ink-900/40 flex items-center justify-center z-50 p-4" onClick={() => setPreviewContribution(null)}>
            <div className="card p-6 max-w-lg w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-heading font-bold text-ink-900 text-lg">{c.lesson}</h3>
                <button onClick={() => setPreviewContribution(null)} className="btn-ghost p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-ink-400">المادة:</span> <span className="text-ink-700 font-medium">{data.adminSubjects.find((s) => s.id === c.subject_id)?.name || '—'}</span></div>
                  <div><span className="text-ink-400">النوع:</span> <span className="text-ink-700 font-medium">{resourceTypeLabels[c.content_type as ResourceType] || c.content_type}</span></div>
                  <div><span className="text-ink-400">الطالب:</span> <span className="text-ink-700 font-medium">{c.student_name}</span></div>
                  <div><span className="text-ink-400">التاريخ:</span> <span className="text-ink-700 font-medium">{c.created_at?.split('T')[0] || ''}</span></div>
                </div>
                <div>
                  <span className="text-ink-400 block mb-1">الوصف:</span>
                  <p className="text-ink-700 leading-relaxed">{c.description}</p>
                </div>
                <div>
                  <span className="text-ink-400 block mb-1">الملف:</span>
                  {c.file_url ? (
                    <FilePreview url={c.file_url} fileName={c.file_name} />
                  ) : (
                    <div className="card bg-ink-50 p-3 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-gold-dark" />
                      <span className="text-sm font-mono" dir="ltr">{c.file_name}</span>
                    </div>
                  )}
                </div>
                {c.review_note && (
                  <div>
                    <span className="text-ink-400 block mb-1">ملاحظة المراجعة:</span>
                    <p className="text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5">{c.review_note}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* Suggestions */}
      {tab === 'suggestions' && (
        <SuggestionsManager
          suggestions={data.adminSuggestions}
          onStatusChange={data.setSuggestionStatus}
          onDelete={(id) => setConfirmDelete({ id, label: 'هذا الاقتراح', action: () => data.removeSuggestion(id) })}
        />
      )}

      {/* Announcements */}
      {tab === 'announcements' && (
        <div className="space-y-3">
          <div className="card p-5">
            <p className="text-sm text-ink-500 text-center py-8">
              سيتم إضافة إدارة الإعلانات هنا — يمكن للمشرف مراجعة وموافقة إعلانات المعلمين.
            </p>
          </div>
        </div>
      )}

      {/* Counselors Management */}
      {tab === 'counselors' && (
        <CounselorsManager
          counselors={data.adminCounselors}
          onSetStatus={data.setCounselorStatus}
          onToggleVisible={data.hideCounselor}
          onEdit={data.editCounselor}
          onDelete={(id) => setConfirmDelete({ id, label: 'هذا المستشار', action: () => data.removeCounselor(id) })}
        />
      )}

      {/* Answers */}
      {tab === 'answers' && (
        <AnswersManager fetchQuestions={data.getAnsweredQuestionsAdmin} />
      )}

      {/* AI Sources */}
      {tab === 'ai-sources' && (
        <AiSourcesManager
          resources={data.adminResources}
          onToggleAi={data.toggleAiSource}
        />
      )}

      {/* Moderators */}
      {tab === 'moderators' && (
        <ModeratorsManager onCreate={createModerator} />
      )}

      {/* Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-ink-900/40 flex items-center justify-center z-50 p-4" onClick={() => setConfirmDelete(null)}>
          <div className="card p-6 max-w-md w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-ink-900 text-lg">تأكيد الحذف</h3>
                <p className="text-sm text-ink-500 mt-1">هل أنت متأكد من حذف {confirmDelete.label}؟ لا يمكن التراجع عن هذا الإجراء.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleDelete} className="btn-primary text-sm bg-red-600 hover:bg-red-700">
                <Trash2 className="w-4 h-4" />
                تأكيد الحذف
              </button>
              <button onClick={() => setConfirmDelete(null)} className="btn-ghost text-sm">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Subjects Manager
// ============================================================

function SubjectsManager({ subjects, onCreate, onEdit, onDelete, onToggleHidden }: {
  subjects: SubjectRow[];
  onCreate: (s: { id: string; name: string; nameEn: string; description: string; icon: string; color: string }) => Promise<boolean>;
  onEdit: (id: string, updates: { name?: string; name_en?: string; description?: string; icon?: string; color?: string }) => Promise<boolean>;
  onDelete: (id: string) => void;
  onToggleHidden: (id: string, hidden: boolean) => Promise<boolean>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ id: '', name: '', nameEn: '', description: '', icon: 'BookOpen', color: 'ink' });
  const [query, setQuery] = useState('');

  const filtered = subjects.filter((s) => s.name.includes(query) || s.name_en.toLowerCase().includes(query.toLowerCase()));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await onEdit(editId, { name: form.name, name_en: form.nameEn, description: form.description, icon: form.icon, color: form.color });
    } else {
      await onCreate(form);
    }
    setForm({ id: '', name: '', nameEn: '', description: '', icon: 'BookOpen', color: 'ink' });
    setShowForm(false);
    setEditId(null);
  };

  const startEdit = (s: SubjectRow) => {
    setEditId(s.id);
    setForm({ id: s.id, name: s.name, nameEn: s.name_en, description: s.description, icon: s.icon, color: s.color });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن مادة..."
            className="input-field pr-10 text-sm"
          />
        </div>
        <button
          onClick={() => { setEditId(null); setForm({ id: '', name: '', nameEn: '', description: '', icon: 'BookOpen', color: 'ink' }); setShowForm(true); }}
          className="btn-primary text-sm"
        >
          <Plus className="w-4 h-4" />
          إضافة مادة
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4 animate-scale-in">
          <h3 className="font-heading font-bold text-ink-900">{editId ? 'تعديل مادة' : 'إضافة مادة جديدة'}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">المعرف *</label>
              <input type="text" value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value })} placeholder="مثال: science" className="input-field" disabled={!!editId} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">الاسم بالإنجليزية</label>
              <input type="text" value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} placeholder="Science" className="input-field" dir="ltr" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">الاسم بالعربية *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="العلوم" className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">الوصف *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="وصف المادة..." rows={2} className="input-field resize-none" required />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">الأيقونة</label>
              <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="input-field">
                {iconOptions.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">اللون</label>
              <select value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="input-field">
                {colorOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">{editId ? 'حفظ التعديل' : 'إضافة'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-ghost text-sm">إلغاء</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {filtered.map((s) => (
          <div key={s.id} className={`card p-4 flex items-center justify-between gap-3 ${s.is_hidden ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-ink-50 flex items-center justify-center text-ink-700 shrink-0">
                <SubjectIcon name={s.icon} className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-ink-900">{s.name}</h3>
                <p className="text-sm text-ink-500 truncate">{s.description}</p>
              </div>
              {s.is_hidden && <span className="chip bg-ink-50 text-ink-400 text-xs">مخفي</span>}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => startEdit(s)} className="btn-ghost p-2" title="تعديل">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => onToggleHidden(s.id, !s.is_hidden)} className="btn-ghost p-2" title={s.is_hidden ? 'إظهار' : 'إخفاء'}>
                {s.is_hidden ? <EyeIcon className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => onDelete(s.id)} className="btn-ghost p-2 text-red-600" title="حذف">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-ink-400 py-8">لا توجد مواد.</p>}
      </div>
    </div>
  );
}

// ============================================================
// Topics Manager
// ============================================================

function TopicsManager({ resources, subjects, onCreate, onEdit, onDelete, onToggleHidden, onUploadFile, onUploadThumbnail }: {
  resources: (ResourceRow & { subjectName: string })[];
  subjects: SubjectRow[];
  onCreate: (r: { subjectId: string; title: string; lesson: string; type: string; author: string; description: string; fileUrl?: string | null; thumbnailUrl?: string | null }) => Promise<boolean>;
  onEdit: (id: string, updates: { title?: string; lesson?: string; type?: string; description?: string; subject_id?: string; author?: string; file_url?: string | null; thumbnail_url?: string | null }) => Promise<boolean>;
  onDelete: (id: string) => void;
  onToggleHidden: (id: string, hidden: boolean) => Promise<boolean>;
  onUploadFile: (file: File) => Promise<{ url: string | null; error?: string }>;
  onUploadThumbnail: (file: File) => Promise<{ url: string | null; error?: string }>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ subjectId: '', title: '', lesson: '', type: 'lesson', author: '', description: '', fileUrl: '', thumbnailUrl: '', linkUrl: '' });
  const [query, setQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewResource, setPreviewResource] = useState<string | null>(null);

  const sourceLabels: Record<string, { label: string; className: string }> = {
    official: { label: 'محتوى رسمي', className: 'bg-gold/10 text-gold-dark' },
    teacher: { label: 'محتوى المعلم', className: 'bg-sage-50 text-sage-dark' },
    contribution: { label: 'مساهمة', className: 'bg-ink-50 text-ink-500' },
  };

  const filtered = resources.filter((r) => {
    const matchesQuery = !query || r.title.includes(query) || r.lesson.includes(query) || r.description.includes(query);
    const matchesSubject = subjectFilter === 'all' || r.subject_id === subjectFilter;
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    const matchesSource = sourceFilter === 'all' || (r.source || 'official') === sourceFilter;
    return matchesQuery && matchesSubject && matchesType && matchesSource;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    const { url, error } = await onUploadFile(file);
    if (error) {
      setUploadError(error);
    } else if (url) {
      setForm((prev) => ({ ...prev, fileUrl: url }));
    }
    setUploading(false);
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    const { url, error } = await onUploadThumbnail(file);
    if (error) {
      setUploadError(error);
    } else if (url) {
      setForm((prev) => ({ ...prev, thumbnailUrl: url }));
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isLinkType = form.type === 'link';
    const fileUrl = isLinkType ? form.linkUrl : form.fileUrl;
    if (editId) {
      const updates: { title?: string; lesson?: string; type?: string; description?: string; subject_id?: string; author?: string; file_url?: string | null; thumbnail_url?: string | null } = {
        title: form.title, lesson: form.lesson, type: form.type, description: form.description, subject_id: form.subjectId, author: form.author,
      };
      if (fileUrl) updates.file_url = fileUrl;
      if (form.thumbnailUrl) updates.thumbnail_url = form.thumbnailUrl;
      await onEdit(editId, updates);
    } else {
      await onCreate({ ...form, fileUrl: fileUrl || null, thumbnailUrl: form.thumbnailUrl || null });
    }
    setForm({ subjectId: '', title: '', lesson: '', type: 'lesson', author: '', description: '', fileUrl: '', thumbnailUrl: '', linkUrl: '' });
    setShowForm(false);
    setEditId(null);
  };

  const startEdit = (r: ResourceRow & { subjectName: string }) => {
    setEditId(r.id);
    setForm({
      subjectId: r.subject_id, title: r.title, lesson: r.lesson, type: r.type, author: r.author, description: r.description,
      fileUrl: r.file_url || '', thumbnailUrl: r.thumbnail_url || '', linkUrl: r.type === 'link' ? (r.file_url || '') : '',
    });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex gap-2 flex-1 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث..." className="input-field pr-10 text-sm" />
          </div>
          <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)} className="input-field sm:w-40 text-sm">
            <option value="all">كل المواد</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field sm:w-40 text-sm">
            <option value="all">كل الأنواع</option>
            {(Object.keys(resourceTypeLabels) as ResourceType[]).map((t) => <option key={t} value={t}>{resourceTypeLabels[t]}</option>)}
          </select>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} className="input-field sm:w-40 text-sm">
            <option value="all">كل المصادر</option>
            <option value="official">محتوى رسمي</option>
            <option value="teacher">محتوى المعلم</option>
            <option value="contribution">مساهمة</option>
          </select>
        </div>
        <button onClick={() => { setEditId(null); setForm({ subjectId: '', title: '', lesson: '', type: 'lesson', author: '', description: '', fileUrl: '', thumbnailUrl: '', linkUrl: '' }); setShowForm(true); }} className="btn-primary text-sm">
          <Plus className="w-4 h-4" />
          إضافة مورد
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4 animate-scale-in">
          <h3 className="font-heading font-bold text-ink-900">{editId ? 'تعديل مورد' : 'إضافة مورد جديد'}</h3>
          {uploadError && <div className="card bg-red-50 border-red-100 p-3 text-sm text-red-700">{uploadError}</div>}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">المادة *</label>
            <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="input-field" required>
              <option value="">اختر المادة</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">العنوان *</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="مثال: قوانين نيوتن" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">الدرس *</label>
              <input type="text" value={form.lesson} onChange={(e) => setForm({ ...form, lesson: e.target.value })} placeholder="مثال: الديناميكا" className="input-field" required />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">النوع *</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="input-field">
                {(Object.keys(resourceTypeLabels) as ResourceType[]).map((t) => <option key={t} value={t}>{resourceTypeLabels[t]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">المؤلف</label>
              <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="اسم المؤلف" className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">الوصف *</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="وصف المحتوى..." rows={2} className="input-field resize-none" required />
          </div>

          {form.type === 'link' ? (
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">الرابط *</label>
              <div className="relative">
                <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                <input type="url" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} placeholder="https://..." className="input-field pr-10" dir="ltr" required />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">الملف</label>
              {form.fileUrl ? (
                <div className="flex items-center gap-2 card bg-sage-50 border-sage-100 p-3">
                  <CheckCircle2 className="w-4 h-4 text-sage-dark" />
                  <span className="text-sm text-sage-dark flex-1">تم رفع الملف بنجاح</span>
                  <button type="button" onClick={() => setForm({ ...form, fileUrl: '' })} className="btn-ghost p-1 text-red-600"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <label className="card border-dashed border-2 border-ink-200 p-6 flex flex-col items-center gap-2 cursor-pointer hover:border-gold transition-colors">
                  {uploading ? (
                    <>
                      <Loader2 className="w-6 h-6 text-gold-dark animate-spin" />
                      <span className="text-sm text-ink-500">جاري الرفع...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-ink-400" />
                      <span className="text-sm text-ink-500">اضغط لرفع الملف (PDF, فيديو, صورة)</span>
                      <span className="text-xs text-ink-400">الحد الأقصى 100 ميجابايت</span>
                    </>
                  )}
                  <input type="file" onChange={handleFileUpload} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">صورة مصغرة (اختياري)</label>
            {form.thumbnailUrl ? (
              <div className="flex items-center gap-2 card bg-sage-50 border-sage-100 p-3">
                <CheckCircle2 className="w-4 h-4 text-sage-dark" />
                <span className="text-sm text-sage-dark flex-1">تم رفع الصورة</span>
                <button type="button" onClick={() => setForm({ ...form, thumbnailUrl: '' })} className="btn-ghost p-1 text-red-600"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <label className="card border-dashed border-2 border-ink-200 p-4 flex items-center justify-center gap-2 cursor-pointer hover:border-gold transition-colors">
                {uploading ? (
                  <Loader2 className="w-4 h-4 text-gold-dark animate-spin" />
                ) : (
                  <>
                    <Upload className="w-4 h-4 text-ink-400" />
                    <span className="text-sm text-ink-500">رفع صورة مصغرة</span>
                  </>
                )}
                <input type="file" accept="image/*" onChange={handleThumbnailUpload} className="hidden" disabled={uploading} />
              </label>
            )}
          </div>

          <div className="flex gap-2">
            <button type="submit" disabled={uploading} className="btn-primary text-sm">{uploading ? 'جاري الرفع...' : (editId ? 'حفظ التعديل' : 'إضافة')}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-ghost text-sm">إلغاء</button>
          </div>
        </form>
      )}

      {previewResource && (() => {
        const r = resources.find((r) => r.id === previewResource);
        if (!r) return null;
        return (
          <div className="fixed inset-0 bg-ink-900/40 flex items-center justify-center z-50 p-4" onClick={() => setPreviewResource(null)}>
            <div className="card p-6 max-w-2xl w-full animate-scale-in" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-heading font-bold text-ink-900 text-lg">{r.title}</h3>
                <button onClick={() => setPreviewResource(null)} className="btn-ghost p-1"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-ink-400">المادة:</span> <span className="text-ink-700 font-medium">{r.subjectName}</span></div>
                  <div><span className="text-ink-400">النوع:</span> <span className="text-ink-700 font-medium">{resourceTypeLabels[r.type as ResourceType] || r.type}</span></div>
                  <div><span className="text-ink-400">الدرس:</span> <span className="text-ink-700 font-medium">{r.lesson}</span></div>
                  <div><span className="text-ink-400">المؤلف:</span> <span className="text-ink-700 font-medium">{r.author || '—'}</span></div>
                </div>
                {r.description && (
                  <div>
                    <span className="text-ink-400 block mb-1">الوصف:</span>
                    <p className="text-ink-700 leading-relaxed">{r.description}</p>
                  </div>
                )}
                {r.thumbnail_url && (
                  <div>
                    <span className="text-ink-400 block mb-1">الصورة المصغرة:</span>
                    <img src={r.thumbnail_url} alt={r.title} className="rounded-lg max-h-48 object-cover" />
                  </div>
                )}
                {r.file_url && (
                  <div>
                    <span className="text-ink-400 block mb-1">المحتوى:</span>
                    {r.type === 'link' ? (
                      <a href={r.file_url} target="_blank" rel="noopener noreferrer" className="btn-outline text-sm">فتح الرابط</a>
                    ) : (
                      <FilePreview url={r.file_url} fileName={r.title} />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      <div className="space-y-2">
        {filtered.map((r) => (
          <div key={r.id} className={`card p-4 flex items-center justify-between gap-3 ${r.is_hidden ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {r.thumbnail_url ? (
                <img src={r.thumbnail_url} alt={r.title} className="w-10 h-10 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-ink-50 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-ink-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-heading font-bold text-ink-900">{r.title}</h3>
                  <span className="chip bg-ink-50 text-ink-500 text-xs">{r.subjectName}</span>
                  <span className="chip bg-gold/10 text-gold-dark text-xs">{resourceTypeLabels[r.type as ResourceType] || r.type}</span>
                  <span className={`chip text-xs ${(sourceLabels[r.source || 'official'] || sourceLabels.official).className}`}>{(sourceLabels[r.source || 'official'] || sourceLabels.official).label}</span>
                  {r.is_hidden && <span className="chip bg-ink-50 text-ink-400 text-xs">مخفي</span>}
                </div>
                <p className="text-sm text-ink-500 truncate">{r.lesson} — {r.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setPreviewResource(r.id)} className="btn-ghost p-2" title="معاينة">
                <Eye className="w-4 h-4" />
              </button>
              <button onClick={() => startEdit(r)} className="btn-ghost p-2" title="تعديل">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => onToggleHidden(r.id, !r.is_hidden)} className="btn-ghost p-2" title={r.is_hidden ? 'إظهار' : 'إخفاء'}>
                {r.is_hidden ? <EyeIcon className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => onDelete(r.id)} className="btn-ghost p-2 text-red-600" title="حذف">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-ink-400 py-8">لا توجد موارد.</p>}
      </div>
    </div>
  );
}

// ============================================================
// Counselors Manager
// ============================================================

const counselorStatusLabels: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'معتمد',
  rejected: 'مرفوض',
  suspended: 'موقوف',
};

const counselorStatusClasses: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600',
  approved: 'bg-sage-50 text-sage-dark',
  rejected: 'bg-red-50 text-red-600',
  suspended: 'bg-ink-100 text-ink-600',
};

function CounselorsManager({ counselors, onSetStatus, onToggleVisible, onEdit, onDelete }: {
  counselors: CounselorRow[];
  onSetStatus: (id: string, status: string) => Promise<boolean>;
  onToggleVisible: (id: string, visible: boolean) => Promise<boolean>;
  onEdit: (id: string, updates: { name?: string; specialization?: string; bio?: string; qualifications?: string; experience?: number; support_areas?: string; photo_url?: string | null }) => Promise<boolean>;
  onDelete: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', specialization: '', bio: '', qualifications: '', experience: 0, support_areas: '', photo_url: '' });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  const filtered = counselors.filter((c) => {
    const matchesQuery = !query || c.name.includes(query) || c.specialization.includes(query) || c.username.includes(query);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const startEdit = (c: CounselorRow) => {
    setEditId(c.id);
    setEditForm({ name: c.name, specialization: c.specialization, bio: c.bio, qualifications: c.qualifications, experience: c.experience, support_areas: c.support_areas, photo_url: c.photo_url || '' });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setBusyId(editId);
    const ok = await onEdit(editId, editForm);
    setBusyId(null);
    if (ok) {
      showFeedback('success', 'تم تحديث بيانات المستشار بنجاح');
    } else {
      showFeedback('error', 'حدث خطأ أثناء تحديث بيانات المستشار');
    }
    setEditId(null);
  };

  const handleSetStatus = async (id: string, status: string) => {
    setBusyId(id);
    const ok = await onSetStatus(id, status);
    setBusyId(null);
    if (ok) {
      const messages: Record<string, string> = {
        approved: 'تم اعتماد المستشار بنجاح',
        rejected: 'تم رفض طلب المستشار',
        suspended: 'تم إيقاف المستشار',
      };
      showFeedback('success', messages[status] || 'تم تحديث حالة المستشار');
    } else {
      showFeedback('error', 'حدث خطأ أثناء تحديث حالة المستشار');
    }
  };

  const handleToggleVisible = async (c: CounselorRow) => {
    setBusyId(c.id);
    const ok = await onToggleVisible(c.id, !c.is_visible);
    setBusyId(null);
    if (ok) {
      showFeedback('success', c.is_visible ? 'تم إخفاء المستشار' : 'تم إظهار المستشار');
    } else {
      showFeedback('error', 'حدث خطأ أثناء تغيير ظهور المستشار');
    }
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div className={`card p-3 flex items-center gap-2 animate-scale-in ${feedback.type === 'success' ? 'bg-sage-50 border-sage-100' : 'bg-red-50 border-red-100'}`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-sage-dark" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <p className={`text-sm ${feedback.type === 'success' ? 'text-sage-dark' : 'text-red-700'}`}>{feedback.message}</p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex gap-2 flex-1 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن مستشار..." className="input-field pr-10 text-sm" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-40 text-sm">
            <option value="all">كل الحالات</option>
            <option value="pending">قيد المراجعة</option>
            <option value="approved">معتمد</option>
            <option value="rejected">مرفوض</option>
            <option value="suspended">موقوف</option>
          </select>
        </div>
      </div>

      {editId && (
        <form onSubmit={handleEditSubmit} className="card p-5 space-y-4 animate-scale-in">
          <h3 className="font-heading font-bold text-ink-900">تعديل بيانات المستشار</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">الاسم</label>
              <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">الصورة (رابط)</label>
              <input type="url" value={editForm.photo_url} onChange={(e) => setEditForm({ ...editForm, photo_url: e.target.value })} placeholder="https://..." className="input-field" dir="ltr" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">التخصص</label>
            <input type="text" value={editForm.specialization} onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">نبذة تعريفية</label>
            <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={2} className="input-field resize-none" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">المؤهلات</label>
              <input type="text" value={editForm.qualifications} onChange={(e) => setEditForm({ ...editForm, qualifications: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">سنوات الخبرة</label>
              <input type="number" value={editForm.experience} onChange={(e) => setEditForm({ ...editForm, experience: parseInt(e.target.value) || 0 })} className="input-field" min={0} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">مجالات الدعم</label>
            <input type="text" value={editForm.support_areas} onChange={(e) => setEditForm({ ...editForm, support_areas: e.target.value })} className="input-field" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busyId === editId} className="btn-primary text-sm">
              {busyId === editId ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ'}
            </button>
            <button type="button" onClick={() => setEditId(null)} className="btn-ghost text-sm">إلغاء</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {filtered.map((c) => (
          <div key={c.id} className={`card p-4 flex items-center justify-between gap-3 ${!c.is_visible ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {c.photo_url ? (
                <img src={c.photo_url} alt={c.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 text-xs font-bold shrink-0">
                  {c.name.charAt(0)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-heading font-bold text-ink-900">{c.name}</h3>
                  <span className={`chip text-xs ${counselorStatusClasses[c.status] || ''}`}>{counselorStatusLabels[c.status] || c.status}</span>
                  {!c.is_visible && <span className="chip bg-ink-50 text-ink-400 text-xs">مخفي</span>}
                </div>
                <p className="text-sm text-ink-500 truncate">{c.specialization} — {c.bio}</p>
                <p className="text-xs text-ink-400 mt-0.5">اسم المستخدم: {c.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0 flex-wrap">
              {busyId === c.id && <Loader2 className="w-4 h-4 text-ink-400 animate-spin" />}
              {busyId !== c.id && (
                <>
                  {c.status === 'pending' && (
                    <>
                      <button onClick={() => handleSetStatus(c.id, 'approved')} className="btn-ghost p-2 text-sage-dark" title="اعتماد">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleSetStatus(c.id, 'rejected')} className="btn-ghost p-2 text-red-600" title="رفض">
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {c.status === 'approved' && (
                    <button onClick={() => handleSetStatus(c.id, 'suspended')} className="btn-ghost p-2 text-amber-600" title="إيقاف">
                      <AlertCircle className="w-4 h-4" />
                    </button>
                  )}
                  {(c.status === 'rejected' || c.status === 'suspended') && (
                    <button onClick={() => handleSetStatus(c.id, 'approved')} className="btn-ghost p-2 text-sage-dark" title="إعادة اعتماد">
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => startEdit(c)} className="btn-ghost p-2" title="تعديل">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleToggleVisible(c)} className="btn-ghost p-2" title={c.is_visible ? 'إخفاء' : 'إظهار'}>
                    {c.is_visible ? <EyeOff className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                  <button onClick={() => onDelete(c.id)} className="btn-ghost p-2 text-red-600" title="حذف">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-ink-400 py-8">لا يوجد مستشارون.</p>}
      </div>
    </div>
  );
}

// ============================================================
// Teachers Manager
// ============================================================

function TeachersManager({ teachers, subjects, onCreate, onEdit, onDelete, onToggleHidden, onApprove, getSubscriberCount }: {
  teachers: (TeacherRow & { subjectName: string })[];
  subjects: SubjectRow[];
  onCreate: (t: { name: string; subjectId: string; bio: string; avatarInitials: string }) => Promise<boolean>;
  onEdit: (id: string, updates: { name?: string; subject_id?: string; bio?: string; avatar_initials?: string; questions_open?: boolean }) => Promise<boolean>;
  onDelete: (id: string) => void;
  onToggleHidden: (id: string, hidden: boolean) => Promise<boolean>;
  onApprove: (id: string, approved: boolean) => Promise<boolean>;
  getSubscriberCount: (teacherId: string) => Promise<number>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', subjectId: '', bio: '', avatarInitials: '' });
  const [query, setQuery] = useState('');
  const [subCounts, setSubCounts] = useState<Record<string, number>>({});

  const filtered = teachers.filter((t) => t.name.includes(query) || t.bio.includes(query));

  useEffect(() => {
    teachers.forEach(async (t) => {
      const count = await getSubscriberCount(t.id);
      setSubCounts((prev) => ({ ...prev, [t.id]: count }));
    });
  }, [teachers, getSubscriberCount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await onEdit(editId, { name: form.name, subject_id: form.subjectId, bio: form.bio, avatar_initials: form.avatarInitials });
    } else {
      await onCreate(form);
    }
    setForm({ name: '', subjectId: '', bio: '', avatarInitials: '' });
    setShowForm(false);
    setEditId(null);
  };

  const startEdit = (t: TeacherRow & { subjectName: string }) => {
    setEditId(t.id);
    setForm({ name: t.name, subjectId: t.subject_id, bio: t.bio, avatarInitials: t.avatar_initials });
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث عن معلم..." className="input-field pr-10 text-sm" />
        </div>
        <button onClick={() => { setEditId(null); setForm({ name: '', subjectId: '', bio: '', avatarInitials: '' }); setShowForm(true); }} className="btn-primary text-sm">
          <Plus className="w-4 h-4" />
          إضافة معلم
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4 animate-scale-in">
          <h3 className="font-heading font-bold text-ink-900">{editId ? 'تعديل معلم' : 'إضافة معلم جديد'}</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">الاسم *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="أ. أحمد محمد" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">المادة *</label>
              <select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} className="input-field" required>
                <option value="">اختر المادة</option>
                {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">النبذة *</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="نبذة عن المعلم..." rows={2} className="input-field resize-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">الأحرف الأولى *</label>
            <input type="text" value={form.avatarInitials} onChange={(e) => setForm({ ...form, avatarInitials: e.target.value })} placeholder="أم" className="input-field max-w-[120px]" required maxLength={3} />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">{editId ? 'حفظ التعديل' : 'إضافة'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn-ghost text-sm">إلغاء</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {filtered.map((t) => (
          <div key={t.id} className={`card p-4 flex items-center justify-between gap-3 ${t.is_hidden ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center text-ink-700 text-xs font-bold shrink-0">
                {t.avatar_initials}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-ink-900">{t.name}</h3>
                <p className="text-sm text-ink-500 truncate">{t.subjectName} — {t.bio}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-ink-400">المشتركون: {subCounts[t.id] ?? 0}</span>
                  {t.is_approved ? (
                    <span className="chip bg-sage-50 text-sage-dark text-xs">معتمد</span>
                  ) : (
                    <span className="chip bg-amber-50 text-amber-600 text-xs">قيد المراجعة</span>
                  )}
                  {t.is_hidden && <span className="chip bg-ink-50 text-ink-400 text-xs">مخفي</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {t.is_approved ? (
                <button onClick={() => onApprove(t.id, false)} className="btn-ghost p-2 text-amber-600" title="رفض المعلم">
                  <XCircle className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={() => onApprove(t.id, true)} className="btn-ghost p-2 text-sage-dark" title="اعتماد المعلم">
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => startEdit(t)} className="btn-ghost p-2" title="تعديل">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => onToggleHidden(t.id, !t.is_hidden)} className="btn-ghost p-2" title={t.is_hidden ? 'إظهار' : 'إخفاء'}>
                {t.is_hidden ? <EyeIcon className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button onClick={() => onDelete(t.id)} className="btn-ghost p-2 text-red-600" title="حذف">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-ink-400 py-8">لا يوجد معلمون.</p>}
      </div>
    </div>
  );
}

// ============================================================
// Contributions Manager
// ============================================================

function ContributionsManager({ contributions, subjects, onStatusChange, onEdit, onDelete, onPreview, onReject }: {
  contributions: ContributionRow[];
  subjects: SubjectRow[];
  onStatusChange: (id: string, status: string, reviewNote?: string) => Promise<boolean>;
  onEdit: (id: string, updates: { lesson?: string; description?: string; content_type?: string; subject_id?: string }) => Promise<boolean>;
  onDelete: (id: string) => void;
  onPreview: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ lesson: '', description: '', content_type: 'summary', subject_id: '' });

  const filtered = contributions.filter((c) => {
    const matchesQuery = !query || c.lesson.includes(query) || c.student_name.includes(query) || c.description.includes(query);
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const startEdit = (c: ContributionRow) => {
    setEditId(c.id);
    setEditForm({ lesson: c.lesson, description: c.description, content_type: c.content_type, subject_id: c.subject_id });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await onEdit(editId, editForm);
      setEditId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="ابحث..." className="input-field pr-10 text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-44 text-sm">
          <option value="all">كل الحالات</option>
          <option value="pending">قيد المراجعة</option>
          <option value="approved">تمت الموافقة</option>
          <option value="rejected">مرفوض</option>
          <option value="changes_requested">طلب تعديل</option>
        </select>
      </div>

      {editId && (
        <form onSubmit={handleEditSubmit} className="card p-5 space-y-4 animate-scale-in">
          <h3 className="font-heading font-bold text-ink-900">تعديل المساهمة</h3>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">الدرس</label>
            <input type="text" value={editForm.lesson} onChange={(e) => setEditForm({ ...editForm, lesson: e.target.value })} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">المادة</label>
            <select value={editForm.subject_id} onChange={(e) => setEditForm({ ...editForm, subject_id: e.target.value })} className="input-field">
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">النوع</label>
            <select value={editForm.content_type} onChange={(e) => setEditForm({ ...editForm, content_type: e.target.value })} className="input-field">
              {(Object.keys(resourceTypeLabels) as ResourceType[]).map((t) => <option key={t} value={t}>{resourceTypeLabels[t]}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">الوصف</label>
            <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows={2} className="input-field resize-none" />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-sm">حفظ</button>
            <button type="button" onClick={() => setEditId(null)} className="btn-ghost text-sm">إلغاء</button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.id} className="card p-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-heading font-bold text-ink-900">{c.lesson}</h3>
                  <span className="chip bg-ink-50 text-ink-500 text-xs">{subjects.find((s) => s.id === c.subject_id)?.name || '—'}</span>
                  <span className="chip bg-gold/10 text-gold-dark text-xs">{resourceTypeLabels[c.content_type as ResourceType] || c.content_type}</span>
                </div>
                <p className="text-sm text-ink-600 mt-1">{c.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-ink-400">
                  <span>الطالب: {c.student_name}</span>
                  <span>•</span>
                  <span>{c.created_at?.split('T')[0] || ''}</span>
                  <span>•</span>
                  <span className="font-mono" dir="ltr">{c.file_name}</span>
                </div>
                {c.review_note && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 mt-2">
                    ملاحظة المراجعة: {c.review_note}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={c.status} />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-ink-50">
              {c.status === 'pending' && (
                <>
                  <button onClick={() => onStatusChange(c.id, 'approved')} className="btn-outline text-sm text-sage-dark border-sage-100 hover:bg-sage-50">
                    <CheckCircle2 className="w-4 h-4" />
                    قبول
                  </button>
                  <button onClick={() => onReject(c.id)} className="btn-outline text-sm text-red-600 border-red-100 hover:bg-red-50">
                    <XCircle className="w-4 h-4" />
                    رفض
                  </button>
                  <button onClick={() => onStatusChange(c.id, 'changes_requested', 'يرجى إجراء بعض التعديلات على المحتوى.')} className="btn-outline text-sm text-amber-700 border-amber-100 hover:bg-amber-50">
                    <AlertCircle className="w-4 h-4" />
                    طلب تعديل
                  </button>
                </>
              )}
              <button onClick={() => startEdit(c)} className="btn-ghost text-sm">
                <Pencil className="w-4 h-4" />
                تعديل
              </button>
              <button onClick={() => onPreview(c.id)} className="btn-ghost text-sm">
                <Eye className="w-4 h-4" />
                معاينة
              </button>
              <button onClick={() => onDelete(c.id)} className="btn-ghost text-sm text-red-600">
                <Trash2 className="w-4 h-4" />
                حذف
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-ink-400 py-8">لا توجد مساهمات.</p>}
      </div>
    </div>
  );
}

// ============================================================
// Suggestions Manager
// ============================================================

function SuggestionsManager({ suggestions, onStatusChange, onDelete }: {
  suggestions: SuggestionRow[];
  onStatusChange: (id: string, status: string) => Promise<boolean>;
  onDelete: (id: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState('all');

  const statusLabels: Record<string, string> = {
    new: 'جديد',
    read: 'قيد المراجعة',
    reviewing: 'قيد المراجعة',
    accepted: 'مقبول',
    rejected: 'مرفوض',
    resolved: 'مكتمل',
  };

  const statusClasses: Record<string, string> = {
    new: 'bg-gold/15 text-gold-dark',
    read: 'bg-blue-50 text-blue-600',
    reviewing: 'bg-blue-50 text-blue-600',
    accepted: 'bg-sage-50 text-sage-dark',
    rejected: 'bg-red-50 text-red-600',
    resolved: 'bg-ink-100 text-ink-600',
  };

  const filtered = suggestions.filter((s) => statusFilter === 'all' || s.status === statusFilter);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {['all', 'new', 'read', 'accepted', 'rejected', 'resolved'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`chip text-sm transition-all ${
              statusFilter === st ? 'bg-ink-700 text-white' : 'bg-white text-ink-600 border border-ink-200 hover:border-ink-300'
            }`}
          >
            {st === 'all' ? 'الكل' : statusLabels[st] || st}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((s) => (
          <div key={s.id} className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="chip bg-gold/10 text-gold-dark text-xs">{s.type}</span>
                  <span className="text-xs text-ink-400">{s.created_at?.split('T')[0] || ''}</span>
                </div>
                <p className="text-sm text-ink-700 leading-relaxed mt-1">{s.message}</p>
                {(s.name || s.email) && (
                  <p className="text-xs text-ink-400 mt-2">
                    {s.name && <span>من: {s.name}</span>}
                    {s.name && s.email && <span> — </span>}
                    {s.email && <span dir="ltr">{s.email}</span>}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className={`chip text-xs ${statusClasses[s.status] || 'bg-ink-50 text-ink-500'}`}>
                  {statusLabels[s.status] || s.status}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 pt-3 border-t border-ink-50">
              <select
                value={s.status}
                onChange={(e) => onStatusChange(s.id, e.target.value)}
                className="input-field text-sm py-1.5 max-w-[160px]"
              >
                <option value="new">جديد</option>
                <option value="read">قيد المراجعة</option>
                <option value="accepted">مقبول</option>
                <option value="rejected">مرفوض</option>
                <option value="resolved">مكتمل</option>
              </select>
              <button onClick={() => onDelete(s.id)} className="btn-ghost text-sm text-red-600">
                <Trash2 className="w-4 h-4" />
                حذف
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-center text-ink-400 py-8">لا توجد اقتراحات.</p>}
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

// ============================================================
// Moderators Manager
// ============================================================

function ModeratorsManager({ onCreate }: {
  onCreate: (params: { email: string; password: string; name: string }) => Promise<{ error?: string }>;
}) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setError('يرجى ملء جميع الحقول.');
      return;
    }
    if (form.password.length < 6) {
      setError('كلمة المرور يجب أن تكون 6 أحرف على الأقل.');
      return;
    }
    setBusy(true);
    const result = await onCreate({
      email: form.email.trim(),
      password: form.password,
      name: form.name.trim(),
    });
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setSuccess(`تم إنشاء حساب المراقب بنجاح: ${form.email}`);
    setForm({ name: '', email: '', password: '' });
    setShowForm(false);
    setTimeout(() => setSuccess(''), 5000);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-heading font-bold text-ink-900 text-lg">إدارة المراقبين</h2>
          <p className="text-sm text-ink-500 mt-0.5">إنشاء وإدارة حسابات المراقبين</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}
          className="btn-primary text-sm"
        >
          <Plus className="w-4 h-4" />
          إنشاء مراقب
        </button>
      </div>

      {success && (
        <div className="card bg-sage-50 border-sage-100 p-3 flex items-center gap-2 animate-scale-in">
          <CheckCircle2 className="w-4 h-4 text-sage-dark" />
          <p className="text-sm text-sage-dark">{success}</p>
        </div>
      )}

      {error && (
        <div className="card bg-red-50 border-red-100 p-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card p-5 space-y-4 animate-scale-in max-w-md">
          <h3 className="font-heading font-bold text-ink-900">إنشاء حساب مراقب جديد</h3>
          <p className="text-xs text-ink-400">
            سيتم إنشاء حساب للمراقب يمكنه من خلاله الدخول إلى لوحة المراجعة. سيبقى حسابك الحالي نشطاً.
          </p>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">الاسم</label>
            <div className="relative">
              <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="اسم المراقب"
                className="input-field pr-10"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
                className="input-field pr-10"
                dir="ltr"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="input-field pr-10"
                dir="ltr"
                required
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="btn-primary text-sm">
              {busy ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
            </button>
            <button type="button" onClick={() => { setShowForm(false); setForm({ name: '', email: '', password: '' }); }} className="btn-ghost text-sm">
              إلغاء
            </button>
          </div>
        </form>
      )}

      {!showForm && !success && (
        <div className="card p-5">
          <p className="text-sm text-ink-500 text-center py-8">
            استخدم زر "إنشاء مراقب" لإضافة حساب مراقب جديد. يمكن للمراقب مراجعة المساهمات والاقتراحات وطلبات المعلمين.
          </p>
        </div>
      )}
    </div>
  );
}

// ============================================================
// Answers Manager
// ============================================================

function AnswersManager({ fetchQuestions }: {
  fetchQuestions: () => Promise<TeacherQuestion[]>;
}) {
  const [questions, setQuestions] = useState<TeacherQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const qs = await fetchQuestions();
    setQuestions(qs);
    setLoading(false);
  }, [fetchQuestions]);

  useEffect(() => { load(); }, [load]);

  const filtered = questions.filter((q) => {
    const matchesQuery = !query || q.question.includes(query) || (q.answer || '').includes(query) || q.studentName.includes(query) || q.teacherName.includes(query);
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في الأسئلة والإجابات..."
            className="input-field pr-10 text-sm"
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field sm:w-40 text-sm">
          <option value="all">كل الحالات</option>
          <option value="answered">تمت الإجابة</option>
          <option value="pending">بانتظار الإجابة</option>
        </select>
      </div>

      {loading ? (
        <div className="card p-8 text-center">
          <Loader2 className="w-6 h-6 text-ink-400 animate-spin mx-auto" />
          <p className="text-sm text-ink-500 mt-2">جاري تحميل الإجابات...</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map((q) => (
            <div key={q.id} className="card p-4 space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="chip bg-ink-50 text-ink-500 text-xs">سؤال خاص</span>
                  {q.status === 'answered' ? (
                    <span className="chip bg-sage-50 text-sage-dark text-xs">تمت الإجابة</span>
                  ) : (
                    <span className="chip bg-amber-50 text-amber-600 text-xs">بانتظار الإجابة</span>
                  )}
                </div>
                <span className="text-xs text-ink-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {q.answeredAt ? new Date(q.answeredAt).toLocaleDateString('ar-SA') : new Date(q.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
              <div className="border-r-2 border-ink-100 pr-3">
                <p className="text-xs text-ink-400 mb-1">السؤال</p>
                <p className="text-sm text-ink-700 leading-relaxed">{q.question}</p>
              </div>
              {q.answer && (
                <div className="border-r-2 border-gold/40 pr-3">
                  <p className="text-xs text-gold-dark mb-1">الإجابة</p>
                  <p className="text-sm text-ink-700 leading-relaxed">{q.answer}</p>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-ink-50 text-xs">
                <div>
                  <span className="text-ink-400">الطالب:</span>{' '}
                  <span className="font-medium text-ink-700">{q.studentName}</span>
                </div>
                <div>
                  <span className="text-ink-400">المعلم:</span>{' '}
                  <span className="font-medium text-ink-700">{q.teacherName}</span>
                </div>
                <div>
                  <span className="text-ink-400">الحالة:</span>{' '}
                  <span className="font-medium text-ink-700">{q.status === 'answered' ? 'تمت الإجابة' : 'بانتظار الإجابة'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-12 text-center">
          <HelpCircle className="w-10 h-10 text-ink-300 mx-auto mb-3" />
          <p className="text-ink-500">لا توجد إجابات حالياً.</p>
        </div>
      )}
    </div>
  );
}
