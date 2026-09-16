import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import { SmtpConfig } from "@/types/email";

export type SmtpTransporter = Transporter<SMTPTransport.SentMessageInfo, SMTPTransport.Options>;

// Cache transporter instance across warm serverless lambdas
let cachedTransporter: SmtpTransporter | null = null;

/**
 * Validates and retrieves SMTP configuration from environment variables
 */
export function getSmtpConfig(): SmtpConfig {
  const host = process.env.EMAIL_HOST || "smtpout.secureserver.net";
  const port = Number(process.env.EMAIL_PORT) || 465;
  const secure = process.env.EMAIL_SECURE === "true" || port === 465;
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASSWORD;

  if (!user || !pass) {
    throw new Error(
      "Missing SMTP credentials. Please configure EMAIL_USER and EMAIL_PASSWORD in your environment variables."
    );
  }

  return {
    host,
    port,
    secure,
    user,
    pass,
  };
}

/**
 * Returns a configured Nodemailer Transporter singleton
 */
export function getTransporter(): SmtpTransporter {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const config = getSmtpConfig();

  const transportOptions: SMTPTransport.Options = {
    host: config.host,
    port: config.port,
    secure: config.secure, // true for 465, false for other ports
    auth: {
      user: config.user,
      pass: config.pass,
    },
    // Serverless-friendly timeouts to avoid hanging lambdas
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000, // 10 seconds
    socketTimeout: 15000, // 15 seconds
  };

  cachedTransporter = nodemailer.createTransport(transportOptions);

  return cachedTransporter;
}

