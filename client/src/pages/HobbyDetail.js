// client/src/pages/HobbyDetail.js
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getHobby } from '../services/hobbyService';
import { getToolsByHobby, deleteTool } from '../services/toolService';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import { toast } from 'react-toastify';
import './HobbyDetail.css';

const HobbyDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [hobby, setHobby] = useState(null);
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 趣味データの取得
        const hobbyResult = await getHobby(id);
        if (hobbyResult.success) {
          setHobby(hobbyResult.data);
          
          // 関連する道具データの取得
          const toolsResult = await getToolsByHobby(id);
          if (toolsResult.success) {
            setTools(toolsResult.data);
          } else {
            setError(toolsResult.message);
          }
        } else {
          setError(hobbyResult.message);
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

  const handleDeleteClick = (toolId) => {
    setDeleteConfirm(toolId);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const handleDeleteConfirm = async (toolId) => {
    try {
      setLoading(true);
      const result = await deleteTool(toolId);
      
      if (result.success) {
        // 道具リストから削除された道具を除外
        setTools(tools.filter(tool => tool._id !== toolId));
        toast.success('道具が削除されました');
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('道具削除エラー:', err);
      setError('道具の削除中にエラーが発生しました');
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (!hobby) {
    return (
      <div className="hobby-detail-container">
        <Alert type="danger" message={error || '趣味が見つかりません'} />
        <Link to="/hobbies" className="btn btn-primary">
          趣味一覧に戻る
        </Link>
      </div>
    );
  }

  const isOwner = currentUser && hobby.user && hobby.user._id === currentUser.id;

  return (
    <div className="hobby-detail-container">
      <div className="hobby-detail-header">
        <div className="back-link">
          <Link to="/hobbies" className="btn btn-outline">
            ← 趣味一覧に戻る
          </Link>
        </div>
        
        <div className="hobby-title-section">
          <h1>{hobby.name}</h1>
          <span className={`visibility-badge ${hobby.isPublic ? 'public' : 'private'}`}>
            {hobby.isPublic ? '公開' : '非公開'}
          </span>
        </div>
        
        {isOwner && (
          <div className="hobby-actions">
            <Link to={`/hobbies/edit/${hobby._id}`} className="btn btn-secondary">
              趣味を編集
            </Link>
            <Link to={`/tools/add?hobby=${hobby._id}`} className="btn btn-primary">
              道具を追加
            </Link>
          </div>
        )}
      </div>
      
      {error && <Alert type="danger" message={error} />}
      
      <div className="hobby-detail-content">
        <div className="hobby-info">
          <div className="info-card">
            <h3>カテゴリ</h3>
            <p>{hobby.category}</p>
          </div>
          
          <div className="info-card">
            <h3>作成日</h3>
            <p>{new Date(hobby.createdAt).toLocaleDateString('ja-JP')}</p>
          </div>
          
          <div className="info-card">
            <h3>所有者</h3>
            <div className="user-info">
              <img 
                src={hobby.user?.profilePicture || '/default-profile.jpg'} 
                alt={hobby.user?.username}
                className="profile-image-small"
              />
              <span>{hobby.user?.username || 'ユーザー不明'}</span>
            </div>
          </div>
        </div>
        
        <div className="hobby-description">
          <h2>説明</h2>
          <p>{hobby.description}</p>
        </div>
        
        <div className="hobby-tools">
          <h2>道具一覧</h2>
          
          {tools.length === 0 ? (
            <div className="empty-tools">
              <p>この趣味に関連する道具はまだ登録されていません</p>
              {isOwner && (
                <Link to={`/tools/add?hobby=${hobby._id}`} className="btn btn-secondary">
                  最初の道具を追加しましょう
                </Link>
              )}
            </div>
          ) : (
            <div className="tool-grid">
              {tools.map(tool => (
                <div key={tool._id} className="tool-card">
                  <div className="tool-image-container">
                    {tool.images && tool.images.length > 0 ? (
                      <img src={tool.images[0]} alt={tool.name} className="tool-image" />
                    ) : (
                      <div className="no-image">画像なし</div>
                    )}
                  </div>
                  
                  <div className="tool-card-content">
                    <h3>{tool.name}</h3>
                    <p className="tool-brand">{tool.brand} {tool.model}</p>
                    <p className="tool-description">{tool.description.substring(0, 100)}...</p>
                    
                    <div className="tool-card-actions">
                      <Link to={`/tools/${tool._id}`} className="btn btn-secondary">
                        詳細を見る
                      </Link>
                      
                      {isOwner && (
                        <>
                          <Link to={`/tools/edit/${tool._id}`} className="btn btn-outline">
                            編集
                          </Link>
                          <button 
                            className="btn btn-danger" 
                            onClick={() => handleDeleteClick(tool._id)}
                          >
                            削除
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {deleteConfirm === tool._id && (
                    <div className="delete-confirm-modal">
                      <div className="delete-confirm-content">
                        <h4>道具の削除</h4>
                        <p>
                          <strong>{tool.name}</strong> を削除してもよろしいですか？<br />
                          この操作は取り消せません。
                        </p>
                        <div className="delete-confirm-actions">
                          <button 
                            className="btn btn-outline" 
                            onClick={handleDeleteCancel}
                          >
                            キャンセル
                          </button>
                          <button 
                            className="btn btn-danger" 
                            onClick={() => handleDeleteConfirm(tool._id)}
                          >
                            削除する
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HobbyDetail;

