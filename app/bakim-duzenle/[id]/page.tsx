"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../../lib/supabase";

type MaintenanceRecord = {
  id: string;
  vehicle_id: string;
  baslik: string;
  aciklama: string | null;
  tarih: string;
  kilometre: number | null;
  tutar: number | null;
};

type Vehicle = {
  id: string;
  marka: string;
  model: string;
  plaka: string;
};

export default function BakimDuzenlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const bakimId = params.id;

  const [arac, setArac] = useState<Vehicle | null>(null);
  const [aracId, setAracId] = useState("");

  const [baslik, setBaslik] = useState("");
  const [aciklama, setAciklama] = useState("");
  const [tarih, setTarih] = useState("");
  const [kilometre, setKilometre] = useState("");
  const [tutar, setTutar] = useState("");

  const [sayfaYukleniyor, setSayfaYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    async function bakimKaydiniGetir() {
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

      const { data: bakimData, error: bakimError } = await supabase
        .from("maintenance_records")
        .select(
          `
          id,
          vehicle_id,
          baslik,
          aciklama,
          tarih,
          kilometre,
          tutar
        `
        )
        .eq("id", bakimId)
        .eq("user_id", user.id)
        .single();

      if (bakimError || !bakimData) {
        setHata(
          "Bakım kaydı bulunamadı veya bu kaydı düzenleme yetkiniz yok."
        );
        setSayfaYukleniyor(false);
        return;
      }

      const kayit = bakimData as MaintenanceRecord;

      const { data: aracData, error: aracError } = await supabase
        .from("vehicles")
        .select("id, marka, model, plaka")
        .eq("id", kayit.vehicle_id)
        .eq("user_id", user.id)
        .single();

      if (aracError || !aracData) {
        setHata("Bu bakım kaydına bağlı araç bulunamadı.");
        setSayfaYukleniyor(false);
        return;
      }

      setArac(aracData);
      setAracId(kayit.vehicle_id);

      setBaslik(kayit.baslik ?? "");
      setAciklama(kayit.aciklama ?? "");
      setTarih(kayit.tarih ?? "");
      setKilometre(
        kayit.kilometre !== null ? String(kayit.kilometre) : ""
      );
      setTutar(kayit.tutar !== null ? String(kayit.tutar) : "");

      setSayfaYukleniyor(false);
    }

    if (bakimId) {
      bakimKaydiniGetir();
    }
  }, [bakimId, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setHata("");
    setMesaj("");
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
      const tutarDegeri = tutar
        ? Number(tutar.replace(",", "."))
        : null;

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

      const { error: guncellemeError } = await supabase
        .from("maintenance_records")
        .update({
          baslik: temizBaslik,
          aciklama: aciklama.trim() || null,
          tarih,
          kilometre: kilometreDegeri,
          tutar: tutarDegeri,
        })
        .eq("id", bakimId)
        .eq("user_id", user.id);

      if (guncellemeError) {
        setHata(guncellemeError.message);
        return;
      }

      setMesaj("Bakım kaydı başarıyla güncellendi.");

      setTimeout(() => {
        router.push(`/bakim-gecmisi/${aracId}`);
        router.refresh();
      }, 700);
    } catch {
      setHata("Bakım kaydı güncellenirken beklenmeyen bir hata oluştu.");
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
        Bakım kaydı yükleniyor...
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
            Kayıt açılamadı
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
      className="bakim-duzenle-page"
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
        className="bakim-duzenle-container"
        style={{
          width: "100%",
          maxWidth: "960px",
          margin: "0 auto",
        }}
      >
        <header className="bakim-duzenle-header" style={{ marginBottom: "32px" }}>
          <Link
            href={aracId ? `/bakim-gecmisi/${aracId}` : "/dashboard"}
            style={{
              display: "inline-flex",
              color: "#6B7280",
              fontSize: "14px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Bakım geçmişine dön
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
            Bakım kaydını düzenle
          </h1>

          <p
            style={{
              margin: "9px 0 0",
              color: "#6B7280",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            Daha önce kaydettiğiniz bakım bilgilerini güncelleyin.
          </p>
        </header>

        <section
          className="bakim-duzenle-card"
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
              className="bakim-duzenle-vehicle"
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

          {mesaj && (
            <div
              role="status"
              style={{
                marginBottom: "20px",
                padding: "12px 13px",
                border: "1px solid #C6E7D2",
                borderRadius: "8px",
                backgroundColor: "#F7FCF9",
                color: "#276749",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              {mesaj}
            </div>
          )}

          <form
            className="bakim-duzenle-form"
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
              className="bakim-duzenle-description"
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
              className="bakim-duzenle-actions"
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
                href={aracId ? `/bakim-gecmisi/${aracId}` : "/dashboard"}
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
                  minWidth: "190px",
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
                  ? "Güncelleniyor..."
                  : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </form>
        </section>
      </div>

      <style jsx global>{`
        @media (max-width: 700px) {
          .bakim-duzenle-page {
            padding: 22px 14px 42px !important;
            overflow-x: hidden;
          }

          .bakim-duzenle-container {
            max-width: 100% !important;
          }

          .bakim-duzenle-header {
            margin-bottom: 22px !important;
          }

          .bakim-duzenle-header h1 {
            margin-top: 12px !important;
            font-size: 30px !important;
            letter-spacing: -0.6px !important;
          }

          .bakim-duzenle-header p {
            font-size: 14px !important;
            line-height: 1.55 !important;
          }

          .bakim-duzenle-card {
            padding: 18px !important;
            border-radius: 12px !important;
          }

          .bakim-duzenle-vehicle {
            margin-bottom: 18px !important;
            padding: 13px !important;
          }

          .bakim-duzenle-form {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 16px !important;
          }

          .bakim-duzenle-form > * {
            min-width: 0;
          }

          .bakim-duzenle-description {
            grid-column: auto !important;
          }

          .bakim-duzenle-description textarea {
            min-height: 120px !important;
          }

          .bakim-duzenle-actions {
            grid-column: auto !important;
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 9px !important;
            padding-top: 2px !important;
          }

          .bakim-duzenle-actions > a,
          .bakim-duzenle-actions > button {
            width: 100% !important;
            min-width: 0 !important;
            min-height: 46px !important;
            padding-left: 10px !important;
            padding-right: 10px !important;
          }
        }

        @media (max-width: 380px) {
          .bakim-duzenle-page {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .bakim-duzenle-card {
            padding: 15px !important;
          }

          .bakim-duzenle-actions {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}