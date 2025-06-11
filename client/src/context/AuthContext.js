// client/src/context/AuthContext.js - 改良版
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  register: () => {},
  login: () => {},
  logout: () => {},
  updateProfile: () => {},
  updatePassword: () => {}
});

export function useAuth() {
  return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // リクエストヘッダーにトークンをセット
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('Auth token set in axios headers');
    } else {
      delete axios.defaults.headers.common['Authorization'];
      console.log('Auth token removed from axios headers');
    }
  };

  // ユーザー情報の読み込み
  useEffect(() => {
    const loadUser = async () => {
      console.log('AuthContext: Starting user load process');
      console.log('AuthContext: Token from localStorage:', token ? 'exists' : 'not found');
      
      if (token) {
        setAuthToken(token);
        try {
          console.log('AuthContext: Loading user data with token...');
          const res = await axios.get('/api/auth/me');
          console.log('AuthContext: User data loaded successfully:', res.data.user?.username);
          
          setUser(res.data.user);
          setIsAuthenticated(true);
          setError(null);
          console.log('AuthContext: User authentication state updated to true');
        } catch (err) {
          console.error('AuthContext: Failed to load user:', err);
          console.log('AuthContext: Clearing invalid token');
          
          // 無効なトークンの場合はクリア
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setAuthToken(null);
        }
      } else {
        console.log('AuthContext: No token found, user not authenticated');
        setIsAuthenticated(false);
        setUser(null);
      }
      
      setLoading(false);
      console.log('AuthContext: Initial authentication check completed');
    };

    loadUser();
  }, [token]);

  // API URL の設定
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      axios.defaults.baseURL = 'http://localhost:3000';
      console.log('AuthContext: Development mode - API base URL set to localhost:3000');
    }
  }, []);

  // ユーザー登録
  const register = async (formData) => {
    try {
      console.log('AuthContext: Sending registration request...');
      setError(null);
      
      const res = await axios.post('/api/auth/register', formData);
      console.log('AuthContext: Registration successful');
      
      const { token: newToken, user: newUser } = res.data;
      
      // トークンと認証状態を更新
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setAuthToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      
      console.log('AuthContext: User registered and authenticated:', newUser.username);
      return { success: true, data: res.data };
    } catch (err) {
      console.error('AuthContext: Registration error:', err);
      const errorMessage = err.response?.data?.message || 'ユーザー登録に失敗しました';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // ログイン
  const login = async (formData) => {
    try {
      console.log('AuthContext: Sending login request...');
      setError(null);
      
      const res = await axios.post('/api/auth/login', formData);
      console.log('AuthContext: Login API response received');
      
      const { token: newToken, user: newUser } = res.data;
      
      // トークンと認証状態を更新
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setAuthToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
      
      console.log('AuthContext: User logged in and authenticated:', newUser.username);
      console.log('AuthContext: isAuthenticated set to true');
      
      return { success: true, data: res.data };
    } catch (err) {
      console.error('AuthContext: Login error:', err);
      const errorMessage = err.response?.data?.message || 'ログインに失敗しました';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // ログアウト
  const logout = () => {
    console.log('AuthContext: Logging out user');
    
    localStorage.removeItem('token');
    setToken(null);
    setAuthToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    
    console.log('AuthContext: User logged out, isAuthenticated set to false');
  };

  // プロフィール更新
  const updateProfile = async (formData) => {
    try {
      console.log('AuthContext: Sending profile update request...');
      
      const res = await axios.put('/api/users/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('AuthContext: Profile update successful');
      
      // ユーザー情報を更新
      setUser(res.data.data);
      setError(null);
      
      return { success: true, data: res.data };
    } catch (err) {
      console.error('AuthContext: Profile update error:', err);
      const errorMessage = err.response?.data?.message || 'プロフィール更新に失敗しました';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // パスワード更新
  const updatePassword = async (passwordData) => {
    try {
      console.log('AuthContext: Sending password update request...');
      
      const res = await axios.put('/api/users/update-password', passwordData);
      
      console.log('AuthContext: Password update successful');
      setError(null);
      
      return { success: true, data: res.data };
    } catch (err) {
      console.error('AuthContext: Password update error:', err);
      const errorMessage = err.response?.data?.message || 'パスワード更新に失敗しました';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // デバッグ用のuseEffect
  useEffect(() => {
    console.log('AuthContext: Authentication state changed:', {
      isAuthenticated,
      user: user?.username || 'No user',
      loading
    });
  }, [isAuthenticated, user, loading]);

  // コンテキストで提供する値
  const value = {
    user,
    currentUser: user, // Profile.jsで使用されているプロパティ名に対応
    token,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};