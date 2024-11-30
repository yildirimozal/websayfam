import mongoose, { Schema } from 'mongoose';

interface IComment {
  userId: string;
  content: string;
  createdAt: Date;
}

export interface IPrivateNote {
  _id?: string;
  content: string;
  position: {
    x: number;
    y: number;
  };
  type: 'note' | 'image' | 'video';
  url?: string;
  rotation: number;
  color: string;
  fontFamily: string;
  createdAt: Date;
  userId: string;
  likes: string[];
  comments: IComment[];
  size?: {
    width: number;
    height: number;
  };
}

const commentSchema = new Schema<IComment>({
  userId: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 200
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const privateNoteSchema = new Schema<IPrivateNote>({
  content: {
    type: String,
    required: true,
    maxlength: 200
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  type: {
    type: String,
    enum: ['note', 'image', 'video'],
    required: true
  },
  url: {
    type: String,
    required: function(this: IPrivateNote) {
      return this.type === 'image' || this.type === 'video';
    }
  },
  rotation: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: '#fff9c4'
  },
  fontFamily: {
    type: String,
    default: 'Roboto'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: String,
    required: true
  },
  likes: [{
    type: String,
    ref: 'User'
  }],
  comments: [commentSchema],
  size: {
    width: { type: Number },
    height: { type: Number }
  }
});

// Beğeni sayısını hesaplayan virtual alan
privateNoteSchema.virtual('likeCount').get(function() {
  return this.likes?.length || 0;
});

// Yorum sayısını hesaplayan virtual alan
privateNoteSchema.virtual('commentCount').get(function() {
  return this.comments?.length || 0;
});

// JSON dönüşümünde virtual alanları dahil et
privateNoteSchema.set('toJSON', { virtuals: true });
privateNoteSchema.set('toObject', { virtuals: true });

export const PrivateNote = mongoose.models.PrivateNote || mongoose.model<IPrivateNote>('PrivateNote', privateNoteSchema);
