import mongoose, { Schema, Document } from 'mongoose';

interface IAuthor {
  name: string;
  email: string;
}

export interface IBlog extends Document {
  title: string;
  content: string;
  slug: string;
  author: IAuthor;
  tags: string[];
  published: boolean;
  views: number;
  likes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Başlık gereklidir'],
    trim: true,
    maxlength: [100, 'Başlık 100 karakterden uzun olamaz']
  },
  content: {
    type: String,
    required: [true, 'İçerik gereklidir']
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  author: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  published: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0,
    required: true
  },
  likes: {
    type: [String],
    default: [],
    required: true
  }
}, {
  timestamps: true,
  strict: true // Şemada tanımlanmayan alanların kaydedilmesini engelle
});

// Koleksiyon adını küçük harfle ve çoğul olarak belirt
const Blog = mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema, 'blogs');

export default Blog;
