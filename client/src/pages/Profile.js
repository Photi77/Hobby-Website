// client/src/pages/Profile.js
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import FormGroup from '../components/common/FormGroup';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';
import { toast } from 'react-toastify';
import './Profile.css';

const Profile = () => {
  const { currentUser, updateProfile, updatePassword } = useAuth();
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
    if (currentUser) {
      setProfileData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        bio: currentUser.bio || ''
      });
      
      // プロフィール画像のプレビューを設定
      if (currentUser.profilePicture) {
        setProfilePreview(currentUser.profilePicture);
      }
    }
  }, [currentUser]);

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
    if (profileData.username.length < 3) {
      newErrors.username = 'ユーザー名は3文字以上である必要があります';
    }
    
    // メールアドレスのバリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = () => {
    const newErrors = {};
    
    // 現在のパスワードのバリデーション
    if (passwordData.currentPassword.length < 1) {
      newErrors.currentPassword = '現在のパスワードを入力してください';
    }
    
    // 新しいパスワードのバリデーション
    if (passwordData.newPassword.length < 6) {
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
      
      const result = await updateProfile(formData);
      
      if (result.success) {
        toast.success('プロフィールが更新されました');
      } else {
        setErrors({ general: result.message });
      }
    } catch (err) {
      setErrors({ general: 'プロフィール更新中にエラーが発生しました' });
      console.error(err);
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
      }
    } catch (err) {
      setErrors({ general: 'パスワード更新中にエラーが発生しました' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="profile-container">
      <h1>プロフィール設定</h1>
      
      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          プロフィール
        </button>
        <button 
          className={`tab-button ${activeTab === 'password' ? 'active' : ''}`}
          onClick={() => setActiveTab('password')}
        >
          パスワード変更
        </button>
      </div>
      
      {errors.general && <Alert type="danger" message={errors.general} />}
      
      {activeTab === 'profile' ? (
        <div className="profile-tab-content">
          <div className="profile-image-section">
            <div className="profile-image-container">
              <img 
                src={profilePreview || currentUser?.profilePicture || '/default-profile.jpg'} 
                alt={currentUser?.username}
                className="profile-image"
              />
              <button type="button" className="change-image-button" onClick={triggerFileInput}>
                画像を変更
              </button>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden-file-input"
              />
            </div>
          </div>
          
          <form onSubmit={handleProfileSubmit}>
            <FormGroup label="ユーザー名" id="username" error={errors.username}>
              <input
                type="text"
                id="username"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                required
              />
            </FormGroup>
            
            <FormGroup label="メールアドレス" id="email" error={errors.email}>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                required
              />
            </FormGroup>
            
            <FormGroup label="自己紹介" id="bio">
              <textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                onChange={handleProfileChange}
                rows="4"
              />
            </FormGroup>
            
            <button type="submit" className="btn btn-primary">
              プロフィールを更新
            </button>
          </form>
        </div>
      ) : (
        <div className="password-tab-content">
          <form onSubmit={handlePasswordSubmit}>
            <FormGroup label="現在のパスワード" id="currentPassword" error={errors.currentPassword}>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </FormGroup>
            
            <FormGroup label="新しいパスワード" id="newPassword" error={errors.newPassword}>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </FormGroup>
            
            <FormGroup label="新しいパスワード（確認）" id="confirmPassword" error={errors.confirmPassword}>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </FormGroup>
            
            <button type="submit" className="btn btn-primary">
              パスワードを更新
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
