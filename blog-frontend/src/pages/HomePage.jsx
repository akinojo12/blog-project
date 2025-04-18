import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BlogCard from '../components/BlogCard';
import '../assets/home.css';

const HomePage = () => {
  const { getToken, logout, user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Home');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [profileImageError, setProfileImageError] = useState(false);

  const categories = [
    'Home',
    'Following',
    'New & Bestsellers',
    'Cultural Commentary',
    'Movies & TV',
    'Subcultures',
    'Culture',
    'Technology',
    'Business',
    'U.S. Politics',
    'Finance',
    'Food & Drink',
  ];

  useEffect(() => {
    const fetchPosts = async () => {
      const token = getToken();
      if (!token || !user) {
        setError('User not authenticated');
        setLoading(false);
        navigate('/login');
        return;
      }

      try {
        const cleanToken = token.trim();
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/posts?pageNumber=${page}&category=${activeCategory}`,
          {
            headers: { Authorization: `Bearer ${cleanToken}` },
          }
        );
        console.log('Posts response:', response.data);
        const fetchedPosts = Array.isArray(response.data.posts) ? response.data.posts : [];
        setPosts(fetchedPosts);
        setFilteredPosts(fetchedPosts);
        setTotalPages(response.data.pages || 1);
      } catch (err) {
        if (err.response?.status === 401) {
          logout();
          navigate('/login');
        } else {
          setError(
            err.message === 'Network Error'
              ? 'Failed to connect to the server.'
              : err.response?.data?.message || 'Failed to fetch posts'
          );
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [getToken, logout, navigate, page, user, activeCategory]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query)
      );
      setFilteredPosts(filtered);
    }
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setPage(1);
  };

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

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleDelete = (postId) => {
    setPosts(posts.filter((post) => post._id !== postId));
    setFilteredPosts(filteredPosts.filter((post) => post._id !== postId));
  };

  if (loading) return <div className="home-loading">Loading posts...</div>;
  if (error) return <div className="home-error">{error}</div>;

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="namee">
          <h2>MyBlog</h2>
        </div>
        <div className="home-search">
          <input
            type="text"
            placeholder="Search MyBlog"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
        <div className="home-user">
          <button className="home-user-btn" onClick={handleUserClick}>
            {user?.profilePicture?.url && !profileImageError ? (
              <img
                src={user.profilePicture.url}
                alt="User avatar"
                className="home-user-pic"
                onError={() => setProfileImageError(true)}
              />
            ) : (
              <span className="home-user-avatar">👤</span>
            )}
            <span>{user?.name || 'User'}</span>
          </button>
          {showUserDropdown && (
            <div className="home-user-dropdown">
              <Link
                to="/profile"
                className="home-user-dropdown-item"
                onClick={handleDropdownLinkClick}
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="home-user-dropdown-item"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </header>

      <nav className="home-nav">
        <div className="home-nav-tabs">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`home-nav-tab ${category === activeCategory ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </nav>

      <main className="home-main">
        <section className="home-compose-section">
          <div className="home-compose-header">
            {user?.profilePicture?.url && !profileImageError ? (
              <img
                src={user.profilePicture.url}
                alt="User avatar"
                className="home-compose-pic"
                onError={() => setProfileImageError(true)}
              />
            ) : (
              <span className="home-compose-avatar">👤</span>
            )}
            <h2>What's on your mind?</h2>
          </div>
          <Link to="/compose" className="home-compose-link">
            <div className="home-compose-box">Start a new post...</div>
          </Link>
        </section>

        <div className="home-post-grid">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <BlogCard
                key={post._id}
                postId={post._id}
                userId={post.user?._id || post.user}
                title={post.title}
                slug={post.slug}
                excerpt={post.excerpt}
                content={post.content}
                author={post.user?.name || 'Unknown'}
                date={new Date(post.createdAt).toLocaleDateString()}
                likesCount={post.likesCount || 0}
                featuredImage={post.featuredImage?.url}
                commentCount={post.commentCount}
                onDelete={handleDelete}
                authorProfilePicture={post.user?.profilePicture?.url}
              />
            ))
          ) : (
            <p className="home-no-posts">No posts available. Start writing!</p>
          )}
        </div>

        {filteredPosts.length > 0 && (
          <div className="home-pagination">
            <button
              onClick={handlePrevPage}
              disabled={page === 1}
              className="home-pagination-btn"
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={handleNextPage}
              disabled={page === totalPages}
              className="home-pagination-btn"
            >
              Next
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default HomePage;