"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  beniHatirlaAyarla,
  beniHatirlaTercihiniOku,
  HATIRLANAN_EMAIL_KEY,
  supabase,
} from "../../lib/supabase";

type TurnstileApi = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      theme?: "light" | "dark" | "auto";
      callback?: (token: string) => void;
      "expired-callback"?: () => void;
      "error-callback"?: () => void;
    }
  ) => string;
  reset: (widgetId?: string) => void;
  remove: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}


function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"
      />
      <path
        fill="#34A853"
        d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"
      />
      <path
        fill="#FBBC05"
        d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.11-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.55l3.35-2.62Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"
      />
    </svg>
  );
}

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

export default function GirisPage() {
  const router = useRouter();
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [sifreGoster, setSifreGoster] = useState(false);
  const [beniHatirla, setBeniHatirla] = useState(false);
  const [captchaToken, setCaptchaToken] =
    useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] =
    useState(false);
  const [googleYukleniyor, setGoogleYukleniyor] =
    useState(false);

  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  useEffect(() => {
    /*
     * Production'da tek origin kullanıyoruz.
     * www / non-www arasında localStorage ve Supabase session
     * bölünmesin diye giriş ekranını kanonik domaine taşır.
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

    const hatirla =
      beniHatirlaTercihiniOku();

    setBeniHatirla(hatirla);

    if (hatirla) {
      const hatirlananEmail =
        localStorage.getItem(
          HATIRLANAN_EMAIL_KEY
        );

      if (hatirlananEmail) {
        setEmail(hatirlananEmail);
      }
    }
  }, []);

  useEffect(() => {
    if (!turnstileSiteKey) {
      return;
    }

    let iptalEdildi = false;

    const widgetOlustur = () => {
      if (
        iptalEdildi ||
        !window.turnstile ||
        !turnstileContainerRef.current ||
        turnstileWidgetIdRef.current
      ) {
        return;
      }

      turnstileWidgetIdRef.current =
        window.turnstile.render(
          turnstileContainerRef.current,
          {
            sitekey: turnstileSiteKey,
            theme: "auto",
            callback: (token) => {
              setCaptchaToken(token);
              setHata("");
            },
            "expired-callback": () => {
              setCaptchaToken("");
            },
            "error-callback": () => {
              setCaptchaToken("");
              setHata(
                "Güvenlik doğrulaması yüklenemedi. Lütfen tekrar deneyin."
              );
            },
          }
        );
    };

    const scriptSrc =
      "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    const mevcutScript = document.querySelector<HTMLScriptElement>(
      `script[src="${scriptSrc}"]`
    );

    if (window.turnstile) {
      widgetOlustur();
    } else if (mevcutScript) {
      mevcutScript.addEventListener("load", widgetOlustur);
    } else {
      const script = document.createElement("script");
      script.src = scriptSrc;
      script.async = true;
      script.defer = true;
      script.addEventListener("load", widgetOlustur);
      document.head.appendChild(script);
    }

    return () => {
      iptalEdildi = true;

      if (mevcutScript) {
        mevcutScript.removeEventListener(
          "load",
          widgetOlustur
        );
      }

      if (
        window.turnstile &&
        turnstileWidgetIdRef.current
      ) {
        window.turnstile.remove(
          turnstileWidgetIdRef.current
        );
        turnstileWidgetIdRef.current = null;
      }
    };
  }, [turnstileSiteKey]);

  function turnstileSifirla() {
    if (
      window.turnstile &&
      turnstileWidgetIdRef.current
    ) {
      window.turnstile.reset(
        turnstileWidgetIdRef.current
      );
    }

    setCaptchaToken("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setHata("");

    if (!turnstileSiteKey) {
      setHata(
        "Güvenlik doğrulaması yapılandırılmamış."
      );
      return;
    }

    if (!captchaToken) {
      setHata(
        "Lütfen güvenlik doğrulamasını tamamlayın."
      );
      return;
    }

    setYukleniyor(true);

    // Oturumun tarayıcı kapatıldıktan sonra da korunup korunmayacağını belirle.
    beniHatirlaAyarla(beniHatirla);

    try {
      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: sifre,
          options: {
            captchaToken,
          },
        });

      if (error) {
        turnstileSifirla();

        const mesaj = error.message.toLowerCase();

        if (
          mesaj.includes("captcha") ||
          mesaj.includes("challenge")
        ) {
          setHata(
            "Güvenlik doğrulaması başarısız oldu. Lütfen tekrar deneyin."
          );
        } else {
          setHata(
            "E-posta adresi veya şifre hatalı."
          );
        }

        return;
      }

      if (beniHatirla) {
        localStorage.setItem(
          HATIRLANAN_EMAIL_KEY,
          email.trim().toLowerCase()
        );
      } else {
        localStorage.removeItem(
          HATIRLANAN_EMAIL_KEY
        );
      }

      window.location.replace("/dashboard");
    } catch {
      turnstileSifirla();

      setHata(
        "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setYukleniyor(false);
    }
  }

  async function googleIleGirisYap() {
    setHata("");
    setGoogleYukleniyor(true);

    beniHatirlaAyarla(beniHatirla);

    if (!beniHatirla) {
      localStorage.removeItem(
        HATIRLANAN_EMAIL_KEY
      );
    }

    try {
      const production =
        window.location.hostname ===
          "www.garajdefterim.com" ||
        window.location.hostname ===
          "garajdefterim.com";

      const redirectTo = production
        ? "https://www.garajdefterim.com/google-dogrula"
        : `${window.location.origin}/google-dogrula`;

      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo,
          },
        });

      if (error) {
        setHata(
          `Google ile giriş başlatılamadı: ${error.message}`
        );
        setGoogleYukleniyor(false);
      }
    } catch {
      setHata(
        "Google ile giriş başlatılırken bir hata oluştu."
      );
      setGoogleYukleniyor(false);
    }
  }

  const inputStyle = {
    width: "100%",
    boxSizing: "border-box" as const,
    height: "48px",
    padding: "0 14px",
    borderRadius: "9px",
    border: "1px solid #D7DCE3",
    backgroundColor: "#FFFFFF",
    color: "#111827",
    fontSize: "15px",
    outline: "none",
  };

  const labelStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "7px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: 600,
  };

  const isDisabled =
    yukleniyor ||
    googleYukleniyor ||
    !captchaToken;

  return (
    <main className="giris-page"
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
      <header className="giris-header"
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
        className="giris-shell"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 24px 72px",
        }}
      >
        <section
          className="giris-section"
          style={{
            width: "100%",
            maxWidth: "420px",
          }}
        >
          <div
            className="giris-title"
            style={{
              marginBottom: "28px",
            }}
          >
            <h1
              style={{
                margin: 0,
                color: "#111827",
                fontSize: "30px",
                lineHeight: 1.2,
                fontWeight: 750,
                letterSpacing: "-0.8px",
              }}
            >
              Tekrar hoş geldiniz
            </h1>

            <p
              style={{
                margin: "9px 0 0",
                color: "#6B7280",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              Hesabınıza giriş yaparak devam edin.
            </p>
          </div>

          <div
            className="giris-card"
            style={{
              padding: "28px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E3E7EC",
              borderRadius: "14px",
              boxShadow:
                "0 1px 2px rgba(15, 23, 42, 0.03)",
            }}
          >
            <button
              type="button"
              onClick={googleIleGirisYap}
              disabled={
                googleYukleniyor || yukleniyor
              }
              style={{
                width: "100%",
                height: "48px",
                padding: "0 16px",
                border: "1px solid #D7DCE3",
                borderRadius: "9px",
                backgroundColor: "#FFFFFF",
                color: "#1F2937",
                fontSize: "14px",
                fontWeight: 650,
                cursor:
                  googleYukleniyor || yukleniyor
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                opacity:
                  googleYukleniyor || yukleniyor
                    ? 0.65
                    : 1,
              }}
            >
              <GoogleIcon />

              {googleYukleniyor
                ? "Google'a yönlendiriliyor..."
                : "Google ile devam et"}
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                margin: "24px 0",
              }}
            >
              <div
                style={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "#E8EBEF",
                }}
              />

              <span
                style={{
                  color: "#9CA3AF",
                  fontSize: "11px",
                  fontWeight: 650,
                  letterSpacing: "0.06em",
                }}
              >
                VEYA
              </span>

              <div
                style={{
                  flex: 1,
                  height: "1px",
                  backgroundColor: "#E8EBEF",
                }}
              />
            </div>

            <form
              className="giris-form"
              onSubmit={handleSubmit}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "17px",
              }}
            >
              <label style={labelStyle}>
                E-posta adresi

                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="ornek@email.com"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Şifre

                <div
                  style={{
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <input
                    type={sifreGoster ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={sifre}
                    onChange={(event) =>
                      setSifre(event.target.value)
                    }
                    placeholder="Şifrenizi girin"
                    style={{
                      ...inputStyle,
                      paddingRight: "48px",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setSifreGoster((onceki) => !onceki)
                    }
                    aria-label={
                      sifreGoster
                        ? "Şifreyi gizle"
                        : "Şifreyi göster"
                    }
                    title={
                      sifreGoster
                        ? "Şifreyi gizle"
                        : "Şifreyi göster"
                    }
                    style={{
                      position: "absolute",
                      top: "50%",
                      right: "5px",
                      transform: "translateY(-50%)",
                      width: "38px",
                      height: "38px",
                      padding: 0,
                      border: "none",
                      borderRadius: "7px",
                      backgroundColor: "transparent",
                      color: "#6B7280",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {sifreGoster ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 3l18 18" />
                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                        <path d="M9.9 4.2A10.8 10.8 0 0 1 12 4c5.5 0 9.5 5.2 10 6.1a3.5 3.5 0 0 1 0 3.8 16 16 0 0 1-2.1 2.7" />
                        <path d="M6.6 6.6A16.5 16.5 0 0 0 2 10.1a3.5 3.5 0 0 0 0 3.8C2.5 14.8 6.5 20 12 20a10 10 0 0 0 4-.8" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <div
                className="giris-login-options"
                style={{
                  marginTop: "-7px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "12px",
                }}
              >
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#4B5563",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={beniHatirla}
                    onChange={(event) =>
                      setBeniHatirla(event.target.checked)
                    }
                    style={{
                      width: "18px",
                      height: "18px",
                      margin: 0,
                      accentColor: "#1D4ED8",
                      cursor: "pointer",
                    }}
                  />
                  Beni hatırla
                </label>

                <Link
                  href="/sifremi-unuttum"
                  style={{
                    color: "#1D4ED8",
                    fontSize: "13px",
                    fontWeight: 700,
                    textDecoration: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  Şifremi unuttum
                </Link>
              </div>

              {turnstileSiteKey && (
                <div
                  className="giris-turnstile"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    paddingTop: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div ref={turnstileContainerRef} />
                </div>
              )}

              {hata && (
                <div
                  role="alert"
                  style={{
                    padding: "12px 13px",
                    borderRadius: "8px",
                    border:
                      "1px solid #F1C7C7",
                    backgroundColor: "#FFF7F7",
                    color: "#A93838",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  {hata}
                </div>
              )}

              <button
                type="submit"
                disabled={isDisabled}
                style={{
                  width: "100%",
                  height: "48px",
                  marginTop: "2px",
                  border: "none",
                  borderRadius: "9px",
                  backgroundColor: isDisabled
                    ? "#AAB2BD"
                    : "#1D4ED8",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: isDisabled
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {yukleniyor
                  ? "Giriş yapılıyor..."
                  : "Giriş Yap"}
              </button>
            </form>

            <div
              style={{
                height: "1px",
                backgroundColor: "#EEF0F2",
                margin: "26px 0 22px",
              }}
            />

            <p
              style={{
                margin: 0,
                textAlign: "center",
                color: "#6B7280",
                fontSize: "14px",
              }}
            >
              Henüz hesabınız yok mu?{" "}
              <Link
                href="/kayit"
                style={{
                  color: "#1D4ED8",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Hesap oluşturun
              </Link>
            </p>
          </div>

          <p
            style={{
              margin: "22px 0 0",
              textAlign: "center",
            }}
          >
            <Link
              href="/"
              style={{
                color: "#7B8492",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              Ana sayfaya dön
            </Link>
          </p>
        </section>
      </div>

      <style jsx global>{`
        .giris-page,
        .giris-page * {
          min-width: 0;
          box-sizing: border-box;
        }

        .giris-card input,
        .giris-card button,
        .giris-card a {
          max-width: 100%;
        }

        @media (max-width: 900px) {
          .giris-header {
            padding: 24px 20px !important;
          }

          .giris-shell {
            padding: 24px 20px 56px !important;
          }
        }

        @media (max-width: 700px) {
          .giris-page {
            min-height: 100dvh !important;
            overflow-x: hidden;
          }

          .giris-header {
            padding: 18px 16px !important;
          }

          .giris-shell {
            align-items: flex-start !important;
            padding: 18px 14px 42px !important;
          }

          .giris-section {
            width: 100% !important;
            max-width: 440px !important;
          }

          .giris-title {
            margin-bottom: 18px !important;
          }

          .giris-title h1 {
            font-size: 28px !important;
            letter-spacing: -0.6px !important;
          }

          .giris-title p {
            font-size: 14px !important;
            line-height: 1.55 !important;
          }

          .giris-card {
            padding: 20px !important;
            border-radius: 12px !important;
          }

          .giris-form {
            gap: 16px !important;
          }

          .giris-card input {
            width: 100% !important;
            min-width: 0 !important;
            font-size: 16px !important;
          }

          .giris-card button {
            min-width: 0 !important;
            min-height: 46px;
          }

          .giris-login-options {
            min-height: 44px;
          }

          .giris-login-options input[type="checkbox"] {
            width: 18px !important;
            min-width: 18px !important;
            height: 18px !important;
          }

          .giris-turnstile {
            width: 100% !important;
            justify-content: center !important;
            overflow: visible !important;
          }

          .giris-turnstile > div {
            max-width: 100%;
          }
        }

        @media (max-width: 480px) {
          .giris-header {
            padding: 16px 14px !important;
          }

          .giris-shell {
            padding: 14px 12px 36px !important;
          }

          .giris-title {
            margin-bottom: 16px !important;
          }

          .giris-title h1 {
            font-size: 27px !important;
          }

          .giris-card {
            padding: 18px !important;
          }
        }

        @media (max-width: 380px) {
          .giris-header {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .giris-shell {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .giris-card {
            padding: 16px !important;
          }

          .giris-title h1 {
            font-size: 26px !important;
          }

          .giris-turnstile {
            transform: scale(0.92);
            transform-origin: center top;
            margin-bottom: -6px;
          }
        }

        @media (max-width: 340px) {
          .giris-card {
            padding-left: 14px !important;
            padding-right: 14px !important;
          }

          .giris-turnstile {
            transform: scale(0.84);
            margin-bottom: -12px;
          }
        }
      `}</style>
    </main>
  );
}