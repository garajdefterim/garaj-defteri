import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GARAJ DEFTERİ",
    template: "%s | GARAJ DEFTERİ",
  },
  description:
    "Araçlarınızı, bakım kayıtlarınızı ve önemli tarihlerinizi tek panelden yönetin.",
  applicationName: "GARAJ DEFTERİ",
  keywords: [
    "araç takibi",
    "bakım takibi",
    "muayene",
    "sigorta",
    "seyrüsefer",
    "GARAJ DEFTERİ",
  ],
  authors: [{ name: "GARAJ DEFTERİ" }],
  creator: "GARAJ DEFTERİ",
  publisher: "GARAJ DEFTERİ",
  robots: {
    index: true,
    follow: true,
  },
};

const temaScripti = `
(function () {
  try {
    var tema = localStorage.getItem("garaj-defteri-tema");

    if (tema !== "acik" && tema !== "koyu") {
      tema = "acik";
    }

    document.documentElement.setAttribute("data-theme", tema);
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "acik");
  }
})();
`;

const whatsappLinki =
  "https://wa.me/905338622510?text=Merhaba%2C%20Garaj%20Defteri%20i%C3%A7in%20destek%20almak%20istiyorum.";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: temaScripti,
          }}
        />
      </head>

      <body
        style={{
          margin: 0,
          fontFamily:
            "var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif",
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            {children}
          </div>

          <footer
            className="site-footer"
            style={{
              width: "100%",
              borderTop: "1px solid var(--border)",
              backgroundColor: "var(--card)",
              color: "var(--foreground)",
            }}
          >
            <div className="site-footer-main">
              <div className="site-footer-brand">
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "9px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "10px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "#1D4ED8",
                      color: "#FFFFFF",
                      fontWeight: 800,
                      fontSize: "15px",
                    }}
                  >
                    GD
                  </div>

                  <strong
                    style={{
                      fontSize: "17px",
                      fontWeight: 800,
                      letterSpacing: "-0.3px",
                    }}
                  >
                    GARAJ DEFTERİ
                  </strong>
                </div>

                <p
                  style={{
                    margin: 0,
                    maxWidth: "330px",
                    color: "var(--muted)",
                    fontSize: "13px",
                    lineHeight: 1.7,
                  }}
                >
                  Araçlarınızı, bakım kayıtlarınızı, muayene, sigorta ve diğer
                  önemli tarihlerinizi tek yerden kolayca takip edin.
                </p>
              </div>

              <div className="site-footer-column">
                <strong className="site-footer-title">
                  Hızlı Bağlantılar
                </strong>

                <nav
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <a href="/" className="site-footer-link">
                    Ana Sayfa
                  </a>

                  <a href="/dashboard" className="site-footer-link">
                    Panelim
                  </a>

                  <a href="/arac-ekle" className="site-footer-link">
                    Araç Ekle
                  </a>
                </nav>
              </div>

              <div className="site-footer-column">
                <strong className="site-footer-title">Destek</strong>

                <p
                  style={{
                    margin: "0 0 12px",
                    maxWidth: "260px",
                    color: "var(--muted)",
                    fontSize: "13px",
                    lineHeight: 1.6,
                  }}
                >
                  Garaj Defteri ile ilgili soru ve destek talepleriniz için bize
                  ulaşabilirsiniz.
                </p>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "9px",
                    alignItems: "flex-start",
                  }}
                >
                  <a
                    href="tel:+905338622510"
                    className="site-footer-contact"
                    aria-label="Destek hattını ara: 0533 862 25 10"
                  >
                    <span aria-hidden="true">☎</span>
                    0533 862 25 10
                  </a>

                  <a
                    href={whatsappLinki}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="site-footer-whatsapp"
                    aria-label="WhatsApp üzerinden destek al"
                  >
                    <span aria-hidden="true">💬</span>
                    WhatsApp&apos;tan Yaz
                  </a>
                </div>
              </div>

              <div className="site-footer-column">
                <strong className="site-footer-title">Bilgilendirme</strong>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  <span className="site-footer-info">
                    Araç ve bakım kayıtlarınızı düzenli takip edin.
                  </span>

                  <span className="site-footer-info">
                    Önemli tarihlerinizi tek panelde yönetin.
                  </span>

                  <span className="site-footer-info">
                    Mobil ve masaüstü cihazlardan kullanın.
                  </span>
                </div>
              </div>
            </div>

            <div className="site-footer-bottom">
              <div className="site-footer-bottom-inner">
                <span>
                  © {new Date().getFullYear()} GARAJ DEFTERİ. Tüm hakları
                  saklıdır.
                </span>

                <span>Aracınızın dijital bakım ve takip defteri.</span>
              </div>
            </div>

            <style>{`
              .site-footer-main {
                width: 100%;
                max-width: 1180px;
                margin: 0 auto;
                padding: 36px 24px;
                display: grid;
                grid-template-columns: 1.35fr 0.8fr 1fr 1fr;
                gap: 40px;
              }

              .site-footer-brand,
              .site-footer-column {
                min-width: 0;
              }

              .site-footer-title {
                display: block;
                margin-bottom: 14px;
                color: var(--foreground);
                font-size: 13px;
                font-weight: 750;
              }

              .site-footer-link {
                width: fit-content;
                color: var(--muted);
                font-size: 13px;
                line-height: 1.5;
                text-decoration: none;
                transition:
                  color 0.2s ease,
                  transform 0.2s ease;
              }

              .site-footer-link:hover {
                color: #2563EB;
                transform: translateX(2px);
              }

              .site-footer-info {
                color: var(--muted);
                font-size: 13px;
                line-height: 1.6;
              }

              .site-footer-contact {
                min-height: 40px;
                padding: 0 13px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                border-radius: 9px;
                border: 1px solid var(--border-strong);
                background-color: var(--card-soft);
                color: var(--foreground);
                font-size: 13px;
                font-weight: 700;
                text-decoration: none;
                white-space: nowrap;
                transition:
                  border-color 0.2s ease,
                  transform 0.2s ease;
              }

              .site-footer-contact:hover {
                border-color: #2563EB;
                transform: translateY(-1px);
              }

              .site-footer-whatsapp {
                min-height: 40px;
                padding: 0 13px;
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                border-radius: 9px;
                border: 1px solid #2563EB;
                background-color: #1D4ED8;
                color: #FFFFFF;
                font-size: 13px;
                font-weight: 700;
                text-decoration: none;
                white-space: nowrap;
                transition:
                  background-color 0.2s ease,
                  transform 0.2s ease;
              }

              .site-footer-whatsapp:hover {
                background-color: #1E40AF;
                transform: translateY(-1px);
              }

              .site-footer-bottom {
                width: 100%;
                border-top: 1px solid var(--border);
              }

              .site-footer-bottom-inner {
                width: 100%;
                max-width: 1180px;
                margin: 0 auto;
                padding: 14px 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                gap: 16px;
                color: var(--muted);
                font-size: 12px;
                line-height: 1.5;
              }

              @media (max-width: 960px) {
                .site-footer-main {
                  grid-template-columns: 1fr 1fr;
                  gap: 32px;
                }
              }

              @media (max-width: 640px) {
                .site-footer-main {
                  grid-template-columns: 1fr;
                  gap: 28px;
                  padding: 30px 16px;
                }

                .site-footer-column {
                  padding-top: 2px;
                }

                .site-footer-contact,
                .site-footer-whatsapp {
                  width: 100%;
                  min-height: 46px;
                  box-sizing: border-box;
                }

                .site-footer-bottom-inner {
                  padding: 14px 16px;
                  flex-direction: column;
                  align-items: flex-start;
                  gap: 5px;
                }
              }
            `}</style>
          </footer>
        </div>
      </body>
    </html>
  );
}