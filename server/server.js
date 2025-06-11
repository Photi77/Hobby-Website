// server/server.js - アップロードディレクトリの修正
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// 環境変数の読み込み
dotenv.config();

// Expressアプリの初期化
const app = express();
const PORT = process.env.PORT || 5000;

// アップロードディレクトリの作成
const uploadDirs = ['uploads', 'uploads/profiles', 'uploads/tools'];
uploadDirs.forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (!fs.existsSync(fullPath)) {
    console.log(`Creating directory: ${fullPath}`);
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// ミドルウェア
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静的ファイルの提供
// 重要: アップロードディレクトリを静的ファイルとして公開
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// リクエストロガー
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ルートのインポート
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

// API ルートのテスト用エンドポイント
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API サーバーは正常に動作しています',
    time: new Date().toISOString()
  });
});

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
  console.log('アップロードディレクトリ:', path.join(__dirname, 'uploads'));
  console.log(`静的ファイルアクセス: http://localhost:${PORT}/uploads/`);
});