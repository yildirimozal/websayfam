import mongoose, { Schema, Document, CallbackError } from 'mongoose';

interface IAuthor {
  name: string;
  email: string;
}

export interface IBlog extends Document {
  title: string;
  content: string;
  slug: string;
  author: IAuthor;
  tags: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

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
  }
}, {
  timestamps: true
});

// Benzersiz slug oluşturma fonksiyonu
BlogSchema.pre('save', async function(next) {
  // Eğer slug değişmediyse ve bu bir güncelleme ise
  if (this.isModified('slug') === false && !this.isNew) {
    return next();
  }

  if (this.title) {
    const createUniqueSlug = async () => {
      let baseSlug = this.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9\sğüşıöç]/g, '')
        .replace(/\s+/g, '-')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
      
      let slug = baseSlug;
      let counter = 1;
      
      // Slug benzersiz olana kadar sayı ekle
      while (true) {
        const existingBlog = await mongoose.models.Blog?.findOne({ 
          slug, 
          _id: { $ne: this._id } 
        });
        
        if (!existingBlog) {
          break;
        }
        
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      return slug;
    };

    try {
      this.slug = await createUniqueSlug();
      next();
    } catch (error) {
      next(error as CallbackError);
    }
  } else {
    next();
  }
});

export default mongoose.models.Blog || mongoose.model<IBlog>('Blog', BlogSchema);
