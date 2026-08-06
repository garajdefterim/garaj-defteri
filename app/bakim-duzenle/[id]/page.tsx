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
    padding: "13px 14px",
    border: "1px solid #CBD5E1",
    borderRadius: "10px",
    backgroundColor: "#FFFFFF",
    color: "#0F172A",
    fontSize: "16px",
  };

  const labelStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    color: "#334155",
    fontWeight: 700,
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
          backgroundColor: "#F8FAFC",
          color: "#0F172A",
          fontFamily: "Arial, Helvetica, sans-serif",
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
          backgroundColor: "#F8FAFC",
          color: "#0F172A",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "520px",
            padding: "28px",
            border: "1px solid #FECACA",
            borderRadius: "18px",
            backgroundColor: "#FFFFFF",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#B91C1C",
              fontSize: "25px",
            }}
          >
            Kayıt açılamadı
          </h1>

          <p
            style={{
              color: "#64748B",
              lineHeight: 1.6,
            }}
          >
            {hata}
          </p>

          <Link
            href="/dashboard"
            style={{
              display: "inline-block",
              marginTop: "8px",
              color: "#2563EB",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            ← Panele dön
          </Link>
        </section>
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
      <section
        style={{
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
          padding: "32px",
          border: "1px solid #E2E8F0",
          borderRadius: "18px",
          backgroundColor: "#FFFFFF",
          boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        }}
      >
        <Link
          href={
            aracId
              ? `/bakim-gecmisi/${aracId}`
              : "/dashboard"
          }
          style={{
            color: "#2563EB",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          ← Bakım geçmişine dön
        </Link>

        <h1
          style={{
            margin: "24px 0 8px",
            color: "#0F172A",
            fontSize: "34px",
          }}
        >
          ✏️ Bakım Kaydını Düzenle
        </h1>

        <p
          style={{
            margin: "0 0 24px",
            color: "#64748B",
            lineHeight: 1.6,
          }}
        >
          Daha önce eklediğiniz bakım bilgilerini güncelleyin.
        </p>

        {arac && (
          <div
            style={{
              marginBottom: "28px",
              padding: "17px",
              border: "1px solid #E2E8F0",
              borderRadius: "12px",
              backgroundColor: "#F8FAFC",
            }}
          >
            <strong
              style={{
                display: "block",
                color: "#0F172A",
                fontSize: "18px",
              }}
            >
              {arac.marka} {arac.model}
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "5px",
                color: "#2563EB",
                fontWeight: 800,
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
              padding: "13px",
              border: "1px solid #FECACA",
              borderRadius: "10px",
              backgroundColor: "#FEF2F2",
              color: "#B91C1C",
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
              padding: "13px",
              border: "1px solid #BBF7D0",
              borderRadius: "10px",
              backgroundColor: "#F0FDF4",
              color: "#166534",
            }}
          >
            {mesaj}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          <label style={labelStyle}>
            Bakım başlığı
            <input
              type="text"
              required
              value={baslik}
              onChange={(event) =>
                setBaslik(event.target.value)
              }
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
              onChange={(event) =>
                setTarih(event.target.value)
              }
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Bakım anındaki kilometre
            <input
              type="number"
              min="0"
              value={kilometre}
              onChange={(event) =>
                setKilometre(event.target.value)
              }
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
              onChange={(event) =>
                setTutar(event.target.value)
              }
              placeholder="Örnek: 2500"
              style={inputStyle}
            />
          </label>

          <label
            style={{
              ...labelStyle,
              gridColumn: "1 / -1",
            }}
          >
            Açıklama
            <textarea
              value={aciklama}
              onChange={(event) =>
                setAciklama(event.target.value)
              }
              placeholder="Değiştirilen parçaları veya yapılan işlemleri yazın."
              rows={5}
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />
          </label>

          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href={
                aracId
                  ? `/bakim-gecmisi/${aracId}`
                  : "/dashboard"
              }
              style={{
                padding: "14px 20px",
                border: "1px solid #CBD5E1",
                borderRadius: "11px",
                backgroundColor: "#FFFFFF",
                color: "#334155",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Vazgeç
            </Link>

            <button
              type="submit"
              disabled={kaydediliyor}
              style={{
                padding: "14px 20px",
                border: "none",
                borderRadius: "11px",
                backgroundColor: kaydediliyor
                  ? "#94A3B8"
                  : "#2563EB",
                color: "#FFFFFF",
                fontSize: "16px",
                fontWeight: 800,
                cursor: kaydediliyor
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {kaydediliyor
                ? "Güncelleniyor..."
                : "Değişiklikleri Kaydet"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}