import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PublicNote, { SystemTimer } from '@/models/PublicNote';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

const TIMER_DURATION = 60000; // 1 dakika

async function getOrCreateTimer() {
  let timer = await SystemTimer.findById('timer');
  
  if (!timer) {
    timer = new SystemTimer({
      _id: 'timer',
      startTime: new Date(),
      duration: TIMER_DURATION
    });
    await timer.save();
  }
  
  return timer;
}

async function checkAndResetTimer() {
  const timer = await getOrCreateTimer();
  const now = new Date();
  const elapsedTime = now.getTime() - timer.startTime.getTime();
  
  if (elapsedTime >= TIMER_DURATION) {
    // Süre dolmuşsa tüm notları sil ve sayacı sıfırla
    await PublicNote.deleteMany({});
    timer.startTime = now;
    await timer.save();
    return true;
  }
  
  return false;
}

export async function GET() {
  try {
    await connectToDatabase();

    // Sayacı kontrol et
    const wasReset = await checkAndResetTimer();
    const timer = await getOrCreateTimer();
    const notes = await PublicNote.find().sort({ createdAt: -1 });

    // Kalan süreyi hesapla
    const now = new Date();
    const elapsedTime = now.getTime() - timer.startTime.getTime();
    const remainingTime = Math.max(0, TIMER_DURATION - elapsedTime);

    return NextResponse.json({
      notes,
      timer: {
        startTime: timer.startTime,
        remainingTime,
        wasReset
      }
    });
  } catch (error) {
    console.error('Error in GET /api/public-notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public notes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Oturum açmanız gerekiyor' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    // Sayacı kontrol et
    const wasReset = await checkAndResetTimer();
    if (wasReset) {
      return NextResponse.json(
        { error: 'Süre doldu ve notlar silindi. Lütfen sayfayı yenileyin.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('POST /api/public-notes received body:', JSON.stringify(body, null, 2));

    const noteData = {
      type: body.type || 'note',
      content: body.content,
      position: body.position || { x: 50, y: 50 },
      size: body.size || { width: 200, height: 200 },
      rotation: body.rotation || 0,
      color: body.color || '#fff9c4',
      fontFamily: body.fontFamily || 'Roboto',
      likes: [],
      comments: [],
      author: {
        name: session.user?.name || 'Anonim Kullanıcı',
        email: session.user?.email || 'anonymous@example.com',
        image: session.user?.image || '/default-avatar.png'
      }
    };

    console.log('Creating note with data:', JSON.stringify(noteData, null, 2));

    const note = new PublicNote(noteData);
    const savedNote = await note.save();
    console.log('Saved note:', JSON.stringify(savedNote, null, 2));

    // Güncel sayaç bilgisini al
    const timer = await getOrCreateTimer();
    const now = new Date();
    const elapsedTime = now.getTime() - timer.startTime.getTime();
    const remainingTime = Math.max(0, TIMER_DURATION - elapsedTime);

    return NextResponse.json({
      note: savedNote,
      timer: {
        startTime: timer.startTime,
        remainingTime
      }
    });
  } catch (error) {
    console.error('Error in POST /api/public-notes:', error);
    return NextResponse.json(
      { error: 'Failed to create public note', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
}
