// client/src/context/AuthContext.js - 修正版
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

// 初期値を持ったコンテキストを作成
const AuthContext = createContext();

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
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };

  // 初期化時にトークンをセット
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setAuthToken(storedToken);
      setToken(storedToken);
    }
  }, []);

  // ユーザー情報の読み込み
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          console.log('Loading user data with token...');
          const res = await axios.get('/api/auth/me');
          console.log('User data loaded:', res.data);
          
          setUser(res.data.user);
          setIsAuthenticated(true);
          setError(null);
        } catch (err) {
          console.error('Failed to load user:', err);
          // トークンが無効な場合はクリア
          setAuthToken(null);
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          setError('認証の有効期限が切れています');
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // ユーザー登録
  const register = async (formData) => {
    try {
      console.log('Sending registration request...');
      setLoading(true);
      setError(null);
      
      const res = await axios.post('/api/auth/register', formData);
      console.log('Registration successful:', res.data);
      
      const { token: newToken, user: userData } = res.data;
      
      setAuthToken(newToken);
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      return res.data;
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = err.response?.data?.message || 'ユーザー登録に失敗しました';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ログイン
  const login = async (formData) => {
    try {
      console.log('Sending login request...');
      setLoading(true);
      setError(null);
      
      const res = await axios.post('/api/auth/login', formData);
      console.log('Login successful:', res.data);
      
      const { token: newToken, user: userData } = res.data;
      
      setAuthToken(newToken);
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      return res.data;
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 'ログインに失敗しました';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ログアウト
  const logout = () => {
    console.log('Logging out...');
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  // プロフィール更新
  const updateProfile = async (formData) => {
    try {
      console.log('Updating profile...');
      const res = await axios.put('/api/users/update', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUser(res.data.data);
      setError(null);
      return { success: true, data: res.data.data };
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMessage = err.response?.data?.message || 'プロフィール更新に失敗しました';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // パスワード更新
  const updatePassword = async (formData) => {
    try {
      console.log('Updating password...');
      const res = await axios.put('/api/users/update-password', formData);
      
      setError(null);
      return { success: true, data: res.data };
    } catch (err) {
      console.error('Password update error:', err);
      const errorMessage = err.response?.data?.message || 'パスワード更新に失敗しました';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // コンテキストで提供する値
  const value = {
    user,
    currentUser: user, // 他のコンポーネントとの互換性のため
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};