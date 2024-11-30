import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PrivateNote, IPrivateNote } from '@/models/PrivateNote';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

export async function GET() {
  try {
    await connectToDatabase();
    const notes = await PrivateNote.find()
      .sort({ createdAt: -1 })
      .lean()
      .exec() as IPrivateNote[];

    return NextResponse.json(notes);
  } catch (error) {
    console.error('Notlar getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Notlar getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    if (!session.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    if (!session.user?.id) {
      return NextResponse.json(
        { error: 'Kullanıcı ID bulunamadı' },
        { status: 400 }
      );
    }

    const data = await request.json();
    await connectToDatabase();

    const note = new PrivateNote({
      ...data,
      userId: session.user.id,
      likes: [],
      comments: []
    });

    await note.save();
    return NextResponse.json(note);
  } catch (error) {
    console.error('Not eklenirken hata:', error);
    return NextResponse.json(
      { error: 'Not eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
