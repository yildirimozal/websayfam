import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PublicNote from '@/models/PublicNote';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/config';

interface Comment {
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

const formatNote = (note: any) => {
  if (!note) return null;
  const formatted = { ...note.toObject() };
  formatted.id = formatted._id.toString();
  delete formatted._id;
  delete formatted.__v;
  return formatted;
};

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const note = await PublicNote.findById(params.id);
    
    if (!note) {
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    // Yorumu bul
    const comment = note.comments.find((c: any) => {
      const commentId = c.userId + '_' + new Date(c.createdAt).getTime();
      return commentId === params.commentId;
    });
    
    if (!comment) {
      return NextResponse.json(
        { error: 'Yorum bulunamadı' },
        { status: 404 }
      );
    }

    // Yetkilendirme kontrolü
    const isAdmin = session.user.email === 'ozalyildirim@firat.edu.tr';
    const isNoteOwner = note.author.email === session.user.email;
    const isCommentOwner = comment.author.email === session.user.email;

    if (!isAdmin && !isNoteOwner && !isCommentOwner) {
      return NextResponse.json(
        { error: 'Bu yorumu silme yetkiniz yok' },
        { status: 403 }
      );
    }

    // Yorumu sil
    const updatedNote = await PublicNote.findByIdAndUpdate(
      params.id,
      { 
        $pull: { 
          comments: { 
            $and: [
              { userId: comment.userId },
              { createdAt: comment.createdAt }
            ]
          }
        }
      },
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updatedNote) {
      return NextResponse.json(
        { error: 'Yorum silinemedi' },
        { status: 500 }
      );
    }

    const formattedNote = formatNote(updatedNote);
    return NextResponse.json(formattedNote);
  } catch (error) {
    console.error('Yorum silme hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
