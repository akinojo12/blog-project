import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import '../assets/post.css';

const PostPage = () => {
  const { slug } = useParams();
  const { user, getToken, logout } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState('');

  const mockTags = ['Poetry', 'Writing', 'Philosophy', 'Photography', 'Art', 'Literature'];

  useEffect(() => {
    const fetchPostAndComments = async () => {
      const token = getToken();
      if (!token || !user) {
        setError('User not authenticated');
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const cleanToken = token.trim();

        // Fetch the post
        const postResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/slug/${slug}`, {
          headers: { Authorization: `Bearer ${cleanToken}` },
        });
        setPost(postResponse.data);
        setLiked(Array.isArray(postResponse.data.likes) && postResponse.data.likes.includes(user._id));

        // Fetch comments for the post
        const commentsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/comments/post/${postResponse.data._id}`, {
          headers: { Authorization: `Bearer ${cleanToken}` },
        });
        setComments(commentsResponse.data);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch post or comments');
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [slug, getToken, logout, navigate, user]);

  const handleLike = async () => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

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
    }
  };

  const handleUnlike = async () => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

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
    }
  };

  const handleDelete = async () => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const cleanToken = token.trim();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${cleanToken}` },
      });
      navigate('/home');
    } catch (err) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
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
        { content: newComment, postId: post._id },
        { headers: { Authorization: `Bearer ${cleanToken}` } }
      );
      setComments([response.data, ...comments]); // Add new comment to the top
      setNewComment('');
    } catch (err) {
      console.error('Error creating comment:', err);
      alert('Failed to create comment');
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
      alert('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const cleanToken = token.trim();
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/comments/${commentId}`, {
        headers: { Authorization: `Bearer ${cleanToken}` },
      });
      setComments(comments.filter((comment) => comment._id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      alert('Failed to delete comment');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) return <div className="post-loading">Loading post...</div>;
  if (error) return <div className="post-error">{error}</div>;
  if (!post) return <div className="post-not-found">Post not found</div>;

  const isAuthor = user?._id === (post.user?._id || post.user);

  return (
    <div className="post-page">
        <div className='post-head'>
        <Link to={`/home`} className="post-logout-btn">
                Back
              </Link>
              <Link to="/profile" className="post-logout-btn">
                Profile
              </Link>
        </div>

      <main className="post-main">
        <article className="post-article">
          {post.featuredImage?.url && (
            <img
              src={post.featuredImage.url}
              alt="Featured"
              className="post-featured-image"
            />
          )}
          <h1>{post.title}</h1>
          <div className="post-header">
            <div className="post-author-info">
              <span className="post-author">{post.user?.name || 'Unknown'}</span>
              <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <button className="post-follow-btn">Follow</button>
          </div>
          <p className="post-content">{post.content}</p>
          {post.excerpt && <p className="post-excerpt">{post.excerpt}</p>}
          
            <div className="post-actions">
            <Link to={`/edit/${post._id}`} className="post-edit-btn">
              Edit
            </Link>
            <button onClick={handleDelete} className="post-delete-btn">
              Delete
            </button>
          </div>
          

          <div className="post-interactions">
            <div className="post-interaction-buttons">
              <button
                onClick={liked ? handleUnlike : handleLike}
                className={`post-interaction-btn ${liked ? 'liked' : ''}`}
              >
                <span className="post-interaction-icon">❤️</span>
                {post.likesCount || 0} Likes
              </button>
              <button className="post-interaction-btn">
                <span className="post-interaction-icon">💬</span>
                {comments.length} Replies
              </button>
              <button className="post-interaction-btn">
                <span className="post-interaction-icon">🔗</span>
                Share
              </button>
            </div>
            <span className="post-timestamp">
              {new Date(post.createdAt).toLocaleString()}
            </span>
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
            />
            <button type="submit" className="post-reply-submit">
              Submit
            </button>
          </form>

          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="post-reply">
                <div className="post-reply-header">
                  <span className="post-reply-author">{comment.author?.name || 'Unknown'}</span>
                  <span className="post-reply-date">{new Date(comment.createdAt).toLocaleString()}</span>
                </div>
                {editingComment === comment._id ? (
                  <div className="post-reply-edit">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="post-reply-input"
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
                    <p className="post-reply-content">{comment.content}</p>
                    {(comment.author?._id === user?._id || user?.isAdmin) && (
                      <div className="post-reply-actions">
                        <button
                          onClick={() => handleEditComment(comment)}
                          className="post-reply-edit-btn"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="post-reply-delete-btn"
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