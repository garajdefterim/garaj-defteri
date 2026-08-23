"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Vehicle = {
  id: string;
  marka: string;
  model: string;
  plaka: string;
};

type MaintenanceRecord = {
  id: string;
  baslik: string;
  aciklama: string | null;
  tarih: string;
  kilometre: number | null;
  tutar: number | null;
  created_at: string;
};

export default function BakimGecmisiPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const aracId = params.id;

  const [arac, setArac] = useState<Vehicle | null>(null);
  const [kayitlar, setKayitlar] = useState<MaintenanceRecord[]>([]);
  const [silinecekKayit, setSilinecekKayit] =
    useState<MaintenanceRecord | null>(null);
  const [silinenKayitId, setSilinenKayitId] = useState<string | null>(null);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");

  useEffect(() => {
    async function verileriGetir() {
      setHata("");
      setYukleniyor(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push("/giris");
        router.refresh();
        return;
      }

      const { data: aracData, error: aracError } = await supabase
        .from("vehicles")
        .select("id, marka, model, plaka")
        .eq("id", aracId)
        .eq("user_id", user.id)
        .single();

      if (aracError || !aracData) {
        setHata("Araç bulunamadı veya bu araca erişim yetkiniz yok.");
        setYukleniyor(false);
        return;
      }

      const { data: kayitData, error: kayitError } = await supabase
        .from("maintenance_records")
        .select(
          `
          id,
          baslik,
          aciklama,
          tarih,
          kilometre,
          tutar,
          created_at
        `
        )
        .eq("vehicle_id", aracId)
        .eq("user_id", user.id)
        .order("tarih", { ascending: false });

      if (kayitError) {
        setHata(kayitError.message);
        setYukleniyor(false);
        return;
      }

      setArac(aracData);
      setKayitlar(kayitData ?? []);
      setYukleniyor(false);
    }

    if (aracId) {
      verileriGetir();
    }
  }, [aracId, router]);

  function tarihFormatla(tarih: string) {
    return new Intl.DateTimeFormat("tr-TR").format(
      new Date(`${tarih}T00:00:00`)
    );
  }

  function kilometreFormatla(kilometre: number | null) {
    if (kilometre === null) {
      return "Belirtilmedi";
    }

    return `${new Intl.NumberFormat("tr-TR").format(kilometre)} km`;
  }

  function tutarFormatla(tutar: number | null) {
    if (tutar === null) {
      return "Belirtilmedi";
    }

    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(tutar);
  }

  async function bakimKaydiSil() {
    if (!silinecekKayit) {
      return;
    }

    setHata("");
    setSilinenKayitId(silinecekKayit.id);

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

      const { error } = await supabase
        .from("maintenance_records")
        .delete()
        .eq("id", silinecekKayit.id)
        .eq("vehicle_id", aracId)
        .eq("user_id", user.id);

      if (error) {
        setHata(error.message);
        return;
      }

      setKayitlar((mevcutKayitlar) =>
        mevcutKayitlar.filter((kayit) => kayit.id !== silinecekKayit.id)
      );

      setSilinecekKayit(null);
    } catch {
      setHata("Bakım kaydı silinirken beklenmeyen bir hata oluştu.");
    } finally {
      setSilinenKayitId(null);
    }
  }

  const toplamTutar = kayitlar.reduce(
    (toplam, kayit) => toplam + (kayit.tutar ?? 0),
    0
  );

  if (yukleniyor) {
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
        Bakım kayıtları yükleniyor...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 24px 64px",
        backgroundColor: "#F7F8FA",
        color: "#111827",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div style={{ width: "100%", maxWidth: "1000px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "18px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <div>
            <Link
              href={`/arac/${aracId}`}
              style={{
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
              Bakım geçmişi
            </h1>
            <p
              style={{
                margin: "9px 0 0",
                color: "#6B7280",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              Aracınız için kaydedilen bakım işlemlerini ve masrafları görüntüleyin.
            </p>
          </div>

          <Link
            href={`/bakim-ekle/${aracId}`}
            style={{
              minHeight: "46px",
              padding: "0 16px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "9px",
              backgroundColor: "#1D4ED8",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Yeni Bakım Ekle
          </Link>
        </header>

        {arac && (
          <section
            style={{
              padding: "18px 20px",
              border: "1px solid #E3E7EC",
              borderRadius: "14px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 1px 2px rgba(15,23,42,.03)",
            }}
          >
            <strong style={{ display: "block", fontSize: "16px", fontWeight: 650 }}>
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
          </section>
        )}

        {hata && (
          <div
            role="alert"
            style={{
              marginTop: "20px",
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

        {!hata && kayitlar.length === 0 && (
          <section
            style={{
              marginTop: "20px",
              padding: "30px",
              border: "1px solid #E3E7EC",
              borderRadius: "14px",
              backgroundColor: "#FFFFFF",
              textAlign: "center",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "20px" }}>Henüz bakım kaydı yok</h2>
            <p style={{ margin: "8px 0 18px", color: "#6B7280", lineHeight: 1.6 }}>
              Bu araç için ilk bakım kaydınızı ekleyin.
            </p>
            <Link
              href={`/bakim-ekle/${aracId}`}
              style={{
                minHeight: "44px",
                padding: "0 16px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "9px",
                backgroundColor: "#1D4ED8",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              İlk Bakımı Ekle
            </Link>
          </section>
        )}

        {!hata && kayitlar.length > 0 && (
          <>
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
                marginTop: "20px",
              }}
            >
              {[
                ["Toplam bakım kaydı", String(kayitlar.length)],
                ["Toplam bakım masrafı", tutarFormatla(toplamTutar)],
              ].map(([baslik, deger]) => (
                <div
                  key={baslik}
                  style={{
                    padding: "20px",
                    border: "1px solid #E3E7EC",
                    borderRadius: "14px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 1px 2px rgba(15,23,42,.03)",
                  }}
                >
                  <span style={{ display: "block", color: "#6B7280", fontSize: "13px" }}>
                    {baslik}
                  </span>
                  <strong
                    style={{
                      display: "block",
                      marginTop: "7px",
                      color: "#111827",
                      fontSize: "24px",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    {deger}
                  </strong>
                </div>
              ))}
            </section>

            <section style={{ display: "grid", gap: "14px", marginTop: "20px" }}>
              {kayitlar.map((kayit) => (
                <article
                  key={kayit.id}
                  style={{
                    padding: "22px",
                    border: "1px solid #E3E7EC",
                    borderRadius: "14px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 1px 2px rgba(15,23,42,.03)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <h2 style={{ margin: 0, fontSize: "20px", letterSpacing: "-0.3px" }}>
                        {kayit.baslik}
                      </h2>
                      <span
                        style={{
                          display: "block",
                          marginTop: "6px",
                          color: "#6B7280",
                          fontSize: "13px",
                          fontWeight: 600,
                        }}
                      >
                        {tarihFormatla(kayit.tarih)}
                      </span>
                    </div>
                    <strong style={{ color: "#111827", fontSize: "17px" }}>
                      {tutarFormatla(kayit.tutar)}
                    </strong>
                  </div>

                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px 13px",
                      border: "1px solid #E5E7EB",
                      borderRadius: "9px",
                      backgroundColor: "#FAFAFA",
                      fontSize: "14px",
                    }}
                  >
                    <strong style={{ color: "#374151" }}>Kilometre: </strong>
                    <span style={{ color: "#6B7280" }}>
                      {kilometreFormatla(kayit.kilometre)}
                    </span>
                  </div>

                  {kayit.aciklama && (
                    <p
                      style={{
                        margin: "16px 0 0",
                        color: "#4B5563",
                        fontSize: "14px",
                        lineHeight: 1.7,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {kayit.aciklama}
                    </p>
                  )}

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginTop: "20px",
                    }}
                  >
                    <Link
                      href={`/bakim-duzenle/${kayit.id}`}
                      style={{
                        minHeight: "42px",
                        padding: "0 14px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "9px",
                        backgroundColor: "#1D4ED8",
                        color: "#FFFFFF",
                        fontSize: "14px",
                        fontWeight: 650,
                        textDecoration: "none",
                      }}
                    >
                      Düzenle
                    </Link>

                    <button
                      type="button"
                      onClick={() => setSilinecekKayit(kayit)}
                      disabled={silinenKayitId === kayit.id}
                      style={{
                        minHeight: "42px",
                        padding: "0 14px",
                        border: "1px solid #F1C7C7",
                        borderRadius: "9px",
                        backgroundColor:
                          silinenKayitId === kayit.id ? "#AAB2BD" : "#FFFFFF",
                        color:
                          silinenKayitId === kayit.id ? "#FFFFFF" : "#B42318",
                        fontSize: "14px",
                        fontWeight: 650,
                        cursor:
                          silinenKayitId === kayit.id ? "not-allowed" : "pointer",
                      }}
                    >
                      {silinenKayitId === kayit.id ? "Siliniyor..." : "Sil"}
                    </button>
                  </div>
                </article>
              ))}
            </section>
          </>
        )}
      </div>

      {silinecekKayit && (
        <div
          role="presentation"
          onClick={() => {
            if (!silinenKayitId) setSilinecekKayit(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            backgroundColor: "rgba(15, 23, 42, 0.52)",
            backdropFilter: "blur(3px)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="bakim-silme-basligi"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "460px",
              padding: "28px",
              border: "1px solid #E3E7EC",
              borderRadius: "14px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 18px 50px rgba(15,23,42,.16)",
            }}
          >
            <h2
              id="bakim-silme-basligi"
              style={{ margin: 0, fontSize: "23px", letterSpacing: "-0.4px" }}
            >
              Bakım kaydını sil?
            </h2>
            <p
              style={{
                margin: "10px 0 0",
                color: "#6B7280",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              Bu işlem geri alınamaz. Bakım kaydı kalıcı olarak silinecektir.
            </p>

            <div
              style={{
                marginTop: "18px",
                padding: "14px 15px",
                border: "1px solid #E3E7EC",
                borderRadius: "10px",
                backgroundColor: "#F8FAFC",
              }}
            >
              <strong style={{ display: "block", fontSize: "15px" }}>
                {silinecekKayit.baslik}
              </strong>
              <span
                style={{
                  display: "block",
                  marginTop: "4px",
                  color: "#6B7280",
                  fontSize: "13px",
                }}
              >
                {tarihFormatla(silinecekKayit.tarih)}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "24px",
              }}
            >
              <button
                type="button"
                onClick={() => setSilinecekKayit(null)}
                disabled={silinenKayitId !== null}
                style={{
                  minHeight: "44px",
                  padding: "0 16px",
                  border: "1px solid #D7DCE3",
                  borderRadius: "9px",
                  backgroundColor: "#FFFFFF",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: 650,
                  cursor: silinenKayitId !== null ? "not-allowed" : "pointer",
                }}
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={bakimKaydiSil}
                disabled={silinenKayitId !== null}
                style={{
                  minHeight: "44px",
                  padding: "0 16px",
                  border: "none",
                  borderRadius: "9px",
                  backgroundColor:
                    silinenKayitId !== null ? "#AAB2BD" : "#B42318",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: silinenKayitId !== null ? "not-allowed" : "pointer",
                }}
              >
                {silinenKayitId !== null ? "Kayıt siliniyor..." : "Bakım Kaydını Sil"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}