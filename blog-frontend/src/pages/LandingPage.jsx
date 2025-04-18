import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/landing.css'

const LandingPage = () => {
  return (
    <div className="landing-container">
      <header className="landing-header">
        <nav className="landing-nav">
          <div className="landing-logo">My Blog</div>
          <div className="landing-nav-links">
            <Link to="/login" className="landing-nav-link">Sign In</Link>
            <Link to="/register" className="landing-nav-btn">Get started</Link>
          </div>
        </nav>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <h1 className="landing-title">Start writing, sharing, and connecting with readers</h1>
          <p className="landing-subtitle">Your words matter. Publish on a beautiful, distraction-free platform.</p>
          <Link to="/register" className="landing-cta">Start writing for free</Link>
        </section>

        <section className="landing-features">
          <div className="feature-card">
            <h3>Simple publishing</h3>
            <p>Focus on your writing with our clean, intuitive editor.</p>
          </div>
          <div className="feature-card">
            <h3>Built-in audience</h3>
            <p>Reach readers who care about what you have to say.</p>
          </div>
          <div className="feature-card">
            <h3>Grow your community</h3>
            <p>Connect with subscribers through comments and discussions.</p>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <p>© {new Date().getFullYear()} SubStack Clone. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;