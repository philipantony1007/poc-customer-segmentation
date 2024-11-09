// s3.service.ts
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { S3ConfigError } from "../errors/extendedCustom.error";
import CustomError from "../errors/custom.error";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const bucketName = process.env.AWS_S3_BUCKET_NAME!;
const currentDate = new Date();
const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
const fileKey = `customer-segmentation/segmented-result/2024-11-08.json`;

export const fetchJsonFromS3 = async (): Promise<any> => {
  if (!bucketName || !fileKey) {
    throw new S3ConfigError();
  }

  const params = {
    Bucket: bucketName,
    Key: fileKey,
  };

  try {
    const data = await s3Client.send(new GetObjectCommand(params));
    const body = await streamToString(data.Body);
    return JSON.parse(body);
  } catch (error) {
    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(400,`Error parsing JSON data from S3: ${error}`);
  }
};

const streamToString = (stream: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on('data', (chunk: any) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    stream.on('error', reject);
  });
};
