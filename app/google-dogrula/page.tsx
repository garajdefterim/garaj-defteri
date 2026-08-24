"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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

export default function GoogleDogrulaPage() {
  const router = useRouter();
  const captchaRef = useRef<HCaptcha>(null);

  const [email, setEmail] = useState("");
  const [kod, setKod] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  const [sayfaYukleniyor, setSayfaYukleniyor] =
    useState(true);

  const [kodGonderildi, setKodGonderildi] =
    useState(false);

  const [kodGonderiliyor, setKodGonderiliyor] =
    useState(false);

  const [dogrulaniyor, setDogrulaniyor] =
    useState(false);

  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");

  const [beklemeSuresi, setBeklemeSuresi] =
    useState(0);

  const hcaptchaSiteKey =
    process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ||
    "be4a5a44-94a0-459a-a750-caaa23900666";

  useEffect(() => {
    async function googleKullanicisiniHazirla() {
      try {
        setHata("");
        setMesaj("");

        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          setHata(
            "Google oturumu bulunamadı. Lütfen tekrar Google ile devam edin."
          );

          setTimeout(() => {
            router.replace("/kayit");
          }, 2000);

          return;
        }

        const googleEmail =
          user.email?.trim().toLowerCase() ?? "";

        if (!googleEmail) {
          setHata(
            "Google hesabınızdan e-posta adresi alınamadı."
          );
          return;
        }

        setEmail(googleEmail);
      } catch (error) {
        console.error(
          "Google kullanıcı kontrolü hatası:",
          error
        );

        setHata(
          "Google hesabınız kontrol edilirken bir hata oluştu."
        );
      } finally {
        setSayfaYukleniyor(false);
      }
    }

    googleKullanicisiniHazirla();
  }, [router]);

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

  async function kodGonder() {
    if (!email) {
      setHata(
        "Doğrulanacak e-posta adresi bulunamadı."
      );
      return;
    }

    if (!captchaToken) {
      setHata(
        "Lütfen önce güvenlik doğrulamasını tamamlayın."
      );
      return;
    }

    if (kodGonderiliyor) {
      return;
    }

    setHata("");
    setMesaj("");
    setKodGonderiliyor(true);

    try {
      const { error } =
        await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: {
            shouldCreateUser: false,
            captchaToken,
          },
        });

      captchaRef.current?.resetCaptcha();
      setCaptchaToken("");

      if (error) {
        console.error(
          "Google OTP gönderme hatası:",
          error
        );

        const hataMesaji =
          error.message.toLowerCase();

        if (hataMesaji.includes("captcha")) {
          setHata(
            "Güvenlik doğrulaması kabul edilmedi. Lütfen CAPTCHA'yı tekrar tamamlayın."
          );
        } else if (
          hataMesaji.includes("rate") ||
          hataMesaji.includes("limit")
        ) {
          setHata(
            "Çok fazla kod isteği yapıldı. Lütfen biraz bekleyip tekrar deneyin."
          );
        } else {
          setHata(
            `Doğrulama kodu gönderilemedi: ${error.message}`
          );
        }

        return;
      }

      setKodGonderildi(true);
      setKod("");

      setMesaj(
        "6 haneli doğrulama kodu e-posta adresinize gönderildi."
      );

      setBeklemeSuresi(60);
    } catch (error) {
      console.error(
        "OTP gönderme hatası:",
        error
      );

      captchaRef.current?.resetCaptcha();
      setCaptchaToken("");

      setHata(
        "Doğrulama kodu gönderilirken beklenmeyen bir hata oluştu."
      );
    } finally {
      setKodGonderiliyor(false);
    }
  }

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

    setDogrulaniyor(true);

    try {
      const { error } =
        await supabase.auth.verifyOtp({
          email: temizEmail,
          token: temizKod,
          type: "email",
        });

      if (error) {
        console.error(
          "Google OTP doğrulama hatası:",
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
            "Doğrulama kodu geçersiz veya süresi dolmuş. Yeni bir kod isteyin."
          );
        } else {
          setHata(
            `Doğrulama başarısız oldu: ${error.message}`
          );
        }

        return;
      }

      setMesaj(
        "E-posta doğrulaması başarılı. GARAJ DEFTERİ açılıyor..."
      );

      setTimeout(() => {
        router.replace("/dashboard");
        router.refresh();
      }, 1200);
    } catch (error) {
      console.error(
        "Google OTP doğrulama hatası:",
        error
      );

      setHata(
        "Doğrulama sırasında beklenmeyen bir hata oluştu."
      );
    } finally {
      setDogrulaniyor(false);
    }
  }

  function yeniKodIste() {
    if (beklemeSuresi > 0) {
      return;
    }

    setHata("");
    setMesaj("");
    setKod("");
    setCaptchaToken("");

    captchaRef.current?.resetCaptcha();
    setKodGonderildi(false);
  }

  if (sayfaYukleniyor) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#F7F8FA",
          color: "#111827",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "360px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "11px",
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
          </div>

          <p
            style={{
              margin: "18px 0 0",
              color: "#6B7280",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            Google hesabınız kontrol ediliyor...
          </p>
        </div>
      </main>
    );
  }

  const kodHazir =
    kod.replace(/\D/g, "").length === 6;

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
              Hesabınızı doğrulayın
            </h1>

            <p
              style={{
                margin: "9px 0 0",
                color: "#6B7280",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              Google hesabınıza bağlı e-posta
              adresini doğrulayarak devam edin.
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
            {email && (
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
                Google hesabı

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
            )}

            {!kodGonderildi && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "17px",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#6B7280",
                    fontSize: "13px",
                    lineHeight: 1.55,
                  }}
                >
                  Doğrulama kodunu göndermeden önce
                  güvenlik kontrolünü tamamlayın.
                </p>

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
                  type="button"
                  onClick={kodGonder}
                  disabled={
                    !email ||
                    !captchaToken ||
                    kodGonderiliyor
                  }
                  style={{
                    width: "100%",
                    height: "48px",
                    border: "none",
                    borderRadius: "9px",
                    backgroundColor:
                      !email ||
                      !captchaToken ||
                      kodGonderiliyor
                        ? "#AAB2BD"
                        : "#1D4ED8",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor:
                      !email ||
                      !captchaToken ||
                      kodGonderiliyor
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {kodGonderiliyor
                    ? "Kod gönderiliyor..."
                    : "Doğrulama Kodunu Gönder"}
                </button>
              </div>
            )}

            {kodGonderildi && (
              <>
                <form
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
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      required
                      disabled={dogrulaniyor}
                      value={kod}
                      onChange={(event) => {
                        setKod(
                          event.target.value
                            .replace(/\D/g, "")
                            .slice(0, 6)
                        );

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
                        backgroundColor: "#FFFFFF",
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
                      !kodHazir ||
                      dogrulaniyor
                    }
                    style={{
                      width: "100%",
                      height: "48px",
                      border: "none",
                      borderRadius: "9px",
                      backgroundColor:
                        !kodHazir ||
                        dogrulaniyor
                          ? "#AAB2BD"
                          : "#1D4ED8",
                      color: "#FFFFFF",
                      fontSize: "14px",
                      fontWeight: 700,
                      cursor:
                        !kodHazir ||
                        dogrulaniyor
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {dogrulaniyor
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
                    onClick={yeniKodIste}
                    disabled={
                      dogrulaniyor ||
                      beklemeSuresi > 0
                    }
                    style={{
                      border: "none",
                      padding: 0,
                      backgroundColor: "transparent",
                      color:
                        dogrulaniyor ||
                        beklemeSuresi > 0
                          ? "#9CA3AF"
                          : "#1D4ED8",
                      fontSize: "13px",
                      fontWeight: 700,
                      cursor:
                        dogrulaniyor ||
                        beklemeSuresi > 0
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    {beklemeSuresi > 0
                      ? `Tekrar gönder (${beklemeSuresi})`
                      : "Yeni kod iste"}
                  </button>

                  <p
                    style={{
                      margin: "10px 0 0",
                      color: "#9CA3AF",
                      fontSize: "12px",
                      lineHeight: 1.5,
                    }}
                  >
                    Yeni kod için güvenlik kontrolü
                    tekrar istenir.
                  </p>
                </div>
              </>
            )}
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
    </main>
  );
}