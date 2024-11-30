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
  color: string;
  fontFamily: string;
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

// Sistem sayacı için yeni bir schema
const SystemTimerSchema = new Schema({
  _id: { type: String, default: 'timer' },
  startTime: { type: Date, default: Date.now },
  duration: { type: Number, default: 60000 } // 1 dakika
});

export const SystemTimer = mongoose.models.SystemTimer || mongoose.model('SystemTimer', SystemTimerSchema);

const PublicNoteSchema = new Schema({
  type: String,
  content: String,
  position: {
    x: Number,
    y: Number
  },
  size: {
    width: Number,
    height: Number
  },
  rotation: Number,
  color: String,
  fontFamily: String,
  author: {
    name: String,
    email: String,
    image: String
  },
  likes: [String],
  comments: [{
    userId: String,
    content: String,
    createdAt: { type: Date, default: Date.now },
    author: {
      id: String,
      name: String,
      email: String,
      image: String
    }
  }]
}, {
  timestamps: true,
  strict: false,
  minimize: false
});

// Virtuals
PublicNoteSchema.virtual('likeCount').get(function() {
  return this.likes?.length || 0;
});

PublicNoteSchema.virtual('commentCount').get(function() {
  return this.comments?.length || 0;
});

// Hooks
PublicNoteSchema.pre('save', function(next) {
  if (!this.color) this.color = '#fff9c4';
  if (!this.fontFamily) this.fontFamily = 'Roboto';
  next();
});

// JSON dönüşümü
PublicNoteSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: function(doc: any, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  }
});

export default mongoose.models.PublicNote || mongoose.model<IPublicNote>('PublicNote', PublicNoteSchema);
