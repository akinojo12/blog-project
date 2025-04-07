import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BlogCard from '../components/BlogCard';
import Header from '../common/Header';
import '../assets/home.css';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await getPosts(searchTerm);
        setPosts(data);
      } catch (err) {
        setError('Failed to fetch posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [searchTerm]);

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="home-page">
      <Header />
      
      <div className="home-content">
        <div className="home-header">
          <h1>{currentUser ? 'Your Feed' : 'Latest Posts'}</h1>
          {currentUser && (
            <Link to="/compose" className="compose-button">
              Write a post
            </Link>
          )}
        </div>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : filteredPosts.length === 0 ? (
          <div className="no-posts">
            <h3>No posts found</h3>
            {currentUser && (
              <Link to="/compose" className="create-post-link">
                Create your first post
              </Link>
            )}
          </div>
        ) : (
          <div className="posts-grid">
            {filteredPosts.map(post => (
              <BlogCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;