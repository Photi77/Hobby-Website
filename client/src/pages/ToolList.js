import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toolService, hobbyService } from '../services/api';
import { toast } from 'react-toastify';
import './ToolList.css';

const ToolList = () => {
  const [myTools, setMyTools] = useState([]);
  const [myHobbies, setMyHobbies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterHobby, setFilterHobby] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [toolsRes, hobbiesRes] = await Promise.all([
          toolService.getMyTools(),
          hobbyService.getMyHobbies()
        ]);
        
        setMyTools(toolsRes.data);
        setMyHobbies(hobbiesRes.data);
      } catch (err) {
        toast.error('道具の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 趣味でフィルタリングする
  const filteredTools = filterHobby === 'all'
    ? myTools
    : myTools.filter(tool => tool.hobby._id === filterHobby);

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="tool-list-container">
      <div className="tool-list-header">
        <h1>道具一覧</h1>
        {myHobbies.length > 0 ? (
          <Link to="/tools/add" className="btn btn-primary">
            <i className="fas fa-plus"></i> 新しい道具を追加
          </Link>
        ) : (
          <Link to="/hobbies/add" className="btn btn-primary">
            <i className="fas fa-plus"></i> まずは趣味を追加
          </Link>
        )}
      </div>

      {myTools.length > 0 && (
        <div className="tool-list-filters">
          <label htmlFor="filterHobby">趣味でフィルター:</label>
          <select
            id="filterHobby"
            value={filterHobby}
            onChange={(e) => setFilterHobby(e.target.value)}
          >
            <option value="all">すべて表示</option>
            {myHobbies.map((hobby) => (
              <option key={hobby._id} value={hobby._id}>
                {hobby.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="tool-list-content">
        {myTools.length === 0 ? (
          <div className="tool-list-empty">
            <p>道具が登録されていません。新しい道具を追加しましょう！</p>
            {myHobbies.length > 0 ? (
              <Link to="/tools/add" className="btn btn-primary">
                道具を追加
              </Link>
            ) : (
              <Link to="/hobbies/add" className="btn btn-primary">
                まずは趣味を追加
              </Link>
            )}
          </div>
        ) : filteredTools.length === 0 ? (
          <div className="tool-list-empty">
            <p>選択した趣味に関連する道具はありません。</p>
            <Link to={`/tools/add?hobbyId=${filterHobby}`} className="btn btn-primary">
              道具を追加
            </Link>
          </div>
        ) : (
          <div className="tool-grid">
            {filteredTools.map((tool) => (
              <div key={tool._id} className="tool-card">
                {tool.images && tool.images.length > 0 ? (
                  <div className="tool-card-image">
                    <img 
                      src={`http://localhost:5000${tool.images[0]}`} 
                      alt={tool.name} 
                    />
                  </div>
                ) : (
                  <div className="tool-card-image tool-card-no-image">
                    <i className="fas fa-tools"></i>
                  </div>
                )}
                <div className="tool-card-content">
                  <div className="tool-card-header">
                    <h3>{tool.name}</h3>
                    <span className={`tool-visibility ${tool.isPublic ? 'public' : 'private'}`}>
                      {tool.isPublic ? '公開' : '非公開'}
                    </span>
                  </div>
                  <p className="tool-card-hobby">
                    <i className="fas fa-tag"></i> {tool.hobby.name}
                  </p>
                  {tool.brand && (
                    <p className="tool-card-brand">
                      <i className="fas fa-building"></i> {tool.brand}
                    </p>
                  )}
                  <p className="tool-card-description">
                    {tool.description.length > 100
                      ? `${tool.description.substring(0, 100)}...`
                      : tool.description}
                  </p>
                  <div className="tool-card-actions">
                    <Link to={`/tools/${tool._id}`} className="btn btn-primary btn-sm">
                      詳細
                    </Link>
                    <Link to={`/tools/edit/${tool._id}`} className="btn btn-secondary btn-sm">
                      編集
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolList;