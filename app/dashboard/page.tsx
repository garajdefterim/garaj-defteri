import Link from "next/link";

export default function DashboardPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        padding: "40px 24px",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#0F172A",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "38px",
            lineHeight: 1.2,
            color: "#0F172A",
          }}
        >
          🚗 Garaj Defteri
        </h1>

        <p
          style={{
            margin: "14px 0 38px",
            color: "#475569",
            fontSize: "18px",
          }}
        >
          Hoş geldiniz.
        </p>

        <section
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "18px",
            padding: "32px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#0F172A",
              fontSize: "24px",
            }}
          >
            🚘 Araçlarım
          </h2>

          <p
            style={{
              margin: "12px 0 0",
              color: "#64748B",
              fontSize: "16px",
            }}
          >
            Henüz araç eklemediniz.
          </p>

          <Link
            href="/arac-ekle"
            style={{
              display: "inline-block",
              marginTop: "24px",
              backgroundColor: "#2563EB",
              color: "#FFFFFF",
              padding: "14px 22px",
              borderRadius: "10px",
              fontSize: "16px",
              fontWeight: 700,
            }}
          >
            + Araç Ekle
          </Link>
        </section>
      </div>
    </main>
  );
}