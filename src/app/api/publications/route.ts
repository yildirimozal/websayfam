import { NextResponse } from 'next/server';
import { getScholarPublications } from '@/lib/scholar';

export async function GET() {
  try {
    const publications = await getScholarPublications();
    return NextResponse.json(publications);
  } catch (error) {
    console.error('Yayınlar alınırken hata:', error);
    return NextResponse.json(
      { error: 'Yayınlar alınamadı' },
      { status: 500 }
    );
  }
}
