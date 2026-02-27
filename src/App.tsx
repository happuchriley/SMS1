import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { FeedbackProvider } from './contexts/FeedbackContext'
import Login from './pages/Login'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'
import ManageStudentsPage from './pages/ManageStudentsPage'
import AddNewStudentPage from './pages/AddNewStudentPage'
import StudentsListAllPage from './pages/StudentsListAllPage'
import StudentsListActivePage from './pages/StudentsListActivePage'
import StudentsListFreshPage from './pages/StudentsListFreshPage'
import StudentsListInactivePage from './pages/StudentsListInactivePage'
import StudentProfilePage from './pages/StudentProfilePage'
import AcademicRecordsPage from './pages/AcademicRecordsPage'
import AccountSettingsPage from './pages/AccountSettingsPage'
import EditStudentPage from './pages/EditStudentPage'
import ClassListPage from './pages/ClassListPage'
import GetClassListPage from './pages/GetClassListPage'
import ParentsListPage from './pages/ParentsListPage'
import ManageStaffPage from './pages/ManageStaffPage'
import StaffPlaceholderPage from './pages/StaffPlaceholderPage'
import AttendanceRegisterPage from './pages/AttendanceRegisterPage'
import TeachingLearningMaterialsPage from './pages/TeachingLearningMaterialsPage'
import TLMUploadPage from './pages/TLMUploadPage'
import MediaLibraryPage from './pages/MediaLibraryPage'
import StudentPromotionPage from './pages/StudentPromotionPage'
import TestsAndQuizzesPage from './pages/TestsAndQuizzesPage'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'

export default function App() {
  return (
    <FeedbackProvider>
      <BrowserRouter>
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<ManageStudentsPage />} />
          <Route path="students/add" element={<AddNewStudentPage />} />
          <Route path="students/list" element={<StudentsListAllPage />} />
          <Route path="students/list/active" element={<StudentsListActivePage />} />
          <Route path="students/list/fresh" element={<StudentsListFreshPage />} />
          <Route path="students/list/inactive" element={<StudentsListInactivePage />} />
          <Route path="students/profile/:studentId" element={<StudentProfilePage />} />
          <Route path="students/profile/:studentId/records" element={<AcademicRecordsPage />} />
          <Route path="students/profile/:studentId/settings" element={<AccountSettingsPage />} />
          <Route path="students/profile/:studentId/edit" element={<EditStudentPage />} />
          <Route path="students/class-list" element={<GetClassListPage />} />
          <Route path="students/parents" element={<ParentsListPage />} />
          <Route path="staff" element={<ManageStaffPage />} />
          <Route path="staff/add" element={<StaffPlaceholderPage />} />
          <Route path="staff/list" element={<StaffPlaceholderPage />} />
          <Route path="staff/list/active" element={<StaffPlaceholderPage />} />
          <Route path="staff/list/new" element={<StaffPlaceholderPage />} />
          <Route path="staff/list/inactive" element={<StaffPlaceholderPage />} />
          <Route path="staff/restriction" element={<StaffPlaceholderPage />} />
          <Route path="class-list" element={<ClassListPage />} />
          <Route path="attendance" element={<AttendanceRegisterPage />} />
          <Route path="tlm" element={<TeachingLearningMaterialsPage />} />
          <Route path="tlm/upload" element={<TLMUploadPage />} />
          <Route path="media-library" element={<MediaLibraryPage />} />
          <Route path="promotion" element={<StudentPromotionPage />} />
          <Route path="tests-quizzes" element={<TestsAndQuizzesPage />} />
        </Route>
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </BrowserRouter>
    </FeedbackProvider>
  )
}
