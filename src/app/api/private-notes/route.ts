import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
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

// PUT - Not güncelle (sadece admin)
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    await connectToDatabase();

    const note = await PrivateNote.findOneAndUpdate(
      { _id: id },
      updateData,
      { new: true }
    );

    if (!note) {
      return NextResponse.json({ error: 'Not bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Not güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Not güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Not sil (sadece admin)
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Not ID gerekli' }, { status: 400 });
    }

    await connectToDatabase();
    
    const note = await PrivateNote.findByIdAndDelete(id);

    if (!note) {
      return NextResponse.json({ error: 'Not bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Not başarıyla silindi' });
  } catch (error) {
    console.error('Not silme hatası:', error);
    return NextResponse.json(
      { error: 'Not silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
