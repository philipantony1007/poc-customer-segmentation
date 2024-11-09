import * as customerRepository from '../repositories/customer.repository';
import { EmailSegment, CustomerUpdateResult } from '../types/customer.types';
import { flattenUserData, batchArray, delay } from '../utils/batch.utils';
import { fetchJsonFromS3 } from './s3.service';
import { CustomerNotFoundError, CustomerUpdateError } from '../errors/extendedCustom.error';
import CustomError from '../errors/custom.error';

const RETRY_LIMIT = 3;
const RETRY_DELAY = 1000; // 1-second delay between retries

export const processCustomer = async (emailSegment: EmailSegment): Promise<{ result: CustomerUpdateResult; success: boolean }> => {
  let attempts = 0;
  let success = false;
  let result: CustomerUpdateResult | null = null;

  while (attempts < RETRY_LIMIT && !success) {
    try {
      const customer = await customerRepository.fetchCustomerByEmail(emailSegment.email);
      if (!customer) throw new CustomerNotFoundError(emailSegment.email);

      const updatedCustomer = await customerRepository.updateCustomerGroup(customer, emailSegment.segment);
      result = {
        email: emailSegment.email,
        customer_segment: emailSegment.segment,
        customer_id: updatedCustomer.body.id,
        customer_version: updatedCustomer.body.version,
      };
      success = true;
    } catch (error) {
      if (!(error instanceof CustomerNotFoundError)) {
        error = new CustomerUpdateError(emailSegment.email, emailSegment.segment);
      }
      attempts++;
      if (attempts < RETRY_LIMIT) await delay(RETRY_DELAY);
    }
  }

  return {
    result: result ?? { email: emailSegment.email, customer_segment: emailSegment.segment, customer_id: null, customer_version: null },
    success,
  };
};

export const updateCustomerSegments = async (): Promise<{ successCount: number; failureCount: number; failedEmails: EmailSegment[] }> => {
  let users: { [key: string]: string[] } = {};
  let failedEmails: EmailSegment[] = [];

  try {
    users = await fetchJsonFromS3();
  } catch (error) {
    throw new CustomError(500, 'Error fetching JSON data from S3');
  }

  const emails = flattenUserData(users);
  const emailBatches = batchArray(emails, 100);
  let successCount = 0;
  let failureCount = 0;

  for (const emailBatch of emailBatches) {
    console.log(`Processing batch of ${emailBatch.length} emails`);
    const results = await Promise.all(emailBatch.map(processCustomer));
    const currentBatchFailedEmails: EmailSegment[] = [];

    results.forEach(({ success, result }) => {
      if (success) {
        successCount++;
      } else {
        failureCount++;
        console.log(`Failed to update customer: ${result.email}, segment: ${result.customer_segment}`);
        currentBatchFailedEmails.push({ email: result.email, segment: result.customer_segment });
      }
    });

    // Retry failed emails for the current batch only
    if (currentBatchFailedEmails.length > 0) {
      console.log(`Retrying ${currentBatchFailedEmails.length} failed emails in current batch`);
      const retryResults = await Promise.all(currentBatchFailedEmails.map(({ email, segment }) => processCustomer({ email, segment })));

      retryResults.forEach(({ success, result }) => {
        if (success) {
          successCount++;
        } else {
          failureCount++;
          failedEmails.push({ email: result.email, segment: result.customer_segment }); // Log failure for second retry failure
        }
      });
    }
  }

  return { successCount, failureCount, failedEmails };
};
