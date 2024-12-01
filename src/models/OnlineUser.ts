import mongoose, { Schema } from 'mongoose';

export interface IOnlineUser {
  userId: string;
  userName: string;
  lastSeen: Date;
}

const onlineUserSchema = new Schema<IOnlineUser>({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  userName: {
    type: String,
    required: true
  },
  lastSeen: {
    type: Date,
    required: true,
    default: Date.now
  }
});

// 5 dakika içinde aktivite göstermeyen kullanıcıları offline olarak kabul et
onlineUserSchema.index({ lastSeen: 1 }, { 
  expireAfterSeconds: 300 
});

export const OnlineUser = mongoose.models.OnlineUser || mongoose.model<IOnlineUser>('OnlineUser', onlineUserSchema);
