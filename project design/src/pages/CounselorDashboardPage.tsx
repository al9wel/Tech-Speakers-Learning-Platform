import { useState, useEffect, useCallback } from 'react';
import { Heart, MessageSquare, UserCog, Clock, Send, ArrowRight, Mail, Eye } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import type { Counselor } from '@/data/sampleData';
import type { ConversationRow, MessageRow } from '@/lib/dataAccess';

type SubTab = 'profile' | 'messages';

const statusLabels: Record<string, string> = {
  pending: 'قيد المراجعة',
  approved: 'معتمد',
  rejected: 'مرفوض',
  suspended: 'موقوف',
};

const statusClasses: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-600',
  approved: 'bg-sage-50 text-sage-dark',
  rejected: 'bg-red-50 text-red-600',
  suspended: 'bg-ink-100 text-ink-600',
};

export default function CounselorDashboardPage() {
  const { user } = useApp();
  const { getCounselorByUserId, editCounselor, getCounselorConversations, getMessages, sendMsg, markRead, getCounselorUnread } = useData();
  const [counselor, setCounselor] = useState<Counselor | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<SubTab>('profile');
  const [conversations, setConversations] = useState<(ConversationRow & { unreadCount: number; lastMessage: string | null; lastMessageAt: string | null })[]>([]);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);
  const [unreadTotal, setUnreadTotal] = useState(0);

  // Profile edit form
  const [form, setForm] = useState({ name: '', specialization: '', bio: '', qualifications: '', experience: 0, supportAreas: '' });
  const [profileSaved, setProfileSaved] = useState(false);

  const loadCounselor = useCallback(async () => {
    if (!user) return;
    const c = await getCounselorByUserId(user.id);
    setCounselor(c);
    if (c) {
      setForm({ name: c.name, specialization: c.specialization, bio: c.bio, qualifications: c.qualifications, experience: c.experience, supportAreas: c.supportAreas });
    }
    setLoading(false);
  }, [user, getCounselorByUserId]);

  const loadConversations = useCallback(async () => {
    if (!counselor) return;
    const convs = await getCounselorConversations(counselor.id);
    setConversations(convs);
    const unread = await getCounselorUnread(counselor.id);
    setUnreadTotal(unread);
  }, [counselor, getCounselorConversations, getCounselorUnread]);

  useEffect(() => { loadCounselor(); }, [loadCounselor]);
  useEffect(() => { if (counselor) loadConversations(); }, [counselor, loadConversations]);

  const openConversation = async (convId: string) => {
    setActiveConv(convId);
    const msgs = await getMessages(convId);
    setMessages(msgs as unknown as MessageRow[]);
    await markRead(convId, 'counselor');
    await loadConversations();
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !user || !reply.trim()) return;
    setBusy(true);
    const { error } = await sendMsg(activeConv, user.id, 'counselor', reply);
    if (!error) {
      setReply('');
      const msgs = await getMessages(activeConv);
      setMessages(msgs as unknown as MessageRow[]);
      await loadConversations();
    }
    setBusy(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!counselor) return;
    setBusy(true);
    const ok = await editCounselor(counselor.id, {
      name: form.name, specialization: form.specialization, bio: form.bio,
      qualifications: form.qualifications, experience: form.experience, support_areas: form.supportAreas,
    });
    if (ok) {
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
      await loadCounselor();
    }
    setBusy(false);
  };

  if (loading) {
    return (
      <div className="container-page py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!counselor) {
    return (
      <div className="container-page py-16 text-center">
        <Heart className="w-12 h-12 text-ink-300 mx-auto mb-4" />
        <h1 className="font-heading font-bold text-xl text-ink-900 mb-2">لم يتم العثور على ملف مستشار</h1>
        <p className="text-ink-500">لم يتم ربط حسابك بملف مستشار نفسي.</p>
      </div>
    );
  }

  return (
    <div className="container-page py-8 animate-page">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white">
          <Heart className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-900">واجهة المستشار</h1>
          <p className="text-sm text-ink-500">إدارة ملفك المهني ورسائل الطلاب</p>
        </div>
      </div>

      <div className={`chip text-sm mb-6 ${statusClasses[counselor.status] || ''}`}>
        حالة الحساب: {statusLabels[counselor.status] || counselor.status}
      </div>

      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide border-b border-ink-100">
        <button
          onClick={() => setTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            tab === 'profile' ? 'border-gold text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-700'
          }`}
        >
          <UserCog className="w-4 h-4" />
          الملف المهني
        </button>
        <button
          onClick={() => setTab('messages')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            tab === 'messages' ? 'border-gold text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-700'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          الرسائل
          {unreadTotal > 0 && (
            <span className="chip bg-rose-50 text-rose-600 text-xs px-2 py-0.5">{unreadTotal}</span>
          )}
        </button>
      </div>

      {tab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="card p-6 space-y-4 max-w-2xl">
          <h3 className="font-heading font-bold text-ink-900">تعديل الملف المهني</h3>
          {profileSaved && (
            <div className="card bg-sage-50 border-sage-100 p-3 text-sm text-sage-dark">تم حفظ التعديلات بنجاح.</div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">الاسم *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">التخصص</label>
            <input type="text" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="مثال: علم نفس إكلينيكي" className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">نبذة تعريفية</label>
            <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className="input-field resize-none" placeholder="نبذة عنك..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">المؤهلات</label>
            <input type="text" value={form.qualifications} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} placeholder="مثال: ماجستير علم نفس" className="input-field" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">سنوات الخبرة</label>
              <input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: parseInt(e.target.value) || 0 })} className="input-field" min={0} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">مجالات الدعم</label>
              <input type="text" value={form.supportAreas} onChange={(e) => setForm({ ...form, supportAreas: e.target.value })} placeholder="مثال: القلق، الاكتئاب، الضغط الدراسي" className="input-field" />
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-primary text-sm">
            {busy ? 'جاري الحفظ...' : 'حفظ التعديلات'}
          </button>
        </form>
      )}

      {tab === 'messages' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-2">
            {conversations.length === 0 ? (
              <div className="card p-8 text-center">
                <MessageSquare className="w-8 h-8 text-ink-300 mx-auto mb-2" />
                <p className="text-sm text-ink-500">لا توجد رسائل.</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => openConversation(conv.id)}
                  className={`card p-4 text-right w-full transition-colors ${
                    activeConv === conv.id ? 'border-gold bg-gold/5' : 'hover:bg-ink-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-ink-900">محادثة مع: {conv.student_username}</span>
                    {conv.unreadCount > 0 && (
                      <span className="chip bg-rose-50 text-rose-600 text-xs px-2 py-0.5">{conv.unreadCount}</span>
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-xs text-ink-500 truncate">{conv.lastMessage}</p>
                  )}
                  <p className="text-xs text-ink-400 mt-1">
                    {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString('ar') : ''}
                  </p>
                </button>
              ))
            )}
          </div>

          <div className="lg:col-span-2">
            {activeConv ? (
              <div className="card flex flex-col h-[500px]">
                <div className="p-4 border-b border-ink-100">
                  <h3 className="font-heading font-bold text-ink-900">
                    محادثة مع: {conversations.find((c) => c.id === activeConv)?.student_username || ''}
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender_role === 'counselor' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                        m.sender_role === 'counselor'
                          ? 'bg-ink-100 text-ink-800'
                          : 'bg-rose-50 text-ink-800'
                      }`}>
                        <p className="text-sm leading-relaxed">{m.content}</p>
                        <p className="text-xs text-ink-400 mt-1">
                          {new Date(m.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleReply} className="p-3 border-t border-ink-100 flex gap-2">
                  <input
                    type="text"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder="اكتب ردك..."
                    className="input-field flex-1 text-sm"
                  />
                  <button type="submit" disabled={busy || !reply.trim()} className="btn-primary text-sm">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="card p-12 text-center">
                <Eye className="w-8 h-8 text-ink-300 mx-auto mb-2" />
                <p className="text-sm text-ink-500">اختر محادثة لعرض الرسائل.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
