"use client";

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
              GARAJ DEFTERİM&apos;de toplayın. Yaklaşan işlemleri takip edin,
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

      <section className="home-reminder-section">
        <div className="home-reminder-card">
          <div className="home-reminder-badge">
            E-POSTA HATIRLATMALARI
          </div>

          <div className="home-reminder-content">
            <div>
              <h2>
                Önemli tarihleri unutmayın, zamanı gelmeden haberdar olun.
              </h2>

              <p>
                GARAJ DEFTERİM, aracınıza ait önemli tarihleri takip etmenize
                yardımcı olur. Muayene, sigorta, seyrüsefer ve bakım tarihleri
                yaklaşırken e-posta ile hatırlatma alabilir, son güne
                bırakmadan gerekli işlemlerinizi planlayabilirsiniz.
              </p>

              <div className="home-reminder-items">
                <span>✓ Muayene tarihi hatırlatmaları</span>
                <span>✓ Sigorta bitiş tarihi hatırlatmaları</span>
                <span>✓ Seyrüsefer yenileme hatırlatmaları</span>
                <span>✓ Bakım tarihi hatırlatmaları</span>
              </div>
            </div>

            <div className="home-reminder-preview">
              <span className="home-reminder-preview-label">
                ÖRNEK HATIRLATMA
              </span>

              <strong>
                Aracınızın muayene tarihi yaklaşıyor
              </strong>

              <p>
                Kayıtlı aracınızın muayene tarihine 7 gün kaldı.
                İşleminizi zamanında tamamlamak için planlama yapabilirsiniz.
              </p>

              <span className="home-reminder-mail">
                E-posta bildirimi
              </span>
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
          <strong>GARAJ DEFTERİM</strong>
          <span>© 2026 GARAJ DEFTERİM</span>
        </div>
      </footer>

      <style jsx global>{`
        .home-page,
        .home-page * {
          min-width: 0;
          box-sizing: border-box;
        }

        .home-page img,
        .home-page svg {
          max-width: 100%;
        }

        .home-actions a,
        .home-cta a {
          min-height: 46px;
        }

        @media (max-width: 1024px) {
          .home-hero-grid {
            gap: 40px !important;
          }

          .home-reminder-content {
            gap: 28px !important;
          }

          .home-feature-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }
        }

        @media (max-width: 768px) {
          .home-hero,
          .home-reminder-section,
          .home-features,
          .home-cta-wrap {
            padding-left: 16px !important;
            padding-right: 16px !important;
          }

          .home-hero-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 28px !important;
          }

          .home-hero-copy h1 {
            font-size: clamp(36px, 10vw, 50px) !important;
            line-height: 1.02 !important;
            letter-spacing: -1.4px !important;
          }

          .home-lead {
            font-size: 16px !important;
            line-height: 1.65 !important;
          }

          .home-actions {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }

          .home-actions a {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .home-highlights {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px 14px !important;
          }

          .home-highlights span:last-child {
            grid-column: 1 / -1;
          }

          .home-preview {
            width: 100% !important;
            max-width: 560px !important;
            margin: 0 auto !important;
          }

          .home-preview-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .home-reminder-card {
            padding: 22px !important;
          }

          .home-reminder-content {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 22px !important;
          }

          .home-reminder-items {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px 14px !important;
          }

          .home-reminder-preview {
            width: 100% !important;
          }

          .home-section-heading h2,
          .home-reminder-content h2,
          .home-cta h2 {
            font-size: clamp(28px, 8vw, 36px) !important;
            line-height: 1.08 !important;
          }

          .home-feature-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 12px !important;
          }

          .home-feature-grid article {
            padding: 18px !important;
          }

          .home-cta {
            grid-template-columns: minmax(0, 1fr) auto !important;
            gap: 20px !important;
            align-items: center !important;
          }

          .home-cta a {
            white-space: nowrap;
          }

          .home-footer > div {
            gap: 14px !important;
            flex-wrap: wrap !important;
          }
        }

        @media (max-width: 520px) {
          .home-hero,
          .home-reminder-section,
          .home-features,
          .home-cta-wrap {
            padding-left: 12px !important;
            padding-right: 12px !important;
          }

          .home-hero-copy h1 {
            font-size: clamp(34px, 10.5vw, 44px) !important;
          }

          .home-eyebrow,
          .home-reminder-badge {
            font-size: 11px !important;
            letter-spacing: 0.08em !important;
          }

          .home-actions {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .home-highlights {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .home-preview-card {
            padding: 18px !important;
          }

          .home-preview-head {
            gap: 12px !important;
          }

          .home-preview-logo {
            flex: 0 0 auto !important;
          }

          .home-preview-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }

          .home-maintenance-card > div {
            gap: 10px !important;
          }

          .home-reminder-card {
            padding: 18px !important;
          }

          .home-reminder-items {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 9px 10px !important;
          }

          .home-feature-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }

          .home-feature-grid article {
            padding: 16px !important;
          }

          .home-feature-grid h3 {
            font-size: 17px !important;
          }

          .home-feature-grid p {
            font-size: 13px !important;
            line-height: 1.55 !important;
          }

          .home-cta {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 16px !important;
          }

          .home-cta a {
            width: 100% !important;
            justify-content: center !important;
            text-align: center !important;
          }

          .home-footer > div {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }

        @media (max-width: 380px) {
          .home-hero,
          .home-reminder-section,
          .home-features,
          .home-cta-wrap {
            padding-left: 10px !important;
            padding-right: 10px !important;
          }

          .home-actions {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .home-highlights {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .home-highlights span:last-child {
            grid-column: auto;
          }

          .home-preview-stats {
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          }

          .home-reminder-items {
            grid-template-columns: minmax(0, 1fr) !important;
          }

          .home-feature-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
        }
      `}</style>
    </main>
  );
}
