import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await connectToDatabase();

    console.log('Veritabanı bağlantısı kuruldu');

    // Mevcut admin kullanıcısını kontrol et
    const existingAdmin = await User.findOne({ email: 'yildirimozal@hotmail.com' });
    
    if (existingAdmin) {
      console.log('Admin kullanıcısı zaten mevcut');
      return NextResponse.json({ message: 'Admin kullanıcısı zaten mevcut' });
    }

    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123', salt);

    console.log('Şifre hashlendi');

    // Admin kullanıcısını oluştur
    const adminUser = new User({
      email: 'yildirimozal@hotmail.com',
      password: hashedPassword,
      role: 'admin',
    });

    await adminUser.save();

    console.log('Admin kullanıcısı oluşturuldu');

    return NextResponse.json({ message: 'Admin kullanıcısı başarıyla oluşturuldu' });
  } catch (error) {
    console.error('Admin kullanıcısı oluşturulurken hata:', error);
    return NextResponse.json(
      { error: 'Admin kullanıcısı oluşturulurken bir hata oluştu', details: error },
      { status: 500 }
    );
  }
}
