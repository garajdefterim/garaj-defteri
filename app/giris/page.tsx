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

export default function GirisPage() {
  const router = useRouter();

  const captchaRef = useRef<HCaptcha>(null);

  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
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
            redirectTo: `${window.location.origin}/dashboard`,
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

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backgroundColor: "#F8FAFC",
        fontFamily:
          "Arial, Helvetica, sans-serif",
        color: "#0F172A",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "460px",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "20px",
          padding: "36px",
          boxShadow:
            "0 20px 50px rgba(15, 23, 42, 0.08)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "42px",
              marginBottom: "10px",
            }}
          >
            🚗
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              color: "#0F172A",
            }}
          >
            Giriş Yap
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              color: "#64748B",
            }}
          >
            Garaj Defteri hesabınıza giriş yapın.
          </p>
        </div>

        <button
          type="button"
          onClick={googleIleGirisYap}
          disabled={
            googleYukleniyor || yukleniyor
          }
          style={{
            width: "100%",
            padding: "14px 16px",
            border: "1px solid #CBD5E1",
            borderRadius: "11px",
            backgroundColor: "#FFFFFF",
            color: "#0F172A",
            fontSize: "16px",
            fontWeight: 700,
            cursor:
              googleYukleniyor || yukleniyor
                ? "not-allowed"
                : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            opacity: googleYukleniyor
              ? 0.7
              : 1,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: "24px",
              height: "24px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              color: "#4285F4",
              fontSize: "17px",
              fontWeight: 900,
            }}
          >
            G
          </span>

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
              backgroundColor: "#E2E8F0",
            }}
          />

          <span
            style={{
              color: "#94A3B8",
              fontSize: "13px",
              fontWeight: 700,
            }}
          >
            VEYA
          </span>

          <div
            style={{
              flex: 1,
              height: "1px",
              backgroundColor: "#E2E8F0",
            }}
          />
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              color: "#334155",
              fontWeight: 700,
            }}
          >
            E-posta
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="ornek@email.com"
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#FFFFFF",
                color: "#0F172A",
                fontSize: "16px",
              }}
            />
          </label>

          <label
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              color: "#334155",
              fontWeight: 700,
            }}
          >
            Şifre
            <input
              type="password"
              required
              autoComplete="current-password"
              value={sifre}
              onChange={(event) =>
                setSifre(event.target.value)
              }
              placeholder="Şifrenizi yazın"
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#FFFFFF",
                color: "#0F172A",
                fontSize: "16px",
              }}
            />
          </label>

          {hcaptchaSiteKey && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
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
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #FECACA",
                backgroundColor: "#FEF2F2",
                color: "#B91C1C",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              {hata}
            </div>
          )}

          <button
            type="submit"
            disabled={
              yukleniyor ||
              googleYukleniyor ||
              !captchaToken
            }
            style={{
              marginTop: "6px",
              padding: "15px",
              border: "none",
              borderRadius: "11px",
              backgroundColor:
                yukleniyor || !captchaToken
                  ? "#94A3B8"
                  : "#2563EB",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 800,
              cursor:
                yukleniyor ||
                googleYukleniyor ||
                !captchaToken
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {yukleniyor
              ? "Giriş yapılıyor..."
              : "Giriş Yap"}
          </button>
        </form>

        <p
          style={{
            margin: "24px 0 0",
            textAlign: "center",
            color: "#64748B",
          }}
        >
          Hesabınız yok mu?{" "}
          <Link
            href="/kayit"
            style={{
              color: "#1D4ED8",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Kayıt Ol
          </Link>
        </p>

        <p
          style={{
            margin: "16px 0 0",
            textAlign: "center",
          }}
        >
          <Link
            href="/"
            style={{
              color: "#64748B",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            ← Ana sayfaya dön
          </Link>
        </p>
      </section>
    </main>
  );
}