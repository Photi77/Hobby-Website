
// client/src/services/userService.js
import axios from 'axios';

// ユーザー情報を取得
export const getUser = async (id) => {
  try {
    const res = await axios.get(`/api/users/${id}`);
    return { success: true, data: res.data.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'ユーザー情報の取得に失敗しました'
    };
  }
};

// プロフィール画像をアップロード
export const uploadProfilePicture = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('profilePicture', imageFile);
    
    const res = await axios.put('/api/users/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return { success: true, data: res.data.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'プロフィール画像のアップロードに失敗しました'
    };
  }
};
