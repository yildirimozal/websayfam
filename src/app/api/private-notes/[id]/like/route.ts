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

    await connectToDatabase();
    const note = await PrivateNote.findById(params.id);
    
    if (!note) {
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    if (!note.likes) {
      note.likes = [];
    }

    const userId = session.user.id;
    const likeIndex = note.likes.indexOf(userId);

    if (likeIndex === -1) {
      // Beğeni ekle
      note.likes.push(userId);
    } else {
      // Beğeniyi kaldır
      note.likes.splice(likeIndex, 1);
    }

    await note.save();

    return NextResponse.json({
      likes: note.likes,
      likeCount: note.likes.length,
      isLiked: likeIndex === -1
    });
  } catch (error) {
    console.error('Beğeni işlemi sırasında hata:', error);
    return NextResponse.json(
      { error: 'Beğeni işlemi sırasında bir hata oluştu' },
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

    // Giriş yapmayan kullanıcılar için isLiked false olacak
    const session = await getServerSession(authOptions);
    const isLiked = session?.user?.id ? note.likes.includes(session.user.id) : false;

    // Beğeni sayısını ve durumunu herkes görebilir
    return NextResponse.json({
      likeCount: note.likes.length,
      isLiked
    });
  } catch (error) {
    console.error('Beğeni bilgisi alınırken hata:', error);
    return NextResponse.json(
      { error: 'Beğeni bilgisi alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}
