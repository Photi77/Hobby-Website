// client/src/pages/HobbyList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyHobbies, deleteHobby } from '../services/hobbyService';
import Spinner from '../components/common/Spinner';
import Alert from '../components/common/Alert';
import { toast } from 'react-toastify';
import './HobbyList.css';

const HobbyList = () => {
  const [hobbies, setHobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const fetchHobbies = async () => {
      try {
        setLoading(true);
        const result = await getMyHobbies();
        
        if (result.success) {
          setHobbies(result.data);
        } else {
          setError(result.message);
        }
      } catch (err) {
        console.error('趣味取得エラー:', err);
        setError('趣味の取得中にエラーが発生しました');
      } finally {
        setLoading(false);
      }
    };
    
    fetchHobbies();
  }, []);

  const handleDeleteClick = (hobbyId) => {
    setDeleteConfirm(hobbyId);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm(null);
  };

  const handleDeleteConfirm = async (hobbyId) => {
    try {
      setLoading(true);
      const result = await deleteHobby(hobbyId);
      
      if (result.success) {
        // 趣味リストから削除された趣味を除外
        setHobbies(hobbies.filter(hobby => hobby._id !== hobbyId));
        toast.success('趣味が削除されました');
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('趣味削除エラー:', err);
      setError('趣味の削除中にエラーが発生しました');
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="hobby-list-container">
      <div className="hobby-list-header">
        <h1>趣味一覧</h1>
        <Link to="/hobbies/add" className="btn btn-primary">
          新しい趣味を追加
        </Link>
      </div>
      
      {error && <Alert type="danger" message={error} />}
      
      {hobbies.length === 0 ? (
        <div className="empty-list">
          <p>趣味がまだ登録されていません</p>
          <Link to="/hobbies/add" className="btn btn-secondary">
            最初の趣味を追加しましょう
          </Link>
        </div>
      ) : (
        <div className="hobby-grid">
          {hobbies.map(hobby => (
            <div key={hobby._id} className="hobby-card">
              <div className="hobby-card-header">
                <h3>{hobby.name}</h3>
                <span className={`visibility-badge ${hobby.isPublic ? 'public' : 'private'}`}>
                  {hobby.isPublic ? '公開' : '非公開'}
                </span>
              </div>
              
              <div className="hobby-card-category">
                <span className="category-label">カテゴリ:</span> {hobby.category}
              </div>
              
              <p className="hobby-card-description">{hobby.description.substring(0, 150)}...</p>
              
              <div className="hobby-card-actions">
                <Link to={`/hobbies/${hobby._id}`} className="btn btn-secondary">
                  詳細を見る
                </Link>
                <Link to={`/hobbies/edit/${hobby._id}`} className="btn btn-outline">
                  編集
                </Link>
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDeleteClick(hobby._id)}
                >
                  削除
                </button>
              </div>
              
              {deleteConfirm === hobby._id && (
                <div className="delete-confirm-modal">
                  <div className="delete-confirm-content">
                    <h4>趣味の削除</h4>
                    <p>
                      <strong>{hobby.name}</strong> を削除してもよろしいですか？<br />
                      この操作は取り消せません。関連するすべての道具も削除されます。
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
                        onClick={() => handleDeleteConfirm(hobby._id)}
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
  );
};

export default HobbyList;