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
    default: "GARAJ DEFTERİM",
    template: "%s | GARAJ DEFTERİM",
  },
  description:
    "Araçlarınızı, bakım kayıtlarınızı ve önemli tarihlerinizi tek panelden yönetin.",
  applicationName: "GARAJ DEFTERİM",
  keywords: [
    "araç takibi",
    "bakım takibi",
    "muayene",
    "sigorta",
    "seyrüsefer",
    "GARAJ DEFTERİM",
  ],
  authors: [{ name: "GARAJ DEFTERİM" }],
  creator: "GARAJ DEFTERİM",
  publisher: "GARAJ DEFTERİM",
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
                    GARAJ DEFTERİM
                  </strong>
                </div>

                <p
                  style={{
                    margin: 0,
                    maxWidth: "370px",
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
                <strong className="site-footer-title">Destek</strong>

                <p
                  style={{
                    margin: "0 0 12px",
                    maxWidth: "300px",
                    color: "var(--muted)",
                    fontSize: "13px",
                    lineHeight: 1.6,
                  }}
                >
                  GARAJ DEFTERİM ile ilgili soru ve destek talepleriniz için
                  WhatsApp üzerinden bize ulaşabilirsiniz.
                </p>

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
                  © {new Date().getFullYear()} GARAJ DEFTERİM. Tüm hakları
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
                grid-template-columns: 1.35fr 1fr 1fr;
                gap: 48px;
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

              .site-footer-info {
                color: var(--muted);
                font-size: 13px;
                line-height: 1.6;
              }

              .site-footer-whatsapp {
                min-height: 42px;
                padding: 0 15px;
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

              @media (max-width: 900px) {
                .site-footer-main {
                  grid-template-columns: 1fr 1fr;
                  gap: 32px;
                }

                .site-footer-brand {
                  grid-column: 1 / -1;
                }
              }

              @media (max-width: 640px) {
                .site-footer-main {
                  grid-template-columns: 1fr;
                  gap: 28px;
                  padding: 30px 16px;
                }

                .site-footer-brand {
                  grid-column: auto;
                }

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