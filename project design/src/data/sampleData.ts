export type ResourceType = 'lesson' | 'summary' | 'presentation' | 'file' | 'video' | 'image' | 'pdf' | 'link';

export type CounselorStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type Counselor = {
  id: string;
  userId: string;
  name: string;
  username: string;
  photoUrl: string | null;
  specialization: string;
  bio: string;
  qualifications: string;
  experience: number;
  supportAreas: string;
  status: CounselorStatus;
  isVisible: boolean;
  createdAt: string;
};

export type Conversation = {
  id: string;
  studentId: string;
  studentUsername: string;
  counselorId: string;
  counselorName: string;
  createdAt: string;
  lastMessageAt: string | null;
  unreadCount: number;
  lastMessage: string | null;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'student' | 'counselor';
  content: string;
  createdAt: string;
  readAt: string | null;
};

export type Subject = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  resourceCount: number;
  color: 'ink' | 'gold' | 'sage';
};

export type Resource = {
  id: string;
  subjectId: string;
  subjectName: string;
  title: string;
  lesson: string;
  type: ResourceType;
  author: string;
  authorId: string;
  date: string;
  description: string;
  fileUrl: string | null;
  thumbnailUrl: string | null;
  source?: 'official' | 'teacher' | 'contribution';
};

export type Teacher = {
  id: string;
  name: string;
  subjectId: string;
  subjectName: string;
  bio: string;
  followers: number;
  avatarInitials: string;
  questionsOpen: boolean;
  specialization: string;
  subjects: string;
  yearsExperience: number;
  avatarUrl: string | null;
  isApproved: boolean;
  links: { label: string; type: 'telegram' | 'whatsapp' | 'external'; url: string }[];
};

export type Announcement = {
  id: string;
  teacherId: string;
  teacherName: string;
  title: string;
  body: string;
  date: string;
  time: string;
  link?: { label: string; url: string };
};

export type Contribution = {
  id: string;
  studentName: string;
  email: string;
  subjectId: string;
  subjectName: string;
  lesson: string;
  contentType: ResourceType;
  description: string;
  fileName: string;
  fileUrl: string | null;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'changes_requested';
  reviewNote?: string;
};

export type Suggestion = {
  id: string;
  name?: string;
  email?: string;
  type: string;
  message: string;
  date: string;
  status: 'new' | 'read' | 'resolved';
};

export const resourceTypeLabels: Record<ResourceType, string> = {
  lesson: 'درس',
  summary: 'ملخص',
  presentation: 'عرض',
  file: 'ملف',
  video: 'فيديو',
  image: 'صورة',
  pdf: 'ملف PDF',
  link: 'رابط',
};

export const subjects: Subject[] = [];

export const teachers: Teacher[] = [];

export const resources: Resource[] = [];

export const announcements: Announcement[] = [];

export const contributions: Contribution[] = [];

export const suggestions: Suggestion[] = [];

export const adminStats = {
  students: 0,
  teachers: 0,
  resources: 0,
  pendingReviews: 0,
  suggestions: 0,
  announcements: 0,
  subjects: 0,
  lessons: 0,
};
