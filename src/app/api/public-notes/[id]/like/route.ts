import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import PublicNote from '@/models/PublicNote';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const note = await PublicNote.findById(params.id);
    
    if (!note) {
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    // Anonim beğeni için rastgele bir ID oluştur
    const anonymousId = Math.random().toString(36).substring(7);
    note.likes.push(anonymousId);
    await note.save();

    return NextResponse.json({
      likes: note.likes,
      likeCount: note.likes.length
    });
  } catch (error) {
    console.error('Beğeni işlemi sırasında hata:', error);
    return NextResponse.json(
      { error: 'Beğeni işlemi sırasında bir hata oluştu' },
      { status: 500 }
    );
  }
}
