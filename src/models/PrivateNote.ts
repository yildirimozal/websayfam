import mongoose from 'mongoose';

const PrivateNoteSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['note', 'image'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true,
    index: true
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
    transform: function(doc, ret) {
      ret.id = ret._id.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

PrivateNoteSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

PrivateNoteSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

export default mongoose.models.PrivateNote || mongoose.model('PrivateNote', PrivateNoteSchema);
