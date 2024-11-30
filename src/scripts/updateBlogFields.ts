import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import Blog from '@/models/Blog';

async function updateBlogFields() {
  try {
    console.log('Veritabanına bağlanılıyor...');
    await connectToDatabase();
    console.log('Veritabanı bağlantısı başarılı');

    // Tüm blogları bul
    const blogs = await Blog.find({});
    console.log(`${blogs.length} blog bulundu`);

    let updatedCount = 0;
    let errorCount = 0;

    // Her blog için güncelleme yap
    for (const blog of blogs) {
      try {
        // likes ve views alanlarını kontrol et ve güncelle
        const updates: any = {};
        
        if (!Array.isArray(blog.likes)) {
          updates.likes = [];
        }
        
        if (typeof blog.views !== 'number') {
          updates.views = 0;
        }

        // Eğer güncellenecek alan varsa güncelle
        if (Object.keys(updates).length > 0) {
          const result = await Blog.findByIdAndUpdate(
            blog._id,
            { $set: updates },
            { new: true }
          );

          if (result) {
            updatedCount++;
            console.log(`Blog güncellendi: ${blog._id}`);
            console.log('Güncellenen alanlar:', updates);
          }
        }
      } catch (error) {
        errorCount++;
        console.error(`Blog güncellenirken hata oluştu: ${blog._id}`, error);
      }
    }

    console.log('\nGüncelleme tamamlandı:');
    console.log(`- Toplam blog sayısı: ${blogs.length}`);
    console.log(`- Güncellenen blog sayısı: ${updatedCount}`);
    console.log(`- Hata oluşan blog sayısı: ${errorCount}`);

  } catch (error) {
    console.error('Güncelleme hatası:', error);
  } finally {
    console.log('\nVeritabanı bağlantısı kapatılıyor...');
    await mongoose.connection.close();
    console.log('Veritabanı bağlantısı kapatıldı');
  }
}

// Güncelleme scriptini çalıştır
updateBlogFields().catch(console.error);
