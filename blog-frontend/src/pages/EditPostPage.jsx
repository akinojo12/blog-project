import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../assets/compose.css';

const EditPostPage = () => {
  const { id } = useParams();
  const { getToken, logout, user } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('Home');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const token = getToken();
      if (!token || !user) {
        setError('Please log in to edit a post');
        setLoading(false);
        navigate('/login');
        return;
      }

      const userId = user._id;
      if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
        console.error('Invalid or missing user._id:', user);
        setError('Invalid user profile. Please log in again.');
        setLoading(false);
        logout();
        navigate('/login');
        return;
      }

      try {
        const cleanToken = token.trim();
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${cleanToken}` },
        });
        const post = response.data;

        if (post.user._id !== userId) {
          setError('You are not authorized to edit this post');
          setLoading(false);
          navigate('/home');
          return;
        }

        setTitle(post.title);
        setContent(post.content);
        setExcerpt(post.excerpt || '');
        setCategory(post.category || 'Home');
        if (post.featuredImage?.url) {
          setFeaturedImage({ url: post.featuredImage.url });
        }
      } catch (err) {
        console.error('Error fetching post:', {
          status: err.response?.status,
          message: err.response?.data?.message,
          error: err.message,
        });
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch post');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id, user, getToken, logout, navigate]);

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
      if (featuredImage.previewUrl) {
        URL.revokeObjectURL(featuredImage.previewUrl);
      }
      setFeaturedImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      setIsSubmitting(false);
      return;
    }

    const token = getToken();
    if (!token) {
      setError('Please log in to update the post');
      setIsSubmitting(false);
      navigate('/login');
      return;
    }

    try {
      const cleanToken = token.trim();
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      if (excerpt) formData.append('excerpt', excerpt);
      formData.append('category', category);
      if (featuredImage?.file) {
        console.log('Sending featuredImage:', featuredImage.file);
        formData.append('featuredImage', featuredImage.file);
      }

      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/posts/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${cleanToken}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setSuccessMessage('Post updated successfully!');
      setTimeout(() => navigate(`/post/slug/${response.data.slug}`), 1000);
    } catch (err) {
      console.error('Error updating post:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        error: err.message,
      });
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to update post');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="compose-loading">Loading post...</div>;

  return (
    <div className="compose-container">
      <header className="compose-header">
        <h1>Edit Post</h1>
       
      </header>

      <main className="compose-main">
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
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Your post title"
              aria-required="true"
              aria-describedby={error ? 'edit-error' : undefined}
            />
          </div>

          

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder="Write your post content here..."
              rows="10"
              aria-required="true"
              aria-describedby={error ? 'edit-error' : undefined}
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
                  src={featuredImage.previewUrl || featuredImage.url}
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
              className="publish-button"
              disabled={isSubmitting}
              aria-busy={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Post'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default EditPostPage;