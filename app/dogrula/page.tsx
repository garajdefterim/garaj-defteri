"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { supabase } from "../../lib/supabase";

export default function DogrulaPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [kod, setKod] = useState("");

  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");

  const [yukleniyor, setYukleniyor] =
    useState(false);

  const [tekrarGonderiliyor, setTekrarGonderiliyor] =
    useState(false);

  const [beklemeSuresi, setBeklemeSuresi] =
    useState(0);

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const emailParam =
      params.get("email")?.trim().toLowerCase() ?? "";

    setEmail(emailParam);
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

      /*
       * verifyOtp başarılı olduğunda Supabase
       * kullanıcı için oturum oluşturabilir.
       *
       * Biz kullanıcının doğrulamadan sonra
       * giriş sayfasından şifresiyle giriş
       * yapmasını istediğimiz için oturumu
       * kapatıyoruz.
       */
      await supabase.auth.signOut();

      setMesaj(
        "E-posta adresiniz başarıyla doğrulandı. Giriş sayfasına yönlendiriliyorsunuz."
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

    setTekrarGonderiliyor(true);

    try {
      const { error } =
        await supabase.auth.resend({
          type: "signup",
          email: temizEmail,
        });

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

      /*
       * Supabase SMTP ayarında minimum interval
       * değerimizi 60 saniye bırakmıştık.
       */
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
              fontSize: "46px",
              marginBottom: "12px",
            }}
          >
            📧
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              color: "#0F172A",
            }}
          >
            E-postanızı Doğrulayın
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#64748B",
              lineHeight: 1.6,
            }}
          >
            E-posta adresinize gönderilen
            6 haneli doğrulama kodunu girin.
          </p>
        </div>

        {email ? (
          <div
            style={{
              marginBottom: "22px",
              padding: "13px",
              borderRadius: "10px",
              border:
                "1px solid #DBEAFE",
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
        ) : (
          <div
            role="alert"
            style={{
              marginBottom: "22px",
              padding: "13px",
              borderRadius: "10px",
              border:
                "1px solid #FECACA",
              backgroundColor: "#FEF2F2",
              color: "#B91C1C",
              fontSize: "14px",
              lineHeight: 1.5,
            }}
          >
            Doğrulanacak e-posta adresi
            bulunamadı. Lütfen tekrar kayıt
            sayfasına dönün.
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
              color: "#334155",
              fontWeight: 700,
            }}
          >
            Doğrulama kodu

            <input
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
              placeholder="123456"
              style={{
                padding: "16px",
                borderRadius: "10px",
                border:
                  "1px solid #CBD5E1",
                backgroundColor:
                  !email
                    ? "#F1F5F9"
                    : "#FFFFFF",
                color: "#0F172A",
                fontSize: "24px",
                fontWeight: 800,
                textAlign: "center",
                letterSpacing: "8px",
                outline: "none",
              }}
            />
          </label>

          {hata && (
            <div
              role="alert"
              style={{
                padding: "13px",
                borderRadius: "10px",
                border:
                  "1px solid #FECACA",
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
                border:
                  "1px solid #BBF7D0",
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
              yukleniyor ||
              tekrarGonderiliyor ||
              !kodHazir ||
              !email
            }
            style={{
              padding: "15px",
              border: "none",
              borderRadius: "11px",
              backgroundColor:
                yukleniyor ||
                tekrarGonderiliyor ||
                !kodHazir ||
                !email
                  ? "#94A3B8"
                  : "#2563EB",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 800,
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
            marginTop: "18px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              margin:
                "0 0 10px",
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
              yukleniyor ||
              tekrarGonderiliyor ||
              beklemeSuresi > 0
            }
            style={{
              border: "none",
              padding: 0,
              backgroundColor:
                "transparent",
              color:
                !email ||
                tekrarGonderiliyor ||
                beklemeSuresi > 0
                  ? "#94A3B8"
                  : "#2563EB",
              fontSize: "14px",
              fontWeight: 800,
              cursor:
                !email ||
                tekrarGonderiliyor ||
                beklemeSuresi > 0
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

        <div
          style={{
            marginTop: "28px",
            paddingTop: "20px",
            borderTop:
              "1px solid #E2E8F0",
            textAlign: "center",
          }}
        >
          <Link
            href="/kayit"
            style={{
              color: "#64748B",
              textDecoration: "none",
              fontSize: "14px",
            }}
          >
            ← Kayıt sayfasına dön
          </Link>
        </div>
      </section>
    </main>
  );
}