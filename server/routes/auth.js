// server/routes/auth.js - 完全に書き直したバージョン
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// デバッグ: authControllerの内容をチェック
console.log('Auth routes - Controller imports:');
console.log('- authController type:', typeof authController);
console.log('- authController keys:', Object.keys(authController));
console.log('- register type:', typeof authController.register);
console.log('- login type:', typeof authController.login);
console.log('- getMe type:', typeof authController.getMe);

// ルート定義
router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', protect, authController.getMe);

module.exports = router;