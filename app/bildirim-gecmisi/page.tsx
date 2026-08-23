"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../lib/supabase";

type NotificationRecord = {
  id: string;
  user_id: string;
  vehicle_id: string;
  schedule_id: string | null;
  notification_type: string;
  recipient_email: string | null;
  sent_at: string | null;
  email_provider_id: string | null;
  created_at: string | null;
};

type Vehicle = {
  id: string;
  plaka: string;
  marka: string;
  model: string;
};

type BildirimGorunumu = {
  baslik: string;
  ikon: string;
  tur: "muayene" | "sigorta" | "seyrusefer" | "bakim" | "diger";
  arkaPlan: string;
  renk: string;
  kenarlik: string;
};

export default function BildirimGecmisiPage() {
  const router = useRouter();

  const [bildirimler, setBildirimler] = useState<NotificationRecord[]>([]);
  const [araclar, setAraclar] = useState<Vehicle[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [hata, setHata] = useState("");

  useEffect(() => {
    async function verileriGetir() {
      setHata("");
      setYukleniyor(true);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          router.replace("/giris");
          return;
        }

        const [bildirimSonucu, aracSonucu] = await Promise.all([
          supabase
            .from("inspection_notifications")
            .select(`
              id,
              user_id,
              vehicle_id,
              schedule_id,
              notification_type,
              recipient_email,
              sent_at,
              email_provider_id,
              created_at
            `)
            .eq("user_id", user.id)
            .order("sent_at", { ascending: false }),

          supabase
            .from("vehicles")
            .select(`
              id,
              plaka,
              marka,
              model
            `)
            .eq("user_id", user.id),
        ]);

        if (bildirimSonucu.error) {
          setHata(bildirimSonucu.error.message);
          return;
        }

        if (aracSonucu.error) {
          setHata(aracSonucu.error.message);
          return;
        }

        setBildirimler(bildirimSonucu.data ?? []);
        setAraclar(aracSonucu.data ?? []);
      } catch {
        setHata("Bildirim geçmişi alınırken beklenmeyen bir hata oluştu.");
      } finally {
        setYukleniyor(false);
      }
    }

    verileriGetir();
  }, [router]);

  const aracHaritasi = useMemo(() => {
    const map = new Map<string, Vehicle>();

    araclar.forEach((arac) => {
      map.set(arac.id, arac);
    });

    return map;
  }, [araclar]);

  function bildirimTurunuBul(notificationType: string): BildirimGorunumu {
    const tip = notificationType.toLowerCase();

    if (tip.startsWith("sigorta_")) {
      return {
        baslik: "Sigorta Hatırlatması",
        ikon: "🛡️",
        tur: "sigorta",
        arkaPlan: "#EFF6FF",
        renk: "#1D4ED8",
        kenarlik: "#BFDBFE",
      };
    }

    if (tip.startsWith("seyrusefer_")) {
      return {
        baslik: "Seyrüsefer Hatırlatması",
        ikon: "📄",
        tur: "seyrusefer",
        arkaPlan: "#F5F3FF",
        renk: "#6D28D9",
        kenarlik: "#DDD6FE",
      };
    }

    if (tip.startsWith("bakim_")) {
      return {
        baslik: "Bakım Hatırlatması",
        ikon: "🔧",
        tur: "bakim",
        arkaPlan: "#F0FDF4",
        renk: "#166534",
        kenarlik: "#BBF7D0",
      };
    }

    if (tip.includes("days_before")) {
      return {
        baslik: "Muayene Hatırlatması",
        ikon: "🚗",
        tur: "muayene",
        arkaPlan: "#FFF7ED",
        renk: "#C2410C",
        kenarlik: "#FED7AA",
      };
    }

    return {
      baslik: "Bildirim",
      ikon: "🔔",
      tur: "diger",
      arkaPlan: "#F8FAFC",
      renk: "#475569",
      kenarlik: "#E2E8F0",
    };
  }

  function tarihSaatFormatla(tarih: string | null) {
    if (!tarih) {
      return "Tarih bulunamadı";
    }

    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(tarih));
  }

  const toplamMuayene = bildirimler.filter(
    (bildirim) =>
      bildirimTurunuBul(bildirim.notification_type).tur === "muayene"
  ).length;

  const toplamSigorta = bildirimler.filter(
    (bildirim) =>
      bildirimTurunuBul(bildirim.notification_type).tur === "sigorta"
  ).length;

  const toplamSeyrusefer = bildirimler.filter(
    (bildirim) =>
      bildirimTurunuBul(bildirim.notification_type).tur === "seyrusefer"
  ).length;

  const toplamBakim = bildirimler.filter(
    (bildirim) =>
      bildirimTurunuBul(bildirim.notification_type).tur === "bakim"
  ).length;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 24px 64px",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
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
              Gönderilen bildirimler
            </h1>
            <p
              style={{
                margin: "9px 0 0",
                color: "var(--muted)",
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              Araçlarınız için gönderilen e-posta hatırlatmalarının geçmişini görüntüleyin.
            </p>
          </div>

          <Link
            href="/bildirim-ayarlari"
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
            Bildirim Ayarları
          </Link>
        </header>

        {!yukleniyor && (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "12px",
            }}
          >
            <OzetKart baslik="Toplam" deger={bildirimler.length} />
            <OzetKart baslik="Muayene" deger={toplamMuayene} />
            <OzetKart baslik="Sigorta" deger={toplamSigorta} />
            <OzetKart baslik="Seyrüsefer" deger={toplamSeyrusefer} />
            <OzetKart baslik="Bakım" deger={toplamBakim} />
          </section>
        )}

        {hata && (
          <div
            role="alert"
            style={{
              marginTop: "18px",
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

        {yukleniyor && (
          <section
            style={{
              marginTop: "18px",
              padding: "24px",
              borderRadius: "14px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--card)",
              color: "var(--muted)",
              fontSize: "14px",
            }}
          >
            Bildirim geçmişi yükleniyor...
          </section>
        )}

        {!yukleniyor && !hata && bildirimler.length === 0 && (
          <section
            style={{
              marginTop: "18px",
              padding: "32px",
              borderRadius: "14px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--card)",
              textAlign: "center",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "20px" }}>
              Henüz gönderilen bildirim yok
            </h2>
            <p
              style={{
                margin: "8px 0 0",
                color: "var(--muted)",
                fontSize: "14px",
                lineHeight: 1.6,
              }}
            >
              Bir araç hatırlatması gönderildiğinde kayıt burada görünecek.
            </p>
          </section>
        )}

        {!yukleniyor && bildirimler.length > 0 && (
          <section style={{ marginTop: "18px", display: "grid", gap: "12px" }}>
            {bildirimler.map((bildirim) => {
              const gorunum = bildirimTurunuBul(bildirim.notification_type);
              const arac = aracHaritasi.get(bildirim.vehicle_id);

              return (
                <article
                  key={bildirim.id}
                  style={{
                    padding: "20px",
                    borderRadius: "14px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
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
                            fontSize: "18px",
                            letterSpacing: "-0.2px",
                          }}
                        >
                          {gorunum.baslik}
                        </h2>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "999px",
                            border: "1px solid var(--border)",
                            backgroundColor: "var(--card-soft)",
                            color: "var(--muted)",
                            fontSize: "11px",
                            fontWeight: 700,
                          }}
                        >
                          Gönderildi
                        </span>
                      </div>

                      <p
                        style={{
                          margin: "7px 0 0",
                          color: "var(--muted)",
                          fontSize: "14px",
                        }}
                      >
                        {arac
                          ? `${arac.marka} ${arac.model} – ${arac.plaka}`
                          : "Araç bilgisi bulunamadı"}
                      </p>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <strong style={{ display: "block", fontSize: "13px" }}>
                        {tarihSaatFormatla(
                          bildirim.sent_at ?? bildirim.created_at
                        )}
                      </strong>
                      <span
                        style={{
                          display: "block",
                          marginTop: "4px",
                          color: "var(--muted)",
                          fontSize: "11px",
                        }}
                      >
                        Gönderim zamanı
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "10px",
                      marginTop: "16px",
                    }}
                  >
                    <BilgiKutusu
                      baslik="Alıcı"
                      deger={bildirim.recipient_email ?? "E-posta bulunamadı"}
                    />
                    <BilgiKutusu
                      baslik="Bildirim türü"
                      deger={bildirim.notification_type}
                    />
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

function OzetKart({
  baslik,
  deger,
}: {
  baslik: string;
  deger: number;
}) {
  return (
    <div
      style={{
        padding: "18px",
        borderRadius: "14px",
        border: "1px solid var(--border)",
        backgroundColor: "var(--card)",
        boxShadow: "0 1px 2px rgba(15,23,42,.03)",
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
          fontSize: "24px",
          color: "var(--foreground)",
        }}
      >
        {deger}
      </strong>
    </div>
  );
}

function BilgiKutusu({
  baslik,
  deger,
}: {
  baslik: string;
  deger: string;
}) {
  return (
    <div
      style={{
        padding: "12px",
        borderRadius: "9px",
        backgroundColor: "var(--card-soft)",
        border: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          display: "block",
          color: "var(--muted)",
          fontSize: "12px",
        }}
      >
        {baslik}
      </span>
      <strong
        style={{
          display: "block",
          marginTop: "5px",
          fontSize: "13px",
          overflowWrap: "anywhere",
        }}
      >
        {deger}
      </strong>
    </div>
  );
}