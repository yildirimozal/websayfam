import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';

export async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}

export async function getCurrentUserId() {
  const session = await getServerSession(authOptions);
  return session?.user?.id;
}
