"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
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

export default function SifreYenilePage() {
  const router = useRouter();

  const [sifre, setSifre] = useState("");
  const [sifreGoster, setSifreGoster] = useState(false);
  const [sifreTekrar, setSifreTekrar] = useState("");
  const [sifreTekrarGoster, setSifreTekrarGoster] = useState(false);

  const [oturumKontrolEdiliyor, setOturumKontrolEdiliyor] =
    useState(true);

  const [gecerliOturum, setGecerliOturum] =
    useState(false);

  const [yukleniyor, setYukleniyor] =
    useState(false);

  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    let aktif = true;

    async function oturumuKontrolEt() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!aktif) {
          return;
        }

        if (session) {
          setGecerliOturum(true);
        }
      } catch (error) {
        console.error(
          "Şifre yenileme oturum kontrolü:",
          error
        );
      } finally {
        if (aktif) {
          setOturumKontrolEdiliyor(false);
        }
      }
    }

    oturumuKontrolEt();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === "PASSWORD_RECOVERY" ||
          event === "SIGNED_IN"
        ) {
          setGecerliOturum(Boolean(session));
          setOturumKontrolEdiliyor(false);
        }
      }
    );

    return () => {
      aktif = false;
      subscription.unsubscribe();
    };
  }, []);

  async function sifreyiYenile(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setHata("");
    setMesaj("");

    if (sifre.length < 8) {
      setHata(
        "Yeni şifreniz en az 8 karakter olmalıdır."
      );
      return;
    }

    if (sifre !== sifreTekrar) {
      setHata(
        "Şifreler birbiriyle eşleşmiyor."
      );
      return;
    }

    setYukleniyor(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setGecerliOturum(false);
        setHata(
          "Şifre yenileme bağlantısının süresi dolmuş veya bağlantı geçersiz."
        );
        return;
      }

      const { error } =
        await supabase.auth.updateUser({
          password: sifre,
        });

      if (error) {
        console.error(
          "Şifre yenileme hatası:",
          error
        );

        const hataMesaji =
          error.message.toLowerCase();

        if (
          hataMesaji.includes("password") &&
          hataMesaji.includes("same")
        ) {
          setHata(
            "Yeni şifreniz eski şifrenizden farklı olmalıdır."
          );
        } else if (
          hataMesaji.includes("password")
        ) {
          setHata(
            "Şifre güvenlik şartlarını karşılamıyor."
          );
        } else {
          setHata(
            `Şifre güncellenemedi: ${error.message}`
          );
        }

        return;
      }

      setMesaj(
        "Şifreniz başarıyla yenilendi. Giriş sayfasına yönlendiriliyorsunuz."
      );

      await supabase.auth.signOut();

      setTimeout(() => {
        router.replace("/giris");
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error(
        "Beklenmeyen şifre yenileme hatası:",
        error
      );

      setHata(
        "Şifre yenilenirken beklenmeyen bir hata oluştu."
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

  if (oturumKontrolEdiliyor) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: "#F7F8FA",
          color: "#6B7280",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: "14px",
        }}
      >
        Şifre yenileme bağlantısı kontrol ediliyor...
      </main>
    );
  }

  return (
    <main
      className="sifre-yenile-page"
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
      <header className="sifre-yenile-header"
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
        className="sifre-yenile-shell"
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px 24px 72px",
        }}
      >
        <section
          className="sifre-yenile-section"
          style={{
            width: "100%",
            maxWidth: "420px",
          }}
        >
          <div
            className="sifre-yenile-title"
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
              Yeni şifrenizi belirleyin
            </h1>

            <p
              style={{
                margin: "9px 0 0",
                color: "#6B7280",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              Hesabınız için yeni bir şifre oluşturun.
            </p>
          </div>

          <div
            className="sifre-yenile-card"
            style={{
              padding: "28px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E3E7EC",
              borderRadius: "14px",
              boxShadow:
                "0 1px 2px rgba(15, 23, 42, 0.03)",
            }}
          >
            {!gecerliOturum ? (
              <>
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
                  Şifre yenileme bağlantısı geçersiz
                  veya süresi dolmuş olabilir. Yeni
                  bir bağlantı isteyin.
                </div>

                <Link
                  href="/sifremi-unuttum"
                  style={{
                    width: "100%",
                    minHeight: "46px",
                    marginTop: "17px",
                    padding: "0 16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    borderRadius: "9px",
                    backgroundColor: "#1D4ED8",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Yeni Bağlantı İste
                </Link>
              </>
            ) : (
              <form
                className="sifre-yenile-form"
                onSubmit={sifreyiYenile}
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
                  Yeni şifre tekrar

                  <div style={{ position: "relative", width: "100%" }}>
                    <input
                      type={sifreTekrarGoster ? "text" : "password"}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={sifreTekrar}
                      onChange={(event) => setSifreTekrar(event.target.value)}
                      placeholder="Şifrenizi tekrar girin"
                      style={{ ...inputStyle, paddingRight: "48px" }}
                    />
                    <button
                      type="button"
                      onClick={() => setSifreTekrarGoster((onceki) => !onceki)}
                      aria-label={sifreTekrarGoster ? "Şifreyi gizle" : "Şifreyi göster"}
                      title={sifreTekrarGoster ? "Şifreyi gizle" : "Şifreyi göster"}
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
                  disabled={yukleniyor}
                  style={{
                    width: "100%",
                    height: "48px",
                    border: "none",
                    borderRadius: "9px",
                    backgroundColor: yukleniyor
                      ? "#AAB2BD"
                      : "#1D4ED8",
                    color: "#FFFFFF",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: yukleniyor
                      ? "not-allowed"
                      : "pointer",
                  }}
                >
                  {yukleniyor
                    ? "Şifre güncelleniyor..."
                    : "Şifreyi Güncelle"}
                </button>
              </form>
            )}

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
          .sifre-yenile-page {
            min-height: 100dvh !important;
            overflow-x: hidden;
          }

          .sifre-yenile-header {
            padding: 18px 16px !important;
          }

          .sifre-yenile-shell {
            align-items: flex-start !important;
            padding: 20px 14px 42px !important;
          }

          .sifre-yenile-section {
            max-width: 100% !important;
          }

          .sifre-yenile-title {
            margin-bottom: 20px !important;
          }

          .sifre-yenile-title h1 {
            font-size: 28px !important;
            letter-spacing: -0.6px !important;
          }

          .sifre-yenile-title p {
            font-size: 14px !important;
          }

          .sifre-yenile-card {
            padding: 20px !important;
            border-radius: 12px !important;
          }

          .sifre-yenile-form {
            gap: 16px !important;
          }

          .sifre-yenile-card input,
          .sifre-yenile-card button,
          .sifre-yenile-card a {
            min-width: 0;
          }
        }

        @media (max-width: 380px) {
          .sifre-yenile-header {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .sifre-yenile-shell {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .sifre-yenile-card {
            padding: 16px !important;
          }

          .sifre-yenile-title h1 {
            font-size: 26px !important;
          }
        }
      `}</style>
    </main>
  );
}