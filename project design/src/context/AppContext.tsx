import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchTeacherByUserId, insertTeacherForUser, fetchCounselorByUserId, insertCounselor } from '@/lib/dataAccess';
import { contributions as seedContributions, suggestions as seedSuggestions, type Contribution, type Suggestion } from '@/data/sampleData';

export type UserRole = 'student' | 'teacher' | 'moderator' | 'admin' | 'counselor' | null;

type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

type SignupParams = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  subjectId?: string;
  username?: string;
  specialization?: string;
};

type CreateModeratorParams = {
  email: string;
  password: string;
  name: string;
};

type AppState = {
  user: User | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (params: SignupParams) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  createModerator: (params: CreateModeratorParams) => Promise<{ error?: string }>;
  authLoading: boolean;
  followedTeachers: Set<string>;
  toggleFollow: (teacherId: string) => void;
  notificationEnabled: Set<string>;
  toggleNotification: (teacherId: string) => void;
  contributions: Contribution[];
  addContribution: (c: Contribution) => void;
  updateContributionStatus: (id: string, status: string, note?: string) => void;
  suggestions: Suggestion[];
  addSuggestion: (s: Suggestion) => void;
  updateSuggestionStatus: (id: string, status: string) => void;
  questionsOpen: Set<string>;
  toggleQuestions: (teacherId: string) => void;
};

const AppContext = createContext<AppState | null>(null);

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0].charAt(0) + parts[1].charAt(0));
  return name.charAt(0) || '؟';
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [followedTeachers, setFollowed] = useState<Set<string>>(new Set());
  const [notificationEnabled, setNotificationEnabled] = useState<Set<string>>(new Set());
  const [questionsOpen, setQuestionsOpen] = useState<Set<string>>(new Set());
  const [contributions, setContributions] = useState<Contribution[]>(seedContributions);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(seedSuggestions);

  const resolveUser = useCallback(async (userId: string, email: string): Promise<User> => {
    const normalizedEmail = email.toLowerCase();
    const [teacher, adminRow, moderatorRow, counselor] = await Promise.all([
      fetchTeacherByUserId(userId),
      supabase.from('admins').select('email').eq('email', normalizedEmail).maybeSingle(),
      supabase.from('moderators').select('email').eq('email', normalizedEmail).maybeSingle(),
      fetchCounselorByUserId(userId),
    ]);
    const isAdmin = !!adminRow.data;
    const isModerator = !!moderatorRow.data;
    const role: UserRole = isAdmin ? 'admin' : (isModerator ? 'moderator' : (teacher ? 'teacher' : (counselor ? 'counselor' : 'student')));
    const name = teacher?.name || counselor?.name || email.split('@')[0] || 'مستخدم';
    return { id: userId, name, email, role };
  }, []);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && mounted) {
        const resolved = await resolveUser(session.user.id, session.user.email || '');
        if (mounted) setUser(resolved);
      }
      if (mounted) setAuthLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'SIGNED_OUT' || !session) {
          if (mounted) setUser(null);
          return;
        }
        if (session) {
          const resolved = await resolveUser(session.user.id, session.user.email || '');
          if (mounted) setUser(resolved);
        }
      })();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [resolveUser]);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    if (data.user) {
      const resolved = await resolveUser(data.user.id, data.user.email || email);
      setUser(resolved);
    }
    return {};
  };

  const signup = async (params: SignupParams): Promise<{ error?: string }> => {
    const { email, password, name, role, subjectId } = params;

    if (role === 'admin' || role === 'moderator') {
      return { error: 'لا يمكن إنشاء حساب مشرف أو مراقب من صفحة التسجيل.' };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role: role || 'student' } },
    });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'لم يتم إنشاء الحساب.' };

    if (role === 'teacher' && subjectId) {
      const ok = await insertTeacherForUser({
        userId: data.user.id,
        name,
        subjectId,
        bio: '',
        avatarInitials: getInitials(name),
      });
      if (!ok) return { error: 'تم إنشاء الحساب ولكن فشل إنشاء ملف المعلم. يرجى التواصل مع المشرف.' };
    }

    if (role === 'counselor') {
      const username = params.username || email.split('@')[0];
      const ok = await insertCounselor({
        userId: data.user.id,
        name,
        username,
        specialization: params.specialization || '',
      });
      if (!ok) return { error: 'تم إنشاء الحساب ولكن فشل إنشاء ملف المستشار. يرجى التواصل مع المشرف.' };
    }

    const resolved = await resolveUser(data.user.id, email);
    setUser(resolved);
    return {};
  };

  const createModerator = async (params: CreateModeratorParams): Promise<{ error?: string }> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { error: 'يجب تسجيل الدخول كمشرف.' };

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '';
    const functionUrl = `${supabaseUrl}/functions/v1/create-moderator`;

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          email: params.email,
          password: params.password,
          name: params.name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        return { error: result.error || 'فشل إنشاء حساب المراقب.' };
      }

      return {};
    } catch {
      return { error: 'حدث خطأ أثناء إنشاء حساب المراقب.' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // Session may already be expired — safe to ignore
    }
    setUser(null);
  };

  const toggleFollow = (id: string) => {
    setFollowed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleNotification = (id: string) => {
    setNotificationEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addContribution = (c: typeof contributions[number]) => {
    setContributions((prev) => [c, ...prev]);
  };

  const updateContributionStatus = (id: string, status: string, note?: string) => {
    setContributions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: status as typeof c.status, reviewNote: note } : c))
    );
  };

  const addSuggestion = (s: typeof suggestions[number]) => {
    setSuggestions((prev) => [s, ...prev]);
  };

  const updateSuggestionStatus = (id: string, status: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: status as typeof s.status } : s))
    );
  };

  const toggleQuestions = (id: string) => {
    setQuestionsOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <AppContext.Provider value={{
      user, login, signup, logout, createModerator, authLoading,
      followedTeachers, toggleFollow,
      notificationEnabled, toggleNotification,
      contributions, addContribution, updateContributionStatus,
      suggestions, addSuggestion, updateSuggestionStatus,
      questionsOpen, toggleQuestions,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
