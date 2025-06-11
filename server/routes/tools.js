// server/routes/tools.js - 修正版
const express = require('express');
const router = express.Router();
const toolController = require('../controllers/toolController');
const { protect } = require('../middleware/auth');

// デバッグ: toolControllerの内容をチェック
console.log('Tool routes - Controller imports:');
console.log('- toolController type:', typeof toolController);
console.log('- toolController keys:', Object.keys(toolController));

// ファイルアップロードミドルウェアを含むルート
// 道具の作成
router.post('/', protect, toolController.uploadImage, toolController.createTool);

// 趣味に関連する道具一覧取得
router.get('/hobby/:hobbyId', protect, toolController.getToolsByHobby);

// 自分の道具一覧取得
router.get('/me', protect, toolController.getMyTools);

// 特定の道具を取得
router.get('/:id', protect, toolController.getTool);

// 道具を更新
router.put('/:id', protect, toolController.uploadImage, toolController.updateTool);

// 道具を削除
router.delete('/:id', protect, toolController.deleteTool);

module.exports = router;