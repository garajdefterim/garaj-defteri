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
          backgroundColor: "#F8FAFC",
          color: "#0F172A",
          fontFamily: "Arial, Helvetica, sans-serif",
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
        padding: "40px 24px",
        backgroundColor: "#F8FAFC",
        color: "#0F172A",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "28px",
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

          <Link
            href={`/bakim-ekle/${aracId}`}
            style={{
              padding: "12px 18px",
              borderRadius: "10px",
              backgroundColor: "#059669",
              color: "#FFFFFF",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            + Yeni Bakım Ekle
          </Link>
        </div>

        <section
          style={{
            padding: "28px",
            border: "1px solid #E2E8F0",
            borderRadius: "18px",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#0F172A",
              fontSize: "34px",
            }}
          >
            📋 Bakım Geçmişi
          </h1>

          {arac && (
            <div
              style={{
                marginTop: "18px",
                padding: "16px",
                border: "1px solid #E2E8F0",
                borderRadius: "12px",
                backgroundColor: "#F8FAFC",
              }}
            >
              <strong
                style={{
                  display: "block",
                  color: "#0F172A",
                  fontSize: "19px",
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
        </section>

        {hata && (
          <div
            role="alert"
            style={{
              marginTop: "22px",
              padding: "14px",
              border: "1px solid #FECACA",
              borderRadius: "10px",
              backgroundColor: "#FEF2F2",
              color: "#B91C1C",
            }}
          >
            {hata}
          </div>
        )}

        {!hata && kayitlar.length === 0 && (
          <section
            style={{
              marginTop: "22px",
              padding: "30px",
              border: "1px solid #E2E8F0",
              borderRadius: "18px",
              backgroundColor: "#FFFFFF",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#0F172A",
              }}
            >
              Henüz bakım kaydı yok
            </h2>

            <p
              style={{
                color: "#64748B",
                lineHeight: 1.6,
              }}
            >
              Bu araç için ilk bakım kaydınızı ekleyin.
            </p>

            <Link
              href={`/bakim-ekle/${aracId}`}
              style={{
                display: "inline-block",
                marginTop: "8px",
                padding: "12px 18px",
                borderRadius: "10px",
                backgroundColor: "#059669",
                color: "#FFFFFF",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              + İlk Bakımı Ekle
            </Link>
          </section>
        )}

        {!hata && kayitlar.length > 0 && (
          <>
            <section
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "16px",
                marginTop: "22px",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "14px",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <span
                  style={{
                    display: "block",
                    color: "#64748B",
                    fontSize: "14px",
                  }}
                >
                  Toplam bakım kaydı
                </span>

                <strong
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "#0F172A",
                    fontSize: "25px",
                  }}
                >
                  {kayitlar.length}
                </strong>
              </div>

              <div
                style={{
                  padding: "20px",
                  border: "1px solid #E2E8F0",
                  borderRadius: "14px",
                  backgroundColor: "#FFFFFF",
                }}
              >
                <span
                  style={{
                    display: "block",
                    color: "#64748B",
                    fontSize: "14px",
                  }}
                >
                  Toplam bakım masrafı
                </span>

                <strong
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "#0F172A",
                    fontSize: "25px",
                  }}
                >
                  {tutarFormatla(toplamTutar)}
                </strong>
              </div>
            </section>

            <section
              style={{
                display: "grid",
                gap: "16px",
                marginTop: "22px",
              }}
            >
              {kayitlar.map((kayit) => (
                <article
                  key={kayit.id}
                  style={{
                    padding: "24px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "16px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
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
                      <h2
                        style={{
                          margin: 0,
                          color: "#0F172A",
                          fontSize: "22px",
                        }}
                      >
                        {kayit.baslik}
                      </h2>

                      <span
                        style={{
                          display: "block",
                          marginTop: "7px",
                          color: "#2563EB",
                          fontWeight: 700,
                        }}
                      >
                        {tarihFormatla(kayit.tarih)}
                      </span>
                    </div>

                    <strong
                      style={{
                        color: "#059669",
                        fontSize: "18px",
                      }}
                    >
                      {tutarFormatla(kayit.tutar)}
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: "12px",
                      marginTop: "18px",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "10px",
                        backgroundColor: "#F8FAFC",
                      }}
                    >
                      <strong style={{ color: "#0F172A" }}>
                        Kilometre:
                      </strong>{" "}
                      <span style={{ color: "#64748B" }}>
                        {kilometreFormatla(kayit.kilometre)}
                      </span>
                    </div>
                  </div>

                  {kayit.aciklama && (
                    <p
                      style={{
                        margin: "18px 0 0",
                        color: "#475569",
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
                      gap: "12px",
                      flexWrap: "wrap",
                      marginTop: "22px",
                    }}
                  >
                    <Link
                      href={`/bakim-duzenle/${kayit.id}`}
                      style={{
                        padding: "10px 17px",
                        borderRadius: "10px",
                        backgroundColor: "#2563EB",
                        color: "#FFFFFF",
                        fontWeight: 700,
                        textDecoration: "none",
                      }}
                    >
                      ✏️ Düzenle
                    </Link>

                    <button
                      type="button"
                      onClick={() => setSilinecekKayit(kayit)}
                      disabled={silinenKayitId === kayit.id}
                      style={{
                        padding: "10px 17px",
                        border: "none",
                        borderRadius: "10px",
                        backgroundColor:
                          silinenKayitId === kayit.id
                            ? "#94A3B8"
                            : "#DC2626",
                        color: "#FFFFFF",
                        fontWeight: 700,
                        cursor:
                          silinenKayitId === kayit.id
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {silinenKayitId === kayit.id
                        ? "Siliniyor..."
                        : "🗑️ Sil"}
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
            if (!silinenKayitId) {
              setSilinecekKayit(null);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            backgroundColor: "rgba(15, 23, 42, 0.65)",
            backdropFilter: "blur(4px)",
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
              padding: "30px",
              border: "1px solid #E2E8F0",
              borderRadius: "20px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 30px 80px rgba(15, 23, 42, 0.35)",
            }}
          >
            <div
              style={{
                width: "54px",
                height: "54px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "16px",
                backgroundColor: "#FEF2F2",
                fontSize: "27px",
              }}
            >
              🗑️
            </div>

            <h2
              id="bakim-silme-basligi"
              style={{
                margin: "22px 0 10px",
                color: "#0F172A",
                fontSize: "25px",
              }}
            >
              Bakım kaydını silmek istiyor musunuz?
            </h2>

            <p
              style={{
                margin: 0,
                color: "#64748B",
                lineHeight: 1.6,
              }}
            >
              Bu işlem geri alınamaz. Bakım kaydı kalıcı olarak silinecektir.
            </p>

            <div
              style={{
                marginTop: "20px",
                padding: "16px",
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
                {silinecekKayit.baslik}
              </strong>

              <span
                style={{
                  display: "block",
                  marginTop: "5px",
                  color: "#2563EB",
                  fontWeight: 700,
                }}
              >
                {tarihFormatla(silinecekKayit.tarih)}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "26px",
              }}
            >
              <button
                type="button"
                onClick={() => setSilinecekKayit(null)}
                disabled={silinenKayitId !== null}
                style={{
                  padding: "12px 18px",
                  border: "1px solid #CBD5E1",
                  borderRadius: "10px",
                  backgroundColor: "#FFFFFF",
                  color: "#334155",
                  fontWeight: 700,
                  cursor:
                    silinenKayitId !== null ? "not-allowed" : "pointer",
                }}
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={bakimKaydiSil}
                disabled={silinenKayitId !== null}
                style={{
                  padding: "12px 18px",
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor:
                    silinenKayitId !== null ? "#94A3B8" : "#DC2626",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  cursor:
                    silinenKayitId !== null ? "not-allowed" : "pointer",
                }}
              >
                {silinenKayitId !== null
                  ? "Kayıt siliniyor..."
                  : "Bakım Kaydını Sil"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}