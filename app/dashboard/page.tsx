"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Vehicle = {
  id: string;
  plaka: string;
  marka: string;
  model: string;
  yil: number | null;
  kilometre: number | null;
  muayene_tarihi: string | null;
  sigorta_tarihi: string | null;
  seyrusefer_tarihi: string | null;
  son_bakim_tarihi: string | null;
};

type TarihDurumu = {
  yazi: string;
  arkaPlan: string;
  renk: string;
  kenarlik: string;
};

type Bildirim = {
  id: string;
  aracId: string;
  baslik: string;
  aciklama: string;
  ikon: string;
  seviye: "kritik" | "uyari";
};

export default function DashboardPage() {
  const router = useRouter();

  const [araclar, setAraclar] = useState<Vehicle[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [silinenAracId, setSilinenAracId] = useState<string | null>(null);
  const [silinecekArac, setSilinecekArac] = useState<Vehicle | null>(null);
  const [hata, setHata] = useState("");

  useEffect(() => {
    async function araclariGetir() {
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

      const { data, error } = await supabase
        .from("vehicles")
        .select(
          `
          id,
          plaka,
          marka,
          model,
          yil,
          kilometre,
          muayene_tarihi,
          sigorta_tarihi,
          seyrusefer_tarihi,
          son_bakim_tarihi
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        setHata(error.message);
        setYukleniyor(false);
        return;
      }

      setAraclar(data ?? []);
      setYukleniyor(false);
    }

    araclariGetir();
  }, [router]);

  function tarihFormatla(tarih: string | null) {
    if (!tarih) {
      return "Belirtilmedi";
    }

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

  function kalanGunHesapla(tarih: string) {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);

    const hedefTarih = new Date(`${tarih}T00:00:00`);
    hedefTarih.setHours(0, 0, 0, 0);

    const fark = hedefTarih.getTime() - bugun.getTime();

    return Math.ceil(fark / (1000 * 60 * 60 * 24));
  }

  function gecenGunHesapla(tarih: string) {
    return Math.abs(kalanGunHesapla(tarih));
  }

  function tarihDurumuGetir(tarih: string | null): TarihDurumu {
    if (!tarih) {
      return {
        yazi: "Tarih girilmedi",
        arkaPlan: "#F1F5F9",
        renk: "#64748B",
        kenarlik: "#CBD5E1",
      };
    }

    const kalanGun = kalanGunHesapla(tarih);

    if (kalanGun < 0) {
      return {
        yazi: `${Math.abs(kalanGun)} gün gecikti`,
        arkaPlan: "#FEF2F2",
        renk: "#B91C1C",
        kenarlik: "#FECACA",
      };
    }

    if (kalanGun === 0) {
      return {
        yazi: "Bugün sona eriyor",
        arkaPlan: "#FEF2F2",
        renk: "#B91C1C",
        kenarlik: "#FECACA",
      };
    }

    if (kalanGun <= 7) {
      return {
        yazi: `${kalanGun} gün kaldı`,
        arkaPlan: "#FEF2F2",
        renk: "#B91C1C",
        kenarlik: "#FECACA",
      };
    }

    if (kalanGun <= 30) {
      return {
        yazi: `${kalanGun} gün kaldı`,
        arkaPlan: "#FFF7ED",
        renk: "#C2410C",
        kenarlik: "#FED7AA",
      };
    }

    return {
      yazi: `${kalanGun} gün kaldı`,
      arkaPlan: "#F0FDF4",
      renk: "#166534",
      kenarlik: "#BBF7D0",
    };
  }

  const bildirimler = useMemo<Bildirim[]>(() => {
    const yeniBildirimler: Bildirim[] = [];

    function tarihBildirimiEkle(
      arac: Vehicle,
      tur: string,
      tarih: string | null,
      ikon: string
    ) {
      if (!tarih) {
        return;
      }

      const kalanGun = kalanGunHesapla(tarih);
      const aracAdi = `${arac.marka} ${arac.model} – ${arac.plaka}`;

      if (kalanGun < 0) {
        yeniBildirimler.push({
          id: `${arac.id}-${tur}`,
          aracId: arac.id,
          baslik: `${tur} süresi geçti`,
          aciklama: `${aracAdi}: ${Math.abs(kalanGun)} gün gecikti.`,
          ikon,
          seviye: "kritik",
        });
        return;
      }

      if (kalanGun === 0) {
        yeniBildirimler.push({
          id: `${arac.id}-${tur}`,
          aracId: arac.id,
          baslik: `${tur} bugün sona eriyor`,
          aciklama: aracAdi,
          ikon,
          seviye: "kritik",
        });
        return;
      }

      if (kalanGun <= 30) {
        yeniBildirimler.push({
          id: `${arac.id}-${tur}`,
          aracId: arac.id,
          baslik: `${tur} yaklaşıyor`,
          aciklama: `${aracAdi}: ${kalanGun} gün kaldı.`,
          ikon,
          seviye: kalanGun <= 7 ? "kritik" : "uyari",
        });
      }
    }

    araclar.forEach((arac) => {
      tarihBildirimiEkle(
        arac,
        "Muayene",
        arac.muayene_tarihi,
        "📅"
      );

      tarihBildirimiEkle(
        arac,
        "Sigorta",
        arac.sigorta_tarihi,
        "🛡️"
      );

      tarihBildirimiEkle(
        arac,
        "Seyrüsefer",
        arac.seyrusefer_tarihi,
        "📄"
      );

      if (arac.son_bakim_tarihi) {
        const bakimdanSonraGecenGun = gecenGunHesapla(
          arac.son_bakim_tarihi
        );

        if (
          kalanGunHesapla(arac.son_bakim_tarihi) < 0 &&
          bakimdanSonraGecenGun >= 180
        ) {
          yeniBildirimler.push({
            id: `${arac.id}-bakim`,
            aracId: arac.id,
            baslik: "Bakım kontrolü öneriliyor",
            aciklama: `${arac.marka} ${arac.model} – ${arac.plaka}: Son bakımın üzerinden ${bakimdanSonraGecenGun} gün geçti.`,
            ikon: "🔧",
            seviye: "uyari",
          });
        }
      }
    });

    return yeniBildirimler.sort((a, b) => {
      if (a.seviye === b.seviye) {
        return 0;
      }

      return a.seviye === "kritik" ? -1 : 1;
    });
  }, [araclar]);

  async function cikisYap() {
    setHata("");

    const { error } = await supabase.auth.signOut();

    if (error) {
      setHata("Çıkış yapılırken bir hata oluştu.");
      return;
    }

    router.push("/giris");
    router.refresh();
  }

  async function aracSil() {
    if (!silinecekArac) {
      return;
    }

    setHata("");
    setSilinenAracId(silinecekArac.id);

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
        .from("vehicles")
        .delete()
        .eq("id", silinecekArac.id)
        .eq("user_id", user.id);

      if (error) {
        setHata(error.message);
        return;
      }

      setAraclar((mevcutAraclar) =>
        mevcutAraclar.filter((arac) => arac.id !== silinecekArac.id)
      );

      setSilinecekArac(null);
    } catch {
      setHata("Araç silinirken beklenmeyen bir hata oluştu.");
    } finally {
      setSilinenAracId(null);
    }
  }

  function TarihSatiri({
    baslik,
    tarih,
  }: {
    baslik: string;
    tarih: string | null;
  }) {
    const durum = tarihDurumuGetir(tarih);

    return (
      <div
        style={{
          padding: "13px",
          borderRadius: "12px",
          backgroundColor: "#F8FAFC",
          border: "1px solid #E2E8F0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <strong
              style={{
                display: "block",
                marginBottom: "4px",
                color: "#0F172A",
              }}
            >
              {baslik}
            </strong>

            <span
              style={{
                color: "#64748B",
                fontSize: "14px",
              }}
            >
              {tarihFormatla(tarih)}
            </span>
          </div>

          <span
            style={{
              display: "inline-block",
              padding: "6px 10px",
              borderRadius: "999px",
              backgroundColor: durum.arkaPlan,
              color: durum.renk,
              border: `1px solid ${durum.kenarlik}`,
              fontSize: "13px",
              fontWeight: 800,
              whiteSpace: "nowrap",
            }}
          >
            {durum.yazi}
          </span>
        </div>
      </div>
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
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "36px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#0F172A",
                fontSize: "38px",
              }}
            >
              🚗 Garaj Defteri
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "#64748B",
                fontSize: "18px",
              }}
            >
              Araçlarınızı ve önemli tarihlerinizi yönetin.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/arac-ekle"
              style={{
                display: "inline-block",
                padding: "13px 20px",
                borderRadius: "10px",
                backgroundColor: "#2563EB",
                color: "#FFFFFF",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              + Araç Ekle
            </Link>

            <button
              type="button"
              onClick={cikisYap}
              style={{
                padding: "13px 20px",
                borderRadius: "10px",
                border: "1px solid #CBD5E1",
                backgroundColor: "#FFFFFF",
                color: "#334155",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Çıkış Yap
            </button>
          </div>
        </header>

        {hata && (
          <div
            role="alert"
            style={{
              padding: "14px",
              marginBottom: "24px",
              borderRadius: "10px",
              border: "1px solid #FECACA",
              backgroundColor: "#FEF2F2",
              color: "#B91C1C",
            }}
          >
            {hata}
          </div>
        )}

        {!yukleniyor && araclar.length > 0 && (
          <section
            style={{
              marginBottom: "30px",
              padding: "24px",
              border: "1px solid #E2E8F0",
              borderRadius: "18px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "14px",
                flexWrap: "wrap",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    color: "#0F172A",
                    fontSize: "25px",
                  }}
                >
                  🔔 Bildirim Merkezi
                </h2>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: "#64748B",
                  }}
                >
                  Yaklaşan ve geciken işlemleriniz.
                </p>
              </div>

              {bildirimler.length > 0 && (
                <span
                  style={{
                    padding: "7px 12px",
                    borderRadius: "999px",
                    backgroundColor: "#FEF2F2",
                    color: "#B91C1C",
                    border: "1px solid #FECACA",
                    fontSize: "14px",
                    fontWeight: 800,
                  }}
                >
                  {bildirimler.length} uyarı
                </span>
              )}
            </div>

            {bildirimler.length === 0 ? (
              <div
                style={{
                  marginTop: "20px",
                  padding: "17px",
                  border: "1px solid #BBF7D0",
                  borderRadius: "12px",
                  backgroundColor: "#F0FDF4",
                  color: "#166534",
                  fontWeight: 700,
                }}
              >
                ✅ Şu anda yaklaşan veya geciken bir işleminiz yok.
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: "12px",
                  marginTop: "20px",
                }}
              >
                {bildirimler.map((bildirim) => {
                  const kritik = bildirim.seviye === "kritik";

                  return (
                    <Link
                      key={bildirim.id}
                      href={`/arac-duzenle/${bildirim.aracId}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        padding: "16px",
                        border: kritik
                          ? "1px solid #FECACA"
                          : "1px solid #FED7AA",
                        borderRadius: "13px",
                        backgroundColor: kritik
                          ? "#FEF2F2"
                          : "#FFF7ED",
                        color: "#0F172A",
                        textDecoration: "none",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          fontSize: "27px",
                        }}
                      >
                        {bildirim.ikon}
                      </span>

                      <div style={{ flex: 1 }}>
                        <strong
                          style={{
                            display: "block",
                            color: kritik ? "#B91C1C" : "#C2410C",
                            fontSize: "16px",
                          }}
                        >
                          {bildirim.baslik}
                        </strong>

                        <span
                          style={{
                            display: "block",
                            marginTop: "5px",
                            color: "#475569",
                            lineHeight: 1.5,
                          }}
                        >
                          {bildirim.aciklama}
                        </span>
                      </div>

                      <span
                        aria-hidden="true"
                        style={{
                          color: "#64748B",
                          fontSize: "20px",
                        }}
                      >
                        →
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {yukleniyor && (
          <section
            style={{
              padding: "30px",
              border: "1px solid #E2E8F0",
              borderRadius: "18px",
              backgroundColor: "#FFFFFF",
              color: "#475569",
            }}
          >
            Araçlar yükleniyor...
          </section>
        )}

        {!yukleniyor && !hata && araclar.length === 0 && (
          <section
            style={{
              padding: "34px",
              border: "1px solid #E2E8F0",
              borderRadius: "18px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#0F172A",
              }}
            >
              Henüz araç eklemediniz
            </h2>

            <p
              style={{
                marginBottom: "22px",
                color: "#64748B",
                lineHeight: 1.6,
              }}
            >
              İlk aracınızı ekleyerek muayene, sigorta, seyrüsefer ve bakım
              tarihlerini takip etmeye başlayın.
            </p>

            <Link
              href="/arac-ekle"
              style={{
                display: "inline-block",
                padding: "13px 20px",
                borderRadius: "10px",
                backgroundColor: "#2563EB",
                color: "#FFFFFF",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              + İlk Aracımı Ekle
            </Link>
          </section>
        )}

        {!yukleniyor && araclar.length > 0 && (
          <section>
            <h2
              style={{
                margin: "0 0 20px",
                color: "#0F172A",
                fontSize: "26px",
              }}
            >
              Araçlarım
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "20px",
              }}
            >
              {araclar.map((arac) => (
                <article
                  key={arac.id}
                  style={{
                    padding: "26px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "18px",
                    backgroundColor: "#FFFFFF",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "16px",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          color: "#0F172A",
                          fontSize: "23px",
                        }}
                      >
                        {arac.marka} {arac.model}
                      </h3>

                      <p
                        style={{
                          margin: "8px 0 0",
                          color: "#2563EB",
                          fontSize: "18px",
                          fontWeight: 800,
                        }}
                      >
                        {arac.plaka}
                      </p>
                    </div>

                    <span aria-hidden="true" style={{ fontSize: "30px" }}>
                      🚘
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px",
                      marginTop: "22px",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px",
                        border: "1px solid #E2E8F0",
                        borderRadius: "11px",
                        backgroundColor: "#F8FAFC",
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          marginBottom: "4px",
                          color: "#0F172A",
                        }}
                      >
                        Yıl
                      </strong>

                      <span style={{ color: "#64748B" }}>
                        {arac.yil ?? "Belirtilmedi"}
                      </span>
                    </div>

                    <div
                      style={{
                        padding: "12px",
                        border: "1px solid #E2E8F0",
                        borderRadius: "11px",
                        backgroundColor: "#F8FAFC",
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          marginBottom: "4px",
                          color: "#0F172A",
                        }}
                      >
                        Kilometre
                      </strong>

                      <span style={{ color: "#64748B" }}>
                        {kilometreFormatla(arac.kilometre)}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: "10px",
                      marginTop: "14px",
                    }}
                  >
                    <TarihSatiri
                      baslik="Muayene"
                      tarih={arac.muayene_tarihi}
                    />

                    <TarihSatiri
                      baslik="Sigorta"
                      tarih={arac.sigorta_tarihi}
                    />

                    <TarihSatiri
                      baslik="Seyrüsefer"
                      tarih={arac.seyrusefer_tarihi}
                    />

                    <TarihSatiri
                      baslik="Son bakım"
                      tarih={arac.son_bakim_tarihi}
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(140px, 1fr))",
                      gap: "10px",
                      marginTop: "24px",
                    }}
                  >
                    <Link
                      href={`/bakim-ekle/${arac.id}`}
                      style={{
                        padding: "11px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#059669",
                        color: "#FFFFFF",
                        textAlign: "center",
                        textDecoration: "none",
                        fontWeight: 700,
                      }}
                    >
                      🔧 Bakım Ekle
                    </Link>

                    <Link
                      href={`/bakim-gecmisi/${arac.id}`}
                      style={{
                        padding: "11px 14px",
                        border: "1px solid #A5B4FC",
                        borderRadius: "10px",
                        backgroundColor: "#EEF2FF",
                        color: "#3730A3",
                        textAlign: "center",
                        textDecoration: "none",
                        fontWeight: 700,
                      }}
                    >
                      📋 Bakım Geçmişi
                    </Link>

                    <Link
                      href={`/arac-duzenle/${arac.id}`}
                      style={{
                        padding: "11px 14px",
                        borderRadius: "10px",
                        backgroundColor: "#2563EB",
                        color: "#FFFFFF",
                        textAlign: "center",
                        textDecoration: "none",
                        fontWeight: 700,
                      }}
                    >
                      ✏️ Düzenle
                    </Link>

                    <button
                      type="button"
                      onClick={() => setSilinecekArac(arac)}
                      disabled={silinenAracId === arac.id}
                      style={{
                        padding: "11px 14px",
                        border: "none",
                        borderRadius: "10px",
                        backgroundColor:
                          silinenAracId === arac.id ? "#94A3B8" : "#DC2626",
                        color: "#FFFFFF",
                        fontWeight: 700,
                        cursor:
                          silinenAracId === arac.id
                            ? "not-allowed"
                            : "pointer",
                      }}
                    >
                      {silinenAracId === arac.id
                        ? "Siliniyor..."
                        : "🗑️ Sil"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>

      {silinecekArac && (
        <div
          role="presentation"
          onClick={() => {
            if (!silinenAracId) {
              setSilinecekArac(null);
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
            aria-labelledby="silme-basligi"
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
              id="silme-basligi"
              style={{
                margin: "22px 0 10px",
                color: "#0F172A",
                fontSize: "25px",
              }}
            >
              Bu aracı silmek istiyor musunuz?
            </h2>

            <p
              style={{
                margin: 0,
                color: "#64748B",
                lineHeight: 1.6,
              }}
            >
              Bu işlem geri alınamaz. Araca bağlı bakım kayıtları da kalıcı
              olarak silinecektir.
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
                {silinecekArac.marka} {silinecekArac.model}
              </strong>

              <span
                style={{
                  display: "block",
                  marginTop: "5px",
                  color: "#2563EB",
                  fontWeight: 800,
                }}
              >
                {silinecekArac.plaka}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "12px",
                marginTop: "26px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => setSilinecekArac(null)}
                disabled={silinenAracId !== null}
                style={{
                  padding: "12px 18px",
                  border: "1px solid #CBD5E1",
                  borderRadius: "10px",
                  backgroundColor: "#FFFFFF",
                  color: "#334155",
                  fontWeight: 700,
                  cursor:
                    silinenAracId !== null ? "not-allowed" : "pointer",
                }}
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={aracSil}
                disabled={silinenAracId !== null}
                style={{
                  padding: "12px 18px",
                  border: "none",
                  borderRadius: "10px",
                  backgroundColor:
                    silinenAracId !== null ? "#94A3B8" : "#DC2626",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  cursor:
                    silinenAracId !== null ? "not-allowed" : "pointer",
                }}
              >
                {silinenAracId !== null
                  ? "Araç siliniyor..."
                  : "Aracı Sil"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}