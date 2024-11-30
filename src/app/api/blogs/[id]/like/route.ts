import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import Blog, { IBlog } from '@/models/Blog';

// Beğeni durumunu kontrol et
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('GET isteği başladı');
    
    if (!mongoose.connection.readyState) {
      await connectToDatabase();
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('Geçersiz Blog ID:', id);
      return NextResponse.json(
        { error: 'Geçersiz Blog ID' },
        { status: 400 }
      );
    }

    const headersList = headers();
    const clientIp = headersList.get('x-forwarded-for') || 'unknown';

    console.log('GET - Blog ID:', id);
    console.log('GET - Client IP:', clientIp);

    const blog = await Blog.findById(id);
    if (!blog) {
      console.log('GET - Blog bulunamadı');
      return NextResponse.json(
        { error: 'Blog bulunamadı' },
        { status: 404 }
      );
    }

    const hasLiked = blog.likes.includes(clientIp);
    console.log('GET - Has Liked:', hasLiked);
    console.log('GET - Current Likes:', blog.likes);

    return NextResponse.json({
      hasLiked,
      likes: blog.likes,
      totalLikes: blog.likes.length
    });
  } catch (error) {
    console.error('GET - Blog beğeni durumu kontrol hatası:', error);
    return NextResponse.json(
      { error: 'Blog beğeni durumu kontrol edilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}

// Beğeni ekle/kaldır
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('POST isteği başladı');
    
    if (!mongoose.connection.readyState) {
      await connectToDatabase();
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.error('Geçersiz Blog ID:', id);
      return NextResponse.json(
        { error: 'Geçersiz Blog ID' },
        { status: 400 }
      );
    }

    const headersList = headers();
    const clientIp = headersList.get('x-forwarded-for') || 'unknown';

    console.log('POST - Blog ID:', id);
    console.log('POST - Client IP:', clientIp);

    const blog = await Blog.findById(id);
    if (!blog) {
      console.log('POST - Blog bulunamadı');
      return NextResponse.json(
        { error: 'Blog bulunamadı' },
        { status: 404 }
      );
    }

    // IP adresi daha önce beğenmiş mi kontrol et
    const hasLiked = blog.likes.includes(clientIp);
    console.log('POST - Initial Has Liked:', hasLiked);
    console.log('POST - Initial Likes:', blog.likes);

    if (hasLiked) {
      // Beğeniyi kaldır
      blog.likes = blog.likes.filter((ip: string) => ip !== clientIp);
    } else {
      // Beğeni ekle
      blog.likes.push(clientIp);
    }

    const updatedBlog = await blog.save();
    console.log('POST - Updated Likes:', updatedBlog.likes);

    return NextResponse.json({
      likes: updatedBlog.likes,
      totalLikes: updatedBlog.likes.length,
      hasLiked: !hasLiked
    });
  } catch (error) {
    console.error('POST - Blog beğeni hatası:', error);
    return NextResponse.json(
      { error: 'Blog beğenilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
