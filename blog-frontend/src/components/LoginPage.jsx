import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../assets/login.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email,
        password,
      });

      console.log('Raw login response:', response.data);

      let token, userData;
      if (response.data.token && response.data.user) {
        
        ({ token } = response.data);
        userData = response.data.user;
      } else if (response.data.token && response.data._id) {
        
        ({ token } = response.data);
        userData = {
          _id: response.data._id,
          name: response.data.name || 'Unknown',
          email: response.data.email,
          isAdmin: response.data.isAdmin || false,
          bio: response.data.bio || '',
          profilePicture: response.data.profilePicture || null,
          followers: response.data.followers || [],
          following: response.data.following || [],
        };
      } else {
        throw new Error('Invalid response from server: Missing token or user data');
      }

      if (!token || !userData._id) {
        throw new Error('Invalid response from server: Missing token or user ID');
      }

      if (!isValidObjectId(userData._id)) {
        console.error('Invalid user ID received:', userData._id);
        throw new Error('Invalid user ID from server');
      }

      console.log('Processed login data:', { token, userData });

      await login(userData, token);
      navigate('/home');
    } catch (err) {
      console.error('Login error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      const errorMessage =
        err.message.includes('Invalid response from server') ||
        err.message === 'Invalid user ID from server'
          ? 'Server returned invalid data. Please try again or contact support.'
          : err.response?.data?.message || 'Failed to log in. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Welcome back</h2>
          <p>Sign in to your account</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              autoComplete="email"
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              autoComplete="current-password"
              aria-required="true"
            />
          </div>

          <div className="form-options">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <Link to="/forgot-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;