import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PublicNote from '@/models/PublicNote';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

export async function GET() {
  try {
    await connectToDatabase();

    const notes = await PublicNote.find().sort({ createdAt: -1 });

    return NextResponse.json(notes);
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

    const body = await request.json();

    // Eksik alanları kontrol et ve varsayılan değerler ekle
    const noteData = {
      ...body,
      position: body.position || { x: 50, y: 50 },
      size: body.size || { width: 200, height: 200 },
      likes: body.likes || [],
      comments: body.comments || [],
      author: {
        name: session.user?.name || 'Anonim Kullanıcı',
        email: session.user?.email || 'anonymous@example.com',
        image: session.user?.image || '/default-avatar.png'
      }
    };

    const note = new PublicNote(noteData);
    await note.save();

    return NextResponse.json(note);
  } catch (error) {
    console.error('Error in POST /api/public-notes:', error);
    return NextResponse.json(
      { error: 'Failed to create public note', details: error instanceof Error ? error.message : 'Bilinmeyen hata' },
      { status: 500 }
    );
  }
}
