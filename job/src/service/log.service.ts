import { writeCustomObjectLog } from '../repositories/customObject.repository';

export const writeLog = async (
  message: string,
  startTime: number,
  successCount: number,
  failureCount: number,
  failedEmails: string[]
): Promise<void> => {
  const logData = {
    status: successCount > 0 ? 'success' : 'failed',
    message,
    details: {
      successCount,
      failureCount,
      failedEmails,
      duration: Date.now() - startTime,
    },
  };

  try {
    await writeCustomObjectLog(logData);
  } catch (error) {
    console.error('Error writing log:', error);
  }
};
