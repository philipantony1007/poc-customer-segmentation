import { Request, Response } from 'express';
import * as customerService from '../service/customer.service';

export const post = async (request: Request, response: Response): Promise<void> => {
  console.log("Processing customer data");

  try {
    const { successCount, failureCount } = await customerService.updateCustomerSegments();
    response.json({
      successCount,
      failureCount,
    });
  } catch (error) {
    console.error("Error fetching/updating customers:", error);
    response.status(500).json({ message: "Error fetching/updating customers" });
  }
};
