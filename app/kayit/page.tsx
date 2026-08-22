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

export default function KayitPage() {
  const router = useRouter();
  const captchaRef = useRef<HCaptcha>(null);

  const [kullaniciAdi, setKullaniciAdi] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [sifreTekrar, setSifreTekrar] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [kayitYukleniyor, setKayitYukleniyor] =
    useState(false);
  const [googleYukleniyor, setGoogleYukleniyor] =
    useState(false);

  const hcaptchaSiteKey =
    process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ?? "";

  async function emailIleKayitOl(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setHata("");
    setMesaj("");

    const temizKullaniciAdi = kullaniciAdi.trim();
    const temizEmail = email.trim().toLowerCase();

    if (temizKullaniciAdi.length < 3) {
      setHata(
        "Kullanıcı adı en az 3 karakter olmalıdır."
      );
      return;
    }

    if (!temizEmail) {
      setHata("Lütfen e-posta adresinizi girin.");
      return;
    }

    if (sifre.length < 8) {
      setHata(
        "Şifreniz en az 8 karakter olmalıdır."
      );
      return;
    }

    if (sifre !== sifreTekrar) {
      setHata("Şifreler birbiriyle eşleşmiyor.");
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

    setKayitYukleniyor(true);

    try {
      // Tarayıcıda eski oturum varsa temizle.
      await supabase.auth.signOut();

      const { data, error } =
        await supabase.auth.signUp({
          email: temizEmail,
          password: sifre,
          options: {
            captchaToken,
            data: {
              username: temizKullaniciAdi,
            },
          },
        });

      captchaRef.current?.resetCaptcha();
      setCaptchaToken("");

      if (error) {
        console.error("Kayıt hatası:", error);

        const hataMesaji =
          error.message.toLowerCase();

        if (hataMesaji.includes("captcha")) {
          setHata(
            "Güvenlik doğrulaması başarısız oldu. Lütfen tekrar deneyin."
          );
        } else if (
          hataMesaji.includes("password")
        ) {
          setHata(
            "Şifre güvenlik şartlarını karşılamıyor."
          );
        } else if (
          hataMesaji.includes("rate") ||
          hataMesaji.includes("limit")
        ) {
          setHata(
            "Çok fazla kayıt denemesi yapıldı. Lütfen biraz bekleyip tekrar deneyin."
          );
        } else if (
          hataMesaji.includes("email") &&
          hataMesaji.includes("send")
        ) {
          setHata(
            "Doğrulama e-postası gönderilemedi. Lütfen tekrar deneyin."
          );
        } else if (
          hataMesaji.includes("already") ||
          hataMesaji.includes("registered")
        ) {
          setHata(
            "Bu e-posta adresiyle daha önce hesap oluşturulmuş olabilir."
          );
        } else {
          setHata(
            `Kayıt oluşturulamadı: ${error.message}`
          );
        }

        return;
      }

      if (!data.user) {
        setHata(
          "Hesap oluşturulamadı. Lütfen tekrar deneyin."
        );
        return;
      }

      /*
       * E-posta/şifre kaydında dashboard'a gitmiyoruz.
       * Önce 6 haneli doğrulama kodu girilecek.
       */
      if (data.session) {
        await supabase.auth.signOut();
      }

      router.replace(
        `/dogrula?email=${encodeURIComponent(
          temizEmail
        )}`
      );

      router.refresh();
    } catch (error) {
      console.error(
        "Beklenmeyen kayıt hatası:",
        error
      );

      captchaRef.current?.resetCaptcha();
      setCaptchaToken("");

      setHata(
        "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setKayitYukleniyor(false);
    }
  }

  async function googleIleDevamEt() {
    setHata("");
    setMesaj("");
    setGoogleYukleniyor(true);

    try {
      /*
       * ÖNEMLİ:
       * Google OAuth artık doğrudan dashboard'a gitmiyor.
       * Önce /google-dogrula sayfasına dönecek.
       */
      const { error } =
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo:
              `${window.location.origin}/google-dogrula`,
            queryParams: {
              prompt: "select_account",
            },
          },
        });

      if (error) {
        setHata(
          `Google ile devam edilemedi: ${error.message}`
        );
        setGoogleYukleniyor(false);
      }
    } catch {
      setHata(
        "Google ile devam edilirken bir hata oluştu."
      );
      setGoogleYukleniyor(false);
    }
  }

  const inputStyle = {
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
    fontSize: "16px",
  };

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
          maxWidth: "480px",
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
              fontSize: "46px",
              marginBottom: "12px",
            }}
          >
            🚗
          </div>

          <h1
            style={{
              margin: 0,
              color: "#0F172A",
              fontSize: "30px",
            }}
          >
            Garaj Defteri&apos;ne Katıl
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#64748B",
              lineHeight: 1.6,
              fontSize: "15px",
            }}
          >
            Google hesabınızla veya e-posta
            adresinizle hesap oluşturun.
          </p>
        </div>

        <button
          type="button"
          onClick={googleIleDevamEt}
          disabled={
            googleYukleniyor ||
            kayitYukleniyor
          }
          style={{
            width: "100%",
            minHeight: "54px",
            padding: "14px 18px",
            border: "1px solid #CBD5E1",
            borderRadius: "12px",
            backgroundColor: "#FFFFFF",
            color: "#0F172A",
            fontSize: "16px",
            fontWeight: 700,
            cursor:
              googleYukleniyor ||
              kayitYukleniyor
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
              width: "28px",
              height: "28px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              color: "#4285F4",
              fontSize: "19px",
              fontWeight: 900,
            }}
          >
            G
          </span>

          {googleYukleniyor
            ? "Google hesabınız açılıyor..."
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
          onSubmit={emailIleKayitOl}
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
              gap: "8px",
              color: "#334155",
              fontWeight: 700,
            }}
          >
            Kullanıcı adı

            <input
              type="text"
              required
              minLength={3}
              autoComplete="username"
              value={kullaniciAdi}
              onChange={(event) =>
                setKullaniciAdi(
                  event.target.value
                )
              }
              placeholder="Kullanıcı adınız"
              style={inputStyle}
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
              style={inputStyle}
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
              minLength={8}
              autoComplete="new-password"
              value={sifre}
              onChange={(event) =>
                setSifre(event.target.value)
              }
              placeholder="En az 8 karakter"
              style={inputStyle}
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
            Şifre tekrar

            <input
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={sifreTekrar}
              onChange={(event) =>
                setSifreTekrar(
                  event.target.value
                )
              }
              placeholder="Şifrenizi tekrar yazın"
              style={inputStyle}
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
                padding: "13px",
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

          {mesaj && (
            <div
              role="status"
              style={{
                padding: "13px",
                borderRadius: "10px",
                border: "1px solid #BBF7D0",
                backgroundColor: "#F0FDF4",
                color: "#166534",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              {mesaj}
            </div>
          )}

          <button
            type="submit"
            disabled={
              kayitYukleniyor ||
              googleYukleniyor ||
              !captchaToken
            }
            style={{
              padding: "15px",
              border: "none",
              borderRadius: "11px",
              backgroundColor:
                kayitYukleniyor ||
                !captchaToken
                  ? "#94A3B8"
                  : "#2563EB",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 800,
              cursor:
                kayitYukleniyor ||
                googleYukleniyor ||
                !captchaToken
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {kayitYukleniyor
              ? "Hesap oluşturuluyor..."
              : "Hesap Oluştur"}
          </button>
        </form>

        <p
          style={{
            margin: "26px 0 0",
            textAlign: "center",
            color: "#64748B",
          }}
        >
          Zaten hesabınız var mı?{" "}
          <Link
            href="/giris"
            style={{
              color: "#1D4ED8",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Giriş Yap
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