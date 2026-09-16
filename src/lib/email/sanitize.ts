import { ValidationResult } from "@/types/email";

// RFC 5322 compliant regex for general email validation
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Escapes HTML characters to prevent XSS / HTML injection in email templates
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Strips CRLF characters to prevent SMTP Email Header Injection
 */
export function stripHeaderInjection(str: string): string {
  return str.replace(/[\r\n\t]/g, " ").trim();
}

/**
 * Validates and sanitizes email input payload without requiring external libraries like Zod
 */
export function validateAndSanitizeSendEmailInput(body: unknown): ValidationResult {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return {
      isValid: false,
      error: "Invalid request payload: Expected a JSON object",
    };
  }

  const { name, email, subject, message } = body as Record<string, unknown>;

  // Check required fields existence and types
  if (typeof name !== "string" || name.trim() === "") {
    return {
      isValid: false,
      error: "The 'name' field is required and must be a non-empty string",
    };
  }

  if (typeof email !== "string" || email.trim() === "") {
    return {
      isValid: false,
      error: "The 'email' field is required and must be a non-empty string",
    };
  }

  if (typeof subject !== "string" || subject.trim() === "") {
    return {
      isValid: false,
      error: "The 'subject' field is required and must be a non-empty string",
    };
  }

  if (typeof message !== "string" || message.trim() === "") {
    return {
      isValid: false,
      error: "The 'message' field is required and must be a non-empty string",
    };
  }

  // Length validations
  const trimmedName = stripHeaderInjection(name);
  if (trimmedName.length > 100) {
    return {
      isValid: false,
      error: "The 'name' field exceeds the maximum allowed length of 100 characters",
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (cleanEmail.length > 254) {
    return {
      isValid: false,
      error: "The 'email' field exceeds the maximum allowed length of 254 characters",
    };
  }

  if (!EMAIL_REGEX.test(cleanEmail)) {
    return {
      isValid: false,
      error: "Please provide a valid email address",
    };
  }

  const cleanSubject = stripHeaderInjection(subject);
  if (cleanSubject.length > 200) {
    return {
      isValid: false,
      error: "The 'subject' field exceeds the maximum allowed length of 200 characters",
    };
  }

  const cleanMessage = message.trim();
  if (cleanMessage.length > 10000) {
    return {
      isValid: false,
      error: "The 'message' field exceeds the maximum allowed length of 10,000 characters",
    };
  }

  return {
    isValid: true,
    sanitizedData: {
      name: trimmedName,
      email: cleanEmail,
      subject: cleanSubject,
      message: cleanMessage,
    },
  };
}
