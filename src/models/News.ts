import mongoose, { Schema, Document } from 'mongoose';

export interface INews extends Document {
  title: string;
  description: string;
  url: string;
  imageUrl: string;
  publishedAt: Date;
  source: string;
  createdAt: Date;
}

const NewsSchema = new Schema<INews>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  publishedAt: {
    type: Date,
    required: true,
  },
  source: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const News = mongoose.models.News || mongoose.model<INews>('News', NewsSchema);
