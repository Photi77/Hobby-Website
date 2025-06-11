// server/server.js - 修正版
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config();

// Expressアプリの初期化
const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// デバッグ用リクエストロガー
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ルートのインポート（明示的にrequireチェック）
console.log('Loading route files...');
let authRoutes, userRoutes, hobbyRoutes, toolRoutes;

try {
  authRoutes = require('./routes/auth');
  console.log('Auth routes loaded successfully');
} catch (err) {
  console.error('Failed to load auth routes:', err);
  process.exit(1);
}

try {
  userRoutes = require('./routes/users');
  console.log('User routes loaded successfully');
} catch (err) {
  console.error('Failed to load user routes:', err);
  process.exit(1);
}

try {
  hobbyRoutes = require('./routes/hobbies');
  console.log('Hobby routes loaded successfully');
} catch (err) {
  console.error('Failed to load hobby routes:', err);
  process.exit(1);
}

try {
  toolRoutes = require('./routes/tools');
  console.log('Tool routes loaded successfully');
} catch (err) {
  console.error('Failed to load tool routes:', err);
  process.exit(1);
}

// データベース接続
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hobby-manager')
  .then(() => {
    console.log('MongoDB接続成功');
  })
  .catch(err => {
    console.error('MongoDB接続エラー:', err);
    process.exit(1);
  });

// ルート登録
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/hobbies', hobbyRoutes);
app.use('/api/tools', toolRoutes);

// 404エラーハンドリング
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.path}`);
  res.status(404).json({
    success: false,
    message: 'リクエストされたリソースが見つかりません'
  });
});

// グローバルエラーハンドリング
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'サーバーエラーが発生しました',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーが起動しました: http://localhost:${PORT}`);
});