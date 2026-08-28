import Link from "next/link";
import Navbar from "../components/Navbar";

const features = [
  {
    eyebrow: "Muayene",
    title: "Resmî tarihleri düzenli takip edin",
    description:
      "Araç muayene dönemlerinizi tek panelde görün ve yaklaşan tarihleri önceden takip edin.",
  },
  {
    eyebrow: "Sigorta",
    title: "Bitiş tarihlerini gözden kaçırmayın",
    description:
      "Sigorta bitiş tarihlerinizi araç bazında kaydedin ve yaklaşan yenilemeleri zamanında görün.",
  },
  {
    eyebrow: "Seyrüsefer",
    title: "Yenileme tarihlerini tek yerde yönetin",
    description:
      "Seyrüsefer bilgilerinizi araçlarınızla birlikte saklayın ve yaklaşan tarihleri kolayca kontrol edin.",
  },
  {
    eyebrow: "Bakım",
    title: "Bakım geçmişinizi kayıt altında tutun",
    description:
      "Bakım tarihlerini, kilometreyi ve masrafları düzenli şekilde kaydedin.",
  },
];

const highlights = [
  "Tüm araçlar tek panelde",
  "Bakım ve masraf geçmişi",
  "E-posta hatırlatmaları",
];

export default function Home() {
  return (
    <main className="home-page">
      <Navbar />

      <section className="home-hero">
        <div className="home-hero-grid">
          <div className="home-hero-copy">
            <div className="home-eyebrow">
              ARAÇ TAKİP VE BAKIM YÖNETİMİ
            </div>

            <h1>
              Aracınızla ilgili önemli tarihleri tek yerde yönetin.
            </h1>

            <p className="home-lead">
              Muayene, sigorta, seyrüsefer ve bakım bilgilerinizi
              garaj defterimmM&apos;nde toplayın. Yaklaşan işlemleri takip edin,
              bakım geçmişinizi kaydedin ve araçlarınızı düzenli yönetin.
            </p>

            <div className="home-actions">
              <Link href="/kayit" className="home-primary-button">
                Ücretsiz Hesap Oluştur
              </Link>

              <Link href="/giris" className="home-secondary-button">
                Giriş Yap
              </Link>
            </div>

            <div className="home-highlights">
              {highlights.map((item) => (
                <span key={item}>
                  <i aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="home-preview" aria-hidden="true">
            <div className="home-preview-card">
              <div className="home-preview-head">
                <div>
                  <span className="home-preview-label">ARAÇ</span>
                  <strong>Toyota Corolla</strong>
                  <span className="home-plate">UM 590</span>
                </div>

                <div className="home-preview-logo">GD</div>
              </div>

              <div className="home-preview-stats">
                {[
                  ["Muayene", "18 gün kaldı"],
                  ["Sigorta", "42 gün kaldı"],
                  ["Seyrüsefer", "76 gün kaldı"],
                  ["Son bakım", "12.08.2026"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="home-maintenance-card">
              <span>Son bakım</span>

              <div>
                <strong>Motor yağı ve filtre değişimi</strong>
                <span>₺2.500</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="home-section-heading">
          <span>ÖZELLİKLER</span>

          <h2>
            Araç yönetiminin temel ihtiyaçları tek panelde.
          </h2>

          <p>
            Gereksiz karmaşa olmadan, aracınız için gerçekten takip etmeniz
            gereken bilgileri düzenli tutun.
          </p>
        </div>

        <div className="home-feature-grid">
          {features.map((feature, index) => (
            <article key={feature.title}>
              <div className="home-feature-number">
                {String(index + 1).padStart(2, "0")}
              </div>

              <span className="home-feature-eyebrow">
                {feature.eyebrow}
              </span>

              <h3>{feature.title}</h3>

              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-cta-wrap">
        <div className="home-cta">
          <div>
            <h2>
              Garajınızı düzenli tutmaya başlayın.
            </h2>

            <p>
              Hesabınızı oluşturun, aracınızı ekleyin ve önemli tarihlerinizi
              tek panelden takip edin.
            </p>
          </div>

          <Link href="/kayit">
            Hesap Oluştur
          </Link>
        </div>
      </section>

      <footer className="home-footer">
        <div>
          <strong>garaj defterimmM</strong>
          <span>© 2026 garaj defterimmM</span>
        </div>
      </footer>
    </main>
  );
}