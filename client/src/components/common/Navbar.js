// client/src/components/common/Navbar.js - 修正版
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <i className="fas fa-star"></i>
          趣味管理
        </Link>
        
        <button className="navbar-toggle" onClick={toggleMenu}>
          <i className={`fas ${isMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
        </button>
        
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {isAuthenticated ? (
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  <i className="fas fa-tachometer-alt"></i>
                  ダッシュボード
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/hobbies" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  <i className="fas fa-heart"></i>
                  趣味一覧
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/tools" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  <i className="fas fa-tools"></i>
                  道具一覧
                </Link>
              </li>
              <li className="nav-item navbar-dropdown">
                <div className="nav-link">
                  <img 
                    src={user?.profilePicture || '/default-profile.jpg'} 
                    alt={user?.username || 'Profile'}
                    className="navbar-avatar"
                  />
                  <span>{user?.username || 'ユーザー'}</span>
                  <i className="fas fa-chevron-down"></i>
                </div>
                <div className="navbar-dropdown-content">
                  <Link to="/profile" className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                    <i className="fas fa-user"></i>
                    プロフィール
                  </Link>
                  <div className="navbar-dropdown-divider"></div>
                  <button onClick={handleLogout} className="dropdown-item">
                    <i className="fas fa-sign-out-alt"></i>
                    ログアウト
                  </button>
                </div>
              </li>
            </ul>
          ) : (
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link to="/login" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  <i className="fas fa-sign-in-alt"></i>
                  ログイン
                </Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link" onClick={() => setIsMenuOpen(false)}>
                  <i className="fas fa-user-plus"></i>
                  ユーザー登録
                </Link>
              </li>
            </ul>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;