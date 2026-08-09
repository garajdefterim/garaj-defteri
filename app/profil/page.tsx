"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../../lib/supabase";

type ProfilBilgisi = {
  adSoyad: string;
  email: string;
  fotograf: string | null;
  provider: string;
  olusturulmaTarihi: string | null;
};

type Tema = "acik" | "koyu";

export default function ProfilPage() {
  const router = useRouter();

  const [profil, setProfil] = useState<ProfilBilgisi | null>(null);
  const [adSoyad, setAdSoyad] = useState("");
  const [email, setEmail] = useState("");

  const [tema, setTema] = useState<Tema>("acik");

  const [yukleniyor, setYukleniyor] = useState(true);
  const [kaydediliyor, setKaydediliyor] = useState(false);
  const [temaKaydediliyor, setTemaKaydediliyor] = useState(false);
  const [cikisYapiliyor, setCikisYapiliyor] = useState(false);

  const [hata, setHata] = useState("");
  const [mesaj, setMesaj] = useState("");

  useEffect(() => {
    async function profiliGetir() {
      setHata("");
      setYukleniyor(true);

      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.replace("/giris");
          return;
        }

        const metadata = user.user_metadata ?? {};

        const kullaniciAdi =
          metadata.full_name ||
          metadata.name ||
          metadata.ad_soyad ||
          "Garaj Defteri Kullanıcısı";

        const fotograf =
          metadata.avatar_url ||
          metadata.picture ||
          null;

        const provider =
          user.app_metadata?.provider === "google"
            ? "Google"
            : "E-posta";

        const bilgi: ProfilBilgisi = {
          adSoyad: kullaniciAdi,
          email: user.email ?? "",
          fotograf,
          provider,
          olusturulmaTarihi: user.created_at ?? null,
        };

        setProfil(bilgi);
        setAdSoyad(bilgi.adSoyad);
        setEmail(bilgi.email);

        const supabaseTema = metadata.tema;
        const localTema = localStorage.getItem("garaj-defteri-tema");

        let secilenTema: Tema = "acik";

        if (supabaseTema === "koyu" || supabaseTema === "acik") {
          secilenTema = supabaseTema;
        } else if (localTema === "koyu" || localTema === "acik") {
          secilenTema = localTema;
        }

        setTema(secilenTema);

        localStorage.setItem(
          "garaj-defteri-tema",
          secilenTema
        );

        document.documentElement.setAttribute(
          "data-theme",
          secilenTema
        );
      } catch {
        setHata("Profil bilgileri alınırken bir hata oluştu.");
      } finally {
        setYukleniyor(false);
      }
    }

    profiliGetir();
  }, [router]);

  async function bilgileriKaydet(
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
        router.replace("/giris");
        return;
      }

      const temizAd = adSoyad.trim();
      const temizEmail = email.trim().toLowerCase();

      if (!temizAd) {
        setHata("Ad soyad boş bırakılamaz.");
        return;
      }

      if (!temizEmail) {
        setHata("E-posta adresi boş bırakılamaz.");
        return;
      }

      const emailDegisti =
        temizEmail !== (user.email ?? "").toLowerCase();

      const { data, error } = await supabase.auth.updateUser({
        ...(emailDegisti
          ? {
              email: temizEmail,
            }
          : {}),
        data: {
          ...user.user_metadata,
          ad_soyad: temizAd,
          full_name: temizAd,
          name: temizAd,
          tema,
        },
      });

      if (error) {
        setHata(error.message);
        return;
      }

      setProfil((mevcut) =>
        mevcut
          ? {
              ...mevcut,
              adSoyad: temizAd,
              email: data.user?.email ?? temizEmail,
            }
          : mevcut
      );

      if (emailDegisti) {
        setMesaj(
          "Profil bilgileriniz kaydedildi. E-posta değişikliği için doğrulama bağlantısı gönderilmiş olabilir."
        );
      } else {
        setMesaj(
          "Profil bilgileriniz başarıyla kaydedildi."
        );
      }
    } catch {
      setHata(
        "Profil kaydedilirken beklenmeyen bir hata oluştu."
      );
    } finally {
      setKaydediliyor(false);
    }
  }

  async function temaDegistir(yeniTema: Tema) {
    setHata("");
    setMesaj("");
    setTemaKaydediliyor(true);

    // Önce anında ekrana uygula.
    setTema(yeniTema);

    localStorage.setItem(
      "garaj-defteri-tema",
      yeniTema
    );

    document.documentElement.setAttribute(
      "data-theme",
      yeniTema
    );

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setHata(
          "Tema hesabınıza kaydedilemedi. Lütfen tekrar giriş yapın."
        );
        return;
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          tema: yeniTema,
        },
      });

      if (error) {
        setHata(
          `Tema tercihi kaydedilemedi: ${error.message}`
        );
        return;
      }

      setMesaj(
        yeniTema === "koyu"
          ? "Koyu tema tercihiniz kaydedildi."
          : "Açık tema tercihiniz kaydedildi."
      );
    } catch {
      setHata(
        "Tema tercihi kaydedilirken bir hata oluştu."
      );
    } finally {
      setTemaKaydediliyor(false);
    }
  }

  async function cikisYap() {
    setHata("");
    setCikisYapiliyor(true);

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setHata(error.message);
        return;
      }

      router.replace("/giris");
      router.refresh();
    } catch {
      setHata("Çıkış yapılırken bir hata oluştu.");
    } finally {
      setCikisYapiliyor(false);
    }
  }

  function tarihFormatla(tarih: string | null) {
    if (!tarih) {
      return "Bilinmiyor";
    }

    return new Intl.DateTimeFormat("tr-TR", {
      dateStyle: "long",
    }).format(new Date(tarih));
  }

  if (yukleniyor) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--background)",
          color: "var(--foreground)",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        Profil yükleniyor...
      </main>
    );
  }

  const koyuTema = tema === "koyu";

  const sayfaArkaPlan = koyuTema
    ? "#0F172A"
    : "#F8FAFC";

  const kartArkaPlan = koyuTema
    ? "#1E293B"
    : "#FFFFFF";

  const anaRenk = koyuTema
    ? "#F8FAFC"
    : "#0F172A";

  const ikinciRenk = koyuTema
    ? "#CBD5E1"
    : "#64748B";

  const kenarlik = koyuTema
    ? "#334155"
    : "#E2E8F0";

  const inputArkaPlan = koyuTema
    ? "#0F172A"
    : "#FFFFFF";

  const kartStili = {
    padding: "26px",
    border: `1px solid ${kenarlik}`,
    borderRadius: "18px",
    backgroundColor: kartArkaPlan,
    boxShadow: koyuTema
      ? "none"
      : "0 10px 30px rgba(15, 23, 42, 0.06)",
  };

  const inputStili = {
    width: "100%",
    padding: "13px 14px",
    border: `1px solid ${
      koyuTema ? "#475569" : "#CBD5E1"
    }`,
    borderRadius: "10px",
    backgroundColor: inputArkaPlan,
    color: anaRenk,
    fontSize: "16px",
    boxSizing: "border-box" as const,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 24px",
        backgroundColor: sayfaArkaPlan,
        color: anaRenk,
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "820px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "14px",
            flexWrap: "wrap",
            alignItems: "center",
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

          <span
            style={{
              color: ikinciRenk,
              fontSize: "14px",
            }}
          >
            Hesap Ayarları
          </span>
        </div>

        <section
          style={{
            ...kartStili,
            marginTop: "24px",
            padding: "32px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            {profil?.fotograf ? (
              <img
                src={profil.fotograf}
                alt="Profil fotoğrafı"
                referrerPolicy="no-referrer"
                style={{
                  width: "92px",
                  height: "92px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "3px solid #DBEAFE",
                }}
              />
            ) : (
              <div
                style={{
                  width: "92px",
                  height: "92px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: koyuTema
                    ? "#334155"
                    : "#EFF6FF",
                  border: "3px solid #DBEAFE",
                  fontSize: "36px",
                }}
              >
                👤
              </div>
            )}

            <div>
              <p
                style={{
                  margin: "0 0 5px",
                  color: ikinciRenk,
                  fontSize: "13px",
                  fontWeight: 800,
                }}
              >
                HESABIM
              </p>

              <h1
                style={{
                  margin: 0,
                  fontSize: "30px",
                }}
              >
                {profil?.adSoyad}
              </h1>

              <p
                style={{
                  margin: "7px 0 0",
                  color: ikinciRenk,
                }}
              >
                {profil?.email}
              </p>
            </div>
          </div>
        </section>

        <form
          onSubmit={bilgileriKaydet}
          style={{
            ...kartStili,
            marginTop: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
            }}
          >
            👤 Kişisel Bilgiler
          </h2>

          <p
            style={{
              margin: "8px 0 22px",
              color: ikinciRenk,
              lineHeight: 1.5,
            }}
          >
            Hesabınızda görünen bilgileri buradan
            düzenleyebilirsiniz.
          </p>

          <div
            style={{
              display: "grid",
              gap: "18px",
            }}
          >
            <label
              style={{
                display: "grid",
                gap: "8px",
                fontWeight: 700,
              }}
            >
              Ad Soyad

              <input
                type="text"
                value={adSoyad}
                onChange={(event) =>
                  setAdSoyad(event.target.value)
                }
                style={inputStili}
              />
            </label>

            <label
              style={{
                display: "grid",
                gap: "8px",
                fontWeight: 700,
              }}
            >
              E-posta

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                style={inputStili}
              />

              <span
                style={{
                  color: ikinciRenk,
                  fontSize: "12px",
                  fontWeight: 400,
                }}
              >
                E-posta adresinizi değiştirirseniz yeni
                adresi doğrulamanız istenebilir.
              </span>
            </label>

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
                padding: "14px",
                border: "none",
                borderRadius: "10px",
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
                ? "Kaydediliyor..."
                : "Kişisel Bilgileri Kaydet"}
            </button>
          </div>
        </form>

        <section
          style={{
            ...kartStili,
            marginTop: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
            }}
          >
            🔐 Hesap Bilgileri
          </h2>

          <div
            style={{
              display: "grid",
              gap: "12px",
              marginTop: "20px",
            }}
          >
            <BilgiSatiri
              baslik="Giriş yöntemi"
              deger={
                profil?.provider === "Google"
                  ? "Google ile giriş"
                  : "E-posta ile giriş"
              }
              koyuTema={koyuTema}
            />

            <BilgiSatiri
              baslik="Hesap oluşturulma tarihi"
              deger={tarihFormatla(
                profil?.olusturulmaTarihi ?? null
              )}
              koyuTema={koyuTema}
            />
          </div>
        </section>

        <section
          style={{
            ...kartStili,
            marginTop: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
            }}
          >
            🎨 Görünüm
          </h2>

          <p
            style={{
              margin: "8px 0 20px",
              color: ikinciRenk,
              lineHeight: 1.5,
            }}
          >
            Tema tercihiniz hesabınıza kaydedilir ve tekrar
            giriş yaptığınızda hatırlanır.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(2, minmax(0, 1fr))",
              gap: "12px",
            }}
          >
            <button
              type="button"
              onClick={() => temaDegistir("acik")}
              disabled={temaKaydediliyor}
              style={{
                padding: "15px",
                borderRadius: "11px",
                border:
                  tema === "acik"
                    ? "2px solid #2563EB"
                    : `1px solid ${kenarlik}`,
                backgroundColor: "#FFFFFF",
                color: "#0F172A",
                fontWeight: 800,
                cursor: temaKaydediliyor
                  ? "not-allowed"
                  : "pointer",
                opacity: temaKaydediliyor ? 0.7 : 1,
              }}
            >
              ☀️ Açık Tema
            </button>

            <button
              type="button"
              onClick={() => temaDegistir("koyu")}
              disabled={temaKaydediliyor}
              style={{
                padding: "15px",
                borderRadius: "11px",
                border:
                  tema === "koyu"
                    ? "2px solid #60A5FA"
                    : "1px solid #475569",
                backgroundColor: "#0F172A",
                color: "#FFFFFF",
                fontWeight: 800,
                cursor: temaKaydediliyor
                  ? "not-allowed"
                  : "pointer",
                opacity: temaKaydediliyor ? 0.7 : 1,
              }}
            >
              🌙 Koyu Tema
            </button>
          </div>

          {temaKaydediliyor && (
            <p
              style={{
                margin: "14px 0 0",
                color: ikinciRenk,
                fontSize: "13px",
              }}
            >
              Tema tercihiniz kaydediliyor...
            </p>
          )}
        </section>

        <section
          style={{
            ...kartStili,
            marginTop: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
            }}
          >
            🔔 Bildirimler
          </h2>

          <p
            style={{
              margin: "8px 0 20px",
              color: ikinciRenk,
            }}
          >
            Muayene e-postalarını ve hatırlatma sürelerini
            yönetin.
          </p>

          <Link
            href="/bildirim-ayarlari"
            style={{
              display: "block",
              padding: "14px",
              borderRadius: "10px",
              backgroundColor: "#EFF6FF",
              border: "1px solid #BFDBFE",
              color: "#1D4ED8",
              textAlign: "center",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            🔔 Bildirim Ayarlarını Aç
          </Link>
        </section>

        <section
          style={{
            ...kartStili,
            marginTop: "20px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "22px",
            }}
          >
            🚪 Oturum
          </h2>

          <button
            type="button"
            onClick={cikisYap}
            disabled={cikisYapiliyor}
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #FECACA",
              backgroundColor: "#FEF2F2",
              color: "#B91C1C",
              fontSize: "16px",
              fontWeight: 800,
              cursor: cikisYapiliyor
                ? "not-allowed"
                : "pointer",
            }}
          >
            {cikisYapiliyor
              ? "Çıkış yapılıyor..."
              : "Çıkış Yap"}
          </button>
        </section>

        <section
          style={{
            marginTop: "20px",
            padding: "26px",
            borderRadius: "18px",
            border: "1px solid #FECACA",
            backgroundColor: koyuTema
              ? "#450A0A"
              : "#FFF7F7",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: koyuTema
                ? "#FCA5A5"
                : "#B91C1C",
              fontSize: "22px",
            }}
          >
            ⚠️ Tehlikeli Bölge
          </h2>

          <p
            style={{
              color: koyuTema
                ? "#FECACA"
                : "#64748B",
              lineHeight: 1.6,
            }}
          >
            Hesabınızı silme özelliğini güvenli sunucu
            fonksiyonu ile bağlayacağız. Bu işlem
            araçlarınızı ve hesap verilerinizi kalıcı olarak
            silebileceği için tarayıcı tarafında
            yapılmamalıdır.
          </p>

          <button
            type="button"
            disabled
            style={{
              width: "100%",
              padding: "14px",
              border: "none",
              borderRadius: "10px",
              backgroundColor: "#94A3B8",
              color: "#FFFFFF",
              fontSize: "16px",
              fontWeight: 800,
              cursor: "not-allowed",
            }}
          >
            Hesabımı Sil
          </button>
        </section>
      </div>
    </main>
  );
}

function BilgiSatiri({
  baslik,
  deger,
  koyuTema,
}: {
  baslik: string;
  deger: string;
  koyuTema: boolean;
}) {
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "11px",
        border: koyuTema
          ? "1px solid #475569"
          : "1px solid #E2E8F0",
        backgroundColor: koyuTema
          ? "#0F172A"
          : "#F8FAFC",
      }}
    >
      <span
        style={{
          display: "block",
          color: koyuTema
            ? "#94A3B8"
            : "#64748B",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        {baslik}
      </span>

      <strong
        style={{
          display: "block",
          marginTop: "6px",
        }}
      >
        {deger}
      </strong>
    </div>
  );
}