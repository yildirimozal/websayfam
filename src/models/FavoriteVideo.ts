import mongoose from 'mongoose';

const FavoriteVideoSchema = new mongoose.Schema({
  videoId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  thumbnail: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

export default mongoose.models.FavoriteVideo || mongoose.model('FavoriteVideo', FavoriteVideoSchema);
