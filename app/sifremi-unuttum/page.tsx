"use client";

import Link from "next/link";
import {
  useRef,
  useState,
  type FormEvent,
} from "react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
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
        GARAJ DEFTERİ
      </div>
    </Link>
  );
}

export default function SifremiUnuttumPage() {
  const captchaRef = useRef<HCaptcha>(null);

  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] =
    useState("");

  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [yukleniyor, setYukleniyor] =
    useState(false);

  const hcaptchaSiteKey =
    process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? "";

  async function sifreSifirlamaGonder(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setHata("");
    setMesaj("");

    const temizEmail =
      email.trim().toLowerCase();

    if (!temizEmail) {
      setHata(
        "Lütfen e-posta adresinizi girin."
      );
      return;
    }

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
        await supabase.auth.resetPasswordForEmail(
          temizEmail,
          {
            redirectTo:
              `${window.location.origin}/sifre-yenile`,
            captchaToken,
          }
        );

      captchaRef.current?.resetCaptcha();
      setCaptchaToken("");

      if (error) {
        console.error(
          "Şifre sıfırlama hatası:",
          error
        );

        const hataMesaji =
          error.message.toLowerCase();

        if (
          hataMesaji.includes("captcha")
        ) {
          setHata(
            "Güvenlik doğrulaması başarısız oldu. Lütfen tekrar deneyin."
          );
        } else if (
          hataMesaji.includes("rate") ||
          hataMesaji.includes("limit")
        ) {
          setHata(
            "Çok fazla şifre sıfırlama isteği yapıldı. Lütfen biraz bekleyip tekrar deneyin."
          );
        } else {
          setHata(
            "Şifre sıfırlama e-postası gönderilemedi. Lütfen tekrar deneyin."
          );
        }

        return;
      }

      setMesaj(
        "Şifre yenileme bağlantısı e-posta adresinize gönderildi. Gelen kutunuzu ve spam klasörünü kontrol edin."
      );
    } catch (error) {
      console.error(
        "Beklenmeyen şifre sıfırlama hatası:",
        error
      );

      captchaRef.current?.resetCaptcha();
      setCaptchaToken("");

      setHata(
        "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setYukleniyor(false);
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

  return (
    <main className="sifremi-unuttum-page"
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
      <header className="sifremi-unuttum-header"
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
        className="sifremi-unuttum-shell"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 24px 72px",
        }}
      >
        <section
          className="sifremi-unuttum-section"
          style={{
            width: "100%",
            maxWidth: "420px",
          }}
        >
          <div
            className="sifremi-unuttum-title"
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
              Şifrenizi yenileyin
            </h1>

            <p
              style={{
                margin: "9px 0 0",
                color: "#6B7280",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              Hesabınıza bağlı e-posta adresini girin.
              Size güvenli bir şifre yenileme bağlantısı
              göndereceğiz.
            </p>
          </div>

          <div
            className="sifremi-unuttum-card"
            style={{
              padding: "28px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E3E7EC",
              borderRadius: "14px",
              boxShadow:
                "0 1px 2px rgba(15, 23, 42, 0.03)",
            }}
          >
            <form
              className="sifremi-unuttum-form"
              onSubmit={sifreSifirlamaGonder}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "17px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "7px",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
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

              {hcaptchaSiteKey && (
                <div
                  className="sifremi-unuttum-captcha"
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

              {mesaj && (
                <div
                  role="status"
                  style={{
                    padding: "12px 13px",
                    borderRadius: "8px",
                    border:
                      "1px solid #C6E7D2",
                    backgroundColor: "#F7FCF9",
                    color: "#276749",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  {mesaj}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  yukleniyor ||
                  !captchaToken
                }
                style={{
                  width: "100%",
                  height: "48px",
                  border: "none",
                  borderRadius: "9px",
                  backgroundColor:
                    yukleniyor ||
                    !captchaToken
                      ? "#AAB2BD"
                      : "#1D4ED8",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor:
                    yukleniyor ||
                    !captchaToken
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {yukleniyor
                  ? "Gönderiliyor..."
                  : "Şifre Yenileme Bağlantısı Gönder"}
              </button>
            </form>

            <div
              style={{
                height: "1px",
                backgroundColor: "#EEF0F2",
                margin: "24px 0 20px",
              }}
            />

            <p
              style={{
                margin: 0,
                textAlign: "center",
              }}
            >
              <Link
                href="/giris"
                style={{
                  color: "#1D4ED8",
                  textDecoration: "none",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                Giriş sayfasına dön
              </Link>
            </p>
          </div>
        </section>
      </div>

      <style jsx global>{`
        @media (max-width: 700px) {
          .sifremi-unuttum-page {
            min-height: 100dvh !important;
            overflow-x: hidden;
          }

          .sifremi-unuttum-header {
            padding: 18px 16px !important;
          }

          .sifremi-unuttum-shell {
            align-items: flex-start !important;
            padding: 20px 14px 42px !important;
          }

          .sifremi-unuttum-section {
            max-width: 100% !important;
          }

          .sifremi-unuttum-title {
            margin-bottom: 20px !important;
          }

          .sifremi-unuttum-title h1 {
            font-size: 28px !important;
            letter-spacing: -0.6px !important;
          }

          .sifremi-unuttum-title p {
            font-size: 14px !important;
          }

          .sifremi-unuttum-card {
            padding: 20px !important;
            border-radius: 12px !important;
          }

          .sifremi-unuttum-form {
            gap: 16px !important;
          }

          .sifremi-unuttum-card input,
          .sifremi-unuttum-card button {
            min-width: 0;
          }

          .sifremi-unuttum-captcha {
            width: 100% !important;
            justify-content: center !important;
          }
        }

        @media (max-width: 380px) {
          .sifremi-unuttum-header {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .sifremi-unuttum-shell {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .sifremi-unuttum-card {
            padding: 16px !important;
          }

          .sifremi-unuttum-title h1 {
            font-size: 26px !important;
          }

          .sifremi-unuttum-captcha {
            transform: scale(0.92);
            transform-origin: center top;
            margin-bottom: -6px;
          }
        }

        @media (max-width: 340px) {
          .sifremi-unuttum-captcha {
            transform: scale(0.84);
            margin-bottom: -12px;
          }
        }
      `}</style>
    </main>
  );
}