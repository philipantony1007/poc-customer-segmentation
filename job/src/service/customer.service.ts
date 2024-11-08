import * as customerRepository from '../repositories/customer.repository';
import { EmailSegment, CustomerUpdateResult } from '../types/customer.types';
import { batchArray } from '../utils/batch.utils';
import { fetchJsonFromS3 } from './s3.service';  // Import the fetchJsonFromS3 function

export const flattenUserData = (users: { [key: string]: string[] }): EmailSegment[] => {
  // Iterate over each group in the users object and flatten it into an array of EmailSegment objects
  return Object.entries(users).flatMap(([segment, emails]) => 
    emails.map((email) => ({ email, segment }))
  );
};

export const processCustomer = async (emailSegment: EmailSegment): Promise<{ result: CustomerUpdateResult; success: boolean }> => {
  try {
    const customer = await customerRepository.fetchCustomerByEmail(emailSegment.email);

    if (customer) {
      const updatedCustomer = await customerRepository.updateCustomerGroup(
        customer,
        emailSegment.segment
      );

      return {
        result: {
          email: emailSegment.email,
          customer_segment: emailSegment.segment,
          customer_id: updatedCustomer.body.id,
          customer_version: updatedCustomer.body.version,
        },
        success: true,
      };
    }

    return {
      result: {
        email: emailSegment.email,
        customer_segment: emailSegment.segment,
        customer_id: null,
        customer_version: null,
      },
      success: false,
    };
  } catch (error) {
    console.error(`Error processing email ${emailSegment.email}:`, error);
    return {
      result: {
        email: emailSegment.email,
        customer_segment: emailSegment.segment,
        customer_id: null,
        customer_version: null,
      },
      success: false,
    };
  }
};

export const updateCustomerSegments = async (): Promise<{ successCount: number; failureCount: number }> => {
  let users: { [key: string]: string[] } = {};

  try {
    // Fetch JSON data from S3
    users = await fetchJsonFromS3();
  } catch (error) {
    console.error('Failed to fetch data from S3:', error);
    throw new Error('Data loading from S3 failed');
  }

  const emails = flattenUserData(users);  // Flatten the data correctly
  const emailBatches = batchArray(emails, 250);  // Batch emails for processing
  let successCount = 0;
  let failureCount = 0;

  for (const emailBatch of emailBatches) {
    const results = await Promise.all(emailBatch.map(processCustomer));

    results.forEach(({ success }) => {
      if (success) successCount++;
      else failureCount++;
    });
  }

  console.log(`Total successfully updated customers: ${successCount}`);
  console.log(`Total failed updates: ${failureCount}`);

  return { successCount, failureCount };
};
