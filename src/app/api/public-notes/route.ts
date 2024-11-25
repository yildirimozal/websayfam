import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import mongoose from 'mongoose';
import PublicNote from '@/models/PublicNote';

// MongoDB bağlantısı
const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }
  
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('Using existing MongoDB connection');
      return;
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB bağlantısı başarılı');
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    throw error;
  }
};

// GET - Tüm public notları getir
export async function GET(request: Request) {
  try {
    await connectDB();
    const notes = await PublicNote.find().sort({ createdAt: -1 });
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Public notlar yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Public notlar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni public not oluştur
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    const note = await PublicNote.create({
      ...data,
      author: {
        name: session.user.name || 'Anonim',
        email: session.user.email
      }
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Public not oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Public not oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT - Public not güncelle
export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const data = await request.json();
    const { id, ...updateData } = data;

    await connectDB();

    const note = await PublicNote.findOneAndUpdate(
      { _id: id, 'author.email': session.user.email },
      updateData,
      { new: true }
    );

    if (!note) {
      return NextResponse.json({ error: 'Not bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Public not güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Public not güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Public not sil
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Not ID gerekli' }, { status: 400 });
    }

    await connectDB();
    
    const note = await PublicNote.findOneAndDelete({
      _id: id,
      'author.email': session.user.email
    });

    if (!note) {
      return NextResponse.json({ error: 'Not bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Not başarıyla silindi' });
  } catch (error) {
    console.error('Public not silme hatası:', error);
    return NextResponse.json(
      { error: 'Public not silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
