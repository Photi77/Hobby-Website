
// client/src/pages/AddTool.js - 修正版
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { toolService, hobbyService } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './ToolForm.css';

const AddTool = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const hobbyIdParam = queryParams.get('hobbyId');
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    model: '',
    purchaseDate: '',
    price: '',
    condition: '良好',
    hobby: hobbyIdParam || '',
    isPublic: true
  });
  
  const [hobbies, setHobbies] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const navigate = useNavigate();

  // 趣味一覧の取得
  useEffect(() => {
    const fetchHobbies = async () => {
      try {
        console.log('Fetching hobbies for tool form...');
        console.log('Current auth token:', token);
        
        const res = await hobbyService.getMyHobbies();
        console.log('Fetched hobbies:', res.data);
        
        setHobbies(res.data);
        
        // 趣味が1つだけなら、自動的に選択
        if (res.data.length === 1 && !hobbyIdParam) {
          console.log('Auto-selecting the only hobby:', res.data[0]._id);
          setFormData(prev => ({
            ...prev,
            hobby: res.data[0]._id
          }));
        } else if (hobbyIdParam) {
          // URLパラメータで指定された趣味があれば、それを選択
          console.log('Using hobby ID from URL param:', hobbyIdParam);
          
          // 該当する趣味が存在するか確認
          const hobbyExists = res.data.some(h => h._id === hobbyIdParam);
          if (!hobbyExists) {
            console.warn('Hobby ID from URL not found in user hobbies');
            toast.warning('指定された趣味が見つかりません');
          }
        }
      } catch (err) {
        console.error('Failed to fetch hobbies:', err);
        toast.error('趣味の取得に失敗しました');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchHobbies();
  }, [hobbyIdParam, token]);

  // プレビュー画像の生成
  useEffect(() => {
    if (!selectedFiles.length) return;

    const newPreviews = [];
    selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === selectedFiles.length) {
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  }, [selectedFiles]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`Field change - ${name}:`, type === 'checkbox' ? checked : value);
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 5) {
      toast.error('画像は最大5枚までアップロードできます');
      return;
    }
    console.log('Selected files:', Array.from(e.target.files).map(f => f.name));
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // バリデーション
    if (!formData.hobby) {
      toast.error('趣味を選択してください');
      return;
    }
    
    if (!formData.name.trim()) {
      toast.error('道具名を入力してください');
      return;
    }
    
    if (!formData.description.trim()) {
      toast.error('説明を入力してください');
      return;
    }
    
    setLoading(true);
    console.log('Submitting tool data:', formData);

    try {
      // FormDataオブジェクトの作成
      const toolFormData = new FormData();
      
      // テキストデータを追加
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && key !== 'images') {
          console.log(`Adding form field - ${key}:`, formData[key]);
          toolFormData.append(key, formData[key]);
        }
      });
      
      // 画像ファイルを追加
      selectedFiles.forEach(file => {
        console.log('Adding file:', file.name);
        toolFormData.append('images', file);
      });
      
      console.log('Sending tool creation request...');
      const result = await toolService.createTool(toolFormData);
      console.log('Tool creation successful:', result);
      
      toast.success('道具を追加しました！');
      navigate(`/tools/${result.data._id}`);
    } catch (err) {
      console.error('Tool creation failed:', err);
      
      let errorMessage = '道具の追加に失敗しました';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="loading">読み込み中...</div>;
  }

  // 趣味がない場合
  if (hobbies.length === 0) {
    return (
      <div className="tool-form-container">
        <div className="tool-form-header">
          <h1>道具を追加</h1>
        </div>
        <div className="tool-form-card tool-form-no-hobbies">
          <p>道具を追加するには、先に趣味を登録する必要があります。</p>
          <Link to="/hobbies/add" className="btn btn-primary">
            趣味を追加する
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tool-form-container">
      <div className="tool-form-header">
        <h1>新しい道具を追加</h1>
        <Link to="/tools" className="btn btn-dark">
          <i className="fas fa-arrow-left"></i> 道具一覧に戻る
        </Link>
      </div>

      <div className="tool-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="hobby">趣味 <span className="required">*</span></label>
            <select
              id="hobby"
              name="hobby"
              value={formData.hobby}
              onChange={handleChange}
              required
            >
              <option value="">選択してください</option>
              {hobbies.map(hobby => (
                <option key={hobby._id} value={hobby._id}>
                  {hobby.name}
                </option>
              ))}
            </select>
            {formData.hobby && (
              <small className="form-text">
                選択した趣味: {hobbies.find(h => h._id === formData.hobby)?.name || '不明'}
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="name">道具名 <span className="required">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">説明 <span className="required">*</span></label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              required
            ></textarea>
            <small className="form-text">
              この道具の特徴、使い方、レビューなどを自由に書いてください。
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="brand">ブランド</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="model">モデル・型番</label>
              <input
                type="text"
                id="model"
                name="model"
                value={formData.model}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">価格</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="1"
              />
              <small className="form-text">
                購入価格（円）
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="purchaseDate">購入日</label>
              <input
                type="date"
                id="purchaseDate"
                name="purchaseDate"
                value={formData.purchaseDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="condition">状態 <span className="required">*</span></label>
            <select
              id="condition"
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              required
            >
              <option value="新品">新品</option>
              <option value="良好">良好</option>
              <option value="普通">普通</option>
              <option value="使用済み">使用済み</option>
              <option value="修理が必要">修理が必要</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="images">画像（最大5枚）</label>
            <div className="file-input-container">
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleFileChange}
                accept="image/*"
                multiple
                max="5"
              />
              <label htmlFor="images" className="file-input-label">
                <i className="fas fa-cloud-upload-alt"></i> 画像を選択
              </label>
            </div>
            <small className="form-text">
              JPG, PNG または WEBP 形式の画像をアップロードできます (最大 5MB)
            </small>

            {previews.length > 0 && (
              <div className="image-previews">
                {previews.map((preview, index) => (
                  <div key={index} className="image-preview">
                    <img src={preview} alt={`プレビュー ${index + 1}`} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={formData.isPublic}
              onChange={handleChange}
            />
            <label htmlFor="isPublic">公開する</label>
            <small className="form-text">
              公開すると、他のユーザーがこの道具を閲覧できるようになります。
            </small>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-dark" onClick={() => navigate('/tools')}>
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? '追加中...' : '道具を追加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTool;