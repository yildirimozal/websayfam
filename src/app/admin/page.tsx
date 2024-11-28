import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/config';
import Link from 'next/link';
import { Box, Typography, Grid, Card, CardContent, CardActionArea } from '@mui/material';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/auth/signin');
  }

  const adminMenuItems = [
    {
      title: 'Video Yönetimi',
      description: 'YouTube oynatma listesini düzenle',
      link: '/admin/videos',
    },
    {
      title: 'Blog Yönetimi',
      description: 'Blog yazılarını ekle, düzenle veya sil',
      link: '/blog/create',
    },
    {
      title: 'Kullanıcı Yönetimi',
      description: 'Kullanıcı hesaplarını yönet',
      link: '#', // Henüz implement edilmedi
    },
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Paneli
      </Typography>

      <Grid container spacing={3}>
        {adminMenuItems.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.title}>
            <Card>
              <CardActionArea component={Link} href={item.link}>
                <CardContent>
                  <Typography variant="h6" component="h2">
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
