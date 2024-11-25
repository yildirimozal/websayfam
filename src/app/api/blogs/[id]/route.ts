import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return new NextResponse('Blog bulunamadı', { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Blog getirme hatası:', error);
    return new NextResponse('Sunucu hatası', { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return new NextResponse('Yetkisiz erişim', { status: 401 });
    }

    await connectToDatabase();
    const { id } = params;
    const data = await request.json();

    // Önce blogu bul
    const blog = await Blog.findById(id);

    if (!blog) {
      return new NextResponse('Blog bulunamadı', { status: 404 });
    }

    // Gelen verileri blog nesnesine aktar
    Object.assign(blog, data);

    // Blogu kaydet (bu pre-save hook'unu tetikleyecek)
    const updatedBlog = await blog.save();

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error('Blog güncelleme hatası:', error);
    return new NextResponse('Sunucu hatası', { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return new NextResponse('Yetkisiz erişim', { status: 401 });
    }

    await connectToDatabase();
    const { id } = params;

    const deletedBlog = await Blog.findByIdAndDelete(id);

    if (!deletedBlog) {
      return new NextResponse('Blog bulunamadı', { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Blog silme hatası:', error);
    return new NextResponse('Sunucu hatası', { status: 500 });
  }
}
