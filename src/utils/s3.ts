import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

let s3Client: S3Client | null = null;

const getS3Client = () => {
  if (!s3Client) {
    if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION) {
      throw new Error('AWS credentials are not configured');
    }

    s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  return s3Client;
};

export const uploadToS3 = async (
  file: Buffer,
  mimeType: string,
  isPublic: boolean = false
): Promise<string> => {
  if (!process.env.AWS_S3_BUCKET) {
    throw new Error('AWS S3 bucket is not configured');
  }

  const bucket = process.env.AWS_S3_BUCKET;
  const folder = isPublic ? 'publicimage' : 'privateimage';
  const extension = getExtension(mimeType);
  
  if (!extension) {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  const key = `${folder}/${uuidv4()}-${Date.now()}${extension}`;

  try {
    const client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
    });

    await client.send(command);

    // URL'i oluştur
    const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(key)}`;
    
    // URL'in geçerli olduğunu kontrol et
    try {
      await fetch(url, { method: 'HEAD' });
    } catch (error) {
      console.error('Failed to verify uploaded file URL:', error);
      throw new Error('Failed to verify uploaded file');
    }

    return url;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to upload file to S3');
  }
};

const getExtension = (mimeType: string): string => {
  const mimeTypes: { [key: string]: string } = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
  };

  return mimeTypes[mimeType] || '';
};
