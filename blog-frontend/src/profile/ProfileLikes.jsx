import React, { useState, useEffect } from 'react';
// import { getLikedPosts } from '../../../services/userService';
import BlogCard from '../components/BlogCard';
import '../assets/profile.css';

const ProfileLikes = ({ userId }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLikedPosts = async () => {
      try {
        const data = await getLikedPosts(userId);
        setPosts(data);
      } catch (err) {
        setError('Failed to fetch liked posts');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedPosts();
  }, [userId]);

  if (loading) return <div className="loading">Loading liked posts...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="profile-likes">
      {posts.length === 0 ? (
        <div className="no-likes">
          <h3>No liked posts yet</h3>
          <p>Posts you like will appear here.</p>
        </div>
      ) : (
        <div className="liked-posts-grid">
          {posts.map(post => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileLikes;