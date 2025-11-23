import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function generatePresignedUrl(
  filename: string,
  contentType: string
): Promise<string> {
  const key = `reports/${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  // URL expires in 5 minutes (300 seconds)
  const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
  return url;
}

export function getPublicS3Url(filename: string): string {
  return `${process.env.NEXT_PUBLIC_S3_URL}/${filename}`;
}

export async function generateReadPresignedUrl(
  imageUrl: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    // Extract key from S3 URL
    const url = new URL(imageUrl);
    const key = url.pathname.substring(1);

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error("Error generating read presigned URL:", error);
    return imageUrl;
  }
}
