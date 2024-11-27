import mongoose, { Schema, Document } from 'mongoose';

interface Resource {
  type: 'pdf' | 'ppt' | 'pptx' | 'docx' | 'image' | 'video';
  title: string;
  url: string;
}

interface WeeklyContent {
  week: number;
  title: string;
  description: string;
  resources: Resource[];
}

export interface ICourse extends Document {
  title: string;
  description: string;
  semester: string;
  year: number;
  department: string;
  code: string;
  ects: number;
  type: 'Zorunlu' | 'Seçmeli';
  weeklyContents: WeeklyContent[];
  createdAt: Date;
  updatedAt: Date;
}

const ResourceSchema = new Schema({
  type: {
    type: String,
    enum: ['pdf', 'ppt', 'pptx', 'docx', 'image', 'video'],
    required: [true, 'Kaynak türü gereklidir']
  },
  title: {
    type: String,
    required: [true, 'Kaynak başlığı gereklidir'],
    trim: true,
    maxlength: [200, 'Kaynak başlığı 200 karakterden uzun olamaz']
  },
  url: {
    type: String,
    required: [true, 'Kaynak URL\'i gereklidir'],
    trim: true
  }
});

const WeeklyContentSchema = new Schema({
  week: {
    type: Number,
    required: [true, 'Hafta numarası gereklidir'],
    min: [1, 'Hafta numarası 1\'den küçük olamaz'],
    max: [16, 'Hafta numarası 16\'dan büyük olamaz']
  },
  title: {
    type: String,
    required: [true, 'İçerik başlığı gereklidir'],
    trim: true,
    maxlength: [200, 'İçerik başlığı 200 karakterden uzun olamaz']
  },
  description: {
    type: String,
    required: [true, 'İçerik açıklaması gereklidir'],
    trim: true,
    maxlength: [1000, 'İçerik açıklaması 1000 karakterden uzun olamaz']
  },
  resources: [ResourceSchema]
});

const CourseSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Ders başlığı gereklidir'],
    trim: true,
    maxlength: [200, 'Ders başlığı 200 karakterden uzun olamaz']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Açıklama 1000 karakterden uzun olamaz']
  },
  semester: {
    type: String,
    enum: ['Güz', 'Bahar', 'Yaz'],
    required: [true, 'Dönem seçimi gereklidir']
  },
  year: {
    type: Number,
    required: [true, 'Yıl gereklidir'],
    min: [2000, 'Yıl 2000\'den küçük olamaz'],
    max: [new Date().getFullYear() + 5, 'Gelecek yıllar için ders eklenemez']
  },
  department: {
    type: String,
    required: [true, 'Bölüm gereklidir'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Ders kodu gereklidir'],
    unique: true,
    trim: true,
    uppercase: true
  },
  ects: {
    type: Number,
    required: [true, 'ECTS kredisi gereklidir'],
    min: [0, 'ECTS kredisi 0\'dan küçük olamaz'],
    max: [30, 'ECTS kredisi 30\'dan büyük olamaz']
  },
  type: {
    type: String,
    enum: ['Zorunlu', 'Seçmeli'],
    required: [true, 'Ders türü gereklidir']
  },
  weeklyContents: [WeeklyContentSchema]
}, {
  timestamps: true
});

export default mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
