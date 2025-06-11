// client/src/pages/Register.js - 修正版
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './AuthPages.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 認証済みの場合はダッシュボードへリダイレクト
  useEffect(() => {
    console.log('Register component: checking authentication status', isAuthenticated);
    if (isAuthenticated) {
      console.log('User is already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const { username, email, password, password2 } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // 入力時にそのフィールドのエラーをクリア
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // ユーザー名チェック
    if (!username.trim()) {
      newErrors.username = 'ユーザー名を入力してください';
    } else if (username.length < 3) {
      newErrors.username = 'ユーザー名は3文字以上にしてください';
    }
    
    // メールアドレスチェック
    if (!email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = '有効なメールアドレスを入力してください';
      }
    }
    
    // パスワードチェック
    if (!password) {
      newErrors.password = 'パスワードを入力してください';
    } else if (password.length < 6) {
      newErrors.password = 'パスワードは6文字以上にしてください';
    }
    
    // パスワード確認チェック
    if (password !== password2) {
      newErrors.password2 = 'パスワードが一致しません';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // フォームバリデーション
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    console.log('Attempting registration with username:', username);

    try {
      const registerData = {
        username,
        email,
        password
      };
      
      console.log('Submitting registration data...');
      const result = await register(registerData);
      console.log('Registration result:', result);
      
      if (result.success) {
        toast.success('登録が完了しました！');
        console.log('Registration successful, navigating to dashboard');
        
        // 少し遅延させてから遷移（状態更新を確実にするため）
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      } else {
        console.error('Registration failed:', result.message);
        setErrors({ general: result.message });
        toast.error(result.message);
      }
    } catch (err) {
      console.error('Registration error:', err);
      
      // エラーメッセージの詳細な処理
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           '登録に失敗しました';
      
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
      
      // フィールド固有のエラーハンドリング
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>アカウント登録</h1>
        <p className="lead">
          <i className="fas fa-user"></i> 新しいアカウントを作成
        </p>
        
        {errors.general && (
          <div className="alert alert-danger">
            {errors.general}
          </div>
        )}
        
        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="username">ユーザー名</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={onChange}
              className={errors.username ? 'input-error' : ''}
              required
              disabled={loading}
            />
            {errors.username && <div className="form-error">{errors.username}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={onChange}
              className={errors.email ? 'input-error' : ''}
              required
              disabled={loading}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={onChange}
              className={errors.password ? 'input-error' : ''}
              minLength="6"
              required
              disabled={loading}
            />
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password2">パスワード（確認）</label>
            <input
              type="password"
              id="password2"
              name="password2"
              value={password2}
              onChange={onChange}
              className={errors.password2 ? 'input-error' : ''}
              minLength="6"
              required
              disabled={loading}
            />
            {errors.password2 && <div className="form-error">{errors.password2}</div>}
          </div>
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '登録中...' : '登録'}
          </button>
        </form>
        
        <p className="auth-redirect">
          既にアカウントをお持ちの場合は <Link to="/login">こちらからログイン</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;