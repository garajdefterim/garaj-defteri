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
        Garaj Defteri
      </div>
    </Link>
  );
}

export default function SifreYenilePage() {
  const router = useRouter();

  const [sifre, setSifre] = useState("");
  const [sifreTekrar, setSifreTekrar] = useState("");

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
                  Yeni şifre

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
                    gap: "7px",
                    color: "#374151",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  Yeni şifre tekrar

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
                    placeholder="Şifrenizi tekrar girin"
                    style={inputStyle}
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
    </main>
  );
}