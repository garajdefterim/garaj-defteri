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
    height: "48px",
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

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F7F8FA",
        padding: "32px 24px 64px",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        color: "#111827",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "960px",
          margin: "0 auto",
        }}
      >
        <header style={{ marginBottom: "32px" }}>
          <Link
            href={`/arac/${aracId}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
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
              fontSize: "clamp(30px, 6vw, 38px)",
              lineHeight: 1.15,
              fontWeight: 760,
              letterSpacing: "-0.9px",
            }}
          >
            Aracı düzenle
          </h1>

          <p
            style={{
              margin: "9px 0 0",
              maxWidth: "680px",
              color: "#6B7280",
              fontSize: "15px",
              lineHeight: 1.6,
            }}
          >
            Araç bilgilerini güncelleyin. Muayene dönemi plaka ve araç
            kategorisine göre otomatik olarak yeniden eşleştirilir.
          </p>
        </header>

        <section
          style={{
            width: "100%",
            backgroundColor: "#FFFFFF",
            border: "1px solid #E3E7EC",
            borderRadius: "14px",
            padding: "28px",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
            boxSizing: "border-box",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(260px, 1fr))",
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
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {aracKategorileri.map((kategori) => (
                  <option key={kategori.value} value={kategori.value}>
                    {kategori.value} — {kategori.baslik}
                  </option>
                ))}
              </select>
            </label>

            <div
              style={{
                gridColumn: "1 / -1",
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
                  fontSize: "14px",
                  fontWeight: 650,
                }}
              >
                {aracKategorisi} — {seciliKategori?.baslik}
              </strong>
              <span
                style={{
                  display: "block",
                  marginTop: "5px",
                  color: "#6B7280",
                  fontSize: "13px",
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

            <div
              style={{
                gridColumn: "1 / -1",
                padding: "15px",
                border: "1px solid #E3E7EC",
                borderRadius: "10px",
                backgroundColor: "#FAFAFA",
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "#111827",
                  fontSize: "14px",
                  fontWeight: 650,
                }}
              >
                Muayene tarihi otomatik belirlenir
              </strong>
              <p
                style={{
                  margin: "6px 0 0",
                  color: "#6B7280",
                  fontSize: "13px",
                  lineHeight: 1.55,
                }}
              >
                Plaka veya araç kategorisi değiştiğinde sistem resmî KKTC
                muayene takviminden yeni dönemi otomatik olarak eşleştirir.
              </p>
            </div>

            <label style={labelStyle}>
              Sigorta bitiş tarihi
              <input
                type="date"
                value={sigortaTarihi}
                onChange={(event) => setSigortaTarihi(event.target.value)}
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
                padding: "14px 15px",
                border: "1px solid #DDE3EA",
                borderRadius: "10px",
                backgroundColor: "#F8FAFC",
                alignSelf: "end",
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "#374151",
                  fontSize: "13px",
                  fontWeight: 650,
                }}
              >
                Bakım hatırlatması
              </strong>
              <span
                style={{
                  display: "block",
                  marginTop: "5px",
                  color: "#6B7280",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                Son bakım tarihinden 6 ay sonrası otomatik olarak hesaplanır.
              </span>
            </div>

            {hata && (
              <div
                role="alert"
                style={{
                  gridColumn: "1 / -1",
                  padding: "12px 13px",
                  borderRadius: "8px",
                  border: "1px solid #F1C7C7",
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
                  gridColumn: "1 / -1",
                  padding: "12px 13px",
                  borderRadius: "8px",
                  border: "1px solid #C6E7D2",
                  backgroundColor: "#F7FCF9",
                  color: "#276749",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                {mesaj}
              </div>
            )}

            <div
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
      </div>
    </main>
  );
}