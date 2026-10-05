import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp, type UserRole } from '@/context/AppContext';
import { DataProvider } from '@/context/DataContext';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import SubjectsPage from '@/pages/SubjectsPage';
import SubjectDetailPage from '@/pages/SubjectDetailPage';
import TeachersPage from '@/pages/TeachersPage';
import TeacherProfilePage from '@/pages/TeacherProfilePage';
import ContributePage from '@/pages/ContributePage';
import SuggestionsPage from '@/pages/SuggestionsPage';
import SearchPage from '@/pages/SearchPage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import TeacherDashboardPage from '@/pages/TeacherDashboardPage';
import ModeratorDashboardPage from '@/pages/ModeratorDashboardPage';
import AssistantPage from '@/pages/AssistantPage';
import LoginPage from '@/pages/LoginPage';
import AboutPage from '@/pages/AboutPage';
import AccountPage from '@/pages/AccountPage';
import SupportPage from '@/pages/SupportPage';
import CounselorProfilePage from '@/pages/CounselorProfilePage';
import CounselorDashboardPage from '@/pages/CounselorDashboardPage';
import StudentMessagesPage from '@/pages/StudentMessagesPage';

function LoadingSpinner() {
  return (
    <div className="container-page py-20 text-center">
      <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function getHomeForRole(role: UserRole): string {
  switch (role) {
    case 'admin': return '/admin';
    case 'moderator': return '/moderator';
    case 'teacher': return '/teacher';
    case 'counselor': return '/counselor';
    default: return '/';
  }
}

function RoleGuard({ allowedRoles, children }: { allowedRoles: UserRole[], children: React.ReactNode }) {
  const { user, authLoading } = useApp();
  if (authLoading) return <LoadingSpinner />;
  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return <Navigate to={user ? getHomeForRole(user.role) : '/login'} replace />;
  }
  return <>{children}</>;
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['admin']}>{children}</RoleGuard>;
}

function TeacherGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['teacher']}>{children}</RoleGuard>;
}

function ModeratorGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['moderator']}>{children}</RoleGuard>;
}

function CounselorGuard({ children }: { children: React.ReactNode }) {
  return <RoleGuard allowedRoles={['counselor']}>{children}</RoleGuard>;
}

function AuthedRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useApp();
  if (authLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useApp();
  if (authLoading) return <LoadingSpinner />;
  if (user) return <Navigate to={getHomeForRole(user.role)} replace />;
  return <>{children}</>;
}

function App() {
  return (
    <AppProvider>
      <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/subjects/:id" element={<SubjectDetailPage />} />
            <Route path="/teachers" element={<TeachersPage />} />
            <Route path="/teachers/:id" element={<TeacherProfilePage />} />
            <Route path="/contribute" element={<ContributePage />} />
            <Route path="/suggestions" element={<SuggestionsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/admin" element={<AdminGuard><AdminDashboardPage /></AdminGuard>} />
            <Route path="/teacher" element={<TeacherGuard><TeacherDashboardPage /></TeacherGuard>} />
            <Route path="/moderator" element={<ModeratorGuard><ModeratorDashboardPage /></ModeratorGuard>} />
            <Route path="/assistant" element={<AssistantPage />} />
            <Route path="/support" element={<SupportPage />} />
            <Route path="/counselors/:id" element={<CounselorProfilePage />} />
            <Route path="/counselor" element={<CounselorGuard><CounselorDashboardPage /></CounselorGuard>} />
            <Route path="/my-messages" element={<AuthedRoute><StudentMessagesPage /></AuthedRoute>} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="*" element={<HomePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </DataProvider>
    </AppProvider>
  );
}

export default App;
