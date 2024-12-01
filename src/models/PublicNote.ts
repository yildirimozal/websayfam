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
  content?: string;
  url?: string;
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

// 12 saat = 12 * 60 * 60 * 1000 milisaniye
const TIMER_DURATION = 12 * 60 * 60 * 1000;

// Sistem sayacı için schema
const SystemTimerSchema = new Schema({
  _id: { type: String, default: 'timer' },
  startTime: { type: Date, default: Date.now },
  duration: { type: Number, default: TIMER_DURATION }, // 12 saat
  userNotes: [{
    email: String,
    count: { type: Number, default: 0 }
  }]
});

export const SystemTimer = mongoose.models.SystemTimer || mongoose.model('SystemTimer', SystemTimerSchema);

const PublicNoteSchema = new Schema({
  type: { type: String, required: true, enum: ['note', 'image'] },
  content: String,
  url: String,
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  size: {
    width: { type: Number, required: true },
    height: { type: Number, required: true }
  },
  rotation: { type: Number, default: 0 },
  color: { type: String, default: '#fff9c4' },
  fontFamily: { type: String, default: 'Roboto' },
  author: {
    name: { type: String, required: true },
    email: { type: String, required: true },
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
  if (this.type === 'image' && !this.url) {
    next(new Error('Image notes must have a URL'));
    return;
  }
  if (this.type === 'note' && !this.content) {
    next(new Error('Text notes must have content'));
    return;
  }
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
