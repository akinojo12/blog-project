import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/layout.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <Link to="/" className="logo">Substack</Link>
          <nav className="main-nav">
            <Link to="/home" className="nav-link">Home</Link>
            <Link to="/discover" className="nav-link">Discover</Link>
          </nav>
        </div>

        <div className="header-right">
          {currentUser ? (
            <>
              <Link to="/compose" className="nav-button">
                <span className="desktop-text">Write</span>
                <span className="mobile-text">+</span>
              </Link>
              <div className="user-dropdown">
                <button className="user-button">
                  <img 
                    src={currentUser.profilePicture || '/default-avatar.png'} 
                    alt={currentUser.name}
                    className="user-avatar"
                  />
                  <span className="user-name">{currentUser.name}</span>
                </button>
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">Profile</Link>
                  <Link to="/settings" className="dropdown-item">Settings</Link>
                  <button onClick={handleLogout} className="dropdown-item">Sign Out</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Sign In</Link>
              <Link to="/register" className="nav-button">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;