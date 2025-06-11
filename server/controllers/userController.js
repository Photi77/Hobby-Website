// server/controllers/userController.js
const User = require('../models/User');
const Hobby = require('../models/Hobby');
const Tool = require('../models/Tool');
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
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
};

// ユーザー情報更新
exports.updateUser = async (req, res) => {
  try {
    // パスワードは別のエンドポイントで更新
    const { username, email, bio } = req.body;
    const updateData = { username, email, bio };

    // プロフィール画像がアップロードされた場合
    if (req.file) {
      // 古いプロフィール画像を削除（デフォルト画像以外）
      const user = await User.findById(req.user.id);
      if (user.profilePicture && user.profilePicture !== 'default-profile.jpg') {
        const imagePath = path.join(__dirname, '..', 'uploads', 'profiles', path.basename(user.profilePicture));
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      updateData.profilePicture = `/uploads/profiles/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
};

// パスワード更新
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

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

    res.status(200).json({
      success: true,
      message: 'パスワードが更新されました'
    });
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました'
    });
  }
};
