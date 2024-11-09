import { CustomObjectDraft } from '@commercetools/platform-sdk';
import { createApiRoot } from '../client/create.client';

const CUSTOM_OBJECT_CONTAINER = 'cron-job-customer-segmentation';

export const writeCustomObjectLog = async (logData: any) => {
  const customObjectDraft: CustomObjectDraft = {
    container: CUSTOM_OBJECT_CONTAINER,
    key: `cron-log-${Date.now()}`,
    value: logData,
  };

  try {
    const { body } = await createApiRoot()
      .customObjects()
      .post({ body: customObjectDraft })
      .execute();
    console.log('Log entry created in Commercetools:', body);
    return body;
  } catch (error) {
    console.error('Error creating log entry in Commercetools:', error);
    throw new Error('Failed to create log entry');
  }
};
