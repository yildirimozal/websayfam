import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/config';
import { connectToDatabase } from '@/lib/mongodb';
import PublicNote from '@/models/PublicNote';
import { Document } from 'mongoose';

interface PublicNoteDocument extends Document {
  content: string;
  type: 'note' | 'image';
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  author: {
    name: string;
    email: string;
    image?: string;
  };
  likes: string[];
  comments: any[];
}

const allowedUpdateFields = ['content', 'position', 'size', 'rotation'];

const validateUpdateData = (data: any) => {
  const invalidFields = Object.keys(data).filter(
    field => !allowedUpdateFields.includes(field)
  );

  if (invalidFields.length > 0) {
    throw new Error(`Geçersiz güncelleme alanları: ${invalidFields.join(', ')}`);
  }
};

const formatNote = (note: PublicNoteDocument | null) => {
  if (!note) return null;
  const formatted = note.toObject();
  formatted.id = formatted._id.toString();
  delete formatted._id;
  delete formatted.__v;
  return formatted;
};

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    
    const { id } = params;
    const note = await PublicNote.findById(id);

    if (!note) {
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json(formatNote(note));
  } catch (error) {
    console.error('Not getirme hatası:', error);
    return NextResponse.json(
      { error: 'Not getirilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Giriş yapmalısınız.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = params;
    const body = await request.json();

    validateUpdateData(body);

    const note = await PublicNote.findById(id);
    if (!note) {
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    // Notu sadece sahibi güncelleyebilir
    if (note.author.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Bu notu güncellemek için yetkiniz yok' },
        { status: 403 }
      );
    }

    const updatedNote = await PublicNote.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!updatedNote) {
      throw new Error('Not güncellenemedi');
    }

    return NextResponse.json(formatNote(updatedNote));
  } catch (error) {
    console.error('Not güncelleme hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
    
    return NextResponse.json(
      { error: errorMessage },
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
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Yetkisiz erişim. Giriş yapmalısınız.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const { id } = params;
    const note = await PublicNote.findById(id);

    if (!note) {
      return NextResponse.json(
        { error: 'Not bulunamadı' },
        { status: 404 }
      );
    }

    // Notu sadece sahibi silebilir
    if (note.author.email !== session.user.email) {
      return NextResponse.json(
        { error: 'Bu notu silmek için yetkiniz yok' },
        { status: 403 }
      );
    }

    await PublicNote.findByIdAndDelete(id);

    return NextResponse.json({ 
      message: 'Not başarıyla silindi',
      id 
    });
  } catch (error) {
    console.error('Not silme hatası:', error);
    const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
