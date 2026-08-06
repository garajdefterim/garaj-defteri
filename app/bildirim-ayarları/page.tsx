"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";

type NotificationSettings = {
  user_id: string;
  email: string;
  inspection_email_enabled: boolean;
  inspection_reminder_days: number;
};

export default function BildirimAyarlariPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [bildirimAcik, setBildirimAcik] = useState(true);
  const [hatirlatmaGunu, setHatirlatmaGunu] = useState("7");
  const [kayitliAracSayisi, setKayitliAracSayisi] = useState(0);
  const [sonGonderimTarihi, setSonGonderimTarihi] = useState<string | null>(null);

  const [sayfaYukleniyor, setSayfaYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    async function verileriGetir() {
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

      const [ayarSonucu, aracSonucu, sonBildirimSonucu] = await Promise.all([
        supabase
          .from("notification_settings")
          .select(`
            user_id,
            email,
            inspection_email_enabled,
            inspection_reminder_days
          `)
          .eq("user_id", user.id)
          .maybeSingle(),

        supabase
          .from("vehicles")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id),

        supabase
          .from("inspection_notifications")
          .select("sent_at")
          .eq("user_id", user.id)
          .order("sent_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      if (ayarSonucu.error) {
        setHata(ayarSonucu.error.message);
        setSayfaYukleniyor(false);
        return;
      }

      const mevcutAyar = ayarSonucu.data as NotificationSettings | null;

      setEmail(mevcutAyar?.email ?? user.email ?? "");
      setBildirimAcik(mevcutAyar?.inspection_email_enabled ?? true);
      setHatirlatmaGunu(
        String(mevcutAyar?.inspection_reminder_days ?? 7)
      );

      setKayitliAracSayisi(aracSonucu.count ?? 0);
      setSonGonderimTarihi(
        sonBildirimSonucu.data?.sent_at ?? null
      );

      setSayfaYukleniyor(false);
    }

    verileriGetir();
  }, [router]);

  function tarihSaatFormatla(tarih: string | null) {
    if (!tarih) {
      return "Henüz e-posta gönderilmedi";
    }

    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(tarih));
  }

  async function ayarlariKaydet(
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

      const temizEmail = email.trim().toLowerCase();
      const gunSayisi = Number(hatirlatmaGunu);

      if (!temizEmail) {
        setHata("Lütfen bildirim e-posta adresini girin.");
        return;
      }

      if (
        !Number.isInteger(gunSayisi) ||
        gunSayisi < 1 ||
        gunSayisi > 90
      ) {
        setHata("Hatırlatma günü 1 ile 90 arasında olmalıdır.");
        return;
      }

      const { error } = await supabase
        .from("notification_settings")
        .upsert(
          {
            user_id: user.id,
            email: temizEmail,
            inspection_email_enabled: bildirimAcik,
            inspection_reminder_days: gunSayisi,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "user_id",
          }
        );

      if (error) {
        setHata(error.message);
        return;
      }

      setEmail(temizEmail);
      setMesaj("Bildirim ayarlarınız başarıyla kaydedildi.");
    } catch {
      setHata(
        "Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin."
      );
    } finally {
      setKaydediliyor(false);
    }
  }

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
        Bildirim ayarları yükleniyor...
      </main>
    );
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
          maxWidth: "900px",
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

          <Link
            href="/bildirim-gecmisi"
            style={{
              padding: "11px 16px",
              borderRadius: "10px",
              border: "1px solid #A5B4FC",
              backgroundColor: "#EEF2FF",
              color: "#3730A3",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            📨 Gönderilen Bildirimler
          </Link>
        </div>

        <section
          style={{
            padding: "30px",
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
              gap: "18px",
              alignItems: "flex-start",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "34px",
                  color: "#0F172A",
                }}
              >
                🔔 Bildirim Ayarları
              </h1>

              <p
                style={{
                  margin: "10px 0 0",
                  color: "#64748B",
                  lineHeight: 1.6,
                }}
              >
                Resmî muayene dönemi yaklaşırken gönderilecek
                e-postaları buradan yönetebilirsiniz.
              </p>
            </div>

            <span
              style={{
                padding: "7px 12px",
                borderRadius: "999px",
                border: bildirimAcik
                  ? "1px solid #BBF7D0"
                  : "1px solid #FECACA",
                backgroundColor: bildirimAcik
                  ? "#F0FDF4"
                  : "#FEF2F2",
                color: bildirimAcik ? "#166534" : "#B91C1C",
                fontWeight: 800,
                fontSize: "14px",
              }}
            >
              {bildirimAcik ? "Bildirimler açık" : "Bildirimler kapalı"}
            </span>
          </div>
        </section>

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
              border: "1px solid #DBEAFE",
              borderRadius: "14px",
              backgroundColor: "#EFF6FF",
            }}
          >
            <span
              style={{
                display: "block",
                color: "#1D4ED8",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              🚗 Kayıtlı araç
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "7px",
                fontSize: "28px",
              }}
            >
              {kayitliAracSayisi}
            </strong>
          </div>

          <div
            style={{
              padding: "20px",
              border: "1px solid #FED7AA",
              borderRadius: "14px",
              backgroundColor: "#FFF7ED",
            }}
          >
            <span
              style={{
                display: "block",
                color: "#C2410C",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              ⏰ Hatırlatma zamanı
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "7px",
                fontSize: "23px",
              }}
            >
              {hatirlatmaGunu} gün önce
            </strong>
          </div>

          <div
            style={{
              padding: "20px",
              border: "1px solid #DDD6FE",
              borderRadius: "14px",
              backgroundColor: "#F5F3FF",
            }}
          >
            <span
              style={{
                display: "block",
                color: "#6D28D9",
                fontSize: "14px",
                fontWeight: 700,
              }}
            >
              📨 Son gönderim
            </span>

            <strong
              style={{
                display: "block",
                marginTop: "7px",
                fontSize: "16px",
                lineHeight: 1.5,
              }}
            >
              {tarihSaatFormatla(sonGonderimTarihi)}
            </strong>
          </div>
        </section>

        <form
          onSubmit={ayarlariKaydet}
          style={{
            marginTop: "22px",
            padding: "30px",
            border: "1px solid #E2E8F0",
            borderRadius: "18px",
            backgroundColor: "#FFFFFF",
            boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "22px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "18px",
                flexWrap: "wrap",
                padding: "18px",
                border: "1px solid #E2E8F0",
                borderRadius: "14px",
                backgroundColor: "#F8FAFC",
              }}
            >
              <div>
                <strong
                  style={{
                    display: "block",
                    fontSize: "17px",
                  }}
                >
                  Muayene e-posta bildirimleri
                </strong>

                <span
                  style={{
                    display: "block",
                    marginTop: "6px",
                    color: "#64748B",
                    fontSize: "14px",
                    lineHeight: 1.5,
                  }}
                >
                  Kapattığınızda otomatik muayene e-postaları gönderilmez.
                </span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={bildirimAcik}
                onClick={() => setBildirimAcik((mevcut) => !mevcut)}
                style={{
                  width: "58px",
                  height: "32px",
                  padding: "3px",
                  border: "none",
                  borderRadius: "999px",
                  backgroundColor: bildirimAcik
                    ? "#16A34A"
                    : "#CBD5E1",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    display: "block",
                    width: "26px",
                    height: "26px",
                    borderRadius: "50%",
                    backgroundColor: "#FFFFFF",
                    transform: bildirimAcik
                      ? "translateX(26px)"
                      : "translateX(0)",
                    transition: "transform 0.2s ease",
                    boxShadow: "0 2px 5px rgba(15, 23, 42, 0.2)",
                  }}
                />
              </button>
            </div>

            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                color: "#334155",
                fontWeight: 700,
              }}
            >
              Bildirim e-posta adresi
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="ornek@email.com"
                style={inputStyle}
              />
              <span
                style={{
                  color: "#94A3B8",
                  fontSize: "12px",
                  fontWeight: 400,
                }}
              >
                Muayene hatırlatma e-postaları bu adrese gönderilir.
              </span>
            </label>

            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                color: "#334155",
                fontWeight: 700,
              }}
            >
              Kaç gün önce hatırlatılsın?
              <select
                value={hatirlatmaGunu}
                onChange={(event) =>
                  setHatirlatmaGunu(event.target.value)
                }
                style={{
                  ...inputStyle,
                  cursor: "pointer",
                }}
              >
                <option value="1">1 gün önce</option>
                <option value="3">3 gün önce</option>
                <option value="7">7 gün önce</option>
                <option value="14">14 gün önce</option>
                <option value="30">30 gün önce</option>
              </select>
            </label>

            <div
              style={{
                padding: "16px",
                border: "1px solid #BFDBFE",
                borderRadius: "12px",
                backgroundColor: "#EFF6FF",
                color: "#1E3A8A",
                lineHeight: 1.6,
              }}
            >
              <strong style={{ display: "block" }}>
                Sistem nasıl çalışır?
              </strong>

              <span
                style={{
                  display: "block",
                  marginTop: "5px",
                  fontSize: "14px",
                }}
              >
                Garaj Defteri her gün resmî muayene takvimini kontrol eder.
                Aracınızın muayene dönemi seçtiğiniz gün sayısı kadar
                yaklaştığında yalnızca bir kez e-posta gönderilir.
              </span>
            </div>

            {hata && (
              <div
                role="alert"
                style={{
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
                ? "Ayarlar kaydediliyor..."
                : "Ayarları Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}