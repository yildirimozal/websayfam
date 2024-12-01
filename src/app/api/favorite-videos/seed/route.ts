import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import FavoriteVideo from '@/models/FavoriteVideo';

const sampleVideos = [
  {
    videoId: 'dQw4w9WgXcQ',
    title: 'Never Gonna Give You Up',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/0.jpg'
  },
  {
    videoId: 'jNQXAC9IVRw',
    title: 'Me at the zoo',
    thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/0.jpg'
  },
  {
    videoId: 'y6120QOlsfU',
    title: 'Darude - Sandstorm',
    thumbnail: 'https://img.youtube.com/vi/y6120QOlsfU/0.jpg'
  },
  {
    videoId: '9bZkp7q19f0',
    title: 'PSY - GANGNAM STYLE',
    thumbnail: 'https://img.youtube.com/vi/9bZkp7q19f0/0.jpg'
  },
  {
    videoId: 'kJQP7kiw5Fk',
    title: 'Luis Fonsi - Despacito',
    thumbnail: 'https://img.youtube.com/vi/kJQP7kiw5Fk/0.jpg'
  }
];

export async function GET() {
  try {
    await connectToDatabase();
    
    // Mevcut videoları temizle
    //await FavoriteVideo.deleteMany({});
    
    // Örnek videoları ekle
    //await FavoriteVideo.insertMany(sampleVideos);
    
    return NextResponse.json({ message: 'Örnek veriler başarıyla eklendi' });
  } catch (error) {
    console.error('Örnek veriler eklenirken hata:', error);
    return NextResponse.json(
      { error: 'Örnek veriler eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
