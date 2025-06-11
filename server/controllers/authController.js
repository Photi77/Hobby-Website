// server/controllers/authController.js - デバッグ版
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
    console.log('=== REGISTER API CALLED ===');
    console.log('Request body:', req.body);
    const { username, email, password } = req.body;

    // 入力バリデーション
    if (!username || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({ 
        success: false, 
        message: '全ての必須項目を入力してください' 
      });
    }

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
    
    const responseData = {
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        createdAt: user.createdAt
      }
    };
    
    console.log('Sending register response:', { ...responseData, token: 'TOKEN_HIDDEN' });
    res.status(201).json(responseData);

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// ログイン
exports.login = async (req, res) => {
  try {
    console.log('=== LOGIN API CALLED ===');
    console.log('Request body:', { email: req.body.email, password: '***HIDDEN***' });
    const { email, password } = req.body;

    // 入力バリデーション
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ 
        success: false, 
        message: 'メールアドレスとパスワードを入力してください' 
      });
    }

    // メールでユーザーを検索
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(401).json({ 
        success: false, 
        message: 'メールアドレスまたはパスワードが正しくありません' 
      });
    }

    console.log('User found:', user.username);

    // パスワード検証
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Password does not match for user:', user.username);
      return res.status(401).json({ 
        success: false, 
        message: 'メールアドレスまたはパスワードが正しくありません' 
      });
    }

    console.log('Password verified for user:', user.username);

    // レスポンスにトークンを送信
    const token = generateToken(user._id);
    
    const responseData = {
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        createdAt: user.createdAt
      }
    };
    
    console.log('Sending login response:', { ...responseData, token: 'TOKEN_HIDDEN' });
    res.status(200).json(responseData);

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// 現在のユーザー情報取得
exports.getMe = async (req, res) => {
  try {
    console.log('=== GET ME API CALLED ===');
    console.log('User ID from middleware:', req.user ? req.user.id : 'undefined');
    
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
    
    console.log('User found for getMe:', user.username);
    
    const responseData = {
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        profilePicture: user.profilePicture,
        bio: user.bio,
        createdAt: user.createdAt
      }
    };
    
    console.log('Sending getMe response for user:', user.username);
    res.status(200).json(responseData);
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

console.log('AuthController loaded with functions:');
console.log('- register:', typeof exports.register === 'function' ? '✓' : '✗');
console.log('- login:', typeof exports.login === 'function' ? '✓' : '✗');
console.log('- getMe:', typeof exports.getMe === 'function' ? '✓' : '✗');