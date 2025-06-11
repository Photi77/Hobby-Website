
// client/src/pages/Home.js
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicHobbies } from '../services/hobbyService';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import './Home.css';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [hobbies, setHobbies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicHobbies = async () => {
      try {
        setLoading(true);
        const result = await getPublicHobbies();
        
        if (result.success) {
          setHobbies(result.data);
        }
      } catch (err) {
        console.error('趣味データ取得エラー:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchPublicHobbies();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-content">
          <h1>趣味管理アプリケーション</h1>
          <p>あなたの趣味と道具を管理し、他のユーザーと共有しましょう。</p>
          
          {!isAuthenticated ? (
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary">
                ユーザー登録
              </Link>
              <Link to="/login" className="btn btn-secondary">
                ログイン
              </Link>
            </div>
          ) : (
            <div className="hero-buttons">
              <Link to="/dashboard" className="btn btn-primary">
                ダッシュボードへ
              </Link>
              <Link to="/hobbies/add" className="btn btn-secondary">
                趣味を追加
              </Link>
            </div>
          )}
        </div>
      </div>
      
      {isAuthenticated && (
        <div className="featured-hobbies">
          <h2>公開されている趣味</h2>
          
          {loading ? (
            <Spinner />
          ) : hobbies.length > 0 ? (
            <div className="hobby-cards">
              {hobbies.slice(0, 6).map(hobby => (
                <div key={hobby._id} className="featured-hobby-card">
                  <h3>{hobby.name}</h3>
                  <div className="hobby-card-category">{hobby.category}</div>
                  <p>{hobby.description.substring(0, 120)}...</p>
                  
                  <div className="hobby-card-footer">
                    <div className="hobby-owner">
                      <img 
                        src={hobby.user?.profilePicture || '/default-profile.jpg'} 
                        alt={hobby.user?.username} 
                        className="profile-image-tiny"
                      />
                      <span>{hobby.user?.username}</span>
                    </div>
                    
                    <Link to={`/hobbies/${hobby._id}`} className="btn btn-outline">
                      詳細
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-hobbies">公開されている趣味はまだありません</p>
          )}
          
          <div className="view-all">
            <Link to="/hobbies" className="btn btn-secondary">
              すべての趣味を見る
            </Link>
          </div>
        </div>
      )}
      
      <div className="features-section">
        <h2>主な機能</h2>
        
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">📋</div>
            <h3>趣味の管理</h3>
            <p>あなたの趣味を簡単に管理できます。カテゴリー分けして整理しましょう。</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🛠️</div>
            <h3>道具の管理</h3>
            <p>趣味に関連する道具を記録。購入日、価格、状態などを記録できます。</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>趣味の発見</h3>
            <p>他のユーザーの趣味や道具を閲覧して、新しい趣味の発見に役立てましょう。</p>
          </div>
          
          <div className="feature-card">
            <div className="feature-icon">🔒</div>
            <h3>プライバシー設定</h3>
            <p>趣味や道具ごとに公開/非公開を設定できます。あなたのプライバシーを守ります。</p>
          </div>
        </div>
      </div>
      
      <div className="cta-section">
        <h2>今すぐ始めましょう</h2>
        <p>無料で簡単に趣味と道具を管理できます。</p>
        
        {!isAuthenticated ? (
          <Link to="/register" className="btn btn-primary">
            ユーザー登録
          </Link>
        ) : (
          <Link to="/dashboard" className="btn btn-primary">
            ダッシュボードへ
          </Link>
        )}
      </div>
    </div>
  );
};

export default Home;
