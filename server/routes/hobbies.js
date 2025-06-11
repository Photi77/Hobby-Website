// server/routes/hobbies.js - 修正版
const express = require('express');
const router = express.Router();
const hobbyController = require('../controllers/hobbyController');
const { protect } = require('../middleware/auth');

// 趣味の作成
router.post('/', protect, hobbyController.createHobby);

// 自分の趣味一覧取得
router.get('/me', protect, hobbyController.getMyHobbies);

// 公開趣味一覧取得
router.get('/public', protect, hobbyController.getPublicHobbies);

// 特定の趣味を取得
router.get('/:id', protect, hobbyController.getHobby);

// 趣味を更新
router.put('/:id', protect, hobbyController.updateHobby);

// 趣味を削除
router.delete('/:id', protect, hobbyController.deleteHobby);

module.exports = router;