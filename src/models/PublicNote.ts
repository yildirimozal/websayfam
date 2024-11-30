import mongoose, { Schema } from 'mongoose';

interface IComment {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    email?: string;
    image?: string;
  };
}

interface IPublicNote {
  type: 'note' | 'image';
  content: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  rotation: number;
  author: {
    name: string;
    email: string;
    image?: string;
  };
  likes: string[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const commentSchema = new Schema<IComment>({
  userId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  author: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String },
    image: { type: String }
  }
}, {
  _id: false, // MongoDB'nin otomatik _id atamasını devre dışı bırak
  id: false // Mongoose'un virtual id atamasını devre dışı bırak
});

const PublicNoteSchema = new mongoose.Schema<IPublicNote>({
  type: {
    type: String,
    enum: ['note', 'image'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  size: {
    width: { type: Number, default: 200 },
    height: { type: Number, default: 150 }
  },
  rotation: {
    type: Number,
    default: 0
  },
  author: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    image: { type: String }
  },
  likes: [{
    type: String,
    ref: 'User'
  }],
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc: any, ret: Record<string, any>) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      
      // Yorumları düzgün formatlayalım
      if (ret.comments) {
        ret.comments = ret.comments.map((comment: any) => ({
          ...comment,
          id: comment.userId + '_' + comment.createdAt.getTime(), // Benzersiz ID oluştur
          createdAt: comment.createdAt.toISOString()
        }));
      }
      
      return ret;
    }
  }
});

// Beğeni sayısını hesaplayan virtual alan
PublicNoteSchema.virtual('likeCount').get(function() {
  return this.likes?.length || 0;
});

// Yorum sayısını hesaplayan virtual alan
PublicNoteSchema.virtual('commentCount').get(function() {
  return this.comments?.length || 0;
});

PublicNoteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

PublicNoteSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

export default mongoose.models.PublicNote || mongoose.model<IPublicNote>('PublicNote', PublicNoteSchema);
