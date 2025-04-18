import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import LandingPage from './pages/LandingPage';
import RegisterPage from './components/RegisterPage';
import ForgotPassword from './components/ForgotPassword';
import HomePage from './pages/HomePage';
import BlogCard from './components/BlogCard';
import ComposePage from './components/ComposePage';
import ProfilePage from './pages/ProfilePage';
import PostPage from './pages/PostPage';
import EditPostPage from './pages/EditPostPage'; 
import EditProfilePage from './pages/EditProfilePage';


const ProtectedRoute = ({ children }) => {
  const { user, getToken } = useAuth();
  const token = getToken();
  const navigate = useNavigate();
  const { id } = useParams();

  console.log('ProtectedRoute - User:', user);
  console.log('ProtectedRoute - Token:', token);

  if (!user || !token) {
    console.log('ProtectedRoute - Redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (id && !/^[0-9a-fA-F]{24}$/.test(id)) {
    console.log('ProtectedRoute - Invalid ID, redirecting to /profile');
    return <Navigate to="/profile" replace />;
  }

  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/blog"
        element={
          <ProtectedRoute>
            <BlogCard />
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
      <Route path='/edit-profile/:id??' element={<ProtectedRoute>
        <EditProfilePage />
      </ProtectedRoute>}
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
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>

  );
};

export default App;