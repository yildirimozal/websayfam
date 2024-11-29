import { IPrivateNote } from '@/models/PrivateNote';

export type Note = IPrivateNote & {
  likeCount?: number;
  commentCount?: number;
};

export interface DragOffset {
  x: number;
  y: number;
}

export interface Comment {
  userId: string;
  content: string;
  createdAt: Date;
}
