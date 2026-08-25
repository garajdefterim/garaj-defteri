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
  backgroundColor: "#FFFFFF",
  border: "1px solid #E3E7EC",
  borderRadius: "14px",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
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
        router.replace("/giris");
        router.refresh();
        return;
      }

      /*
       * Google OAuth ile açılan oturumlarda kullanıcıyı ikinci
       * e-posta kodu doğrulamasından geçirmeden dashboard'a almıyoruz.
       *
       * Google dönüşündeki ilk oturumun auth yöntemi "oauth" olur.
       * /google-dogrula sayfasında e-posta OTP'si doğrulandıktan sonra
       * Supabase yeni oturumu "otp" yöntemiyle oluşturur.
       */
      const { data: aalData, error: aalError } =
        await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

      if (aalError) {
        setHata(
          "Oturum güvenlik bilgileri kontrol edilemedi. Lütfen tekrar giriş yapın."
        );
        setYukleniyor(false);
        return;
      }

      const dogrulamaYontemleri: string[] =
        (aalData?.currentAuthenticationMethods ?? []) as string[];

      const oauthIleAcildi = dogrulamaYontemleri.includes("oauth");

      const otpIleDogrulandi = dogrulamaYontemleri.includes("otp");

      if (oauthIleAcildi && !otpIleDogrulandi) {
        router.replace("/google-dogrula");
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
          borderRadius: "9px",
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

            <span style={{ color: "#6B7280", fontSize: "14px" }}>
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
            borderRadius: "9px",
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
              color: "#6B7280",
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
          borderRadius: "9px",
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
                color: "#6B7280",
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
    <main className="dashboard-page"
      style={{
        minHeight: "100vh",
        padding: "32px 24px 64px",
        backgroundColor: "#F7F8FA",
        color: "#111827",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1180px",
          margin: "0 auto",
        }}
      >
        <header className="dashboard-header"
          style={{
            display: "grid",
            gap: "22px",
            marginBottom: "30px",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(30px, 6vw, 40px)",
                lineHeight: 1.1,
                fontWeight: 760,
                letterSpacing: "-1px",
              }}
            >
              GARAJ DEFTERİ
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "#6B7280",
                fontSize: "clamp(15px, 4vw, 18px)",
                lineHeight: 1.5,
              }}
            >
              Araçlarınız, bakım kayıtlarınız ve yaklaşan tarihleriniz tek ekranda.
            </p>
          </div>

          <div
            className="dashboard-top-actions"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "10px",
              width: "100%",
            }}
          >
            <Link
              href="/profil"
              style={{
                ...ustButonStili(
                  "#FFFFFF",
                  "#111827",
                  "#D7DCE3"
                ),
                textAlign: "center",
              }}
            >
              Profil
            </Link>

            <Link
              href="/bildirim-ayarlari"
              style={{
                ...ustButonStili(
                  "#EEF2FF",
                  "#3730A3",
                  "#A5B4FC"
                ),
                textAlign: "center",
              }}
            >
              Bildirim Ayarları
            </Link>

            <Link
              href="/bildirim-gecmisi"
              style={{
                ...ustButonStili(
                  "#F0FDF4",
                  "#166534",
                  "#BBF7D0"
                ),
                textAlign: "center",
              }}
            >
              Gönderilenler
            </Link>

            <Link
              href="/arac-ekle"
              style={{
                ...ustButonStili(
                  "#1D4ED8",
                  "#FFFFFF"
                ),
                textAlign: "center",
              }}
            >
              Araç Ekle
            </Link>

            <button
              type="button"
              onClick={cikisYap}
              style={{
                padding: "11px 14px",
                borderRadius: "9px",
                border: "1px solid var(--border-strong)",
                backgroundColor: "#FFFFFF",
                color: "#111827",
                fontWeight: 700,
                cursor: "pointer",
                textAlign: "center",
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
              borderRadius: "9px",
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
            className="dashboard-stats"
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(190px, 1fr))",
              gap: "16px",
              marginBottom: "30px",
            }}
          >
            {[
              ["Toplam araç", araclar.length],
              ["Yaklaşan işlem", yaklasanIslemSayisi],
              ["Geciken işlem", gecikenIslemSayisi],
              ["Gönderilen e-posta", gonderilenBildirimSayisi],
              ["Toplam bakım masrafı", paraFormatla(toplamBakimMasrafi)],
            ].map(([baslik, deger]) => (
              <div
                key={String(baslik)}
                style={{
                  padding: "21px",
                  border: "1px solid #E3E7EC",
                  borderRadius: "14px",
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
                }}
              >
                <span
                  style={{
                    display: "block",
                    color: "#6B7280",
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
                    color: "#111827",
                    fontWeight: 700,
                    letterSpacing: "-0.5px",
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
            className="dashboard-email-card"
            style={{
              ...kart,
              marginBottom: "24px",
              padding: "18px",
              border: "1px solid #E3E7EC",
            }}
          >
            <div
              style={{
                display: "grid",
                gap: "14px",
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
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "9px",
                    flexWrap: "wrap",
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "20px",
                      lineHeight: 1.25,
                    }}
                  >
                    E-posta hatırlatmaları
                  </h2>

                  <span
                    style={{
                      padding: "5px 9px",
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
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {emailBildirimiAcik ? "Açık" : "Kapalı"}
                  </span>
                </div>

                <Link
                  href="/bildirim-ayarlari"
                  style={{
                    padding: "9px 13px",
                    borderRadius: "9px",
                    backgroundColor: "#1D4ED8",
                    color: "#FFFFFF",
                    textDecoration: "none",
                    fontSize: "14px",
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}
                >
                  Ayarları Yönet →
                </Link>
              </div>

              <p
                style={{
                  margin: 0,
                  color: "#6B7280",
                  fontSize: "14px",
                  lineHeight: 1.55,
                }}
              >
                Araç tarihleriniz yaklaşınca otomatik e-posta gönderilir.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(135px, 1fr))",
                  gap: "8px",
                }}
              >
                {[
                  ["🚗 Muayene", `${hatirlatmaGunu} gün önce`],
                  ["🛡️ Sigorta", "7 gün önce"],
                  ["📄 Seyrüsefer", "14 gün önce"],
                  ["🔧 Bakım", "14 gün önce"],
                ].map(([baslik, zaman]) => (
                  <div
                    key={String(baslik)}
                    style={{
                      padding: "10px 11px",
                      borderRadius: "9px",
                      backgroundColor: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        color: "#6B7280",
                        fontSize: "12px",
                        fontWeight: 700,
                      }}
                    >
                      {baslik}
                    </span>

                    <strong
                      style={{
                        display: "block",
                        marginTop: "4px",
                        fontSize: "14px",
                      }}
                    >
                      {zaman}
                    </strong>
                  </div>
                ))}
              </div>

              <div
                style={{
                  paddingTop: "2px",
                  color: "#6B7280",
                  fontSize: "12px",
                  lineHeight: 1.5,
                  overflowWrap: "anywhere",
                }}
              >
                Bildirim adresi: <strong>{bildirimEmaili}</strong>
              </div>
            </div>
          </section>
        )}

        {!yukleniyor && araclar.length > 0 && (
          <section
            className="dashboard-notification-center"
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
                  Bildirim Merkezi
                </h2>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: "#6B7280",
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
                    fontWeight: 700,
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
                  borderRadius: "9px",
                  backgroundColor: "#F0FDF4",
                  color: "#166534",
                  fontWeight: 700,
                }}
              >
                Şu anda yaklaşan veya geciken bir işleminiz yok.
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
                        borderRadius: "9px",
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
                          color: "#6B7280",
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
                color: "#6B7280",
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
                borderRadius: "9px",
                backgroundColor: "#1D4ED8",
                color: "#FFFFFF",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              İlk Aracımı Ekle
            </Link>
          </section>
        )}

        {!yukleniyor && araclar.length > 0 && (
          <section className="dashboard-vehicles-section">
            <h2
              style={{
                margin: "0 0 20px",
                fontSize: "26px",
              }}
            >
              Araçlarım
            </h2>

            <div
              className="dashboard-vehicles-grid"
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
                    className="dashboard-vehicle-card"
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
                            color: "#1D4ED8",
                            fontSize: "18px",
                            fontWeight: 700,
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
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "38px",
                          height: "38px",
                          borderRadius: "9px",
                          border: "1px solid #E5E7EB",
                          backgroundColor: "#F8FAFC",
                          color: "#6B7280",
                          fontSize: "12px",
                          fontWeight: 700,
                          letterSpacing: "0.04em",
                        }}
                      >
                        ARAÇ
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
                          borderRadius: "9px",
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
                            color: "#6B7280",
                          }}
                        >
                          {arac.yil ?? "Belirtilmedi"}
                        </span>
                      </div>

                      <div
                        style={{
                          padding: "12px",
                          border: "1px solid #E2E8F0",
                          borderRadius: "9px",
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
                            color: "#6B7280",
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
                        borderRadius: "9px",
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
                      className="dashboard-vehicle-actions"
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
                          "#FFFFFF",
                          "#111827",
                          "#D7DCE3"
                        )}
                      >
                        Detay
                      </Link>

                      <Link
                        href={`/bakim-ekle/${arac.id}`}
                        className="dashboard-maintenance-add-button"
                        style={butonStili(
                          "#111827",
                          "#FFFFFF",
                          "#374151"
                        )}
                      >
                        Bakım Ekle
                      </Link>

                      <Link
                        href={`/bakim-gecmisi/${arac.id}`}
                        style={butonStili(
                          "#F8FAFC",
                          "#374151",
                          "#D7DCE3"
                        )}
                      >
                        Bakım Geçmişi
                      </Link>

                      <Link
                        href={`/arac-duzenle/${arac.id}`}
                        style={butonStili(
                          "#1D4ED8",
                          "#FFFFFF"
                        )}
                      >
                        Düzenle
                      </Link>

                      <button
                        type="button"
                        onClick={() => setSilinecekArac(arac)}
                        disabled={silinenAracId === arac.id}
                        style={{
                          padding: "11px 14px",
                          border: "1px solid #F1C7C7",
                          borderRadius: "9px",
                          backgroundColor:
                            silinenAracId === arac.id
                              ? "#AAB2BD"
                              : "#FFFFFF",
                          color:
                            silinenAracId === arac.id
                              ? "#FFFFFF"
                              : "#B42318",
                          fontWeight: 700,
                          cursor:
                            silinenAracId === arac.id
                              ? "not-allowed"
                              : "pointer",
                        }}
                      >
                        {silinenAracId === arac.id
                          ? "Siliniyor..."
                          : "Sil"}
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
              borderRadius: "14px",
              backgroundColor: "#FFFFFF",
              boxShadow:
                "0 18px 50px rgba(15, 23, 42, 0.16)",
            }}
          >
            <div
              style={{
                width: "54px",
                height: "54px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "14px",
                backgroundColor: "#FEF2F2",
                fontSize: "27px",
              }}
            >
              Sil
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
                color: "#6B7280",
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
                borderRadius: "9px",
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
                  color: "#1D4ED8",
                  fontWeight: 700,
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
                  borderRadius: "9px",
                  backgroundColor: "#FFFFFF",
                  color: "#111827",
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
                  borderRadius: "9px",
                  backgroundColor: silinenAracId
                    ? "#94A3B8"
                    : "#DC2626",
                  color: "#FFFFFF",
                  fontWeight: 700,
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

      <style jsx global>{`

        .dashboard-maintenance-add-button {
          background-color: #111827 !important;
          color: #ffffff !important;
          border: 1px solid #374151 !important;
        }

        @media (prefers-color-scheme: dark) {
          .dashboard-maintenance-add-button {
            background-color: #334155 !important;
            color: #ffffff !important;
            border-color: #64748b !important;
          }

          .dashboard-maintenance-add-button:hover {
            background-color: #475569 !important;
          }
        }

        @media (max-width: 700px) {
          .dashboard-page {
            padding: 22px 14px 44px !important;
            overflow-x: hidden;
          }

          .dashboard-header {
            gap: 18px !important;
            margin-bottom: 22px !important;
          }

          .dashboard-top-actions {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
          }

          .dashboard-top-actions > a,
          .dashboard-top-actions > button {
            width: 100% !important;
            min-width: 0 !important;
            min-height: 44px;
            padding: 10px 8px !important;
            font-size: 12px !important;
            line-height: 1.25;
          }

          .dashboard-top-actions > :nth-child(5) {
            grid-column: 1 / -1;
          }

          .dashboard-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
            margin-bottom: 22px !important;
          }

          .dashboard-stats > div {
            min-width: 0;
            padding: 16px !important;
          }

          .dashboard-stats > div:last-child {
            grid-column: 1 / -1;
          }

          .dashboard-email-card,
          .dashboard-notification-center {
            padding: 16px !important;
          }

          .dashboard-notification-center a {
            align-items: flex-start !important;
            gap: 10px !important;
            padding: 13px !important;
          }

          .dashboard-vehicles-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 14px !important;
          }

          .dashboard-vehicle-card {
            min-width: 0;
            padding: 17px !important;
          }

          .dashboard-vehicle-card h3 {
            overflow-wrap: anywhere;
          }

          .dashboard-vehicle-actions {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 8px !important;
            margin-top: 18px !important;
          }

          .dashboard-vehicle-actions > a,
          .dashboard-vehicle-actions > button {
            width: 100% !important;
            min-width: 0 !important;
            padding: 11px 7px !important;
            font-size: 13px !important;
          }

          .dashboard-vehicle-actions > :last-child {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 380px) {
          .dashboard-page {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .dashboard-top-actions,
          .dashboard-stats,
          .dashboard-vehicle-actions {
            grid-template-columns: 1fr !important;
          }

          .dashboard-top-actions > :nth-child(5),
          .dashboard-stats > div:last-child,
          .dashboard-vehicle-actions > :last-child {
            grid-column: auto;
          }
        }
      `}</style>
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
    borderRadius: "9px",
    backgroundColor,
    color,
    textAlign: "center" as const,
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 650,
  };
}

function ustButonStili(
  backgroundColor: string,
  color: string,
  borderColor?: string
) {
  return {
    padding: "11px 14px",
    border: borderColor
      ? `1px solid ${borderColor}`
      : "none",
    borderRadius: "9px",
    backgroundColor,
    color,
    textDecoration: "none",
    fontWeight: 700,
    whiteSpace: "nowrap" as const,
  };
}