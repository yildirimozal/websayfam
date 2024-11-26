import mongoose, { Schema } from 'mongoose';

interface INote {
  content: string;
  position: {
    x: number;
    y: number;
  };
  type: 'text' | 'image' | 'video';
  url?: string;
  rotation: number;
  color: string;
  createdAt: Date;
  userId: string;
}

const noteSchema = new Schema<INote>({
  content: {
    type: String,
    required: true
  },
  position: {
    x: { type: Number, required: true },
    y: { type: Number, required: true }
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video'],
    required: true
  },
  url: {
    type: String,
    required: function(this: INote) {
      return this.type === 'image' || this.type === 'video';
    }
  },
  rotation: {
    type: Number,
    default: 0
  },
  color: {
    type: String,
    default: 'yellow'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: String,
    required: true
  }
});

export const Note = mongoose.models.Note || mongoose.model<INote>('Note', noteSchema);
