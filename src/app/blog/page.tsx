import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/config';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import dynamic from 'next/dynamic';

const BlogPageClient = dynamic(() => import('@/components/BlogPageClient'), {
  ssr: true
});

async function getBlogs() {
  let db;
  try {
    db = await connectToDatabase();
    console.log('Veritabanı bağlantısı başarılı');
    
    const session = await getServerSession(authOptions);
    const query = session?.user?.isAdmin ? {} : { published: true };
    
    console.log('Blog sorgusu:', query);
    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    console.log('Bulunan blog sayısı:', blogs.length);
    
    return JSON.parse(JSON.stringify(blogs));
  } catch (error) {
    console.error('Blog getirme hatası:', error);
    if (error instanceof Error) {
      console.error('Hata detayı:', error.message);
      console.error('Stack trace:', error.stack);
    }
    return [];
  }
}

export default async function BlogPage() {
  try {
    const [blogs, session] = await Promise.all([
      getBlogs(),
      getServerSession(authOptions)
    ]);

    console.log('Blog sayfası render ediliyor');
    console.log('Blog sayısı:', blogs.length);
    console.log('Kullanıcı admin mi:', session?.user?.isAdmin);

    return (
      <BlogPageClient 
        blogs={blogs} 
        isAdmin={session?.user?.isAdmin} 
      />
    );
  } catch (error) {
    console.error('Blog sayfası render hatası:', error);
    return <div>Blog yüklenirken bir hata oluştu.</div>;
  }
}
