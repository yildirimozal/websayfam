import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import FavoriteVideo from '@/models/FavoriteVideo';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Rastgele 3 video seç
    const videos = await FavoriteVideo.aggregate([
      { $sample: { size: 3 } }
    ]);

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Favori videolar alınırken hata:', error);
    return NextResponse.json(
      { error: 'Videolar alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    
    const body = await request.json();
    const video = await FavoriteVideo.create(body);
    
    return NextResponse.json(video);
  } catch (error) {
    console.error('Video eklenirken hata:', error);
    return NextResponse.json(
      { error: 'Video eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
