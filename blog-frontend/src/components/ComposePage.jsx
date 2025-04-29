import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../assets/compose.css';

const ComposePage = () => {
  const { getToken, logout } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPEG, JPG, PNG, and GIF files are allowed');
      setFeaturedImage(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      setFeaturedImage(null);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setFeaturedImage({ file, previewUrl });
    setError('');
    setSuccessMessage('');
  };

  const handleRemoveImage = () => {
    if (featuredImage) {
      URL.revokeObjectURL(featuredImage.previewUrl);
      setFeaturedImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    const token = getToken();
    if (!token) {
      setError('Please log in to create a post');
      navigate('/login');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setSuccessMessage('');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (excerpt) formData.append('excerpt', excerpt);
      if (featuredImage) {
        console.log('Sending featuredImage:', featuredImage.file);
        formData.append('featuredImage', featuredImage.file);
      }

      const cleanToken = token.trim();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/posts`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.featuredImage?.url) {
        setSuccessMessage('Post created successfully with image!');
      } else if (featuredImage) {
        setSuccessMessage('Post created successfully, but the image could not be processed.');
      } else {
        setSuccessMessage('Post created successfully!');
      }

      navigate(`/post/slug/${response.data.slug}`);
    } catch (err) {
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to create post');
        console.error('Error creating post:', err.response?.data || err);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="compose-container">
      <header className="compose-header">
        <h1>Compose New Post</h1>
        <p>Share your thoughts with the world</p>
      </header>
      <hr />

      {error && (
        <div className="compose-error" role="alert">
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
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            aria-required="true"
          />
        </div>

        

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start Writing..."
            rows="10"
            required
            aria-required="true"
          />
        </div>

        <div className="form-group">
          <label htmlFor="featuredImage">Featured Image (optional)</label>
          <input
            id="featuredImage"
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif"
            onChange={handleImageChange}
            className="image-upload"
          />
          {featuredImage && (
            <div className="image-preview">
              <img
                src={featuredImage.previewUrl}
                alt="Preview of featured image"
                style={{ maxWidth: '200px' }}
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="remove-image"
                aria-label="Remove featured image"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={isSubmitting}
            className="publish-button"
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComposePage;