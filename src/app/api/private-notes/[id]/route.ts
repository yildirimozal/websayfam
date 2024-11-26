import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/config';
import { connectToDatabase } from '@/lib/mongodb';
import PrivateNote from '@/models/PrivateNote';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    console.log(`PUT /api/private-notes/${params.id} - Connecting to database...`);
    await connectToDatabase();
    console.log('Database connection successful');

    const { id } = params;
    const body = await request.json();
    console.log('Updating note:', id, 'with data:', body);
    
    // Sadece izin verilen alanları güncelle
    const updateData: any = {};
    if (body.position) updateData.position = body.position;
    if (body.size) updateData.size = body.size;
    if (body.rotation) updateData.rotation = body.rotation;
    if (body.content) updateData.content = body.content;
    if (body.type) updateData.type = body.type;
    
    const note = await PrivateNote.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!note) {
      console.log('Note not found:', id);
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    console.log('Note updated successfully:', note);
    return NextResponse.json(note);
  } catch (error) {
    console.error('Error in PUT /api/private-notes/[id]:', error);
    return NextResponse.json(
      { error: 'Not güncellenirken hata oluştu' },
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
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    console.log(`DELETE /api/private-notes/${params.id} - Connecting to database...`);
    await connectToDatabase();
    console.log('Database connection successful');
    
    const { id } = params;
    console.log('Deleting note:', id);
    
    const note = await PrivateNote.findByIdAndDelete(id);

    if (!note) {
      console.log('Note not found:', id);
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    console.log('Note deleted successfully:', id);
    return NextResponse.json({ message: 'Not başarıyla silindi' });
  } catch (error) {
    console.error('Error in DELETE /api/private-notes/[id]:', error);
    return NextResponse.json(
      { error: 'Not silinirken hata oluştu' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`GET /api/private-notes/${params.id} - Connecting to database...`);
    await connectToDatabase();
    console.log('Database connection successful');
    
    const { id } = params;
    console.log('Fetching note:', id);
    
    const note = await PrivateNote.findById(id);

    if (!note) {
      console.log('Note not found:', id);
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    console.log('Note found:', note);
    return NextResponse.json(note);
  } catch (error) {
    console.error('Error in GET /api/private-notes/[id]:', error);
    return NextResponse.json(
      { error: 'Not yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}
