import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../assets/profile.css'
import ProfileAbout from '../profile/ProfileAbout';
import ProfileHeader from '../profile/ProfileHeader';
import ProfileLikes from '../profile/ProfileLikes';
import ProfilePosts from '../profile/ProfilePosts';
import ProfileNav from '../profile/ProfileNav';
// import { getUserById, getUserPosts } from '../../../services/userService';


const ProfilePage = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    postsCount: 0,
    likesCount: 0,
    followersCount: 0,
    followingCount: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getUserById(id || currentUser._id);
        setUser(userData);
        
        const postsData = await getUserPosts(id || currentUser._id);
        setPosts(postsData);
        
        // Calculate stats
        const postsCount = postsData.length;
        const likesCount = postsData.reduce((acc, post) => acc + post.likesCount, 0);
        
        setStats({
          postsCount,
          likesCount,
          followersCount: userData.followers?.length || 0,
          followingCount: userData.following?.length || 0
        });
      } catch (err) {
        setError('Failed to fetch profile data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, currentUser]);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        return <ProfilePosts posts={posts} />;
      case 'likes':
        return <ProfileLikes userId={user._id} />;
      case 'about':
        return <ProfileAbout user={user} />;
      default:
        return <ProfilePosts posts={posts} />;
    }
  };

  if (loading) return <div className="profile-loading">Loading profile...</div>;
  if (error) return <div className="profile-error">{error}</div>;
  if (!user) return <div className="profile-not-found">User not found</div>;

  return (
    <div className="profile-page">
      <ProfileHeader 
        user={user} 
        isCurrentUser={!id || id === currentUser._id} 
        stats={stats}
      />
      
      <div className="profile-container">
        <ProfileNav activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="profile-content">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;