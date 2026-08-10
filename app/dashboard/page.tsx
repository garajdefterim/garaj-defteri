"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type Vehicle = {
  id: string;
  plaka: string;
  plaka_normalized: string | null;
  vehicle_category: string;
  marka: string;
  model: string;
  yil: number | null;
  kilometre: number | null;
  muayene_tarihi: string | null;
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

type NotificationSettings = {
  email: string;
  inspection_email_enabled: boolean;
  inspection_reminder_days: number;
};

type Bildirim = {
  id: string;
  aracId: string;
  baslik: string;
  aciklama: string;
  ikon: string;
  seviye: "kritik" | "uyari";
};

type TarihDurumu = {
  yazi: string;
  arkaPlan: string;
  renk: string;
  kenarlik: string;
};

const kart = {
  backgroundColor: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "18px",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
};

export default function DashboardPage() {
  const router = useRouter();

  const [araclar, setAraclar] = useState<Vehicle[]>([]);
  const [muayeneTakvimi, setMuayeneTakvimi] = useState<InspectionSchedule[]>([]);
  const [bildirimAyari, setBildirimAyari] =
    useState<NotificationSettings | null>(null);
  const [kullaniciEmaili, setKullaniciEmaili] = useState("");
  const [gonderilenBildirimSayisi, setGonderilenBildirimSayisi] = useState(0);
  const [toplamBakimMasrafi, setToplamBakimMasrafi] = useState(0);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");
  const [silinecekArac, setSilinecekArac] = useState<Vehicle | null>(null);
  const [silinenAracId, setSilinenAracId] = useState<string | null>(null);

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

      setKullaniciEmaili(user.email ?? "");

      const [
        aracSonucu,
        bakimSonucu,
        takvimSonucu,
        bildirimAyariSonucu,
        bildirimSayisiSonucu,
      ] = await Promise.all([
        supabase
          .from("vehicles")
          .select(`
            id,
            plaka,
            plaka_normalized,
            vehicle_category,
            marka,
            model,
            yil,
            kilometre,
            muayene_tarihi,
            sigorta_tarihi,
            seyrusefer_tarihi,
            son_bakim_tarihi
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),

        supabase
          .from("maintenance_records")
          .select("tutar")
          .eq("user_id", user.id),

        supabase
          .from("inspection_schedule")
          .select(`
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
          `)
          .eq("is_active", true)
          .order("inspection_start_date", { ascending: true }),

        supabase
          .from("notification_settings")
          .select(`
            email,
            inspection_email_enabled,
            inspection_reminder_days
          `)
          .eq("user_id", user.id)
          .maybeSingle(),

        supabase
          .from("inspection_notifications")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),
      ]);

      if (aracSonucu.error) {
        setHata(aracSonucu.error.message);
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

      const toplam = (bakimSonucu.data ?? []).reduce(
        (sonuc, kayit) => sonuc + Number(kayit.tutar ?? 0),
        0
      );

      setAraclar(aracSonucu.data ?? []);
      setMuayeneTakvimi(takvimSonucu.data ?? []);
      setToplamBakimMasrafi(toplam);

      if (!bildirimAyariSonucu.error) {
        setBildirimAyari(bildirimAyariSonucu.data ?? null);
      }

      if (!bildirimSayisiSonucu.error) {
        setGonderilenBildirimSayisi(bildirimSayisiSonucu.count ?? 0);
      }

      setYukleniyor(false);
    }

    verileriGetir();
  }, [router]);

  function plakaNormalize(plaka: string) {
    return plaka.toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  function plakaParcala(plaka: string) {
    const temizPlaka = plakaNormalize(plaka);
    const eslesme = temizPlaka.match(/^([A-Z]+)(\d+)([A-Z]*)$/);

    if (!eslesme) {
      return {
        prefix: temizPlaka.match(/^[A-Z]+/)?.[0] ?? "",
        sayi: null as number | null,
        suffix: "",
      };
    }

    return {
      prefix: eslesme[1],
      sayi: Number(eslesme[2]),
      suffix: eslesme[3] ?? "",
    };
  }

  function aracMuayeneTakvimiBul(arac: Vehicle) {
    const plaka = arac.plaka_normalized || plakaNormalize(arac.plaka);
    const parcalar = plakaParcala(plaka);

    const kategoriTakvimi = muayeneTakvimi.filter(
      (takvim) => takvim.vehicle_category === arac.vehicle_category
    );

    const prefixEslesmeleri = kategoriTakvimi
      .filter(
        (takvim) =>
          takvim.match_type === "prefix" &&
          takvim.plate_prefix &&
          plaka.startsWith(takvim.plate_prefix.toUpperCase())
      )
      .sort(
        (a, b) =>
          (b.plate_prefix?.length ?? 0) -
          (a.plate_prefix?.length ?? 0)
      );

    if (prefixEslesmeleri.length > 0) {
      return prefixEslesmeleri[0];
    }

    const sayiAraligiEslesmesi = kategoriTakvimi.find((takvim) => {
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
        parcalar.prefix === takvim.plate_prefix.toUpperCase();

      const suffixUygun =
        !takvim.plate_suffix ||
        parcalar.suffix === takvim.plate_suffix.toUpperCase();

      return (
        prefixUygun &&
        suffixUygun &&
        parcalar.sayi >= takvim.number_start &&
        parcalar.sayi <= takvim.number_end
      );
    });

    if (sayiAraligiEslesmesi) {
      return sayiAraligiEslesmesi;
    }

    return (
      kategoriTakvimi.find((takvim) => takvim.match_type === "all") ?? null
    );
  }

  const aracMuayeneTakvimleri = useMemo(() => {
    const sonuc = new Map<string, InspectionSchedule | null>();

    araclar.forEach((arac) => {
      sonuc.set(arac.id, aracMuayeneTakvimiBul(arac));
    });

    return sonuc;
  }, [araclar, muayeneTakvimi]);

  function kalanGunHesapla(tarih: string) {
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);

    const hedef = new Date(`${tarih}T00:00:00`);
    hedef.setHours(0, 0, 0, 0);

    return Math.ceil(
      (hedef.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24)
    );
  }

  function sonrakiBakimTarihiHesapla(
    sonBakimTarihi: string | null
  ): string | null {
    if (!sonBakimTarihi) return null;

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

    return `${tarih.getFullYear()}-${String(tarih.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(tarih.getDate()).padStart(2, "0")}`;
  }

  function tarihFormatla(tarih: string | null) {
    if (!tarih) return "Belirtilmedi";

    return new Intl.DateTimeFormat("tr-TR").format(
      new Date(`${tarih}T00:00:00`)
    );
  }

  function kilometreFormatla(kilometre: number | null) {
    if (kilometre === null) return "Belirtilmedi";

    return `${new Intl.NumberFormat("tr-TR").format(kilometre)} km`;
  }

  function paraFormatla(tutar: number) {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(tutar);
  }

  function tarihDurumuGetir(tarih: string | null): TarihDurumu {
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
        yazi: "Bugün başlıyor",
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
    const sonuc: Bildirim[] = [];

    function tarihBildirimiEkle(
      arac: Vehicle,
      tur: string,
      tarih: string | null,
      ikon: string
    ) {
      if (!tarih) return;

      const kalanGun = kalanGunHesapla(tarih);
      const aracAdi = `${arac.marka} ${arac.model} – ${arac.plaka}`;

      if (kalanGun < 0) {
        sonuc.push({
          id: `${arac.id}-${tur}`,
          aracId: arac.id,
          baslik: `${tur} süresi geçti`,
          aciklama: `${aracAdi}: ${Math.abs(kalanGun)} gün geçti.`,
          ikon,
          seviye: "kritik",
        });
      } else if (kalanGun === 0) {
        sonuc.push({
          id: `${arac.id}-${tur}`,
          aracId: arac.id,
          baslik: `${tur} bugün`,
          aciklama: aracAdi,
          ikon,
          seviye: "kritik",
        });
      } else if (kalanGun <= 30) {
        sonuc.push({
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
      const resmiTakvim = aracMuayeneTakvimleri.get(arac.id);

      if (resmiTakvim) {
        const kalanGun = kalanGunHesapla(resmiTakvim.inspection_start_date);
        const aracAdi = `${arac.marka} ${arac.model} – ${arac.plaka}`;

        if (kalanGun < 0) {
          sonuc.push({
            id: `${arac.id}-resmi-muayene`,
            aracId: arac.id,
            baslik: "Resmî muayene dönemi başladı",
            aciklama: `${aracAdi}: ${tarihFormatla(
              resmiTakvim.inspection_start_date
            )} - ${tarihFormatla(resmiTakvim.inspection_end_date)}.`,
            ikon: "🚗",
            seviye: "kritik",
          });
        } else if (kalanGun <= 30) {
          sonuc.push({
            id: `${arac.id}-resmi-muayene`,
            aracId: arac.id,
            baslik:
              kalanGun <= 7
                ? "Muayene dönemi çok yaklaştı"
                : "Muayene dönemi yaklaşıyor",
            aciklama: `${aracAdi}: ${kalanGun} gün kaldı. Dönem ${tarihFormatla(
              resmiTakvim.inspection_start_date
            )} tarihinde başlayacak.`,
            ikon: "🚗",
            seviye: kalanGun <= 7 ? "kritik" : "uyari",
          });
        }
      }

      tarihBildirimiEkle(arac, "Sigorta", arac.sigorta_tarihi, "🛡️");
      tarihBildirimiEkle(arac, "Seyrüsefer", arac.seyrusefer_tarihi, "📄");

      const sonrakiBakimTarihi = sonrakiBakimTarihiHesapla(
        arac.son_bakim_tarihi
      );

      if (sonrakiBakimTarihi) {
        const kalanGun = kalanGunHesapla(sonrakiBakimTarihi);
        const aracAdi = `${arac.marka} ${arac.model} – ${arac.plaka}`;

        if (kalanGun < 0) {
          sonuc.push({
            id: `${arac.id}-bakim`,
            aracId: arac.id,
            baslik: "Bakım zamanı geçti",
            aciklama: `${aracAdi}: ${Math.abs(kalanGun)} gün gecikti.`,
            ikon: "🔧",
            seviye: "kritik",
          });
        } else if (kalanGun === 0) {
          sonuc.push({
            id: `${arac.id}-bakim`,
            aracId: arac.id,
            baslik: "Bakım bugün yapılmalı",
            aciklama: aracAdi,
            ikon: "🔧",
            seviye: "kritik",
          });
        } else if (kalanGun <= 30) {
          sonuc.push({
            id: `${arac.id}-bakim`,
            aracId: arac.id,
            baslik: "Bakım zamanı yaklaşıyor",
            aciklama: `${aracAdi}: ${kalanGun} gün kaldı.`,
            ikon: "🔧",
            seviye: kalanGun <= 7 ? "kritik" : "uyari",
          });
        }
      }
    });

    return sonuc.sort((a, b) =>
      a.seviye === b.seviye ? 0 : a.seviye === "kritik" ? -1 : 1
    );
  }, [araclar, aracMuayeneTakvimleri]);

  const gecikenIslemSayisi = useMemo(() => {
    return araclar.reduce((toplam, arac) => {
      const resmiMuayene =
        aracMuayeneTakvimleri.get(arac.id)?.inspection_start_date ?? null;

      const tarihler = [
        resmiMuayene,
        arac.sigorta_tarihi,
        arac.seyrusefer_tarihi,
        sonrakiBakimTarihiHesapla(arac.son_bakim_tarihi),
      ];

      return (
        toplam +
        tarihler.filter((tarih) => tarih && kalanGunHesapla(tarih) < 0).length
      );
    }, 0);
  }, [araclar, aracMuayeneTakvimleri]);

  const yaklasanIslemSayisi = useMemo(() => {
    return araclar.reduce((toplam, arac) => {
      const resmiMuayene =
        aracMuayeneTakvimleri.get(arac.id)?.inspection_start_date ?? null;

      const tarihler = [
        resmiMuayene,
        arac.sigorta_tarihi,
        arac.seyrusefer_tarihi,
        sonrakiBakimTarihiHesapla(arac.son_bakim_tarihi),
      ];

      return (
        toplam +
        tarihler.filter((tarih) => {
          if (!tarih) return false;
          const kalanGun = kalanGunHesapla(tarih);
          return kalanGun >= 0 && kalanGun <= 30;
        }).length
      );
    }, 0);
  }, [araclar, aracMuayeneTakvimleri]);

  const emailBildirimiAcik =
    bildirimAyari?.inspection_email_enabled ?? true;

  const bildirimEmaili =
    bildirimAyari?.email || kullaniciEmaili || "E-posta bulunamadı";

  const hatirlatmaGunu =
    bildirimAyari?.inspection_reminder_days ?? 7;

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
    if (!silinecekArac) return;

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

      setAraclar((mevcut) =>
        mevcut.filter((arac) => arac.id !== silinecekArac.id)
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
    altBilgi,
  }: {
    baslik: string;
    tarih: string | null;
    altBilgi?: string;
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
            <strong style={{ display: "block", marginBottom: "4px" }}>
              {baslik}
            </strong>

            <span style={{ color: "#64748B", fontSize: "14px" }}>
              {tarihFormatla(tarih)}
            </span>

            {altBilgi && (
              <span
                style={{
                  display: "block",
                  marginTop: "4px",
                  color: "#94A3B8",
                  fontSize: "12px",
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

  function MuayeneSatiri({
    takvim,
  }: {
    takvim: InspectionSchedule | null | undefined;
  }) {
    if (!takvim) {
      return (
        <div
          style={{
            padding: "13px",
            borderRadius: "12px",
            backgroundColor: "#F8FAFC",
            border: "1px solid #E2E8F0",
          }}
        >
          <strong style={{ display: "block" }}>
            Resmî muayene dönemi
          </strong>

          <span
            style={{
              display: "block",
              marginTop: "6px",
              color: "#64748B",
              fontSize: "14px",
            }}
          >
            Bu plaka ve kategori için aktif takvim bulunamadı.
          </span>
        </div>
      );
    }

    const durum = tarihDurumuGetir(takvim.inspection_start_date);

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
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Resmî muayene dönemi
            </strong>

            <span
              style={{
                display: "block",
                color: "#64748B",
                fontSize: "14px",
              }}
            >
              {tarihFormatla(takvim.inspection_start_date)} –{" "}
              {tarihFormatla(takvim.inspection_end_date)}
            </span>

            <span
              style={{
                display: "block",
                marginTop: "4px",
                color: "#94A3B8",
                fontSize: "12px",
              }}
            >
              {takvim.schedule_name}
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
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
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
            marginBottom: "30px",
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: "38px" }}>
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
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/profil"
              style={ustButonStili(
                "var(--card)",
                "var(--foreground)",
                "var(--border-strong)"
              )}
            >
              👤 Profilim
            </Link>

            <Link
              href="/bildirim-ayarlari"
              style={ustButonStili(
                "#EEF2FF",
                "#3730A3",
                "#A5B4FC"
              )}
            >
              🔔 Bildirim Ayarları
            </Link>

            <Link
              href="/bildirim-gecmisi"
              style={ustButonStili(
                "#F0FDF4",
                "#166534",
                "#BBF7D0"
              )}
            >
              📨 Gönderilenler
            </Link>

            <Link
              href="/arac-ekle"
              style={ustButonStili(
                "#2563EB",
                "#FFFFFF"
              )}
            >
              + Araç Ekle
            </Link>

            <button
              type="button"
              onClick={cikisYap}
              style={{
                padding: "13px 18px",
                borderRadius: "10px",
                border: "1px solid var(--border-strong)",
                backgroundColor: "var(--card)",
                color: "var(--foreground)",
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

        {!yukleniyor && (
          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "16px",
              marginBottom: "30px",
            }}
          >
            {[
              [
                "🚗 Toplam araç",
                araclar.length,
                "#EFF6FF",
                "#DBEAFE",
                "#1D4ED8",
              ],
              [
                "⏳ Yaklaşan işlem",
                yaklasanIslemSayisi,
                "#FFF7ED",
                "#FED7AA",
                "#C2410C",
              ],
              [
                "⚠️ Geciken işlem",
                gecikenIslemSayisi,
                "#FEF2F2",
                "#FECACA",
                "#B91C1C",
              ],
              [
                "📨 Gönderilen e-posta",
                gonderilenBildirimSayisi,
                "#F5F3FF",
                "#DDD6FE",
                "#6D28D9",
              ],
              [
                "💳 Toplam bakım masrafı",
                paraFormatla(toplamBakimMasrafi),
                "#F0FDF4",
                "#BBF7D0",
                "#166534",
              ],
            ].map(([baslik, deger, bg, border, color]) => (
              <div
                key={String(baslik)}
                style={{
                  padding: "21px",
                  border: `1px solid ${border}`,
                  borderRadius: "16px",
                  backgroundColor: String(bg),
                }}
              >
                <span
                  style={{
                    display: "block",
                    color: String(color),
                    fontSize: "14px",
                    fontWeight: 700,
                  }}
                >
                  {baslik}
                </span>

                <strong
                  className="dashboard-stat-value"
                  style={{
                    display: "block",
                    marginTop: "9px",
                    fontSize:
                      typeof deger === "number"
                        ? "29px"
                        : "22px",
                    color: String(color),
                    fontWeight: 800,
                  }}
                >
                  {deger}
                </strong>
              </div>
            ))}
          </section>
        )}

        {!yukleniyor && (
          <section
            style={{
              ...kart,
              marginBottom: "30px",
              padding: "24px",
              border: emailBildirimiAcik
                ? "1px solid #BBF7D0"
                : "1px solid #FECACA",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "18px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: "1 1 420px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "24px",
                    }}
                  >
                    📧 Muayene e-posta hatırlatması
                  </h2>

                  <span
                    style={{
                      padding: "6px 10px",
                      borderRadius: "999px",
                      backgroundColor: emailBildirimiAcik
                        ? "#F0FDF4"
                        : "#FEF2F2",
                      color: emailBildirimiAcik
                        ? "#166534"
                        : "#B91C1C",
                      border: emailBildirimiAcik
                        ? "1px solid #BBF7D0"
                        : "1px solid #FECACA",
                      fontSize: "13px",
                      fontWeight: 800,
                    }}
                  >
                    {emailBildirimiAcik
                      ? "Açık"
                      : "Kapalı"}
                  </span>
                </div>

                <p
                  style={{
                    margin: "12px 0 0",
                    color: "#64748B",
                    lineHeight: 1.6,
                  }}
                >
                  Resmî muayene dönemi başlamadan{" "}
                  {hatirlatmaGunu} gün önce otomatik e-posta
                  gönderilir.
                </p>

                <div
                  style={{
                    marginTop: "16px",
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      padding: "13px",
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
                      Bildirim adresi
                    </span>

                    <strong
                      style={{
                        display: "block",
                        marginTop: "5px",
                        wordBreak: "break-word",
                      }}
                    >
                      {bildirimEmaili}
                    </strong>
                  </div>

                  <div
                    style={{
                      padding: "13px",
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
                      Hatırlatma zamanı
                    </span>

                    <strong
                      style={{
                        display: "block",
                        marginTop: "5px",
                      }}
                    >
                      {hatirlatmaGunu} gün önce
                    </strong>
                  </div>
                </div>
              </div>

              <Link
                href="/bildirim-ayarlari"
                style={{
                  padding: "12px 17px",
                  borderRadius: "10px",
                  backgroundColor: "#2563EB",
                  color: "#FFFFFF",
                  textDecoration: "none",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                Ayarları Yönet →
              </Link>
            </div>
          </section>
        )}

        {!yukleniyor && araclar.length > 0 && (
          <section
            style={{
              ...kart,
              marginBottom: "30px",
              padding: "24px",
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
                  const kritik =
                    bildirim.seviye === "kritik";

                  return (
                    <Link
                      key={bildirim.id}
                      href={`/arac/${bildirim.aracId}`}
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
                            color: kritik
                              ? "#B91C1C"
                              : "#C2410C",
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
              ...kart,
              padding: "30px",
              color: "#475569",
            }}
          >
            Araçlar ve resmî muayene takvimi yükleniyor...
          </section>
        )}

        {!yukleniyor && !hata && araclar.length === 0 && (
          <section
            style={{
              ...kart,
              padding: "34px",
            }}
          >
            <h2 style={{ margin: 0 }}>
              Henüz araç eklemediniz
            </h2>

            <p
              style={{
                marginBottom: "22px",
                color: "#64748B",
                lineHeight: 1.6,
              }}
            >
              İlk aracınızı ekleyerek muayene, sigorta,
              seyrüsefer ve bakım tarihlerini takip etmeye
              başlayın.
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
                fontSize: "26px",
              }}
            >
              Araçlarım
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "20px",
              }}
            >
              {araclar.map((arac) => {
                const resmiMuayeneTakvimi =
                  aracMuayeneTakvimleri.get(arac.id);

                return (
                  <article
                    key={arac.id}
                    style={{
                      ...kart,
                      padding: "26px",
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

                        <span
                          style={{
                            display: "inline-block",
                            marginTop: "8px",
                            padding: "5px 9px",
                            borderRadius: "999px",
                            backgroundColor: "#F1F5F9",
                            color: "#475569",
                            fontSize: "12px",
                            fontWeight: 700,
                          }}
                        >
                          Araç kategorisi: {arac.vehicle_category}
                        </span>
                      </div>

                      <span
                        aria-hidden="true"
                        style={{
                          fontSize: "30px",
                        }}
                      >
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
                          }}
                        >
                          Yıl
                        </strong>

                        <span
                          style={{
                            color: "#64748B",
                          }}
                        >
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
                          }}
                        >
                          Kilometre
                        </strong>

                        <span
                          style={{
                            color: "#64748B",
                          }}
                        >
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
                      <MuayeneSatiri
                        takvim={resmiMuayeneTakvimi}
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
                        baslik="Sonraki bakım"
                        tarih={sonrakiBakimTarihiHesapla(
                          arac.son_bakim_tarihi
                        )}
                        altBilgi={
                          arac.son_bakim_tarihi
                            ? `Son bakım: ${tarihFormatla(
                                arac.son_bakim_tarihi
                              )}`
                            : "Son bakım tarihi girilmedi"
                        }
                      />
                    </div>

                    <div
                      style={{
                        marginTop: "14px",
                        padding: "12px",
                        borderRadius: "11px",
                        backgroundColor: emailBildirimiAcik
                          ? "#F0FDF4"
                          : "#FEF2F2",
                        border: emailBildirimiAcik
                          ? "1px solid #BBF7D0"
                          : "1px solid #FECACA",
                        color: emailBildirimiAcik
                          ? "#166534"
                          : "#B91C1C",
                        fontSize: "13px",
                        fontWeight: 700,
                      }}
                    >
                      {emailBildirimiAcik
                        ? `📧 Muayene e-postası ${hatirlatmaGunu} gün önce gönderilecek.`
                        : "📵 Muayene e-posta hatırlatması kapalı."}
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
                        href={`/arac/${arac.id}`}
                        style={butonStili(
                          "var(--card)",
                          "var(--foreground)",
                          "var(--border-strong)"
                        )}
                      >
                        🚘 Detay
                      </Link>

                      <Link
                        href={`/bakim-ekle/${arac.id}`}
                        style={butonStili(
                          "#059669",
                          "#FFFFFF"
                        )}
                      >
                        🔧 Bakım Ekle
                      </Link>

                      <Link
                        href={`/bakim-gecmisi/${arac.id}`}
                        style={butonStili(
                          "#EEF2FF",
                          "#3730A3",
                          "#A5B4FC"
                        )}
                      >
                        📋 Bakım Geçmişi
                      </Link>

                      <Link
                        href={`/arac-duzenle/${arac.id}`}
                        style={butonStili(
                          "#2563EB",
                          "#FFFFFF"
                        )}
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
                            silinenAracId === arac.id
                              ? "#94A3B8"
                              : "#DC2626",
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
                );
              })}
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
              backgroundColor: "var(--card)",
              boxShadow:
                "0 30px 80px rgba(15, 23, 42, 0.35)",
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
              Bu işlem geri alınamaz. Araca bağlı bakım kayıtları
              da kalıcı olarak silinecektir.
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
                  border: "1px solid var(--border-strong)",
                  borderRadius: "10px",
                  backgroundColor: "var(--card)",
                  color: "var(--foreground)",
                  fontWeight: 700,
                  cursor: silinenAracId
                    ? "not-allowed"
                    : "pointer",
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
                  backgroundColor: silinenAracId
                    ? "#94A3B8"
                    : "#DC2626",
                  color: "#FFFFFF",
                  fontWeight: 800,
                  cursor: silinenAracId
                    ? "not-allowed"
                    : "pointer",
                }}
              >
                {silinenAracId
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

function butonStili(
  backgroundColor: string,
  color: string,
  borderColor?: string
) {
  return {
    padding: "11px 14px",
    border: borderColor
      ? `1px solid ${borderColor}`
      : "none",
    borderRadius: "10px",
    backgroundColor,
    color,
    textAlign: "center" as const,
    textDecoration: "none",
    fontWeight: 700,
  };
}

function ustButonStili(
  backgroundColor: string,
  color: string,
  borderColor?: string
) {
  return {
    padding: "13px 18px",
    border: borderColor
      ? `1px solid ${borderColor}`
      : "none",
    borderRadius: "10px",
    backgroundColor,
    color,
    textDecoration: "none",
    fontWeight: 700,
    whiteSpace: "nowrap" as const,
  };
}