import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import LandingPage from './pages/LandingPage';
import RegisterPage from './components/RegisterPage';
import ForgotPassword from './components/ForgotPassword';
import HomePage from './pages/HomePage';
import BlogCard from './components/BlogCard'; // Assuming this is used within other pages
import ComposePage from './components/ComposePage';
import ProfilePage from './pages/ProfilePage';
import PostPage from './pages/PostPage';
import EditPostPage from './pages/EditPostPage';
import EditProfilePage from './pages/EditProfilePage';

// Simplified ProtectedRoute component
const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = useAuth();

  if (authLoading) {
    return <div className="loading">Loading authentication...</div>; 
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Main App component with organized routes
const App = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/compose"
        element={
          <ProtectedRoute>
            <ComposePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <EditProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:id?"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/post/slug/:slug"
        element={
          <ProtectedRoute>
            <PostPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit/:id"
        element={
          <ProtectedRoute>
            <EditPostPage />
          </ProtectedRoute>
        }
      />

    </Routes>
  );
};

export default App;