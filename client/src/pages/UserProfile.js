
// client/src/pages/UserProfile.js
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUser } from '../services/userService';
import { getUserHobbies } from '../services/hobbyService';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import './UserProfile.css';

const UserProfile = () => {
  const { id } = useParams();
  
  const [user, setUser] = useState(null);
  const [hobbies, setHobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // ユーザーデータの取得
        const userResult = await getUser(id);
        if (userResult.success) {
          setUser(userResult.data);
          
          // ユーザーの趣味データの取得
          const hobbiesResult = await getUserHobbies(id);
          if (hobbiesResult.success) {
            setHobbies(hobbiesResult.data);
          } else {
            setError(hobbiesResult.message);
          }
        } else {
          setError(userResult.message);
        }
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('データの取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  if (loading) {
    return <Spinner />;
  }

  if (!user) {
    return (
      <div className="user-profile-container">
        <Alert type="danger" message={error || 'ユーザーが見つかりません'} />
        <Link to="/" className="btn btn-primary">
          ホームに戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="user-profile-container">
      <div className="user-profile-header">
        <div className="user-profile-image">
          <img 
            src={user.profilePicture || '/default-profile.jpg'} 
            alt={user.username}
          />
        </div>
        
        <div className="user-profile-info">
          <h1>{user.username}</h1>
          <p className="user-since">
            登録日: {new Date(user.createdAt).toLocaleDateString('ja-JP')}
          </p>
          {user.bio && <p className="user-bio">{user.bio}</p>}
        </div>
      </div>
      
      <div className="user-hobbies">
        <h2>{user.username}の趣味一覧</h2>
        
        {hobbies.length === 0 ? (
          <p className="no-hobbies">公開されている趣味はありません</p>
        ) : (
          <div className="hobby-grid">
            {hobbies.map(hobby => (
              <div key={hobby._id} className="hobby-card">
                <h3>{hobby.name}</h3>
                <p className="hobby-category">{hobby.category}</p>
                <p className="hobby-description">{hobby.description.substring(0, 150)}...</p>
                <Link to={`/hobbies/${hobby._id}`} className="btn btn-secondary">
                  詳細を見る
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
