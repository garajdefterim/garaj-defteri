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
  const [silmePenceresiAcik, setSilmePenceresiAcik] = useState(false);
  const [hesapSiliniyor, setHesapSiliniyor] = useState(false);

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
          "GARAJ DEFTERİ Kullanıcısı";

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

  function hesapSilmePenceresiniAc() {
    setHata("");
    setMesaj("");
    setSilmePenceresiAcik(true);
  }

  function hesapSilmePenceresiniKapat() {
    if (hesapSiliniyor) return;

    setSilmePenceresiAcik(false);
  }

  async function hesabiKaliciSil() {
    setHata("");
    setMesaj("");
    setHesapSiliniyor(true);

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        setHata("Oturum doğrulanamadı. Lütfen tekrar giriş yapın.");
        return;
      }

      const { data, error } = await supabase.functions.invoke(
        "delete-account",
        {
          body: {},
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (error) {
        console.error("delete-account çağrı hatası:", error);
        setHata("Hesap silinemedi. Lütfen tekrar deneyin.");
        return;
      }

      if (!data?.success) {
        setHata(
          data?.error ||
            "Hesap silme işlemi tamamlanamadı. Lütfen tekrar deneyin."
        );
        return;
      }

      try {
        await supabase.auth.signOut();
      } catch {
        // Kullanıcı sunucuda silindiği için yerel oturumu ayrıca temizlemeye devam ediyoruz.
      }

      localStorage.removeItem("garaj-defteri-tema");
      document.documentElement.setAttribute("data-theme", "acik");

      router.replace("/giris");
      router.refresh();
    } catch (error) {
      console.error("Hesap silme hatası:", error);
      setHata("Hesap silinirken beklenmeyen bir hata oluştu.");
    } finally {
      setHesapSiliniyor(false);
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
          backgroundColor: "#F7F8FA",
          color: "#111827",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        Profil yükleniyor...
      </main>
    );
  }

  const koyuTema = tema === "koyu";

  const sayfaArkaPlan = koyuTema ? "#0B1220" : "#F7F8FA";
  const kartArkaPlan = koyuTema ? "#111827" : "#FFFFFF";
  const anaRenk = koyuTema ? "#F9FAFB" : "#111827";
  const ikinciRenk = koyuTema ? "#9CA3AF" : "#6B7280";
  const kenarlik = koyuTema ? "#293241" : "#E3E7EC";
  const inputArkaPlan = koyuTema ? "#0B1220" : "#FFFFFF";

  const kartStili = {
    padding: "24px",
    border: `1px solid ${kenarlik}`,
    borderRadius: "14px",
    backgroundColor: kartArkaPlan,
    boxShadow: koyuTema
      ? "none"
      : "0 1px 2px rgba(15, 23, 42, 0.03)",
  };

  const inputStili = {
    width: "100%",
    height: "48px",
    padding: "0 14px",
    border: `1px solid ${koyuTema ? "#374151" : "#D7DCE3"}`,
    borderRadius: "9px",
    backgroundColor: inputArkaPlan,
    color: anaRenk,
    fontSize: "15px",
    boxSizing: "border-box" as const,
    outline: "none",
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px 24px 64px",
        backgroundColor: sayfaArkaPlan,
        color: anaRenk,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            flexWrap: "wrap",
            alignItems: "center",
            marginBottom: "28px",
          }}
        >
          <div>
            <Link
              href="/dashboard"
              style={{
                color: ikinciRenk,
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
              Profil
            </h1>

            <p
              style={{
                margin: "8px 0 0",
                color: ikinciRenk,
                fontSize: "15px",
                lineHeight: 1.6,
              }}
            >
              Hesap bilgilerinizi ve tercihlerinizi yönetin.
            </p>
          </div>
        </header>

        <section
          style={{
            ...kartStili,
            padding: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              flexWrap: "wrap",
            }}
          >
            {profil?.fotograf ? (
              <img
                src={profil.fotograf}
                alt="Profil fotoğrafı"
                referrerPolicy="no-referrer"
                style={{
                  width: "76px",
                  height: "76px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `1px solid ${kenarlik}`,
                }}
              />
            ) : (
              <div
                aria-hidden="true"
                style={{
                  width: "76px",
                  height: "76px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: koyuTema ? "#1F2937" : "#F3F4F6",
                  border: `1px solid ${kenarlik}`,
                  color: ikinciRenk,
                  fontSize: "22px",
                  fontWeight: 700,
                }}
              >
                {(profil?.adSoyad || "G").trim().charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "24px",
                  lineHeight: 1.2,
                  letterSpacing: "-0.5px",
                }}
              >
                {profil?.adSoyad}
              </h2>

              <p
                style={{
                  margin: "7px 0 0",
                  color: ikinciRenk,
                  fontSize: "14px",
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
            marginTop: "16px",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "20px", letterSpacing: "-0.3px" }}>
            Kişisel bilgiler
          </h2>

          <p
            style={{
              margin: "7px 0 20px",
              color: ikinciRenk,
              fontSize: "14px",
              lineHeight: 1.55,
            }}
          >
            Hesabınızda kullanılan ad ve e-posta adresini güncelleyin.
          </p>

          <div style={{ display: "grid", gap: "18px" }}>
            <label
              style={{
                display: "grid",
                gap: "7px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              Ad Soyad
              <input
                type="text"
                value={adSoyad}
                onChange={(event) => setAdSoyad(event.target.value)}
                style={inputStili}
              />
            </label>

            <label
              style={{
                display: "grid",
                gap: "7px",
                fontSize: "14px",
                fontWeight: 600,
              }}
            >
              E-posta
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                style={inputStili}
              />
              <span
                style={{
                  color: ikinciRenk,
                  fontSize: "12px",
                  fontWeight: 400,
                  lineHeight: 1.5,
                }}
              >
                E-posta adresinizi değiştirirseniz yeni adresi doğrulamanız
                istenebilir.
              </span>
            </label>

            {hata && (
              <div
                role="alert"
                style={{
                  padding: "12px 13px",
                  borderRadius: "8px",
                  border: "1px solid #F1C7C7",
                  backgroundColor: koyuTema ? "#2A1215" : "#FFF7F7",
                  color: koyuTema ? "#FCA5A5" : "#A93838",
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
                  backgroundColor: koyuTema ? "#10241A" : "#F7FCF9",
                  color: koyuTema ? "#86EFAC" : "#276749",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                {mesaj}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                type="submit"
                disabled={kaydediliyor}
                style={{
                  minWidth: "190px",
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
                {kaydediliyor ? "Kaydediliyor..." : "Bilgileri Kaydet"}
              </button>
            </div>
          </div>
        </form>

        <section style={{ ...kartStili, marginTop: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "20px" }}>Hesap bilgileri</h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
              marginTop: "18px",
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
              deger={tarihFormatla(profil?.olusturulmaTarihi ?? null)}
              koyuTema={koyuTema}
            />
          </div>
        </section>

        <section style={{ ...kartStili, marginTop: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "20px" }}>Görünüm</h2>

          <p
            style={{
              margin: "7px 0 18px",
              color: ikinciRenk,
              fontSize: "14px",
              lineHeight: 1.55,
            }}
          >
            Tema tercihiniz hesabınıza kaydedilir.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "10px",
            }}
          >
            <button
              type="button"
              onClick={() => temaDegistir("acik")}
              disabled={temaKaydediliyor}
              style={{
                minHeight: "48px",
                borderRadius: "9px",
                border:
                  tema === "acik"
                    ? "2px solid #1D4ED8"
                    : `1px solid ${kenarlik}`,
                backgroundColor: "#FFFFFF",
                color: "#111827",
                fontSize: "14px",
                fontWeight: 650,
                cursor: temaKaydediliyor ? "not-allowed" : "pointer",
                opacity: temaKaydediliyor ? 0.7 : 1,
              }}
            >
              Açık
            </button>

            <button
              type="button"
              onClick={() => temaDegistir("koyu")}
              disabled={temaKaydediliyor}
              style={{
                minHeight: "48px",
                borderRadius: "9px",
                border:
                  tema === "koyu"
                    ? "2px solid #60A5FA"
                    : "1px solid #374151",
                backgroundColor: "#111827",
                color: "#FFFFFF",
                fontSize: "14px",
                fontWeight: 650,
                cursor: temaKaydediliyor ? "not-allowed" : "pointer",
                opacity: temaKaydediliyor ? 0.7 : 1,
              }}
            >
              Koyu
            </button>
          </div>

          {temaKaydediliyor && (
            <p
              style={{
                margin: "12px 0 0",
                color: ikinciRenk,
                fontSize: "13px",
              }}
            >
              Tema tercihiniz kaydediliyor...
            </p>
          )}
        </section>

        <section style={{ ...kartStili, marginTop: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "20px" }}>Bildirimler</h2>

          <p
            style={{
              margin: "7px 0 18px",
              color: ikinciRenk,
              fontSize: "14px",
              lineHeight: 1.55,
            }}
          >
            E-posta hatırlatmalarını ve bildirim sürelerini yönetin.
          </p>

          <Link
            href="/bildirim-ayarlari"
            style={{
              minHeight: "46px",
              padding: "0 16px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${koyuTema ? "#374151" : "#D7DCE3"}`,
              borderRadius: "9px",
              backgroundColor: kartArkaPlan,
              color: koyuTema ? "#E5E7EB" : "#374151",
              fontSize: "14px",
              fontWeight: 650,
              textDecoration: "none",
            }}
          >
            Bildirim Ayarları
          </Link>
        </section>

        <section style={{ ...kartStili, marginTop: "16px" }}>
          <h2 style={{ margin: 0, fontSize: "20px" }}>Oturum</h2>

          <button
            type="button"
            onClick={cikisYap}
            disabled={cikisYapiliyor}
            style={{
              minHeight: "46px",
              marginTop: "18px",
              padding: "0 16px",
              borderRadius: "9px",
              border: `1px solid ${kenarlik}`,
              backgroundColor: kartArkaPlan,
              color: anaRenk,
              fontSize: "14px",
              fontWeight: 650,
              cursor: cikisYapiliyor ? "not-allowed" : "pointer",
            }}
          >
            {cikisYapiliyor ? "Çıkış yapılıyor..." : "Çıkış Yap"}
          </button>
        </section>

        <section
          style={{
            marginTop: "16px",
            padding: "24px",
            borderRadius: "14px",
            border: "1px solid #F1C7C7",
            backgroundColor: koyuTema ? "#241114" : "#FFFFFF",
          }}
        >
          <h2
            style={{
              margin: 0,
              color: koyuTema ? "#FCA5A5" : "#B42318",
              fontSize: "20px",
            }}
          >
            Hesabı sil
          </h2>

          <p
            style={{
              margin: "8px 0 18px",
              color: ikinciRenk,
              fontSize: "14px",
              lineHeight: 1.6,
            }}
          >
            Hesabınızı sildiğinizde araçlarınız, bakım kayıtlarınız, bildirim
            ayarlarınız ve hesap bilgileriniz kalıcı olarak silinir.
          </p>

          <button
            type="button"
            onClick={hesapSilmePenceresiniAc}
            style={{
              minHeight: "44px",
              padding: "0 16px",
              border: "1px solid #F1C7C7",
              borderRadius: "9px",
              backgroundColor: koyuTema ? "#241114" : "#FFFFFF",
              color: koyuTema ? "#FCA5A5" : "#B42318",
              fontSize: "14px",
              fontWeight: 650,
              cursor: "pointer",
            }}
          >
            Hesabımı Sil
          </button>
        </section>
      </div>

      {silmePenceresiAcik && (
        <div
          role="presentation"
          onClick={hesapSilmePenceresiniKapat}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            backgroundColor: "rgba(15, 23, 42, 0.58)",
            backdropFilter: "blur(3px)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="hesap-silme-basligi"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "480px",
              padding: "28px",
              borderRadius: "14px",
              border: `1px solid ${koyuTema ? "#4B2528" : "#F1C7C7"}`,
              backgroundColor: kartArkaPlan,
              color: anaRenk,
              boxShadow: "0 18px 50px rgba(15, 23, 42, 0.18)",
            }}
          >
            <h2
              id="hesap-silme-basligi"
              style={{
                margin: 0,
                fontSize: "23px",
                letterSpacing: "-0.4px",
              }}
            >
              Hesabınızı silmek istiyor musunuz?
            </h2>

            <p
              style={{
                margin: "10px 0 0",
                color: ikinciRenk,
                fontSize: "14px",
                lineHeight: 1.65,
              }}
            >
              Bu işlem geri alınamaz. Araçlarınız, bakım kayıtlarınız,
              bildirim ayarlarınız ve GARAJ DEFTERİ hesabınız kalıcı olarak
              silinecektir.
            </p>

            {hata && (
              <div
                role="alert"
                style={{
                  marginTop: "16px",
                  padding: "12px 13px",
                  borderRadius: "8px",
                  border: "1px solid #F1C7C7",
                  backgroundColor: koyuTema ? "#2A1215" : "#FFF7F7",
                  color: koyuTema ? "#FCA5A5" : "#A93838",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                {hata}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "24px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={hesapSilmePenceresiniKapat}
                disabled={hesapSiliniyor}
                style={{
                  minHeight: "44px",
                  padding: "0 16px",
                  borderRadius: "9px",
                  border: `1px solid ${kenarlik}`,
                  backgroundColor: kartArkaPlan,
                  color: anaRenk,
                  fontSize: "14px",
                  fontWeight: 650,
                  cursor: hesapSiliniyor ? "not-allowed" : "pointer",
                }}
              >
                Vazgeç
              </button>

              <button
                type="button"
                onClick={hesabiKaliciSil}
                disabled={hesapSiliniyor}
                style={{
                  minHeight: "44px",
                  padding: "0 16px",
                  border: "none",
                  borderRadius: "9px",
                  backgroundColor: hesapSiliniyor ? "#AAB2BD" : "#B42318",
                  color: "#FFFFFF",
                  fontSize: "14px",
                  fontWeight: 700,
                  cursor: hesapSiliniyor ? "not-allowed" : "pointer",
                }}
              >
                {hesapSiliniyor ? "Hesap siliniyor..." : "Hesabımı Kalıcı Sil"}
              </button>
            </div>
          </section>
        </div>
      )}
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
        padding: "15px",
        borderRadius: "9px",
        border: koyuTema ? "1px solid #374151" : "1px solid #E3E7EC",
        backgroundColor: koyuTema ? "#0B1220" : "#FAFAFA",
      }}
    >
      <span
        style={{
          display: "block",
          color: koyuTema ? "#9CA3AF" : "#6B7280",
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
          fontSize: "14px",
          fontWeight: 650,
        }}
      >
        {deger}
      </strong>
    </div>
  );
}