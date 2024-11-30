import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const uploadToS3 = async (
  file: Buffer,
  mimeType: string,
  isPublic: boolean = false
): Promise<string> => {
  const bucket = process.env.AWS_S3_BUCKET!;
  const folder = isPublic ? 'publicimage' : 'privateimage';
  const key = `${folder}/${uuidv4()}-${Date.now()}${getExtension(mimeType)}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: file,
    ContentType: mimeType,
  });

  await s3Client.send(command);

  // URL formatını düzelttik
  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(key)}`;
};

const getExtension = (mimeType: string): string => {
  switch (mimeType) {
    case 'image/jpeg':
      return '.jpg';
    case 'image/png':
      return '.png';
    case 'image/gif':
      return '.gif';
    case 'image/webp':
      return '.webp';
    default:
      return '';
  }
};
