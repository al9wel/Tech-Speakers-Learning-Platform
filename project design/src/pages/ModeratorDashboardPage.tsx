import { useState, useEffect } from 'react';
import {
  ShieldCheck, FileText, Lightbulb, Users, Clock,
  CheckCircle2, XCircle, AlertCircle, X, Eye,
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import { resourceTypeLabels, type ResourceType } from '@/data/sampleData';
import FilePreview from '@/components/FilePreview';

type Tab = 'overview' | 'contributions' | 'suggestions' | 'teachers';

export default function ModeratorDashboardPage() {
  const data = useData();
  const [tab, setTab] = useState<Tab>('overview');
  const [previewContribution, setPreviewContribution] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    data.refreshAdmin();
  }, []);

  const pendingContributions = data.adminContributions.filter((c) => c.status === 'pending');
  const newSuggestions = data.adminSuggestions.filter((s) => s.status === 'new');
  const pendingTeachers = data.adminTeachers.filter((t) => !t.is_approved);

  const tabs: { key: Tab; label: string; icon: typeof ShieldCheck; badge?: number }[] = [
    { key: 'overview', label: 'نظرة عامة', icon: ShieldCheck },
    { key: 'contributions', label: 'المساهمات', icon: FileText, badge: pendingContributions.length },
    { key: 'suggestions', label: 'الاقتراحات', icon: Lightbulb, badge: newSuggestions.length },
    { key: 'teachers', label: 'طلبات المعلمين', icon: Users, badge: pendingTeachers.length },
  ];

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <div className="container-page py-8 animate-page">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-sage-50 flex items-center justify-center text-sage-dark">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-900">لوحة المراجعة</h1>
          <p className="text-sm text-ink-500">مراجعة المساهمات والاقتراحات وطلبات المعلمين</p>
        </div>
      </div>

      {successMsg && (
        <div className="card bg-sage-50 border-sage-100 p-3 mb-4 flex items-center gap-2 animate-scale-in">
          <CheckCircle2 className="w-4 h-4 text-sage-dark" />
          <p className="text-sm text-sage-dark">{successMsg}</p>
        </div>
      )}

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-amber-700 bg-amber-50">
                <FileText className="w-5 h-5" />
              </div>
              <p className="font-heading font-extrabold text-2xl text-ink-900">{pendingContributions.length}</p>
              <p className="text-sm text-ink-500 mt-0.5">مساهمات قيد المراجعة</p>
            </div>
            <div className="card p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-gold-dark bg-gold/10">
                <Lightbulb className="w-5 h-5" />
              </div>
              <p className="font-heading font-extrabold text-2xl text-ink-900">{newSuggestions.length}</p>
              <p className="text-sm text-ink-500 mt-0.5">اقتراحات جديدة</p>
            </div>
            <div className="card p-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-ink-700 bg-ink-50">
                <Users className="w-5 h-5" />
              </div>
              <p className="font-heading font-extrabold text-2xl text-ink-900">{pendingTeachers.length}</p>
              <p className="text-sm text-ink-500 mt-0.5">طلبات معلمين قيد المراجعة</p>
            </div>
          </div>

          <div className="card p-5">
            <h3 className="font-heading font-bold text-ink-900 mb-3">الإجراءات المطلوبة</h3>
            <div className="space-y-2">
              {pendingContributions.length === 0 && newSuggestions.length === 0 && pendingTeachers.length === 0 ? (
                <p className="text-sm text-ink-400 text-center py-4">لا توجد طلبات قيد المراجعة.</p>
              ) : (
                <>
                  {pendingContributions.length > 0 && (
                    <button
                      onClick={() => setTab('contributions')}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-amber-50 hover:bg-amber-100 transition-colors text-right"
                    >
                      <span className="text-sm text-amber-700 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        {pendingContributions.length} مساهمة بانتظار المراجعة
                      </span>
                      <Eye className="w-4 h-4 text-amber-600" />
                    </button>
                  )}
                  {newSuggestions.length > 0 && (
                    <button
                      onClick={() => setTab('suggestions')}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-gold/10 hover:bg-gold/15 transition-colors text-right"
                    >
                      <span className="text-sm text-gold-dark flex items-center gap-2">
                        <Lightbulb className="w-4 h-4" />
                        {newSuggestions.length} اقتراح جديد بانتظار المراجعة
                      </span>
                      <Eye className="w-4 h-4 text-gold-dark" />
                    </button>
                  )}
                  {pendingTeachers.length > 0 && (
                    <button
                      onClick={() => setTab('teachers')}
                      className="w-full flex items-center justify-between p-3 rounded-lg bg-ink-50 hover:bg-ink-100 transition-colors text-right"
                    >
                      <span className="text-sm text-ink-700 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        {pendingTeachers.length} طلب معلم بانتظار المراجعة
                      </span>
                      <Eye className="w-4 h-4 text-ink-600" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contributions */}
      {tab === 'contributions' && (
        <div className="space-y-3">
          {data.adminContributions.length === 0 ? (
            <div className="card p-5">
              <p className="text-sm text-ink-500 text-center py-8">لا توجد مساهمات.</p>
            </div>
          ) : (
            data.adminContributions.map((c) => (
              <div key={c.id} className="card p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-ink-900">{c.lesson}</h3>
                    <p className="text-sm text-ink-500 mt-0.5">
                      {c.student_name} — {c.email}
                    </p>
                  </div>
                  <ModStatusBadge status={c.status} />
                </div>
                <p className="text-sm text-ink-600 mt-2 line-clamp-2">{c.description}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="chip bg-ink-50 text-ink-500 text-xs">
                    {resourceTypeLabels[c.content_type as ResourceType] || c.content_type}
                  </span>
                  <span className="text-xs text-ink-400">
                    {c.created_at?.split('T')[0] || ''}
                  </span>
                </div>
                {c.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={async () => {
                        await data.setContributionStatus(c.id, 'approved');
                        showSuccess('تمت الموافقة على المساهمة.');
                      }}
                      className="btn-primary text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      موافقة
                    </button>
                    <button
                      onClick={() => { setRejectId(c.id); setRejectReason(''); }}
                      className="btn-outline text-sm text-red-600 border-red-100 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4" />
                      رفض
                    </button>
                    <button
                      onClick={() => setPreviewContribution(c.id)}
                      className="btn-ghost text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      معاينة
                    </button>
                  </div>
                )}
                {c.status !== 'pending' && (
                  <button
                    onClick={() => setPreviewContribution(c.id)}
                    className="btn-ghost text-sm mt-3"
                  >
                    <Eye className="w-4 h-4" />
                    معاينة
                  </button>
                )}
                {c.review_note && (
                  <p className="text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-1.5 mt-2">
                    ملاحظة: {c.review_note}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
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
                  showSuccess('تم رفض المساهمة.');
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
                  <div><span className="text-ink-400">النوع:</span> <span className="text-ink-700 font-medium">{resourceTypeLabels[c.content_type as ResourceType] || c.content_type}</span></div>
                  <div><span className="text-ink-400">الطالب:</span> <span className="text-ink-700 font-medium">{c.student_name}</span></div>
                  <div><span className="text-ink-400">البريد:</span> <span className="text-ink-700 font-medium" dir="ltr">{c.email}</span></div>
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
        <div className="space-y-3">
          {data.adminSuggestions.length === 0 ? (
            <div className="card p-5">
              <p className="text-sm text-ink-500 text-center py-8">لا توجد اقتراحات.</p>
            </div>
          ) : (
            data.adminSuggestions.map((s) => (
              <div key={s.id} className="card p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-ink-900">{s.type}</h3>
                    <p className="text-sm text-ink-500 mt-0.5">
                      {s.name || 'مجهول'} {s.email ? `— ${s.email}` : ''}
                    </p>
                  </div>
                  <SuggestionStatusBadge status={s.status} />
                </div>
                <p className="text-sm text-ink-600 mt-2">{s.message}</p>
                <span className="text-xs text-ink-400 mt-2 block">
                  {s.created_at?.split('T')[0] || ''}
                </span>
                {s.status === 'new' && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={async () => {
                        await data.setSuggestionStatus(s.id, 'resolved');
                        showSuccess('تم تحديد الاقتراح كمحلول.');
                      }}
                      className="btn-primary text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      تم الحل
                    </button>
                    <button
                      onClick={async () => {
                        await data.setSuggestionStatus(s.id, 'read');
                        showSuccess('تم تحديد الاقتراح كمقروء.');
                      }}
                      className="btn-ghost text-sm"
                    >
                      تحديد كمقروء
                    </button>
                  </div>
                )}
                {s.status === 'read' && (
                  <button
                    onClick={async () => {
                      await data.setSuggestionStatus(s.id, 'resolved');
                      showSuccess('تم تحديد الاقتراح كمحلول.');
                    }}
                    className="btn-primary text-sm mt-3"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    تم الحل
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Teacher Approvals */}
      {tab === 'teachers' && (
        <div className="space-y-3">
          {pendingTeachers.length === 0 ? (
            <div className="card p-5">
              <p className="text-sm text-ink-500 text-center py-8">لا توجد طلبات معلمين قيد المراجعة.</p>
            </div>
          ) : (
            pendingTeachers.map((t) => (
              <div key={t.id} className="card p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-ink-100 flex items-center justify-center text-ink-700 text-sm font-bold shrink-0">
                      {t.avatar_initials || t.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-ink-900">{t.name}</h3>
                      <p className="text-sm text-ink-500 mt-0.5">
                        {t.subjectName || 'مادة غير محددة'}
                      </p>
                    </div>
                  </div>
                  <span className="chip bg-amber-50 text-amber-700 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    قيد المراجعة
                  </span>
                </div>
                {t.bio && <p className="text-sm text-ink-600 mt-2">{t.bio}</p>}
                {t.specialization && (
                  <p className="text-xs text-ink-400 mt-1">التخصص: {t.specialization}</p>
                )}
                <span className="text-xs text-ink-400 mt-2 block">
                  {t.created_at?.split('T')[0] || ''}
                </span>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={async () => {
                      await data.approveTeacher(t.id, true);
                      showSuccess('تمت الموافقة على المعلم.');
                    }}
                    className="btn-primary text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    موافقة وتفعيل
                  </button>
                  <button
                    onClick={async () => {
                      await data.approveTeacher(t.id, false);
                      showSuccess('تم رفض طلب المعلم.');
                    }}
                    className="btn-outline text-sm text-red-600 border-red-100 hover:bg-red-50"
                  >
                    <XCircle className="w-4 h-4" />
                    رفض
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function ModStatusBadge({ status }: { status: string }) {
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

function SuggestionStatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    new: { label: 'جديد', className: 'bg-gold/15 text-gold-dark' },
    read: { label: 'مقروء', className: 'bg-ink-50 text-ink-500' },
    resolved: { label: 'محلول', className: 'bg-sage-50 text-sage-dark' },
  };
  const s = config[status] || config.new;
  return (
    <span className={`chip text-xs ${s.className}`}>
      {s.label}
    </span>
  );
}
