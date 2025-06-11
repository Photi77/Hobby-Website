import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    bio: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || ''
      });
      
      // プロフィール画像のプレビューを設定
      if (user.profilePicture) {
        // フルURLかパス形式かを判定
        const imageUrl = user.profilePicture.startsWith('http') 
          ? user.profilePicture 
          : `http://localhost:5000${user.profilePicture}`;
        setProfilePreview(imageUrl);
      }
    }
  }, [user]);

  const handleProfileChange = e => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    
    // フィールドの変更時にエラーをクリア
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handlePasswordChange = e => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    
    // フィールドの変更時にエラーをクリア
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      // ファイルサイズチェック（2MB制限）
      if (file.size > 2 * 1024 * 1024) {
        toast.error('画像ファイルは2MB以下にしてください');
        return;
      }

      // ファイル形式チェック
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('JPEG、PNG、またはWEBP形式の画像を選択してください');
        return;
      }

      setProfileImage(file);
      
      // 画像プレビューを作成
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const validateProfileForm = () => {
    const newErrors = {};
    
    // ユーザー名のバリデーション
    if (!profileData.username.trim()) {
      newErrors.username = 'ユーザー名を入力してください';
    } else if (profileData.username.length < 3) {
      newErrors.username = 'ユーザー名は3文字以上である必要があります';
    }
    
    // メールアドレスのバリデーション
    if (!profileData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        newErrors.email = '有効なメールアドレスを入力してください';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    // 現在のパスワードのバリデーション
    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = '現在のパスワードを入力してください';
    }
    
    // 新しいパスワードのバリデーション
    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = '新しいパスワードを入力してください';
    } else if (passwordData.newPassword.length < 6) {
      newErrors.newPassword = '新しいパスワードは6文字以上である必要があります';
    }
    
    // パスワード確認のバリデーション
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'パスワードが一致しません';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async e => {
    e.preventDefault();
    
    // フォームのバリデーション
    if (!validateProfileForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // FormDataを作成
      const formData = new FormData();
      formData.append('username', profileData.username);
      formData.append('email', profileData.email);
      formData.append('bio', profileData.bio);
      
      // プロフィール画像が選択されている場合は追加
      if (profileImage) {
        formData.append('profilePicture', profileImage);
      }
      
      console.log('Submitting profile update...');
      const result = await updateProfile(formData);
      
      if (result.success) {
        toast.success('プロフィールが更新されました');
        // 画像選択状態をリセット
        setProfileImage(null);
      } else {
        setErrors({ general: result.message });
        toast.error(result.message);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      setErrors({ general: 'プロフィール更新中にエラーが発生しました' });
      toast.error('プロフィール更新中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async e => {
    e.preventDefault();
    
    // フォームのバリデーション
    if (!validatePasswordForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await updatePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      if (result.success) {
        toast.success('パスワードが更新されました');
        // パスワードフォームをリセット
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setErrors({ general: result.message });
        toast.error(result.message);
      }
    } catch (err) {
      console.error('Password update error:', err);
      setErrors({ general: 'パスワード更新中にエラーが発生しました' });
      toast.error('パスワード更新中にエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <Spinner text="ユーザー情報を読み込み中..." />;
  }

  return (
    <div className="profile-container">
      <h1>プロフィール設定</h1>
      
      <div className="profile-tabs">
        <button 
          className={`profile-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          プロフィール
        </button>
        <button 
          className={`profile-tab ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          パスワード変更
        </button>
      </div>
      
      {errors.general && <Alert type="danger" message={errors.general} />}
      
      <div className="profile-content">
        {activeTab === 'profile' ? (
          <div className="profile-tab-content">
            <div className="profile-image-upload">
              <div className="profile-image-preview">
                {profilePreview ? (
                  <img 
                    src={profilePreview} 
                    alt="プロフィール画像"
                  />
                ) : (
                  <div className="profile-image-placeholder">
                    <i className="fas fa-user"></i>
                  </div>
                )}
              </div>
              <div className="profile-image-actions">
                <button type="button" className="btn btn-secondary" onClick={triggerFileInput}>
                  画像を変更
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  style={{ display: 'none' }}
                />
              </div>
              <small className="form-text">
                JPEG、PNG、WEBP形式（最大2MB）
              </small>
            </div>
            
            <form className="profile-form" onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label htmlFor="username">ユーザー名</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  className={errors.username ? 'input-error' : ''}
                  required
                />
                {errors.username && <div className="form-error">{errors.username}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">メールアドレス</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className={errors.email ? 'input-error' : ''}
                  required
                />
                {errors.email && <div className="form-error">{errors.email}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="bio">自己紹介</label>
                <textarea
                  id="bio"
                  name="bio"
                  value={profileData.bio}
                  onChange={handleProfileChange}
                  rows="4"
                  placeholder="自己紹介を入力してください..."
                />
                <small className="form-text">
                  趣味や興味について書いてみましょう
                </small>
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '更新中...' : 'プロフィールを更新'}
              </button>
            </form>
          </div>
        ) : (
          <div className="password-tab-content">
            <form className="password-form" onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label htmlFor="currentPassword">現在のパスワード</label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className={errors.currentPassword ? 'input-error' : ''}
                  required
                />
                {errors.currentPassword && <div className="form-error">{errors.currentPassword}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="newPassword">新しいパスワード</label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className={errors.newPassword ? 'input-error' : ''}
                  required
                />
                {errors.newPassword && <div className="form-error">{errors.newPassword}</div>}
                <small className="form-text">
                  6文字以上で入力してください
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">新しいパスワード（確認）</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className={errors.confirmPassword ? 'input-error' : ''}
                  required
                />
                {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
              </div>
              
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? '更新中...' : 'パスワードを更新'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;