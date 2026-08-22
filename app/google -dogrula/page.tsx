"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function GoogleDogrulaPage() {
  const router = useRouter();

  const ilkKodGonderildi = useRef(false);

  const [email, setEmail] = useState("");
  const [kod, setKod] = useState("");

  const [sayfaYukleniyor, setSayfaYukleniyor] = useState(true);
  const [kodGonderiliyor, setKodGonderiliyor] = useState(false);
  const [dogrulaniyor, setDogrulaniyor] = useState(false);

  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");

  const [beklemeSuresi, setBeklemeSuresi] = useState(0);

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
            "Google oturumu bulunamadı. Lütfen tekrar Google ile giriş yapın."
          );

          await supabase.auth.signOut();

          setTimeout(() => {
            router.replace("/kayit");
          }, 2000);

          return;
        }

        const googleEmail = user.email?.trim().toLowerCase() ?? "";

        if (!googleEmail) {
          setHata(
            "Google hesabınızdan e-posta adresi alınamadı."
          );
          return;
        }

        setEmail(googleEmail);

        if (ilkKodGonderildi.current) {
          return;
        }

        ilkKodGonderildi.current = true;

        setKodGonderiliyor(true);

        const { error: otpError } =
          await supabase.auth.signInWithOtp({
            email: googleEmail,
            options: {
              shouldCreateUser: false,
            },
          });

        if (otpError) {
          console.error(
            "Google OTP gönderme hatası:",
            otpError
          );

          setHata(
            `Doğrulama kodu gönderilemedi: ${otpError.message}`
          );

          return;
        }

        setMesaj(
          "Google hesabınıza bağlı e-posta adresine 6 haneli doğrulama kodu gönderildi."
        );

        setBeklemeSuresi(60);
      } catch (error) {
        console.error(
          "Google doğrulama hazırlama hatası:",
          error
        );

        setHata(
          "Doğrulama hazırlanırken beklenmeyen bir hata oluştu."
        );
      } finally {
        setKodGonderiliyor(false);
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

  async function koduDogrula(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setHata("");
    setMesaj("");

    const temizEmail = email.trim().toLowerCase();
    const temizKod = kod.replace(/\D/g, "");

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
            "Doğrulama kodu geçersiz veya süresi dolmuş. Yeni kod isteyin."
          );
        } else {
          setHata(
            `Doğrulama başarısız oldu: ${error.message}`
          );
        }

        return;
      }

      setMesaj(
        "E-posta doğrulaması başarılı. Garaj Defteri açılıyor..."
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

  async function koduTekrarGonder() {
    if (
      !email ||
      kodGonderiliyor ||
      dogrulaniyor ||
      beklemeSuresi > 0
    ) {
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
          },
        });

      if (error) {
        console.error(
          "OTP tekrar gönderme hatası:",
          error
        );

        setHata(
          `Yeni kod gönderilemedi: ${error.message}`
        );

        return;
      }

      setKod("");

      setMesaj(
        "Yeni doğrulama kodu e-posta adresinize gönderildi."
      );

      setBeklemeSuresi(60);
    } catch {
      setHata(
        "Kod tekrar gönderilirken beklenmeyen bir hata oluştu."
      );
    } finally {
      setKodGonderiliyor(false);
    }
  }

  if (sayfaYukleniyor) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8FAFC",
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#0F172A",
        }}
      >
        <p style={{ fontWeight: 700 }}>
          Google hesabınız kontrol ediliyor...
        </p>
      </main>
    );
  }

  const kodHazir =
    kod.replace(/\D/g, "").length === 6;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        backgroundColor: "#F8FAFC",
        fontFamily: "Arial, Helvetica, sans-serif",
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
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              fontSize: "46px",
              marginBottom: "12px",
            }}
          >
            🔐
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
            }}
          >
            Son Bir Doğrulama
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#64748B",
              lineHeight: 1.6,
            }}
          >
            Google hesabınıza bağlı e-posta adresine
            gönderilen 6 haneli kodu girin.
          </p>
        </div>

        {email && (
          <div
            style={{
              marginBottom: "22px",
              padding: "13px",
              borderRadius: "10px",
              border: "1px solid #DBEAFE",
              backgroundColor: "#EFF6FF",
              color: "#1E3A8A",
              textAlign: "center",
              fontSize: "14px",
              wordBreak: "break-word",
            }}
          >
            Kod şu adrese gönderildi:
            <br />
            <strong>{email}</strong>
          </div>
        )}

        <form
          onSubmit={koduDogrula}
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
              fontWeight: 700,
              color: "#334155",
            }}
          >
            Doğrulama kodu

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
              disabled={
                dogrulaniyor ||
                kodGonderiliyor ||
                !email
              }
              value={kod}
              onChange={(event) => {
                setKod(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 6)
                );

                setHata("");
              }}
              placeholder="123456"
              style={{
                padding: "16px",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#FFFFFF",
                color: "#0F172A",
                fontSize: "24px",
                fontWeight: 800,
                textAlign: "center",
                letterSpacing: "8px",
              }}
            />
          </label>

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
              !email ||
              !kodHazir ||
              dogrulaniyor ||
              kodGonderiliyor
            }
            style={{
              padding: "15px",
              border: "none",
              borderRadius: "11px",
              backgroundColor:
                !email ||
                !kodHazir ||
                dogrulaniyor ||
                kodGonderiliyor
                  ? "#94A3B8"
                  : "#2563EB",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 800,
              cursor:
                !email ||
                !kodHazir ||
                dogrulaniyor ||
                kodGonderiliyor
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
            marginTop: "20px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin: "0 0 10px",
              color: "#64748B",
              fontSize: "14px",
            }}
          >
            Kod gelmedi mi?
          </p>

          <button
            type="button"
            onClick={koduTekrarGonder}
            disabled={
              !email ||
              kodGonderiliyor ||
              dogrulaniyor ||
              beklemeSuresi > 0
            }
            style={{
              border: "none",
              backgroundColor: "transparent",
              padding: 0,
              color:
                beklemeSuresi > 0
                  ? "#94A3B8"
                  : "#2563EB",
              fontWeight: 800,
              cursor:
                beklemeSuresi > 0
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {kodGonderiliyor
              ? "Kod gönderiliyor..."
              : beklemeSuresi > 0
                ? `Tekrar gönder (${beklemeSuresi})`
                : "Kodu tekrar gönder"}
          </button>
        </div>
      </section>
    </main>
  );
}