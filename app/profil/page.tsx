"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type ProfilBilgisi = {
  adSoyad: string;
  email: string;
  fotograf: string | null;
  provider: string;
};

export default function ProfilPage() {
  const router = useRouter();

  const [profil, setProfil] = useState<ProfilBilgisi | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [cikisYapiliyor, setCikisYapiliyor] = useState(false);
  const [hata, setHata] = useState("");

  useEffect(() => {
    async function profiliGetir() {
      setHata("");
      setYukleniyor(true);

      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.replace("/giris");
          return;
        }

        const metadata = user.user_metadata ?? {};

        const adSoyad =
          metadata.full_name ||
          metadata.name ||
          metadata.ad_soyad ||
          "Garaj Defteri Kullanıcısı";

        const fotograf =
          metadata.avatar_url ||
          metadata.picture ||
          null;

        const provider =
          user.app_metadata?.provider === "google"
            ? "Google"
            : "E-posta";

        setProfil({
          adSoyad,
          email: user.email ?? "",
          fotograf,
          provider,
        });
      } catch {
        setHata("Profil bilgileri alınırken bir hata oluştu.");
      } finally {
        setYukleniyor(false);
      }
    }

    profiliGetir();
  }, [router]);

  async function cikisYap() {
    setHata("");
    setCikisYapiliyor(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setHata(error.message);
        return;
      }

      router.replace("/giris");
      router.refresh();
    } catch {
      setHata("Çıkış yapılırken bir hata oluştu.");
    } finally {
      setCikisYapiliyor(false);
    }
  }

  if (yukleniyor) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8FAFC",
          color: "#64748B",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        Profil yükleniyor...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        backgroundColor: "#F8FAFC",
        color: "#0F172A",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "720px",
          margin: "0 auto",
        }}
      >
        <Link
          href="/dashboard"
          style={{
            color: "#2563EB",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          ← Panele dön
        </Link>

        <section
          style={{
            marginTop: "24px",
            padding: "32px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            {profil?.fotograf ? (
              <img
                src={profil.fotograf}
                alt="Profil fotoğrafı"
                referrerPolicy="no-referrer"
                style={{
                  width: "84px",
                  height: "84px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #DBEAFE",
                }}
              />
            ) : (
              <div
                style={{
                  width: "84px",
                  height: "84px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#EFF6FF",
                  border: "3px solid #DBEAFE",
                  fontSize: "34px",
                }}
              >
                👤
              </div>
            )}

            <div>
              <p
                style={{
                  margin: "0 0 5px",
                  color: "#64748B",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                HESABIM
              </p>

              <h1
                style={{
                  margin: 0,
                  fontSize: "28px",
                }}
              >
                {profil?.adSoyad}
              </h1>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#64748B",
                }}
              >
                {profil?.email}
              </p>
            </div>
          </div>

          <div
            style={{
              marginTop: "30px",
              display: "grid",
              gap: "14px",
            }}
          >
            <div
              style={{
                padding: "18px",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
              }}
            >
              <span
                style={{
                  display: "block",
                  color: "#64748B",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                E-POSTA
              </span>

              <strong
                style={{
                  display: "block",
                  marginTop: "6px",
                }}
              >
                {profil?.email}
              </strong>
            </div>

            <div
              style={{
                padding: "18px",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                backgroundColor: "#F8FAFC",
              }}
            >
              <span
                style={{
                  display: "block",
                  color: "#64748B",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                GİRİŞ YÖNTEMİ
              </span>

              <strong
                style={{
                  display: "block",
                  marginTop: "6px",
                }}
              >
                {profil?.provider === "Google"
                  ? "Google ile giriş"
                  : "E-posta ile giriş"}
              </strong>
            </div>
          </div>

          {hata && (
            <div
              role="alert"
              style={{
                marginTop: "20px",
                padding: "13px",
                borderRadius: "10px",
                border: "1px solid #FECACA",
                backgroundColor: "#FEF2F2",
                color: "#B91C1C",
              }}
            >
              {hata}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gap: "12px",
              marginTop: "28px",
            }}
          >
            <Link
              href="/bildirim-ayarlari"
              style={{
                padding: "15px",
                borderRadius: "11px",
                backgroundColor: "#EFF6FF",
                border: "1px solid #BFDBFE",
                color: "#1D4ED8",
                fontWeight: 800,
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              🔔 Bildirim Ayarları
            </Link>

            <button
              type="button"
              onClick={cikisYap}
              disabled={cikisYapiliyor}
              style={{
                padding: "15px",
                borderRadius: "11px",
                border: "1px solid #FECACA",
                backgroundColor: "#FEF2F2",
                color: "#B91C1C",
                fontSize: "16px",
                fontWeight: 800,
                cursor: cikisYapiliyor
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {cikisYapiliyor ? "Çıkış yapılıyor..." : "Çıkış Yap"}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}