"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import Turnstile from "react-turnstile";
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

export default function DogrulaPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [kod, setKod] = useState("");
  const [googleKaydi, setGoogleKaydi] =
    useState(false);

  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");

  const [yukleniyor, setYukleniyor] =
    useState(false);

  const [tekrarGonderiliyor, setTekrarGonderiliyor] =
    useState(false);

  const [beklemeSuresi, setBeklemeSuresi] =
    useState(0);

  const [captchaToken, setCaptchaToken] =
    useState("");

  const [turnstileKey, setTurnstileKey] =
    useState(0);

  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const emailParam =
      params.get("email")?.trim().toLowerCase() ?? "";

    const googleParam =
      params.get("google") === "1";

    setEmail(emailParam);
    setGoogleKaydi(googleParam);
  }, []);

  useEffect(() => {
    if (beklemeSuresi <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setBeklemeSuresi((onceki) => {
        if (onceki <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return onceki - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [beklemeSuresi]);

  async function koduDogrula(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setHata("");
    setMesaj("");

    const temizEmail =
      email.trim().toLowerCase();

    const temizKod =
      kod.replace(/\D/g, "");

    if (!temizEmail) {
      setHata(
        "Doğrulanacak e-posta adresi bulunamadı."
      );
      return;
    }

    if (temizKod.length !== 6) {
      setHata(
        "Lütfen 6 haneli doğrulama kodunu girin."
      );
      return;
    }

    setYukleniyor(true);

    try {
      const { error } =
        await supabase.auth.verifyOtp({
          email: temizEmail,
          token: temizKod,
          type: "email",
        });

      if (error) {
        console.error(
          "Doğrulama hatası:",
          error
        );

        const hataMesaji =
          error.message.toLowerCase();

        if (
          hataMesaji.includes("expired") ||
          hataMesaji.includes("invalid") ||
          hataMesaji.includes("token")
        ) {
          setHata(
            "Doğrulama kodu geçersiz veya süresi dolmuş. Yeni kod isteyebilirsiniz."
          );
        } else {
          setHata(
            `Doğrulama başarısız oldu: ${error.message}`
          );
        }

        return;
      }

      await supabase.auth.signOut();

      setMesaj(
        "E-posta adresiniz doğrulandı. Giriş sayfasına yönlendiriliyorsunuz."
      );

      setTimeout(() => {
        router.replace("/giris");
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error(
        "Beklenmeyen doğrulama hatası:",
        error
      );

      setHata(
        "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setYukleniyor(false);
    }
  }

  async function koduTekrarGonder() {
    setHata("");
    setMesaj("");

    const temizEmail =
      email.trim().toLowerCase();

    if (!temizEmail) {
      setHata(
        "Doğrulama kodunun gönderileceği e-posta adresi bulunamadı."
      );
      return;
    }

    if (
      tekrarGonderiliyor ||
      beklemeSuresi > 0
    ) {
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
        "Yeni doğrulama kodu istemeden önce güvenlik doğrulamasını tamamlayın."
      );
      return;
    }

    setTekrarGonderiliyor(true);

    try {
      const { error } = googleKaydi
        ? await supabase.auth.signInWithOtp({
            email: temizEmail,
            options: {
              shouldCreateUser: false,
              captchaToken,
            },
          })
        : await supabase.auth.resend({
            type: "signup",
            email: temizEmail,
            options: {
              captchaToken,
            },
          });

      setCaptchaToken("");
      setTurnstileKey((onceki) => onceki + 1);

      if (error) {
        console.error(
          "Kod tekrar gönderme hatası:",
          error
        );

        const hataMesaji =
          error.message.toLowerCase();

        if (
          hataMesaji.includes("rate") ||
          hataMesaji.includes("limit") ||
          hataMesaji.includes("seconds")
        ) {
          setHata(
            "Yeni kod istemek için biraz beklemeniz gerekiyor."
          );
        } else if (
          hataMesaji.includes("captcha")
        ) {
          setHata(
            "Güvenlik doğrulaması kabul edilmedi. Lütfen doğrulamayı tekrar tamamlayıp yeniden deneyin."
          );
        } else {
          setHata(
            `Doğrulama kodu tekrar gönderilemedi: ${error.message}`
          );
        }

        return;
      }

      setKod("");

      setMesaj(
        "Yeni doğrulama kodu e-posta adresinize gönderildi."
      );

      setBeklemeSuresi(60);
    } catch (error) {
      console.error(
        "Beklenmeyen tekrar gönderme hatası:",
        error
      );

      setHata(
        "Kod tekrar gönderilirken beklenmeyen bir hata oluştu."
      );
    } finally {
      setTekrarGonderiliyor(false);
    }
  }

  const kodHazir =
    kod.replace(/\D/g, "").length === 6;

  return (
    <main
      className="dogrula-page"
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
        className="dogrula-header"
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
        className="dogrula-shell"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 24px 72px",
        }}
      >
        <section
          className="dogrula-section"
          style={{
            width: "100%",
            maxWidth: "420px",
          }}
        >
          <div
            className="dogrula-title"
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
              E-postanızı doğrulayın
            </h1>

            <p
              style={{
                margin: "9px 0 0",
                color: "#6B7280",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              {googleKaydi
                ? "Google hesabınızın e-posta adresine gönderilen 6 haneli doğrulama kodunu girin."
                : "Hesabınızı etkinleştirmek için e-postanıza gönderilen 6 haneli kodu girin."}
            </p>
          </div>

          <div
            className="dogrula-card"
            style={{
              padding: "28px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E3E7EC",
              borderRadius: "14px",
              boxShadow:
                "0 1px 2px rgba(15, 23, 42, 0.03)",
            }}
          >
            {email ? (
              <div
                style={{
                  marginBottom: "22px",
                  padding: "12px 13px",
                  borderRadius: "8px",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E5E7EB",
                  color: "#4B5563",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                Kod gönderilen adres
                <div
                  style={{
                    marginTop: "3px",
                    color: "#111827",
                    fontWeight: 650,
                    wordBreak: "break-word",
                  }}
                >
                  {email}
                </div>
              </div>
            ) : (
              <div
                role="alert"
                style={{
                  marginBottom: "22px",
                  padding: "12px 13px",
                  borderRadius: "8px",
                  border: "1px solid #F1C7C7",
                  backgroundColor: "#FFF7F7",
                  color: "#A93838",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                Doğrulanacak e-posta adresi
                bulunamadı. Lütfen kayıt işlemini
                yeniden başlatın.
              </div>
            )}

            <form
              className="dogrula-form"
              onSubmit={koduDogrula}
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
                Doğrulama kodu

                <input
                  className="dogrula-code-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  disabled={!email || yukleniyor}
                  value={kod}
                  onChange={(event) => {
                    const sadeceRakam =
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);

                    setKod(sadeceRakam);
                    setHata("");
                  }}
                  placeholder="000000"
                  style={{
                    width: "100%",
                    boxSizing: "border-box",
                    height: "54px",
                    padding: "0 14px",
                    borderRadius: "9px",
                    border: "1px solid #D7DCE3",
                    backgroundColor: !email
                      ? "#F3F4F6"
                      : "#FFFFFF",
                    color: "#111827",
                    fontSize: "22px",
                    fontWeight: 700,
                    textAlign: "center",
                    letterSpacing: "10px",
                    outline: "none",
                  }}
                />
              </label>

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
                  tekrarGonderiliyor ||
                  !kodHazir ||
                  !email
                }
                style={{
                  width: "100%",
                  height: "48px",
                  border: "none",
                  borderRadius: "9px",
                  backgroundColor:
                    yukleniyor ||
                    tekrarGonderiliyor ||
                    !kodHazir ||
                    !email
                      ? "#AAB2BD"
                      : "#1D4ED8",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor:
                    yukleniyor ||
                    tekrarGonderiliyor ||
                    !kodHazir ||
                    !email
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {yukleniyor
                  ? "Doğrulanıyor..."
                  : "Kodu Doğrula"}
              </button>
            </form>

            <div
              style={{
                height: "1px",
                backgroundColor: "#EEF0F2",
                margin: "24px 0 20px",
              }}
            />

            {turnstileSiteKey && (
              <div
                className="dogrula-captcha"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "16px",
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

            <div
              style={{
                textAlign: "center",
              }}
            >
              <p
                style={{
                  margin: "0 0 8px",
                  color: "#6B7280",
                  fontSize: "13px",
                }}
              >
                Kod ulaşmadı mı?
              </p>

              <button
                type="button"
                onClick={koduTekrarGonder}
                disabled={
                  !email ||
                  yukleniyor ||
                  tekrarGonderiliyor ||
                  beklemeSuresi > 0 ||
                  !captchaToken
                }
                style={{
                  border: "none",
                  padding: 0,
                  backgroundColor: "transparent",
                  color:
                    !email ||
                    tekrarGonderiliyor ||
                    beklemeSuresi > 0 ||
                    !captchaToken
                      ? "#9CA3AF"
                      : "#1D4ED8",
                  fontSize: "13px",
                  fontWeight: 700,
                  cursor:
                    !email ||
                    tekrarGonderiliyor ||
                    beklemeSuresi > 0 ||
                    !captchaToken
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {tekrarGonderiliyor
                  ? "Kod gönderiliyor..."
                  : beklemeSuresi > 0
                    ? `Tekrar gönder (${beklemeSuresi})`
                    : "Kodu tekrar gönder"}
              </button>
            </div>
          </div>

          <p
            style={{
              margin: "22px 0 0",
              textAlign: "center",
            }}
          >
            <Link
              href="/kayit"
              style={{
                color: "#7B8492",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 500,
              }}
            >
              Kayıt sayfasına dön
            </Link>
          </p>
        </section>
      </div>
      <style jsx global>{`
        .dogrula-page,
        .dogrula-page * {
          min-width: 0;
          box-sizing: border-box;
        }

        .dogrula-card input,
        .dogrula-card button,
        .dogrula-card a {
          max-width: 100%;
        }

        @media (max-width: 900px) {
          .dogrula-header {
            padding: 24px 20px !important;
          }

          .dogrula-shell {
            padding: 24px 20px 56px !important;
          }
        }

        @media (max-width: 700px) {
          .dogrula-page {
            min-height: 100dvh !important;
            overflow-x: hidden;
          }

          .dogrula-header {
            padding: 18px 16px !important;
          }

          .dogrula-shell {
            align-items: flex-start !important;
            padding: 18px 14px 42px !important;
          }

          .dogrula-section {
            width: 100% !important;
            max-width: 440px !important;
          }

          .dogrula-title {
            margin-bottom: 18px !important;
          }

          .dogrula-title h1 {
            font-size: 28px !important;
            letter-spacing: -0.6px !important;
          }

          .dogrula-title p {
            font-size: 14px !important;
            line-height: 1.55 !important;
          }

          .dogrula-card {
            padding: 20px !important;
            border-radius: 12px !important;
          }

          .dogrula-form {
            gap: 16px !important;
          }

          .dogrula-code-input {
            font-size: 22px !important;
            letter-spacing: 8px !important;
          }

          .dogrula-card button {
            min-width: 0 !important;
          }

          .dogrula-form > button[type="submit"] {
            min-height: 46px !important;
          }

          .dogrula-captcha {
            width: 100% !important;
            justify-content: center !important;
          }
        }

        @media (max-width: 480px) {
          .dogrula-header {
            padding: 16px 14px !important;
          }

          .dogrula-shell {
            padding: 14px 12px 36px !important;
          }

          .dogrula-title {
            margin-bottom: 16px !important;
          }

          .dogrula-title h1 {
            font-size: 27px !important;
          }

          .dogrula-card {
            padding: 18px !important;
          }

          .dogrula-code-input {
            font-size: 21px !important;
            letter-spacing: 7px !important;
          }
        }

        @media (max-width: 380px) {
          .dogrula-header {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .dogrula-shell {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .dogrula-card {
            padding: 16px !important;
          }

          .dogrula-title h1 {
            font-size: 26px !important;
          }

          .dogrula-code-input {
            font-size: 20px !important;
            letter-spacing: 6px !important;
          }

          .dogrula-captcha {
            transform: scale(0.92);
            transform-origin: center top;
            margin-bottom: 8px !important;
          }
        }

        @media (max-width: 340px) {
          .dogrula-card {
            padding-left: 14px !important;
            padding-right: 14px !important;
          }

          .dogrula-code-input {
            letter-spacing: 5px !important;
          }

          .dogrula-captcha {
            transform: scale(0.84);
            margin-bottom: 2px !important;
          }
        }
      `}</style>
    </main>
  );
}