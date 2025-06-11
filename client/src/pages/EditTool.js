// client/src/pages/EditTool.js - 修正版
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toolService, hobbyService } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './ToolForm.css';

const EditTool = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth(); // userオブジェクトも取得

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    brand: '',
    model: '',
    purchaseDate: '',
    price: '',
    condition: '良好',
    hobby: '',
    isPublic: true
  });
  
  const [hobbies, setHobbies] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data for tool editing. Tool ID:', id);
        console.log('Current user:', user ? user.id : 'Not logged in');
        
        // 趣味一覧と道具データを並列で取得
        const [hobbiesRes, toolRes] = await Promise.all([
          hobbyService.getMyHobbies(),
          toolService.getTool(id)
        ]);
        
        console.log('User hobbies fetched:', hobbiesRes.data);
        console.log('Tool details fetched:', toolRes.data);
        
        setHobbies(hobbiesRes.data);
        
        // APIレスポンスの構造を確認
        console.log('API response structure:', toolRes);
        const tool = toolRes.data.data; // 正しいデータ構造を確認
        console.log('Tool object:', tool);
        console.log('Tool owner ID:', tool && tool.user ? tool.user._id || tool.user : 'unknown');
        
        // 道具の所有者でない場合はリダイレクト
        // 重要: ここで正しくユーザーIDを比較
        if (tool && tool.user && user) {
          const toolOwnerId = typeof tool.user === 'object' ? tool.user._id : tool.user;
          if (toolOwnerId !== user.id) {
            console.log(`User does not own this tool. Tool owner: ${toolOwnerId}, Current user: ${user.id}`);
            toast.error('この道具を編集する権限がありません');
            navigate('/tools');
            return;
          }
        }
        
        // 日付形式の変換
        let purchaseDate = tool && tool.purchaseDate ? new Date(tool.purchaseDate) : '';
        if (purchaseDate instanceof Date && !isNaN(purchaseDate)) {
          purchaseDate = purchaseDate.toISOString().split('T')[0];
        }
        
        if (tool) {
          setFormData({
            name: tool.name || '',
            description: tool.description || '',
            brand: tool.brand || '',
            model: tool.model || '',
            purchaseDate: purchaseDate || '',
            price: tool.price || '',
            condition: tool.condition || '良好',
            hobby: tool.hobby && (tool.hobby._id || tool.hobby) || '',
            isPublic: tool.isPublic !== undefined ? tool.isPublic : true
          });
          
          // 既存の画像をセット
          if (tool.images && tool.images.length > 0) {
            setExistingImages(tool.images);
          }
        }
      } catch (err) {
        console.error('Failed to fetch data for tool editing:', err);
        toast.error('道具の情報取得に失敗しました');
        navigate('/tools');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, token]);

  // プレビュー画像の生成（新しく選択されたファイル用）
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
    
    // 入力時にそのフィールドのエラーをクリア
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const handleFileChange = (e) => {
    const maxTotalImages = 5;
    const remainingSlots = maxTotalImages - existingImages.length;
    
    if (e.target.files.length > remainingSlots) {
      toast.error(`画像は最大${maxTotalImages}枚までです（残り${remainingSlots}枚追加可能）`);
      return;
    }
    
    console.log('Selected new files:', Array.from(e.target.files).map(f => f.name));
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleRemoveExistingImage = (index) => {
    console.log('Removing existing image at index:', index);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.hobby) {
      newErrors.hobby = '趣味を選択してください';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = '道具名を入力してください';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = '説明を入力してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // フォームバリデーション
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    console.log('Submitting updated tool data:', formData);
    console.log('Existing images:', existingImages);
    console.log('New files:', selectedFiles.map(f => f.name));

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
      
      // 既存の画像情報を追加
      if (existingImages.length > 0) {
        console.log('Adding existing images:', existingImages);
        toolFormData.append('existingImages', JSON.stringify(existingImages));
      }
      
      // 新しい画像ファイルを追加
      if (selectedFiles.length > 0) {
        selectedFiles.forEach(file => {
          console.log('Adding new file:', file.name);
          toolFormData.append('images', file);
        });
      }
      
      console.log('Sending tool update request for ID:', id);
      const result = await toolService.updateTool(id, toolFormData);
      console.log('Tool update successful:', result);
      
      toast.success('道具を更新しました！');
      navigate(`/tools/${id}`);
    } catch (err) {
      console.error('Tool update failed:', err);
      
      let errorMessage = '道具の更新に失敗しました';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
      
      // サーバーからフィールド固有のエラーがあれば表示
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">読み込み中...</div>;
  }

  return (
    <div className="tool-form-container">
      <div className="tool-form-header">
        <h1>道具を編集</h1>
        <Link to={`/tools/${id}`} className="btn btn-dark">
          <i className="fas fa-arrow-left"></i> 詳細に戻る
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
              className={errors.hobby ? 'input-error' : ''}
              required
            >
              <option value="">選択してください</option>
              {hobbies.map((hobby) => (
                <option key={hobby._id} value={hobby._id}>
                  {hobby.name}
                </option>
              ))}
            </select>
            {errors.hobby && <div className="form-error">{errors.hobby}</div>}
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
              className={errors.name ? 'input-error' : ''}
              required
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="description">説明 <span className="required">*</span></label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={errors.description ? 'input-error' : ''}
              rows="4"
              required
            ></textarea>
            {errors.description && <div className="form-error">{errors.description}</div>}
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
            <label>現在の画像</label>
            {existingImages.length > 0 ? (
              <div className="image-previews">
                {existingImages.map((image, index) => (
                  <div key={index} className="image-preview">
                    <img 
                      src={image.startsWith('http') ? image : `http://localhost:5000${image}`} 
                      alt={`画像 ${index + 1}`} 
                    />
                    <button
                      type="button"
                      className="image-remove-btn"
                      onClick={() => handleRemoveExistingImage(index)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-images-text">画像はありません</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="images">新しい画像を追加（残り{5 - existingImages.length}枚まで）</label>
            <div className="file-input-container">
              <input
                type="file"
                id="images"
                name="images"
                onChange={handleFileChange}
                accept="image/*"
                multiple
                max={5 - existingImages.length}
                disabled={existingImages.length >= 5}
              />
              <label 
                htmlFor="images" 
                className={`file-input-label ${existingImages.length >= 5 ? 'disabled' : ''}`}
              >
                <i className="fas fa-cloud-upload-alt"></i> 画像を選択
              </label>
            </div>
            <small className="form-text">
              JPG, PNG または WEBP 形式の画像をアップロードできます (最大 5MB)
            </small>

            {previews.length > 0 && (
              <div className="image-previews">
                {previews.map((preview, index) => (
                  <div key={`new-${index}`} className="image-preview">
                    <img src={preview} alt={`新しい画像 ${index + 1}`} />
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
            <button 
              type="button" 
              className="btn btn-dark" 
              onClick={() => navigate(`/tools/${id}`)}
              disabled={submitting}
            >
              キャンセル
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '更新中...' : '変更を保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTool;