"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";

export default function AracEklePage() {
  const router = useRouter();

  const [plaka, setPlaka] = useState("");
  const [marka, setMarka] = useState("");
  const [model, setModel] = useState("");
  const [yil, setYil] = useState("");
  const [kilometre, setKilometre] = useState("");
  const [muayeneTarihi, setMuayeneTarihi] = useState("");
  const [sigortaTarihi, setSigortaTarihi] = useState("");
  const [seyruseferTarihi, setSeyruseferTarihi] = useState("");
  const [sonBakimTarihi, setSonBakimTarihi] = useState("");

  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setHata("");
    setYukleniyor(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setHata("Araç eklemek için önce giriş yapmalısınız.");
        router.push("/giris");
        return;
      }

      const { error } = await supabase.from("vehicles").insert({
        user_id: user.id,
        plaka: plaka.trim().toUpperCase(),
        marka: marka.trim(),
        model: model.trim(),
        yil: yil ? Number(yil) : null,
        kilometre: kilometre ? Number(kilometre) : null,
        muayene_tarihi: muayeneTarihi || null,
        sigorta_tarihi: sigortaTarihi || null,
        seyrusefer_tarihi: seyruseferTarihi || null,
        son_bakim_tarihi: sonBakimTarihi || null,
      });

      if (error) {
        setHata(error.message);
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

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        padding: "40px 24px",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#0F172A",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "760px",
          margin: "0 auto",
          backgroundColor: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "18px",
          padding: "32px",
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
            fontSize: "34px",
            color: "#0F172A",
          }}
        >
          🚗 Araç Ekle
        </h1>

        <p
          style={{
            margin: "0 0 28px",
            color: "#64748B",
          }}
        >
          Aracınızın bilgilerini ve önemli tarihlerini kaydedin.
        </p>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          <label style={labelStyle}>
            Plaka
            <input
              type="text"
              required
              value={plaka}
              onChange={(event) => setPlaka(event.target.value)}
              placeholder="Örnek: AB 123"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Marka
            <input
              type="text"
              required
              value={marka}
              onChange={(event) => setMarka(event.target.value)}
              placeholder="Örnek: Toyota"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Model
            <input
              type="text"
              required
              value={model}
              onChange={(event) => setModel(event.target.value)}
              placeholder="Örnek: Corolla"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Yıl
            <input
              type="number"
              min="1900"
              max="2100"
              value={yil}
              onChange={(event) => setYil(event.target.value)}
              placeholder="Örnek: 2020"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Kilometre
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
            Muayene tarihi
            <input
              type="date"
              value={muayeneTarihi}
              onChange={(event) => setMuayeneTarihi(event.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Sigorta tarihi
            <input
              type="date"
              value={sigortaTarihi}
              onChange={(event) => setSigortaTarihi(event.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Seyrüsefer tarihi
            <input
              type="date"
              value={seyruseferTarihi}
              onChange={(event) => setSeyruseferTarihi(event.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Son bakım tarihi
            <input
              type="date"
              value={sonBakimTarihi}
              onChange={(event) => setSonBakimTarihi(event.target.value)}
              style={inputStyle}
            />
          </label>

          {hata && (
            <div
              style={{
                gridColumn: "1 / -1",
                padding: "13px",
                borderRadius: "10px",
                backgroundColor: "#FEF2F2",
                color: "#B91C1C",
              }}
            >
              {hata}
            </div>
          )}

          <button
            type="submit"
            disabled={yukleniyor}
            style={{
              gridColumn: "1 / -1",
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
            {yukleniyor ? "Araç kaydediliyor..." : "Aracı Kaydet"}
          </button>
        </form>
      </section>
    </main>
  );
}