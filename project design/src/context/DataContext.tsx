import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import {
  fetchSubjects, fetchTeachers, fetchResources, fetchAnnouncements,
  fetchContributions, fetchSuggestions, fetchAdminStats,
  insertSubject, updateSubject, deleteSubject, toggleSubjectHidden,
  insertTeacher, updateTeacher, deleteTeacher, toggleTeacherHidden,
  insertResource, updateResource, deleteResource, toggleResourceHidden, toggleResourceAiEnabled,
  updateResourceByTeacher, deleteResourceByTeacher,
  fetchResourcesByTeacher, fetchAllResourcesByTeacherAdmin,
  updateContributionStatus, updateContribution, deleteContribution,
  updateSuggestionStatus, deleteSuggestion,
  insertContribution, insertSuggestion,
  fetchAllSubjectsAdmin, fetchAllTeachersAdmin, fetchAllResourcesAdmin,
  fetchAllContributionsAdmin, fetchAllSuggestionsAdmin,
  fetchSubscriptions, fetchSubscriptionCount, checkSubscription,
  subscribeToTeacher, unsubscribeFromTeacher, fetchTeacherByName, fetchTeacherByUserId,
  setTeacherApproved,
  fetchApprovedCounselors, fetchCounselorById, fetchCounselorByUserId,
  fetchAllCounselorsAdmin, insertCounselor, updateCounselor,
  updateCounselorStatus, toggleCounselorVisible, deleteCounselor,
  fetchConversationsForCounselor, fetchConversationsForStudent,
  fetchMessages, getOrCreateConversation, sendMessage, markMessagesRead,
  fetchCounselorUnreadCount, fetchStudentUnreadCount,
  uploadResourceFile, uploadResourceThumbnail,
  insertPrivateQuestion, answerQuestion, fetchTeacherQuestions, fetchStudentQuestions,
  insertPublicQA, updatePublicQA, deletePublicQA, fetchPublicQAs,
  fetchAllAnsweredQuestionsAdmin, markQuestionRead,
  type TeacherQuestion,
  type SubjectRow, type TeacherRow, type ResourceRow, type DeleteResult,
  type ContributionRow, type SuggestionRow, type SubscriptionRow,
  type CounselorRow, type ConversationRow, type MessageRow,
} from '@/lib/dataAccess';
import {
  type Subject, type Teacher, type Resource, type Announcement,
  type Contribution, type Suggestion, type ResourceType,
  type Counselor, type Conversation, type Message,
} from '@/data/sampleData';

type AdminStats = {
  subjects: number; teachers: number; resources: number;
  contributions: number; pendingContributions: number; suggestions: number;
  announcements: number; counselors: number; pendingCounselors: number;
};

type DataContextType = {
  // Public data
  subjects: Subject[];
  teachers: Teacher[];
  resources: Resource[];
  announcements: Announcement[];
  contributions: Contribution[];
  suggestions: Suggestion[];
  loading: boolean;
  // Admin data (includes hidden items)
  adminSubjects: SubjectRow[];
  adminTeachers: (TeacherRow & { subjectName: string })[];
  adminResources: (ResourceRow & { subjectName: string })[];
  adminContributions: ContributionRow[];
  adminSuggestions: SuggestionRow[];
  adminStats: AdminStats | null;
  // Refresh
  refreshAll: () => Promise<void>;
  refreshAdmin: () => Promise<void>;
  // Subjects CRUD
  createSubject: (s: { id: string; name: string; nameEn: string; description: string; icon: string; color: string }) => Promise<boolean>;
  editSubject: (id: string, updates: { name?: string; name_en?: string; description?: string; icon?: string; color?: string }) => Promise<boolean>;
  removeSubject: (id: string) => Promise<boolean>;
  hideSubject: (id: string, hidden: boolean) => Promise<boolean>;
  // Teachers CRUD
  createTeacher: (t: { name: string; subjectId: string; bio: string; avatarInitials: string }) => Promise<boolean>;
  editTeacher: (id: string, updates: { name?: string; subject_id?: string; bio?: string; avatar_initials?: string; questions_open?: boolean; specialization?: string; subjects?: string; years_experience?: number; avatar_url?: string | null }) => Promise<boolean>;
  removeTeacher: (id: string) => Promise<boolean>;
  hideTeacher: (id: string, hidden: boolean) => Promise<boolean>;
  // Resources CRUD
  createResource: (r: { subjectId: string; title: string; lesson: string; type: string; author: string; description: string; fileUrl?: string | null; thumbnailUrl?: string | null; teacherId?: string | null; source?: string }) => Promise<boolean>;
  editResource: (id: string, updates: { title?: string; lesson?: string; type?: string; description?: string; subject_id?: string; author?: string; file_url?: string | null; thumbnail_url?: string | null }) => Promise<boolean>;
  removeResource: (id: string) => Promise<{ ok: boolean; errorKind?: 'foreign_key' | 'permission' | 'other' }>;
  hideResource: (id: string, hidden: boolean) => Promise<boolean>;
  toggleAiSource: (id: string, enabled: boolean) => Promise<boolean>;
  // Teacher content (scoped to teacher)
  createTeacherContent: (r: { teacherId: string; subjectId: string; title: string; lesson: string; type: string; author: string; description: string; fileUrl?: string | null; thumbnailUrl?: string | null }) => Promise<boolean>;
  editTeacherContent: (id: string, teacherId: string, updates: { title?: string; lesson?: string; type?: string; description?: string; subject_id?: string; file_url?: string | null; thumbnail_url?: string | null }) => Promise<boolean>;
  deleteTeacherContent: (id: string, teacherId: string) => Promise<boolean>;
  getTeacherContent: (teacherId: string) => Promise<Resource[]>;
  getAllTeacherContentAdmin: (teacherId: string) => Promise<(ResourceRow & { subjectName: string })[]>;
  uploadFile: (file: File) => Promise<{ url: string | null; error?: string }>;
  uploadThumbnail: (file: File) => Promise<{ url: string | null; error?: string }>;
  // Contributions
  setContributionStatus: (id: string, status: string, reviewNote?: string) => Promise<boolean>;
  editContribution: (id: string, updates: { lesson?: string; description?: string; content_type?: string; subject_id?: string }) => Promise<boolean>;
  removeContribution: (id: string) => Promise<boolean>;
  addContribution: (c: { studentName: string; email: string; subjectId: string; lesson: string; contentType: ResourceType; description: string; fileName: string; fileUrl?: string | null }) => Promise<boolean>;
  // Suggestions
  setSuggestionStatus: (id: string, status: string) => Promise<boolean>;
  removeSuggestion: (id: string) => Promise<boolean>;
  addSuggestion: (s: { name?: string; email?: string; type: string; message: string }) => Promise<boolean>;
  // Teacher approval
  approveTeacher: (id: string, approved: boolean) => Promise<boolean>;
  // Subscriptions
  subscribe: (teacherId: string, studentName: string, studentEmail: string) => Promise<{ ok: boolean; error?: string }>;
  unsubscribe: (teacherId: string, studentEmail: string) => Promise<boolean>;
  checkSubscribed: (teacherId: string, studentEmail: string) => Promise<boolean>;
  getSubscriberCount: (teacherId: string) => Promise<number>;
  getSubscribers: (teacherId: string) => Promise<SubscriptionRow[]>;
  getTeacherByName: (name: string) => Promise<TeacherRow | null>;
  getTeacherByUserId: (userId: string) => Promise<TeacherRow | null>;
  // Counselors
  counselors: Counselor[];
  adminCounselors: CounselorRow[];
  fetchCounselor: (id: string) => Promise<Counselor | null>;
  getCounselorByUserId: (userId: string) => Promise<Counselor | null>;
  createCounselor: (c: { userId: string; name: string; username: string; specialization?: string; bio?: string; qualifications?: string; experience?: number; supportAreas?: string; photoUrl?: string | null }) => Promise<boolean>;
  editCounselor: (id: string, updates: Partial<{ name: string; username: string; specialization: string; bio: string; qualifications: string; experience: number; support_areas: string; photo_url: string | null }>) => Promise<boolean>;

  setCounselorStatus: (id: string, status: string) => Promise<boolean>;
  hideCounselor: (id: string, visible: boolean) => Promise<boolean>;
  removeCounselor: (id: string) => Promise<boolean>;
  // Messaging
  getCounselorConversations: (counselorId: string) => Promise<(ConversationRow & { unreadCount: number; lastMessage: string | null; lastMessageAt: string | null })[]>;
  getStudentConversations: (studentId: string) => Promise<(ConversationRow & { counselorName: string; counselorPhoto: string | null; unreadCount: number; lastMessage: string | null; lastMessageAt: string | null })[]>;
  getMessages: (conversationId: string) => Promise<Message[]>;
  startOrJoinConversation: (studentId: string, studentUsername: string, counselorId: string) => Promise<{ conversationId: string | null; error?: string }>;
  sendMsg: (conversationId: string, senderId: string, senderRole: 'student' | 'counselor', content: string) => Promise<{ ok: boolean; error?: string }>;
  markRead: (conversationId: string, readerRole: 'student' | 'counselor') => Promise<void>;
  getCounselorUnread: (counselorId: string) => Promise<number>;
  getStudentUnread: (studentId: string) => Promise<number>;
  // Questions
  sendQuestion: (params: { teacherId: string; studentId: string; studentName: string; question: string }) => Promise<boolean>;
  replyToQuestion: (id: string, answer: string) => Promise<boolean>;
  getTeacherQuestions: (teacherId: string) => Promise<TeacherQuestion[]>;
  getStudentQuestions: (studentId: string) => Promise<TeacherQuestion[]>;
  createPublicQA: (params: { teacherId: string; title: string; question: string; answer: string }) => Promise<boolean>;
  editPublicQA: (id: string, updates: { title?: string; question?: string; answer?: string }) => Promise<boolean>;
  removePublicQA: (id: string) => Promise<boolean>;
  getPublicQAs: (teacherId: string) => Promise<TeacherQuestion[]>;
  // Answers
  getAnsweredQuestionsAdmin: () => Promise<TeacherQuestion[]>;
  markAnswerRead: (id: string) => Promise<boolean>;
};

const DataContext = createContext<DataContextType | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);

  const [adminSubjects, setAdminSubjects] = useState<SubjectRow[]>([]);
  const [adminTeachers, setAdminTeachers] = useState<(TeacherRow & { subjectName: string })[]>([]);
  const [adminResources, setAdminResources] = useState<(ResourceRow & { subjectName: string })[]>([]);
  const [adminContributions, setAdminContributions] = useState<ContributionRow[]>([]);
  const [adminSuggestions, setAdminSuggestions] = useState<SuggestionRow[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [counselors, setCounselors] = useState<Counselor[]>([]);
  const [adminCounselors, setAdminCounselors] = useState<CounselorRow[]>([]);

  const loadPublicData = useCallback(async () => {
    const [s, t, r, a, c, sug, coun] = await Promise.all([
      fetchSubjects(), fetchTeachers(), fetchResources(),
      fetchAnnouncements(), fetchContributions(), fetchSuggestions(),
      fetchApprovedCounselors(),
    ]);
    setSubjects(s);
    setTeachers(t);
    setResources(r);
    setAnnouncements(a);
    setContributions(c);
    setSuggestions(sug);
    setCounselors(coun);
    setLoading(false);
  }, []);

  const loadAdminData = useCallback(async () => {
    const [as, at, ar, ac, asug, stats, acoun] = await Promise.all([
      fetchAllSubjectsAdmin(), fetchAllTeachersAdmin(), fetchAllResourcesAdmin(),
      fetchAllContributionsAdmin(), fetchAllSuggestionsAdmin(), fetchAdminStats(),
      fetchAllCounselorsAdmin(),
    ]);
    setAdminSubjects(as);
    setAdminTeachers(at);
    setAdminResources(ar);
    setAdminContributions(ac);
    setAdminSuggestions(asug);
    setAdminStats(stats);
    setAdminCounselors(acoun);
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([loadPublicData(), loadAdminData()]);
  }, [loadPublicData, loadAdminData]);

  const refreshAdmin = useCallback(async () => {
    await loadAdminData();
  }, [loadAdminData]);

  useEffect(() => {
    loadPublicData();
    loadAdminData();
  }, [loadPublicData, loadAdminData]);

  // ---- Subjects CRUD ----
  const createSubject = async (s: { id: string; name: string; nameEn: string; description: string; icon: string; color: string }) => {
    const ok = await insertSubject(s);
    if (ok) await refreshAll();
    return ok;
  };
  const editSubject = async (id: string, updates: { name?: string; name_en?: string; description?: string; icon?: string; color?: string }) => {
    const ok = await updateSubject(id, updates);
    if (ok) await refreshAll();
    return ok;
  };
  const removeSubject = async (id: string) => {
    const ok = await deleteSubject(id);
    if (ok) await refreshAll();
    return ok;
  };
  const hideSubject = async (id: string, hidden: boolean) => {
    const ok = await toggleSubjectHidden(id, hidden);
    if (ok) await refreshAll();
    return ok;
  };

  // ---- Teachers CRUD ----
  const createTeacher = async (t: { name: string; subjectId: string; bio: string; avatarInitials: string }) => {
    const ok = await insertTeacher(t);
    if (ok) await refreshAll();
    return ok;
  };
  const editTeacher = async (id: string, updates: { name?: string; subject_id?: string; bio?: string; avatar_initials?: string; questions_open?: boolean; specialization?: string; subjects?: string; years_experience?: number; avatar_url?: string | null }) => {
    const ok = await updateTeacher(id, updates);
    if (ok) await refreshAll();
    return ok;
  };
  const removeTeacher = async (id: string) => {
    const ok = await deleteTeacher(id);
    if (ok) await refreshAll();
    return ok;
  };
  const hideTeacher = async (id: string, hidden: boolean) => {
    const ok = await toggleTeacherHidden(id, hidden);
    if (ok) await refreshAll();
    return ok;
  };

  // ---- Resources CRUD ----
  const createResource = async (r: { subjectId: string; title: string; lesson: string; type: string; author: string; description: string; fileUrl?: string | null; thumbnailUrl?: string | null; teacherId?: string | null; source?: string }) => {
    const ok = await insertResource(r);
    if (ok) await refreshAll();
    return ok;
  };
  const createTeacherContent = async (r: { teacherId: string; subjectId: string; title: string; lesson: string; type: string; author: string; description: string; fileUrl?: string | null; thumbnailUrl?: string | null }) => {
    const ok = await insertResource({ ...r, source: 'teacher' });
    if (ok) await refreshAll();
    return ok;
  };
  const editTeacherContent = async (id: string, teacherId: string, updates: { title?: string; lesson?: string; type?: string; description?: string; subject_id?: string; file_url?: string | null; thumbnail_url?: string | null }) => {
    const ok = await updateResourceByTeacher(id, teacherId, updates);
    if (ok) await refreshAll();
    return ok;
  };
  const deleteTeacherContent = async (id: string, teacherId: string) => {
    const ok = await deleteResourceByTeacher(id, teacherId);
    if (ok) await refreshAll();
    return ok;
  };
  const getTeacherContent = async (teacherId: string) => {
    return await fetchResourcesByTeacher(teacherId);
  };
  const getAllTeacherContentAdmin = async (teacherId: string) => {
    return await fetchAllResourcesByTeacherAdmin(teacherId);
  };
  const editResource = async (id: string, updates: { title?: string; lesson?: string; type?: string; description?: string; subject_id?: string; author?: string; file_url?: string | null; thumbnail_url?: string | null }) => {
    const ok = await updateResource(id, updates);
    if (ok) await refreshAll();
    return ok;
  };
  const removeResource = async (id: string) => {
    const result = await deleteResource(id);
    if (result.ok) await refreshAll();
    return result;
  };
  const hideResource = async (id: string, hidden: boolean) => {
    const ok = await toggleResourceHidden(id, hidden);
    if (ok) await refreshAll();
    return ok;
  };
  const toggleAiSource = async (id: string, enabled: boolean) => {
    const ok = await toggleResourceAiEnabled(id, enabled);
    if (ok) await refreshAdmin();
    return ok;
  };

  // ---- Contributions ----
  const setContributionStatus = async (id: string, status: string, reviewNote?: string) => {
    const ok = await updateContributionStatus(id, status, reviewNote);
    if (ok) await refreshAll();
    return ok;
  };
  const editContribution = async (id: string, updates: { lesson?: string; description?: string; content_type?: string; subject_id?: string }) => {
    const ok = await updateContribution(id, updates);
    if (ok) await refreshAll();
    return ok;
  };
  const removeContribution = async (id: string) => {
    const ok = await deleteContribution(id);
    if (ok) await refreshAll();
    return ok;
  };
  const addContribution = async (c: { studentName: string; email: string; subjectId: string; lesson: string; contentType: ResourceType; description: string; fileName: string; fileUrl?: string | null }) => {
    const ok = await insertContribution(c);
    if (ok) await refreshAll();
    return ok;
  };

  // ---- Suggestions ----
  const setSuggestionStatus = async (id: string, status: string) => {
    const ok = await updateSuggestionStatus(id, status);
    if (ok) await refreshAll();
    return ok;
  };
  const removeSuggestion = async (id: string) => {
    const ok = await deleteSuggestion(id);
    if (ok) await refreshAll();
    return ok;
  };
  const addSuggestion = async (s: { name?: string; email?: string; type: string; message: string }) => {
    const ok = await insertSuggestion(s);
    if (ok) await refreshAll();
    return ok;
  };

  // ---- Teacher approval ----
  const approveTeacher = async (id: string, approved: boolean) => {
    const ok = await setTeacherApproved(id, approved);
    if (ok) await refreshAll();
    return ok;
  };

  // ---- Subscriptions ----
  const subscribe = async (teacherId: string, studentName: string, studentEmail: string) => {
    const result = await subscribeToTeacher(teacherId, studentName, studentEmail);
    if (result.ok) await loadPublicData();
    return result;
  };
  const unsubscribe = async (teacherId: string, studentEmail: string) => {
    const ok = await unsubscribeFromTeacher(teacherId, studentEmail);
    if (ok) await loadPublicData();
    return ok;
  };
  const checkSubscribed = async (teacherId: string, studentEmail: string) => {
    return await checkSubscription(teacherId, studentEmail);
  };
  const getSubscriberCount = async (teacherId: string) => {
    return await fetchSubscriptionCount(teacherId);
  };
  const getSubscribers = async (teacherId: string) => {
    return await fetchSubscriptions(teacherId);
  };
  const getTeacherByName = async (name: string) => {
    return await fetchTeacherByName(name);
  };

  const getTeacherByUserId = async (userId: string) => {
    return await fetchTeacherByUserId(userId);
  };

  // ---- Counselors ----
  const fetchCounselor = async (id: string) => fetchCounselorById(id);
  const getCounselorByUserId = async (userId: string) => fetchCounselorByUserId(userId);
  const createCounselor = async (c: { userId: string; name: string; username: string; specialization?: string; bio?: string; qualifications?: string; experience?: number; supportAreas?: string; photoUrl?: string | null }) => {
    const ok = await insertCounselor(c);
    if (ok) await refreshAll();
    return ok;
  };
  const editCounselor = async (id: string, updates: Partial<{ name: string; username: string; specialization: string; bio: string; qualifications: string; experience: number; support_areas: string; photo_url: string | null }>) => {
    const ok = await updateCounselor(id, updates);
    if (ok) await refreshAll();
    return ok;
  };
  const setCounselorStatus = async (id: string, status: string) => {
    const ok = await updateCounselorStatus(id, status);
    if (ok) await refreshAll();
    return ok;
  };
  const hideCounselor = async (id: string, visible: boolean) => {
    const ok = await toggleCounselorVisible(id, visible);
    if (ok) await refreshAll();
    return ok;
  };
  const removeCounselor = async (id: string) => {
    const ok = await deleteCounselor(id);
    if (ok) await refreshAll();
    return ok;
  };

  // ---- Messaging ----
  const getCounselorConversations = async (counselorId: string) => fetchConversationsForCounselor(counselorId);
  const getStudentConversations = async (studentId: string) => fetchConversationsForStudent(studentId);
  const getMessages = async (conversationId: string) => fetchMessages(conversationId);
  const startOrJoinConversation = async (studentId: string, studentUsername: string, counselorId: string) => getOrCreateConversation(studentId, studentUsername, counselorId);
  const sendMsg = async (conversationId: string, senderId: string, senderRole: 'student' | 'counselor', content: string) => sendMessage(conversationId, senderId, senderRole, content);
  const markRead = async (conversationId: string, readerRole: 'student' | 'counselor') => markMessagesRead(conversationId, readerRole);
  const getCounselorUnread = async (counselorId: string) => fetchCounselorUnreadCount(counselorId);
  const getStudentUnread = async (studentId: string) => fetchStudentUnreadCount(studentId);

  // ---- File uploads ----
  const uploadFile = async (file: File) => uploadResourceFile(file);
  const uploadThumbnail = async (file: File) => uploadResourceThumbnail(file);

  // ---- Questions ----
  const sendQuestion = async (params: { teacherId: string; studentId: string; studentName: string; question: string }) => {
    return await insertPrivateQuestion(params);
  };
  const replyToQuestion = async (id: string, answer: string) => {
    return await answerQuestion(id, answer);
  };
  const getTeacherQuestions = async (teacherId: string) => {
    return await fetchTeacherQuestions(teacherId);
  };
  const getStudentQuestions = async (studentId: string) => {
    return await fetchStudentQuestions(studentId);
  };
  const createPublicQA = async (params: { teacherId: string; title: string; question: string; answer: string }) => {
    return await insertPublicQA(params);
  };
  const editPublicQA = async (id: string, updates: { title?: string; question?: string; answer?: string }) => {
    return await updatePublicQA(id, updates);
  };
  const removePublicQA = async (id: string) => {
    return await deletePublicQA(id);
  };
  const getPublicQAs = async (teacherId: string) => {
    return await fetchPublicQAs(teacherId);
  };
  const getAnsweredQuestionsAdmin = async () => {
    return await fetchAllAnsweredQuestionsAdmin();
  };
  const markAnswerRead = async (id: string) => {
    return await markQuestionRead(id);
  };

  return (
    <DataContext.Provider value={{
      subjects, teachers, resources, announcements, contributions, suggestions, loading,
      adminSubjects, adminTeachers, adminResources, adminContributions, adminSuggestions, adminStats,
      counselors, adminCounselors,
      refreshAll, refreshAdmin,
      createSubject, editSubject, removeSubject, hideSubject,
      createTeacher, editTeacher, removeTeacher, hideTeacher,
      createResource, editResource, removeResource, hideResource, toggleAiSource,
      createTeacherContent, editTeacherContent, deleteTeacherContent, getTeacherContent, getAllTeacherContentAdmin,
      uploadFile, uploadThumbnail,
      setContributionStatus, editContribution, removeContribution, addContribution,
      setSuggestionStatus, removeSuggestion, addSuggestion,
      approveTeacher,
      subscribe, unsubscribe, checkSubscribed, getSubscriberCount, getSubscribers, getTeacherByName, getTeacherByUserId,
      fetchCounselor, getCounselorByUserId, createCounselor, editCounselor, setCounselorStatus, hideCounselor, removeCounselor,
      getCounselorConversations, getStudentConversations, getMessages, startOrJoinConversation, sendMsg, markRead, getCounselorUnread, getStudentUnread,
      sendQuestion, replyToQuestion, getTeacherQuestions, getStudentQuestions,
      createPublicQA, editPublicQA, removePublicQA, getPublicQAs,
      getAnsweredQuestionsAdmin, markAnswerRead,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
