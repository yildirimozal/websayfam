import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/config';
import { connectToDatabase } from '@/lib/mongodb';
import Blog from '@/models/Blog';
import dynamic from 'next/dynamic';

const BlogPageClient = dynamic(() => import('@/components/BlogPageClient'), {
  ssr: true
});

async function getBlogs() {
  try {
    await connectToDatabase();
    const session = await getServerSession(authOptions);
    const query = session?.user?.isAdmin ? {} : { published: true };
    const blogs = await Blog.find(query).sort({ createdAt: -1 });
    return JSON.parse(JSON.stringify(blogs));
  } catch (error) {
    console.error('Blog getirme hatası:', error);
    return [];
  }
}

export default async function BlogPage() {
  const blogs = await getBlogs();
  const session = await getServerSession(authOptions);

  return (
    <BlogPageClient 
      blogs={blogs} 
      isAdmin={session?.user?.isAdmin} 
    />
  );
}
