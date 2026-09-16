import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Velnora Email Backend Service",
  description: "Production-ready SMTP email microservice for Velnora Software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}
