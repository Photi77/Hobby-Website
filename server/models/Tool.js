// server/models/Tool.js
const mongoose = require('mongoose');

const ToolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    default: ''
  },
  model: {
    type: String,
    default: ''
  },
  purchaseDate: {
    type: Date
  },
  price: {
    type: Number
  },
  condition: {
    type: String,
    enum: ['新品', '良好', '普通', '使用済み', '修理が必要'],
    default: '良好'
  },
  images: [{
    type: String
  }],
  hobby: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hobby',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// 仮想フィールド: フルパスの画像URL
ToolSchema.virtual('imageUrls').get(function() {
  if (!this.images || this.images.length === 0) {
    return [];
  }
  
  // 開発環境またはプロダクション環境に応じてベースURLを設定
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.BASE_URL || '' 
    : 'http://localhost:5000';
  
  return this.images.map(image => `${baseUrl}${image}`);
});

// toJSON変換時に仮想プロパティを含める
ToolSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v; // バージョンキーを削除
    return ret;
  }
});

// トリガー: 削除前に関連リソースを削除
ToolSchema.pre('remove', async function(next) {
  try {
    // 関連する画像ファイルの削除ロジックをここに記述
    // ※ファイルシステム操作はコントローラーで実装
    
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Tool', ToolSchema);
