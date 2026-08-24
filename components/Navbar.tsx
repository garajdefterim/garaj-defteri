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
            GARAJ DEFTERİ
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
    </header>
  );
}