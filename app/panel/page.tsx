import Link from "next/link";

export default function PanelPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        backgroundColor: "#F8FAFC",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <section
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "36px",
            color: "#0F172A",
          }}
        >
          GARAJ DEFTERİ Paneli
        </h1>

        <p
          style={{
            marginTop: "12px",
            color: "#64748B",
            fontSize: "18px",
          }}
        >
          Giriş başarılı. Araçlarınızı burada yöneteceksiniz.
        </p>

        <div
          style={{
            marginTop: "32px",
            padding: "28px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "18px",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#0F172A",
            }}
          >
            Henüz araç eklemediniz
          </h2>

          <p
            style={{
              color: "#64748B",
            }}
          >
            Bir sonraki adımda araç ekleme sistemini oluşturacağız.
          </p>

          <Link
            href="/"
            style={{
              display: "inline-block",
              marginTop: "10px",
              color: "#2563EB",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            ← Ana sayfaya dön
          </Link>
        </div>
      </section>
    </main>
  );
}