import CustomError from '../errors/custom.error';

// Error when customer data is not found in the database
export class CustomerNotFoundError extends CustomError {
  constructor(email: string) {
    super(404, `Customer with email ${email} not found.`);
  }
}

// Error for customer update failures
export class CustomerUpdateError extends CustomError {
  constructor(email: string, segment: string) {
    super(500, `Failed to update customer ${email} to segment ${segment}.`);
  }
}

// Error for S3 bucket configuration issues
export class S3ConfigError extends CustomError {
  constructor() {
    super(500, 'Invalid or missing S3 configuration settings.');
  }
}


