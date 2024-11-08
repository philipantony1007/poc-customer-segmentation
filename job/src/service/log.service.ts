import { writeCustomObjectLog } from '../repositories/customObject.repository'; // Import the repository function



export const writeLog = async (
  message: string,
  startTime: number,
  s3UploadStatus: boolean,
  successCount: number,
  failureCount: number
): Promise<any> => {
  const logData: any = {
    timestamp: new Date().toISOString(),
    status: s3UploadStatus ? 'success' : 'error',  // Set the log status based on the upload result
    message,
    details: {
      successCount,    // Number of successfully updated customers
      failureCount,    // Number of failed updates
      duration: Date.now() - startTime,  // Duration in milliseconds
    },
  };

  // Only include successCount and failureCount in the details if needed
  if (s3UploadStatus) {
    logData.details.successCount = successCount;
    logData.details.failureCount = failureCount;
  }

  try {
    // Call the repository to create the custom object log
    const logEntry = await writeCustomObjectLog(logData);
    return logEntry;
  } catch (error) {
    console.error('Error writing log to repository:', error);
    throw new Error('Failed to write log entry');
  }
};
