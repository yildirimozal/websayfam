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
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Beğeni yapmak için giriş yapmalısınız' },
        { status: 401 }
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

    // Kullanıcının daha önce beğenip beğenmediğini kontrol et
    const hasLiked = note.likes.includes(session.user.email);

    if (hasLiked) {
      // Beğeniyi kaldır
      note.likes = note.likes.filter((email: string) => email !== session.user.email);
    } else {
      // Beğeni ekle
      note.likes.push(session.user.email);
    }

    await note.save();

    return NextResponse.json({
      likes: note.likes,
      likeCount: note.likes.length,
      hasLiked: !hasLiked // Yeni durumu döndür
    });
  } catch (error) {
    console.error('Beğeni işlemi sırasında hata:', error);
    return NextResponse.json(
      { error: 'Beğeni işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
