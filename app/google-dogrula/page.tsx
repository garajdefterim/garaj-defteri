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
    let oturumIsleniyor = false;

    const googleAkisi =
      sessionStorage.getItem(
        "garaj-defteri-google-auth-akis"
      );

    /*
     * OAuth dahil bütün auth akışını tek production origin üzerinde
     * tutuyoruz. Bu; session, Beni Hatırla ve tema verilerinin
     * www/non-www arasında ikiye bölünmesini engeller.
     */
    if (
      window.location.hostname ===
      "garajdefterim.com"
    ) {
      window.location.replace(
        `https://www.garajdefterim.com${window.location.pathname}${window.location.search}${window.location.hash}`
      );
      return;
    }

    function temayiUygula(
      metadata:
        | Record<string, unknown>
        | undefined
    ) {
      const tema = metadata?.tema;

      if (
        tema !== "acik" &&
        tema !== "koyu"
      ) {
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

    function kayitSayfasinaGit() {
      if (
        iptalEdildi ||
        yonlendirildi
      ) {
        return;
      }

      yonlendirildi = true;

      sessionStorage.removeItem(
        "garaj-defteri-google-auth-akis"
      );

      window.location.replace(
        "/kayit?google=giris"
      );
    }

    function dashboardaGit(
      user: {
        user_metadata?: Record<
          string,
          unknown
        >;
      }
    ) {
      if (
        iptalEdildi ||
        yonlendirildi
      ) {
        return;
      }

      yonlendirildi = true;

      sessionStorage.removeItem(
        "garaj-defteri-google-auth-akis"
      );

      temayiUygula(
        user.user_metadata
      );

      /*
       * Auth state'in storage'a tamamen yazılmasını bekledikten sonra
       * gerçek sayfa geçişi yapıyoruz.
       */
      window.setTimeout(() => {
        window.location.replace(
          "/dashboard"
        );
      }, 80);
    }

    async function oturumuIsle(
      session: {
        access_token: string;
        user: {
          email?: string;
          created_at?: string;
          last_sign_in_at?: string;
          identities?: Array<{
            provider?: string;
          }>;
          user_metadata?: Record<
            string,
            unknown
          >;
        };
      }
    ) {
      if (
        iptalEdildi ||
        yonlendirildi ||
        oturumIsleniyor
      ) {
        return;
      }

      oturumIsleniyor = true;

      try {
        /*
         * KAYIT sayfasından Google ile devam edildiğinde Google hesabının
         * e-posta adresine Supabase üzerinden 6 haneli OTP gönderilir.
         * Ayrı API route kullanılmaz.
         */
        if (googleAkisi === "kayit") {
          const googleEmail =
            session.user.email
              ?.trim()
              .toLowerCase() ?? "";

          const captchaToken =
            sessionStorage.getItem(
              "garaj-defteri-google-kayit-captcha"
            ) ?? "";

          if (!googleEmail) {
            throw new Error(
              "Google hesabının e-posta adresi alınamadı."
            );
          }

          if (!captchaToken) {
            throw new Error(
              "Google kayıt güvenlik doğrulaması bulunamadı."
            );
          }

          await supabase.auth.signOut();

          const { error: otpError } =
            await supabase.auth.signInWithOtp({
              email: googleEmail,
              options: {
                shouldCreateUser: false,
                captchaToken,
              },
            });

          sessionStorage.removeItem(
            "garaj-defteri-google-kayit-captcha"
          );

          if (otpError) {
            throw otpError;
          }

          sessionStorage.removeItem(
            "garaj-defteri-google-auth-akis"
          );

          yonlendirildi = true;

          window.location.replace(
            `/dogrula?email=${encodeURIComponent(
              googleEmail
            )}&google=1`
          );
          return;
        }

        /*
         * API route YOK.
         *
         * Supabase yeni Google kullanıcısını ilk OAuth dönüşünde zaten
         * Auth içine oluşturur. Giriş sayfasından gelen akışta:
         * - created_at ile last_sign_in_at birbirine çok yakınsa
         * - kimlik Google ise
         * bunu ilk kez oluşan Google hesabı kabul edip oturumu kapatır
         * ve kayıt sayfasına yollarız.
         *
         * Kayıt sayfasından başlatılan Google akışına dokunulmaz.
         */
        if (googleAkisi === "giris") {
          const createdAt =
            session.user.created_at
              ? new Date(
                  session.user.created_at
                ).getTime()
              : NaN;

          const lastSignInAt =
            session.user.last_sign_in_at
              ? new Date(
                  session.user.last_sign_in_at
                ).getTime()
              : NaN;

          const sadeceGoogle =
            (session.user.identities ?? [])
              .length > 0 &&
            (session.user.identities ?? [])
              .every(
                (identity) =>
                  identity.provider === "google"
              );

          const ilkGoogleGirisi =
            Number.isFinite(createdAt) &&
            Number.isFinite(lastSignInAt) &&
            Math.abs(
              lastSignInAt - createdAt
            ) <= 60_000 &&
            sadeceGoogle;

          if (ilkGoogleGirisi) {
            await supabase.auth.signOut();
            kayitSayfasinaGit();
            return;
          }
        }

        dashboardaGit(
          session.user
        );
      } catch (error) {
        sessionStorage.removeItem(
          "garaj-defteri-google-kayit-captcha"
        );

        console.error(
          "Google oturum işleme:",
          error
        );

        if (
          !iptalEdildi &&
          !yonlendirildi
        ) {
          setHata(
            googleAkisi === "kayit"
              ? "Google kayıt doğrulama kodu gönderilemedi. Kayıt sayfasına dönüp tekrar deneyin."
              : "Google girişi tamamlanamadı. Lütfen tekrar deneyin."
          );
        }
      } finally {
        oturumIsleniyor = false;
      }
    }

    async function oturumuBul() {
      setHata("");

      const url =
        new URL(window.location.href);

      const hash =
        new URLSearchParams(
          window.location.hash.replace(
            /^#/,
            ""
          )
        );

      const oauthHatasi =
        url.searchParams.get(
          "error_description"
        ) ||
        url.searchParams.get("error") ||
        hash.get("error_description") ||
        hash.get("error");

      if (oauthHatasi) {
        setHata(
          "Google ile giriş tamamlanamadı. Lütfen tekrar deneyin."
        );
        return;
      }

      /*
       * detectSessionInUrl callback hash'ini işlerken auth event'i
       * veya getSession sonucu gelebilir. İkisini de kabul ediyoruz.
       */
      for (
        let deneme = 0;
        deneme < 60;
        deneme += 1
      ) {
        if (
          iptalEdildi ||
          yonlendirildi
        ) {
          return;
        }

        const {
          data: { session },
          error,
        } =
          await supabase.auth.getSession();

        if (session?.user) {
          await oturumuIsle(session);
          return;
        }

        if (error) {
          console.error(
            "Google oturum kontrolü:",
            error
          );
        }

        await bekle(150);
      }

      if (
        !iptalEdildi &&
        !yonlendirildi
      ) {
        setHata(
          "Google oturumu oluşturulamadı. Lütfen giriş sayfasına dönüp tekrar deneyin."
        );
      }
    }

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          if (session?.user) {
            void oturumuIsle(session);
          }
        }
      );

    oturumuBul();

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
          padding:
            "24px 24px 72px",
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
              border:
                "1px solid #E3E7EC",
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
                letterSpacing:
                  "-0.7px",
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
                  margin:
                    "24px auto 0",
                  border:
                    "3px solid #DDE3EA",
                  borderTopColor:
                    "#1D4ED8",
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
                  padding:
                    "0 18px",
                  display:
                    "inline-flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  borderRadius: "9px",
                  backgroundColor:
                    "#1D4ED8",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration:
                    "none",
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
