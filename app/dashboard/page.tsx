"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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

export default function DashboardPage() {
  const router = useRouter();

  const [araclar, setAraclar] = useState<Vehicle[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
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

  async function cikisYap() {
    await supabase.auth.signOut();
    router.push("/giris");
    router.refresh();
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F8FAFC",
        padding: "40px 24px",
        fontFamily: "Arial, Helvetica, sans-serif",
        color: "#0F172A",
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
                fontSize: "38px",
                color: "#0F172A",
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

        {yukleniyor && (
          <section
            style={{
              padding: "30px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "18px",
            }}
          >
            Araçlar yükleniyor...
          </section>
        )}

        {hata && (
          <div
            role="alert"
            style={{
              padding: "14px",
              borderRadius: "10px",
              backgroundColor: "#FEF2F2",
              color: "#B91C1C",
              marginBottom: "24px",
            }}
          >
            {hata}
          </div>
        )}

        {!yukleniyor && !hata && araclar.length === 0 && (
          <section
            style={{
              padding: "34px",
              backgroundColor: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "18px",
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
                color: "#64748B",
                marginBottom: "22px",
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

        {!yukleniyor && !hata && araclar.length > 0 && (
          <section>
            <h2
              style={{
                margin: "0 0 20px",
                fontSize: "26px",
                color: "#0F172A",
              }}
            >
              Araçlarım
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "20px",
              }}
            >
              {araclar.map((arac) => (
                <article
                  key={arac.id}
                  style={{
                    backgroundColor: "#FFFFFF",
                    border: "1px solid #E2E8F0",
                    borderRadius: "18px",
                    padding: "26px",
                    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: "16px",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "23px",
                          color: "#0F172A",
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

                    <span
                      style={{
                        fontSize: "30px",
                      }}
                    >
                      🚘
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: "22px",
                      display: "grid",
                      gap: "12px",
                      color: "#475569",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#0F172A" }}>Yıl:</strong>{" "}
                      {arac.yil ?? "Belirtilmedi"}
                    </div>

                    <div>
                      <strong style={{ color: "#0F172A" }}>
                        Kilometre:
                      </strong>{" "}
                      {kilometreFormatla(arac.kilometre)}
                    </div>

                    <div>
                      <strong style={{ color: "#0F172A" }}>
                        Muayene:
                      </strong>{" "}
                      {tarihFormatla(arac.muayene_tarihi)}
                    </div>

                    <div>
                      <strong style={{ color: "#0F172A" }}>
                        Sigorta:
                      </strong>{" "}
                      {tarihFormatla(arac.sigorta_tarihi)}
                    </div>

                    <div>
                      <strong style={{ color: "#0F172A" }}>
                        Seyrüsefer:
                      </strong>{" "}
                      {tarihFormatla(arac.seyrusefer_tarihi)}
                    </div>

                    <div>
                      <strong style={{ color: "#0F172A" }}>
                        Son bakım:
                      </strong>{" "}
                      {tarihFormatla(arac.son_bakim_tarihi)}
                    </div>
                  </div>
                  <div
  style={{
    display: "flex",
    gap: "12px",
    marginTop: "24px",
    flexWrap: "wrap",
  }}
>
  <Link
    href={`/arac-duzenle/${arac.id}`}
    style={{
      padding: "10px 18px",
      backgroundColor: "#2563EB",
      color: "#FFFFFF",
      textDecoration: "none",
      borderRadius: "10px",
      fontWeight: 700,
    }}
  >
    ✏️ Düzenle
  </Link>

  <button
    type="button"
    style={{
      padding: "10px 18px",
      backgroundColor: "#DC2626",
      color: "#FFFFFF",
      border: "none",
      borderRadius: "10px",
      fontWeight: 700,
      cursor: "pointer",
    }}
  >
    🗑️ Sil
  </button>
</div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}