import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';
import Blog from '@/models/Blog';

async function migrateBlogSchema() {
  try {
    console.log('Veritabanına bağlanılıyor...');
    await connectToDatabase();
    console.log('Veritabanına bağlantı başarılı');

    // Blog koleksiyonuna doğrudan erişim
    const db = mongoose.connection.db;
    const blogsCollection = db.collection('blogs');

    // Mevcut blog sayısını kontrol et
    const totalBlogs = await blogsCollection.countDocuments();
    console.log(`Toplam ${totalBlogs} blog bulundu`);

    // Tüm blogları güncelle (eksik alanları olanlar dahil)
    const allBlogs = await blogsCollection.find({}).toArray();
    console.log(`${allBlogs.length} blog işlenecek`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const blog of allBlogs) {
      try {
        // Her blog için views ve likes alanlarını güncelle
        const updateResult = await blogsCollection.updateOne(
          { _id: blog._id },
          {
            $set: {
              likes: Array.isArray(blog.likes) ? blog.likes : [],
              views: typeof blog.views === 'number' ? blog.views : 0
            }
          }
        );

        if (updateResult.modifiedCount > 0) {
          updatedCount++;
          console.log(`Blog güncellendi: ${blog._id}`);
        }
      } catch (error) {
        errorCount++;
        console.error(`Blog güncellenirken hata oluştu: ${blog._id}`, error);
      }
    }

    // Koleksiyonu doğrula ve indexleri güncelle
    await Blog.syncIndexes();

    // Tüm blogları yeni şemaya göre doğrula
    const validationErrors = await Promise.all(
      allBlogs.map(async (blog) => {
        try {
          const newBlog = new Blog(blog);
          await newBlog.validate();
          return null;
        } catch (error) {
          return { blogId: blog._id, error };
        }
      })
    );

    const errors = validationErrors.filter(Boolean);
    if (errors.length > 0) {
      console.log('\nŞema doğrulama hataları:');
      errors.forEach(error => {
        console.log(`Blog ID: ${error?.blogId}`);
        console.log('Hata:', error?.error);
      });
    }

    console.log('\nMigrasyon tamamlandı:');
    console.log(`- Toplam blog sayısı: ${totalBlogs}`);
    console.log(`- Güncellenen blog sayısı: ${updatedCount}`);
    console.log(`- Hata oluşan blog sayısı: ${errorCount}`);
    console.log(`- Şema doğrulama hatası olan blog sayısı: ${errors.length}`);

  } catch (error) {
    console.error('Migrasyon hatası:', error);
    process.exit(1);
  } finally {
    console.log('\nVeritabanı bağlantısı kapatılıyor...');
    await mongoose.connection.close();
    console.log('Veritabanı bağlantısı kapatıldı');
  }
}

// Migrasyon scriptini çalıştır
migrateBlogSchema().catch(console.error);
