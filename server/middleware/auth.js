// server/middleware/auth.js - 修正版
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 認証ミドルウェア
exports.protect = async (req, res, next) => {
  let token;
  
  console.log('Auth middleware called');

  // ヘッダーからトークンを取得
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token extracted from headers:', token ? 'Yes (exists)' : 'No');
  } else {
    console.log('No Bearer token in Authorization header');
  }

  // トークンがない場合
  if (!token) {
    console.log('Authentication required but no token provided');
    return res.status(401).json({
      success: false,
      message: '認証が必要です'
    });
  }

  try {
    // トークンを検証
    console.log('Verifying token...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret');
    console.log('Token verified successfully. User ID:', decoded.id);

    // ユーザーをリクエストに追加
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      console.log('User not found for token ID:', decoded.id);
      return res.status(401).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }
    
    console.log('User authenticated:', user._id);
    req.user = user;
    next();
  } catch (err) {
    console.error('Authentication error:', err);
    
    // JWT検証エラーの詳細なメッセージ
    let errorMessage = '認証に失敗しました';
    if (err.name === 'JsonWebTokenError') {
      errorMessage = '無効なトークンです';
    } else if (err.name === 'TokenExpiredError') {
      errorMessage = 'トークンの有効期限が切れています';
    }
    
    return res.status(401).json({
      success: false,
      message: errorMessage
    });
  }
};