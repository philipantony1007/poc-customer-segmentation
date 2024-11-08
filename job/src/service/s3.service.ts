import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";  // Import necessary classes

// Create an S3 client instance
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Define the S3 bucket and dynamically create the file's key (path within the bucket)
const bucketName = process.env.AWS_S3_BUCKET_NAME!;
const currentDate = new Date();
const formattedDate = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
const fileKey = `customer-segmentation/segmented-result/${formattedDate}.json`;  // Use the date-only format

// Function to fetch JSON from S3
export const fetchJsonFromS3 = async (): Promise<any> => {
  const params = {
    Bucket: bucketName,
    Key: fileKey,
  };

  try {
    // Use GetObjectCommand to retrieve the object from S3
    const data = await s3Client.send(new GetObjectCommand(params));

    // Read the response Body as a stream and convert it to text
    const body = await streamToString(data.Body);
    
    // Parse and return the file content as JSON
    return JSON.parse(body);
  } catch (error) {
    console.error('Error fetching file from S3:', error);
    throw new Error('Unable to fetch JSON from S3');
  }
};

// Helper function to convert a stream to string
const streamToString = (stream: any): Promise<string> => {
  return new Promise((resolve, reject) => {
    const chunks: any[] = [];
    stream.on('data', (chunk: any) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf-8')));
    stream.on('error', reject);
  });
};
