import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import Course from '@/models/Course';
import { connectToDatabase } from '@/lib/mongodb';
import { authOptions } from '@/app/api/auth/config';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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
    
    const course = await Course.findByIdAndUpdate(
      params.id,
      { ...data },
      { new: true, runValidators: true }
    );

    if (!course) {
      return NextResponse.json(
        { error: 'Ders bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(course);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Bu ders kodu zaten kullanılıyor' },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error.message || 'Ders güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    await connectToDatabase();
    const course = await Course.findByIdAndDelete(params.id);

    if (!course) {
      return NextResponse.json(
        { error: 'Ders bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Ders başarıyla silindi' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ders silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
