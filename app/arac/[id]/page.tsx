"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabase";

type Vehicle = {
  id: string;
  plaka: string;
  plaka_normalized: string | null;
  vehicle_category: string;
  marka: string;
  model: string;
  yil: number | null;
  kilometre: number | null;
  sigorta_tarihi: string | null;
  seyrusefer_tarihi: string | null;
  son_bakim_tarihi: string | null;
};

type InspectionSchedule = {
  id: string;
  schedule_name: string;
  schedule_year: number;
  vehicle_category: string;
  match_type: "prefix" | "number_range" | "all";
  plate_prefix: string | null;
  plate_suffix: string | null;
  number_start: number | null;
  number_end: number | null;
  inspection_start_date: string;
  inspection_end_date: string;
  description: string | null;
};

type MaintenanceRecord = {
  id: string;
  baslik: string;
  tarih: string;
  kilometre: number | null;
  tutar: number | null;
};

type TarihDurumu = {
  yazi: string;
  arkaPlan: string;
  renk: string;
  kenarlik: string;
};

const kategoriAdlari: Record<string, string> = {
  A: "Ticari veya taşımacılık aracı",
  B: "Römork",
  C: "Geçici kayıtlı araç",
  D: "Özel şahsi araç",
  E: "Sürücü okulu aracı",
  F: "Kiralık araç",
};

const kartStili = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E3E7EC",
  borderRadius: "9px",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
};

export default function AracDetayPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const aracId = params.id;

  const [arac, setArac] = useState<Vehicle | null>(null);
  const [bakimlar, setBakimlar] = useState<MaintenanceRecord[]>([]);
  const [muayeneTakvimi, setMuayeneTakvimi] =
    useState<InspectionSchedule[]>([]);
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

      const [aracSonucu, bakimSonucu, takvimSonucu] = await Promise.all([
        supabase
          .from("vehicles")
          .select(
            `
            id,
            plaka,
            plaka_normalized,
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
          .single(),

        supabase
          .from("maintenance_records")
          .select("id, baslik, tarih, kilometre, tutar")
          .eq("vehicle_id", aracId)
          .eq("user_id", user.id)
          .order("tarih", { ascending: false }),

        supabase
          .from("inspection_schedule")
          .select(
            `
            id,
            schedule_name,
            schedule_year,
            vehicle_category,
            match_type,
            plate_prefix,
            plate_suffix,
            number_start,
            number_end,
            inspection_start_date,
            inspection_end_date,
            description
          `
          )
          .eq("is_active", true)
          .order("inspection_start_date", { ascending: true }),
      ]);

      if (aracSonucu.error || !aracSonucu.data) {
        setHata(
          "Araç bulunamadı veya bu araca erişim yetkiniz yok."
        );
        setYukleniyor(false);
        return;
      }

      if (bakimSonucu.error) {
        setHata(bakimSonucu.error.message);
        setYukleniyor(false);
        return;
      }

      if (takvimSonucu.error) {
        setHata(takvimSonucu.error.message);
        setYukleniyor(false);
        return;
      }

      setArac(aracSonucu.data);
      setBakimlar(bakimSonucu.data ?? []);
      setMuayeneTakvimi(takvimSonucu.data ?? []);
      setYukleniyor(false);
    }

    if (aracId) {
      verileriGetir();
    }
  }, [aracId, router]);

  function plakaNormalize(plaka: string) {
    return plaka.toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  function plakaParcala(plaka: string) {
    const temizPlaka = plakaNormalize(plaka);

    // Normal KKTC plakaları: UM590, ZT001 vb.
    const harfOnce = temizPlaka.match(/^([A-Z]+)(\d+)([A-Z]*)$/);
    if (harfOnce) {
      return {
        temizPlaka, prefix: harfOnce[1],
        sayi: Number(harfOnce[2]),
        suffix: harfOnce[3] ?? "",
      };
    }

    // Römork plakaları: 001R, 3945R vb.
    const sayiOnce = temizPlaka.match(/^(\d+)([A-Z]+)$/);
    if (sayiOnce) {
      return {
        temizPlaka, prefix: "",
        sayi: Number(sayiOnce[1]),
        suffix: sayiOnce[2],
      };
    }

    return {
      temizPlaka, prefix: temizPlaka.match(/^[A-Z]+/)?.[0] ?? "",
      sayi: null as number | null,
      suffix: temizPlaka.match(/[A-Z]+$/)?.[0] ?? "",
    };
  }

  const resmiMuayeneTakvimi = useMemo(() => {
    if (!arac) {
      return null;
    }

    const plaka =
      arac.plaka_normalized || plakaNormalize(arac.plaka);
    const parcalar = plakaParcala(plaka);

    const kategoriTakvimi = muayeneTakvimi.filter(
      (takvim) =>
        takvim.vehicle_category === arac.vehicle_category
    );

    const prefixEslesmeleri = kategoriTakvimi
      .filter(
        (takvim) =>
          takvim.match_type === "prefix" &&
          takvim.plate_prefix &&
          plaka.startsWith(
            takvim.plate_prefix.toUpperCase()
          )
      )
      .sort(
        (a, b) =>
          (b.plate_prefix?.length ?? 0) -
          (a.plate_prefix?.length ?? 0)
      );

    if (prefixEslesmeleri.length > 0) {
      return prefixEslesmeleri[0];
    }

    const sayiAraligiEslesmesi = kategoriTakvimi.find(
      (takvim) => {
        if (
          takvim.match_type !== "number_range" ||
          parcalar.sayi === null ||
          takvim.number_start === null ||
          takvim.number_end === null
        ) {
          return false;
        }

        const prefixUygun =
          !takvim.plate_prefix ||
          parcalar.prefix ===
            takvim.plate_prefix.toUpperCase();

        const suffixUygun =
          !takvim.plate_suffix ||
          parcalar.suffix ===
            takvim.plate_suffix.toUpperCase();

        const sayiUygun =
          parcalar.sayi >= takvim.number_start &&
          parcalar.sayi <= takvim.number_end;

        return prefixUygun && suffixUygun && sayiUygun;
      }
    );

    if (sayiAraligiEslesmesi) {
      return sayiAraligiEslesmesi;
    }

    return (
      kategoriTakvimi.find(
        (takvim) => takvim.match_type === "all"
      ) ?? null
    );
  }, [arac, muayeneTakvimi]);

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

    return `${new Intl.NumberFormat("tr-TR").format(
      kilometre
    )} km`;
  }

  function paraFormatla(tutar: number) {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(tutar);
  }

  function kalanGunHesapla(tarih: string) {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);

    const hedef = new Date(`${tarih}T00:00:00`);
    hedef.setHours(0, 0, 0, 0);

    return Math.ceil(
      (hedef.getTime() - bugun.getTime()) /
        (1000 * 60 * 60 * 24)
    );
  }

  function sonrakiBakimTarihiHesapla(
    sonBakimTarihi: string | null
  ): string | null {
    if (!sonBakimTarihi) {
      return null;
    }

    const tarih = new Date(`${sonBakimTarihi}T00:00:00`);
    const asilGun = tarih.getDate();

    tarih.setDate(1);
    tarih.setMonth(tarih.getMonth() + 6);

    const hedefAyinSonGunu = new Date(
      tarih.getFullYear(),
      tarih.getMonth() + 1,
      0
    ).getDate();

    tarih.setDate(Math.min(asilGun, hedefAyinSonGunu));

    const yil = tarih.getFullYear();
    const ay = String(tarih.getMonth() + 1).padStart(
      2,
      "0"
    );
    const gun = String(tarih.getDate()).padStart(2, "0");

    return `${yil}-${ay}-${gun}`;
  }

  function tarihDurumuGetir(
    tarih: string | null,
    bugunMetni = "Bugün"
  ): TarihDurumu {
    if (!tarih) {
      return {
        yazi: "Tarih bulunamadı",
        arkaPlan: "#F1F5F9",
        renk: "#6B7280",
        kenarlik: "#CBD5E1",
      };
    }

    const kalanGun = kalanGunHesapla(tarih);

    if (kalanGun < 0) {
      return {
        yazi: `${Math.abs(kalanGun)} gün geçti`,
        arkaPlan: "#FEF2F2",
        renk: "#B91C1C",
        kenarlik: "#FECACA",
      };
    }

    if (kalanGun === 0) {
      return {
        yazi: bugunMetni,
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

  const toplamMasraf = useMemo(() => {
    return bakimlar.reduce(
      (toplam, bakim) =>
        toplam + Number(bakim.tutar ?? 0),
      0
    );
  }, [bakimlar]);

  const sonBakimlar = bakimlar.slice(0, 5);

  if (yukleniyor) {
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
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' ,
        }}
      >
        Araç bilgileri ve resmî muayene takvimi
        yükleniyor...
      </main>
    );
  }

  if (hata || !arac) {
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
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' ,
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "520px",
            padding: "28px",
            border: "1px solid #FECACA",
            borderRadius: "9px",
            backgroundColor: "#FFFFFF",
          }}
        >
          <h1
            style={{
              margin: 0,
              color: "#B91C1C",
              fontSize: "22px",
            }}
          >
            Araç açılamadı
          </h1>

          <p
            style={{
              color: "#6B7280",
              lineHeight: 1.6,
            }}
          >
            {hata}
          </p>

          <Link
            href="/dashboard"
            style={{
              color: "#6B7280",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Panele dön
          </Link>
        </section>
      </main>
    );
  }

  const sonrakiBakimTarihi =
    sonrakiBakimTarihiHesapla(
      arac.son_bakim_tarihi
    );

  function TarihKarti({
    baslik,
    tarih,
    ikon,
    altBilgi,
    bugunMetni,
  }: {
    baslik: string;
    tarih: string | null;
    ikon: string;
    altBilgi?: string;
    bugunMetni?: string;
  }) {
    const durum = tarihDurumuGetir(
      tarih,
      bugunMetni
    );

    return (
      <div
        style={{
          padding: "16px",
          borderRadius: "9px",
          backgroundColor: "#F7F8FA",
          border: "1px solid #E2E8F0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "14px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <strong
              style={{
                display: "block",
                color: "#111827",
                fontSize: "17px",
              }}
            >
              {baslik}
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "8px",
                color: "#6B7280",
              }}
            >
              {tarihFormatla(tarih)}
            </span>

            {altBilgi && (
              <span
                style={{
                  display: "block",
                  marginTop: "5px",
                  color: "#9CA3AF",
                  fontSize: "12px",
                  lineHeight: 1.5,
                }}
              >
                {altBilgi}
              </span>
            )}
          </div>

          <span
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              backgroundColor: durum.arkaPlan,
              color: durum.renk,
              border: `1px solid ${durum.kenarlik}`,
              fontSize: "13px",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {durum.yazi}
          </span>
        </div>
      </div>
    );
  }

  function MuayeneKarti() {
    if (!resmiMuayeneTakvimi) {
      return (
        <div
          style={{
            padding: "16px",
            borderRadius: "9px",
            backgroundColor: "#F7F8FA",
            border: "1px solid #E2E8F0",
          }}
        >
          <strong
            style={{
              display: "block",
              color: "#111827",
              fontSize: "17px",
            }}
          >
            Resmî muayene dönemi
          </strong>

          <span
            style={{
              display: "block",
              marginTop: "8px",
              color: "#6B7280",
              lineHeight: 1.5,
            }}
          >
            Bu plaka ve araç kategorisi için aktif
            muayene takvimi bulunamadı.
          </span>
        </div>
      );
    }

    const durum = tarihDurumuGetir(
      resmiMuayeneTakvimi.inspection_start_date,
      "Bugün başlıyor"
    );

    return (
      <div
        style={{
          padding: "16px",
          borderRadius: "9px",
          backgroundColor: "#F7F8FA",
          border: "1px solid #E2E8F0",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "14px",
            alignItems: "flex-start",
            flexWrap: "wrap",
          }}
        >
          <div>
            <strong
              style={{
                display: "block",
                color: "#111827",
                fontSize: "17px",
              }}
            >
              Resmî muayene dönemi
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "8px",
                color: "#6B7280",
                lineHeight: 1.5,
              }}
            >
              {tarihFormatla(
                resmiMuayeneTakvimi.inspection_start_date
              )}{" "}
              –{" "}
              {tarihFormatla(
                resmiMuayeneTakvimi.inspection_end_date
              )}
            </span>

            <span
              style={{
                display: "block",
                marginTop: "5px",
                color: "#9CA3AF",
                fontSize: "12px",
              }}
            >
              {resmiMuayeneTakvimi.schedule_name}
            </span>
          </div>

          <span
            style={{
              padding: "6px 10px",
              borderRadius: "8px",
              backgroundColor: durum.arkaPlan,
              color: durum.renk,
              border: `1px solid ${durum.kenarlik}`,
              fontSize: "13px",
              fontWeight: 700,
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
      className="arac-detay-page"
      style={{
        minHeight: "100vh",
        padding: "32px 24px 64px",
        backgroundColor: "#F7F8FA",
        color: "#111827",
        fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' ,
      }}
    >
      <div
        className="arac-detay-container"
        style={{
          width: "100%",
          maxWidth: "1180px",
          margin: "0 auto",
        }}
      >
        <div
          className="arac-detay-topbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "26px",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              color: "#1D4ED8",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            ← Panele dön
          </Link>

          <div
            className="arac-detay-actions"
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href={`/bakim-ekle/${arac.id}`}
              style={{
                minHeight: "46px",
                padding: "0 16px",
                borderRadius: "9px",
                backgroundColor: "#111827",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 650,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Bakım Ekle
            </Link>

            <Link
              href={`/arac-duzenle/${arac.id}`}
              style={{
                minHeight: "46px",
                padding: "0 16px",
                borderRadius: "9px",
                backgroundColor: "#1D4ED8",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 650,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Düzenle
            </Link>
          </div>
        </div>

        <section
          className="arac-detay-hero"
          style={{
            ...kartStili,
            padding: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "20px",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  color: "#111827",
                  fontSize: "clamp(30px, 5vw, 38px)",
                  lineHeight: 1.15,
                  fontWeight: 760,
                  letterSpacing: "-0.9px",
                }}
              >
                {arac.marka} {arac.model}
              </h1>

              <p
                style={{
                  margin: "10px 0 0",
                  color: "#374151",
                  fontSize: "18px",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                }}
              >
                {arac.plaka}
              </p>

              <span
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  backgroundColor: "#F1F5F9",
                  color: "#475569",
                  fontSize: "13px",
                  fontWeight: 700,
                }}
              >
                {arac.vehicle_category} —{" "}
                {kategoriAdlari[arac.vehicle_category] ??
                  "Araç kategorisi"}
              </span>
            </div>

            <div
              className="arac-detay-mini-stats"
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(2, minmax(120px, 1fr))",
                gap: "12px",
              }}
            >
              <div
                style={{
                  padding: "14px",
                  borderRadius: "9px",
                  backgroundColor: "#F7F8FA",
                  border: "1px solid #E2E8F0",
                }}
              >
                <span
                  style={{
                    display: "block",
                    color: "#6B7280",
                    fontSize: "13px",
                  }}
                >
                  Yıl
                </span>

                <strong
                  style={{
                    display: "block",
                    marginTop: "5px",
                  }}
                >
                  {arac.yil ?? "Belirtilmedi"}
                </strong>
              </div>

              <div
                style={{
                  padding: "14px",
                  borderRadius: "9px",
                  backgroundColor: "#F7F8FA",
                  border: "1px solid #E2E8F0",
                }}
              >
                <span
                  style={{
                    display: "block",
                    color: "#6B7280",
                    fontSize: "13px",
                  }}
                >
                  Kilometre
                </span>

                <strong
                  style={{
                    display: "block",
                    marginTop: "5px",
                  }}
                >
                  {kilometreFormatla(arac.kilometre)}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <section
          className="arac-detay-dates"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
            marginTop: "22px",
          }}
        >
          <MuayeneKarti />

          <TarihKarti
            baslik="Sigorta bitiş tarihi"
            tarih={arac.sigorta_tarihi}
            ikon="🛡️"
            bugunMetni="Bugün sona eriyor"
          />

          <TarihKarti
            baslik="Seyrüsefer bitiş tarihi"
            tarih={arac.seyrusefer_tarihi}
            ikon="📄"
            bugunMetni="Bugün sona eriyor"
          />

          <TarihKarti
            baslik="Sonraki bakım"
            tarih={sonrakiBakimTarihi}
            ikon="🔧"
            bugunMetni="Bakım bugün"
            altBilgi={
              arac.son_bakim_tarihi
                ? `Son bakım: ${tarihFormatla(
                    arac.son_bakim_tarihi
                  )}`
                : "Son bakım tarihi girilmedi"
            }
          />
        </section>

        <section
          className="arac-detay-summary"
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "16px",
            marginTop: "22px",
          }}
        >
          <div
            style={{
              ...kartStili,
              padding: "20px",
            }}
          >
            <span
              style={{
                display: "block",
                color: "#6B7280",
                fontSize: "14px",
              }}
            >
              Toplam bakım kaydı
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "8px",
                color: "#111827",
                fontSize: "26px",
              }}
            >
              {bakimlar.length}
            </strong>
          </div>

          <div
            style={{
              ...kartStili,
              padding: "20px",
            }}
          >
            <span
              style={{
                display: "block",
                color: "#6B7280",
                fontSize: "14px",
              }}
            >
              Toplam bakım masrafı
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "8px",
                color: "#111827",
                fontSize: "22px",
              }}
            >
              {paraFormatla(toplamMasraf)}
            </strong>
          </div>

          <div
            style={{
              ...kartStili,
              padding: "20px",
            }}
          >
            <span
              style={{
                display: "block",
                color: "#6B7280",
                fontSize: "14px",
              }}
            >
              Son bakım tarihi
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "8px",
                color: "#111827",
                fontSize: "22px",
              }}
            >
              {tarihFormatla(arac.son_bakim_tarihi)}
            </strong>
          </div>

          <div
            style={{
              ...kartStili,
              padding: "20px",
            }}
          >
            <span
              style={{
                display: "block",
                color: "#6B7280",
                fontSize: "14px",
              }}
            >
              Sonraki bakım tarihi
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "8px",
                color: "#111827",
                fontSize: "22px",
              }}
            >
              {tarihFormatla(sonrakiBakimTarihi)}
            </strong>
          </div>
        </section>

        <section
          className="arac-detay-maintenance"
          style={{
            ...kartStili,
            marginTop: "22px",
            padding: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  color: "#111827",
                  fontSize: "22px",
                }}
              >
                Son Bakımlar
              </h2>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#6B7280",
                }}
              >
                Bu araca ait en son bakım kayıtları.
              </p>
            </div>

            <Link
              href={`/bakim-gecmisi/${arac.id}`}
              style={{
                color: "#1D4ED8",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Tüm bakım geçmişi →
            </Link>
          </div>

          {sonBakimlar.length === 0 ? (
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                borderRadius: "9px",
                backgroundColor: "#F7F8FA",
                color: "#6B7280",
              }}
            >
              Henüz bakım kaydı bulunmuyor.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "12px",
                marginTop: "20px",
              }}
            >
              {sonBakimlar.map((bakim) => (
                <article
                  className="arac-detay-maintenance-item"
                  key={bakim.id}
                  style={{
                    padding: "16px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "9px",
                    backgroundColor: "#F7F8FA",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "16px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          display: "block",
                          color: "#111827",
                          fontSize: "17px",
                        }}
                      >
                        {bakim.baslik}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          marginTop: "6px",
                          color: "#6B7280",
                          fontWeight: 600,
                        }}
                      >
                        {tarihFormatla(bakim.tarih)}
                      </span>
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          color: "#111827",
                        }}
                      >
                        {paraFormatla(
                          Number(bakim.tutar ?? 0)
                        )}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          marginTop: "6px",
                          color: "#6B7280",
                          fontSize: "14px",
                        }}
                      >
                        {kilometreFormatla(
                          bakim.kilometre
                        )}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <style jsx global>{`
        @media (max-width: 700px) {
          .arac-detay-page {
            padding: 22px 14px 44px !important;
            overflow-x: hidden;
          }

          .arac-detay-container {
            max-width: 100% !important;
          }

          .arac-detay-topbar {
            align-items: stretch !important;
            gap: 14px !important;
            margin-bottom: 20px !important;
          }

          .arac-detay-actions {
            width: 100% !important;
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }

          .arac-detay-actions > a {
            width: 100% !important;
            min-width: 0 !important;
            padding: 0 10px !important;
          }

          .arac-detay-hero {
            padding: 18px !important;
          }

          .arac-detay-hero > div {
            gap: 18px !important;
          }

          .arac-detay-hero h1 {
            font-size: 30px !important;
            overflow-wrap: anywhere;
          }

          .arac-detay-mini-stats {
            width: 100% !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 9px !important;
          }

          .arac-detay-mini-stats > div {
            min-width: 0;
            padding: 12px !important;
          }

          .arac-detay-dates,
          .arac-detay-summary {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 12px !important;
            margin-top: 14px !important;
          }

          .arac-detay-summary > div {
            padding: 16px !important;
          }

          .arac-detay-maintenance {
            margin-top: 14px !important;
            padding: 18px !important;
          }

          .arac-detay-maintenance > div:first-child {
            align-items: flex-start !important;
          }

          .arac-detay-maintenance-item {
            padding: 14px !important;
          }

          .arac-detay-maintenance-item > div {
            gap: 12px !important;
          }

          .arac-detay-maintenance-item > div > div:last-child {
            text-align: left !important;
          }
        }


        /* Araç detay sayfası — koyu tema */
        html[data-theme="koyu"] .arac-detay-page {
          background-color: #080d17 !important;
          color: #f8fafc !important;
        }

        html[data-theme="koyu"] .arac-detay-hero,
        html[data-theme="koyu"] .arac-detay-summary > div,
        html[data-theme="koyu"] .arac-detay-maintenance {
          background-color: #101827 !important;
          border-color: #243044 !important;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12) !important;
        }

        html[data-theme="koyu"] .arac-detay-hero h1,
        html[data-theme="koyu"] .arac-detay-summary strong,
        html[data-theme="koyu"] .arac-detay-maintenance h2,
        html[data-theme="koyu"] .arac-detay-maintenance-item strong,
        html[data-theme="koyu"] .arac-detay-mini-stats strong {
          color: #f8fafc !important;
        }

        html[data-theme="koyu"] .arac-detay-mini-stats > div,
        html[data-theme="koyu"] .arac-detay-dates > div,
        html[data-theme="koyu"] .arac-detay-maintenance-item,
        html[data-theme="koyu"] .arac-detay-maintenance > div[style*="background-color: #F7F8FA"] {
          background-color: #0c1422 !important;
          border-color: #243044 !important;
        }

        html[data-theme="koyu"] .arac-detay-page [style*="color: #374151"],
        html[data-theme="koyu"] .arac-detay-page [style*="color: #475569"] {
          color: #cbd5e1 !important;
        }

        html[data-theme="koyu"] .arac-detay-page [style*="color: #6B7280"],
        html[data-theme="koyu"] .arac-detay-page [style*="color: #9CA3AF"] {
          color: #94a3b8 !important;
        }

        html[data-theme="koyu"] .arac-detay-page [style*="background-color: #F1F5F9"] {
          background-color: #162033 !important;
          color: #cbd5e1 !important;
        }

        html[data-theme="koyu"] .arac-detay-page a[href="/dashboard"],
        html[data-theme="koyu"] .arac-detay-page a[href^="/bakim-gecmisi/"] {
          color: #7db4ff !important;
        }

        @media (max-width: 380px) {
          .arac-detay-page {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .arac-detay-actions,
          .arac-detay-mini-stats {
            grid-template-columns: 1fr !important;
          }

          .arac-detay-hero,
          .arac-detay-maintenance {
            padding: 15px !important;
          }
        }
      `}</style>
    </main>
  );
}