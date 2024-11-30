export interface Author {
  name: string;
  email: string;
  image?: string;
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
  author: Author;
  likes: string[];
  comments: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AddNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (content: string, type: 'note' | 'image') => void;
}

export interface EditNoteDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  note: Note;
}

export interface CommentDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (content: string) => void;
  onDelete?: (commentId: string) => void;
  comments: Comment[];
  onCommentAdd?: () => void;
  noteAuthorEmail?: string;
}

export interface NoteCardProps {
  note: Note;
  isActive: boolean;
  isResizing: boolean;
  canEdit: boolean;
  isLiked: boolean;
  onDragStart: (e: React.MouseEvent | React.TouchEvent) => void;
  onResize: (e: any, data: any) => void;
  onResizeStop: () => void;
  onDelete: () => void;
  onLikeToggle: () => void;
  onCommentClick: () => void;
  onEdit: () => void;
}
