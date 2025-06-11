// client/src/components/layout/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-brand">
          趣味管理
        </Link>
        
        <ul className="navbar-nav">
          {isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/dashboard" className="nav-link">ダッシュボード</Link>
              </li>
              <li className="nav-item">
                <Link to="/hobbies" className="nav-link">趣味一覧</Link>
              </li>
              <li className="nav-item">
                <Link to="/tools" className="nav-link">道具一覧</Link>
              </li>
              <li className="nav-item dropdown">
                <div className="nav-link dropdown-toggle">
                  <img 
                    src={currentUser?.profilePicture || '/default-profile.jpg'} 
                    alt={currentUser?.username}
                    className="profile-image-small"
                  />
                  <span>{currentUser?.username}</span>
                </div>
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">プロフィール</Link>
                  <button onClick={handleLogout} className="dropdown-item">ログアウト</button>
                </div>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">ログイン</Link>
              </li>
              <li className="nav-item">
                <Link to="/register" className="nav-link">ユーザー登録</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;