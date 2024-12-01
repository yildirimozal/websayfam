import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PrivateNote, IPrivateNote } from '@/models/PrivateNote';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const note = await PrivateNote.findById(params.id).select('likes').lean().exec() as IPrivateNote;
    
    if (!note) {
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    const session = await getServerSession(authOptions);
    const isLiked = session?.user?.id ? note.likes.includes(session.user.id) : false;
    const likeCount = note.likes.length;

    return NextResponse.json({ isLiked, likeCount });
  } catch (error) {
    console.error('Beğeni durumu kontrol hatası:', error);
    return NextResponse.json(
      { error: 'Beğeni durumu kontrol edilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Bu işlem için giriş yapmanız gerekiyor' },
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

    const userLikeIndex = note.likes.indexOf(session.user.id);
    if (userLikeIndex === -1) {
      note.likes.push(session.user.id);
    } else {
      note.likes.splice(userLikeIndex, 1);
    }

    await note.save();

    return NextResponse.json({
      isLiked: userLikeIndex === -1,
      likeCount: note.likes.length
    });
  } catch (error) {
    console.error('Beğeni işlemi hatası:', error);
    return NextResponse.json(
      { error: 'Beğeni işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
