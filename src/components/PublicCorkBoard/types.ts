export interface Author {
  name: string;
  email: string;
  image?: string;
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string;
    email?: string;
    image?: string;
  };
}

export interface Note {
  id: string;
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
  author: Author;
  likes: string[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AddNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (content: string, type: 'note' | 'image', color: string, fontFamily: string) => void;
}

export interface EditNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (content: string, color: string, fontFamily: string) => void;
  note: Note;
}

export interface CommentDialogProps {
  note: Note;
  open: boolean;
  onClose: () => void;
  onAddComment: (content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  canDeleteComment: (comment: Comment) => boolean;
}

export interface NoteCardProps {
  note: Note;
  isActive: boolean;
  isResizing: boolean;
  canEdit: boolean;
  canMove: boolean;
  isLiked: boolean;
  onDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
  onResize: (e: any, direction: any, ref: any, delta: any, position: any) => void;
  onResizeStop: () => void;
  onDelete: () => void;
  onLikeToggle: () => void;
  onCommentClick: () => void;
  onEdit: () => void;
}
