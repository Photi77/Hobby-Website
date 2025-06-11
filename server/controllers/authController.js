// server/controllers/authController.js の修正

const User = require('../models/User');
const jwt = require('jsonwebtoken');

// JWTトークンの生成
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// ユーザー登録
exports.register = async (req, res) => {
  try {
    console.log('Register API called with data:', req.body);
    const { username, email, password } = req.body;

    // メールとユーザー名の重複チェック
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      return res.status(400).json({ 
        success: false, 
        message: 'このメールアドレスまたはユーザー名はすでに使用されています' 
      });
    }

    // ユーザー作成
    const user = await User.create({
      username,
      email,
      password
    });

    console.log('User created successfully:', user._id);

    // レスポンスにトークンを送信
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: err.message
    });
  }
};

// ログイン
exports.login = async (req, res) => {
  try {
    console.log('Login API called with data:', req.body);
    const { email, password } = req.body;

    // メールでユーザーを検索
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'メールアドレスまたはパスワードが正しくありません' 
      });
    }

    // パスワード検証
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'メールアドレスまたはパスワードが正しくありません' 
      });
    }

    console.log('User logged in successfully:', user._id);

    // レスポンスにトークンを送信
    const token = generateToken(user._id);
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: err.message
    });
  }
};

// 現在のユーザー情報取得
exports.getMe = async (req, res) => {
  try {
    console.log('GetMe endpoint called for user ID:', req.user ? req.user.id : 'undefined');
    
    // req.userがある場合（認証ミドルウェアを通過している場合）
    if (!req.user || !req.user.id) {
      console.error('No user found in request object');
      return res.status(401).json({
        success: false,
        message: '認証に失敗しました。ログインしてください。'
      });
    }
    
    // データベースから最新のユーザー情報を取得（パスワードは除く）
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.error('User not found in database:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }
    
    console.log('User found:', user.username);
    
    // 成功レスポンス
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: err.message
    });
  }
};

// テスト用の情報出力
console.log('AuthController functions loaded:');
console.log('- register:', typeof exports.register === 'function' ? 'Function ✓' : 'NOT A FUNCTION ✗');
console.log('- login:', typeof exports.login === 'function' ? 'Function ✓' : 'NOT A FUNCTION ✗');
console.log('- getMe:', typeof exports.getMe === 'function' ? 'Function ✓' : 'NOT A FUNCTION ✗');

module.exports = {
  register: exports.register,
  login: exports.login,
  getMe: exports.getMe
};