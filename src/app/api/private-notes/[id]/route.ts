import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { PrivateNote } from '@/models/PrivateNote';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const note = await PrivateNote.findById(params.id).lean().exec();
    
    if (!note) {
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(note);
  } catch (error) {
    console.error('Not getirilirken hata:', error);
    return NextResponse.json(
      { error: 'Not getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
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

    const data = await request.json();
    await connectToDatabase();
    
    const note = await PrivateNote.findById(params.id);
    if (!note) {
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    const updatedNote = await PrivateNote.findByIdAndUpdate(
      params.id,
      { ...data },
      { new: true }
    ).lean().exec();

    if (!updatedNote) {
      return NextResponse.json(
        { error: 'Not güncellenemedi' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedNote);
  } catch (error) {
    console.error('Not güncellenirken hata:', error);
    return NextResponse.json(
      { error: 'Not güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
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
    const note = await PrivateNote.findById(params.id);
    
    if (!note) {
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    await PrivateNote.findByIdAndDelete(params.id);
    return NextResponse.json({ message: 'Not başarıyla silindi' });
  } catch (error) {
    console.error('Not silinirken hata:', error);
    return NextResponse.json(
      { error: 'Not silinirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
