import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../assets/post.css';

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const PostPage = () => {
  const { slug } = useParams();
  const { user, getToken, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [imageError, setImageError] = useState(false);

  const mockTags = ['Poetry', 'Writing', 'Philosophy', 'Photography', 'Art', 'Literature'];

  useEffect(() => {
    const fetchPostAndComments = async () => {
      if (authLoading) return;

      const token = getToken();
      if (!token || !user || !user._id) {
        setError('Please log in to view this post');
        setLoading(false);
        navigate('/login');
        return;
      }

      if (!isValidObjectId(user._id)) {
        console.error('Invalid user._id:', user._id);
        setError('Invalid user profile. Please log in again.');
        logout();
        navigate('/login');
        return;
      }

      try {
        const cleanToken = token.trim();
        console.log('Fetching post for slug:', slug);

        const postResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/slug/${slug}`, {
          headers: { Authorization: `Bearer ${cleanToken}` },
        });
        const fetchedPost = postResponse.data;
        if (!isValidObjectId(fetchedPost._id)) {
          console.error('Invalid post._id:', fetchedPost._id);
          setError('Invalid post ID');
          setLoading(false);
          return;
        }
        setPost(fetchedPost);
        setLiked(Array.isArray(fetchedPost.likes) && fetchedPost.likes.includes(user._id));
        setIsFollowing(Array.isArray(fetchedPost.user?.followers) && fetchedPost.user.followers.includes(user._id));

        console.log('Fetching comments for postId:', fetchedPost._id);
        const commentsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/comments/post/${fetchedPost._id}`, {
          headers: { Authorization: `Bearer ${cleanToken}` },
        });
        setComments(commentsResponse.data);
      } catch (err) {
        console.error('Error fetching post/comments:', {
          status: err.response?.status,
          message: err.response?.data?.message,
          error: err.message,
        });
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        } else if (err.response?.status === 404) {
          setError('Post not found');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch post or comments');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [slug, getToken, logout, navigate, user, authLoading]);

  const handleLike = async () => {
    const token = getToken();
    if (!token || !post) {
      navigate('/login');
      return;
    }

    setError(''); // Clear previous errors
    try {
      const cleanToken = token.trim();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${cleanToken}` } }
      );
      setPost({ ...post, likes: response.data.likes, likesCount: response.data.likesCount });
      setLiked(true);
    } catch (err) {
      console.error('Error liking post:', err);
      setError('Failed to like post');
    }
  };

  const handleUnlike = async () => {
    const token = getToken();
    if (!token || !post) {
      navigate('/login');
      return;
    }

    setError('');
    try {
      const cleanToken = token.trim();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/posts/${post._id}/unlike`,
        {},
        { headers: { Authorization: `Bearer ${cleanToken}` } }
      );
      setPost({ ...post, likes: response.data.likes, likesCount: response.data.likesCount });
      setLiked(false);
    } catch (err) {
      console.error('Error unliking post:', err);
      setError('Failed to unlike post');
    }
  };

  const handleFollow = async () => {
    const token = getToken();
    if (!token || !post || !post.user?._id) {
      navigate('/login');
      return;
    }

    setError('');
    try {
      const cleanToken = token.trim();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/${post.user._id}/follow`,
        {},
        { headers: { Authorization: `Bearer ${cleanToken}` } }
      );
      setIsFollowing(true);
    } catch (err) {
      console.error('Error following user:', err);
      setError('Failed to follow user');
    }
  };

  const handleUnfollow = async () => {
    const token = getToken();
    if (!token || !post || !post.user?._id) {
      navigate('/login');
      return;
    }

    setError('');
    try {
      const cleanToken = token.trim();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/${post.user._id}/unfollow`,
        {},
        { headers: { Authorization: `Bearer ${cleanToken}` } }
      );
      setIsFollowing(false);
    } catch (err) {
      console.error('Error unfollowing user:', err);
      setError('Failed to unfollow user');
    }
  };

  const handleDelete = async () => {
    const token = getToken();
    if (!token || !post) {
      navigate('/login');
      return;
    }

    if (!isValidObjectId(post._id)) {
      console.error('Invalid post._id for deletion:', post._id);
      setError('Invalid post ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);
    setError('');
    try {
      const cleanToken = token.trim();
      console.log('Deleting post:', post._id);
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${cleanToken}` },
      });
      navigate('/home', { state: { successMessage: 'Post deleted successfully' } });
    } catch (err) {
      console.error('Error deleting post:', {
        status: err.response?.status,
        message: err.response?.data?.message,
        error: err.message,
      });
      setError(err.response?.data?.message || 'Failed to delete post');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = getToken();
    if (!token || !post) {
      navigate('/login');
      return;
    }

    setError('');
    try {
      const cleanToken = token.trim();
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/comments`,
        { content: newComment, postId: post._id },
        { headers: { Authorization: `Bearer ${cleanToken}` } }
      );
      setComments([response.data, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Error creating comment:', err);
      setError('Failed to create comment');
    }
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditContent(comment.content);
  };

  const handleUpdateComment = async (commentId) => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    setError('');
    try {
      const cleanToken = token.trim();
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/comments/${commentId}`,
        { content: editContent },
        { headers: { Authorization: `Bearer ${cleanToken}` } }
      );
      setComments(comments.map((comment) =>
        comment._id === commentId ? { ...comment, content: response.data.content } : comment
      ));
      setEditingComment(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating comment:', err);
      setError('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    setError('');
    try {
      const cleanToken = token.trim();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${cleanToken}` },
      });
      setComments(comments.filter((comment) => comment._id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    }
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (authLoading || loading) return <div className="post-loading">Loading post...</div>;
  if (error) return <div className="post-error" role="alert">{error}</div>;
  if (!post) return <div className="post-not-found">Post not found</div>;

  const isAuthor = user?._id === (post.user?._id || post.user);

  return (
    <div className="post-page">
      <div className="post-head">
        <Link to="/home" className="post-back-btn">Back</Link>
        <Link to="/profile" className="post-profile-btn">Profile</Link>
      </div>

      <main className="post-main">
        <article className="post-article" aria-labelledby={`post-title-${post._id}`}>
          <div className="post-header">
            <div className="post-author-info">
              <span className="post-author">{post.user?.name || 'Unknown'}</span>
              
            </div>
            <span className="post-timestamp">{formatDate(post.createdAt)}</span>
            {!isAuthor && (
              <button
                onClick={isFollowing ? handleUnfollow : handleFollow}
                className="post-follow-btn"
                disabled={false}
                aria-label={isFollowing ? 'Unfollow author' : 'Follow author'}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
          </div>

          <h1 id={`post-title-${post._id}`}>{post.title}</h1>
          {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
          <p className="post-content">{post.content}</p>
          {post.featuredImage?.url && !imageError ? (
            <img
              src={post.featuredImage.url}
              alt={`Featured image for ${post.title}`}
              className="post-featured-image"
              onError={() => {
                console.error('Error loading featured image:', post.featuredImage.url);
                setImageError(true);
              }}
            />
          ) : imageError ? (
            <div className="post-image-placeholder" aria-hidden="true">
              Image not available
            </div>
          ) : null}

          <div className="post-interactions">
            <div className="post-interaction-buttons">
              <button
                onClick={liked ? handleUnlike : handleLike}
                className={`post-interaction-btn ${liked ? 'liked' : ''}`}
                aria-label={liked ? 'Unlike post' : 'Like post'}
              >
                <span className="post-interaction-icon">❤️</span>
                {post.likesCount || 0} Likes
              </button>
              <button className="post-interaction-btn" disabled={false}>
                <span className="post-interaction-icon">💬</span>
                {comments.length} Replies
              </button>
              {isAuthor && (
                <div className="post-more-actions">
                  <button
                    onClick={toggleDropdown}
                    className="post-more-btn"
                    aria-label="More actions"
                  >
                    <span className="post-interaction-icon">⋮</span>
                  </button>
                  {showDropdown && (
                    <div className="post-more-dropdown">
                      <Link
                        to={`/edit/${post._id}`}
                        className="post-dropdown-item"
                        onClick={() => setShowDropdown(false)}
                      >
                        Edit
                      </Link>
                      <button
                        onClick={handleDelete}
                        className="post-dropdown-item post-delete-item"
                        disabled={isDeleting}
                        aria-busy={isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </article>

        <section className="post-reply-section">
          <form onSubmit={handleCommentSubmit} className="post-reply-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Leave a reply..."
              className="post-reply-input"
              required
              aria-label="Comment input"
            />
            <button type="submit" className="post-reply-submit">Submit</button>
          </form>

          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="post-reply" aria-labelledby={`comment-${comment._id}`}>
                <div className="post-reply-header">
                  <span className="post-reply-author">{comment.author?.name || 'Unknown'}</span>
                  <span className="post-reply-date">{formatDate(comment.createdAt)}</span>
                </div>
                {editingComment === comment._id ? (
                  <div className="post-reply-edit">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="post-reply-input"
                      aria-label="Edit comment"
                    />
                    <div className="post-reply-actions">
                      <button
                        onClick={() => handleUpdateComment(comment._id)}
                        className="post-reply-submit"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingComment(null)}
                        className="post-reply-cancel"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="post-reply-content" id={`comment-${comment._id}`}>{comment.content}</p>
                    {(comment.author?._id === user?._id || user?.isAdmin) && (
                      <div className="post-reply-actions">
                        <button
                          onClick={() => handleEditComment(comment)}
                          className="post-reply-edit-btn"
                          aria-label={`Edit comment by ${comment.author?.name || 'Unknown'}`}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="post-reply-delete-btn"
                          aria-label={`Delete comment by ${comment.author?.name || 'Unknown'}`}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          ) : (
            <p className="post-no-comments">No comments yet. Be the first to comment!</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default PostPage;