// client/src/services/hobbyService.js
import axios from 'axios';

// 趣味一覧を取得
export const getMyHobbies = async () => {
  try {
    const res = await axios.get('/api/hobbies/me');
    return { success: true, data: res.data.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || '趣味の取得に失敗しました'
    };
  }
};

// 公開趣味一覧を取得
export const getPublicHobbies = async () => {
  try {
    const res = await axios.get('/api/hobbies/public');
    return { success: true, data: res.data.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || '公開趣味の取得に失敗しました'
    };
  }
};

// 特定の趣味を取得
export const getHobby = async (id) => {
  try {
    const res = await axios.get(`/api/hobbies/${id}`);
    return { success: true, data: res.data.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || '趣味の詳細取得に失敗しました'
    };
  }
};

// 趣味を作成
export const createHobby = async (hobbyData) => {
  try {
    const res = await axios.post('/api/hobbies', hobbyData);
    return { success: true, data: res.data.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || '趣味の作成に失敗しました'
    };
  }
};

// 趣味を更新
export const updateHobby = async (id, hobbyData) => {
  try {
    const res = await axios.put(`/api/hobbies/${id}`, hobbyData);
    return { success: true, data: res.data.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || '趣味の更新に失敗しました'
    };
  }
};

// 趣味を削除
export const deleteHobby = async (id) => {
  try {
    await axios.delete(`/api/hobbies/${id}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || '趣味の削除に失敗しました'
    };
  }
};

// ユーザーの趣味一覧を取得
export const getUserHobbies = async (userId) => {
  try {
    const res = await axios.get(`/api/users/${userId}/hobbies`);
    return { success: true, data: res.data.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'ユーザーの趣味取得に失敗しました'
    };
  }
};

