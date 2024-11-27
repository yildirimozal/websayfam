import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/config';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';

// Slug oluşturma fonksiyonu
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\sğüşıöç]/g, '')
    .replace(/\s+/g, '-')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c');
}

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

    // Başlık değiştiyse yeni slug oluştur
    if (data.title) {
      let baseSlug = createSlug(data.title);
      let slug = baseSlug;
      let counter = 1;

      while (true) {
        const existingBlog = await Blog.findOne({ 
          slug,
          _id: { $ne: id }
        });
        if (!existingBlog) {
          break;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      data.slug = slug;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      { ...data, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedBlog) {
      return new NextResponse('Blog bulunamadı', { status: 404 });
    }

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
