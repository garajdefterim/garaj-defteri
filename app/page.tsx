import Link from "next/link";
import Navbar from "../components/Navbar";

const features = [
  {
    eyebrow: "Muayene",
    title: "Resmî tarihleri düzenli takip edin",
    description:
      "Araç muayene dönemlerinizi tek panelde görün ve yaklaşan tarihleri önceden takip edin.",
  },
  {
    eyebrow: "Sigorta",
    title: "Bitiş tarihlerini gözden kaçırmayın",
    description:
      "Sigorta bitiş tarihlerinizi araç bazında kaydedin ve yaklaşan yenilemeleri zamanında görün.",
  },
  {
    eyebrow: "Seyrüsefer",
    title: "Yenileme tarihlerini tek yerde yönetin",
    description:
      "Seyrüsefer bilgilerinizi araçlarınızla birlikte saklayın ve yaklaşan tarihleri kolayca kontrol edin.",
  },
  {
    eyebrow: "Bakım",
    title: "Bakım geçmişinizi kayıt altında tutun",
    description:
      "Bakım tarihlerini, kilometreyi ve masrafları düzenli şekilde kaydedin.",
  },
];

const highlights = [
  "Tüm araçlar tek panelde",
  "Bakım ve masraf geçmişi",
  "E-posta hatırlatmaları",
];

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7F8FA",
        color: "#111827",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <Navbar />

      <section
        style={{
          padding: "112px 24px 84px",
          borderBottom: "1px solid #E8EBEF",
          backgroundColor: "#FFFFFF",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "1180px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "64px",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: "30px",
                padding: "0 10px",
                border: "1px solid #D7DCE3",
                borderRadius: "999px",
                backgroundColor: "#F8FAFC",
                color: "#4B5563",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.03em",
              }}
            >
              ARAÇ TAKİP VE BAKIM YÖNETİMİ
            </div>

            <h1
              style={{
                margin: "22px 0 0",
                maxWidth: "760px",
                fontSize: "clamp(44px, 7vw, 72px)",
                lineHeight: 1.02,
                letterSpacing: "-3px",
                fontWeight: 760,
                color: "#0F172A",
              }}
            >
              Aracınızla ilgili önemli tarihleri tek yerde yönetin.
            </h1>

            <p
              style={{
                maxWidth: "680px",
                margin: "24px 0 0",
                fontSize: "18px",
                lineHeight: 1.7,
                color: "#6B7280",
              }}
            >
              Muayene, sigorta, seyrüsefer ve bakım bilgilerinizi Garaj
              Defteri'nde toplayın. Yaklaşan işlemleri takip edin, bakım
              geçmişinizi kaydedin ve araçlarınızı düzenli yönetin.
            </p>

            <div
              style={{
                marginTop: "32px",
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <Link
                href="/kayit"
                style={{
                  minHeight: "48px",
                  padding: "0 20px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "9px",
                  backgroundColor: "#1D4ED8",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Ücretsiz Hesap Oluştur
              </Link>

              <Link
                href="/giris"
                style={{
                  minHeight: "48px",
                  padding: "0 20px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "9px",
                  border: "1px solid #D7DCE3",
                  backgroundColor: "#FFFFFF",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: 650,
                  textDecoration: "none",
                }}
              >
                Giriş Yap
              </Link>
            </div>

            <div
              style={{
                marginTop: "30px",
                display: "flex",
                flexWrap: "wrap",
                gap: "18px",
                color: "#6B7280",
                fontSize: "13px",
              }}
            >
              {highlights.map((item) => (
                <span
                  key={item}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "7px",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#1D4ED8",
                    }}
                  />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div
            aria-hidden="true"
            style={{
              minHeight: "420px",
              padding: "26px",
              border: "1px solid #E3E7EC",
              borderRadius: "18px",
              backgroundColor: "#F8FAFC",
              boxShadow: "0 20px 50px rgba(15, 23, 42, 0.06)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                padding: "22px",
                border: "1px solid #E3E7EC",
                borderRadius: "14px",
                backgroundColor: "#FFFFFF",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  alignItems: "center",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "block",
                      color: "#6B7280",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    ARAÇ
                  </span>

                  <strong
                    style={{
                      display: "block",
                      marginTop: "6px",
                      color: "#111827",
                      fontSize: "20px",
                    }}
                  >
                    Toyota Corolla
                  </strong>

                  <span
                    style={{
                      display: "block",
                      marginTop: "4px",
                      color: "#6B7280",
                      fontSize: "13px",
                      letterSpacing: "0.04em",
                      fontWeight: 650,
                    }}
                  >
                    UM 590
                  </span>
                </div>

                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "11px",
                    backgroundColor: "#0F172A",
                    color: "#FFFFFF",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12px",
                    fontWeight: 800,
                    letterSpacing: "0.04em",
                  }}
                >
                  GD
                </div>
              </div>

              <div
                style={{
                  marginTop: "20px",
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: "10px",
                }}
              >
                {[
                  ["Muayene", "18 gün kaldı"],
                  ["Sigorta", "42 gün kaldı"],
                  ["Seyrüsefer", "76 gün kaldı"],
                  ["Son bakım", "12.08.2026"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    style={{
                      padding: "13px",
                      borderRadius: "10px",
                      backgroundColor: "#FAFAFA",
                      border: "1px solid #E5E7EB",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        color: "#6B7280",
                        fontSize: "11px",
                      }}
                    >
                      {label}
                    </span>
                    <strong
                      style={{
                        display: "block",
                        marginTop: "5px",
                        color: "#111827",
                        fontSize: "13px",
                      }}
                    >
                      {value}
                    </strong>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                marginTop: "12px",
                padding: "18px",
                border: "1px solid #E3E7EC",
                borderRadius: "14px",
                backgroundColor: "#FFFFFF",
              }}
            >
              <span
                style={{
                  color: "#6B7280",
                  fontSize: "12px",
                }}
              >
                Son bakım
              </span>

              <div
                style={{
                  marginTop: "8px",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  alignItems: "center",
                }}
              >
                <strong
                  style={{
                    fontSize: "14px",
                    color: "#111827",
                  }}
                >
                  Motor yağı ve filtre değişimi
                </strong>

                <span
                  style={{
                    color: "#6B7280",
                    fontSize: "12px",
                    whiteSpace: "nowrap",
                  }}
                >
                  ₺2.500
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          padding: "88px 24px 96px",
        }}
      >
        <div
          style={{
            maxWidth: "720px",
            marginBottom: "36px",
          }}
        >
          <span
            style={{
              color: "#1D4ED8",
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.08em",
            }}
          >
            ÖZELLİKLER
          </span>

          <h2
            style={{
              margin: "10px 0 0",
              fontSize: "clamp(30px, 5vw, 42px)",
              lineHeight: 1.15,
              letterSpacing: "-1.2px",
              color: "#0F172A",
            }}
          >
            Araç yönetiminin temel ihtiyaçları tek panelde.
          </h2>

          <p
            style={{
              margin: "14px 0 0",
              color: "#6B7280",
              fontSize: "16px",
              lineHeight: 1.65,
            }}
          >
            Gereksiz karmaşa olmadan, aracınız için gerçekten takip etmeniz
            gereken bilgileri düzenli tutun.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "14px",
          }}
        >
          {features.map((feature, index) => (
            <article
              key={feature.title}
              style={{
                minHeight: "230px",
                backgroundColor: "#FFFFFF",
                border: "1px solid #E3E7EC",
                borderRadius: "14px",
                padding: "24px",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
              }}
            >
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "9px",
                  backgroundColor: "#F1F5F9",
                  color: "#475569",
                  fontSize: "12px",
                  fontWeight: 800,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </div>

              <span
                style={{
                  display: "block",
                  marginTop: "22px",
                  color: "#1D4ED8",
                  fontSize: "12px",
                  fontWeight: 750,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {feature.eyebrow}
              </span>

              <h3
                style={{
                  margin: "8px 0 0",
                  fontSize: "19px",
                  lineHeight: 1.35,
                  color: "#111827",
                }}
              >
                {feature.title}
              </h3>

              <p
                style={{
                  margin: "10px 0 0",
                  color: "#6B7280",
                  lineHeight: 1.65,
                  fontSize: "14px",
                }}
              >
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          padding: "0 24px 96px",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            padding: "44px",
            borderRadius: "16px",
            backgroundColor: "#0F172A",
            color: "#FFFFFF",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "28px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "clamp(28px, 4vw, 38px)",
                letterSpacing: "-1px",
              }}
            >
              Garajınızı düzenli tutmaya başlayın.
            </h2>

            <p
              style={{
                margin: "10px 0 0",
                color: "#CBD5E1",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              Hesabınızı oluşturun, aracınızı ekleyin ve önemli tarihlerinizi
              tek panelden takip edin.
            </p>
          </div>

          <Link
            href="/kayit"
            style={{
              minHeight: "48px",
              padding: "0 20px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9px",
              backgroundColor: "#FFFFFF",
              color: "#0F172A",
              fontSize: "14px",
              fontWeight: 700,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            Hesap Oluştur
          </Link>
        </div>
      </section>

      <footer
        style={{
          borderTop: "1px solid #E3E7EC",
          backgroundColor: "#FFFFFF",
          padding: "24px",
          color: "#6B7280",
          fontSize: "13px",
        }}
      >
        <div
          style={{
            maxWidth: "1180px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <strong
            style={{
              color: "#374151",
              fontWeight: 650,
            }}
          >
            Garaj Defteri
          </strong>

          <span>© 2026 Garaj Defteri</span>
        </div>
      </footer>
    </main>
  );
}