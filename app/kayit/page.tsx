"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useState,
  type FormEvent,
} from "react";
import Turnstile from "react-turnstile";
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
        GARAJ DEFTERİM
      </div>
    </Link>
  );
}

export default function KayitPage() {
  const router = useRouter();

  const [kullaniciAdi, setKullaniciAdi] =
    useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [sifreGoster, setSifreGoster] = useState(false);
  const [sifreTekrar, setSifreTekrar] =
    useState("");
  const [sifreTekrarGoster, setSifreTekrarGoster] = useState(false);
  const [captchaToken, setCaptchaToken] =
    useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);

  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");

  const [kayitYukleniyor, setKayitYukleniyor] =
    useState(false);

  const [googleYukleniyor, setGoogleYukleniyor] =
    useState(false);

  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  async function emailIleKayitOl(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setHata("");
    setMesaj("");

    const temizKullaniciAdi =
      kullaniciAdi.trim();

    const temizEmail =
      email.trim().toLowerCase();

    if (temizKullaniciAdi.length < 3) {
      setHata(
        "Kullanıcı adı en az 3 karakter olmalıdır."
      );
      return;
    }

    if (!temizEmail) {
      setHata(
        "Lütfen e-posta adresinizi girin."
      );
      return;
    }

    if (sifre.length < 8) {
      setHata(
        "Şifreniz en az 8 karakter olmalıdır."
      );
      return;
    }

    if (sifre !== sifreTekrar) {
      setHata(
        "Şifreler birbiriyle eşleşmiyor."
      );
      return;
    }

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

    setKayitYukleniyor(true);

    try {
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

      setCaptchaToken("");
      setTurnstileKey((onceki) => onceki + 1);

      if (error) {
        console.error(
          "Kayıt hatası:",
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

      setCaptchaToken("");
      setTurnstileKey((onceki) => onceki + 1);

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
    kayitYukleniyor ||
    googleYukleniyor ||
    !captchaToken;

  return (
    <main className="kayit-page"
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
      <header className="kayit-header"
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
        className="kayit-shell"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 24px 72px",
        }}
      >
        <section
          className="kayit-section"
          style={{
            width: "100%",
            maxWidth: "440px",
          }}
        >
          <div
            className="kayit-title"
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
              Hesabınızı oluşturun
            </h1>

            <p
              style={{
                margin: "9px 0 0",
                color: "#6B7280",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              GARAJ DEFTERİM'ni kullanmaya başlamak
              için hesabınızı oluşturun.
            </p>
          </div>

          <div
            className="kayit-card"
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
              onClick={googleIleDevamEt}
              disabled={
                googleYukleniyor ||
                kayitYukleniyor
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
                  googleYukleniyor ||
                  kayitYukleniyor
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                opacity:
                  googleYukleniyor ||
                  kayitYukleniyor
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
              className="kayit-form"
              onSubmit={emailIleKayitOl}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "17px",
              }}
            >
              <label style={labelStyle}>
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

                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    type={sifreGoster ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={sifre}
                    onChange={(event) =>
                      setSifre(event.target.value)
                    }
                    placeholder="En az 8 karakter"
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
                      sifreGoster ? "Şifreyi gizle" : "Şifreyi göster"
                    }
                    title={
                      sifreGoster ? "Şifreyi gizle" : "Şifreyi göster"
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

              <label style={labelStyle}>
                Şifre tekrar

                <div style={{ position: "relative", width: "100%" }}>
                  <input
                    type={sifreTekrarGoster ? "text" : "password"}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={sifreTekrar}
                    onChange={(event) =>
                      setSifreTekrar(
                        event.target.value
                      )
                    }
                    placeholder="Şifrenizi tekrar girin"
                    style={{
                      ...inputStyle,
                      paddingRight: "48px",
                    }}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setSifreTekrarGoster((onceki) => !onceki)
                    }
                    aria-label={
                      sifreTekrarGoster
                        ? "Şifre tekrarını gizle"
                        : "Şifre tekrarını göster"
                    }
                    title={
                      sifreTekrarGoster
                        ? "Şifre tekrarını gizle"
                        : "Şifre tekrarını göster"
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
                    {sifreTekrarGoster ? (
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

              {turnstileSiteKey && (
                <div
                  className="kayit-captcha"
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    paddingTop: "2px",
                    overflow: "hidden",
                  }}
                >
                  <Turnstile
                    key={turnstileKey}
                    sitekey={turnstileSiteKey}
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
                {kayitYukleniyor
                  ? "Hesap oluşturuluyor..."
                  : "Hesap Oluştur"}
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
              Zaten hesabınız var mı?{" "}
              <Link
                href="/giris"
                style={{
                  color: "#1D4ED8",
                  fontWeight: 700,
                  textDecoration: "none",
                }}
              >
                Giriş yapın
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
        @media (max-width: 700px) {
          .kayit-page {
            min-height: 100dvh !important;
            overflow-x: hidden;
          }

          .kayit-header {
            padding: 18px 16px !important;
          }

          .kayit-shell {
            align-items: flex-start !important;
            padding: 20px 14px 42px !important;
          }

          .kayit-section {
            max-width: 100% !important;
          }

          .kayit-title {
            margin-bottom: 20px !important;
          }

          .kayit-title h1 {
            font-size: 28px !important;
            letter-spacing: -0.6px !important;
          }

          .kayit-title p {
            font-size: 14px !important;
          }

          .kayit-card {
            padding: 20px !important;
            border-radius: 12px !important;
          }

          .kayit-form {
            gap: 16px !important;
          }

          .kayit-card input,
          .kayit-card button {
            min-width: 0;
          }

          .kayit-captcha {
            width: 100% !important;
            justify-content: center !important;
          }
        }

        @media (max-width: 380px) {
          .kayit-header {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .kayit-shell {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .kayit-card {
            padding: 16px !important;
          }

          .kayit-title h1 {
            font-size: 26px !important;
          }

          .kayit-captcha {
            transform: scale(0.92);
            transform-origin: center top;
            margin-bottom: -6px;
          }
        }

        @media (max-width: 340px) {
          .kayit-captcha {
            transform: scale(0.84);
            margin-bottom: -12px;
          }
        }
      `}</style>
    </main>
  );
}