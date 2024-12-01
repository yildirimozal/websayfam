import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/config';
import { uploadToS3 } from '@/utils/s3';

// Route segment config
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const isPublic = formData.get('isPublic') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // AWS kimlik bilgilerini kontrol et
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_S3_BUCKET || !process.env.AWS_REGION) {
      console.error('Missing AWS credentials');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const url = await uploadToS3(buffer, file.type, isPublic);
      
      if (!url) {
        throw new Error('Failed to get upload URL');
      }

      return NextResponse.json({ url });
    } catch (uploadError) {
      console.error('S3 upload error:', uploadError);
      
      // Daha detaylı hata mesajı
      let errorMessage = 'Failed to upload to S3';
      if (uploadError instanceof Error) {
        errorMessage = `${errorMessage}: ${uploadError.message}`;
        console.error('Error stack:', uploadError.stack);
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error uploading file:', error);
    
    let errorMessage = 'Failed to process upload request';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
