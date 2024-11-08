import { createApiRoot } from '../client/create.client';
import { Customer } from '@commercetools/platform-sdk';

export const fetchCustomerByEmail = async (email: string): Promise<Customer | null> => {
  const { body } = await createApiRoot()
    .customers()
    .get({ queryArgs: { where: [`email="${email}"`] } })
    .execute();

  return body.results.length > 0 ? (body.results[0] as Customer) : null;
};

export const updateCustomerGroup = async (customer: Customer, segment: string) => {


  return await createApiRoot()
    .customers()
    .withId({ ID: customer.id })
    .post({
      body: {
        version: customer.version,
        actions: [
          {
            action: 'setCustomerGroup',
            customerGroup: {
              typeId: 'customer-group',
              key: segment,
            },
          },
        ],
      }
    })
    .execute();
};