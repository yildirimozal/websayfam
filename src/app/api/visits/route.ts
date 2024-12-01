import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Visit } from '@/models/Visit';

export async function GET() {
  try {
    await connectToDatabase();
    
    let visit = await Visit.findOne();
    if (!visit) {
      visit = await Visit.create({ totalVisits: 0 });
    }

    return NextResponse.json({ totalVisits: visit.totalVisits });
  } catch (error) {
    console.error('Ziyaret sayısı alınırken hata:', error);
    return NextResponse.json(
      { error: 'Ziyaret sayısı alınırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    await connectToDatabase();
    
    let visit = await Visit.findOne();
    if (!visit) {
      visit = await Visit.create({ totalVisits: 1 });
    } else {
      visit.totalVisits += 1;
      visit.lastUpdated = new Date();
      await visit.save();
    }

    return NextResponse.json({ totalVisits: visit.totalVisits });
  } catch (error) {
    console.error('Ziyaret sayısı güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Ziyaret sayısı güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
