"use client";

import { FormEvent, useState } from "react";

const konuSecenekleri = [
  "Hesap ve giriş desteği",
  "Araç ve bakım kayıtları",
  "Bildirimler ve hatırlatmalar",
  "Teknik sorun",
  "Öneri ve geri bildirim",
  "Diğer",
];

export default function DestekPage() {
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [durum, setDurum] = useState<
    | { tip: "basarili" | "hata"; mesaj: string }
    | null
  >(null);

  async function formuGonder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setDurum(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const payload = {
      adSoyad: String(formData.get("adSoyad") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      konu: String(formData.get("konu") ?? "").trim(),
      mesaj: String(formData.get("mesaj") ?? "").trim(),
      website: String(formData.get("website") ?? "").trim(),
    };

    setGonderiliyor(true);

    try {
      const response = await fetch("/api/destek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ?? "Destek talebiniz gönderilemedi. Lütfen tekrar deneyin."
        );
      }

      form.reset();
      setDurum({
        tip: "basarili",
        mesaj:
          "Destek talebiniz bize ulaştı. En kısa sürede e-posta adresiniz üzerinden dönüş yapacağız.",
      });
    } catch (error) {
      setDurum({
        tip: "hata",
        mesaj:
          error instanceof Error
            ? error.message
            : "Bir hata oluştu. Lütfen tekrar deneyin.",
      });
    } finally {
      setGonderiliyor(false);
    }
  }

  return (
    <main className="destek-page">
      <section className="destek-shell">
        <div className="destek-topbar">
          <a href="/" className="destek-brand" aria-label="Garaj Defterim ana sayfa">
            <span className="destek-logo">GD</span>
            <span>GARAJ DEFTERİM</span>
          </a>

          <a href="/" className="destek-back-link">
            Ana Sayfaya Dön
          </a>
        </div>

        <div className="destek-grid">
          <div className="destek-intro">
            <span className="destek-kicker">DESTEK MERKEZİ</span>
            <h1>Size nasıl yardımcı olabiliriz?</h1>
            <p>
              Garaj Defterim ile ilgili sorularınızı, teknik sorunlarınızı veya
              önerilerinizi bize iletin. Talebinizi inceleyip e-posta üzerinden
              dönüş yapacağız.
            </p>

            <div className="destek-info-card">
              <div className="destek-info-icon" aria-hidden="true">
                ✓
              </div>
              <div>
                <strong>Talebiniz doğrudan destek ekibine iletilir</strong>
                <span>
                  Formdaki e-posta adresinizi yalnızca talebinize dönüş yapmak
                  için kullanırız.
                </span>
              </div>
            </div>
          </div>

          <div className="destek-card">
            <div className="destek-card-heading">
              <h2>Destek Talebi Oluştur</h2>
              <p>Alanları doldurun, mesajınızı bize güvenli şekilde iletin.</p>
            </div>

            <form onSubmit={formuGonder} className="destek-form">
              <div className="destek-field-grid">
                <label className="destek-field">
                  <span>Ad Soyad</span>
                  <input
                    type="text"
                    name="adSoyad"
                    autoComplete="name"
                    minLength={2}
                    maxLength={80}
                    placeholder="Adınız ve soyadınız"
                    required
                  />
                </label>

                <label className="destek-field">
                  <span>E-posta</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    maxLength={160}
                    placeholder="ornek@email.com"
                    required
                  />
                </label>
              </div>

              <label className="destek-field">
                <span>Konu</span>
                <select name="konu" defaultValue="" required>
                  <option value="" disabled>
                    Konu seçin
                  </option>
                  {konuSecenekleri.map((konu) => (
                    <option key={konu} value={konu}>
                      {konu}
                    </option>
                  ))}
                </select>
              </label>

              <label className="destek-field">
                <span>Mesajınız</span>
                <textarea
                  name="mesaj"
                  minLength={10}
                  maxLength={4000}
                  rows={7}
                  placeholder="Yaşadığınız durumu mümkün olduğunca açıklayıcı şekilde yazın."
                  required
                />
              </label>

              <div className="destek-honeypot" aria-hidden="true">
                <label>
                  Website
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </div>

              {durum && (
                <div
                  className={`destek-status destek-status-${durum.tip}`}
                  role="status"
                >
                  {durum.mesaj}
                </div>
              )}

              <button
                type="submit"
                className="destek-submit"
                disabled={gonderiliyor}
              >
                {gonderiliyor ? "Gönderiliyor..." : "Destek Talebini Gönder"}
              </button>

              <p className="destek-privacy-note">
                Gönder butonuna basarak yalnızca destek talebinizin işlenmesini
                kabul etmiş olursunuz.
              </p>
            </form>
          </div>
        </div>
      </section>

      <style>{`
        .destek-page,
        .destek-page * {
          box-sizing: border-box;
        }

        .destek-page {
          min-height: 100vh;
          padding: 0 24px 64px;
          background: var(--background);
          color: var(--foreground);
        }

        .destek-shell {
          width: 100%;
          max-width: 1120px;
          margin: 0 auto;
        }

        .destek-topbar {
          min-height: 82px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .destek-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          color: var(--foreground);
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.2px;
          text-decoration: none;
        }

        .destek-logo {
          width: 38px;
          height: 38px;
          border-radius: 10px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #1d4ed8;
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
        }

        .destek-back-link {
          min-height: 44px;
          padding: 0 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border);
          border-radius: 10px;
          background: var(--card);
          color: var(--foreground);
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
        }

        .destek-grid {
          padding-top: 48px;
          display: grid;
          grid-template-columns: minmax(0, 0.86fr) minmax(430px, 1.14fr);
          align-items: start;
          gap: 72px;
        }

        .destek-intro {
          padding-top: 30px;
        }

        .destek-kicker {
          display: inline-block;
          margin-bottom: 14px;
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.11em;
        }

        .destek-intro h1 {
          margin: 0;
          max-width: 540px;
          color: var(--foreground);
          font-size: clamp(34px, 5vw, 52px);
          line-height: 1.06;
          letter-spacing: -1.8px;
        }

        .destek-intro > p {
          margin: 22px 0 0;
          max-width: 520px;
          color: var(--muted);
          font-size: 15px;
          line-height: 1.8;
        }

        .destek-info-card {
          margin-top: 30px;
          padding: 17px;
          display: flex;
          align-items: flex-start;
          gap: 13px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: var(--card-soft);
        }

        .destek-info-icon {
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #dbeafe;
          color: #1d4ed8;
          font-weight: 900;
        }

        html[data-theme="koyu"] .destek-info-icon {
          background: rgba(37, 99, 235, 0.2);
          color: #93c5fd;
        }

        .destek-info-card strong,
        .destek-info-card span {
          display: block;
        }

        .destek-info-card strong {
          color: var(--foreground);
          font-size: 13px;
          line-height: 1.5;
        }

        .destek-info-card span {
          margin-top: 4px;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.55;
        }

        .destek-card {
          padding: 30px;
          border: 1px solid var(--border);
          border-radius: 20px;
          background: var(--card);
          box-shadow: 0 18px 46px rgba(15, 23, 42, 0.08);
        }

        html[data-theme="koyu"] .destek-card {
          box-shadow: 0 18px 46px rgba(0, 0, 0, 0.22);
        }

        .destek-card-heading h2 {
          margin: 0;
          color: var(--foreground);
          font-size: 22px;
          letter-spacing: -0.5px;
        }

        .destek-card-heading p {
          margin: 7px 0 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.6;
        }

        .destek-form {
          margin-top: 26px;
          display: grid;
          gap: 18px;
        }

        .destek-field-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .destek-field {
          display: grid;
          gap: 8px;
        }

        .destek-field > span {
          color: var(--muted-strong);
          font-size: 12px;
          font-weight: 700;
        }

        .destek-field input,
        .destek-field select,
        .destek-field textarea {
          width: 100%;
          min-height: 46px;
          border: 1px solid var(--border-strong);
          border-radius: 10px;
          outline: none;
          background: var(--input-bg);
          color: var(--foreground);
          font: inherit;
          font-size: 14px;
          transition: border-color 0.18s ease, box-shadow 0.18s ease;
        }

        .destek-field input,
        .destek-field select {
          padding: 0 13px;
        }

        .destek-field textarea {
          min-height: 154px;
          padding: 12px 13px;
          line-height: 1.6;
          resize: vertical;
        }

        .destek-field input::placeholder,
        .destek-field textarea::placeholder {
          color: var(--muted);
          opacity: 0.82;
        }

        .destek-field input:focus,
        .destek-field select:focus,
        .destek-field textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.13);
        }

        .destek-honeypot {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip: rect(0 0 0 0);
          white-space: nowrap;
        }

        .destek-status {
          padding: 12px 13px;
          border-radius: 10px;
          font-size: 13px;
          line-height: 1.55;
        }

        .destek-status-basarili {
          border: 1px solid rgba(34, 197, 94, 0.35);
          background: rgba(34, 197, 94, 0.1);
          color: var(--foreground);
        }

        .destek-status-hata {
          border: 1px solid rgba(239, 68, 68, 0.35);
          background: rgba(239, 68, 68, 0.09);
          color: var(--foreground);
        }

        .destek-submit {
          min-height: 48px;
          width: 100%;
          border: 1px solid #2563eb;
          border-radius: 10px;
          background: #1d4ed8;
          color: #ffffff;
          font-size: 14px;
          font-weight: 800;
          cursor: pointer;
          transition: background-color 0.18s ease, transform 0.18s ease;
        }

        .destek-submit:hover:not(:disabled) {
          background: #1e40af;
          transform: translateY(-1px);
        }

        .destek-submit:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .destek-privacy-note {
          margin: -5px 0 0;
          color: var(--muted);
          font-size: 11px;
          line-height: 1.55;
          text-align: center;
        }

        @media (max-width: 900px) {
          .destek-page {
            padding-left: 20px;
            padding-right: 20px;
          }

          .destek-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 34px;
            padding-top: 24px;
          }

          .destek-intro {
            padding-top: 10px;
          }

          .destek-intro h1,
          .destek-intro > p {
            max-width: 680px;
          }

          .destek-info-card {
            max-width: 680px;
          }
        }

        @media (max-width: 700px) {
          .destek-page {
            padding: 0 14px 42px;
          }

          .destek-topbar {
            min-height: 70px;
          }

          .destek-brand {
            font-size: 13px;
          }

          .destek-logo {
            width: 36px;
            height: 36px;
          }

          .destek-back-link {
            padding: 0 11px;
            font-size: 12px;
          }

          .destek-intro h1 {
            font-size: clamp(32px, 10vw, 44px);
          }

          .destek-card {
            padding: 22px 18px;
            border-radius: 16px;
          }

          .destek-field-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .destek-field input,
          .destek-field select,
          .destek-field textarea {
            font-size: 16px;
          }
        }

        @media (max-width: 480px) {
          .destek-topbar {
            gap: 10px;
          }

          .destek-brand > span:last-child {
            display: none;
          }

          .destek-grid {
            gap: 26px;
          }

          .destek-field-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .destek-info-card {
            margin-top: 22px;
          }
        }
      `}</style>
    </main>
  );
}
