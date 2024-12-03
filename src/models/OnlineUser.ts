import mongoose from 'mongoose';

const OnlineUserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  lastSeen: { type: Date, default: Date.now }
}, {
  strict: true,
  timestamps: true
});

// Mevcut koleksiyonu temizle
try {
  if (mongoose.models.OnlineUser) {
    delete mongoose.models.OnlineUser;
  }
} catch (error) {
  console.error('Model temizleme hatası:', error);
}

export const OnlineUser = mongoose.models.OnlineUser || mongoose.model('OnlineUser', OnlineUserSchema);
