import { useState, useEffect, useCallback } from 'react';
import { Send, ArrowRight, MessageSquare, Heart, Eye, HelpCircle, CheckCircle2, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { useData } from '@/context/DataContext';
import type { Message } from '@/data/sampleData';
import type { TeacherQuestion } from '@/lib/dataAccess';

type StudentConversation = {
  id: string;
  student_id: string;
  student_username: string;
  counselor_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  counselorName: string;
  counselorPhoto: string | null;
  unreadCount: number;
  lastMessage: string | null;
  lastMessageAt: string | null;
};

type PageTab = 'messages' | 'answers';

export default function StudentMessagesPage() {
  const { user } = useApp();
  const { getStudentConversations, getMessages, sendMsg, markRead, getStudentQuestions, markAnswerRead } = useData();
  const [pageTab, setPageTab] = useState<PageTab>('messages');

  // Conversations state
  const [conversations, setConversations] = useState<StudentConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConv, setActiveConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState(false);

  // Answers state
  const [answers, setAnswers] = useState<TeacherQuestion[]>([]);
  const [answersLoading, setAnswersLoading] = useState(true);
  const [openAnswer, setOpenAnswer] = useState<TeacherQuestion | null>(null);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    const convs = await getStudentConversations(user.id);
    setConversations(convs as StudentConversation[]);
    setLoading(false);
  }, [user, getStudentConversations]);

  const loadAnswers = useCallback(async () => {
    if (!user) return;
    const qs = await getStudentQuestions(user.id);
    const answered = qs.filter((q) => q.status === 'answered' && q.answer);
    setAnswers(answered);
    setAnswersLoading(false);
  }, [user, getStudentQuestions]);

  useEffect(() => {
    loadConversations();
    loadAnswers();
  }, [loadConversations, loadAnswers]);

  const openConversation = async (convId: string) => {
    setActiveConv(convId);
    const msgs = await getMessages(convId);
    setMessages(msgs);
    await markRead(convId, 'student');
    await loadConversations();
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeConv || !user || !reply.trim()) return;
    setBusy(true);
    const { error } = await sendMsg(activeConv, user.id, 'student', reply);
    if (!error) {
      setReply('');
      const msgs = await getMessages(activeConv);
      setMessages(msgs);
      await loadConversations();
    }
    setBusy(false);
  };

  const handleOpenAnswer = async (q: TeacherQuestion) => {
    setOpenAnswer(q);
    if (!q.readAt) {
      await markAnswerRead(q.id);
      await loadAnswers();
    }
  };

  if (loading && answersLoading) {
    return (
      <div className="container-page py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const answeredCount = answers.length;
  const unreadAnswersCount = answers.filter((a) => !a.readAt).length;

  return (
    <div className="container-page py-8 animate-page">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-rose-600 flex items-center justify-center text-white">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-900">رسائلي</h1>
          <p className="text-sm text-ink-500">محادثاتك مع المستشارين وإجابات المعلمين على أسئلتك</p>
        </div>
      </div>

      {/* Page tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto scrollbar-hide border-b border-ink-100">
        <button
          onClick={() => setPageTab('messages')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            pageTab === 'messages' ? 'border-gold text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-700'
          }`}
        >
          <Heart className="w-4 h-4" />
          رسائل المستشارين
        </button>
        <button
          onClick={() => setPageTab('answers')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
            pageTab === 'answers' ? 'border-gold text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-700'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          الإجابات
          {unreadAnswersCount > 0 && (
            <span className="chip bg-gold/15 text-gold-dark text-xs px-2 py-0.5">{unreadAnswersCount}</span>
          )}
        </button>
      </div>

      {/* Messages tab */}
      {pageTab === 'messages' && (
        <>
          {conversations.length === 0 ? (
            <div className="card p-12 text-center">
              <MessageSquare className="w-10 h-10 text-ink-300 mx-auto mb-3" />
              <p className="text-ink-500 mb-4">لا توجد محادثات بعد.</p>
              <Link to="/support" className="btn-primary text-sm">تصفح المستشارين</Link>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-4">
              <div className="lg:col-span-1 space-y-2">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => openConversation(conv.id)}
                    className={`card p-4 text-right w-full transition-colors ${
                      activeConv === conv.id ? 'border-gold bg-gold/5' : 'hover:bg-ink-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-ink-900">{conv.counselorName}</span>
                      {conv.unreadCount > 0 && (
                        <span className="chip bg-rose-50 text-rose-600 text-xs px-2 py-0.5">{conv.unreadCount}</span>
                      )}
                    </div>
                    {conv.lastMessage && <p className="text-xs text-ink-500 truncate">{conv.lastMessage}</p>}
                    <p className="text-xs text-ink-400 mt-1">
                      {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString('ar') : ''}
                    </p>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-2">
                {activeConv ? (
                  <div className="card flex flex-col h-[500px]">
                    <div className="p-4 border-b border-ink-100">
                      <h3 className="font-heading font-bold text-ink-900">
                        {conversations.find((c) => c.id === activeConv)?.counselorName || ''}
                      </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {messages.map((m) => (
                        <div key={m.id} className={`flex ${m.senderRole === 'student' ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                            m.senderRole === 'student' ? 'bg-ink-100 text-ink-800' : 'bg-rose-50 text-ink-800'
                          }`}>
                            <p className="text-sm leading-relaxed">{m.content}</p>
                            <p className="text-xs text-ink-400 mt-1">
                              {new Date(m.createdAt).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}
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
                        placeholder="اكتب رسالتك..."
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
        </>
      )}

      {/* Answers tab */}
      {pageTab === 'answers' && (
        <div className="max-w-3xl">
          {openAnswer ? (
            <div className="card p-6 space-y-4 animate-scale-in">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <span className="chip bg-sage-50 text-sage-dark text-xs mb-2">إجابة المعلم</span>
                  <h3 className="font-heading font-bold text-ink-900 text-lg">سؤال من {openAnswer.studentName}</h3>
                  <p className="text-xs text-ink-400 mt-1">
                    {openAnswer.answeredAt ? new Date(openAnswer.answeredAt).toLocaleDateString('ar-SA') : ''}
                  </p>
                </div>
                <button onClick={() => setOpenAnswer(null)} className="btn-ghost p-1 shrink-0">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
              <div className="border-r-2 border-ink-100 pr-3">
                <p className="text-xs text-ink-400 mb-1">السؤال</p>
                <p className="text-sm text-ink-700 leading-relaxed">{openAnswer.question}</p>
              </div>
              <div className="border-r-2 border-gold/40 pr-3">
                <p className="text-xs text-gold-dark mb-1">إجابة المعلم</p>
                <p className="text-sm text-ink-700 leading-relaxed">{openAnswer.answer}</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-ink-400 pt-2 border-t border-ink-50">
                <span>المعلم: <span className="font-medium text-ink-700">{openAnswer.teacherName}</span></span>
              </div>
            </div>
          ) : answersLoading ? (
            <div className="card p-8 text-center">
              <div className="inline-block w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-ink-500 mt-2">جاري تحميل الإجابات...</p>
            </div>
          ) : answeredCount > 0 ? (
            <div className="space-y-2">
              {answers.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleOpenAnswer(q)}
                  className={`card p-4 text-right w-full transition-colors hover:border-gold/40 ${
                    !q.readAt ? 'bg-gold/5 border-gold/30' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="chip bg-sage-50 text-sage-dark text-xs">إجابة المعلم</span>
                      {!q.readAt && (
                        <span className="chip bg-gold/15 text-gold-dark text-xs">جديد</span>
                      )}
                    </div>
                    <span className="text-xs text-ink-400">
                      {q.answeredAt ? new Date(q.answeredAt).toLocaleDateString('ar-SA') : ''}
                    </span>
                  </div>
                  <p className="font-medium text-ink-900 truncate mb-1">{q.question}</p>
                  <p className="text-sm text-ink-500 truncate">{q.answer}</p>
                  <p className="text-xs text-ink-400 mt-1">المعلم: {q.teacherName}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="card p-12 text-center">
              <HelpCircle className="w-10 h-10 text-ink-300 mx-auto mb-3" />
              <p className="text-ink-500 font-medium mb-1">لا توجد إجابات بعد</p>
              <p className="text-sm text-ink-400">ستظهر إجابات المعلمين هنا عندما يتم الرد على أسئلتك.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
