import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import SignUpPage from '../Pages/Auth/SignUpPage';
import LoginPage from '../Pages/Auth/LoginPage';
import AdminDashboardPage from '../Pages/Admin/AdminDashboardPage';
import AdminUsersPage from '../Pages/Admin/AdminUsersPage';
import AdminSettingsPage from '../Pages/Admin/AdminSettingsPage';
import UserDashboardPage from '../Pages/User/UserDashboardPage';
import UserProfilePage from '../Pages/User/UserProfilePage';
import UserSettingsPage from '../Pages/User/UserSettingsPage';

const isAdmin = () => {
  return localStorage.getItem('userRole') === 'admin';
};
const AllRoutes = () => {
  return (
      <Routes>
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        {isAdmin() ? (
          <>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/user/dashboard" replace />} />
        )}
        {!isAdmin() ? (
          <>
            <Route path="/user/dashboard" element={<UserDashboardPage />} />
            <Route path="/user/profile" element={<UserProfilePage />} />
            <Route path="/user/settings" element={<UserSettingsPage />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        )}
        <Route path="/" element={<Navigate to={isAdmin() ? '/admin/dashboard' : '/user/dashboard'} replace />} />
      </Routes>
  );
};

export default AllRoutes;
