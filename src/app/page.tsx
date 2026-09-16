export default function HomePage() {
  return (
    <main style={{ padding: "40px 20px", maxWidth: "700px", margin: "0 auto", lineHeight: 1.6 }}>
      <h1 style={{ color: "#0f172a" }}>Velnora Software — Email Microservice</h1>
      <p style={{ color: "#475569" }}>
        This service powers email delivery for Velnora Software using GoDaddy Professional SMTP.
      </p>

      <section style={{ marginTop: "32px", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px" }}>
        <h2 style={{ margin: "0 0 12px 0", fontSize: "18px" }}>Available Endpoints:</h2>
        <ul style={{ paddingLeft: "20px", color: "#334155" }}>
          <li>
            <code>POST /api/email/send</code> — Submits a customer inquiry to <code>info@velnorasoftware.com</code>
          </li>
          <li style={{ marginTop: "8px" }}>
            <code>GET /api/email/test</code> — Tests the SMTP connection to GoDaddy servers
          </li>
        </ul>
      </section>
    </main>
  );
}
