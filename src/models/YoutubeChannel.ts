import mongoose from 'mongoose';

const YoutubeChannelSchema = new mongoose.Schema({
  channelId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  customUrl: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.YoutubeChannel || mongoose.model('YoutubeChannel', YoutubeChannelSchema);
