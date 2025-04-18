import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../assets/blogCard.css';

const BlogCard = ({
  title,
  slug,
  excerpt,
  content,
  author,
  date,
  likesCount,
  featuredImage,
  postId,
  userId,
  onDelete,
  commentCount,
  authorProfilePicture,
}) => {
  const { getToken, user, logout } = useAuth();
  const navigate = useNavigate();
  const isAuthor = user?._id === userId;
  const [liked, setLiked] = useState(false);
  const [currentLikesCount, setCurrentLikesCount] = useState(likesCount || 0);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [currentCommentCount, setCurrentCommentCount] = useState(commentCount || 0);
  const [imageError, setImageError] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);
  const [error, setError] = useState('');

  const fetchInitialData = useCallback(async () => {
    const token = getToken();
    if (!token || !user) return;

    const userId = user._id;
    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      console.error('Invalid or missing user._id:', user);
      setError('Invalid user profile. Please log in again.');
      logout();
      navigate('/login');
      return;
    }

    try {
      const cleanToken = token.trim();
      const [postResponse, commentsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/posts/slug/${slug}`, {
          headers: { Authorization: `Bearer ${cleanToken}` },
        }),
        axios.get(`${import.meta.env.VITE_API_URL}/api/comments/post/${postId}`, {
          headers: { Authorization: `Bearer ${cleanToken}` },
        }),
      ]);

      setLiked(postResponse.data.likes.includes(userId));
      setComments(commentsResponse.data.slice(0, 2));
    } catch (err) {
      console.error('Error fetching initial data:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        error: err.message,
      });
      if (err.response?.status === 401) {
        logout();
        navigate('/login');
      } else {
        setError(err.response?.data?.message || 'Failed to load post data');
      }
    }
  }, [getToken, user, slug, postId, logout, navigate]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleLikeToggle = async () => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const cleanToken = token.trim();
      const url = liked
        ? `${import.meta.env.VITE_API_URL}/api/posts/${postId}/unlike`
        : `${import.meta.env.VITE_API_URL}/api/posts/${postId}/like`;

      const response = await axios.post(url, {}, {
        headers: { Authorization: `Bearer ${cleanToken}` },
      });

      setCurrentLikesCount(response.data.likesCount);
      setLiked(!liked);
    } catch (err) {
      console.error(`Error ${liked ? 'unliking' : 'liking'} post:`, {
        status: err.response?.status,
        message: err.response?.data?.message,
        error: err.message,
      });
      setError(`Failed to ${liked ? 'unlike' : 'like'} post`);
    }
  };

  const handleDelete = async () => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const cleanToken = token.trim();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/posts/${postId}`, {
        headers: { Authorization: `Bearer ${cleanToken}` },
      });
      onDelete(postId);
    } catch (err) {
      console.error('Error deleting post:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        error: err.message,
      });
      setError('Failed to delete post');
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const cleanToken = token.trim();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/comments`,
        { content: newComment, postId },
        { headers: { Authorization: `Bearer ${cleanToken}` } }
      );

      setComments([response.data, ...comments].slice(0, 2));
      setCurrentCommentCount(currentCommentCount + 1);
      setNewComment('');
    } catch (err) {
      console.error('Error creating comment:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        error: err.message,
      });
      setError('Failed to create comment');
    }
  };

  if (error) {
    return <div className="blog-card-error" role="alert">{error}</div>;
  }

  return (
    <article className="blog-card" aria-labelledby={`post-title-${postId}`}>
      <header className="blog-header">
        <div className="blog-author-info">
          {authorProfilePicture && !profileImageError ? (
            <img
              src={authorProfilePicture}
              alt={`Profile picture of ${author}`}
              className="blog-author-profile-picture"
              onError={() => {
                console.error('Error loading profile picture:', authorProfilePicture);
                setProfileImageError(true);
              }}
              style={{ width: '40px', height: '40px', borderRadius: '50%', marginRight: '10px' }}
            />
          ) : (
            <div
              className="blog-author-profile-placeholder"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#ccc',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '10px',
              }}
            >
              {author[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <span className="blog-author">{author}</span>
          <span className="blog-date">{date}</span>
        </div>
        <button className="blog-follow-btn" disabled>Follow</button>
      </header>

      <Link to={`/post/slug/${slug}`} className="blog-content-link">
        <h2 id={`post-title-${postId}`} className="blog-content-title">{title}</h2>
        <p className="blog-content">{excerpt || content.slice(0, 150) + '...'}</p>
      </Link>

      {featuredImage && !imageError ? (
        <img
          src={featuredImage}
          alt={`Featured image for ${title}`}
          className="blog-featured-image"
          onError={() => {
            console.error('Error loading image:', featuredImage);
            setImageError(true);
          }}
        />
      ) : imageError ? (
        <div className="blog-image-placeholder" aria-hidden="true">
          Image not available
        </div>
      ) : null}

      {isAuthor && (
        <div className="blog-actions">
          <Link to={`/edit/${postId}`} className="blog-edit-btn">
            Edit
          </Link>
          <button onClick={handleDelete} className="blog-delete-btn">
            Delete
          </button>
        </div>
      )}

      <div className="blog-interactions">
        <button
          onClick={handleLikeToggle}
          className={`blog-interaction ${liked ? 'liked' : ''}`}
          aria-label={liked ? 'Unlike post' : 'Like post'}
        >
          <span className="blog-interaction-icon">❤️</span>
          <span>{currentLikesCount} Likes</span>
        </button>
        <span className="blog-interaction">
          <span className="blog-interaction-icon">💬</span>
          <span>{currentCommentCount} Comments</span>
        </span>
        <span className="blog-interaction">
          <span className="blog-interaction-icon">🔗</span>
          Share
        </span>
      </div>

      <div className="blog-comment-section">
        <form onSubmit={handleCommentSubmit} className="blog-comment-form">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="blog-comment-input"
            required
            aria-label="Comment input"
          />
          <button type="submit" className="blog-comment-submit">
            Comment
          </button>
        </form>

        {comments.length > 0 && (
          <div className="blog-comments-preview">
            {comments.map((comment) => (
              <div key={comment._id} className="blog-comment">
                <div className="blog-comment-header">
                  <span className="blog-comment-author">{comment.author?.name || 'Unknown'}</span>
                  <span className="blog-comment-date">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="blog-comment-content">{comment.content}</p>
              </div>
            ))}
            {currentCommentCount > 2 && (
              <Link to={`/post/slug/${slug}`} className="blog-view-more-comments">
                View all {currentCommentCount} comments
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default BlogCard;