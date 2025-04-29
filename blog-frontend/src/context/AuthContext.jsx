import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  const fetchUserData = useCallback(async (authToken) => {
    if (!authToken || typeof authToken !== 'string') {
      console.error('fetchUserData: Invalid token:', authToken);
      throw new Error('Invalid token');
    }

    try {
      setAuthLoading(true);
      setAuthError('');
      const cleanToken = authToken.trim();
      const decoded = jwtDecode(cleanToken);
      console.log('fetchUserData: Decoded token:', decoded);
      const currentTime = Date.now() / 1000;
      if (decoded.exp < currentTime) {
        console.warn('fetchUserData: Token expired');
        throw new Error('Token expired');
      }
      if (!decoded.id || !isValidObjectId(decoded.id)) {
        console.error('fetchUserData: Invalid user ID in token:', decoded.id);
        throw new Error('Invalid user ID in token');
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${cleanToken}` },
      });
      const userData = response.data;
      if (!userData._id || !isValidObjectId(userData._id)) {
        console.error('fetchUserData: Invalid user ID from server:', userData._id);
        throw new Error('Invalid user ID from server');
      }
      console.log('fetchUserData: Fetched user data:', userData);

      const formattedUser = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        bio: userData.bio || '',
        profilePicture: userData.profilePicture || null,
        isAdmin: userData.isAdmin || false,
        followers: userData.followers || [],
        following: userData.following || [],
      };
      setUser(formattedUser);
      setToken(cleanToken);
      localStorage.setItem('user', JSON.stringify(formattedUser));
      localStorage.setItem('token', cleanToken);
    } catch (error) {
      console.error('fetchUserData: Error fetching user data:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      if (error.message === 'Token expired' || error.message === 'Invalid user ID in token' || error.response?.status === 401 || error.response?.data?.message === 'Invalid user ID') {
        console.log('fetchUserData: Logging out due to token issue');
        logout();
        setAuthError(error.response?.data?.message || error.message || 'Authentication failed. Please log in again.');
      } else {
        setAuthError('Failed to authenticate user. Please try again.');
      }
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      console.log('AuthContext: Initial localStorage - token:', storedToken ? storedToken.substring(0, 10) + '...' : 'No token');
      console.log('AuthContext: Initial localStorage - user:', storedUser);

      if (storedToken && storedUser) {
        try {
          const decoded = jwtDecode(storedToken);
          console.log('AuthContext: Decoded token on init:', decoded);
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            console.warn('AuthContext: Token expired on init');
            logout();
            setAuthError('Session expired. Please log in again.');
            return;
          }
          if (!decoded.id || !isValidObjectId(decoded.id)) {
            console.error('AuthContext: Invalid user ID in stored token:', decoded.id);
            logout();
            setAuthError('Invalid user profile. Please log in again.');
            return;
          }

          const userData = JSON.parse(storedUser);
          if (!userData || !userData._id || !isValidObjectId(userData._id)) {
            console.error('AuthContext: Invalid stored user ID on init:', userData?._id);
            logout();
            setAuthError('Invalid user profile. Please log in again.');
            return;
          }

          setUser(userData);
          setToken(storedToken);
          
          await fetchUserData(storedToken);
        } catch (error) {
          console.error('AuthContext: Error initializing auth:', {
            message: error.message,
            status: error.response?.status,
            response: error.response?.data,
          });
          logout();
          setAuthError('Failed to initialize session. Please log in again.');
        }
      } else {
        console.log('AuthContext: No stored token or user found');
        setUser(null);
        setToken(null);
        setAuthLoading(false);
      }
    };

    initializeAuth();
  }, [fetchUserData]);

  const login = async (userData, authToken) => {
    if (!authToken || !userData || !userData._id || !isValidObjectId(userData._id)) {
      console.error('login: Invalid login data:', { userData, authToken });
      throw new Error('Invalid user data or token');
    }
    try {
      setAuthLoading(true);
      setAuthError('');
      const decoded = jwtDecode(authToken);
      console.log('login: Decoded token:', decoded);
      if (!decoded.id || !isValidObjectId(decoded.id)) {
        console.error('login: Invalid user ID in token:', decoded.id);
        throw new Error('Invalid user ID in token');
      }
      const formattedUser = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        bio: userData.bio || '',
        profilePicture: userData.profilePicture || null,
        isAdmin: userData.isAdmin || false,
        followers: userData.followers || [],
        following: userData.following || [],
      };
      setUser(formattedUser);
      setToken(authToken);
      localStorage.setItem('user', JSON.stringify(formattedUser));
      localStorage.setItem('token', authToken);
      console.log('login: User and token set:', { user: formattedUser, token: authToken });
    } catch (error) {
      console.error('login: Login error:', {
        message: error.message,
        status: error.response?.status,
        response: error.response?.data,
      });
      setAuthError(error.message || 'Login failed');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (userData, authToken) => {
    if (!authToken || !userData || !userData._id || !isValidObjectId(userData._id)) {
      console.error('register: Invalid register data:', { userData, authToken });
      throw new Error('Invalid user data or token');
    }
    try {
      setAuthLoading(true);
      setAuthError('');
      const decoded = jwtDecode(authToken);
      console.log('register: Decoded token:', decoded);
      if (!decoded.id || !isValidObjectId(decoded.id)) {
        console.error('register: Invalid user ID in token:', decoded.id);
        throw new Error('Invalid user ID in token');
      }
      const formattedUser = {
        _id: userData._id,
        name: userData.name,
        email: userData.email,
        bio: userData.bio || '',
        profilePicture: userData.profilePicture || null,
        isAdmin: userData.isAdmin || false,
        followers: userData.followers || [],
        following: userData.following || [],
      };
      setUser(formattedUser);
      setToken(authToken);
      localStorage.setItem('user', JSON.stringify(formattedUser));
      localStorage.setItem('token', authToken);
      console.log('register: User and token set:', { user: formattedUser, token: authToken });
    } catch (error) {
      console.error('register: Register error:', {
        message: error.message,
        status: error.response?.status,
        response: error.response?.data,
      });
      setAuthError(error.message || 'Registration failed');
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = () => {
    console.log('logout: Clearing auth state', { user, token });
    setUser(null);
    setToken(null);
    setAuthError('');
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    console.log('logout: Auth state cleared');
  };

  const updateUser = (updatedUserData) => {
    if (!updatedUserData || !updatedUserData._id || !isValidObjectId(updatedUserData._id)) {
      console.error('updateUser: Invalid user ID:', updatedUserData?._id);
      return;
    }
    const mergedUser = {
      ...user,
      ...updatedUserData,
      followers: updatedUserData.followers || user?.followers || [],
      following: updatedUserData.following || user?.following || [],
    };
    setUser(mergedUser);
    localStorage.setItem('user', JSON.stringify(mergedUser));
    console.log('updateUser: User updated:', mergedUser);
  };

  const getToken = () => {
    console.log('getToken: Returning token:', token ? token.substring(0, 10) + '...' : 'No token');
    return token;
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, register, login, logout, getToken, authLoading, authError, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;