import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../assets/compose.css';

const EditProfilePage = () => {
  const { getToken, user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      if (!token || !user) {
        setError('User not authenticated');
        setFetchLoading(false);
        navigate('/login');
        return;
      }

      const userId = user._id;
      if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
        console.error('Invalid or missing user._id:', user);
        setError('Invalid user profile. Please log in again.');
        setFetchLoading(false);
        logout();
        navigate('/login');
        return;
      }

      try {
        const cleanToken = token.trim();
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/users/me`,
          {
            headers: { Authorization: `Bearer ${cleanToken}` },
          }
        );
        const userData = response.data;
        setName(userData.name || '');
        setEmail(userData.email || '');
        setBio(userData.bio || '');
      
      } catch (err) {
        console.error('Error fetching profile:', {
          status: err.response?.status,
          message: err.response?.data?.message,
          error: err.message,
        });
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to load profile');
        }
      } finally {
        setFetchLoading(false);
      }
    };

    fetchProfile();
  }, [getToken, logout, navigate, user]);

  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

    const token = getToken();
    if (!token) {
      setError('Please log in to update your profile');
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      const cleanToken = token.trim();
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('bio', bio);
      if (password) formData.append('password', password);
      

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/profile`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const updatedUser = {
        ...user,
        _id: user._id,
        name: response.data.name,
        email: response.data.email,
        bio: response.data.bio,
       
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => navigate('/profile'), 1000);
    } catch (err) {
      console.error('Error updating profile:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        error: err.message,
      });
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) return <div className="compose-loading">Loading...</div>;

  return (
    <div className="compose-container">
      <header className="compose-header">
        <h1>Edit Profile</h1>
        <button onClick={() => navigate('/profile')} className="edit-profile-cancel-btn">
          Cancel
        </button>
      </header>

      <main className="edit-profile-main">
        {error && (
          <div className="compose-error" role="alert" id="edit-error">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="compose-success" role="alert">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="compose-form">
         
            
          
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your name"
              aria-required="true"
              aria-describedby={error ? 'edit-error' : undefined}
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
              aria-required="true"
              aria-describedby={error ? 'edit-error' : undefined}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              rows="4"
              aria-describedby={error ? 'edit-error' : undefined}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">New Password (optional)</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength="8"
              aria-describedby={error ? 'edit-error' : undefined}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="publish-button"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditProfilePage;