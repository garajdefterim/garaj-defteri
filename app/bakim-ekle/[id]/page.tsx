"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../../lib/supabase";

type Vehicle = {
  id: string;
  marka: string;
  model: string;
  plaka: string;
  kilometre: number | null;
};

export default function BakimEklePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const aracId = params.id;

  const [arac, setArac] = useState<Vehicle | null>(null);
  const [baslik, setBaslik] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [tarih, setTarih] = useState("");
  const [kilometre, setKilometre] = useState("");
  const [tutar, setTutar] = useState("");

  const [sayfaYukleniyor, setSayfaYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState("");

  useEffect(() => {
    async function araciGetir() {
      setHata("");
      setSayfaYukleniyor(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/giris");
        router.refresh();
        return;
      }

      const { data, error } = await supabase
        .from("vehicles")
        .select("id, marka, model, plaka, kilometre")
        .eq("id", aracId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setHata("Araç bulunamadı veya bu araca erişim yetkiniz yok.");
        setSayfaYukleniyor(false);
        return;
      }

      setArac(data);
      setKilometre(data.kilometre ? String(data.kilometre) : "");

      const bugun = new Date();
      setTarih(bugun.toISOString().split("T")[0]);

      setSayfaYukleniyor(false);
    }

    if (aracId) {
      araciGetir();
    }
  }, [aracId, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setHata("");
    setKaydediliyor(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/giris");
        router.refresh();
        return;
      }

      const temizBaslik = baslik.trim();

      if (!temizBaslik) {
        setHata("Bakım başlığını yazın.");
        return;
      }

      if (!tarih) {
        setHata("Bakım tarihini seçin.");
        return;
      }

      const kilometreDegeri = kilometre ? Number(kilometre) : null;
      const tutarDegeri = tutar ? Number(tutar.replace(",", ".")) : null;

      if (
        kilometreDegeri !== null &&
        (!Number.isFinite(kilometreDegeri) || kilometreDegeri < 0)
      ) {
        setHata("Geçerli bir kilometre değeri yazın.");
        return;
      }

      if (
        tutarDegeri !== null &&
        (!Number.isFinite(tutarDegeri) || tutarDegeri < 0)
      ) {
        setHata("Geçerli bir tutar yazın.");
        return;
      }

      const { error: bakimError } = await supabase
        .from("maintenance_records")
        .insert({
          user_id: user.id,
          vehicle_id: aracId,
          baslik: temizBaslik,
          aciklama: aciklama.trim() || null,
          tarih,
          kilometre: kilometreDegeri,
          tutar: tutarDegeri,
        });

      if (bakimError) {
        setHata(bakimError.message);
        return;
      }

      const { error: aracError } = await supabase
        .from("vehicles")
        .update({
          son_bakim_tarihi: tarih,
          kilometre: kilometreDegeri,
        })
        .eq("id", aracId)
        .eq("user_id", user.id);

      if (aracError) {
        setHata(
          "Bakım kaydedildi fakat araç bilgileri güncellenemedi: " +
            aracError.message
        );
        return;
      }

      router.push(`/bakim-gecmisi/${aracId}`);
      router.refresh();
    } catch {
      setHata("Bakım kaydedilirken beklenmeyen bir hata oluştu.");
    } finally {
      setKaydediliyor(false);
    }
  }

  const inputStyle = {
    width: "100%",
    minHeight: "48px",
    padding: "0 14px",
    border: "1px solid #D7DCE3",
    borderRadius: "9px",
    backgroundColor: "#FFFFFF",
    color: "#111827",
    fontSize: "15px",
    boxSizing: "border-box" as const,
    outline: "none",
  };

  const labelStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "7px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: 600,
  };

  if (sayfaYukleniyor) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: "#F7F8FA",
          color: "#111827",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        Araç bilgileri yükleniyor...
      </main>
    );
  }

  if (hata && !arac) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          backgroundColor: "#F7F8FA",
          color: "#111827",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "520px",
            padding: "28px",
            border: "1px solid #F1C7C7",
            borderRadius: "14px",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#111827",
              fontSize: "24px",
              letterSpacing: "-0.5px",
            }}
          >
            Araç açılamadı
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              color: "#6B7280",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            {hata}
          </p>

          <Link
            href="/dashboard"
            style={{
              display: "inline-flex",
              marginTop: "18px",
              color: "#1D4ED8",
              fontSize: "14px",
              fontWeight: 650,
              textDecoration: "none",
            }}
          >
            ← Dashboard
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main
      className="bakim-ekle-page"
      style={{
        minHeight: "100vh",
        padding: "32px 24px 64px",
        backgroundColor: "#F7F8FA",
        color: "#111827",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        className="bakim-ekle-container"
        style={{
          width: "100%",
          maxWidth: "960px",
          margin: "0 auto",
        }}
      >
        <header className="bakim-ekle-header" style={{ marginBottom: "32px" }}>
          <Link
            href={`/arac/${aracId}`}
            style={{
              display: "inline-flex",
              color: "#6B7280",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Araç detayına dön
          </Link>

          <h1
            style={{
              margin: "16px 0 0",
              color: "#111827",
              fontSize: "clamp(30px, 6vw, 38px)",
              lineHeight: 1.15,
              fontWeight: 760,
              letterSpacing: "-0.9px",
            }}
          >
            Bakım kaydı ekle
          </h1>

          <p
            style={{
              margin: "9px 0 0",
              color: "#6B7280",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            Yapılan bakım işlemini ve masraf bilgilerini kaydedin.
          </p>
        </header>

        <section
          className="bakim-ekle-card"
          style={{
            width: "100%",
            padding: "28px",
            border: "1px solid #E3E7EC",
            borderRadius: "14px",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
            boxSizing: "border-box",
          }}
        >
          {arac && (
            <div
              className="bakim-ekle-vehicle"
              style={{
                marginBottom: "24px",
                padding: "14px 15px",
                border: "1px solid #E3E7EC",
                borderRadius: "10px",
                backgroundColor: "#F8FAFC",
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "#111827",
                  fontSize: "15px",
                  fontWeight: 650,
                }}
              >
                {arac.marka} {arac.model}
              </strong>

              <span
                style={{
                  display: "block",
                  marginTop: "4px",
                  color: "#6B7280",
                  fontSize: "13px",
                  fontWeight: 650,
                  letterSpacing: "0.04em",
                }}
              >
                {arac.plaka}
              </span>
            </div>
          )}

          {hata && (
            <div
              role="alert"
              style={{
                marginBottom: "20px",
                padding: "12px 13px",
                border: "1px solid #F1C7C7",
                borderRadius: "8px",
                backgroundColor: "#FFF7F7",
                color: "#A93838",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              {hata}
            </div>
          )}

          <form
            className="bakim-ekle-form"
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "20px",
            }}
          >
            <label style={labelStyle}>
              Bakım başlığı
              <input
                type="text"
                required
                value={baslik}
                onChange={(event) => setBaslik(event.target.value)}
                placeholder="Örnek: Motor yağı ve filtre değişimi"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Bakım tarihi
              <input
                type="date"
                required
                value={tarih}
                onChange={(event) => setTarih(event.target.value)}
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Bakım anındaki kilometre
              <input
                type="number"
                min="0"
                value={kilometre}
                onChange={(event) => setKilometre(event.target.value)}
                placeholder="Örnek: 85000"
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Tutar
              <input
                type="number"
                min="0"
                step="0.01"
                value={tutar}
                onChange={(event) => setTutar(event.target.value)}
                placeholder="Örnek: 2500"
                style={inputStyle}
              />
            </label>

            <label
              className="bakim-ekle-description"
              style={{
                ...labelStyle,
                gridColumn: "1 / -1",
              }}
            >
              Açıklama
              <textarea
                value={aciklama}
                onChange={(event) => setAciklama(event.target.value)}
                placeholder="Değiştirilen parçaları veya yapılan işlemleri yazın."
                rows={5}
                style={{
                  ...inputStyle,
                  height: "auto",
                  minHeight: "130px",
                  padding: "13px 14px",
                  resize: "vertical",
                  lineHeight: 1.55,
                  fontFamily: "inherit",
                }}
              />
            </label>

            <div
              className="bakim-ekle-actions"
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                flexWrap: "wrap",
                paddingTop: "4px",
              }}
            >
              <Link
                href={`/arac/${aracId}`}
                style={{
                  minHeight: "46px",
                  padding: "0 16px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #D7DCE3",
                  borderRadius: "9px",
                  backgroundColor: "#FFFFFF",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: 650,
                  textDecoration: "none",
                  boxSizing: "border-box",
                }}
              >
                Vazgeç
              </Link>

              <button
                type="submit"
                disabled={kaydediliyor}
                style={{
                  minWidth: "160px",
                  height: "46px",
                  padding: "0 18px",
                  border: "none",
                  borderRadius: "9px",
                  backgroundColor: kaydediliyor
                    ? "#AAB2BD"
                    : "#1D4ED8",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: kaydediliyor ? "not-allowed" : "pointer",
                }}
              >
                {kaydediliyor
                  ? "Kaydediliyor..."
                  : "Bakımı Kaydet"}
              </button>
            </div>
          </form>
        </section>
      </div>

      <style jsx global>{`
        .bakim-ekle-page,
        .bakim-ekle-page * {
          min-width: 0;
        }

        .bakim-ekle-page input,
        .bakim-ekle-page textarea,
        .bakim-ekle-page button,
        .bakim-ekle-page a {
          max-width: 100%;
        }

        @media (max-width: 900px) {
          .bakim-ekle-page {
            padding: 28px 20px 54px !important;
          }

          .bakim-ekle-container {
            max-width: 820px !important;
          }

          .bakim-ekle-form {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 18px !important;
          }

          .bakim-ekle-description,
          .bakim-ekle-actions {
            grid-column: 1 / -1 !important;
          }
        }

        @media (max-width: 700px) {
          .bakim-ekle-page {
            padding: 22px 14px 42px !important;
            overflow-x: hidden;
          }

          .bakim-ekle-container {
            width: 100% !important;
            max-width: 100% !important;
          }

          .bakim-ekle-header {
            margin-bottom: 22px !important;
          }

          .bakim-ekle-header h1 {
            margin-top: 12px !important;
            font-size: 30px !important;
            letter-spacing: -0.6px !important;
          }

          .bakim-ekle-header p {
            font-size: 14px !important;
            line-height: 1.55 !important;
          }

          .bakim-ekle-card {
            padding: 18px !important;
            border-radius: 12px !important;
          }

          .bakim-ekle-vehicle {
            margin-bottom: 18px !important;
            padding: 13px !important;
            overflow-wrap: anywhere;
          }

          .bakim-ekle-form {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 15px 12px !important;
          }

          .bakim-ekle-form > * {
            min-width: 0;
          }

          .bakim-ekle-form input,
          .bakim-ekle-form textarea {
            width: 100% !important;
            min-width: 0 !important;
            font-size: 16px !important;
          }

          .bakim-ekle-description {
            grid-column: 1 / -1 !important;
          }

          .bakim-ekle-description textarea {
            min-height: 120px !important;
          }

          .bakim-ekle-actions {
            grid-column: 1 / -1 !important;
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 9px !important;
            padding-top: 2px !important;
          }

          .bakim-ekle-actions > a,
          .bakim-ekle-actions > button {
            width: 100% !important;
            min-width: 0 !important;
            min-height: 46px !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
        }

        @media (max-width: 480px) {
          .bakim-ekle-page {
            padding: 18px 12px 38px !important;
          }

          .bakim-ekle-header h1 {
            font-size: 28px !important;
          }

          .bakim-ekle-card {
            padding: 16px !important;
          }

          .bakim-ekle-form {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 14px 10px !important;
          }

          .bakim-ekle-form label {
            font-size: 13px !important;
          }

          .bakim-ekle-description {
            grid-column: 1 / -1 !important;
          }
        }

        @media (max-width: 360px) {
          .bakim-ekle-page {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .bakim-ekle-card {
            padding: 14px !important;
          }

          .bakim-ekle-form {
            grid-template-columns: 1fr !important;
          }

          .bakim-ekle-description,
          .bakim-ekle-actions {
            grid-column: auto !important;
          }

          .bakim-ekle-actions {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}