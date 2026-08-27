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
            className="site-support-footer"
            style={{
              width: "100%",
              borderTop: "1px solid var(--border)",
              backgroundColor: "var(--card)",
              color: "var(--foreground)",
            }}
          >
            <div
              className="site-support-footer-inner"
              style={{
                width: "100%",
                maxWidth: "1180px",
                margin: "0 auto",
                padding: "22px 24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{
                  minWidth: 0,
                }}
              >
                <strong
                  style={{
                    display: "block",
                    fontSize: "14px",
                    fontWeight: 750,
                    color: "var(--foreground)",
                  }}
                >
                  Destek Hattı
                </strong>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "var(--muted)",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  Garaj Defteri ile ilgili destek için bize ulaşabilirsiniz.
                </p>
              </div>

              <div
                className="site-support-footer-actions"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <a
                  href="tel:+905338622510"
                  aria-label="Destek hattını ara: 0533 862 25 10"
                  style={{
                    minHeight: "42px",
                    padding: "0 14px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    borderRadius: "9px",
                    border: "1px solid var(--border-strong)",
                    backgroundColor: "var(--card-soft)",
                    color: "var(--foreground)",
                    fontSize: "13px",
                    fontWeight: 700,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span aria-hidden="true">☎</span>
                  0533 862 25 10
                </a>

                <a
                  href={whatsappLinki}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp üzerinden destek al"
                  style={{
                    minHeight: "42px",
                    padding: "0 15px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    borderRadius: "9px",
                    border: "1px solid #2563EB",
                    backgroundColor: "#1D4ED8",
                    color: "#FFFFFF",
                    fontSize: "13px",
                    fontWeight: 700,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span aria-hidden="true">💬</span>
                  WhatsApp&apos;tan Yaz
                </a>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                borderTop: "1px solid var(--border)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "1180px",
                  margin: "0 auto",
                  padding: "13px 24px",
                  color: "var(--muted)",
                  fontSize: "12px",
                  lineHeight: 1.5,
                }}
              >
                © {new Date().getFullYear()} GARAJ DEFTERİ
              </div>
            </div>

            <style>{`
              @media (max-width: 640px) {
                .site-support-footer-inner {
                  padding: 20px 16px !important;
                  align-items: stretch !important;
                }

                .site-support-footer-actions {
                  width: 100% !important;
                  display: grid !important;
                  grid-template-columns: 1fr !important;
                }

                .site-support-footer-actions > a {
                  width: 100% !important;
                  min-height: 46px !important;
                }

                .site-support-footer > div:last-of-type > div {
                  padding-left: 16px !important;
                  padding-right: 16px !important;
                }
              }
            `}</style>
          </footer>
        </div>
      </body>
    </html>
  );
}