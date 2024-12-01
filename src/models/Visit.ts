import mongoose, { Schema } from 'mongoose';

export interface IVisit {
  totalVisits: number;
  lastUpdated: Date;
}

const visitSchema = new Schema<IVisit>({
  totalVisits: {
    type: Number,
    required: true,
    default: 0
  },
  lastUpdated: {
    type: Date,
    required: true,
    default: Date.now
  }
});

export const Visit = mongoose.models.Visit || mongoose.model<IVisit>('Visit', visitSchema);
