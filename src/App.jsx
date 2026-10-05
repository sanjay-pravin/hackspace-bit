import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import Home from './pages/Home';
import ExploreEvents from './pages/ExploreEvents';
import EventDetails from './pages/EventDetails';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Student Pages
import StudentDashboard from './pages/StudentDashboard';
import MyRegistrations from './pages/MyRegistrations';
import MyTeams from './pages/MyTeams';

// Admin Pages
import AdminDashboard from './pages/AdminDashboard';
import ManageEvents from './pages/ManageEvents';
import ManageRegistrations from './pages/ManageRegistrations';
import Attendance from './pages/Attendance';

// Protected Route Guard
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public and Common Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/events" element={<ExploreEvents />} />
              <Route path="/events/:slug" element={<EventDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/pass/:id" element={<Navigate to="/student/registrations" replace />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Route>

            {/* Student Protected Portal */}
            <Route
              element={
                <ProtectedRoute>
                  <StudentLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/registrations" element={<MyRegistrations />} />
              <Route path="/student/teams" element={<MyTeams />} />
            </Route>

            {/* Admin Protected Portal */}
            <Route
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/events" element={<ManageEvents />} />
              <Route path="/admin/participants" element={<ManageRegistrations />} />
              <Route path="/admin/attendance" element={<Attendance />} />
            </Route>
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}