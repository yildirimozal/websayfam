import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { OnlineUser } from '@/models/OnlineUser';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/config';

export async function GET() {
  try {
    await connectToDatabase();
    
    // 5 dakika içinde aktif olan ve misafir olmayan kullanıcıları getir
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineUsers = await OnlineUser.find({
      lastSeen: { $gte: fiveMinutesAgo },
      name: { $ne: 'Misafir' }
    }).select('name email image lastSeen -_id').lean();

    return NextResponse.json({ 
      count: onlineUsers.length,
      users: onlineUsers.map(user => ({
        name: user.name,
        email: user.email,
        image: user.image || '',
        lastSeen: user.lastSeen.toISOString()
      }))
    });
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
    if (!session?.user?.email || !session?.user?.name) {
      return NextResponse.json(
        { error: 'Oturum bulunamadı' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // Kullanıcının son görülme zamanını güncelle veya yeni kayıt oluştur
    const updatedUser = await OnlineUser.findOneAndUpdate(
      { email: session.user.email },
      {
        userId: session.user.email,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image || '',
        lastSeen: new Date()
      },
      { upsert: true, new: true }
    ).lean();

    // Güncel online kullanıcıları döndür (misafirler hariç)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const onlineUsers = await OnlineUser.find({
      lastSeen: { $gte: fiveMinutesAgo },
      name: { $ne: 'Misafir' }
    }).select('name email image lastSeen -_id').lean();

    return NextResponse.json({ 
      count: onlineUsers.length,
      users: onlineUsers.map(user => ({
        name: user.name,
        email: user.email,
        image: user.image || '',
        lastSeen: user.lastSeen.toISOString()
      }))
    });
  } catch (error) {
    console.error('Online durumu güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Online durumu güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
