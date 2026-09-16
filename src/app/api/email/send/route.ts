import { NextRequest, NextResponse } from "next/server";
import { validateAndSanitizeSendEmailInput } from "@/lib/email/sanitize";
import { sendEmail } from "@/lib/email/sendEmail";
import { rateLimit, getClientIp } from "@/lib/rateLimit";
import { ApiResponse } from "@/types/email";

// Ensure Node.js runtime for nodemailer socket support
export const runtime = "nodejs";

// Maximum request body size allowed (64 KB)
const MAX_BODY_SIZE_BYTES = 64 * 1024;

// Standard CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/**
 * Handle HTTP OPTIONS for CORS preflight
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * POST /api/email/send
 * Validates request, checks rate limit, and sends email via GoDaddy SMTP
 */
export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // 1. Rate limiting by IP (5 requests per 60 seconds)
    const clientIp = getClientIp(req);
    const rateLimitResult = rateLimit(clientIp, 5, 60 * 1000);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many requests. Please wait a moment before submitting again.",
        },
        {
          status: 429,
          headers: {
            ...corsHeaders,
            "Retry-After": Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // 2. Request body size check
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: "Payload too large. Maximum allowed size is 64KB.",
        },
        {
          status: 413,
          headers: corsHeaders,
        }
      );
    }

    // 3. Parse JSON body
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid JSON in request body",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // 4. Validate and sanitize input fields
    const validation = validateAndSanitizeSendEmailInput(rawBody);
    if (!validation.isValid || !validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          message: validation.error || "Invalid request payload",
        },
        {
          status: 400,
          headers: corsHeaders,
        }
      );
    }

    // 5. Send email via GoDaddy SMTP
    await sendEmail(validation.sanitizedData);

    // 6. Return success response
    return NextResponse.json(
      {
        success: true,
        message: "Email sent successfully",
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error: unknown) {
    // Graceful error handling: log server-side, return safe message to client
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[POST /api/email/send Error]", {
      message: errMessage,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        message: "Failed to send email",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
