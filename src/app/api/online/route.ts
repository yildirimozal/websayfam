import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { OnlineUser } from '@/models/OnlineUser';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

export async function GET() {
  try {
    await connectToDatabase();
    
    // 5 dakika içinde aktif olan kullanıcıları getir
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineUsers = await OnlineUser.find({
      lastSeen: { $gte: fiveMinutesAgo }
    });

    return NextResponse.json({ count: onlineUsers.length });
  } catch (error) {
    console.error('Online kullanıcı sayısı alınırken hata:', error);
    return NextResponse.json(
      { error: 'Online kullanıcı sayısı alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // Kullanıcının son görülme zamanını güncelle veya yeni kayıt oluştur
    await OnlineUser.findOneAndUpdate(
      { userId: session.user.id },
      {
        userId: session.user.id,
        userName: session.user.name || 'Anonim',
        lastSeen: new Date()
      },
      { upsert: true }
    );

    // Güncel online kullanıcı sayısını döndür
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineUsers = await OnlineUser.find({
      lastSeen: { $gte: fiveMinutesAgo }
    });

    return NextResponse.json({ count: onlineUsers.length });
  } catch (error) {
    console.error('Online durumu güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Online durumu güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
