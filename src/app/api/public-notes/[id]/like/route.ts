import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PublicNote from '@/models/PublicNote';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    if (!session.user?.id) {
      return NextResponse.json(
        { error: 'Kullanıcı ID bulunamadı' },
        { status: 400 }
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

    const userId = session.user.id;
    const likeIndex = note.likes.indexOf(userId);

    if (likeIndex === -1) {
      note.likes.push(userId);
    } else {
      note.likes.splice(likeIndex, 1);
    }

    await note.save();

    return NextResponse.json({
      likes: note.likes,
      likeCount: note.likes.length
    });
  } catch (error) {
    console.error('Beğeni işlemi sırasında hata:', error);
    return NextResponse.json(
      { error: 'Beğeni işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
