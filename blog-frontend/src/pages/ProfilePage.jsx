import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BlogCard from '../components/BlogCard';
import '../assets/profile.css';

const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

const ProfilePage = () => {
  const { getToken, logout, user, authLoading, authError } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('Posts');
  const [profileImageError, setProfileImageError] = useState(false);

  const fetchData = useCallback(async () => {
    if (authLoading) return;

    const token = getToken();
    if (!token || !user || !user._id) {
      setError('Please log in to view your profile');
      setLoading(false);
      navigate('/login');
      return;
    }

    if (!isValidObjectId(user._id)) {
      console.error('ProfilePage: Invalid user._id format:', user._id);
      setError('Invalid user profile. Please log in again.');
      logout();
      navigate('/login');
      return;
    }

    const userId = user._id;
    try {
      const cleanToken = token.trim();
      console.log('ProfilePage: Fetching profile data for user ID:', userId, 'Token:', cleanToken.substring(0, 10) + '...');

      // Fetch user posts
      let userPosts = [];
      try {
        const userPostsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/user/${userId}`, {
          headers: { Authorization: `Bearer ${cleanToken}` },
        });
        console.log({userPostsResponse});
        userPosts = Array.isArray(userPostsResponse.data.data)
          ? userPostsResponse.data.data.filter(post => {
              if (!isValidObjectId(post._id)) {
                console.warn('ProfilePage: Filtering out user post with invalid _id:', post._id, 'Post:', post);
                return false;
              }
              console.log('ProfilePage: User post data:', post);
              return true;
            })
          : [];
        console.log('ProfilePage: Fetched user posts:', userPosts.length, userPosts.map(p => p._id));
        setPosts(userPosts);
        console.log('ProfilePage: Set user posts state:', userPosts);
      } catch (userPostsErr) {
        console.error('ProfilePage: Error fetching user posts:', {
          status: userPostsErr.response?.status,
          message: userPostsErr.response?.data?.message,
          data: userPostsErr.response?.data,
          error: userPostsErr.message,
        });
        if (userPostsErr.response?.status === 400 && userPostsErr.response?.data?.message === 'Invalid post ID') {
          console.warn('ProfilePage: Proceeding despite invalid post IDs in user posts');
        } else if (userPostsErr.response?.status === 401) {
          throw userPostsErr;
        } else {
          setError('Failed to load your posts. Some data may be unavailable.');
        }
      }

      // Fetch liked posts
      let likedPostsData = [];
      try {
        const likedPostsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/posts/liked`, {
          headers: { Authorization: `Bearer ${cleanToken}` },
        });
        likedPostsData = Array.isArray(likedPostsResponse.data.data)
          ? likedPostsResponse.data.data.filter(post => {
              if (!isValidObjectId(post._id)) {
                console.warn('ProfilePage: Filtering out liked post with invalid _id:', post._id, 'Post:', post);
                return false;
              }
              console.log('ProfilePage: Liked post data:', post);
              return true;
            })
          : [];
        console.log('ProfilePage: Fetched liked posts:', likedPostsData.length, likedPostsData.map(p => p._id));
        setLikedPosts(likedPostsData);
        console.log('ProfilePage: Set liked posts state:', likedPostsData);
      } catch (likedPostsErr) {
        console.error('ProfilePage: Error fetching liked posts:', {
          status: likedPostsErr.response?.status,
          message: likedPostsErr.response?.data?.message,
          data: likedPostsErr.response?.data,
          error: likedPostsErr.message,
        });
        if (likedPostsErr.response?.status === 400 && likedPostsErr.response?.data?.message === 'Invalid post ID') {
          console.warn('ProfilePage: Proceeding despite invalid post IDs in liked posts');
        } else if (likedPostsErr.response?.status === 401) {
          throw likedPostsErr;
        } else {
          setError(prev => prev ? `${prev} Failed to load liked posts.` : 'Failed to load liked posts.');
        }
      }

      if (!userPosts.length && !likedPostsData.length && error) {
        setError('Unable to load posts due to invalid data. Please try again or contact support.');
      }
    } catch (err) {
      console.error('ProfilePage: Error fetching profile data:', {
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
      } else if (err.response?.status === 404) {
        setError('No posts found for this user.');
        setPosts([]);
        setLikedPosts([]);
      } else {
        setError(err.response?.data?.message || 'Failed to load profile data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [authLoading, getToken, logout, navigate, user]);

  useEffect(() => {
    console.log('ProfilePage: Running fetchData');
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    console.log('ProfilePage: Current posts state:', posts);
    console.log('ProfilePage: Current likedPosts state:', likedPosts);
  }, [posts, likedPosts]);

  useEffect(() => {
    console.log('ProfilePage: Rendering posts section, posts.length:', posts.length);
  }, [posts, activeTab]);

  const handleUserClick = () => {
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = () => {
    setShowUserDropdown(false);
    logout();
    navigate('/login');
  };

  const handleDropdownLinkClick = () => {
    setShowUserDropdown(false);
  };

  const handleDelete = (postId) => {
    console.log('ProfilePage: Deleting post from UI:', postId);
    setPosts(prevPosts => {
      const updatedPosts = prevPosts.filter((post) => post._id !== postId);
      console.log('ProfilePage: Updated posts after delete:', updatedPosts);
      return updatedPosts;
    });
    setLikedPosts(prevLikedPosts => {
      const updatedLikedPosts = prevLikedPosts.filter((post) => post._id !== postId);
      console.log('ProfilePage: Updated likedPosts after delete:', updatedLikedPosts);
      return updatedLikedPosts;
    });
  };

  if (authLoading || loading) return <div className="profile-loading" role="status">Loading profile...</div>;

  return (
    <div className="profile-page">
      
      <header className="profile-header">
      <h2>MyBlog</h2>
        <div className="profile-search">
          <input
            type="text"
            placeholder="Search MyBlog"
            aria-label="Search"
          />
        </div>
        <div className="profile-user">
          <button
            className="profile-user-btn"
            onClick={handleUserClick}
            aria-label={`User menu for ${user?.name || 'User'}`}
          >
            {user?.profilePicture?.url && !profileImageError ? (
              <img
                src={user.profilePicture.url}
                alt="User avatar"
                className="profile-user-avatar"
                onError={() => setProfileImageError(true)}
              />
            ) : (
              <span className="profile-user-avatar" aria-hidden="true">👤</span>
            )}
            <span>{user?.name || 'User'}</span>
          </button>
          {showUserDropdown && (
            <div className="profile-user-dropdown">
              <Link
                to="/profile"
                className="profile-user-dropdown-item"
                onClick={handleDropdownLinkClick}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="profile-user-dropdown-item"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="profile-main">
        {(error || authError) && (
          <div className="profile-error" role="alert">
            {error || authError}
            {((error || authError).includes('Please log in again') || (error || authError).includes('Your account may have been deleted')) && (
              <div>
                <Link to="/login" className="profile-error-link">Log in</Link>
              </div>
            )}
          </div>
        )}

        <section className="profile-info" aria-labelledby="profile-username">
          <div className="profile-info-header">
            <h1 id="profile-username" className="profile-username">{user?.name || 'User'}</h1>
            <span className="profile-handle">@{user?.name?.toLowerCase() || 'user'}</span>
          </div>
          <div className="profile-avatar">
            {user?.profilePicture?.url && !profileImageError ? (
              <img
                src={user.profilePicture.url}
                alt="Profile avatar"
                className="profile-avatar-img"
                onError={() => setProfileImageError(true)}
              />
            ) : (
              <span className="profile-avatar-placeholder" aria-hidden="true">👤</span>
            )}
          </div>
          <p className="profile-bio">{user?.bio || 'Nothing to see here yet.'}</p>
          <p className="profile-subscribers">{user?.followers?.length || 0} subscriber{user?.followers?.length !== 1 ? 's' : ''}</p>
          <div className="profile-actions">
            <Link to="/compose" className="profile-new-post-btn" aria-label="Create new post">
              New post
            </Link>
            <Link to="/edit-profile" className="profile-edit-btn" aria-label="Edit profile">
              Edit profile
            </Link>
            <button
              className="profile-more-btn"
              disabled
              aria-hidden="true"
              title="More options (not implemented)"
            >
              …
            </button>
          </div>
        </section>

        <section className="profile-activity" aria-labelledby="profile-activity-heading">
          <h2 id="profile-activity-heading" className="profile-activity-heading">Activity</h2>
          <div className="profile-activity-tabs">
            <button
              className={`profile-activity-tab ${activeTab === 'Posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('Posts')}
              aria-current={activeTab === 'Posts' ? 'true' : 'false'}
            >
              Posts
            </button>
            <button
              className={`profile-activity-tab ${activeTab === 'Likes' ? 'active' : ''}`}
              onClick={() => setActiveTab('Likes')}
              aria-current={activeTab === 'Likes' ? 'true' : 'false'}
            >
              Likes
            </button>
          </div>
          <div className="profile-posts">
            {activeTab === 'Posts' ? (
              posts.length > 0 ? (
                <>
                  <span className="profile-posts-label">Latest post</span>
                  {posts.map((post) => (
                    <BlogCard
                      key={post._id}
                      postId={post._id}
                      userId={post.user?._id || post.user}
                      title={post.title}
                      slug={post.slug}
                      excerpt={post.excerpt || ''}
                      content={post.content}
                      author={post.user?.name || 'Unknown'}
                      date={new Date(post.createdAt).toLocaleDateString()}
                      likesCount={post.likesCount || 0}
                      featuredImage={post.featuredImage?.url}
                      commentCount={post.commentCount || 0}
                      onDelete={handleDelete}
                      authorProfilePicture={post.user?.profilePicture?.url}
                    />
                  ))}
                </>
              ) : (
                <p className="profile-no-posts">No posts yet. <Link to="/compose">Create one!</Link></p>
              )
            ) : activeTab === 'Likes' ? (
              likedPosts.length > 0 ? (
                likedPosts.map((post) => (
                  <BlogCard
                    key={post._id}
                    postId={post._id}
                    userId={post.user?._id || post.user}
                    title={post.title}
                    slug={post.slug}
                    excerpt={post.excerpt || ''}
                    content={post.content}
                    author={post.user?.name || 'Unknown'}
                    date={new Date(post.createdAt).toLocaleDateString()}
                    likesCount={post.likesCount || 0}
                    featuredImage={post.featuredImage?.url}
                    commentCount={post.commentCount || 0}
                    onDelete={handleDelete}
                    authorProfilePicture={post.user?.profilePicture?.url}
                  />
                ))
              ) : (
                <p className="profile-no-posts">No liked posts yet.</p>
              )
            ) : (
              <p className="profile-no-posts">Feature not implemented yet.</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProfilePage;