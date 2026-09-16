interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting
const ipRateLimitStore = new Map<string, RateLimitRecord>();

// Automatically clean up stale entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleEntries(): void {
  const now = Date.now();
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    lastCleanup = now;
    for (const [key, record] of ipRateLimitStore.entries()) {
      if (now > record.resetTime) {
        ipRateLimitStore.delete(key);
      }
    }
  }
}

/**
 * Basic in-memory rate limiter per IP address
 *
 * @param ip - Client identifier / IP address
 * @param maxRequests - Maximum requests allowed within window (default: 5)
 * @param windowMs - Sliding window duration in milliseconds (default: 60,000 ms / 1 minute)
 */
export function rateLimit(
  ip: string,
  maxRequests: number = 5,
  windowMs: number = 60 * 1000
): {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
} {
  cleanupStaleEntries();

  const now = Date.now();
  const currentRecord = ipRateLimitStore.get(ip);

  if (!currentRecord || now > currentRecord.resetTime) {
    // New window or expired window
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    ipRateLimitStore.set(ip, newRecord);

    return {
      allowed: true,
      limit: maxRequests,
      remaining: maxRequests - 1,
      resetTime: newRecord.resetTime,
    };
  }

  // Window is still active
  if (currentRecord.count >= maxRequests) {
    return {
      allowed: false,
      limit: maxRequests,
      remaining: 0,
      resetTime: currentRecord.resetTime,
    };
  }

  currentRecord.count += 1;
  ipRateLimitStore.set(ip, currentRecord);

  return {
    allowed: true,
    limit: maxRequests,
    remaining: maxRequests - currentRecord.count,
    resetTime: currentRecord.resetTime,
  };
}

/**
 * Extracts client IP address from Next.js Request headers
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    // Return first IP in comma-separated list
    return xForwardedFor.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim();
  }
  return "127.0.0.1";
}
