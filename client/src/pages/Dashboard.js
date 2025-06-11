
// client/src/pages/Dashboard.js
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyHobbies } from '../services/hobbyService';
import { getMyTools } from '../services/toolService';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import './Dashboard.css';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [hobbies, setHobbies] = useState([]);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 趣味データの取得
        const hobbiesResult = await getMyHobbies();
        if (hobbiesResult.success) {
          setHobbies(hobbiesResult.data);
        } else {
          setError(hobbiesResult.message);
        }
        
        // 道具データの取得
        const toolsResult = await getMyTools();
        if (toolsResult.success) {
          setTools(toolsResult.data);
        } else {
          setError(toolsResult.message);
        }
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('データの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>ダッシュボード</h1>
        <div className="user-welcome">
          <img 
            src={currentUser?.profilePicture || '/default-profile.jpg'} 
            alt={currentUser?.username}
            className="profile-image-medium"
          />
          <div>
            <h2>ようこそ、{currentUser?.username} さん</h2>
            <p>{currentUser?.bio || 'プロフィールの自己紹介が表示されます'}</p>
          </div>
        </div>
      </div>
      
      {error && <Alert type="danger" message={error} />}
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>趣味</h3>
          <p className="stat-number">{hobbies.length}</p>
          <Link to="/hobbies/add" className="btn btn-primary">
            趣味を追加
          </Link>
        </div>
        
        <div className="stat-card">
          <h3>道具</h3>
          <p className="stat-number">{tools.length}</p>
          <Link to="/tools/add" className="btn btn-primary">
            道具を追加
          </Link>
        </div>
      </div>
      
      <div className="dashboard-recent">
        <div className="recent-section">
          <div className="section-header">
            <h3>最近の趣味</h3>
            <Link to="/hobbies" className="view-all-link">
              すべて表示
            </Link>
          </div>
          
          {hobbies.length > 0 ? (
            <div className="recent-items">
              {hobbies.slice(0, 3).map(hobby => (
                <div key={hobby._id} className="recent-item">
                  <h4>{hobby.name}</h4>
                  <p className="item-category">{hobby.category}</p>
                  <p className="item-description">{hobby.description.substring(0, 100)}...</p>
                  <Link to={`/hobbies/${hobby._id}`} className="btn btn-secondary">
                    詳細を見る
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-items">趣味がまだ登録されていません</p>
          )}
        </div>
        
        <div className="recent-section">
          <div className="section-header">
            <h3>最近の道具</h3>
            <Link to="/tools" className="view-all-link">
              すべて表示
            </Link>
          </div>
          
          {tools.length > 0 ? (
            <div className="recent-items">
              {tools.slice(0, 3).map(tool => (
                <div key={tool._id} className="recent-item">
                  <div className="item-image-container">
                    {tool.images && tool.images.length > 0 ? (
                      <img src={tool.images[0]} alt={tool.name} className="item-image" />
                    ) : (
                      <div className="no-image">画像なし</div>
                    )}
                  </div>
                  <h4>{tool.name}</h4>
                  <p className="item-category">{tool.hobby?.name || 'カテゴリなし'}</p>
                  <p className="item-description">{tool.description.substring(0, 80)}...</p>
                  <Link to={`/tools/${tool._id}`} className="btn btn-secondary">
                    詳細を見る
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-items">道具がまだ登録されていません</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
