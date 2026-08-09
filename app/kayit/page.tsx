"use client";

import Link from "next/link";
import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function KayitPage() {
  const [hata, setHata] = useState("");
  const [googleYukleniyor, setGoogleYukleniyor] = useState(false);

  async function googleIleDevamEt() {
    setHata("");
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
            marginBottom: "30px",
          }}
        >
          <div
            style={{
              fontSize: "44px",
              marginBottom: "12px",
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
            Garaj Defteri'ne Katıl
          </h1>

          <p
            style={{
              margin: "12px 0 0",
              color: "#64748B",
              lineHeight: 1.6,
            }}
          >
            Google hesabınızla birkaç saniye içinde hesabınızı oluşturun.
          </p>
        </div>

        <button
          type="button"
          onClick={googleIleDevamEt}
          disabled={googleYukleniyor}
          style={{
            width: "100%",
            padding: "15px 16px",
            border: "1px solid #CBD5E1",
            borderRadius: "11px",
            backgroundColor: "#FFFFFF",
            color: "#0F172A",
            fontSize: "16px",
            fontWeight: 700,
            cursor: googleYukleniyor ? "not-allowed" : "pointer",
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
              width: "26px",
              height: "26px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              border: "1px solid #E2E8F0",
              backgroundColor: "#FFFFFF",
              color: "#4285F4",
              fontSize: "18px",
              fontWeight: 900,
            }}
          >
            G
          </span>

          {googleYukleniyor
            ? "Google'a yönlendiriliyor..."
            : "Google ile devam et"}
        </button>

        {hata && (
          <div
            role="alert"
            style={{
              marginTop: "18px",
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

        <div
          style={{
            marginTop: "24px",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid #DBEAFE",
            backgroundColor: "#EFF6FF",
            color: "#1E3A8A",
            fontSize: "14px",
            lineHeight: 1.6,
          }}
        >
          Google ile devam ettiğinizde adınız ve e-posta adresiniz Google
          hesabınızdan alınır. Ayrı bir şifre oluşturmanız gerekmez.
        </div>

        <p
          style={{
            margin: "26px 0 0",
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