"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";

export default function GirisPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [sifre, setSifre] = useState("");
  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setHata("");
    setYukleniyor(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: sifre,
      });

      if (error) {
        if (error.message.toLowerCase().includes("email not confirmed")) {
          setHata("Önce e-posta adresinizi doğrulamanız gerekiyor.");
        } else {
          setHata("E-posta adresi veya şifre hatalı.");
        }

        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setHata("Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setYukleniyor(false);
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
            marginBottom: "30px",
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
              fontSize: "30px",
              color: "#0F172A",
            }}
          >
            Giriş Yap
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              color: "#64748B",
            }}
          >
            Garaj Defteri hesabınıza giriş yapın.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
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
            E-posta
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ornek@email.com"
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#FFFFFF",
                color: "#0F172A",
                fontSize: "16px",
              }}
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
              autoComplete="current-password"
              value={sifre}
              onChange={(event) => setSifre(event.target.value)}
              placeholder="Şifrenizi yazın"
              style={{
                padding: "14px",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#FFFFFF",
                color: "#0F172A",
                fontSize: "16px",
              }}
            />
          </label>

          {hata && (
            <div
              role="alert"
              style={{
                padding: "12px",
                borderRadius: "10px",
                backgroundColor: "#FEF2F2",
                color: "#B91C1C",
                fontSize: "14px",
              }}
            >
              {hata}
            </div>
          )}

          <button
            type="submit"
            disabled={yukleniyor}
            style={{
              marginTop: "6px",
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
            {yukleniyor ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>

        <p
          style={{
            margin: "24px 0 0",
            textAlign: "center",
            color: "#64748B",
          }}
        >
          Hesabınız yok mu?{" "}
          <Link
            href="/kayit"
            style={{
              color: "#1D4ED8",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Kayıt Ol
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