import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PublicNote, { SystemTimer } from '@/models/PublicNote';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

const TIMER_DURATION = 600000; // 1 dakika

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    
    // Tüm notları sil
    await PublicNote.deleteMany({});
    
    // Timer'ı sıfırla ve yeni bir timer başlat
    const timer = await SystemTimer.findById('timer');
    if (timer) {
      timer.startTime = new Date();
      timer.userNotes = []; // Kullanıcı not sayılarını sıfırla
      await timer.save();
    } else {
      const newTimer = new SystemTimer({
        _id: 'timer',
        startTime: new Date(),
        duration: TIMER_DURATION,
        userNotes: []
      });
      await newTimer.save();
    }

    return NextResponse.json({
      message: 'Tüm notlar silindi ve sayaç sıfırlandı',
      timer: {
        startTime: new Date(),
        remainingTime: TIMER_DURATION,
        userNotes: []
      }
    });
  } catch (error) {
    console.error('Error in POST /api/public-notes/clear:', error);
    return NextResponse.json(
      { error: 'Failed to clear notes' },
      { status: 500 }
    );
  }
}
