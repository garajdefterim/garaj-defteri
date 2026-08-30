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
  var TEMA_KEY = "garaj-defteri-tema";

  function temaGecerliMi(tema) {
    return tema === "acik" || tema === "koyu";
  }

  function supabaseOturumTemasiniBul() {
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var key = localStorage.key(i);

        if (!key) continue;

        if (
          key.indexOf("sb-") !== 0 ||
          key.indexOf("-auth-token") === -1
        ) {
          continue;
        }

        if (/\.\d+$/.test(key)) {
          continue;
        }

        var raw = localStorage.getItem(key);

        if (!raw) continue;

        try {
          var session = JSON.parse(raw);

          if (
            session &&
            session.user &&
            session.user.user_metadata
          ) {
            var tema = session.user.user_metadata.tema;

            if (temaGecerliMi(tema)) {
              return tema;
            }
          }
        } catch (parseError) {
          // Bu kayıt beklenen JSON biçiminde değilse devam et.
        }
      }
    } catch (e) {
      // localStorage erişilemezse sessizce devam et.
    }

    return null;
  }

  function temayiUygula(tema, lokaleKaydet) {
    if (!temaGecerliMi(tema)) {
      tema = "acik";
    }

    var mevcutTema =
      document.documentElement.getAttribute("data-theme");

    if (mevcutTema !== tema) {
      document.documentElement.setAttribute(
        "data-theme",
        tema
      );
    }

    if (!lokaleKaydet) {
      return;
    }

    try {
      var kayitliTema = localStorage.getItem(TEMA_KEY);

      if (kayitliTema !== tema) {
        localStorage.setItem(TEMA_KEY, tema);
      }
    } catch (e) {
      // Tema HTML üzerinde uygulanmış olur.
    }
  }

  function ilkTemayiBul() {
    try {
      /*
       * İlk çizimde local tema önceliklidir.
       * Böylece daha önce seçilmiş tema, eski bir auth metadata
       * değeri tarafından tekrar tekrar ezilmez.
       */
      var localTema = localStorage.getItem(TEMA_KEY);

      if (temaGecerliMi(localTema)) {
        return localTema;
      }

      var supabaseTema = supabaseOturumTemasiniBul();

      if (temaGecerliMi(supabaseTema)) {
        return supabaseTema;
      }
    } catch (e) {
      // Varsayılan açık temaya düş.
    }

    return "acik";
  }

  function temayiSenkronizeEt() {
    var tema = ilkTemayiBul();
    temayiUygula(tema, true);
  }

  /*
   * İlk HTML çizilmeden önce tek seferde doğru temayı uygula.
   */
  temayiSenkronizeEt();

  /*
   * İlk sayfa çizimi tamamlanana kadar CSS geçişlerini kapalı tut.
   * Böylece açılışta açık/koyu renklerin kısa süre birbirine
   * karışması engellenir.
   */
  document.addEventListener("DOMContentLoaded", function () {
    window.requestAnimationFrame(function () {
      document.documentElement.setAttribute(
        "data-theme-ready",
        "true"
      );
    });
  });

  /*
   * Başka sekmede tema değişirse bu sekmeyi de güncelle.
   */
  window.addEventListener("storage", function (event) {
    if (
      event.key === TEMA_KEY ||
      (event.key &&
        event.key.indexOf("sb-") === 0 &&
        event.key.indexOf("-auth-token") !== -1)
    ) {
      temayiSenkronizeEt();
    }
  });

  /*
   * Tarayıcı geri/ileri önbelleğinden döndüğünde mevcut
   * local tercihi yeniden uygula.
   */
  window.addEventListener("pageshow", function () {
    temayiSenkronizeEt();
  });
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
        <style
          dangerouslySetInnerHTML={{
            __html: `
              html:not([data-theme-ready="true"]) *,
              html:not([data-theme-ready="true"]) *::before,
              html:not([data-theme-ready="true"]) *::after {
                transition: none !important;
                animation: none !important;
              }
            `,
          }}
        />

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
          className="site-root-shell"
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
                  className="site-footer-brand-row"
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
                  className="site-footer-description"
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
                  className="site-footer-support-text"
                  style={{
                    margin: "0 0 12px",
                    maxWidth: "300px",
                    color: "var(--muted)",
                    fontSize: "13px",
                    lineHeight: 1.6,
                  }}
                >
                  GARAJ DEFTERİM ile ilgili soru, öneri ve destek taleplerinizi
                  destek merkezimiz üzerinden bize iletebilirsiniz.
                </p>

                <div className="site-footer-support-actions">
                  <a
                    href="/destek"
                    className="site-footer-support-primary"
                    aria-label="Destek talebi oluştur"
                  >
                    <span aria-hidden="true">✉️</span>
                    Destek Talebi Oluştur
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
                  © {new Date().getFullYear()} GARAJ DEFTERİM. Tüm hakları
                  saklıdır.
                </span>

                <span>Aracınızın dijital bakım ve takip defteri.</span>
              </div>
            </div>

            <style>{`
              .site-root-shell,
              .site-root-shell * {
                box-sizing: border-box;
                min-width: 0;
              }

              .site-footer {
                overflow-x: hidden;
              }

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
                overflow-wrap: anywhere;
              }

              .site-footer-description,
              .site-footer-support-text {
                overflow-wrap: anywhere;
              }

              .site-footer-support-actions {
                display: flex;
                flex-wrap: wrap;
                gap: 9px;
              }

              .site-footer-support-primary,
              .site-footer-whatsapp {
                min-height: 44px;
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

              .site-footer-support-primary {
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

              .site-footer-whatsapp {
                border-color: var(--border-strong);
                background-color: var(--card-soft);
                color: var(--foreground);
              }

              .site-footer-support-primary:hover {
                background-color: #1E40AF;
                transform: translateY(-1px);
              }

              .site-footer-whatsapp:hover {
                background-color: var(--dark-button-bg-hover, var(--card-soft));
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
                  grid-template-columns: 1.2fr 1fr;
                  gap: 30px 36px;
                  padding: 32px 20px;
                }

                .site-footer-brand {
                  grid-column: 1 / -1;
                }

                .site-footer-bottom-inner {
                  padding-left: 20px;
                  padding-right: 20px;
                }
              }

              @media (max-width: 700px) {
                .site-root-shell {
                  min-height: 100dvh !important;
                }

                .site-footer-main {
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                  gap: 24px 18px;
                  padding: 28px 14px;
                }

                .site-footer-brand {
                  grid-column: 1 / -1;
                }

                .site-footer-brand-row {
                  margin-bottom: 10px !important;
                }

                .site-footer-description {
                  max-width: 100% !important;
                  font-size: 13px !important;
                  line-height: 1.6 !important;
                }

                .site-footer-support-text {
                  max-width: 100% !important;
                }

                .site-footer-support-actions {
                  display: grid;
                  grid-template-columns: minmax(0, 1fr);
                }

                .site-footer-support-primary,
                .site-footer-whatsapp {
                  width: 100%;
                  min-height: 46px;
                  padding-left: 10px;
                  padding-right: 10px;
                  white-space: normal;
                  text-align: center;
                }

                .site-footer-bottom-inner {
                  padding: 13px 14px;
                  display: grid;
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                  align-items: start;
                  gap: 10px 16px;
                }

                .site-footer-bottom-inner span:last-child {
                  text-align: right;
                }
              }

              @media (max-width: 480px) {
                .site-footer-main {
                  grid-template-columns: repeat(2, minmax(0, 1fr));
                  gap: 22px 14px;
                  padding: 24px 12px;
                }

                .site-footer-title {
                  margin-bottom: 10px;
                }

                .site-footer-info,
                .site-footer-support-text {
                  font-size: 12px !important;
                }

                .site-footer-bottom-inner {
                  padding: 12px;
                  grid-template-columns: minmax(0, 1fr);
                  gap: 4px;
                }

                .site-footer-bottom-inner span:last-child {
                  text-align: left;
                }
              }

              @media (max-width: 360px) {
                .site-footer-main {
                  grid-template-columns: minmax(0, 1fr);
                  gap: 22px;
                  padding-left: 10px;
                  padding-right: 10px;
                }

                .site-footer-brand {
                  grid-column: auto;
                }

                .site-footer-bottom-inner {
                  padding-left: 10px;
                  padding-right: 10px;
                }
              }
            `}</style>
          </footer>
        </div>
      </body>
    </html>
  );
}