import { getTransporter, getSmtpConfig } from "./transporter";
import { escapeHtml } from "./sanitize";
import { SendEmailRequestBody } from "@/types/email";

export interface SendEmailResult {
  messageId: string;
}

/**
 * Sends an email via GoDaddy SMTP to info@velnorasoftware.com
 */
export async function sendEmail(payload: SendEmailRequestBody): Promise<SendEmailResult> {
  const config = getSmtpConfig();
  const transporter = getTransporter();

  // Strict sender and recipient addresses
  const senderEmail = config.user; // info@velnorasoftware.com
  const recipientEmail = config.user; // info@velnorasoftware.com
  const fromHeader = `"Velnora Software" <${senderEmail}>`;

  // Plain text fallback as specified
  const textBody = `Name: ${payload.name}
Email: ${payload.email}

Message:
${payload.message}`;

  // Clean, modern, responsive HTML email template
  const escapedName = escapeHtml(payload.name);
  const escapedEmail = escapeHtml(payload.email);
  const escapedSubject = escapeHtml(payload.subject);
  const escapedMessage = escapeHtml(payload.message).replace(/\n/g, "<br />");

  const htmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Website Enquiry</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f5f7; color: #1f2937;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f5f7; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 32px; color: #ffffff;">
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">Velnora Software</h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">New Contact Form Submission</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="padding-bottom: 20px;">
                    <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.8px; margin-bottom: 4px;">Sender Name</div>
                    <div style="font-size: 15px; font-weight: 600; color: #0f172a;">${escapedName}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px;">
                    <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.8px; margin-bottom: 4px;">Reply-To Email</div>
                    <div style="font-size: 15px; font-weight: 600; color: #2563eb;">
                      <a href="mailto:${escapedEmail}" style="color: #2563eb; text-decoration: none;">${escapedEmail}</a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 20px;">
                    <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.8px; margin-bottom: 4px;">Subject</div>
                    <div style="font-size: 15px; font-weight: 600; color: #0f172a;">${escapedSubject}</div>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 10px; border-top: 1px solid #e2e8f0;">
                    <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 0.8px; margin-bottom: 8px;">Message</div>
                    <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 16px; border-radius: 4px; font-size: 14px; line-height: 1.6; color: #334155;">
                      ${escapedMessage}
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: center;">
              This notification was generated from the Velnora Software website contact form.
              <br />
              Direct reply will go to <a href="mailto:${escapedEmail}" style="color: #2563eb;">${escapedEmail}</a>.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const info = await transporter.sendMail({
      from: fromHeader,
      to: recipientEmail,
      replyTo: payload.email,
      subject: payload.subject,
      text: textBody,
      html: htmlBody,
    });

    return {
      messageId: info.messageId,
    };
  } catch (error: unknown) {
    // Log server error safely without leaking sensitive information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("[EmailService Error]", {
      code: (error as { code?: string })?.code,
      message: errorMessage,
      timestamp: new Date().toISOString(),
    });

    throw error;
  }
}
