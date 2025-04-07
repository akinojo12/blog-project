import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/profile.css'

const ProfileHeader = ({ user, isCurrentUser, stats }) => {
  return (
    <div className="profile-header">
      <div className="profile-header-background"></div>
      
      <div className="profile-header-content">
        <div className="profile-avatar-container">
          <img 
            src={user.profilePicture || '/default-avatar.png'} 
            alt={user.name}
            className="profile-avatar"
          />
          {isCurrentUser && (
            <Link to="/settings" className="edit-profile-button">
              Edit Profile
            </Link>
          )}
        </div>
        
        <div className="profile-info">
          <h1 className="profile-name">{user.name}</h1>
          {user.bio && <p className="profile-bio">{user.bio}</p>}
          
          <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-number">{stats.postsCount}</span>
              <span className="stat-label">Posts</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.likesCount}</span>
              <span className="stat-label">Likes</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.followersCount}</span>
              <span className="stat-label">Followers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{stats.followingCount}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;