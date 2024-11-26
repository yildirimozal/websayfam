import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/config';
import { connectToDatabase } from '@/lib/mongodb';
import PrivateNote from '@/models/PrivateNote';

// GET - Tüm notları getir (herkes okuyabilir)
export async function GET(request: Request) {
  try {
    await connectToDatabase();
    const notes = await PrivateNote.find().sort({ createdAt: -1 });
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Notlar yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Notlar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni not oluştur (sadece admin)
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    await connectToDatabase();
    const data = await request.json();

    const note = await PrivateNote.create({
      ...data,
      userEmail: session.user.email
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Not oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Not oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}
