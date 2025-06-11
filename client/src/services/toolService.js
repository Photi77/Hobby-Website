
// client/src/services/toolService.js
import axios from 'axios';

// 特定の趣味に関連する道具一覧を取得
export const getToolsByHobby = async (hobbyId) => {
  try {
    const res = await axios.get(`/api/tools/hobby/${hobbyId}`);
    return { success: true, data: res.data.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || '道具の取得に失敗しました'
    };
  }
};

// 自分の道具一覧を取得
export const getMyTools = async () => {
  try {
    const res = await axios.get('/api/tools/me');
    return { success: true, data: res.data.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || '道具の取得に失敗しました'
    };
  }
};

// 特定の道具を取得
export const getTool = async (id) => {
  try {
    const res = await axios.get(`/api/tools/${id}`);
    return { success: true, data: res.data.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || '道具の詳細取得に失敗しました'
    };
  }
};

// 道具を作成
export const createTool = async (toolData) => {
  try {
    // FormDataを使用して画像アップロード対応
    const formData = new FormData();
    
    // テキストデータを追加
    Object.keys(toolData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, toolData[key]);
      }
    });
    
    // 画像ファイルを追加
    if (toolData.images && toolData.images.length > 0) {
      for (let i = 0; i < toolData.images.length; i++) {
        formData.append('images', toolData.images[i]);
      }
    }
    
    const res = await axios.post('/api/tools', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return { success: true, data: res.data.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || '道具の作成に失敗しました'
    };
  }
};

// 道具を更新
export const updateTool = async (id, toolData) => {
  try {
    // FormDataを使用して画像アップロード対応
    const formData = new FormData();
    
    // テキストデータを追加
    Object.keys(toolData).forEach(key => {
      if (key !== 'images') {
        formData.append(key, toolData[key]);
      }
    });
    
    // 新しい画像ファイルを追加
    if (toolData.newImages && toolData.newImages.length > 0) {
      for (let i = 0; i < toolData.newImages.length; i++) {
        formData.append('images', toolData.newImages[i]);
      }
    }
    
    const res = await axios.put(`/api/tools/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return { success: true, data: res.data.data };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || '道具の更新に失敗しました'
    };
  }
};

// 道具を削除
export const deleteTool = async (id) => {
  try {
    await axios.delete(`/api/tools/${id}`);
    return { success: true };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || '道具の削除に失敗しました'
    };
  }
};
