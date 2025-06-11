// client/src/services/api.js - toolServiceの追加
import axios from 'axios';

// 趣味関連のAPI
export const hobbyService = {
  // 趣味一覧取得（自分の）
  getMyHobbies: async () => {
    try {
      console.log('Fetching my hobbies...');
      const res = await axios.get('/api/hobbies/me');
      console.log('My hobbies response:', res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch hobbies:', err);
      throw err.response?.data || err;
    }
  },
  
  // 公開趣味一覧取得
  getPublicHobbies: async () => {
    try {
      console.log('Fetching public hobbies...');
      const res = await axios.get('/api/hobbies/public');
      return res.data;
    } catch (err) {
      console.error('Failed to fetch public hobbies:', err);
      throw err.response?.data || err;
    }
  },
  
  // 特定の趣味を取得
  getHobby: async (id) => {
    try {
      console.log(`Fetching hobby details for ID: ${id}`);
      const res = await axios.get(`/api/hobbies/${id}`);
      
      // レスポンス構造を確認
      console.log('Hobby details response structure:', res.data);
      
      // フロントエンド側でデータを正規化
      // APIレスポンスが { success: true, data: {...} } の形式の場合に対応
      if (res.data && res.data.success && res.data.data) {
        console.log('Normalized hobby data:', res.data);
        return res.data;
      } else {
        // すでに正規化されている場合はそのまま返す
        console.log('Already normalized hobby data:', res.data);
        return {
          success: true,
          data: res.data
        };
      }
    } catch (err) {
      console.error(`Failed to fetch hobby details for ID ${id}:`, err);
      throw err.response?.data || err;
    }
  },
  
  // 趣味を作成
  createHobby: async (hobbyData) => {
    try {
      console.log('Creating new hobby with data:', hobbyData);
      console.log('Request URL:', axios.defaults.baseURL + '/api/hobbies');
      const res = await axios.post('/api/hobbies', hobbyData);
      console.log('Hobby created successfully:', res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to create hobby:', err);
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      throw err.response?.data || err;
    }
  },
  
  // 趣味を更新
  updateHobby: async (id, hobbyData) => {
    try {
      console.log(`Updating hobby ID ${id} with data:`, hobbyData);
      
      // Content-Typeを明示的に設定
      const config = {
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const res = await axios.put(`/api/hobbies/${id}`, hobbyData, config);
      
      console.log('Hobby update response structure:', res.data);
      
      // フロントエンド側でデータを正規化
      if (res.data && res.data.success && res.data.data) {
        console.log('Normalized hobby update data:', res.data);
        return res.data;
      } else {
        // すでに正規化されている場合はそのまま返す
        console.log('Already normalized hobby update data:', res.data);
        return {
          success: true,
          data: res.data
        };
      }
    } catch (err) {
      console.error(`Failed to update hobby ID ${id}:`, err);
      
      // エラーレスポンスの詳細をログ出力
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      
      throw err.response?.data || err;
    }
  },
  
  // 趣味を削除
  deleteHobby: async (id) => {
    try {
      console.log(`Deleting hobby ID: ${id}`);
      const res = await axios.delete(`/api/hobbies/${id}`);
      console.log('Hobby deleted successfully:', res.data);
      return res.data;
    } catch (err) {
      console.error(`Failed to delete hobby ID ${id}:`, err);
      throw err.response?.data || err;
    }
  },
  
  // ユーザーの趣味一覧を取得
  getUserHobbies: async (userId) => {
    try {
      console.log(`Fetching hobbies for user ID: ${userId}`);
      const res = await axios.get(`/api/users/${userId}/hobbies`);
      return res.data;
    } catch (err) {
      console.error(`Failed to fetch hobbies for user ID ${userId}:`, err);
      throw err.response?.data || err;
    }
  }
};

// 道具関連のAPI
export const toolService = {
  // 道具一覧取得（自分の）
  getMyTools: async () => {
    try {
      console.log('Fetching my tools...');
      const res = await axios.get('/api/tools/me');
      console.log('My tools response:', res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to fetch tools:', err);
      throw err.response?.data || err;
    }
  },
  
  // 特定の趣味に関連する道具一覧取得
  getToolsByHobby: async (hobbyId) => {
    try {
      console.log(`Fetching tools for hobby ID: ${hobbyId}`);
      const res = await axios.get(`/api/tools/hobby/${hobbyId}`);
      return res.data;
    } catch (err) {
      console.error(`Failed to fetch tools for hobby ID ${hobbyId}:`, err);
      throw err.response?.data || err;
    }
  },
  
  // 特定の道具を取得
  getTool: async (id) => {
    try {
      console.log(`Fetching tool details for ID: ${id}`);
      const res = await axios.get(`/api/tools/${id}`);
      
      // レスポンス構造を確認
      console.log('Tool details response structure:', res.data);
      
      // フロントエンド側でデータを正規化
      if (res.data && res.data.success && res.data.data) {
        console.log('Normalized tool data:', res.data);
        return res.data;
      } else {
        // すでに正規化されている場合はそのまま返す
        console.log('Already normalized tool data:', res.data);
        return {
          success: true,
          data: res.data
        };
      }
    } catch (err) {
      console.error(`Failed to fetch tool details for ID ${id}:`, err);
      throw err.response?.data || err;
    }
  },
  
  // 道具を作成
  createTool: async (toolData) => {
    try {
      console.log('Creating new tool with data:', toolData);
      const res = await axios.post('/api/tools', toolData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Tool created successfully:', res.data);
      return res.data;
    } catch (err) {
      console.error('Failed to create tool:', err);
      throw err.response?.data || err;
    }
  },
  
   // 道具を更新
  updateTool: async (id, toolData) => {
    try {
      console.log(`Updating tool ID ${id}`);
      if (toolData instanceof FormData) {
        console.log('Form data keys:', Array.from(toolData.keys()));
      } else {
        console.log('Update data:', toolData);
      }
      
      // FormDataオブジェクトなので、Content-Typeはブラウザが自動設定
      const res = await axios.put(`/api/tools/${id}`, toolData);
      
      console.log('Tool update response structure:', res.data);
      
      // フロントエンド側でデータを正規化
      if (res.data && res.data.success && res.data.data) {
        console.log('Normalized tool update data:', res.data);
        return res.data;
      } else {
        // すでに正規化されている場合はそのまま返す
        console.log('Already normalized tool update data:', res.data);
        return {
          success: true,
          data: res.data
        };
      }
    } catch (err) {
      console.error(`Failed to update tool ID ${id}:`, err);
      
      // エラーレスポンスの詳細をログ出力
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Error status:', err.response.status);
      } else if (err.request) {
        console.error('No response received:', err.request);
      } else {
        console.error('Error message:', err.message);
      }
      
      throw err.response?.data || err;
    }
  },
  
  // 道具を削除
  deleteTool: async (id) => {
    try {
      console.log(`Deleting tool ID: ${id}`);
      const res = await axios.delete(`/api/tools/${id}`);
      console.log('Tool deleted successfully:', res.data);
      return res.data;
    } catch (err) {
      console.error(`Failed to delete tool ID ${id}:`, err);
      throw err.response?.data || err;
    }
  }
};

// ユーザー関連のAPI
export const userService = {
  // ユーザー情報取得
  getUser: async (id) => {
    try {
      console.log(`Fetching user details for ID: ${id}`);
      const res = await axios.get(`/api/users/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Failed to fetch user details for ID ${id}:`, err);
      throw err.response?.data || err;
    }
  }
};
