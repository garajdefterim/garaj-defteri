"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="site-navbar">
      <div className="site-navbar-inner">
        <Link href="/" className="site-brand">
          <div className="site-brand-logo" aria-hidden="true">
            GD
          </div>

          <div className="site-brand-name">
            GARAJ DEFTERİM
          </div>
        </Link>

        <nav className="site-navbar-actions">
          <Link
            href="/giris"
            className="site-navbar-login"
          >
            Giriş Yap
          </Link>

          <Link
            href="/kayit"
            className="site-navbar-register"
          >
            Kayıt Ol
          </Link>
        </nav>
      </div>

      <style jsx global>{`
        .site-navbar,
        .site-navbar * {
          box-sizing: border-box;
          min-width: 0;
        }

        .site-navbar {
          width: 100%;
        }

        .site-navbar-inner {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }

        .site-brand {
          display: inline-flex;
          align-items: center;
          gap: 11px;
          color: inherit;
          text-decoration: none;
          flex: 0 1 auto;
        }

        .site-brand-logo {
          width: 42px;
          height: 42px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 auto;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .site-brand-name {
          font-size: 17px;
          line-height: 1.2;
          font-weight: 750;
          letter-spacing: -0.35px;
          white-space: nowrap;
        }

        .site-navbar-actions {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, auto));
          align-items: center;
          gap: 10px;
          flex: 0 0 auto;
        }

        .site-navbar-actions a {
          min-height: 44px;
          padding: 0 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 9px;
          text-decoration: none;
          font-size: 14px;
          font-weight: 700;
          white-space: nowrap;
        }

        @media (max-width: 900px) {
          .site-navbar-inner {
            padding: 18px 20px;
          }
        }

        @media (max-width: 700px) {
          .site-navbar {
            overflow-x: hidden;
          }

          .site-navbar-inner {
            padding: 16px 14px;
            gap: 14px;
          }

          .site-brand {
            gap: 9px;
          }

          .site-brand-logo {
            width: 38px;
            height: 38px;
            border-radius: 10px;
            font-size: 14px;
          }

          .site-brand-name {
            font-size: 15px;
            letter-spacing: -0.25px;
          }

          .site-navbar-actions {
            grid-template-columns: repeat(2, minmax(0, auto));
            gap: 8px;
          }

          .site-navbar-actions a {
            min-height: 42px;
            padding-left: 12px;
            padding-right: 12px;
            font-size: 13px;
          }
        }

        @media (max-width: 480px) {
          .site-navbar-inner {
            padding: 14px 12px;
            gap: 10px;
          }

          .site-brand {
            gap: 8px;
          }

          .site-brand-logo {
            width: 36px;
            height: 36px;
            border-radius: 9px;
            font-size: 13px;
          }

          .site-brand-name {
            font-size: 14px;
          }

          .site-navbar-actions {
            gap: 6px;
          }

          .site-navbar-actions a {
            min-height: 40px;
            padding-left: 10px;
            padding-right: 10px;
            font-size: 12px;
          }
        }

        @media (max-width: 390px) {
          .site-navbar-inner {
            padding-left: 10px;
            padding-right: 10px;
          }

          .site-brand-name {
            font-size: 13px;
          }

          .site-navbar-actions a {
            padding-left: 8px;
            padding-right: 8px;
          }
        }

        @media (max-width: 350px) {
          .site-navbar-inner {
            align-items: stretch;
            flex-direction: column;
          }

          .site-brand {
            justify-content: center;
          }

          .site-navbar-actions {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            width: 100%;
          }

          .site-navbar-actions a {
            width: 100%;
          }
        }
      `}</style>
    </header>
  );
}
