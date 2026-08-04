import Link from "next/link";

export default function Navbar() {
  return (
    <header
      style={{
        width: "100%",
        backgroundColor: "#1E3A8A",
        color: "#FFFFFF",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#FFFFFF",
            textDecoration: "none",
          }}
        >
          <span style={{ fontSize: "28px" }}>🚗</span>

          <div>
            <div
              style={{
                fontSize: "21px",
                fontWeight: 800,
                lineHeight: 1.1,
              }}
            >
              Garaj Defteri
            </div>

            <div
              style={{
                marginTop: "4px",
                fontSize: "12px",
                color: "#BFDBFE",
              }}
            >
              KKTC Araç Takip Sistemi
            </div>
          </div>
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <Link
            href="/giris"
            style={{
              color: "#FFFFFF",
              border: "1px solid rgba(255,255,255,0.75)",
              padding: "10px 18px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            Giriş Yap
          </Link>

          <Link
            href="/kayit"
            style={{
              backgroundColor: "#FFFFFF",
              color: "#1E3A8A",
              border: "1px solid #FFFFFF",
              padding: "10px 18px",
              borderRadius: "10px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 800,
            }}
          >
            Kayıt Ol
          </Link>
        </nav>
      </div>
    </header>
  );
}