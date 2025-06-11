// client/src/context/AuthContext.js の修正部分
import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// 初期値を持ったコンテキストを作成
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
  
  const navigate = useNavigate();

  // リクエストヘッダーにトークンをセット
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  // ユーザー情報の読み込み
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        setAuthToken(token);
        try {
          console.log('Loading user data with token...');
          const res = await axios.get('/api/auth/me');
          console.log('User data loaded:', res.data);
          setUser(res.data.user);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Failed to load user:', err);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('No token found, skipping user load');
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // API URL の設定
  useEffect(() => {
    // 開発環境で、APIのベースURLが設定されていない場合はセット
    if (process.env.NODE_ENV === 'development') {
      axios.defaults.baseURL = 'http://localhost:3000';
    }
  }, []);

  // ユーザー登録
  const register = async (formData) => {
    try {
      console.log('Sending registration request to API...');
      // API リクエストの詳細をログ
      console.log('Request URL:', axios.defaults.baseURL + '/api/auth/register');
      console.log('Request data:', formData);
      
      const res = await axios.post('/api/auth/register', formData);
      console.log('Registration API response:', res.data);
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
      return res.data;
    } catch (err) {
      console.error('Registration API error:', err);
      // エラーの詳細をログ
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      
      setError(err.response?.data?.message || 'ユーザー登録に失敗しました');
      throw err;
    }
  };

  // ログイン
  const login = async (formData) => {
    try {
      console.log('Sending login request to API...');
      const res = await axios.post('/api/auth/login', formData);
      console.log('Login API response:', res.data);
      
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
      setIsAuthenticated(true);
      setError(null);
      return res.data;
    } catch (err) {
      console.error('Login API error:', err);
      setError(err.response?.data?.message || 'ログインに失敗しました');
      throw err;
    }
  };

  // 他のメソッドは省略...

  // コンテキストで提供する値
  const value = {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    register,
    login,
    logout: () => {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    },
    updateProfile: async (formData) => {
      try {
        const res = await axios.put('/api/users/update', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        setUser(res.data.data);
        setError(null);
        return res.data;
      } catch (err) {
        setError(err.response?.data?.message || 'プロフィール更新に失敗しました');
        throw err;
      }
    },
    updatePassword: async (formData) => {
      try {
        const res = await axios.put('/api/users/update-password', formData);
        setError(null);
        return res.data;
      } catch (err) {
        setError(err.response?.data?.message || 'パスワード更新に失敗しました');
        throw err;
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};