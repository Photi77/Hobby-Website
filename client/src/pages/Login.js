import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './AuthPages.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 認証済みの場合はダッシュボードへリダイレクト
  useEffect(() => {
    console.log('Login component: checking authentication status', isAuthenticated);
    if (isAuthenticated) {
      console.log('User is already authenticated, redirecting to dashboard');
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const { email, password } = formData;

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
    
    if (!email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newErrors.email = '有効なメールアドレスを入力してください';
      }
    }
    
    if (!password.trim()) {
      newErrors.password = 'パスワードを入力してください';
    } else if (password.length < 6) {
      newErrors.password = 'パスワードは6文字以上である必要があります';
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
    console.log('Attempting login with email:', email);

    try {
      const result = await login(formData);
      console.log('Login result:', result);
      
      if (result.success) {
        toast.success('ログインしました！');
        console.log('Login successful, navigating to dashboard');
        
        // 少し遅延させてから遷移（状態更新を確実にするため）
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 100);
      } else {
        console.error('Login failed:', result.message);
        setErrors({ general: result.message });
        toast.error(result.message);
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || 
                           err.message || 
                           'ログインに失敗しました';
      
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>ログイン</h1>
        <p className="lead">
          <i className="fas fa-user"></i> アカウントにログイン
        </p>
        
        {errors.general && (
          <div className="alert alert-danger">
            {errors.general}
          </div>
        )}
        
        <form className="auth-form" onSubmit={onSubmit}>
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
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'ログイン中...' : 'ログイン'}
          </button>
        </form>
        
        <p className="auth-redirect">
          アカウントをお持ちでない場合は <Link to="/register">こちらから登録</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;