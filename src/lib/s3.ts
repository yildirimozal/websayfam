import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-central-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

export async function uploadToS3(file: Buffer, fileName: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET || '',
    Key: `course-resources/${fileName}`,
    Body: file,
    ContentType: contentType
  });

  await s3Client.send(command);

  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/course-resources/${fileName}`;
}

export function getFileType(fileName: string): 'pdf' | 'ppt' | 'pptx' | 'docx' | 'image' | 'video' | null {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'ppt':
      return 'ppt';
    case 'pptx':
      return 'pptx';
    case 'docx':
      return 'docx';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'image';
    case 'mp4':
    case 'webm':
    case 'ogg':
      return 'video';
    default:
      return null;
  }
}
