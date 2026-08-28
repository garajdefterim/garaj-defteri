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
  const [sonGonderimTarihi, setSonGonderimTarihi] =
    useState<string | null>(null);

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

      const mevcutAyar =
        ayarSonucu.data as NotificationSettings | null;

      setEmail(mevcutAyar?.email ?? user.email ?? "");
      setBildirimAcik(
        mevcutAyar?.inspection_email_enabled ?? true
      );
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
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        Bildirim ayarları yükleniyor...
      </main>
    );
  }

  const inputStyle = {
    width: "100%",
    height: "48px",
    padding: "0 14px",
    border: "1px solid var(--border-strong)",
    borderRadius: "9px",
    backgroundColor: "var(--input-bg)",
    color: "var(--foreground)",
    fontSize: "15px",
    boxSizing: "border-box" as const,
    outline: "none",
  };

  return (
    <main
      className="bildirim-ayarlari-page"
      style={{
        minHeight: "100vh",
        padding: "32px 24px 64px",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div className="bildirim-ayarlari-container" style={{ width: "100%", maxWidth: "960px", margin: "0 auto" }}>
        <header
          className="bildirim-ayarlari-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "28px",
          }}
        >
          <div>
            <Link
              href="/dashboard"
              style={{
                color: "var(--muted)",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              ← Dashboard
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
              Bildirim ayarları
            </h1>

            <p
              style={{
                margin: "9px 0 0",
                maxWidth: "650px",
                color: "var(--muted)",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              Araç tarihleri için gönderilen e-posta hatırlatmalarını yönetin.
            </p>
          </div>

          <Link
            href="/bildirim-gecmisi"
            style={{
              minHeight: "44px",
              padding: "0 15px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid var(--border-strong)",
              borderRadius: "9px",
              backgroundColor: "var(--card)",
              color: "var(--foreground)",
              fontSize: "14px",
              fontWeight: 650,
              textDecoration: "none",
            }}
          >
            Gönderilen Bildirimler
          </Link>
        </header>

        <section
          className="bildirim-ayarlari-stats"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {[
            ["Kayıtlı araç", String(kayitliAracSayisi)],
            ["Muayene hatırlatması", `${hatirlatmaGunu} gün önce`],
            ["Son gönderim", tarihSaatFormatla(sonGonderimTarihi)],
          ].map(([baslik, deger]) => (
            <div
              key={baslik}
              style={{
                padding: "20px",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                backgroundColor: "var(--card)",
                boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
              }}
            >
              <span
                style={{
                  display: "block",
                  color: "var(--muted)",
                  fontSize: "13px",
                  fontWeight: 600,
                }}
              >
                {baslik}
              </span>
              <strong
                style={{
                  display: "block",
                  marginTop: "7px",
                  fontSize: baslik === "Son gönderim" ? "16px" : "23px",
                  lineHeight: 1.4,
                  letterSpacing: "-0.3px",
                }}
              >
                {deger}
              </strong>
            </div>
          ))}
        </section>

        <section
          className="bildirim-ayarlari-plan"
          style={{
            marginTop: "16px",
            padding: "24px",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            backgroundColor: "var(--card)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px", letterSpacing: "-0.3px" }}>
            Hatırlatma planı
          </h2>
          <p
            style={{
              margin: "7px 0 18px",
              color: "var(--muted)",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            Sistemin araç tarihleri için kullandığı mevcut hatırlatma süreleri.
          </p>

          <div
            className="bildirim-ayarlari-plan-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "10px",
            }}
          >
            {[
              ["Muayene", `${hatirlatmaGunu} gün önce`],
              ["Sigorta", "7 gün önce"],
              ["Seyrüsefer", "14 gün önce"],
              ["Bakım", "14 gün önce"],
            ].map(([baslik, zaman]) => (
              <div
                key={baslik}
                style={{
                  padding: "15px",
                  border: "1px solid var(--border)",
                  borderRadius: "9px",
                  backgroundColor: "var(--card-soft)",
                }}
              >
                <span
                  style={{
                    display: "block",
                    color: "var(--muted)",
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {baslik}
                </span>
                <strong
                  style={{
                    display: "block",
                    marginTop: "6px",
                    fontSize: "16px",
                  }}
                >
                  {zaman}
                </strong>
              </div>
            ))}
          </div>
        </section>

        <form
          className="bildirim-ayarlari-form"
          onSubmit={ayarlariKaydet}
          style={{
            marginTop: "16px",
            padding: "24px",
            border: "1px solid var(--border)",
            borderRadius: "14px",
            backgroundColor: "var(--card)",
            boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px" }}>E-posta bildirimleri</h2>
          <p
            style={{
              margin: "7px 0 20px",
              color: "var(--muted)",
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            Bildirim durumunu, gönderim adresini ve muayene hatırlatma süresini
            belirleyin.
          </p>

          <div style={{ display: "grid", gap: "20px" }}>
            <div
              className="bildirim-ayarlari-switch-row"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "18px",
                flexWrap: "wrap",
                padding: "16px",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                backgroundColor: "var(--card-soft)",
              }}
            >
              <div style={{ maxWidth: "650px" }}>
                <strong style={{ display: "block", fontSize: "15px" }}>
                  E-posta hatırlatmaları
                </strong>
                <span
                  style={{
                    display: "block",
                    marginTop: "5px",
                    color: "var(--muted)",
                    fontSize: "13px",
                    lineHeight: 1.5,
                  }}
                >
                  Kapalı olduğunda araçlarınız için otomatik hatırlatma
                  e-postaları gönderilmez.
                </span>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={bildirimAcik}
                aria-label="E-posta bildirimlerini aç veya kapat"
                onClick={() => setBildirimAcik((mevcut) => !mevcut)}
                style={{
                  width: "52px",
                  height: "30px",
                  padding: "3px",
                  flexShrink: 0,
                  border: "none",
                  borderRadius: "999px",
                  backgroundColor: bildirimAcik ? "#1D4ED8" : "#9CA3AF",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    display: "block",
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    backgroundColor: "#FFFFFF",
                    transform: bildirimAcik
                      ? "translateX(22px)"
                      : "translateX(0)",
                    transition: "transform 0.2s ease",
                    boxShadow: "0 1px 3px rgba(15,23,42,.2)",
                  }}
                />
              </button>
            </div>

            <div
              style={{
                padding: "12px 13px",
                border: "1px solid var(--border)",
                borderRadius: "9px",
                backgroundColor: "var(--card-soft)",
                color: "var(--muted)",
                fontSize: "13px",
                lineHeight: 1.5,
              }}
            >
              Durum:{" "}
              <strong style={{ color: "var(--foreground)" }}>
                {bildirimAcik ? "Bildirimler açık" : "Bildirimler kapalı"}
              </strong>
            </div>

            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "7px",
                color: "var(--foreground)",
                fontSize: "14px",
                fontWeight: 600,
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
                  color: "var(--muted)",
                  fontSize: "12px",
                  fontWeight: 400,
                }}
              >
                Tüm araç hatırlatma e-postaları bu adrese gönderilir.
              </span>
            </label>

            <label
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "7px",
                color: "var(--foreground)",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Muayene hatırlatma süresi
              <select
                value={hatirlatmaGunu}
                onChange={(event) => setHatirlatmaGunu(event.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                <option value="1">1 gün önce</option>
                <option value="3">3 gün önce</option>
                <option value="7">7 gün önce</option>
                <option value="14">14 gün önce</option>
                <option value="30">30 gün önce</option>
              </select>
              <span
                style={{
                  color: "var(--muted)",
                  fontSize: "12px",
                  fontWeight: 400,
                  lineHeight: 1.5,
                }}
              >
                Bu ayar yalnızca muayene hatırlatmasını değiştirir.
              </span>
            </label>

            <div
              style={{
                padding: "15px",
                border: "1px solid var(--border)",
                borderRadius: "9px",
                backgroundColor: "var(--card-soft)",
                color: "var(--muted)",
                fontSize: "13px",
                lineHeight: 1.6,
              }}
            >
              GARAJ DEFRERİM araç tarihlerinizi düzenli olarak kontrol eder.
              Muayene için seçtiğiniz süre; sigorta için 7 gün, seyrüsefer ve
              bakım için 14 günlük süre kullanılır. Aynı hatırlatma yalnızca bir
              kez gönderilir.
            </div>

            {hata && (
              <div
                role="alert"
                style={{
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

            <div className="bildirim-ayarlari-save" style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={kaydediliyor}
                style={{
                  minWidth: "160px",
                  height: "46px",
                  padding: "0 18px",
                  border: "none",
                  borderRadius: "9px",
                  backgroundColor: kaydediliyor ? "#AAB2BD" : "#1D4ED8",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: kaydediliyor ? "not-allowed" : "pointer",
                }}
              >
                {kaydediliyor ? "Kaydediliyor..." : "Ayarları Kaydet"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx global>{`
        @media (max-width: 700px) {
          .bildirim-ayarlari-page {
            padding: 22px 14px 44px !important;
            overflow-x: hidden;
          }

          .bildirim-ayarlari-container {
            max-width: 100% !important;
          }

          .bildirim-ayarlari-header {
            align-items: stretch !important;
            gap: 14px !important;
            margin-bottom: 20px !important;
          }

          .bildirim-ayarlari-header > div {
            width: 100%;
          }

          .bildirim-ayarlari-header > a {
            width: 100% !important;
            min-height: 46px !important;
          }

          .bildirim-ayarlari-header h1 {
            margin-top: 12px !important;
            font-size: 30px !important;
            letter-spacing: -0.6px !important;
          }

          .bildirim-ayarlari-header p {
            font-size: 14px !important;
            line-height: 1.55 !important;
          }

          .bildirim-ayarlari-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }

          .bildirim-ayarlari-stats > div {
            min-width: 0;
            padding: 16px !important;
          }

          .bildirim-ayarlari-stats > div:last-child {
            grid-column: 1 / -1;
          }

          .bildirim-ayarlari-stats strong {
            overflow-wrap: anywhere;
          }

          .bildirim-ayarlari-plan,
          .bildirim-ayarlari-form {
            padding: 18px !important;
          }

          .bildirim-ayarlari-plan-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 9px !important;
          }

          .bildirim-ayarlari-plan-grid > div {
            min-width: 0;
            padding: 13px !important;
          }

          .bildirim-ayarlari-switch-row {
            align-items: flex-start !important;
            flex-wrap: nowrap !important;
            gap: 12px !important;
            padding: 14px !important;
          }

          .bildirim-ayarlari-switch-row > div {
            min-width: 0;
            flex: 1;
          }

          .bildirim-ayarlari-switch-row > button {
            flex-shrink: 0;
          }

          .bildirim-ayarlari-save {
            justify-content: stretch !important;
          }

          .bildirim-ayarlari-save > button {
            width: 100% !important;
            min-width: 0 !important;
            min-height: 46px !important;
          }
        }

        @media (max-width: 380px) {
          .bildirim-ayarlari-page {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .bildirim-ayarlari-stats,
          .bildirim-ayarlari-plan-grid {
            grid-template-columns: 1fr !important;
          }

          .bildirim-ayarlari-stats > div:last-child {
            grid-column: auto;
          }

          .bildirim-ayarlari-plan,
          .bildirim-ayarlari-form {
            padding: 15px !important;
          }
        }
      `}</style>
    </main>
  );
}