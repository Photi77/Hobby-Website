// server/controllers/userController.js - 修正版
const User = require('../models/User');
const Hobby = require('../models/Hobby');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// ファイルアップロード設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/profiles';
    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// アップロード制限
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('画像ファイルのみアップロード可能です (jpeg, jpg, png, webp)'));
  }
});

exports.uploadProfilePicture = upload.single('profilePicture');

// ユーザー情報取得
exports.getUser = async (req, res) => {
  try {
    console.log('Getting user info for ID:', req.params.id);
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'ユーザーが見つかりません'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
};

// ユーザー情報更新
exports.updateUser = async (req, res) => {
  try {
    console.log('Update user request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User ID from auth:', req.user.id);

    // パスワードは別のエンドポイントで更新
    const { username, email, bio } = req.body;
    const updateData = { username, email, bio };

    // 入力バリデーション
    if (!username || username.trim().length < 3) {
      return res.status(400).json({
        success: false,
        message: 'ユーザー名は3文字以上である必要があります'
      });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({
        success: false,
        message: '有効なメールアドレスを入力してください'
      });
    }

    // プロフィール画像がアップロードされた場合
    if (req.file) {
      console.log('New profile picture uploaded:', req.file.filename);
      
      // 古いプロフィール画像を削除（デフォルト画像以外）
      const user = await User.findById(req.user.id);
      if (user.profilePicture && 
          user.profilePicture !== 'default-profile.jpg' && 
          !user.profilePicture.startsWith('http')) {
        const oldImagePath = path.join(__dirname, '..', 'uploads', 'profiles', path.basename(user.profilePicture));
        if (fs.existsSync(oldImagePath)) {
          console.log('Removing old profile picture:', oldImagePath);
          fs.unlinkSync(oldImagePath);
        }
      }

      updateData.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }

    // メールアドレスの重複チェック（自分以外）
    const existingUser = await User.findOne({ 
      email: email, 
      _id: { $ne: req.user.id } 
    });
    
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'このメールアドレスは既に使用されています'
      });
    }

    // ユーザー名の重複チェック（自分以外）
    const existingUsername = await User.findOne({ 
      username: username, 
      _id: { $ne: req.user.id } 
    });
    
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'このユーザー名は既に使用されています'
      });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true
    }).select('-password');

    console.log('User updated successfully:', user.username);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error('Update user error:', err);
    
    // Multerエラーハンドリング
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'ファイルサイズが2MBを超えています'
        });
      }
    }
    
    // MongoDBバリデーションエラー
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'バリデーションエラー',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
};

// パスワード更新
exports.updatePassword = async (req, res) => {
  try {
    console.log('Update password request received');
    const { currentPassword, newPassword } = req.body;

    // 入力バリデーション
    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        message: '現在のパスワードを入力してください'
      });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: '新しいパスワードは6文字以上である必要があります'
      });
    }

    const user = await User.findById(req.user.id);

    // 現在のパスワードを検証
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: '現在のパスワードが正しくありません'
      });
    }

    user.password = newPassword;
    await user.save();

    console.log('Password updated successfully for user:', user.username);

    res.status(200).json({
      success: true,
      message: 'パスワードが更新されました'
    });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
};

// ユーザーの趣味一覧取得
exports.getUserHobbies = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Getting hobbies for user ID:', userId);

    // 公開されている趣味のみ取得（自分の場合は全て）
    let query = { user: userId };
    if (userId !== req.user.id) {
      query.isPublic = true;
    }

    const hobbies = await Hobby.find(query);

    res.status(200).json({
      success: true,
      count: hobbies.length,
      data: hobbies
    });
  } catch (err) {
    console.error('Get user hobbies error:', err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
};