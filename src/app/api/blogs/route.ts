import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/config';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';

// GET - Tüm blogları veya slug ile tekil blog getir
export async function GET(request: Request) {
  let db;
  try {
    db = await connectToDatabase();
    const session = await getServerSession(authOptions);
    
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const tag = searchParams.get('tag');

    if (slug) {
      const blog = await Blog.findOne({ 
        slug,
        ...(session?.user?.isAdmin ? {} : { published: true })
      });
      if (!blog) {
        return NextResponse.json({ error: 'Blog bulunamadı' }, { status: 404 });
      }
      return NextResponse.json(blog);
    }

    let query = tag 
      ? { tags: tag, ...(session?.user?.isAdmin ? {} : { published: true }) }
      : session?.user?.isAdmin ? {} : { published: true };

    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Blog getirme hatası:', error);
    return NextResponse.json(
      { error: 'Bloglar yüklenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// POST - Yeni blog oluştur (sadece admin)
export async function POST(request: Request) {
  let db;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    db = await connectToDatabase();
    const data = await request.json();

    const blog = await Blog.create({
      ...data,
      author: {
        name: session.user.name || 'Admin',
        email: session.user.email || 'admin@example.com'
      }
    });

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('Blog oluşturma hatası:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Blog oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
}

// PUT - Blog güncelle (sadece admin)
export async function PUT(request: Request) {
  let db;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const data = await request.json();
    const { id, _id, ...updateData } = data;
    const blogId = id || _id;

    if (!blogId) {
      return NextResponse.json({ error: 'Blog ID gerekli' }, { status: 400 });
    }

    db = await connectToDatabase();

    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!blog) {
      return NextResponse.json({ error: 'Blog bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Blog güncelleme hatası:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Blog güncellenirken hata oluştu' },
      { status: 500 }
    );
  }
}

// DELETE - Blog sil (sadece admin)
export async function DELETE(request: Request) {
  let db;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Blog ID gerekli' }, { status: 400 });
    }

    db = await connectToDatabase();
    
    const blog = await Blog.findByIdAndDelete(id);
    
    if (!blog) {
      return NextResponse.json({ error: 'Blog bulunamadı' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Blog başarıyla silindi' });
  } catch (error) {
    console.error('Blog silme hatası:', error);
    return NextResponse.json(
      { error: 'Blog silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
