"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../../lib/supabase";

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

export default function AracDuzenlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const aracId = params.id;

  const [plaka, setPlaka] = useState("");
  const [aracKategorisi, setAracKategorisi] =
    useState<VehicleCategory>("D");
  const [marka, setMarka] = useState("");
  const [model, setModel] = useState("");
  const [yil, setYil] = useState("");
  const [kilometre, setKilometre] = useState("");
  const [sigortaTarihi, setSigortaTarihi] = useState("");
  const [seyruseferTarihi, setSeyruseferTarihi] = useState("");
  const [sonBakimTarihi, setSonBakimTarihi] = useState("");

  const [sayfaYukleniyor, setSayfaYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");

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
        .select(
          `
          id,
          plaka,
          vehicle_category,
          marka,
          model,
          yil,
          kilometre,
          sigorta_tarihi,
          seyrusefer_tarihi,
          son_bakim_tarihi
        `
        )
        .eq("id", aracId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) {
        setHata(
          "Araç bulunamadı veya bu aracı düzenleme yetkiniz yok."
        );
        setSayfaYukleniyor(false);
        return;
      }

      setPlaka(data.plaka ?? "");
      setAracKategorisi(
        (data.vehicle_category ?? "D") as VehicleCategory
      );
      setMarka(data.marka ?? "");
      setModel(data.model ?? "");
      setYil(data.yil !== null ? String(data.yil) : "");
      setKilometre(
        data.kilometre !== null ? String(data.kilometre) : ""
      );
      setSigortaTarihi(data.sigorta_tarihi ?? "");
      setSeyruseferTarihi(data.seyrusefer_tarihi ?? "");
      setSonBakimTarihi(data.son_bakim_tarihi ?? "");

      setSayfaYukleniyor(false);
    }

    if (aracId) {
      araciGetir();
    }
  }, [aracId, router]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
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
        .update({
          plaka: temizPlaka,
          vehicle_category: aracKategorisi,
          marka: marka.trim(),
          model: model.trim(),
          yil: yil ? Number(yil) : null,
          kilometre: kilometre ? Number(kilometre) : null,
          muayene_tarihi: null,
          sigorta_tarihi: sigortaTarihi || null,
          seyrusefer_tarihi: seyruseferTarihi || null,
          son_bakim_tarihi: sonBakimTarihi || null,
        })
        .eq("id", aracId)
        .eq("user_id", user.id);

      if (error) {
        setHata(error.message);
        return;
      }

      setMesaj("Araç bilgileri başarıyla güncellendi.");

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 700);
    } catch {
      setHata(
        "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
      );
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
          ✏️ Aracı Düzenle
        </h1>

        <p
          style={{
            margin: "0 0 28px",
            color: "#64748B",
            lineHeight: 1.6,
          }}
        >
          Araç bilgilerini güncelleyin. Resmî muayene dönemi,
          plaka ve araç kategorisine göre otomatik bulunacaktır.
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
              onChange={(event) => setPlaka(event.target.value)}
              autoCapitalize="characters"
              placeholder="Örnek: UM 590"
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
              onChange={(event) => setMarka(event.target.value)}
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
              Plakayı veya araç kategorisini değiştirdiğinizde
              Dashboard, resmî KKTC muayene takviminden yeni dönemi
              otomatik olarak bulur.
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
                setSeyruseferTarihi(event.target.value)
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

          {mesaj && (
            <div
              role="status"
              style={{
                gridColumn: "1 / -1",
                padding: "13px",
                borderRadius: "10px",
                border: "1px solid #BBF7D0",
                backgroundColor: "#F0FDF4",
                color: "#166534",
              }}
            >
              {mesaj}
            </div>
          )}

          <button
            type="submit"
            disabled={kaydediliyor}
            style={{
              gridColumn: "1 / -1",
              padding: "15px",
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
        </form>
      </section>
    </main>
  );
}