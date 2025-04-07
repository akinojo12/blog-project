import React from 'react';
// import { formatDate } from '../../../utils/helpers';
import '../assets/profile.css';

const ProfileAbout = ({ user }) => {
  return (
    <div className="profile-about">
      <div className="about-section">
        <h3 className="about-title">About</h3>
        <p className="about-bio">{user.bio || 'No bio yet.'}</p>
      </div>
      
      <div className="about-details">
        <div className="detail-item">
          <span className="detail-label">Joined</span>
          <span className="detail-value">
            {formatDate(user.createdAt)}
          </span>
        </div>
        
        {user.location && (
          <div className="detail-item">
            <span className="detail-label">Location</span>
            <span className="detail-value">{user.location}</span>
          </div>
        )}
        
        {user.website && (
          <div className="detail-item">
            <span className="detail-label">Website</span>
            <a 
              href={user.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="detail-value link"
            >
              {user.website.replace(/(^\w+:|^)\/\//, '')}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileAbout;