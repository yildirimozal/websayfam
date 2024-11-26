import mongoose from 'mongoose';

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  publishedAt: {
    type: Date,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const News = mongoose.models.News || mongoose.model('News', newsSchema);
