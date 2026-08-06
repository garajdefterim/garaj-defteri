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
  E: "Sürücü okulu veya ralli aracı",
  F: "Kiralık araç",
  G: "Tarımsal araç",
  H: "Resmî hizmet aracı",
};

const kartStili = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  borderRadius: "18px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
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
    const eslesme = temizPlaka.match(/^([A-Z]+)(\d+)([A-Z]*)$/);

    if (!eslesme) {
      return {
        temizPlaka,
        prefix: temizPlaka.match(/^[A-Z]+/)?.[0] ?? "",
        sayi: null as number | null,
        suffix: "",
      };
    }

    return {
      temizPlaka,
      prefix: eslesme[1],
      sayi: Number(eslesme[2]),
      suffix: eslesme[3] ?? "",
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
        renk: "#64748B",
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
          backgroundColor: "#F8FAFC",
          color: "#0F172A",
          fontFamily: "Arial, Helvetica, sans-serif",
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
            Araç açılamadı
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
          padding: "18px",
          borderRadius: "14px",
          backgroundColor: "#F8FAFC",
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
                color: "#0F172A",
                fontSize: "17px",
              }}
            >
              {ikon} {baslik}
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "8px",
                color: "#64748B",
              }}
            >
              {tarihFormatla(tarih)}
            </span>

            {altBilgi && (
              <span
                style={{
                  display: "block",
                  marginTop: "5px",
                  color: "#94A3B8",
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

  function MuayeneKarti() {
    if (!resmiMuayeneTakvimi) {
      return (
        <div
          style={{
            padding: "18px",
            borderRadius: "14px",
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
          }}
        >
          <strong
            style={{
              display: "block",
              color: "#0F172A",
              fontSize: "17px",
            }}
          >
            🚗 Resmî muayene dönemi
          </strong>

          <span
            style={{
              display: "block",
              marginTop: "8px",
              color: "#64748B",
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
          padding: "18px",
          borderRadius: "14px",
          backgroundColor: "#F8FAFC",
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
                color: "#0F172A",
                fontSize: "17px",
              }}
            >
              🚗 Resmî muayene dönemi
            </strong>

            <span
              style={{
                display: "block",
                marginTop: "8px",
                color: "#64748B",
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
                color: "#94A3B8",
                fontSize: "12px",
              }}
            >
              {resmiMuayeneTakvimi.schedule_name}
            </span>
          </div>

          <span
            style={{
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
        <div
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
              color: "#2563EB",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            ← Panele dön
          </Link>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href={`/bakim-ekle/${arac.id}`}
              style={{
                padding: "11px 16px",
                borderRadius: "10px",
                backgroundColor: "#059669",
                color: "#FFFFFF",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              🔧 Bakım Ekle
            </Link>

            <Link
              href={`/arac-duzenle/${arac.id}`}
              style={{
                padding: "11px 16px",
                borderRadius: "10px",
                backgroundColor: "#2563EB",
                color: "#FFFFFF",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              ✏️ Düzenle
            </Link>
          </div>
        </div>

        <section
          style={{
            ...kartStili,
            padding: "30px",
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
                  color: "#0F172A",
                  fontSize: "36px",
                }}
              >
                🚘 {arac.marka} {arac.model}
              </h1>

              <p
                style={{
                  margin: "10px 0 0",
                  color: "#2563EB",
                  fontSize: "20px",
                  fontWeight: 800,
                }}
              >
                {arac.plaka}
              </p>

              <span
                style={{
                  display: "inline-block",
                  marginTop: "10px",
                  padding: "6px 10px",
                  borderRadius: "999px",
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
                  borderRadius: "12px",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                }}
              >
                <span
                  style={{
                    display: "block",
                    color: "#64748B",
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
                  borderRadius: "12px",
                  backgroundColor: "#F8FAFC",
                  border: "1px solid #E2E8F0",
                }}
              >
                <span
                  style={{
                    display: "block",
                    color: "#64748B",
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
              padding: "22px",
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
                marginTop: "8px",
                color: "#0F172A",
                fontSize: "28px",
              }}
            >
              {bakimlar.length}
            </strong>
          </div>

          <div
            style={{
              ...kartStili,
              padding: "22px",
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
                marginTop: "8px",
                color: "#059669",
                fontSize: "25px",
              }}
            >
              {paraFormatla(toplamMasraf)}
            </strong>
          </div>

          <div
            style={{
              ...kartStili,
              padding: "22px",
            }}
          >
            <span
              style={{
                display: "block",
                color: "#64748B",
                fontSize: "14px",
              }}
            >
              Son bakım tarihi
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "8px",
                color: "#0F172A",
                fontSize: "22px",
              }}
            >
              {tarihFormatla(arac.son_bakim_tarihi)}
            </strong>
          </div>

          <div
            style={{
              ...kartStili,
              padding: "22px",
            }}
          >
            <span
              style={{
                display: "block",
                color: "#64748B",
                fontSize: "14px",
              }}
            >
              Sonraki bakım tarihi
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "8px",
                color: "#C2410C",
                fontSize: "22px",
              }}
            >
              {tarihFormatla(sonrakiBakimTarihi)}
            </strong>
          </div>
        </section>

        <section
          style={{
            ...kartStili,
            marginTop: "22px",
            padding: "26px",
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
                  color: "#0F172A",
                  fontSize: "25px",
                }}
              >
                Son Bakımlar
              </h2>

              <p
                style={{
                  margin: "7px 0 0",
                  color: "#64748B",
                }}
              >
                Bu araca ait en son bakım kayıtları.
              </p>
            </div>

            <Link
              href={`/bakim-gecmisi/${arac.id}`}
              style={{
                color: "#2563EB",
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
                padding: "18px",
                borderRadius: "12px",
                backgroundColor: "#F8FAFC",
                color: "#64748B",
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
                  key={bakim.id}
                  style={{
                    padding: "16px",
                    border: "1px solid #E2E8F0",
                    borderRadius: "12px",
                    backgroundColor: "#F8FAFC",
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
                          color: "#0F172A",
                          fontSize: "17px",
                        }}
                      >
                        {bakim.baslik}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          marginTop: "6px",
                          color: "#2563EB",
                          fontWeight: 700,
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
                          color: "#059669",
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
                          color: "#64748B",
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
    </main>
  );
}