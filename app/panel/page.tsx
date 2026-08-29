"use client";

import Link from "next/link";

export default function PanelPage() {
  return (
    <main className="panel-page">
      <section className="panel-container">
        <div className="panel-heading">
          <h1>GARAJ DEFTERİM Paneli</h1>

          <p>
            Giriş başarılı. Araçlarınızı burada yöneteceksiniz.
          </p>
        </div>

        <div className="panel-card">
          <h2>Henüz araç eklemediniz</h2>

          <p>
            Bir sonraki adımda araç ekleme sistemini oluşturacağız.
          </p>

          <Link href="/" className="panel-home-link">
            ← Ana sayfaya dön
          </Link>
        </div>
      </section>

      <style jsx global>{`
        .panel-page,
        .panel-page * {
          box-sizing: border-box;
          min-width: 0;
        }

        .panel-page {
          min-height: 100vh;
          padding: 40px 24px;
          background-color: #f8fafc;
          font-family: Arial, Helvetica, sans-serif;
          color: #0f172a;
        }

        .panel-container {
          width: 100%;
          max-width: 1100px;
          margin: 0 auto;
        }

        .panel-heading h1 {
          margin: 0;
          font-size: 36px;
          line-height: 1.15;
          color: #0f172a;
        }

        .panel-heading p {
          margin: 12px 0 0;
          color: #64748b;
          font-size: 18px;
          line-height: 1.6;
        }

        .panel-card {
          margin-top: 32px;
          padding: 28px;
          background-color: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
        }

        .panel-card h2 {
          margin: 0;
          color: #0f172a;
          font-size: 24px;
          line-height: 1.25;
        }

        .panel-card p {
          margin: 12px 0 0;
          color: #64748b;
          font-size: 16px;
          line-height: 1.65;
        }

        .panel-home-link {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          margin-top: 18px;
          padding: 0 14px;
          border-radius: 9px;
          color: #2563eb;
          font-weight: 700;
          text-decoration: none;
        }

        @media (max-width: 900px) {
          .panel-page {
            padding: 32px 20px;
          }

          .panel-container {
            max-width: 820px;
          }
        }

        @media (max-width: 700px) {
          .panel-page {
            min-height: 100dvh;
            padding: 24px 14px 42px;
            overflow-x: hidden;
          }

          .panel-heading h1 {
            font-size: 30px;
            letter-spacing: -0.4px;
          }

          .panel-heading p {
            font-size: 16px;
            line-height: 1.55;
          }

          .panel-card {
            margin-top: 24px;
            padding: 20px;
            border-radius: 14px;
          }

          .panel-card h2 {
            font-size: 21px;
          }

          .panel-card p {
            font-size: 15px;
          }

          .panel-home-link {
            min-height: 46px;
          }
        }

        @media (max-width: 480px) {
          .panel-page {
            padding: 20px 12px 36px;
          }

          .panel-heading h1 {
            font-size: 28px;
          }

          .panel-card {
            margin-top: 20px;
            padding: 18px;
          }

          .panel-home-link {
            width: 100%;
            text-align: center;
          }
        }

        @media (max-width: 360px) {
          .panel-page {
            padding-left: 10px;
            padding-right: 10px;
          }

          .panel-heading h1 {
            font-size: 26px;
          }

          .panel-card {
            padding: 16px;
          }
        }
      `}</style>
    </main>
  );
}
