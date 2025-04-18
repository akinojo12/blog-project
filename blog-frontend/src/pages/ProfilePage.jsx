import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BlogCard from '../components/BlogCard';
import '../assets/profile.css';

const ProfilePage = () => {
  const { getToken, logout, user, authLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('Activity');
  const [profileImageError, setProfileImageError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (authLoading) return;

        const token = getToken();
        if (!token || !user || !user._id) {
          throw new Error('Please log in to view your profile');
        }

        const cleanToken = token.trim();
        const userId = user._id;

        // Fetch user posts
        const userPostsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/posts/user/${userId}`,
          { headers: { Authorization: `Bearer ${cleanToken}` } }
        );
        const userPosts = Array.isArray(userPostsResponse.data.data)
          ? userPostsResponse.data.data
          : Array.isArray(userPostsResponse.data)
          ? userPostsResponse.data
          : [];
        setPosts(userPosts);

   
        const likedPostsResponse = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/posts/liked`,
          { headers: { Authorization: `Bearer ${cleanToken}` } }
        );
        console.log('Liked posts response:', likedPostsResponse.data);
        const likedPostsData = Array.isArray(likedPostsResponse.data.data)
          ? likedPostsResponse.data.data
          : Array.isArray(likedPostsResponse.data)
          ? likedPostsResponse.data
          : [];
        setLikedPosts(likedPostsData);

      } catch (err) {
        console.error('Profile data fetch error:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });     
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        } else {
          setError(err.response?.data?.message || 'Failed to fetch profile data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authLoading, getToken, logout, navigate, user]);

  const handleUserClick = () => setShowUserDropdown(!showUserDropdown);
  const handleLogout = () => {
    setShowUserDropdown(false);
    logout();
    navigate('/login');
  };

  const handleDelete = (postId) => {
    setPosts(posts.filter(post => post._id !== postId));
    setLikedPosts(likedPosts.filter(post => post._id !== postId));
  };

  if (authLoading || loading) return <div className="profile-loading">Loading profile...</div>;
  if (error) return <div className="profile-error">{error}</div>;

  return (
    <div className="profile-page">
      <header className="profile-header">
        <div className="profile-search">
          <input type="text" placeholder="Search MyBlog" disabled />
        </div>
        <div className="profile-user">
          <button className="profile-user-btn" onClick={handleUserClick}>
            {user?.profilePicture?.url && !profileImageError ? (
              <img
                src={user.profilePicture.url}
                alt="User avatar"
                className="profile-user-avatar"
                onError={() => setProfileImageError(true)}
              />
            ) : (
              <span className="profile-user-avatar">👤</span>
            )}
            <span>{user?.name || 'User'}</span>
          </button>
          {showUserDropdown && (
            <div className="profile-user-dropdown">
              <Link to="/profile" className="profile-user-dropdown-item">
                Profile
              </Link>
              <button onClick={handleLogout} className="profile-user-dropdown-item">
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="profile-main">
        <section className="profile-info">
          <div className="profile-info-header">
            <h1 className="profile-username">{user?.name || 'User'}</h1>
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
              <span>👤</span>
            )}
          </div>
          <p className="profile-bio">{user?.bio || 'Nothing to see here yet.'}</p>
          <p className="profile-subscribers">{user?.followers?.length || 0} subscribers</p>
          <div className="profile-actions">
            <Link to="/compose" className="profile-new-post-btn">
              New post
            </Link>
            <Link to="/edit-profile" className="profile-edit-btn">
              Edit profile
            </Link>
            <button className="profile-more-btn">⋯</button>
          </div>
        </section>

        <section className="profile-activity">
          <div className="profile-activity-tabs">
            <button
              className={`profile-activity-tab ${activeTab === 'Activity' ? 'active' : ''}`}
              onClick={() => setActiveTab('Activity')}
            >
              Posts
            </button>
            <button
              className={`profile-activity-tab ${activeTab === 'Likes' ? 'active' : ''}`}
              onClick={() => setActiveTab('Likes')}
            >
              Likes ({likedPosts.length})
            </button>
          </div>
          <div className="profile-posts">
            {activeTab === 'Activity' ? (
              posts.length > 0 ? (
                posts.map(post => (
                  <BlogCard
                    key={post._id}
                    postId={post._id}
                    userId={post.user?._id || post.user || ''}
                    title={post.title || 'Untitled'}
                    slug={post.slug || ''}
                    excerpt={post.excerpt || ''}
                    content={post.content || ''}
                    author={post.user?.name || 'Unknown'}
                    date={new Date(post.createdAt).toLocaleDateString()}
                    likesCount={post.likesCount || 0}
                    featuredImage={post.featuredImage?.url || ''}
                    commentCount={post.commentCount || 0}
                    onDelete={handleDelete}
                    authorProfilePicture={post.user?.profilePicture?.url || ''}
                  />
                ))
              ) : (
                <p className="profile-no-posts">No posts yet.</p>
              )
            ) : activeTab === 'Likes' ? (
              <>
                {console.log('Rendering liked posts:', likedPosts)}
                {likedPosts.length > 0 ? (
                  likedPosts.map(post => (
                    <BlogCard
                      key={post._id}
                      postId={post._id}
                      userId={post.user?._id || post.user || ''}
                      title={post.title || 'Untitled'}
                      slug={post.slug || ''}
                      excerpt={post.excerpt || ''}
                      content={post.content || ''}
                      author={post.user?.name || 'Unknown'}
                      date={new Date(post.createdAt).toLocaleDateString()}
                      likesCount={post.likesCount || 0}
                      featuredImage={post.featuredImage?.url || ''}
                      commentCount={post.commentCount || 0}
                      onDelete={handleDelete}
                      authorProfilePicture={post.user?.profilePicture?.url || ''}
                    />
                  ))
                ) : (
                  <p className="profile-no-posts">No liked posts yet.</p>
                )}
              </>
            ) : null}
          </div>
        </section>
      </main>

      <button className="profile-get-app-btn">Get app</button>
    </div>
  );
};

export default ProfilePage;