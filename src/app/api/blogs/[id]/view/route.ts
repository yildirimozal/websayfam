import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const { id } = params;
    
    // ID formatını kontrol et
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Geçersiz Blog ID' },
        { status: 400 }
      );
    }

    const blog = await Blog.findById(id);

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog bulunamadı' },
        { status: 404 }
      );
    }

    // Görüntülenme sayısını artır
    blog.views = (blog.views || 0) + 1;
    await blog.save();

    return NextResponse.json({
      views: blog.views
    });
  } catch (error) {
    console.error('Blog görüntülenme hatası:', error);
    return NextResponse.json(
      { error: 'Blog görüntülenme sayısı güncellenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
