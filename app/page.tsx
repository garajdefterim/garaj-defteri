import Link from "next/link";
import Navbar from "../components/Navbar";

const features = [
  {
    icon: "📅",
    title: "Muayene Takibi",
    description:
      "Aracınızın muayene tarihini kaydedin ve yaklaşan tarihi zamanında görün.",
  },
  {
    icon: "🛡️",
    title: "Sigorta Hatırlatması",
    description:
      "Zorunlu trafik sigortanızın bitiş tarihini kaçırmayın.",
  },
  {
    icon: "🛣️",
    title: "Seyrüsefer Takibi",
    description:
      "Seyrüsefer yenileme tarihinizi tek bir yerden takip edin.",
  },
  {
    icon: "🔧",
    title: "Rutin Bakım",
    description:
      "Bakım tarihlerini ve kilometre bilgilerini düzenli şekilde kaydedin.",
  },
];

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        color: "#1E293B",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <Navbar />

      <section
        style={{
          padding: "100px 24px 80px",
          textAlign: "center",
          background:
            "linear-gradient(180deg, #EFF6FF 0%, #F8FAFC 100%)",
        }}
      >
        <div
          style={{
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "clamp(40px, 7vw, 68px)",
              lineHeight: 1.06,
              letterSpacing: "-2px",
              color: "#0F172A",
            }}
          >
            Muayene, sigorta ve bakım
            <br />
            artık tek yerde.
          </h1>

          <p
            style={{
              maxWidth: "760px",
              margin: "26px auto 0",
              fontSize: "20px",
              lineHeight: 1.7,
              color: "#475569",
            }}
          >
            Aracınızın muayene, sigorta, seyrüsefer ve rutin bakım
            tarihlerini tek panelde takip edin. Önemli tarihleri kaçırmayın.
          </p>

          <div
            style={{
              marginTop: "38px",
              display: "flex",
              justifyContent: "center",
              flexWrap: "wrap",
              gap: "14px",
            }}
          >
            <Link
              href="/kayit"
              style={{
                backgroundColor: "#2563EB",
                color: "#FFFFFF",
                padding: "16px 28px",
                borderRadius: "12px",
                fontSize: "17px",
                fontWeight: 800,
                textDecoration: "none",
                boxShadow: "0 12px 30px rgba(37, 99, 235, 0.25)",
              }}
            >
              Ücretsiz Başla
            </Link>

            <Link
              href="/giris"
              style={{
                backgroundColor: "#FFFFFF",
                color: "#1E3A8A",
                border: "1px solid #CBD5E1",
                padding: "16px 28px",
                borderRadius: "12px",
                fontSize: "17px",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              Giriş Yap
            </Link>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: "1160px",
          margin: "0 auto",
          padding: "35px 24px 90px",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "36px",
              color: "#0F172A",
            }}
          >
            Aracınızın önemli işlemlerini takip edin
          </h2>

          <p
            style={{
              maxWidth: "680px",
              margin: "14px auto 0",
              color: "#64748B",
              fontSize: "17px",
              lineHeight: 1.6,
            }}
          >
            Tarihleri ayrı ayrı hatırlamaya çalışmak yerine hepsini Garaj
            Defteri'ne kaydedin.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "20px",
          }}
        >
          {features.map((feature) => (
            <article
              key={feature.title}
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E2E8F0",
                borderRadius: "18px",
                padding: "28px",
                boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "14px",
                  backgroundColor: "#EFF6FF",
                  fontSize: "26px",
                }}
              >
                {feature.icon}
              </div>

              <h3
                style={{
                  margin: "20px 0 10px",
                  fontSize: "20px",
                  color: "#0F172A",
                }}
              >
                {feature.title}
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#64748B",
                  lineHeight: 1.65,
                  fontSize: "15px",
                }}
              >
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid #E2E8F0",
          backgroundColor: "#FFFFFF",
          padding: "24px",
          textAlign: "center",
          color: "#64748B",
          fontSize: "14px",
        }}
      >
        © 2026 Garaj Defteri
      </footer>
    </main>
  );
}