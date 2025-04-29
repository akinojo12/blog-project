import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../assets/profile.css';

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const EditProfilePage = () => {
  const { getToken, user, logout, updateUser: updateAuthUser, authLoading, authError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    password: '',
    confirmPassword: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      console.log('EditProfilePage: Token on fetch:', token ? token.substring(0, 10) + '...' : 'No token');
      console.log('EditProfilePage: User on fetch:', user);

      if (!token || !user || !user._id) {
        console.error('EditProfilePage: User or token missing');
        setError('Please log in to edit your profile');
        setFetchLoading(false);
        navigate('/login');
        return;
      }

      if (!isValidObjectId(user._id)) {
        console.error('EditProfilePage: Invalid user._id:', user._id);
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
        console.log('EditProfilePage: Fetched user data:', userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          bio: userData.bio || '',
          password: '',
          confirmPassword: '',
        });
        setPreviewImage(userData.profilePicture?.url || '');
      } catch (err) {
        console.error('EditProfilePage: Error fetching profile:', {
          status: err.response?.status,
          message: err.response?.data?.message,
          data: err.response?.data,
          error: err.message,
        });
        if (err.response?.status === 401) {
          setError('Session expired. Please log in again.');
          logout();
          navigate('/login');
        } else if (err.response?.status === 400 && err.response?.data?.message === 'Invalid user ID') {
          setError('Your account may have been deleted or is invalid. Please log in again or contact support.');
        } else {
          setError(err.response?.data?.message || 'Failed to load profile data. Please try again.');
        }
      } finally {
        setFetchLoading(false);
      }
    };

    if (!authLoading) {
      fetchProfile();
    }
  }, [getToken, logout, navigate, user, authLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, JPG, PNG, and GIF files are allowed');
      setProfilePicture(null);
      setPreviewImage('');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      setProfilePicture(null);
      setPreviewImage('');
      return;
    }

    setProfilePicture(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewImage(reader.result);
    reader.readAsDataURL(file);
    setError('');
  };

  const handleRemoveImage = () => {
    setProfilePicture(null);
    setPreviewImage(user?.profilePicture?.url || '');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    const token = getToken();
    console.log('EditProfilePage: Token on submit:', token ? token.substring(0, 10) + '...' : 'No token');
    if (!token) {
      setError('Please log in to update your profile');
      setLoading(false);
      navigate('/login');
      return;
    }

    if (!user || !user._id || !isValidObjectId(user._id)) {
      console.error('EditProfilePage: Invalid user ID before update:', user);
      setError('Invalid user profile. Please log in again.');
      setLoading(false);
      logout();
      navigate('/login');
      return;
    }

    try {
      const cleanToken = token.trim();
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('bio', formData.bio);
      if (formData.password) {
        data.append('password', formData.password);
      }
      if (profilePicture) {
        console.log('EditProfilePage: Sending profilePicture:', profilePicture.name, profilePicture.size, profilePicture.type);
        data.append('profilePicture', profilePicture);
      }

      console.log('EditProfilePage: Sending update request:', {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        hasPassword: !!formData.password,
        hasProfilePicture: !!profilePicture,
      });

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/profile`,
        data,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      console.log('EditProfilePage: Update response:', response.data);

      const updatedUser = {
        _id: response.data._id,
        name: response.data.name,
        email: response.data.email,
        bio: response.data.bio,
        profilePicture: response.data.profilePicture || user?.profilePicture || null,
        isAdmin: response.data.isAdmin || user?.isAdmin || false,
        followers: user?.followers || [],
        following: user?.following || [],
      };
      updateAuthUser(updatedUser);

      navigate('/profile', { state: { successMessage: 'Profile updated successfully!' } });
    } catch (err) {
      console.error('EditProfilePage: Error updating profile:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        data: err.response?.data,
        error: err.message,
      });
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
        logout();
        navigate('/login');
      } else if (err.response?.status === 400 && err.response?.data?.message === 'Invalid user ID') {
        setError('Your account may have been deleted or is invalid. Please log in again or contact support.');
      } else if (err.response?.status === 400 && err.response?.data?.message.includes('duplicate key error')) {
        setError('Email is already in use by another account.');
      } else {
        setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || fetchLoading) return <div className="edit-profile-loading">Loading...</div>;

  return (
    <div className="edit-profile-container">
      <header className="edit-profile-header">
        <h1>Edit Profile</h1>
        <Link to="/profile" className="edit-profile-cancel-btn">
          Cancel
        </Link>
      </header>

      <main className="edit-profile-main">
        {(error || authError) && (
          <div className="edit-profile-error" role="alert" id="edit-error">
            {error || authError}
            {((error || authError).includes('Please log in again') || (error || authError).includes('Your account may have been deleted')) && (
              <div>
                <Link to="/login" className="edit-profile-error-link">Log in</Link>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label htmlFor="profilePicture">Profile Picture</label>
            {previewImage && (
              <div className="image-preview">
                <img
                  src={previewImage}
                  alt="Profile picture preview"
                  className="edit-profile-preview-img"
                  style={{ maxWidth: '100px', borderRadius: '50%' }}
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="remove-image"
                  aria-label="Remove profile picture"
                >
                  Remove
                </button>
              </div>
            )}
            <input
              id="profilePicture"
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif"
              onChange={handleFileChange}
              className="image-upload"
            />
          </div>

          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Your name"
              aria-required="true"
              aria-describedby={(error || authError) ? 'edit-error' : undefined}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              placeholder="your@email.com"
              aria-required="true"
              aria-describedby={(error || authError) ? 'edit-error' : undefined}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself"
              rows="4"
              aria-describedby={(error || authError) ? 'edit-error' : undefined}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">New Password (optional)</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="•••••••"
              minLength="8"
              aria-describedby={(error || authError) ? 'edit-error' : undefined}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="•••••••"
              minLength="8"
              aria-describedby={(error || authError) ? 'edit-error' : undefined}
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="edit-profile-submit-btn"
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