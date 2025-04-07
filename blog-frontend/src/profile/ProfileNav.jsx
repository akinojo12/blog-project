import React from 'react';
import { NavLink } from 'react-router-dom';
import '../assets/profile.css';

const ProfileNav = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="profile-nav">
      <ul className="profile-nav-list">
        <li className="profile-nav-item">
          <button
            className={`profile-nav-link ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
        </li>
        <li className="profile-nav-item">
          <button
            className={`profile-nav-link ${activeTab === 'likes' ? 'active' : ''}`}
            onClick={() => setActiveTab('likes')}
          >
            Likes
          </button>
        </li>
        <li className="profile-nav-item">
          <button
            className={`profile-nav-link ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default ProfileNav;