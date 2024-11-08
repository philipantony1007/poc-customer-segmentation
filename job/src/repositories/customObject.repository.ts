import { CustomObject, CustomObjectDraft } from '@commercetools/platform-sdk';
import { createApiRoot } from '../client/create.client';


const CUSTOM_OBJECT_CONTAINER = 'cron-job-customer-segmentation';  


export const writeCustomObjectLog = async (logData: any): Promise<CustomObject> => {
  const customObjectDraft: CustomObjectDraft = {
    container: CUSTOM_OBJECT_CONTAINER,
    key: `cron-log-${Date.now()}`,  // Use a unique key for each log entry
    value: logData,
  };

  try {
    // Create the Custom Object in Commercetools
    const { body } = await createApiRoot()
      .customObjects()
      .post({ body: customObjectDraft })
      .execute();

    return body;
  } catch (error) {
    console.error('Error creating log entry in Commercetools:', error);
    throw new Error('Failed to create log entry');
  }
};
