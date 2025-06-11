// server/controllers/toolController.js - 修正版
const Tool = require('../models/Tool');
const Hobby = require('../models/Hobby');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// ファイルアップロード設定
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/tools';
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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

// 画像アップロードミドルウェア
exports.uploadImage = upload.array('images', 5); // 最大5枚まで

// 道具の作成
exports.createTool = async (req, res) => {
  try {
    console.log('Create tool request received:', req.body);
    console.log('User ID from auth middleware:', req.user.id);
    console.log('Files uploaded:', req.files);
    
    const { name, description, brand, model, purchaseDate, price, condition, hobby, isPublic } = req.body;

    // Hobbyの存在確認
    console.log('Checking hobby existence for ID:', hobby);
    const hobbyDoc = await Hobby.findById(hobby);
    if (!hobbyDoc) {
      console.error('Hobby not found:', hobby);
      return res.status(404).json({
        success: false,
        message: '趣味が見つかりません'
      });
    }

    // 趣味の所有者のみ道具を追加可能
    if (hobbyDoc.user.toString() !== req.user.id) {
      console.error('User does not own this hobby. Hobby owner:', hobbyDoc.user, 'Current user:', req.user.id);
      return res.status(403).json({
        success: false,
        message: 'この趣味に道具を追加する権限がありません'
      });
    }

    // 画像ファイルパスの配列を作成
    const images = req.files ? req.files.map(file => `/uploads/tools/${file.filename}`) : [];
    console.log('Image paths:', images);

    // 価格をNumber型に変換
    const numericPrice = price ? Number(price) : undefined;
    
    // isPublicをBoolean型に変換
    const boolIsPublic = isPublic === 'true' || isPublic === true;

    const tool = await Tool.create({
      name,
      description,
      brand: brand || '',
      model: model || '',
      purchaseDate: purchaseDate || null,
      price: numericPrice,
      condition,
      images,
      hobby,
      user: req.user.id,
      isPublic: boolIsPublic
    });

    console.log('Tool created successfully:', tool);

    res.status(201).json({
      success: true,
      data: tool
    });
  } catch (err) {
    console.error('Error creating tool:', err);
    
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

// 趣味に関連する道具一覧取得
exports.getToolsByHobby = async (req, res) => {
  try {
    const { hobbyId } = req.params;
    console.log('Fetching tools for hobby ID:', hobbyId);

    // 対象の趣味が存在するか確認
    const hobby = await Hobby.findById(hobbyId);
    if (!hobby) {
      console.error('Hobby not found:', hobbyId);
      return res.status(404).json({
        success: false,
        message: '趣味が見つかりません'
      });
    }

    // 非公開の趣味は所有者のみアクセス可能
    if (!hobby.isPublic && hobby.user.toString() !== req.user.id) {
      console.error('User does not have access to this private hobby');
      return res.status(403).json({
        success: false,
        message: 'この趣味の道具にアクセスする権限がありません'
      });
    }

    // 公開設定に応じて道具を取得
    let toolQuery = { hobby: hobbyId };
    if (hobby.user.toString() !== req.user.id) {
      toolQuery.isPublic = true;
    }

    const tools = await Tool.find(toolQuery);
    console.log(`Found ${tools.length} tools for hobby ID ${hobbyId}`);

    res.status(200).json({
      success: true,
      count: tools.length,
      data: tools
    });
  } catch (err) {
    console.error('Error fetching tools by hobby:', err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: err.message
    });
  }
};

// 自分の道具一覧取得
exports.getMyTools = async (req, res) => {
  try {
    console.log('Fetching tools for user ID:', req.user.id);
    
    const tools = await Tool.find({ user: req.user.id })
      .populate('hobby', 'name category');
    
    console.log(`Found ${tools.length} tools for user ${req.user.id}`);

    res.status(200).json({
      success: true,
      count: tools.length,
      data: tools
    });
  } catch (err) {
    console.error('Error fetching user tools:', err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: err.message
    });
  }
};

// 特定の道具を取得
exports.getTool = async (req, res) => {
  try {
    console.log('Fetching tool details for ID:', req.params.id);
    
    const tool = await Tool.findById(req.params.id)
      .populate('hobby', 'name category user isPublic')
      .populate('user', 'username profilePicture');

    if (!tool) {
      console.error('Tool not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: '道具が見つかりません'
      });
    }

    // 非公開の道具や非公開の趣味に関連付けられた道具は所有者のみアクセス可能
    if ((!tool.isPublic || !tool.hobby.isPublic) && tool.user._id.toString() !== req.user.id) {
      console.error('User does not have access to this private tool');
      return res.status(403).json({
        success: false,
        message: 'この道具にアクセスする権限がありません'
      });
    }

    res.status(200).json({
      success: true,
      data: tool
    });
  } catch (err) {
    console.error('Error fetching tool details:', err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: err.message
    });
  }
};

// server/controllers/toolController.js の updateTool メソッド修正
exports.updateTool = async (req, res) => {
  try {
    console.log('Update tool request for ID:', req.params.id);
    console.log('Update data:', req.body);
    console.log('Files uploaded:', req.files);
    console.log('Current user ID from auth middleware:', req.user.id);
    
    let tool = await Tool.findById(req.params.id);

    if (!tool) {
      console.error('Tool not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: '道具が見つかりません'
      });
    }

    // ログで詳細情報を出力
    console.log('Tool owner ID (string):', tool.user.toString());
    console.log('Authenticated user ID (string):', req.user.id.toString());
    console.log('Are IDs equal?', tool.user.toString() === req.user.id.toString());
    
    // 所有者のみ更新可能 - 文字列比較を確実に行う
    if (tool.user.toString() !== req.user.id.toString()) {
      console.error('User does not own this tool. Tool owner:', tool.user.toString(), 'Current user:', req.user.id.toString());
      return res.status(403).json({
        success: false,
        message: 'この道具を更新する権限がありません'
      });
    }

    // リクエストデータの処理
    const updateData = { ...req.body };
    
    // 価格をNumber型に変換
    if (updateData.price) {
      updateData.price = Number(updateData.price);
    }
    
    // isPublicをBoolean型に変換
    if (updateData.isPublic !== undefined) {
      updateData.isPublic = updateData.isPublic === 'true' || updateData.isPublic === true;
    }

    // 既存の画像を処理
    if (updateData.existingImages) {
      try {
        const existingImages = JSON.parse(updateData.existingImages);
        console.log('Received existing images:', existingImages);
        updateData.images = existingImages;
        delete updateData.existingImages;
      } catch (err) {
        console.error('Error parsing existing images:', err);
      }
    }

    // 新しい画像ファイルの処理
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/tools/${file.filename}`);
      console.log('New image paths:', newImages);
      
      // 既存の画像配列に新しい画像を追加
      if (updateData.images) {
        updateData.images = [...updateData.images, ...newImages];
      } else {
        updateData.images = [...(tool.images || []), ...newImages];
      }
    }

    console.log('Final update data:', updateData);

    // MongooseのfindByIdAndUpdateを使用して更新
    tool = await Tool.findByIdAndUpdate(req.params.id, updateData, {
      new: true,  // 更新後のドキュメントを返す
      runValidators: true  // バリデーションを実行
    });

    console.log('Tool updated successfully:', tool);

    res.status(200).json({
      success: true,
      data: tool
    });
  } catch (err) {
    console.error('Error updating tool:', err);
    
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

// 道具を削除
exports.deleteTool = async (req, res) => {
  try {
    console.log('Delete tool request for ID:', req.params.id);
    
    const tool = await Tool.findById(req.params.id);

    if (!tool) {
      console.error('Tool not found:', req.params.id);
      return res.status(404).json({
        success: false,
        message: '道具が見つかりません'
      });
    }

    // 所有者のみ削除可能
    if (tool.user.toString() !== req.user.id) {
      console.error('User does not own this tool');
      return res.status(403).json({
        success: false,
        message: 'この道具を削除する権限がありません'
      });
    }

    // 画像ファイルの削除
    if (tool.images && tool.images.length > 0) {
      console.log('Removing image files:', tool.images);
      
      tool.images.forEach(image => {
        const imagePath = path.join(__dirname, '..', image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
          console.log('Removed file:', imagePath);
        } else {
          console.log('File not found:', imagePath);
        }
      });
    }

    await tool.deleteOne();
    console.log('Tool deleted successfully');

    res.status(200).json({
      success: true,
      message: '道具が削除されました'
    });
  } catch (err) {
    console.error('Error deleting tool:', err);
    res.status(500).json({
      success: false,
      message: 'サーバーエラーが発生しました',
      error: err.message
    });
  }
};



// モジュールのエクスポートをコンソールに出力（デバッグ用）
console.log('ToolController exports:');
console.log('- uploadImage:', typeof exports.uploadImage);
console.log('- createTool:', typeof exports.createTool);
console.log('- getToolsByHobby:', typeof exports.getToolsByHobby);
console.log('- getMyTools:', typeof exports.getMyTools);
console.log('- getTool:', typeof exports.getTool);
console.log('- updateTool:', typeof exports.updateTool);
console.log('- deleteTool:', typeof exports.deleteTool);
