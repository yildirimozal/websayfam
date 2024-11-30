const mongoose = require('mongoose');
const { Schema } = mongoose;

// Blog şemasını tanımla
const BlogSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Başlık gereklidir'],
    trim: true,
    maxlength: [100, 'Başlık 100 karakterden uzun olamaz']
  },
  content: {
    type: String,
    required: [true, 'İçerik gereklidir']
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  author: {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  tags: [{
    type: String,
    trim: true
  }],
  published: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0,
    required: true
  },
  likes: {
    type: [String],
    default: [],
    required: true
  }
}, {
  timestamps: true,
  strict: true
});

async function migrateBlogSchema() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    console.log('Veritabanına bağlanılıyor...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Veritabanına bağlantı başarılı');

    // Blog modelini oluştur
    const Blog = mongoose.models.Blog || mongoose.model('Blog', BlogSchema, 'blogs');

    // Mevcut blog sayısını kontrol et
    const totalBlogs = await Blog.countDocuments();
    console.log(`Toplam ${totalBlogs} blog bulundu`);

    // Tüm blogları güncelle
    const blogs = await Blog.find({});
    console.log(`${blogs.length} blog işlenecek`);

    let updatedCount = 0;
    let errorCount = 0;

    for (const blog of blogs) {
      try {
        // Her blog için views ve likes alanlarını güncelle
        blog.views = typeof blog.views === 'number' ? blog.views : 0;
        blog.likes = Array.isArray(blog.likes) ? blog.likes : [];
        
        await blog.save();
        updatedCount++;
        console.log(`Blog güncellendi: ${blog._id}`);
      } catch (error) {
        errorCount++;
        console.error(`Blog güncellenirken hata oluştu: ${blog._id}`, error);
      }
    }

    console.log('\nMigrasyon tamamlandı:');
    console.log(`- Toplam blog sayısı: ${totalBlogs}`);
    console.log(`- Güncellenen blog sayısı: ${updatedCount}`);
    console.log(`- Hata oluşan blog sayısı: ${errorCount}`);

  } catch (error) {
    console.error('Migrasyon hatası:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\nVeritabanı bağlantısı kapatıldı');
    process.exit(0);
  }
}

// Migrasyon scriptini çalıştır
migrateBlogSchema();
