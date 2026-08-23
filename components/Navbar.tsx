import Link from "next/link";

export default function Navbar() {
  return (
    <header
      style={{
        width: "100%",
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E8EBEF",
      }}
    >
      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "11px",
            color: "#111827",
            textDecoration: "none",
          }}
        >
          <div
            aria-hidden="true"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              backgroundColor: "#0F172A",
              color: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: 800,
              letterSpacing: "-0.4px",
            }}
          >
            GD
          </div>

          <div
            style={{
              fontSize: "17px",
              fontWeight: 750,
              lineHeight: 1.2,
              letterSpacing: "-0.35px",
            }}
          >
            Garaj Defteri
          </div>
        </Link>

        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/giris"
            style={{
              minHeight: "42px",
              padding: "0 14px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#374151",
              border: "1px solid #D7DCE3",
              backgroundColor: "#FFFFFF",
              borderRadius: "9px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 650,
            }}
          >
            Giriş Yap
          </Link>

          <Link
            href="/kayit"
            style={{
              minHeight: "42px",
              padding: "0 14px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#1D4ED8",
              color: "#FFFFFF",
              borderRadius: "9px",
              textDecoration: "none",
              fontSize: "14px",
              fontWeight: 700,
            }}
          >
            Kayıt Ol
          </Link>
        </nav>
      </div>
    </header>
  );
}