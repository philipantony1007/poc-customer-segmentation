
export interface EmailSegment {
  email: string;
  segment: string;
}

export interface CustomerUpdateResult {
  email: string;
  customer_segment: string;
  customer_id: string | null;
  customer_version: number | null;
}