import mongoose, { Schema, Document } from 'mongoose';

export interface INote extends Document {
  content: string;
  author: {
    name: string;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema({
  content: {
    type: String,
    required: [true, 'Not içeriği gerekli'],
  },
  author: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
}, {
  timestamps: true,
});

export default mongoose.models.Note || mongoose.model<INote>('Note', NoteSchema);
