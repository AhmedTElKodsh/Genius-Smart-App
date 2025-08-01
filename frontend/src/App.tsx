import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AllRoleSelection from './pages/AllRoleSelection';
import ClerkSignIn from './pages/ClerkSignIn';
import ClerkSignUp from './pages/ClerkSignUp';
import ManagerSignin from './pages/ManagerSignin';
import ManagerResetPassword from './pages/ManagerResetPassword';
import ManagerDashboard from './pages/ManagerDashboard';
import ManagerTeachers from './pages/ManagerTeachers';
import ManagerRequests from './pages/ManagerRequests';
import ManagerSettings from './pages/ManagerSettings';
import TeacherSignin from './pages/TeacherSignin';
import TeacherResetPassword from './pages/TeacherResetPassword';
import TeacherHome from './pages/TeacherHome';
import TeacherHomeAdvanced from './pages/TeacherHomeAdvanced';
import TeacherTimerPage from './pages/TeacherTimerPage';
import TeacherHistory from './pages/TeacherHistory';
import TeacherNotifications from './pages/TeacherNotifications';
import TeacherProfile from './pages/TeacherProfile';
import TeacherDemo from './pages/TeacherDemo';

function App() {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <div className="app">
          <Routes>
            <Route path="/" element={<AllRoleSelection />} />
            <Route path="/role-selection" element={<AllRoleSelection />} />
            
            {/* Clerk Authentication Routes */}
            <Route path="/sign-in" element={<ClerkSignIn />} />
            <Route path="/sign-up" element={<ClerkSignUp />} />
            
            {/* Legacy Authentication Routes (for transition period) */}
            <Route path="/manager/signin" element={<ManagerSignin />} />
            <Route path="/manager/reset-password" element={<ManagerResetPassword />} />
            <Route path="/teacher/signin" element={<TeacherSignin />} />
            <Route path="/teacher/reset-password" element={<TeacherResetPassword />} />
            
            {/* Teacher Routes */}
            <Route path="/teacher/home" element={<TeacherHome />} />
            <Route path="/teacher/home-advanced" element={<TeacherHomeAdvanced />} />
            <Route path="/teacher/timer" element={<TeacherTimerPage />} />
            <Route path="/teacher/history" element={<TeacherHistory />} />
            <Route path="/teacher/notifications" element={<TeacherNotifications />} />
            <Route path="/teacher/profile" element={<TeacherProfile />} />
            <Route path="/teacher/demo" element={<TeacherDemo />} />
            
            {/* Manager Routes */}
            <Route path="/dashboard" element={<ManagerDashboard />} />
            <Route path="/teachers" element={<ManagerTeachers />} />
            <Route path="/requests" element={<ManagerRequests />} />
            <Route path="/settings" element={<ManagerSettings />} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </ThemeProvider>
    </LanguageProvider>
  );
}

export default App; 
