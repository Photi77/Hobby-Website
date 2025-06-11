// client/src/pages/EditHobby.js - 修正版
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { hobbyService } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './HobbyForm.css';

const EditHobby = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth(); // userオブジェクトも取得

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    isPublic: true
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const { name, category, description, isPublic } = formData;

  useEffect(() => {
    const fetchHobby = async () => {
      try {
        console.log('Fetching hobby details for editing. ID:', id);
        console.log('Current user:', user ? user.id : 'Not logged in');
        
        const res = await hobbyService.getHobby(id);
        console.log('Hobby details fetched:', res.data);
        
        const hobby = res.data.data; // data.dataの形式を確認
        
        // APIレスポンスの構造を確認
        console.log('API response structure:', res);
        console.log('Hobby object:', hobby);
        console.log('Hobby owner ID:', hobby ? hobby.user : 'unknown');
        
        // 趣味の所有者でない場合はリダイレクト
        // 重要: ここで正しくユーザーIDを比較
        if (hobby && hobby.user && user && hobby.user !== user.id) {
          console.log(`User does not own this hobby. Hobby owner: ${hobby.user}, Current user: ${user.id}`);
          toast.error('この趣味を編集する権限がありません');
          navigate('/hobbies');
          return;
        }

        setFormData({
          name: hobby ? hobby.name || '' : '',
          category: hobby ? hobby.category || '' : '',
          description: hobby ? hobby.description || '' : '',
          isPublic: hobby ? (hobby.isPublic !== undefined ? hobby.isPublic : true) : true
        });
      } catch (err) {
        console.error('Failed to fetch hobby details:', err);
        toast.error('趣味の取得に失敗しました');
        navigate('/hobbies');
      } finally {
        setLoading(false);
      }
    };

    fetchHobby();
  }, [id, navigate, token]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log(`Field change - ${name}:`, type === 'checkbox' ? checked : value);
    
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
    
    // 入力時にそのフィールドのエラーをクリア
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = '趣味名を入力してください';
    }
    
    if (!category.trim()) {
      newErrors.category = 'カテゴリーを入力してください';
    }
    
    if (!description.trim()) {
      newErrors.description = '説明を入力してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    
    // フォームバリデーション
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    console.log('Submitting updated hobby data:', formData);

    try {
      console.log('Updating hobby ID:', id);
      const result = await hobbyService.updateHobby(id, formData);
      console.log('Hobby update successful:', result);
      
      toast.success('趣味を更新しました！');
      navigate(`/hobbies/${id}`);
    } catch (err) {
      console.error('Hobby update failed:', err);
      
      let errorMessage = '趣味の更新に失敗しました';
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
    <div className="hobby-form-container">
      <div className="hobby-form-header">
        <h1>趣味を編集</h1>
        <Link to={`/hobbies/${id}`} className="btn btn-dark">
          <i className="fas fa-arrow-left"></i> 詳細に戻る
        </Link>
      </div>

      <div className="hobby-form-card">
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label htmlFor="name">趣味名 <span className="required">*</span></label>
            <input
              type="text"
              id="name"
              name="name"
              value={name}
              onChange={onChange}
              className={errors.name ? 'input-error' : ''}
              required
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="category">カテゴリー <span className="required">*</span></label>
            <input
              type="text"
              id="category"
              name="category"
              value={category}
              onChange={onChange}
              className={errors.category ? 'input-error' : ''}
              required
            />
            {errors.category && <div className="form-error">{errors.category}</div>}
            <small className="form-text">
              例: スポーツ、音楽、料理、アート、DIY、ガーデニング、コレクション、ゲーム など
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="description">説明 <span className="required">*</span></label>
            <textarea
              id="description"
              name="description"
              value={description}
              onChange={onChange}
              className={errors.description ? 'input-error' : ''}
              rows="6"
              required
            ></textarea>
            {errors.description && <div className="form-error">{errors.description}</div>}
            <small className="form-text">
              この趣味の概要、始めたきっかけ、好きな点などを自由に書いてください。
            </small>
          </div>

          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="isPublic"
              name="isPublic"
              checked={isPublic}
              onChange={onChange}
            />
            <label htmlFor="isPublic">公開する</label>
            <small className="form-text">
              公開すると、他のユーザーがこの趣味を閲覧できるようになります。
            </small>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-dark" 
              onClick={() => navigate(`/hobbies/${id}`)}
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

export default EditHobby;