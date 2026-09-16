import { NextResponse } from "next/server";
import { getTransporter } from "@/lib/email/transporter";
import { ApiResponse } from "@/types/email";

// Ensure Node.js runtime for nodemailer socket support
export const runtime = "nodejs";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * GET /api/email/test
 * Verifies SMTP connection configuration
 */
export async function GET(): Promise<NextResponse<ApiResponse>> {
  try {
    const transporter = getTransporter();

    // Verify SMTP connection and credentials with the remote server
    await transporter.verify();

    return NextResponse.json(
      {
        success: true,
        message: "SMTP connection successful",
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[GET /api/email/test Error]", {
      message: errMessage,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: false,
        message: "SMTP connection failed",
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
