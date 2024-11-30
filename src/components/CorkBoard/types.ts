export interface Note {
  id: string;
  _id?: string; // MongoDB için
  type: 'note' | 'image';
  content?: string; // Metin notları için
  url?: string; // Resim notları için
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
  author?: {
    name: string;
    email: string;
    image?: string;
  };
  userId?: string;
  likes: string[];
  comments: Comment[];
  likeCount?: number;
  commentCount?: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface Comment {
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

export interface AddNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (content: string, type: 'note' | 'image', color: string, fontFamily: string) => void;
}

export interface EditNoteDialogProps {
  note: Note;
  open: boolean;
  onClose: () => void;
  onSave: (content: string, color: string, fontFamily: string) => void;
}

export interface CommentDialogProps {
  note: Note;
  open: boolean;
  onClose: () => void;
  onAddComment: (content: string) => void;
  onDeleteComment: (commentId: string) => void;
  canDeleteComment: (comment: Comment) => boolean;
}

export interface CorkBoardContainerProps {
  isLoading: boolean;
  error: string | null;
  onErrorClose: () => void;
  isAdmin: boolean;
  onAddClick: () => void;
  boardRef: React.RefObject<HTMLDivElement>;
  children: React.ReactNode;
}

export interface NoteCardProps {
  note: Note;
  isActive: boolean;
  isResizing: boolean;
  isAdmin: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  onResize: (e: any, data: { size: { width: number; height: number } }) => void;
  onResizeStop: (e: any, data: { size: { width: number; height: number } }) => void;
  onEdit: () => void;
  onDelete: () => void;
}
