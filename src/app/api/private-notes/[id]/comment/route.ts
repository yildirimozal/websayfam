import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PrivateNote, IPrivateNote } from '@/models/PrivateNote';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    const { content } = await request.json();
    if (!content) {
      return NextResponse.json(
        { error: 'Yorum içeriği gerekli' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const note = await PrivateNote.findById(params.id);
    
    if (!note) {
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    if (!note.comments) {
      note.comments = [];
    }

    const comment = {
      userId: session.user.id,
      userName: session.user.name || 'Anonim',
      userImage: session.user.image || null,
      content,
      createdAt: new Date()
    };

    note.comments.push(comment);
    await note.save();

    return NextResponse.json({
      comment,
      commentCount: note.comments.length
    });
  } catch (error) {
    console.error('Yorum ekleme sırasında hata:', error);
    return NextResponse.json(
      { error: 'Yorum eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const note = await PrivateNote.findById(params.id).lean().exec() as IPrivateNote;
    
    if (!note) {
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    // Yorumları ve yorum sayısını herkes görebilir
    return NextResponse.json({
      comments: note.comments.map(comment => ({
        ...comment,
        userName: comment.userName || 'Anonim',
        createdAt: comment.createdAt
      })),
      commentCount: note.comments.length
    });
  } catch (error) {
    console.error('Yorumları getirme sırasında hata:', error);
    return NextResponse.json(
      { error: 'Yorumlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
