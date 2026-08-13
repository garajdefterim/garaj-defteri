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
        padding: "40px 24px",
        backgroundColor: "var(--background)",
        color: "var(--foreground)",
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
            gap: "14px",
            flexWrap: "wrap",
            marginBottom: "24px",
          }}
        >
          <Link
            href="/dashboard"
            style={{
              color: "#2563EB",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            ← Panele dön
          </Link>

          <Link
            href="/bildirim-ayarlari"
            style={{
              padding: "11px 16px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--card)",
              color: "var(--foreground)",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            🔔 Bildirim Ayarları
          </Link>
        </div>

        <section
          style={{
            padding: "30px",
            borderRadius: "18px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--card)",
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "34px",
            }}
          >
            📨 Gönderilen Bildirimler
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              color: "var(--muted)",
              lineHeight: 1.6,
            }}
          >
            Garaj Defteri tarafından gönderilen e-posta hatırlatmalarınızı
            buradan görebilirsiniz.
          </p>
        </section>

        {!yukleniyor && (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "14px",
              marginTop: "20px",
            }}
          >
            <OzetKart
              baslik="Toplam"
              deger={bildirimler.length}
              ikon="📨"
            />

            <OzetKart
              baslik="Muayene"
              deger={toplamMuayene}
              ikon="🚗"
            />

            <OzetKart
              baslik="Sigorta"
              deger={toplamSigorta}
              ikon="🛡️"
            />

            <OzetKart
              baslik="Seyrüsefer"
              deger={toplamSeyrusefer}
              ikon="📄"
            />

            <OzetKart
              baslik="Bakım"
              deger={toplamBakim}
              ikon="🔧"
            />
          </section>
        )}

        {hata && (
          <div
            role="alert"
            style={{
              marginTop: "20px",
              padding: "14px",
              borderRadius: "11px",
              border: "1px solid #FECACA",
              backgroundColor: "#FEF2F2",
              color: "#B91C1C",
            }}
          >
            {hata}
          </div>
        )}

        {yukleniyor && (
          <section
            style={{
              marginTop: "20px",
              padding: "28px",
              borderRadius: "18px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--card)",
              color: "var(--muted)",
            }}
          >
            Bildirim geçmişi yükleniyor...
          </section>
        )}

        {!yukleniyor && !hata && bildirimler.length === 0 && (
          <section
            style={{
              marginTop: "20px",
              padding: "32px",
              borderRadius: "18px",
              border: "1px solid var(--border)",
              backgroundColor: "var(--card)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "42px",
              }}
            >
              📨
            </div>

            <h2
              style={{
                margin: "14px 0 8px",
              }}
            >
              Henüz gönderilen bildirim yok
            </h2>

            <p
              style={{
                margin: 0,
                color: "var(--muted)",
                lineHeight: 1.6,
              }}
            >
              Muayene, sigorta, seyrüsefer veya bakım hatırlatması
              gönderildiğinde burada görünecek.
            </p>
          </section>
        )}

        {!yukleniyor && bildirimler.length > 0 && (
          <section
            style={{
              marginTop: "20px",
              display: "grid",
              gap: "14px",
            }}
          >
            {bildirimler.map((bildirim) => {
              const gorunum = bildirimTurunuBul(
                bildirim.notification_type
              );

              const arac = aracHaritasi.get(
                bildirim.vehicle_id
              );

              return (
                <article
                  key={bildirim.id}
                  style={{
                    padding: "20px",
                    borderRadius: "16px",
                    border: "1px solid var(--border)",
                    backgroundColor: "var(--card)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "16px",
                      alignItems: "flex-start",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        gap: "14px",
                        alignItems: "flex-start",
                        flex: "1 1 400px",
                      }}
                    >
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "14px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: gorunum.arkaPlan,
                          border: `1px solid ${gorunum.kenarlik}`,
                          fontSize: "24px",
                          flexShrink: 0,
                        }}
                      >
                        {gorunum.ikon}
                      </div>

                      <div>
                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                            alignItems: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          <h2
                            style={{
                              margin: 0,
                              fontSize: "19px",
                            }}
                          >
                            {gorunum.baslik}
                          </h2>

                          <span
                            style={{
                              padding: "5px 9px",
                              borderRadius: "999px",
                              backgroundColor: gorunum.arkaPlan,
                              border: `1px solid ${gorunum.kenarlik}`,
                              color: gorunum.renk,
                              fontSize: "12px",
                              fontWeight: 800,
                            }}
                          >
                            Gönderildi
                          </span>
                        </div>

                        <p
                          style={{
                            margin: "7px 0 0",
                            color: "var(--muted)",
                            lineHeight: 1.5,
                          }}
                        >
                          {arac
                            ? `${arac.marka} ${arac.model} – ${arac.plaka}`
                            : "Araç bilgisi bulunamadı"}
                        </p>
                      </div>
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                      }}
                    >
                      <strong
                        style={{
                          display: "block",
                          fontSize: "14px",
                        }}
                      >
                        {tarihSaatFormatla(
                          bildirim.sent_at ??
                            bildirim.created_at
                        )}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          marginTop: "5px",
                          color: "var(--muted)",
                          fontSize: "12px",
                        }}
                      >
                        Gönderim zamanı
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "10px",
                      marginTop: "18px",
                    }}
                  >
                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "11px",
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
                        Alıcı
                      </span>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "5px",
                          wordBreak: "break-word",
                        }}
                      >
                        {bildirim.recipient_email ??
                          "E-posta bulunamadı"}
                      </strong>
                    </div>

                    <div
                      style={{
                        padding: "12px",
                        borderRadius: "11px",
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
                        Bildirim türü
                      </span>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "5px",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {bildirim.notification_type}
                      </strong>
                    </div>
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
  ikon,
}: {
  baslik: string;
  deger: number;
  ikon: string;
}) {
  return (
    <div
      style={{
        padding: "18px",
        borderRadius: "14px",
        border: "1px solid var(--border)",
        backgroundColor: "var(--card)",
      }}
    >
      <span
        style={{
          display: "block",
          color: "var(--muted)",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        {ikon} {baslik}
      </span>

      <strong
        style={{
          display: "block",
          marginTop: "7px",
          fontSize: "26px",
          color: "var(--foreground)",
        }}
      >
        {deger}
      </strong>
    </div>
  );
}