import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import RoleSelection from '@/pages/RoleSelection';
import ManagerSignin from '@/pages/ManagerSignin';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/manager/signin" element={<ManagerSignin />} />
        <Route path="/manager/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/teachers" element={<div>Teachers Page Coming Soon</div>} />
        <Route path="/requests" element={<div>Requests Page Coming Soon</div>} />
        <Route path="/settings" element={<div>Settings Page Coming Soon</div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App; 