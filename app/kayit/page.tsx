"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";

export default function KayitPage() {
  const [adSoyad, setAdSoyad] = useState("");
  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [mesaj, setMesaj] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);
  const [googleYukleniyor, setGoogleYukleniyor] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMesaj("");
    setHata("");

    if (sifre.length < 8) {
      setHata("Şifre en az 8 karakter olmalıdır.");
      return;
    }

    setYukleniyor(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: sifre,
        options: {
          data: {
            ad_soyad: adSoyad.trim(),
          },
        },
      });

      if (error) {
        setHata(error.message);
        return;
      }

      setMesaj(
        "Hesabınız oluşturuldu. E-posta adresinize gönderilen doğrulama bağlantısını kontrol edin."
      );

      setAdSoyad("");
      setEmail("");
      setSifre("");
    } catch {
      setHata("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setYukleniyor(false);
    }
  }

  async function googleIleDevamEt() {
    setHata("");
    setMesaj("");
    setGoogleYukleniyor(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) {
        setHata(`Google ile devam edilemedi: ${error.message}`);
        setGoogleYukleniyor(false);
      }
    } catch {
      setHata("Google ile devam edilirken bir hata oluştu.");
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
          boxShadow: "0 20px 50px rgba(15, 23, 42, 0.08)",
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
              fontSize: "42px",
              marginBottom: "10px",
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
            Hesap Oluştur
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              color: "#64748B",
            }}
          >
            Garaj Defteri hesabınızı oluşturun.
          </p>
        </div>

        <button
          type="button"
          onClick={googleIleDevamEt}
          disabled={googleYukleniyor || yukleniyor}
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
              googleYukleniyor || yukleniyor ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            opacity: googleYukleniyor ? 0.7 : 1,
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
          <input
            type="text"
            required
            autoComplete="name"
            value={adSoyad}
            onChange={(event) => setAdSoyad(event.target.value)}
            placeholder="Ad Soyad"
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              fontSize: "16px",
              color: "#0F172A",
              backgroundColor: "#FFFFFF",
            }}
          />

          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-posta"
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              fontSize: "16px",
              color: "#0F172A",
              backgroundColor: "#FFFFFF",
            }}
          />

          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={sifre}
            onChange={(event) => setSifre(event.target.value)}
            placeholder="Şifre"
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              fontSize: "16px",
              color: "#0F172A",
              backgroundColor: "#FFFFFF",
            }}
          />

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

          {mesaj && (
            <div
              role="status"
              style={{
                padding: "12px",
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
            disabled={yukleniyor || googleYukleniyor}
            style={{
              padding: "15px",
              border: "none",
              borderRadius: "11px",
              backgroundColor: yukleniyor ? "#94A3B8" : "#2563EB",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 800,
              cursor:
                yukleniyor || googleYukleniyor
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {yukleniyor ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
          </button>
        </form>

        <p
          style={{
            margin: "24px 0 0",
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