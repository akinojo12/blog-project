import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import '../assets/login.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      setError('');
      setLoading(true);

      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        name,
        email,
        password,
      });

      const { token, user } = response.data;
      if (!token || !user || !user._id) {
        throw new Error('Invalid response from server: Missing token or user data');
      }

      if (!isValidObjectId(user._id)) {
        console.error('RegisterPage: Invalid user ID received:', user._id);
        throw new Error('Invalid user ID from server');
      }

      const decodedToken = jwtDecode(token);
      console.log('RegisterPage: Decoded token:', decodedToken);
      if (!decodedToken.id || !isValidObjectId(decodedToken.id)) {
        console.error('RegisterPage: Invalid user ID in token:', decodedToken.id);
        throw new Error('Invalid user ID in token');
      }

      console.log('RegisterPage: Register response:', { token, user });

      // Structure userData to match AuthContext expectations
      const userData = {
        _id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        profilePicture: user.profilePicture || null,
        followers: user.followers || [],
        following: user.following || [],
        isAdmin: user.isAdmin || false,
      };

      await register(userData, token);
      // Auto-login by navigating to a protected route
      navigate('/login');
    } catch (err) {
      console.error('RegisterPage: Register error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create your account</h2>
          <p>Start your writing journey today</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
              autoComplete="name"
              aria-required="true"
            />
          </div>

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
              minLength="8"
              autoComplete="new-password"
              aria-required="true"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              minLength="8"
              autoComplete="new-password"
              aria-required="true"
            />
          </div>

          <div className="form-group terms">
            <input type="checkbox" id="terms" required aria-required="true" />
            <label htmlFor="terms">
              I agree to the <Link to="/terms">Terms of Service</Link> and{' '}
              <Link to="/privacy">Privacy Policy</Link>
            </label>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
            aria-busy={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;