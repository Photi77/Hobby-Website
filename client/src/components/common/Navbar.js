// client/src/components/common/Navbar.js - 改良版
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Navbar: Logout clicked');
    logout();
    navigate('/login');
  };

  // ローディング中は何も表示しない（フラッシュを防ぐため）
  if (loading) {
    return (
      <nav className="navbar">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <i className="fas fa-heart"></i> 趣味管理
          </Link>
          <div className="navbar-nav">
            <div className="nav-item">読み込み中...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          <i className="fas fa-heart"></i> 趣味管理
        </Link>
        
        <ul className="navbar-nav">
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link">
                  <i className="fas fa-tachometer-alt"></i> ダッシュボード
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/hobbies" className="nav-link">
                  <i className="fas fa-list"></i> 趣味一覧
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/tools" className="nav-link">
                  <i className="fas fa-tools"></i> 道具一覧
                </Link>
              </li>
              <li className="nav-item navbar-dropdown">
                <div className="nav-link">
                  {user?.profilePicture && (
                    <img 
                      src={user.profilePicture.startsWith('http') ? user.profilePicture : `http://localhost:5000${user.profilePicture}`} 
                      alt={user?.username}
                      className="navbar-avatar"
                    />
                  )}
                  <span>{user?.username}</span>
                  <i className="fas fa-chevron-down"></i>
                </div>
                <div className="navbar-dropdown-content">
                  <Link to="/profile" className="dropdown-item">
                    <i className="fas fa-user"></i> プロフィール
                  </Link>
                  <div className="navbar-dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item">
                    <i className="fas fa-sign-out-alt"></i> ログアウト
                  </button>
                </div>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">
                  <i className="fas fa-sign-in-alt"></i> ログイン
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">
                  <i className="fas fa-user-plus"></i> ユーザー登録
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;