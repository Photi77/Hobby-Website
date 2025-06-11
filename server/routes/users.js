
// server/routes/users.js - 修正版
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// ユーザー情報取得
router.get('/:id', protect, userController.getUser);

// プロフィール更新
router.put('/update', protect, userController.uploadProfilePicture, userController.updateUser);

// パスワード更新
router.put('/update-password', protect, userController.updatePassword);

// ユーザーの趣味一覧取得
router.get('/:id/hobbies', protect, userController.getUserHobbies);

module.exports = router;