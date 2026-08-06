"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";

type VehicleCategory =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H";

const aracKategorileri: {
  value: VehicleCategory;
  baslik: string;
  aciklama: string;
}[] = [
  {
    value: "D",
    baslik: "Özel şahsi araç",
    aciklama:
      "Özel otomobil, motosiklet, hibrit veya elektrikli araç",
  },
  {
    value: "A",
    baslik: "Ticari veya taşımacılık aracı",
    aciklama:
      "Otobüs, kamyon, kamyonet, panelvan, taksi veya benzeri araç",
  },
  {
    value: "B",
    baslik: "Römork",
    aciklama: "Römork kategorisindeki araç",
  },
  {
    value: "C",
    baslik: "Geçici kayıtlı araç",
    aciklama: "ZT veya ZZ benzeri geçici kayıtlı araç",
  },
  {
    value: "E",
    baslik: "Sürücü okulu veya ralli aracı",
    aciklama: "Sürücü yetiştirme maksadıyla kullanılan araç",
  },
  {
    value: "F",
    baslik: "Kiralık araç",
    aciklama: "Z plakalı kiralık motorlu araç",
  },
  {
    value: "G",
    baslik: "Tarımsal araç",
    aciklama: "Traktör veya biçerdöver",
  },
  {
    value: "H",
    baslik: "Resmî hizmet aracı",
    aciklama: "RHA plakalı resmî hizmet aracı",
  },
];

export default function AracEklePage() {
  const router = useRouter();

  const [plaka, setPlaka] = useState("");
  const [aracKategorisi, setAracKategorisi] =
    useState<VehicleCategory>("D");
  const [marka, setMarka] = useState("");
  const [model, setModel] = useState("");
  const [yil, setYil] = useState("");
  const [kilometre, setKilometre] = useState("");
  const [sigortaTarihi, setSigortaTarihi] = useState("");
  const [seyruseferTarihi, setSeyruseferTarihi] =
    useState("");
  const [sonBakimTarihi, setSonBakimTarihi] = useState("");

  const [hata, setHata] = useState("");
  const [yukleniyor, setYukleniyor] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setHata("");
    setYukleniyor(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setHata(
          "Araç eklemek için önce giriş yapmalısınız."
        );
        router.push("/giris");
        router.refresh();
        return;
      }

      const temizPlaka = plaka
        .trim()
        .toUpperCase()
        .replace(/\s+/g, " ");

      if (!temizPlaka) {
        setHata("Lütfen araç plakasını girin.");
        return;
      }

      if (!marka.trim()) {
        setHata("Lütfen araç markasını girin.");
        return;
      }

      if (!model.trim()) {
        setHata("Lütfen araç modelini girin.");
        return;
      }

      const { error } = await supabase
        .from("vehicles")
        .insert({
          user_id: user.id,
          plaka: temizPlaka,
          vehicle_category: aracKategorisi,
          marka: marka.trim(),
          model: model.trim(),
          yil: yil ? Number(yil) : null,
          kilometre: kilometre
            ? Number(kilometre)
            : null,
          sigorta_tarihi: sigortaTarihi || null,
          seyrusefer_tarihi:
            seyruseferTarihi || null,
          son_bakim_tarihi:
            sonBakimTarihi || null,
          muayene_tarihi: null,
        });

      if (error) {
        setHata(error.message);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setHata(
        "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
      );
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
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px",
    color: "#334155",
    fontWeight: 700,
  };

  const seciliKategori = aracKategorileri.find(
    (kategori) => kategori.value === aracKategorisi
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        padding: "40px 24px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
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
          boxShadow:
            "0 10px 30px rgba(15, 23, 42, 0.08)",
          boxSizing: "border-box",
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
            lineHeight: 1.6,
          }}
        >
          Aracınızın bilgilerini kaydedin. Resmî
          muayene dönemi plaka ve araç kategorisine
          göre otomatik olarak bulunacaktır.
        </p>

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
            Plaka
            <input
              type="text"
              required
              value={plaka}
              onChange={(event) =>
                setPlaka(event.target.value)
              }
              placeholder="Örnek: UM 590"
              autoCapitalize="characters"
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Araç kategorisi
            <select
              required
              value={aracKategorisi}
              onChange={(event) =>
                setAracKategorisi(
                  event.target.value as VehicleCategory
                )
              }
              style={{
                ...inputStyle,
                cursor: "pointer",
              }}
            >
              {aracKategorileri.map((kategori) => (
                <option
                  key={kategori.value}
                  value={kategori.value}
                >
                  {kategori.value} — {kategori.baslik}
                </option>
              ))}
            </select>
          </label>

          <div
            style={{
              gridColumn: "1 / -1",
              padding: "15px",
              border: "1px solid #BFDBFE",
              borderRadius: "12px",
              backgroundColor: "#EFF6FF",
            }}
          >
            <strong
              style={{
                display: "block",
                color: "#1D4ED8",
              }}
            >
              Seçilen kategori: {aracKategorisi} —{" "}
              {seciliKategori?.baslik}
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "6px",
                color: "#475569",
                fontSize: "14px",
                lineHeight: 1.5,
              }}
            >
              {seciliKategori?.aciklama}
            </span>
          </div>

          <label style={labelStyle}>
            Marka
            <input
              type="text"
              required
              value={marka}
              onChange={(event) =>
                setMarka(event.target.value)
              }
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
              onChange={(event) =>
                setModel(event.target.value)
              }
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
              onChange={(event) =>
                setYil(event.target.value)
              }
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
              onChange={(event) =>
                setKilometre(event.target.value)
              }
              placeholder="Örnek: 85000"
              style={inputStyle}
            />
          </label>

          <div
            style={{
              gridColumn: "1 / -1",
              padding: "17px",
              border: "1px solid #E2E8F0",
              borderRadius: "13px",
              backgroundColor: "#F8FAFC",
            }}
          >
            <strong
              style={{
                display: "block",
                color: "#0F172A",
              }}
            >
              📅 Muayene tarihi otomatik belirlenecek
            </strong>

            <p
              style={{
                margin: "7px 0 0",
                color: "#64748B",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              Aracın resmî muayene dönemi, plaka ve
              seçtiğiniz araç kategorisi kullanılarak
              yıllık KKTC muayene takviminden bulunur.
            </p>
          </div>

          <label style={labelStyle}>
            Sigorta bitiş tarihi
            <input
              type="date"
              value={sigortaTarihi}
              onChange={(event) =>
                setSigortaTarihi(event.target.value)
              }
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Seyrüsefer bitiş tarihi
            <input
              type="date"
              value={seyruseferTarihi}
              onChange={(event) =>
                setSeyruseferTarihi(
                  event.target.value
                )
              }
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Son bakım tarihi
            <input
              type="date"
              value={sonBakimTarihi}
              onChange={(event) =>
                setSonBakimTarihi(event.target.value)
              }
              style={inputStyle}
            />
          </label>

          <div
            style={{
              padding: "15px",
              border: "1px solid #BBF7D0",
              borderRadius: "12px",
              backgroundColor: "#F0FDF4",
              alignSelf: "end",
            }}
          >
            <strong
              style={{
                display: "block",
                color: "#166534",
                fontSize: "14px",
              }}
            >
              🔧 Bakım hatırlatması
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "5px",
                color: "#475569",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              Son bakım tarihinden 6 ay sonrası otomatik
              olarak hesaplanır.
            </span>
          </div>

          {hata && (
            <div
              role="alert"
              style={{
                gridColumn: "1 / -1",
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

          <button
            type="submit"
            disabled={yukleniyor}
            style={{
              gridColumn: "1 / -1",
              padding: "15px",
              border: "none",
              borderRadius: "11px",
              backgroundColor: yukleniyor
                ? "#94A3B8"
                : "#2563EB",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 800,
              cursor: yukleniyor
                ? "not-allowed"
                : "pointer",
            }}
          >
            {yukleniyor
              ? "Araç kaydediliyor..."
              : "Aracı Kaydet"}
          </button>
        </form>
      </section>
    </main>
  );
}