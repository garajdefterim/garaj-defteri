"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

function Brand() {
  return (
    <Link
      href="/"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "11px",
        textDecoration: "none",
        color: "#111827",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "11px",
          backgroundColor: "#0F172A",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "15px",
          fontWeight: 800,
          letterSpacing: "-0.5px",
        }}
      >
        GD
      </div>

      <div
        style={{
          fontSize: "17px",
          lineHeight: 1.2,
          fontWeight: 750,
          letterSpacing: "-0.35px",
        }}
      >
        GARAJ DEFTERİM
      </div>
    </Link>
  );
}

function bekle(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export default function GoogleDogrulaPage() {
  const [hata, setHata] = useState("");

  useEffect(() => {
    let iptalEdildi = false;
    let yonlendirildi = false;

    function temayiUygula(
      metadata: Record<string, unknown> | undefined
    ) {
      const tema = metadata?.tema;

      if (tema !== "acik" && tema !== "koyu") {
        return;
      }

      localStorage.setItem(
        "garaj-defteri-tema",
        tema
      );

      document.documentElement.setAttribute(
        "data-theme",
        tema
      );
    }

    function dashboardaGit(
      user: {
        user_metadata?: Record<string, unknown>;
      }
    ) {
      if (iptalEdildi || yonlendirildi) {
        return;
      }

      yonlendirildi = true;
      temayiUygula(user.user_metadata);

      /*
       * Next router yerine gerçek sayfa geçişi kullanıyoruz.
       * Böylece dashboard yeni sayfada, Supabase oturumu storage'a
       * tamamen yazıldıktan sonra açılıyor.
       */
      window.location.replace("/dashboard");
    }

    async function oturumuBekle() {
      setHata("");

      const url = new URL(window.location.href);

      const oauthHatasi =
        url.searchParams.get("error_description") ||
        url.searchParams.get("error");

      const hashParams = new URLSearchParams(
        window.location.hash.replace(/^#/, "")
      );

      const hashHatasi =
        hashParams.get("error_description") ||
        hashParams.get("error");

      if (oauthHatasi || hashHatasi) {
        setHata(
          "Google ile giriş tamamlanamadı. Lütfen tekrar deneyin."
        );
        return;
      }

      /*
       * Supabase implicit OAuth dönüşündeki access_token bilgisini
       * detectSessionInUrl ile işler. Burada session oluşana kadar
       * kontrollü şekilde bekliyoruz.
       */
      for (let deneme = 0; deneme < 50; deneme += 1) {
        if (iptalEdildi || yonlendirildi) {
          return;
        }

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error(
            "Google session kontrolü:",
            error
          );
        }

        if (session?.user) {
          dashboardaGit(session.user);
          return;
        }

        await bekle(150);
      }

      if (!iptalEdildi && !yonlendirildi) {
        setHata(
          "Google oturumu oluşturulamadı. Giriş sayfasına dönüp tekrar deneyin."
        );
      }
    }

    /*
     * Auth event'i session kontrolünden önce gelirse kullanıcıyı
     * anında dashboard'a geçirir.
     */
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          dashboardaGit(session.user);
        }
      }
    );

    oturumuBekle();

    return () => {
      iptalEdildi = true;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <main
      className="google-dogrula-page"
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7F8FA",
        color: "#111827",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        className="google-dogrula-header"
        style={{
          width: "100%",
          maxWidth: "1180px",
          margin: "0 auto",
          boxSizing: "border-box",
          padding: "28px 24px",
        }}
      >
        <Brand />
      </header>

      <div
        className="google-dogrula-shell"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 24px 72px",
        }}
      >
        <section
          className="google-dogrula-section"
          style={{
            width: "100%",
            maxWidth: "420px",
          }}
        >
          <div
            className="google-dogrula-card"
            style={{
              padding: "28px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E3E7EC",
              borderRadius: "14px",
              boxShadow:
                "0 1px 2px rgba(15, 23, 42, 0.03)",
              textAlign: "center",
            }}
          >
            <h1
              style={{
                margin: 0,
                color: "#111827",
                fontSize: "28px",
                lineHeight: 1.2,
                fontWeight: 750,
                letterSpacing: "-0.7px",
              }}
            >
              {hata
                ? "Google girişi tamamlanamadı"
                : "Google hesabınız açılıyor"}
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "#6B7280",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              {hata
                ? hata
                : "Oturumunuz hazırlanıyor. Birkaç saniye bekleyin."}
            </p>

            {!hata && (
              <div
                aria-label="Yükleniyor"
                style={{
                  width: "28px",
                  height: "28px",
                  margin: "24px auto 0",
                  border: "3px solid #DDE3EA",
                  borderTopColor: "#1D4ED8",
                  borderRadius: "50%",
                  animation:
                    "google-dogrula-spin 0.8s linear infinite",
                }}
              />
            )}

            {hata && (
              <Link
                href="/giris"
                style={{
                  minHeight: "46px",
                  marginTop: "22px",
                  padding: "0 18px",
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
                Giriş sayfasına dön
              </Link>
            )}
          </div>
        </section>
      </div>

      <style jsx global>{`
        .google-dogrula-page,
        .google-dogrula-page * {
          min-width: 0;
          box-sizing: border-box;
        }

        @keyframes google-dogrula-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 900px) {
          .google-dogrula-header {
            padding: 24px 20px !important;
          }

          .google-dogrula-shell {
            padding: 24px 20px 56px !important;
          }
        }

        @media (max-width: 700px) {
          .google-dogrula-page {
            min-height: 100dvh !important;
            overflow-x: hidden;
          }

          .google-dogrula-header {
            padding: 18px 16px !important;
          }

          .google-dogrula-shell {
            align-items: flex-start !important;
            padding: 18px 14px 42px !important;
          }

          .google-dogrula-section {
            width: 100% !important;
            max-width: 440px !important;
          }

          .google-dogrula-card {
            padding: 20px !important;
            border-radius: 12px !important;
          }

          .google-dogrula-card h1 {
            font-size: 26px !important;
          }

          .google-dogrula-card a {
            min-height: 46px;
            max-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .google-dogrula-header {
            padding: 16px 14px !important;
          }

          .google-dogrula-shell {
            padding: 14px 12px 36px !important;
          }

          .google-dogrula-card {
            padding: 18px !important;
          }

          .google-dogrula-card h1 {
            font-size: 25px !important;
          }
        }

        @media (max-width: 380px) {
          .google-dogrula-header {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .google-dogrula-shell {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .google-dogrula-card {
            padding: 16px !important;
          }
        }
      `}</style>
    </main>
  );
}
