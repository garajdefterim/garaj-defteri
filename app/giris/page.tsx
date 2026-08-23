"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useRef,
  useState,
  type FormEvent,
} from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import { supabase } from "../../lib/supabase";

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
        Garaj Defteri
      </div>
    </Link>
  );
}

export default function GirisPage() {
  const router = useRouter();
  const captchaRef = useRef<HCaptcha>(null);

  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [captchaToken, setCaptchaToken] =
    useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] =
    useState(false);
  const [googleYukleniyor, setGoogleYukleniyor] =
    useState(false);

  const hcaptchaSiteKey =
    process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? "";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setHata("");

    if (!hcaptchaSiteKey) {
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
        captchaRef.current?.resetCaptcha();
        setCaptchaToken("");

        const mesaj = error.message.toLowerCase();

        if (mesaj.includes("email not confirmed")) {
          setHata(
            "Önce e-posta adresinizi doğrulamanız gerekiyor."
          );
        } else if (
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

      router.push("/dashboard");
      router.refresh();
    } catch {
      captchaRef.current?.resetCaptcha();
      setCaptchaToken("");

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

    try {
      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo:
              `${window.location.origin}/dashboard`,
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
    <main
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
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 24px 72px",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "420px",
          }}
        >
          <div
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

                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={sifre}
                  onChange={(event) =>
                    setSifre(event.target.value)
                  }
                  placeholder="Şifrenizi girin"
                  style={inputStyle}
                />
              </label>

              {hcaptchaSiteKey && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    paddingTop: "2px",
                    overflow: "hidden",
                  }}
                >
                  <HCaptcha
                    ref={captchaRef}
                    sitekey={hcaptchaSiteKey}
                    onVerify={(token) => {
                      setCaptchaToken(token);
                      setHata("");
                    }}
                    onExpire={() => {
                      setCaptchaToken("");
                    }}
                    onError={() => {
                      setCaptchaToken("");
                      setHata(
                        "Güvenlik doğrulaması yüklenemedi. Lütfen tekrar deneyin."
                      );
                    }}
                  />
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
    </main>
  );
}