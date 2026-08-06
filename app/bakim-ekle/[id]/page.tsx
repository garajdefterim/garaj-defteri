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

      const { error: bakimError } = await supabase
        .from("maintenance_records")
        .insert({
          user_id: user.id,
          vehicle_id: aracId,
          baslik: temizBaslik,
          aciklama: aciklama.trim() || null,
          tarih,
          kilometre: kilometre ? Number(kilometre) : null,
          tutar: tutar ? Number(tutar.replace(",", ".")) : null,
        });

      if (bakimError) {
        setHata(bakimError.message);
        return;
      }

      const { error: aracError } = await supabase
        .from("vehicles")
        .update({
          son_bakim_tarihi: tarih,
          kilometre: kilometre ? Number(kilometre) : null,
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
          backgroundColor: "#F8FAFC",
          color: "#0F172A",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        Araç bilgileri yükleniyor...
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
          href="/dashboard"
          style={{
            color: "#2563EB",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          ← Panele dön
        </Link>

        <h1
          style={{
            margin: "24px 0 8px",
            color: "#0F172A",
            fontSize: "34px",
          }}
        >
          🔧 Bakım Kaydı Ekle
        </h1>

        {arac && (
          <div
            style={{
              margin: "20px 0 28px",
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

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
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
                resize: "vertical",
              }}
            />
          </label>

          <button
            type="submit"
            disabled={kaydediliyor}
            style={{
              gridColumn: "1 / -1",
              padding: "15px",
              border: "none",
              borderRadius: "11px",
              backgroundColor: kaydediliyor ? "#94A3B8" : "#059669",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 800,
              cursor: kaydediliyor ? "not-allowed" : "pointer",
            }}
          >
            {kaydediliyor ? "Bakım kaydediliyor..." : "Bakımı Kaydet"}
          </button>
        </form>
      </section>
    </main>
  );
}