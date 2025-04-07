import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/blogcard.css'

const ComposePage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [featuredImage, setFeaturedImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const imageData = await uploadImage(file);
      setFeaturedImage(imageData);
    } catch (err) {
      setError('Failed to upload image');
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      return setError('Title and content are required');
    }

    try {
      setIsSubmitting(true);
      setError('');

      const postData = {
        title,
        content,
        excerpt: excerpt || `${content.substring(0, 150)}...`,
        featuredImage
      };

      const newPost = await createPost(postData);
      navigate(`/post/${newPost.slug}`);
    } catch (err) {
      setError(err.message || 'Failed to create post');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="compose-container">
      <div className="compose-header">
        <h1>Compose New Post</h1>
        <p>Share your thoughts with the world</p>
      </div>

      {error && <div className="compose-error">{error}</div>}

      <form onSubmit={handleSubmit} className="compose-form">
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Your post title"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="excerpt">Excerpt (optional)</label>
          <textarea
            id="excerpt"
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary of your post"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Featured Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="image-upload"
          />
          {featuredImage && (
            <div className="image-preview">
              <img src={featuredImage.url} alt="Preview" />
              <button 
                type="button" 
                onClick={() => setFeaturedImage(null)}
                className="remove-image"
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
          >
            {isSubmitting ? 'Publishing...' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ComposePage;