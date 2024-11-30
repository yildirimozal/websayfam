import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PublicNote from '@/models/PublicNote';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/config';

interface Comment {
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

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Oturum kontrolü
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Yorum yapmak için giriş yapmanız gerekiyor' },
        { status: 401 }
      );
    }

    // Kullanıcı bilgileri kontrolü
    if (!session.user.name || !session.user.email) {
      return NextResponse.json(
        { error: 'Kullanıcı bilgileri eksik' },
        { status: 400 }
      );
    }

    const { content } = await request.json();

    // İçerik kontrolü
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Geçerli bir yorum içeriği gereklidir' },
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

    const comment: Comment = {
      userId: session.user.id || session.user.email,
      content: content.trim(),
      createdAt: new Date(),
      author: {
        id: session.user.id || session.user.email,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image || '/default-avatar.png'
      }
    };

    // Mevcut yorumları koru ve yeni yorumu ekle
    const updatedNote = await PublicNote.findByIdAndUpdate(
      params.id,
      { 
        $push: { comments: comment }
      },
      { 
        new: true,
        runValidators: true 
      }
    );

    if (!updatedNote) {
      return NextResponse.json(
        { error: 'Not güncellenemedi' },
        { status: 500 }
      );
    }

    const formattedNote = formatNote(updatedNote);
    console.log('Yorum eklendi:', comment);
    console.log('Güncellenmiş not:', formattedNote);

    return NextResponse.json(formattedNote);
  } catch (error) {
    console.error('Yorum ekleme hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
