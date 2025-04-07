import React from 'react';
import BlogCard from '../components/BlogCard';
import '../assets/profile.css';

const ProfilePosts = ({ posts }) => {
  return (
    <div className="profile-posts">
      {posts.length === 0 ? (
        <div className="no-posts">
          <h3>No posts yet</h3>
          <p>When you create posts, they'll appear here.</p>
        </div>
      ) : (
        <div className="posts-grid">
          {posts.map(post => (
            <BlogCard key={post._id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfilePosts;