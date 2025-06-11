// client/src/pages/ToolDetail.js (続き)
import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getTool, deleteTool } from '../services/toolService';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import { toast } from 'react-toastify';
import './ToolDetail.css';

const ToolDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchTool = async () => {
      try {
        setLoading(true);
        const result = await getTool(id);
        
        if (result.success) {
          setTool(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        console.error('道具取得エラー:', err);
        setError('道具の取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTool();
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteConfirm(true);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      const result = await deleteTool(id);
      
      if (result.success) {
        toast.success('道具が削除されました');
        navigate('/tools');
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('道具削除エラー:', err);
      setError('道具の削除中にエラーが発生しました');
    } finally {
      setLoading(false);
      setDeleteConfirm(false);
    }
  };

  const nextImage = () => {
    if (tool.images && tool.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % tool.images.length);
    }
  };

  const prevImage = () => {
    if (tool.images && tool.images.length > 0) {
      setCurrentImageIndex((prevIndex) => (prevIndex - 1 + tool.images.length) % tool.images.length);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  if (!tool) {
    return (
      <div className="tool-detail-container">
        <Alert type="danger" message={error || '道具が見つかりません'} />
        <Link to="/tools" className="btn btn-primary">
          道具一覧に戻る
        </Link>
      </div>
    );
  }

  const isOwner = currentUser && tool.user && tool.user._id === currentUser.id;

  return (
    <div className="tool-detail-container">
      <div className="tool-detail-header">
        <div className="back-link">
          <Link to="/tools" className="btn btn-outline">
            ← 道具一覧に戻る
          </Link>
          {tool.hobby && (
            <Link to={`/hobbies/${tool.hobby._id}`} className="btn btn-outline">
              趣味「{tool.hobby.name}」に戻る
            </Link>
          )}
        </div>
        
        <div className="tool-title-section">
          <h1>{tool.name}</h1>
          <span className={`visibility-badge ${tool.isPublic ? 'public' : 'private'}`}>
            {tool.isPublic ? '公開' : '非公開'}
          </span>
        </div>
        
        {isOwner && (
          <div className="tool-actions">
            <Link to={`/tools/edit/${tool._id}`} className="btn btn-secondary">
              編集
            </Link>
            <button 
              className="btn btn-danger" 
              onClick={handleDeleteClick}
            >
              削除
            </button>
          </div>
        )}
      </div>
      
      {error && <Alert type="danger" message={error} />}
      
      <div className="tool-detail-content">
        <div className="tool-image-gallery">
          {tool.images && tool.images.length > 0 ? (
            <>
              <div className="main-image-container">
                <img 
                  src={tool.images[currentImageIndex]} 
                  alt={`${tool.name} - 画像 ${currentImageIndex + 1}`} 
                  className="main-image"
                />
                
                {tool.images.length > 1 && (
                  <>
                    <button className="gallery-nav prev" onClick={prevImage}>
                      &#10094;
                    </button>
                    <button className="gallery-nav next" onClick={nextImage}>
                      &#10095;
                    </button>
                  </>
                )}
              </div>
              
              {tool.images.length > 1 && (
                <div className="thumbnail-container">
                  {tool.images.map((image, index) => (
                    <div 
                      key={index}
                      className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img src={image} alt={`${tool.name} - サムネイル ${index + 1}`} />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="no-image-large">
              画像がありません
            </div>
          )}
        </div>
        
        <div className="tool-info">
          <div className="info-section">
            <h2>基本情報</h2>
            
            <div className="info-grid">
              <div className="info-item">
                <h4>ブランド</h4>
                <p>{tool.brand || '情報なし'}</p>
              </div>
              
              <div className="info-item">
                <h4>モデル</h4>
                <p>{tool.model || '情報なし'}</p>
              </div>
              
              <div className="info-item">
                <h4>状態</h4>
                <span className={`condition-badge ${tool.condition}`}>{tool.condition}</span>
              </div>
              
              <div className="info-item">
                <h4>購入日</h4>
                <p>{tool.purchaseDate ? new Date(tool.purchaseDate).toLocaleDateString('ja-JP') : '情報なし'}</p>
              </div>
              
              <div className="info-item">
                <h4>価格</h4>
                <p>{tool.price ? `¥${tool.price.toLocaleString()}` : '情報なし'}</p>
              </div>
              
              <div className="info-item">
                <h4>趣味</h4>
                <p>
                  {tool.hobby ? (
                    <Link to={`/hobbies/${tool.hobby._id}`}>
                      {tool.hobby.name}
                    </Link>
                  ) : '情報なし'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="info-section">
            <h2>説明</h2>
            <p className="tool-description-full">{tool.description}</p>
          </div>
          
          <div className="info-section">
            <h2>所有者</h2>
            <div className="owner-info">
              <img 
                src={tool.user?.profilePicture || '/default-profile.jpg'} 
                alt={tool.user?.username}
                className="profile-image-medium"
              />
              <div>
                <h3>{tool.user?.username || 'ユーザー不明'}</h3>
                <p className="registered-date">
                  登録日: {new Date(tool.createdAt).toLocaleDateString('ja-JP')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {deleteConfirm && (
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
                onClick={handleDeleteConfirm}
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ToolDetail;
