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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMesaj("");
    setHata("");

    if (sifre.length < 8) {
      setHata("Şifre en az 8 karakter olmalıdır.");
      return;
    }

    setYukleniyor(true);

    const { error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password: sifre,
      options: {
        data: {
          ad_soyad: adSoyad.trim(),
        },
      },
    });

    setYukleniyor(false);

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
        <h1 style={{ margin: 0, color: "#0F172A" }}>Hesap Oluştur</h1>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            marginTop: "28px",
          }}
        >
          <input
            type="text"
            required
            value={adSoyad}
            onChange={(event) => setAdSoyad(event.target.value)}
            placeholder="Ad Soyad"
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              fontSize: "16px",
            }}
          />

          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-posta"
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              fontSize: "16px",
            }}
          />

          <input
            type="password"
            required
            minLength={8}
            value={sifre}
            onChange={(event) => setSifre(event.target.value)}
            placeholder="Şifre"
            style={{
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #CBD5E1",
              fontSize: "16px",
            }}
          />

          {hata && <p style={{ color: "#B91C1C" }}>{hata}</p>}
          {mesaj && <p style={{ color: "#166534" }}>{mesaj}</p>}

          <button
            type="submit"
            disabled={yukleniyor}
            style={{
              padding: "15px",
              border: "none",
              borderRadius: "11px",
              backgroundColor: yukleniyor ? "#94A3B8" : "#2563EB",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 800,
              cursor: yukleniyor ? "not-allowed" : "pointer",
            }}
          >
            {yukleniyor ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
          </button>
        </form>

        <p style={{ marginTop: "24px" }}>
          Zaten hesabınız var mı? <Link href="/giris">Giriş Yap</Link>
        </p>
      </section>
    </main>
  );
}