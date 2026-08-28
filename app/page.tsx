import Link from "next/link";
import Navbar from "../components/Navbar";

const features = [
  {
    eyebrow: "Muayene",
    title: "ResmÃ® tarihleri dÃ¼zenli takip edin",
    description:
      "AraÃ§ muayene dÃ¶nemlerinizi tek panelde gÃ¶rÃ¼n ve yaklaÅŸan tarihleri Ã¶nceden takip edin.",
  },
  {
    eyebrow: "Sigorta",
    title: "BitiÅŸ tarihlerini gÃ¶zden kaÃ§Ä±rmayÄ±n",
    description:
      "Sigorta bitiÅŸ tarihlerinizi araÃ§ bazÄ±nda kaydedin ve yaklaÅŸan yenilemeleri zamanÄ±nda gÃ¶rÃ¼n.",
  },
  {
    eyebrow: "SeyrÃ¼sefer",
    title: "Yenileme tarihlerini tek yerde yÃ¶netin",
    description:
      "SeyrÃ¼sefer bilgilerinizi araÃ§larÄ±nÄ±zla birlikte saklayÄ±n ve yaklaÅŸan tarihleri kolayca kontrol edin.",
  },
  {
    eyebrow: "BakÄ±m",
    title: "BakÄ±m geÃ§miÅŸinizi kayÄ±t altÄ±nda tutun",
    description:
      "BakÄ±m tarihlerini, kilometreyi ve masraflarÄ± dÃ¼zenli ÅŸekilde kaydedin.",
  },
];

const highlights = [
  "TÃ¼m araÃ§lar tek panelde",
  "BakÄ±m ve masraf geÃ§miÅŸi",
  "E-posta hatÄ±rlatmalarÄ±",
];

export default function Home() {
  return (
    <main className="home-page">
      <Navbar />

      <section className="home-hero">
        <div className="home-hero-grid">
          <div className="home-hero-copy">
            <div className="home-eyebrow">
              ARAÃ‡ TAKÄ°P VE BAKIM YÃ–NETÄ°MÄ°
            </div>

            <h1>
              AracÄ±nÄ±zla ilgili Ã¶nemli tarihleri tek yerde yÃ¶netin.
            </h1>

            <p className="home-lead">
              Muayene, sigorta, seyrÃ¼sefer ve bakÄ±m bilgilerinizi
              GARAJ DEFRERÄ°M&apos;nde toplayÄ±n. YaklaÅŸan iÅŸlemleri takip edin,
              bakÄ±m geÃ§miÅŸinizi kaydedin ve araÃ§larÄ±nÄ±zÄ± dÃ¼zenli yÃ¶netin.
            </p>

            <div className="home-actions">
              <Link href="/kayit" className="home-primary-button">
                Ãœcretsiz Hesap OluÅŸtur
              </Link>

              <Link href="/giris" className="home-secondary-button">
                GiriÅŸ Yap
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
                  <span className="home-preview-label">ARAÃ‡</span>
                  <strong>Toyota Corolla</strong>
                  <span className="home-plate">UM 590</span>
                </div>

                <div className="home-preview-logo">GD</div>
              </div>

              <div className="home-preview-stats">
                {[
                  ["Muayene", "18 gÃ¼n kaldÄ±"],
                  ["Sigorta", "42 gÃ¼n kaldÄ±"],
                  ["SeyrÃ¼sefer", "76 gÃ¼n kaldÄ±"],
                  ["Son bakÄ±m", "12.08.2026"],
                ].map(([label, value]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="home-maintenance-card">
              <span>Son bakÄ±m</span>

              <div>
                <strong>Motor yaÄŸÄ± ve filtre deÄŸiÅŸimi</strong>
                <span>â‚º2.500</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="home-features">
        <div className="home-section-heading">
          <span>Ã–ZELLÄ°KLER</span>

          <h2>
            AraÃ§ yÃ¶netiminin temel ihtiyaÃ§larÄ± tek panelde.
          </h2>

          <p>
            Gereksiz karmaÅŸa olmadan, aracÄ±nÄ±z iÃ§in gerÃ§ekten takip etmeniz
            gereken bilgileri dÃ¼zenli tutun.
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
              GarajÄ±nÄ±zÄ± dÃ¼zenli tutmaya baÅŸlayÄ±n.
            </h2>

            <p>
              HesabÄ±nÄ±zÄ± oluÅŸturun, aracÄ±nÄ±zÄ± ekleyin ve Ã¶nemli tarihlerinizi
              tek panelden takip edin.
            </p>
          </div>

          <Link href="/kayit">
            Hesap OluÅŸtur
          </Link>
        </div>
      </section>

      <footer className="home-footer">
        <div>
          <strong>GARAJ DEFRERÄ°M</strong>
          <span>Â© 2026 GARAJ DEFRERÄ°M</span>
        </div>
      </footer>
    </main>
  );
}
