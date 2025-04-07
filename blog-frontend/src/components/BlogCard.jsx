import React from 'react';
import { Link } from 'react-router-dom';

import '../assets/blogcard.css'

const BlogCard = ({ post }) => {
  return (
    <article className="blog-card">
      <Link to={`/post/${post.slug}`} className="blog-card-link">
        {post.featuredImage && (
          <div className="blog-card-image">
            <img src={post.featuredImage.url} alt={post.title} />
          </div>
        )}
        <div className="blog-card-content">
          <h3 className="blog-card-title">{post.title}</h3>
          <p className="blog-card-excerpt">{post.excerpt}</p>
          <div className="blog-card-meta">
            <span className="blog-card-author">{post.author.name}</span>
            <span className="blog-card-date">{formatDate(post.createdAt)}</span>
          </div>
          <div className="blog-card-stats">
            <span>{post.likesCount} likes</span>
            <span>{post.commentsCount} comments</span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default BlogCard;