import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StudentLayout } from '@/components/StudentLayout';
import { DashboardPage } from '@/pages/DashboardPage';
import { MyLearningPage } from '@/pages/MyLearningPage';
import { SubjectsPage } from '@/pages/SubjectsPage';
import { SubjectDetailPage } from '@/pages/SubjectDetailPage';
import { LessonPage } from '@/pages/LessonPage';
import { SavedPage } from '@/pages/SavedPage';
import { DiscussionsPage } from '@/pages/DiscussionsPage';
import { ExplorePage } from '@/pages/ExplorePage';
import { HelpPage } from '@/pages/HelpPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="learning" element={<MyLearningPage />} />
          <Route path="subjects" element={<SubjectsPage />} />
          <Route path="subjects/:subject" element={<SubjectDetailPage />} />
          <Route path="lesson/:lesson" element={<LessonPage />} />
          <Route path="saved" element={<SavedPage />} />
          <Route path="discussions" element={<DiscussionsPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="help" element={<HelpPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/student" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
