import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/config';
import VideoManagement from './VideoManagement';

export default async function AdminVideosPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || !session.user.isAdmin) {
    redirect('/auth/signin');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Video Yönetimi</h1>
      <VideoManagement />
    </div>
  );
}
