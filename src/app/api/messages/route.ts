import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import mongoose from 'mongoose';
import Message from '@/models/Message';

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

// GET - Tüm mesajları getir
export async function GET(request: Request) {
  try {
    await connectDB();
    const messages = await Message.find().sort({ createdAt: -1 }).limit(50);
    return NextResponse.json(messages);
  } catch (error) {
    console.error('Mesajlar yüklenirken hata:', error);
    return NextResponse.json(
      { error: 'Mesajlar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni mesaj oluştur
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    const message = await Message.create({
      ...data,
      author: {
        name: session.user.name || 'Anonim',
        email: session.user.email,
        image: session.user.image
      }
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error('Mesaj oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Mesaj oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Mesaj sil
export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Mesaj ID gerekli' }, { status: 400 });
    }

    await connectDB();
    
    const message = await Message.findOneAndDelete({
      _id: id,
      'author.email': session.user.email
    });

    if (!message) {
      return NextResponse.json({ error: 'Mesaj bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Mesaj başarıyla silindi' });
  } catch (error) {
    console.error('Mesaj silme hatası:', error);
    return NextResponse.json(
      { error: 'Mesaj silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
