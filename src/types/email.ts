/**
 * Request payload structure for POST /api/email/send
 */
export interface SendEmailRequestBody {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  project?: string;
  source?: string;
  details?: string;
}

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  error?: string;
  data?: T;
}

/**
 * Result of input validation
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedData?: SendEmailRequestBody;
}

/**
 * Resolved SMTP configuration from environment variables
 */
export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}
