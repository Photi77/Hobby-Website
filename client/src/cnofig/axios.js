// client/src/config/axios.js - 新規作成
import axios from 'axios';

// デフォルトのベースURL設定
axios.defaults.baseURL = process.env.NODE_ENV === 'production' 
  ? '' // プロダクション環境では空文字（同じドメイン）
  : 'http://localhost:3000'; // 開発環境ではサーバーのURL

// リクエスト/レスポンスインターセプター
axios.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Response Error:', error.response?.status, error.response?.data);
    
    // 401エラーの場合、認証が必要
    if (error.response?.status === 401) {
      // トークンを削除
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      
      // ログインページにリダイレクト（必要に応じて）
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios;