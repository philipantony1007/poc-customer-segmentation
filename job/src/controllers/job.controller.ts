import { Request, Response } from 'express';
import { updateCustomerSegments } from '../service/customer.service';
import { writeLog } from '../service/log.service';
import CustomError from '../errors/custom.error';

export const post = async (request: Request, response: Response): Promise<void> => {
  const startTime = Date.now();
  let successCount = 0;
  let failureCount = 0;
  let failedEmails: string[] = [];

  try {
    const result = await updateCustomerSegments();
    successCount = result.successCount;
    failureCount = result.failureCount;
    // Extract email addresses only for logging
    failedEmails = result.failedEmails.map(failed => failed.email);

    await writeLog('Cron job for updating customer segments completed', startTime, successCount, failureCount, failedEmails);

    response.json({
      successCount,
      failureCount,
    });
  } catch (error: any) {
    await writeLog(error.message, startTime, successCount, failureCount, failedEmails);

    if (error instanceof CustomError) {
      throw error;
    }
    throw new CustomError(500, 'Internal Server Error');
  }
};
