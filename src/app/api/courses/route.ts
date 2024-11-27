import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Course from '@/models/Course';
import { connectToDatabase } from '@/lib/mongodb';
import { authOptions } from '@/app/api/auth/config';

export async function GET() {
  try {
    await connectToDatabase();
    const courses = await Course.find().sort({ createdAt: -1 });
    return NextResponse.json(courses);
  } catch (error) {
    return NextResponse.json(
      { error: 'Dersler yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const data = await request.json();
    
    const course = await Course.create(data);
    return NextResponse.json(course, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Bu ders kodu zaten kullanılıyor' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Ders eklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
