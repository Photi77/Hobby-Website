// server/controllers/hobbyController.js - 修正版
const Hobby = require('../models/Hobby');
const Tool = require('../models/Tool');

// 趣味の作成
exports.createHobby = async (req, res) => {
  try {
    console.log('Create hobby request received:', req.body);
    console.log('User ID from auth middleware:', req.user.id);
    
    const { name, description, category, isPublic } = req.body;

    const hobby = await Hobby.create({
      name,
      description,
      category,
      isPublic,
      user: req.user.id
    });

    console.log('Hobby created successfully:', hobby);

    res.status(201).json({
      success: true,
      data: hobby
    });
  } catch (err) {
    console.error('Error creating hobby:', err);
    
    // MongoDBエラーの詳細ハンドリング
    if (err.name === 'ValidationError') {
      // バリデーションエラー
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'バリデーションエラー',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: err.message
    });
  }
};

// 自分の趣味一覧取得
exports.getMyHobbies = async (req, res) => {
  try {
    console.log('Fetching hobbies for user:', req.user.id);
    
    const hobbies = await Hobby.find({ user: req.user.id });
    
    console.log(`Found ${hobbies.length} hobbies for user ${req.user.id}`);

    res.status(200).json({
      success: true,
      count: hobbies.length,
      data: hobbies
    });
  } catch (err) {
    console.error('Error fetching my hobbies:', err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: err.message
    });
  }
};

// 公開趣味一覧取得
exports.getPublicHobbies = async (req, res) => {
  try {
    const hobbies = await Hobby.find({ isPublic: true })
      .populate('user', 'username profilePicture');

    res.status(200).json({
      success: true,
      count: hobbies.length,
      data: hobbies
    });
  } catch (err) {
    console.error('Error fetching public hobbies:', err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: err.message
    });
  }
};

// 特定の趣味を取得
exports.getHobby = async (req, res) => {
  try {
    const hobby = await Hobby.findById(req.params.id)
      .populate('user', 'username profilePicture');

    if (!hobby) {
      return res.status(404).json({
        success: false,
        message: '趣味が見つかりません'
      });
    }

    // 非公開の趣味は所有者のみアクセス可能
    if (!hobby.isPublic && hobby.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'この趣味にアクセスする権限がありません'
      });
    }

    res.status(200).json({
      success: true,
      data: hobby
    });
  } catch (err) {
    console.error('Error fetching hobby details:', err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: err.message
    });
  }
};

// server/controllers/hobbyController.js の updateHobby メソッド修正
exports.updateHobby = async (req, res) => {
  try {
    console.log('Update hobby request for ID:', req.params.id);
    console.log('Update data:', req.body);
    console.log('Current user ID from auth middleware:', req.user.id);
    
    let hobby = await Hobby.findById(req.params.id);

    if (!hobby) {
      console.error('Hobby not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: '趣味が見つかりません'
      });
    }

    // ログで詳細情報を出力
    console.log('Hobby owner ID (string):', hobby.user.toString());
    console.log('Authenticated user ID (string):', req.user.id.toString());
    console.log('Are IDs equal?', hobby.user.toString() === req.user.id.toString());
    
    // 所有者のみ更新可能 - 文字列比較を確実に行う
    if (hobby.user.toString() !== req.user.id.toString()) {
      console.error('User does not own this hobby. Hobby owner:', hobby.user.toString(), 'Current user:', req.user.id.toString());
      return res.status(403).json({
        success: false,
        message: 'この趣味を更新する権限がありません'
      });
    }

    // リクエストデータの処理
    const updateData = { ...req.body };
    
    // isPublicをBoolean型に変換
    if (updateData.isPublic !== undefined) {
      updateData.isPublic = updateData.isPublic === 'true' || updateData.isPublic === true;
    }

    console.log('Final update data:', updateData);

    // MongooseのfindByIdAndUpdateを使用して更新
    hobby = await Hobby.findByIdAndUpdate(req.params.id, updateData, {
      new: true,  // 更新後のドキュメントを返す
      runValidators: true  // バリデーションを実行
    });

    console.log('Hobby updated successfully:', hobby);

    res.status(200).json({
      success: true,
      data: hobby
    });
  } catch (err) {
    console.error('Error updating hobby:', err);
    
    // MongoDBエラーの詳細ハンドリング
    if (err.name === 'ValidationError') {
      // バリデーションエラー
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'バリデーションエラー',
        errors: messages
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: err.message
    });
  }
};

// 趣味を削除
exports.deleteHobby = async (req, res) => {
  try {
    const hobby = await Hobby.findById(req.params.id);

    if (!hobby) {
      return res.status(404).json({
        success: false,
        message: '趣味が見つかりません'
      });
    }

    // 所有者のみ削除可能
    if (hobby.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'この趣味を削除する権限がありません'
      });
    }

    // 関連する道具も削除
    await Tool.deleteMany({ hobby: req.params.id });
    
    await hobby.deleteOne();

    res.status(200).json({
      success: true,
      message: '趣味と関連する道具が削除されました'
    });
  } catch (err) {
    console.error('Error deleting hobby:', err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: err.message
    });
  }
};

// テスト用にエクスポートの確認
console.log('HobbyController exports:');
console.log('- createHobby:', typeof exports.createHobby);
console.log('- getMyHobbies:', typeof exports.getMyHobbies);
console.log('- getPublicHobbies:', typeof exports.getPublicHobbies);
console.log('- getHobby:', typeof exports.getHobby);
console.log('- updateHobby:', typeof exports.updateHobby);
console.log('- deleteHobby:', typeof exports.deleteHobby);