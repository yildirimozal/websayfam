import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PublicNote, { SystemTimer } from '@/models/PublicNote';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

// 12 saat = 12 * 60 * 60 * 1000 milisaniye
const TIMER_DURATION = 24 * 60 * 60 * 1000;

interface UserNote {
  email: string;
  count: number;
}

async function getOrCreateTimer() {
  let timer = await SystemTimer.findById('timer');
  
  if (!timer) {
    timer = new SystemTimer({
      _id: 'timer',
      startTime: new Date(),
      duration: TIMER_DURATION,
      userNotes: []
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
    timer.userNotes = [];
    await timer.save();
    return true;
  }
  
  return false;
}

async function canUserAddNote(email: string): Promise<boolean> {
  const timer = await getOrCreateTimer();
  
  // Admin her zaman not ekleyebilir
  if (email === 'ozalyildirim@firat.edu.tr') {
    return true;
  }

  const userNote = timer.userNotes.find((un: UserNote) => un.email === email);
  return !userNote || userNote.count < 2; // 2 nota kadar izin ver
}

async function incrementUserNoteCount(email: string) {
  const timer = await getOrCreateTimer();
  const userNote = timer.userNotes.find((un: UserNote) => un.email === email);
  
  if (userNote) {
    userNote.count += 1;
  } else {
    timer.userNotes.push({ email, count: 1 });
  }
  
  await timer.save();
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
    
    if (!session?.user?.email) {
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

    // Kullanıcının not ekleme hakkını kontrol et
    const canAdd = await canUserAddNote(session.user.email);
    if (!canAdd) {
      return NextResponse.json(
        { error: 'Bu periyotta maksimum not sayısına ulaştınız. Yeni not eklemek için sürenin dolmasını bekleyin.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    console.log('POST /api/public-notes received body:', JSON.stringify(body, null, 2));

    const noteData = {
      type: body.type || 'note',
      content: body.type === 'note' ? body.content : undefined,
      url: body.type === 'image' ? body.content : undefined,
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
    
    // Kullanıcının not sayısını artır
    await incrementUserNoteCount(session.user.email);

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
