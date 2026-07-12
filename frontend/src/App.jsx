import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

// Shared Protected Pages
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import ComplaintDetails from './pages/ComplaintDetails';
import Profile from './pages/Profile';
import Chat from './pages/Chat';

// Admin Protected Pages
import UserManagement from './pages/UserManagement';
import AgentManagement from './pages/AgentManagement';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected Client/Agent/Admin Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints"
              element={
                <ProtectedRoute allowedRoles={['USER', 'AGENT']}>
                  <Complaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints/:id"
              element={
                <ProtectedRoute allowedRoles={['USER', 'AGENT', 'ADMIN']}>
                  <ComplaintDetails />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/chat"
              element={
                <ProtectedRoute allowedRoles={['USER', 'AGENT']}>
                  <Chat />
                </ProtectedRoute>
              }
            />

            {/* Submitter User-Only Routes */}
            <Route
              path="/create-complaint"
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <CreateComplaintWrapper />
                </ProtectedRoute>
              }
            />

            {/* Admin-Only Routes */}
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <UserManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/agents"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AgentManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Complaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AnalyticsDashboard />
                </ProtectedRoute>
              }
            />

            {/* Catch-all Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

// Lazy load helper wrapper for Create Complaint to prevent potential import loops
const CreateComplaintWrapper = () => {
  const CreateComplaint = React.lazy(() => import('./pages/CreateComplaint'));
  return (
    <React.Suspense fallback={<div style={{ color: '#6366f1', textAlign: 'center', padding: '5rem' }}>Loading Form...</div>}>
      <CreateComplaint />
    </React.Suspense>
  );
};

export default App;
