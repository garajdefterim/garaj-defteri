import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "\u00c7erez Politikas\u0131",
  description: "Garaj Defterim \u00c7erez Politikas\u0131.",
};

export default function CerezPolitikasiPage() {
  return (
    <main className="legal-page">
      <section className="legal-card">
        <span className="legal-kicker">GARAJ DEFTERIM</span>

        <h1>{"\u00c7erez Politikas\u0131"}</h1>

        <p className="legal-date">{"Son g\u00fcncelleme: 2 Eyl\u00fcl 2026"}</p>

        <p>
          {"Bu \u00c7erez Politikas\u0131, Garaj Defterim hizmetini kullan\u0131rken taray\u0131c\u0131n\u0131zda saklanabilecek teknik bilgiler ve tercih kay\u0131tlar\u0131 hakk\u0131nda genel bilgi vermektedir."}
        </p>

        <h2>{"\u00c7erezler ve Benzeri Teknolojiler"}</h2>
        <p>
          {"Garaj Defterim'in temel i\u015flevlerinin \u00e7al\u0131\u015fmas\u0131, oturumun korunmas\u0131, g\u00fcvenli\u011fin sa\u011flanmas\u0131 ve kullan\u0131c\u0131 tercihlerinin hat\u0131rlanmas\u0131 i\u00e7in \u00e7erezler veya taray\u0131c\u0131 depolama teknolojileri kullan\u0131labilir."}
        </p>

        <h2>{"Zorunlu Teknik Veriler"}</h2>
        <p>
          {"Hesab\u0131n\u0131za g\u00fcvenli \u015fekilde giri\u015f yapabilmeniz, oturumunuzun s\u00fcrd\u00fcr\u00fclebilmesi ve hizmetin temel \u00f6zelliklerinin \u00e7al\u0131\u015fabilmesi i\u00e7in gerekli teknik veriler kullan\u0131labilir."}
        </p>

        <h2>{"Tercihlerin Saklanmas\u0131"}</h2>
        <p>
          {"Tema se\u00e7imi, \"Beni hat\u0131rla\" tercihi ve benzeri kullan\u0131c\u0131 ayarlar\u0131, hizmeti tekrar kulland\u0131\u011f\u0131n\u0131zda tercihlerinizi hat\u0131rlamak amac\u0131yla taray\u0131c\u0131n\u0131zda saklanabilir."}
        </p>

        <h2>{"Oturum Bilgileri"}</h2>
        <p>
          {"Kimlik do\u011frulama ve oturum y\u00f6netimi kapsam\u0131nda kullan\u0131lan teknik bilgiler, hesab\u0131n\u0131z\u0131n g\u00fcvenli bi\u00e7imde a\u00e7\u0131k kalmas\u0131n\u0131 ve yetkili i\u015flemlerin ger\u00e7ekle\u015ftirilebilmesini sa\u011flamak amac\u0131yla i\u015flenebilir."}
        </p>

        <h2>{"G\u00fcvenlik"}</h2>
        <p>
          {"Hizmetin k\u00f6t\u00fcye kullan\u0131m\u0131n\u0131 \u00f6nlemek, otomatik sald\u0131r\u0131lar\u0131 azaltmak ve kullan\u0131c\u0131 hesaplar\u0131n\u0131 korumak amac\u0131yla g\u00fcvenlik teknolojileri kullan\u0131labilir."}
        </p>

        <h2>{"Taray\u0131c\u0131 Ayarlar\u0131"}</h2>
        <p>
          {"\u00c7erezleri ve taray\u0131c\u0131da saklanan verileri kendi taray\u0131c\u0131 ayarlar\u0131n\u0131zdan g\u00f6r\u00fcnt\u00fcleyebilir, s\u0131n\u0131rland\u0131rabilir veya silebilirsiniz. Ancak zorunlu teknik verilerin engellenmesi, Garaj Defterim'in baz\u0131 \u00f6zelliklerinin d\u00fczg\u00fcn \u00e7al\u0131\u015fmamas\u0131na neden olabilir."}
        </p>

        <h2>{"Politika De\u011fi\u015fiklikleri"}</h2>
        <p>
          {"Bu \u00c7erez Politikas\u0131 gerekti\u011finde g\u00fcncellenebilir. G\u00fcncel s\u00fcr\u00fcm bu sayfada yay\u0131mlan\u0131r ve son g\u00fcncelleme tarihi sayfan\u0131n \u00fcst b\u00f6l\u00fcm\u00fcnde belirtilir."}
        </p>

        <h2>{"\u0130leti\u015fim"}</h2>
        <p>
          {"\u00c7erez politikam\u0131z veya teknik veri kullan\u0131m\u0131yla ilgili sorular\u0131n\u0131z i\u00e7in "}
          <a href="/destek">{"destek merkezimiz"}</a>
          {" \u00fczerinden bizimle ileti\u015fime ge\u00e7ebilirsiniz."}
        </p>
      </section>
    </main>
  );
}
