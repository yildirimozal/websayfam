import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/config';
import { uploadToS3, getFileType } from '@/lib/s3';

// Yeni route segment config yapısı
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Bu işlem için yetkiniz yok' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    
    if (!file) {
      return NextResponse.json(
        { error: 'Dosya gereklidir' },
        { status: 400 }
      );
    }

    const fileType = getFileType(file.name);
    if (!fileType) {
      return NextResponse.json(
        { error: 'Desteklenmeyen dosya türü' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await uploadToS3(buffer, file.name, file.type);

    return NextResponse.json({
      url,
      type: fileType
    });
  } catch (error: any) {
    console.error('Dosya yükleme hatası:', error);
    return NextResponse.json(
      { error: error.message || 'Dosya yüklenirken bir hata oluştu' },
      { status: 500 }
    );
  }
}
