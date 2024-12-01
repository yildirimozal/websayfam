import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/config';
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

// GET - Tüm blogları veya slug ile tekil blog getir
export async function GET(request: Request) {
  let db;
  try {
    console.log('Blog API: Veritabanına bağlanılıyor...');
    db = await connectToDatabase();
    console.log('Blog API: Veritabanı bağlantısı başarılı');

    const session = await getServerSession(authOptions);
    console.log('Blog API: Oturum durumu:', session?.user?.isAdmin ? 'Admin' : 'Normal kullanıcı');
    
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const tag = searchParams.get('tag');
    console.log('Blog API: Arama parametreleri:', { slug, tag });

    if (slug) {
      console.log('Blog API: Slug ile blog aranıyor:', slug);
      const blog = await Blog.findOne({ 
        slug,
        ...(session?.user?.isAdmin ? {} : { published: true })
      });
      
      if (!blog) {
        console.log('Blog API: Blog bulunamadı');
        return NextResponse.json({ error: 'Blog bulunamadı' }, { status: 404 });
      }
      
      console.log('Blog API: Blog bulundu');
      return NextResponse.json(blog);
    }

    let query = tag 
      ? { tags: tag, ...(session?.user?.isAdmin ? {} : { published: true }) }
      : session?.user?.isAdmin ? {} : { published: true };

    console.log('Blog API: Bloglar için sorgu:', query);
    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    console.log('Blog API: Bulunan blog sayısı:', blogs.length);

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Blog API - Blog getirme hatası:', error);
    if (error instanceof Error) {
      console.error('Hata detayı:', error.message);
      console.error('Stack trace:', error.stack);
    }
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
    console.log('Blog API: Yeni blog oluşturuluyor...');
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      console.log('Blog API: Yetkisiz erişim denemesi');
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    db = await connectToDatabase();
    const data = await request.json();
    console.log('Blog API: Gelen blog verisi:', data);

    // Başlangıç slug'ını oluştur
    let baseSlug = createSlug(data.title);
    let slug = baseSlug;
    let counter = 1;

    // Benzersiz slug oluştur
    while (true) {
      const existingBlog = await Blog.findOne({ slug });
      if (!existingBlog) {
        break;
      }
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Blog verilerini hazırla
    const blogData = {
      ...data,
      slug,
      author: {
        name: session.user.name || 'Admin',
        email: session.user.email || 'admin@example.com'
      },
      likes: [], // Boş likes array'i ekle
      views: 0,  // Başlangıç görüntülenme sayısı
      published: data.published || false
    };

    console.log('Blog API: Oluşturulacak blog verisi:', blogData);

    const blog = await Blog.create(blogData);

    console.log('Blog API: Blog başarıyla oluşturuldu:', blog._id);
    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error('Blog API - Blog oluşturma hatası:', error);
    if (error instanceof Error) {
      console.error('Hata detayı:', error.message);
      console.error('Stack trace:', error.stack);
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
    console.log('Blog API: Blog güncelleniyor...');
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      console.log('Blog API: Yetkisiz erişim denemesi');
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const data = await request.json();
    const { id, _id, ...updateData } = data;
    const blogId = id || _id;

    if (!blogId) {
      console.log('Blog API: Blog ID eksik');
      return NextResponse.json({ error: 'Blog ID gerekli' }, { status: 400 });
    }

    db = await connectToDatabase();
    console.log('Blog API: Güncellenecek blog ID:', blogId);

    // Başlık değiştiyse yeni slug oluştur
    if (updateData.title) {
      let baseSlug = createSlug(updateData.title);
      let slug = baseSlug;
      let counter = 1;

      while (true) {
        const existingBlog = await Blog.findOne({ 
          slug,
          _id: { $ne: blogId }
        });
        if (!existingBlog) {
          break;
        }
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      updateData.slug = slug;
    }

    const blog = await Blog.findByIdAndUpdate(
      blogId,
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!blog) {
      console.log('Blog API: Güncellenecek blog bulunamadı');
      return NextResponse.json({ error: 'Blog bulunamadı' }, { status: 404 });
    }

    console.log('Blog API: Blog başarıyla güncellendi');
    return NextResponse.json(blog);
  } catch (error) {
    console.error('Blog API - Blog güncelleme hatası:', error);
    if (error instanceof Error) {
      console.error('Hata detayı:', error.message);
      console.error('Stack trace:', error.stack);
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
    console.log('Blog API: Blog siliniyor...');
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      console.log('Blog API: Yetkisiz erişim denemesi');
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      console.log('Blog API: Blog ID eksik');
      return NextResponse.json({ error: 'Blog ID gerekli' }, { status: 400 });
    }

    db = await connectToDatabase();
    console.log('Blog API: Silinecek blog ID:', id);
    
    const blog = await Blog.findByIdAndDelete(id);
    
    if (!blog) {
      console.log('Blog API: Silinecek blog bulunamadı');
      return NextResponse.json({ error: 'Blog bulunamadı' }, { status: 404 });
    }

    console.log('Blog API: Blog başarıyla silindi');
    return NextResponse.json({ message: 'Blog başarıyla silindi' });
  } catch (error) {
    console.error('Blog API - Blog silme hatası:', error);
    if (error instanceof Error) {
      console.error('Hata detayı:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return NextResponse.json(
      { error: 'Blog silinirken hata oluştu' },
      { status: 500 }
    );
  }
}
