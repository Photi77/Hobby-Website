
// client/src/pages/AddHobby.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createHobby } from '../services/hobbyService';
import FormGroup from '../components/common/FormGroup';
import Alert from '../components/common/Alert';
import Spinner from '../components/common/Spinner';
import { toast } from 'react-toastify';
import './HobbyForm.css';

const AddHobby = () => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    isPublic: true
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const { name, category, description, isPublic } = formData;

  const handleChange = e => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
    
    // フィールドの変更時にエラーをクリア
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // 趣味名のバリデーション
    if (name.trim().length < 2) {
      newErrors.name = '趣味名は2文字以上である必要があります';
    }
    
    // カテゴリのバリデーション
    if (!category) {
      newErrors.category = 'カテゴリを選択してください';
    }
    
    // 説明のバリデーション
    if (description.trim().length < 10) {
      newErrors.description = '説明は10文字以上である必要があります';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    // フォームのバリデーション
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await createHobby(formData);
      
      if (result.success) {
        toast.success('趣味が作成されました');
        navigate(`/hobbies/${result.data._id}`);
      } else {
        setErrors({ general: result.message });
      }
    } catch (err) {
      setErrors({ general: '趣味の作成中にエラーが発生しました' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="hobby-form-container">
      <div className="hobby-form-header">
        <h1>新しい趣味を追加</h1>
        <Link to="/hobbies" className="btn btn-outline">
          趣味一覧に戻る
        </Link>
      </div>
      
      {errors.general && <Alert type="danger" message={errors.general} />}
      
      <form onSubmit={handleSubmit} className="hobby-form">
        <FormGroup label="趣味名" id="name" error={errors.name}>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={handleChange}
            placeholder="例：料理、ガーデニング、サイクリング"
            required
          />
        </FormGroup>
        
        <FormGroup label="カテゴリ" id="category" error={errors.category}>
          <select
            id="category"
            name="category"
            value={category}
            onChange={handleChange}
            required
          >
            <option value="">カテゴリを選択</option>
            <option value="スポーツ・アウトドア">スポーツ・アウトドア</option>
            <option value="アート・クラフト">アート・クラフト</option>
            <option value="音楽">音楽</option>
            <option value="料理・グルメ">料理・グルメ</option>
            <option value="ガーデニング">ガーデニング</option>
            <option value="コレクション">コレクション</option>
            <option value="ゲーム">ゲーム</option>
            <option value="テクノロジー">テクノロジー</option>
            <option value="旅行・探検">旅行・探検</option>
            <option value="読書・勉強">読書・勉強</option>
            <option value="その他">その他</option>
          </select>
        </FormGroup>
        
        <FormGroup label="説明" id="description" error={errors.description}>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={handleChange}
            placeholder="この趣味について詳しく教えてください..."
            rows="6"
            required
          />
        </FormGroup>
        
        <div className="form-group-checkbox">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={isPublic}
            onChange={handleChange}
          />
          <label htmlFor="isPublic">公開する（他のユーザーに見えるようにする）</label>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            趣味を追加
          </button>
          <Link to="/hobbies" className="btn btn-secondary">
            キャンセル
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AddHobby;
